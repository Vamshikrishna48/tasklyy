import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useState, useCallback } from "react";

export const useJobs = () => {
  const [loading, setLoading] = useState(false);
 
  const ensureProfile = async (userId: string) => {
    const { data: existingProfile } = await (supabase as any).from('profiles').select('id').eq('id', userId).maybeSingle();
    if (!existingProfile) {
      console.log(`Profile missing for ${userId}, creating...`);
      const { data: authUser } = await supabase.auth.getUser();
      await (supabase as any).from('profiles').upsert({
        id: userId,
        email: authUser.user?.email || '',
        full_name: authUser.user?.user_metadata?.full_name || 'User',
        role: 'worker',
        wallet_balance: 0,
        is_verified: false,
        verification_status: 'unverified'
      });
    }
  };

  const fetchJobs = async () => {
    const { data, error } = await (supabase as any)
      .from('jobs')
      .select('*, poster:profiles!jobs_poster_id_fkey(full_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
    return data || [];
  };

  const fetchJobById = async (id: string) => {
    const { data, error } = await (supabase as any)
      .from('jobs')
      .select('*, poster:profiles!jobs_poster_id_fkey(full_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching job:", error);
      return null;
    }
    return data;
  };

  const fetchMyJobs = async (userId: string) => {
    const { data: posted, error: postedError } = await (supabase as any)
      .from('jobs')
      .select('*')
      .eq('poster_id', userId);

    const { data: working, error: workingError } = await (supabase as any)
      .from('jobs')
      .select('*')
      .eq('worker_id', userId);

    return {
      posted: posted || [],
      working: working || []
    };
  };

  const postJob = async (jobData: any, userId: string) => {
    setLoading(true);
    try {
      await ensureProfile(userId);
      const { data, error } = await (supabase as any)
        .from('jobs')
        .insert({
          ...jobData,
          poster_id: userId,
          status: 'open'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const acceptJob = async (jobId: string, userId: string) => {
    try {
      await ensureProfile(userId);
      const paymentDueAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const { error } = await (supabase as any)
        .from('jobs')
        .update({
          worker_id: userId,
          status: 'payment_pending',
          payment_due_at: paymentDueAt
        })
        .eq('id', jobId);

      if (error) throw error;
      
      // Auto-rejection logic if payment not made
      // This should ideally be handled by a cron job or background worker, not a client-side setTimeout
      // which can cause unexpected deletions if the client's clock is off or the component unmounts.


      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const payForJob = async (jobId: string, amount: number) => {
    try {
      const { data: job } = await (supabase as any).from('jobs').select('*').eq('id', jobId).maybeSingle();
      if (!job) throw new Error("Job not found");

      const platformFee = Math.round(amount * 0.30);
      const workerAmount = amount - platformFee;

      await (supabase as any).from('escrow_transactions').upsert({
        job_id: jobId,
        poster_id: job.poster_id,
        worker_id: job.worker_id,
        total_amount: amount,
        platform_fee: platformFee,
        worker_amount: workerAmount,
        status: 'held'
      }, { onConflict: 'job_id' });

      await (supabase as any).from('jobs').update({ status: 'accepted', instructions_locked: false }).eq('id', jobId);

      await (supabase as any).from('admin_ledger').insert({
        job_id: jobId,
        type: 'escrow_held',
        amount: amount,
        from_user_id: job.poster_id,
        note: `Payment for job: ${job.title}`
      });

      toast.success("Payment successful! Job is now in progress.");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const submitWork = async (jobId: string, userId: string, fileUrl: string, fileName: string, fileType: string) => {
    try {
      await (supabase as any).from('job_files').insert({
        job_id: jobId,
        uploader_id: userId,
        file_url: fileUrl,
        file_name: fileName,
        file_type: fileType,
        is_submission: true,
        is_watermarked: true
      });

      await (supabase as any).from('jobs').update({ status: 'submitted' }).eq('id', jobId);

      await (supabase as any).from('messages').insert({
        job_id: jobId,
        sender_id: userId,
        content: "Work submitted! Review it now (Download locked until approval)."
      });

      toast.success("Work submitted successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const declineWork = async (jobId: string, reason: string) => {
    try {
      await (supabase as any).from('jobs').update({ status: 'disputed' }).eq('id', jobId);
      const user = (await supabase.auth.getUser()).data.user;
      await (supabase as any).from('messages').insert({
        job_id: jobId,
        sender_id: user?.id || '',
        content: `❌ Work declined. Reason: ${reason}. Refund will be processed in 4 working days.`
      });

      toast.error("Work declined and dispute opened.");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const releaseEscrow = async (jobId: string, userId: string) => {
    try {
      const { data: jobData } = await (supabase as any).from('jobs').select('*').eq('id', jobId).single();
      if (!jobData || jobData.poster_id !== userId) throw new Error("Unauthorized");

      await (supabase as any).from('jobs').update({ status: 'completed' }).eq('id', jobId);
      await (supabase as any).from('escrow_transactions').update({ 
        status: 'released', 
        released_at: new Date().toISOString() 
      }).eq('job_id', jobId);
      
      await (supabase as any).from('job_files').update({ is_watermarked: false }).eq('job_id', jobId);

      const { data: escrowData } = await (supabase as any).from('escrow_transactions').select('*').eq('job_id', jobId).single();
      if (!escrowData) throw new Error("Escrow record missing");
      
      const { data: worker } = await (supabase as any).from('profiles').select('wallet_balance').eq('id', jobData.worker_id).single();
      await (supabase as any).from('profiles').update({ 
        wallet_balance: ((worker as any)?.wallet_balance || 0) + escrowData.worker_amount 
      }).eq('id', jobData.worker_id);

      toast.success("Work approved and funds released!");
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const placeBid = async (bidData: any) => {
    try {
      await ensureProfile(bidData.bidder_id);
      const { data, error } = await (supabase as any).from('bids').insert(bidData).select().single();
      if (error) throw error;
      return data;
    } catch (error: any) {
      toast.error(`Bidding Error: ${error.message}`);
      return null;
    }
  };
 
  const cancelJobForNonPayment = async (jobId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('jobs')
        .update({ 
          status: 'disputed',
          worker_id: null, 
          payment_due_at: null,
          accepted_bid_id: null
        })
        .eq('id', jobId);
      
      if (error) throw error;
      toast.error("Payment deadline missed. Project has been rejected.");
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  };

  return {
    loading,
    fetchJobs,
    fetchJobById,
    fetchMyJobs,
    postJob,
    acceptJob,
    payForJob,
    submitWork,
    declineWork,
    releaseEscrow,
    placeBid,
    cancelJobForNonPayment
  };
};
