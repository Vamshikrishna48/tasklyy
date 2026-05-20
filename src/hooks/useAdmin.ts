import { useCallback, useState } from "react";
import { toast } from "sonner";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockStats = {
  platform_balance: 0,
  total_escrow: 0,
  total_jobs: 0,
  active_jobs: 0,
  completed_jobs: 0,
  total_users: 0,
};

const mockUsers: any[] = [];

const mockPendingVerifications: any[] = [];

let mockEscrow: any[] = [];

let mockLedger: any[] = [];

let mockNotifications: any[] = [];

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);

  const fetchAdminStats = useCallback(async () => {
    await new Promise(r => setTimeout(r, 300));
    return { ...mockStats };
  }, []);

  const fetchLedger = useCallback(async (searchQuery?: string) => {
    await new Promise(r => setTimeout(r, 200));
    if (!searchQuery) return [...mockLedger];
    const q = searchQuery.toLowerCase();
    return mockLedger.filter(e =>
      e.job_title?.toLowerCase().includes(q) ||
      e.from_name?.toLowerCase().includes(q) ||
      e.to_name?.toLowerCase().includes(q)
    );
  }, []);

  const fetchEscrowQueue = useCallback(async () => {
    await new Promise(r => setTimeout(r, 200));
    return mockEscrow.filter(e => e.status === "held");
  }, []);

  const fetchAllUsers = useCallback(async () => {
    await new Promise(r => setTimeout(r, 200));
    return [...mockUsers];
  }, []);

  const fetchPendingVerifications = useCallback(async () => {
    await new Promise(r => setTimeout(r, 200));
    return [...mockPendingVerifications];
  }, []);

  const getSignedUrls = async (paths: (string | null | undefined)[]) => {
    return paths.map(() => null);
  };

  const approveVerification = async (userId: string, requestId?: string) => {
    await new Promise(r => setTimeout(r, 300));
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      user.is_verified = true;
      user.verification_status = "verified";
    }
    const idx = mockPendingVerifications.findIndex(v => v.id === requestId);
    if (idx !== -1) mockPendingVerifications.splice(idx, 1);
    toast.success("User verified successfully");
    return true;
  };

  const rejectVerification = async (userId: string, requestId?: string, adminNote?: string) => {
    await new Promise(r => setTimeout(r, 300));
    const user = mockUsers.find(u => u.id === userId);
    if (user) user.verification_status = "rejected";
    const idx = mockPendingVerifications.findIndex(v => v.id === requestId);
    if (idx !== -1) mockPendingVerifications.splice(idx, 1);
    toast.success("Verification rejected");
    return true;
  };

  const releaseEscrow = async (jobId: string) => {
    await new Promise(r => setTimeout(r, 400));
    const escrow = mockEscrow.find(e => e.job_id === jobId);
    if (!escrow) { toast.error("Escrow not found"); return false; }
    escrow.status = "released";
    mockLedger.unshift({
      id: `l${Date.now()}`, type: "escrow_released",
      amount: escrow.worker_amount, job_title: escrow.job_title,
      from_name: "Platform", to_name: escrow.worker_name,
      note: `Escrow released by admin for: ${escrow.job_title}`,
      created_at: new Date().toISOString(),
    });
    mockStats.total_escrow = Math.max(0, mockStats.total_escrow - escrow.worker_amount);
    toast.success("Escrow released successfully ✅");
    return true;
  };

  const refundEscrow = async (jobId: string) => {
    await new Promise(r => setTimeout(r, 400));
    const escrow = mockEscrow.find(e => e.job_id === jobId);
    if (!escrow) { toast.error("Escrow not found"); return false; }
    escrow.status = "refunded";
    mockLedger.unshift({
      id: `l${Date.now()}`, type: "refund",
      amount: escrow.total_amount, job_title: escrow.job_title,
      from_name: "Platform", to_name: escrow.poster_name,
      note: `Refund issued to poster for: ${escrow.job_title}`,
      created_at: new Date().toISOString(),
    });
    mockStats.total_escrow = Math.max(0, mockStats.total_escrow - escrow.total_amount);
    toast.success("Refund issued to poster");
    return true;
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

export { mockNotifications };
