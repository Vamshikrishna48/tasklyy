import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Database } from "@/lib/database.types";

type Tables = Database['public']['Tables'];
type JobRow = Tables['jobs']['Row'];
type ProfileRow = Tables['profiles']['Row'];

export type Job = JobRow & {
  poster?: {
    full_name: string | null;
    avatar_url: string | null;
  }
};

export const useJobs = () => {
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*,poster:profiles!jobs_poster_id_fkey(full_name,avatar_url)')
        .eq('status', 'open');

      if (error) {
        toast.error(error.message);
        return [];
      }
      return (data as any[]) as Job[];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyJobs = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*,poster:profiles!jobs_poster_id_fkey(full_name,avatar_url)')
        .or(`poster_id.eq.${userId},worker_id.eq.${userId}`);

      if (error) {
        toast.error(error.message);
        return { posted: [], accepted: [], completed: [] };
      }

      const jobs = data as JobRow[];

      return {
        posted: jobs.filter(j => j.poster_id === userId),
        accepted: jobs.filter(j => j.worker_id === userId && j.status !== 'completed'),
        completed: jobs.filter(j => j.status === 'completed' && (j.poster_id === userId || j.worker_id === userId))
      };
    } catch (err) {
      return { posted: [], accepted: [], completed: [] };
    }
  }, []);

  const fetchJobById = useCallback(async (jobId: string, currentUserId?: string) => {
    try {
      const { data: jobData, error: fetchError } = await supabase
        .from('jobs')
        .select(`
          *,
          poster:profiles!poster_id(full_name, avatar_url),
          worker:profiles!worker_id(full_name, avatar_url),
          files:job_files(*),
          escrow:escrow_transactions(*)
        `)
        .eq('id', jobId)
        .single();

      if (fetchError) {
        console.error("Fetch Job Error:", fetchError);
        if (fetchError.code === '42703') {
           toast.error("Database schema mismatch. Please run the migration 003_job_flow_updates.sql in Supabase SQL Editor.");
        } else {
           toast.error(`Error fetching job: ${fetchError.message}`);
        }
        return null;
      }

      if (!jobData) return null;

      const job = jobData as any;

      // 1. Check for Payment Expiration (5 min timer)
      if (job.status === 'payment_pending' && job.payment_due_at) {
        const now = new Date();
        const due = new Date(job.payment_due_at);
        
        if (now > due) {
          // Notify worker before deletion
          if (job.worker_id) {
            await (supabase.from('messages') as any).insert({
              job_id: jobId,
              sender_id: job.poster_id, // System message essentially
              content: `⚠️ Payment Timeout: The poster failed to pay within 5 minutes. This job has been cancelled and removed.`
            });
          }
          
          // Delete Job (cascade will handle files/messages if set, but we usually want to hide it first or delete)
          await (supabase.from('jobs') as any).delete().eq('id', jobId);
          toast.error("Job expired due to non-payment.");
          return null;
        }
      }

      // 2. Logic for unlocking instructions/files
      // Workers only see instructions IF payment is secured (escrow held)
      const escrowStatus = job.escrow?.[0]?.status;
      if (currentUserId === job.worker_id) {
        job.instructions_locked = escrowStatus !== 'held';
      } else if (currentUserId === job.poster_id) {
        job.instructions_locked = false;
      }

      return job;
    } catch (err) {
      return null;
    }
  }, []);

  const postJob = async (jobData: any, userId: string) => {
    try {
      // 1. Insert Job (No escrow yet, that happens after worker accepts and poster pays)
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          ...jobData,
          poster_id: userId,
          status: 'open',
          instructions_locked: true,
        })
        .select(`
          *,
          poster:profiles!jobs_poster_id_fkey(full_name, avatar_url)
        `)
        .single();

      if (jobError || !job) throw jobError || new Error("Failed to create job");

      toast.success("Job posted successfully!");
      return job;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const acceptJob = async (jobId: string, userId: string) => {
    try {
      const paymentDueAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

      // 1. Update Job to payment_pending
      const { data: job, error: jobError } = await (supabase
        .from('jobs') as any)
        .update({
          worker_id: userId,
          status: 'payment_pending' as any,
          payment_due_at: paymentDueAt
        })
        .eq('id', jobId)
        .select()
        .single();

      if (jobError || !job) throw jobError || new Error("Job activation failed");

      // 2. Notification Message
      await (supabase
        .from('messages') as any)
        .insert({
          job_id: jobId,
          sender_id: userId,
          content: "I've accepted the job! Please complete the payment within 5 minutes to unlock the files and start the timer."
        });

      toast.success("Job accepted! Waiting for poster payment (5m remaining).");
      return job;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    }
  };

  const payForJob = async (jobId: string, amount: number) => {
    try {
      const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();
      if (!job) throw new Error("Job not found");

      // 1. Create/Update Escrow
      const { error: escrowError } = await (supabase
        .from('escrow_transactions') as any)
        .upsert({
          job_id: jobId,
          poster_id: (job as any).poster_id,
          worker_id: (job as any).worker_id,
          total_amount: amount,
          platform_fee: amount * 0.10,
          worker_amount: amount * 0.90,
          status: 'held'
        });

      if (escrowError) throw escrowError;

      // 2. Update Job Status to accepted
      await (supabase
        .from('jobs') as any)
        .update({ status: 'accepted', instructions_locked: false })
        .eq('id', jobId);

      // 3. Admin Ledger
      await (supabase.from('admin_ledger') as any).insert({
        job_id: jobId,
        type: 'escrow_held',
        amount: amount,
        from_user_id: (job as any).poster_id,
        note: `Escrow secured for job: ${(job as any).title}`
      });

      toast.success("Payment successful! Job is live.");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const submitWork = async (jobId: string, userId: string, files: File[]) => {
    try {
      for (const file of files) {
        const path = `submissions/${jobId}/${Date.now()}_${file.name}`;
        const { data, error: uploadError } = await supabase.storage
          .from('submissions')
          .upload(path, file);

        if (uploadError || !data) throw uploadError || new Error("Upload failed");

        await (supabase
          .from('job_files') as any)
          .insert({
            job_id: jobId,
            uploader_id: userId,
            file_url: data.path,
            file_name: file.name,
            file_type: file.type,
            is_submission: true,
            is_watermarked: true
          });
      }

      await (supabase
        .from('jobs') as any)
        .update({ status: 'submitted' })
        .eq('id', jobId);

      await (supabase.from('messages') as any).insert({
        job_id: jobId,
        sender_id: userId,
        content: "Work submitted! Review it now (Download locked until approval)."
      });

      toast.success("Work submitted!");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const declineWork = async (jobId: string, reason: string) => {
    try {
      await (supabase.from('jobs') as any).update({ status: 'disputed' as any }).eq('id', jobId);
      await (supabase.from('messages') as any).insert({
        job_id: jobId,
        sender_id: (await supabase.auth.getUser()).data.user?.id,
        content: `❌ Work declined. Reason: ${reason}. Refund will be processed in 4 working days.`
      });
      toast.info("Work declined. Refund process initiated.");
      return true;
    } catch (error: any) {
      toast.error("Failed to decline work");
      return false;
    }
  };

  const releaseEscrow = async (jobId: string, userId: string) => {
    try {
      const { data: jobData } = await (supabase.from('jobs') as any).select('*').eq('id', jobId).single();
      const job = jobData as any;
      if (!job || job.poster_id !== userId) throw new Error("Unauthorized");

      await (supabase.from('jobs') as any).update({ status: 'completed' }).eq('id', jobId);
      await (supabase.from('escrow_transactions') as any).update({ 
        status: 'released', 
        released_at: new Date().toISOString() 
      }).eq('job_id', jobId);
      
      // Unlock files for download
      await (supabase.from('job_files') as any).update({ is_watermarked: false }).eq('job_id', jobId);

      const { data: escrowData } = await (supabase.from('escrow_transactions') as any).select('*').eq('job_id', jobId).single();
      const escrow = escrowData as any;
      if (!escrow) throw new Error("Escrow record missing");
      
      const { data: worker } = await (supabase.from('profiles') as any).select('wallet_balance').eq('id', job.worker_id).single();
      await (supabase.from('profiles') as any).update({ 
        wallet_balance: (worker?.wallet_balance || 0) + escrow.worker_amount 
      }).eq('id', job.worker_id);

      toast.success("Work approved and funds released!");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  return { 
    loading, 
    fetchJobs, 
    fetchMyJobs, 
    fetchJobById, 
    postJob, 
    acceptJob, 
    payForJob,
    submitWork, 
    declineWork,
    releaseEscrow 
  };
};
