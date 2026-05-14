import { useCallback, useState } from "react";
import { toast } from "sonner";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockStats = {
  platform_balance: 12450,
  total_escrow: 8200,
  total_jobs: 34,
  active_jobs: 12,
  completed_jobs: 18,
  total_users: 47,
};

const mockUsers = [
  { id: "u1", full_name: "Arjun Sharma", email: "arjun@college.edu", verification_status: "verified", is_verified: true, wallet_balance: 3200, created_at: "2024-11-10T10:00:00Z", role: "user", active_project: "React Dashboard UI", bid_price: 1800 },
  { id: "u2", full_name: "Priya Patel", email: "priya@college.edu", verification_status: "pending", is_verified: false, wallet_balance: 800, created_at: "2024-12-01T09:00:00Z", role: "user", active_project: "Mobile App Wireframes", bid_price: 1200 },
  { id: "u3", full_name: "Rahul Verma", email: "rahul@college.edu", verification_status: "unverified", is_verified: false, wallet_balance: 0, created_at: "2025-01-05T14:00:00Z", role: "user", active_project: "Python Data Analysis Script", bid_price: 1350 },
  { id: "u4", full_name: "Sneha Iyer", email: "sneha@college.edu", verification_status: "verified", is_verified: true, wallet_balance: 5600, created_at: "2024-10-20T11:00:00Z", role: "user", active_project: null, bid_price: null },
  { id: "u5", full_name: "Karan Mehta", email: "karan@college.edu", verification_status: "verified", is_verified: true, wallet_balance: 1200, created_at: "2025-02-14T08:00:00Z", role: "user", active_project: "Logo Design for Startup", bid_price: 720 },
];

const mockPendingVerifications = [
  {
    id: "v1", user_id: "u2", full_name: "Priya Patel", email: "priya@college.edu",
    id_type: "student_id", id_number: "STU2024001",
    front_image_url: null, back_image_url: null, selfie_url: null,
    status: "pending", created_at: "2025-01-15T10:00:00Z",
  },
];

let mockEscrow = [
  { id: "e1", job_id: "j1", job_title: "React Dashboard UI", job_status: "submitted", job_deadline: "2025-06-01", poster_name: "Arjun Sharma", worker_name: "Sneha Iyer", total_amount: 2000, worker_amount: 1800, status: "held", created_at: "2025-05-01T10:00:00Z" },
  { id: "e2", job_id: "j2", job_title: "Python Data Analysis Script", job_status: "submitted", job_deadline: "2025-06-05", poster_name: "Karan Mehta", worker_name: "Rahul Verma", total_amount: 1500, worker_amount: 1350, status: "held", created_at: "2025-05-03T12:00:00Z" },
  { id: "e3", job_id: "j3", job_title: "Logo Design for Startup", job_status: "in_progress", job_deadline: "2025-06-10", poster_name: "Priya Patel", worker_name: "Arjun Sharma", total_amount: 800, worker_amount: 720, status: "held", created_at: "2025-05-05T09:00:00Z" },
];

let mockLedger = [
  { id: "l1", type: "fee_collected", amount: 200, job_title: "React Dashboard UI", from_name: "Arjun Sharma", to_name: "Platform", note: "Platform fee", created_at: "2025-05-01T10:00:00Z" },
  { id: "l2", type: "escrow_held", amount: 1800, job_title: "React Dashboard UI", from_name: "Arjun Sharma", to_name: "Sneha Iyer", note: "Escrow held", created_at: "2025-05-01T10:01:00Z" },
  { id: "l3", type: "fee_collected", amount: 150, job_title: "Python Data Analysis Script", from_name: "Karan Mehta", to_name: "Platform", note: "Platform fee", created_at: "2025-05-03T12:00:00Z" },
  { id: "l4", type: "escrow_held", amount: 1350, job_title: "Python Data Analysis Script", from_name: "Karan Mehta", to_name: "Rahul Verma", note: "Escrow held", created_at: "2025-05-03T12:01:00Z" },
  { id: "l5", type: "escrow_released", amount: 900, job_title: "Mobile App Wireframes", from_name: "Platform", to_name: "Priya Patel", note: "Escrow released by admin", created_at: "2025-04-20T15:00:00Z" },
  { id: "l6", type: "refund", amount: 500, job_title: "Content Writing Pack", from_name: "Platform", to_name: "Sneha Iyer", note: "Refund issued", created_at: "2025-04-18T11:00:00Z" },
];

let mockNotifications = [
  { id: "n1", type: "bid", jobTitle: "React Dashboard UI", user: "Sneha Iyer", amount: 1800, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: "n2", type: "acceptance", jobTitle: "Python Data Analysis Script", user: "Karan Mehta", amount: 1500, timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: "n3", type: "payment", jobTitle: "Logo Design for Startup", user: "Priya Patel", amount: 800, timestamp: new Date(Date.now() - 10800000).toISOString() },
  { id: "n4", type: "work_submitted", jobTitle: "React Dashboard UI", user: "Sneha Iyer", amount: 0, timestamp: new Date(Date.now() - 14400000).toISOString() },
];

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
