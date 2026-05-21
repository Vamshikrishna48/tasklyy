import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const fetchAdminStats = useCallback(async () => {
    const [{ count: total_users }, { count: total_jobs }, { count: active_jobs }, { count: completed_jobs }] =
      await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        (supabase as any).from("jobs").select("*", { count: "exact", head: true }),
        (supabase as any).from("jobs").select("*", { count: "exact", head: true }).in("status", ["accepted", "submitted", "payment_pending"]),
        (supabase as any).from("jobs").select("*", { count: "exact", head: true }).eq("status", "completed"),
      ]);

    const { data: escrowData } = await (supabase as any)
      .from("escrow_transactions")
      .select("total_amount")
      .eq("status", "held");

    const total_escrow = (escrowData || []).reduce((sum: number, e: any) => sum + (e.total_amount || 0), 0);

    return {
      platform_balance: 0,
      total_escrow,
      total_jobs: total_jobs || 0,
      active_jobs: active_jobs || 0,
      completed_jobs: completed_jobs || 0,
      total_users: total_users || 0,
    };
  }, []);

  // ── Ledger ────────────────────────────────────────────────────────────────
  const fetchLedger = useCallback(async (searchQuery?: string) => {
    let query = (supabase as any)
      .from("admin_ledger")
      .select("*, from_user:profiles!admin_ledger_from_user_id_fkey(full_name), to_user:profiles!admin_ledger_to_user_id_fkey(full_name), job:jobs!admin_ledger_job_id_fkey(title)")
      .order("created_at", { ascending: false })
      .limit(100);

    const { data, error } = await query;
    if (error) { console.error(error); return []; }
    const mapped = (data || []).map((e: any) => ({
      ...e,
      from_name: e.from_user?.full_name || "—",
      to_name: e.to_user?.full_name || "—",
      job_title: e.job?.title || "—",
    }));
    if (!searchQuery) return mapped;
    const q = searchQuery.toLowerCase();
    return mapped.filter((e: any) =>
      e.job_title?.toLowerCase().includes(q) ||
      e.from_name?.toLowerCase().includes(q) ||
      e.to_name?.toLowerCase().includes(q)
    );
  }, []);

  // ── Escrow ────────────────────────────────────────────────────────────────
  const fetchEscrowQueue = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("escrow_transactions")
      .select("*, poster:profiles!escrow_transactions_poster_id_fkey(full_name), worker:profiles!escrow_transactions_worker_id_fkey(full_name), job:jobs!escrow_transactions_job_id_fkey(title)")
      .eq("status", "held")
      .order("created_at", { ascending: false });
    if (error) { console.error(error); return []; }
    return (data || []).map((e: any) => ({
      ...e,
      poster_name: e.poster?.full_name || "—",
      worker_name: e.worker?.full_name || "—",
      job_title: e.job?.title || "—",
    }));
  }, []);

  // ── All Users (real Supabase data with last login info) ──────────────────
  const fetchAllUsers = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("*, jobs_posted:jobs!jobs_poster_id_fkey(id, title, status, budget, created_at), jobs_working:jobs!jobs_worker_id_fkey(id, title, status, budget)")
      .order("created_at", { ascending: false });

    if (error) { console.error(error); return []; }

    return (data || []).map((u: any) => {
      const activeJob = (u.jobs_posted || []).find((j: any) => ["accepted", "submitted", "payment_pending"].includes(j.status))
        || (u.jobs_working || []).find((j: any) => ["accepted", "submitted", "payment_pending"].includes(j.status));
      const acceptedBid = (u.jobs_working || []).find((j: any) => ["accepted", "submitted"].includes(j.status));
      return {
        ...u,
        active_project: activeJob?.title || null,
        bid_price: acceptedBid?.budget || null,
        total_jobs_posted: (u.jobs_posted || []).length,
        total_jobs_worked: (u.jobs_working || []).length,
      };
    });
  }, []);

  // ── Pending Verifications ─────────────────────────────────────────────────
  const fetchPendingVerifications = useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("verification_requests")
      .select("*, profile:profiles!verification_requests_user_id_fkey(full_name, email)")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) { console.error(error); return []; }
    return (data || []).map((r: any) => ({
      ...r,
      full_name: r.profile?.full_name || "—",
      email: r.profile?.email || "—",
    }));
  }, []);

  // ── Signed URLs for verification docs ────────────────────────────────────
  const getSignedUrls = async (paths: (string | null | undefined)[]) => {
    return Promise.all(
      paths.map(async (path) => {
        if (!path) return null;
        const { data, error } = await supabase.storage
          .from("verification-docs")
          .createSignedUrl(path, 60 * 10); // 10 minute expiry
        return error ? null : data?.signedUrl ?? null;
      })
    );
  };

  // ── Approve / Reject verification ────────────────────────────────────────
  const approveVerification = async (userId: string, requestId?: string) => {
    const { error: profileErr } = await (supabase as any)
      .from("profiles")
      .update({ is_verified: true, verification_status: "verified" })
      .eq("id", userId);
    if (profileErr) { toast.error("Failed to approve: " + profileErr.message); return false; }
    if (requestId) {
      await (supabase as any).from("verification_requests").update({ status: "verified" }).eq("id", requestId);
    }
    toast.success("User verified successfully ✅");
    return true;
  };

  const rejectVerification = async (userId: string, requestId?: string, adminNote?: string) => {
    const { error: profileErr } = await (supabase as any)
      .from("profiles")
      .update({ verification_status: "rejected" })
      .eq("id", userId);
    if (profileErr) { toast.error("Failed to reject: " + profileErr.message); return false; }
    if (requestId) {
      await (supabase as any)
        .from("verification_requests")
        .update({ status: "rejected", admin_note: adminNote || "" })
        .eq("id", requestId);
    }
    toast.success("Verification rejected");
    return true;
  };

  // ── Escrow Release ────────────────────────────────────────────────────────
  const releaseEscrow = async (jobId: string) => {
    setLoading(true);
    try {
      const { data: escrow } = await (supabase as any)
        .from("escrow_transactions")
        .select("*")
        .eq("job_id", jobId)
        .eq("status", "held")
        .maybeSingle();
      if (!escrow) { toast.error("Escrow record not found"); return false; }

      await (supabase as any).from("escrow_transactions").update({ status: "released", released_at: new Date().toISOString() }).eq("id", escrow.id);
      await (supabase as any).from("jobs").update({ status: "completed" }).eq("id", jobId);

      if (escrow.worker_id) {
        const { data: worker } = await (supabase as any).from("profiles").select("wallet_balance").eq("id", escrow.worker_id).maybeSingle();
        await (supabase as any).from("profiles").update({ wallet_balance: ((worker as any)?.wallet_balance || 0) + escrow.worker_amount }).eq("id", escrow.worker_id);
      }
      toast.success("Escrow released successfully ✅");
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refundEscrow = async (jobId: string) => {
    setLoading(true);
    try {
      const { data: escrow } = await (supabase as any)
        .from("escrow_transactions")
        .select("*")
        .eq("job_id", jobId)
        .eq("status", "held")
        .maybeSingle();
      if (!escrow) { toast.error("Escrow record not found"); return false; }

      await (supabase as any).from("escrow_transactions").update({ status: "refunded" }).eq("id", escrow.id);
      await (supabase as any).from("jobs").update({ status: "disputed" }).eq("id", jobId);

      if (escrow.poster_id) {
        const { data: poster } = await (supabase as any).from("profiles").select("wallet_balance").eq("id", escrow.poster_id).maybeSingle();
        await (supabase as any).from("profiles").update({ wallet_balance: ((poster as any)?.wallet_balance || 0) + escrow.total_amount }).eq("id", escrow.poster_id);
      }
      toast.success("Refund issued to poster ✅");
      return true;
    } catch (e: any) {
      toast.error(e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchAdminStats,
    fetchLedger,
    fetchEscrowQueue,
    fetchAllUsers,
    fetchPendingVerifications,
    getSignedUrls,
    approveVerification,
    rejectVerification,
    releaseEscrow,
    refundEscrow,
  };
};

export const mockNotifications: any[] = [];
