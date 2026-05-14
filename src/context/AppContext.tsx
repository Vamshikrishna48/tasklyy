import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { Job, Bid, mockJobs as initialJobs, mockBids as initialBids } from "@/data/mockData";
import { toast } from "sonner";
import { sendBidNotification, sendJobAcceptedAlarm } from "@/hooks/useNotificationPermission";
import { useJobs } from "@/hooks/useJobs";

export interface UserBid extends Bid {
  status: "pending" | "accepted" | "rejected";
  jobTitle: string;
}

export interface Payment {
  id: string;
  jobId: string;
  jobTitle: string;
  amount: number;
  type: "earned" | "spent";
  date: string;
  status: "completed" | "pending" | "escrow";
  // Who ultimately receives/holds this money from the platform perspective
  recipient: "platform" | "freelancer" | "poster";
}

// === Supabase profile type ===
export type Profile = Database['public']['Tables']['profiles']['Row'];

interface AppState {
  // --- Supabase auth state ---
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  authLoading: boolean;
  // --- Existing mock state (preserved) ---
  jobs: Job[];
  myPostedJobs: Job[];
  myBids: UserBid[];
  payments: Payment[];
  currentUser: { 
    name: string; 
    avatar: string; 
    rating: number; 
    completedJobs: number; 
    balance: number;
    campus: string;
    skillScores: Record<string, number>;
    email: string;
    contact: string;
  };
  // Platform/admin state
  isAdmin: boolean;
  platformBalance: number;
  addJob: (job: Omit<Job, "id" | "postedBy" | "bidsCount" | "status" | "createdAt">) => void;
  deleteJob: (id: string) => void;
  updateJobStatus: (id: string, status: Job["status"]) => void;
  placeBid: (jobId: string, amount: number, message: string, deliveryDays: number) => void;
  withdrawBid: (bidId: string) => void;
  acceptBid: (bidId: string) => void;
  rejectBid: (bidId: string) => void;
  getBidsForJob: (jobId: string) => UserBid[];
  releaseEscrow: (paymentId: string) => void;
  recordPostingFee: (jobTitle: string, amount: number) => void;
  toggleRescueMode: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const currentUser = {
  name: "You",
  avatar: "YO",
  rating: 4.9,
  completedJobs: 12,
  balance: 0,
  campus: "Stanford University",
  skillScores: { Coding: 4.8, Design: 4.5, Writing: 5.0 },
  email: "you@stanford.edu",
  contact: "+1 (555) 000-0000",
};

const initialMyJobs: Job[] = [];

const initialMyBids: UserBid[] = [];

const initialPayments: Payment[] = [];

export function AppProvider({ children }: { children: ReactNode }) {
  // === Supabase auth state ===
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Fetch profile row from Supabase when user changes
  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } else {
      setProfile(data);
    }
  }, []);

  // On mount: restore session and listen for auth changes
  useEffect(() => {
    // 1. Get existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setAuthLoading(false);
    });

    // 2. Listen for auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // === Real Supabase hooks ===
  const { postJob: supabasePostJob, acceptJob: supabaseAcceptJob, releaseEscrow: supabaseReleaseEscrow, submitWork: supabaseSubmitWork, fetchJobs: supabaseFetchJobs, fetchMyJobs: supabaseFetchMyJobs } = useJobs();

  // === Existing mock state (preserved exactly as-is) ===
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myPostedJobs, setMyPostedJobs] = useState<Job[]>(initialMyJobs);
  const [myBids, setMyBids] = useState<UserBid[]>(initialMyBids);
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  // Demo mode: always treat current user as admin
  const [isAdmin] = useState(true);
  const [platformBalance, setPlatformBalance] = useState(0);

  // On auth ready, fetch real jobs from Supabase and merge with mock
  useEffect(() => {
    if (!authLoading) {
      supabaseFetchJobs().then((realJobs) => {
        if (realJobs && realJobs.length > 0) {
          // Map Supabase jobs to the mock Job shape for UI compatibility
          const mapped: Job[] = realJobs.map((rj: any) => ({
            id: rj.id,
            title: rj.title,
            description: rj.description,
            category: rj.category,
            budget: rj.budget,
            deadline: rj.deadline || '',
            postedBy: {
              name: rj.poster?.full_name || 'Unknown',
              avatar: (rj.poster?.full_name || 'U').substring(0, 2).toUpperCase(),
              rating: 4.5,
              campus: '',
            },
            bidsCount: 0,
            status: rj.status as Job['status'],
            createdAt: rj.created_at?.split('T')[0] || '',
            skills: rj.skills || [],
            instructions: rj.instructions || undefined,
          }));
          setJobs(mapped);
        }
      });

      // Also fetch user's own jobs
      if (user?.id) {
        supabaseFetchMyJobs(user.id).then((result) => {
          if (result.posted.length > 0) {
            const mapped: Job[] = result.posted.map((rj: any) => ({
              id: rj.id,
              title: rj.title,
              description: rj.description,
              category: rj.category,
              budget: rj.budget,
              deadline: rj.deadline || '',
              postedBy: {
                name: profile?.full_name || 'You',
                avatar: (profile?.full_name || 'YO').substring(0, 2).toUpperCase(),
                rating: 4.9,
                campus: '',
              },
              bidsCount: 0,
              status: rj.status as Job['status'],
              createdAt: rj.created_at?.split('T')[0] || '',
              skills: rj.skills || [],
              instructions: rj.instructions || undefined,
            }));
            setMyPostedJobs((prev) => {
              const realIds = new Set(mapped.map((j) => j.id));
              return [...mapped, ...prev.filter((j) => !realIds.has(j.id))];
            });
          }
        });
      }
    }
  }, [authLoading, user?.id, profile?.full_name]);

  const addJob = useCallback(async (jobData: Omit<Job, "id" | "postedBy" | "bidsCount" | "status" | "createdAt">) => {
    // Try real Supabase insert first if user is authenticated
    if (user?.id) {
      const supabaseJobData = {
        title: jobData.title,
        description: jobData.description,
        budget: jobData.budget,
        category: jobData.category,
        deadline: jobData.deadline || null,
        instructions: jobData.instructions || null,
      };
      const result = await supabasePostJob(supabaseJobData, user.id);
      if (result) {
        // Map to mock Job shape and add to local state
        const newJob: Job = {
          ...jobData,
          id: result.id,
          postedBy: {
            name: profile?.full_name || currentUser.name,
            avatar: (profile?.full_name || currentUser.name).substring(0, 2).toUpperCase(),
            rating: currentUser.rating,
            campus: currentUser.campus,
          },
          bidsCount: 0,
          status: "open",
          createdAt: new Date().toISOString().split("T")[0],
        };
        setMyPostedJobs((prev) => [newJob, ...prev]);
        setJobs((prev) => [newJob, ...prev]);
        return;
      }
    }

    // Fallback: mock insert (for demo/non-authenticated)
    const newJob: Job = {
      ...jobData,
      id: `job-${Date.now()}`,
      postedBy: { 
        name: currentUser.name, 
        avatar: currentUser.avatar, 
        rating: currentUser.rating,
        campus: currentUser.campus
      },
      bidsCount: 0,
      status: "open",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setMyPostedJobs((prev) => [newJob, ...prev]);
    setJobs((prev) => [newJob, ...prev]);
    toast.success("Job posted successfully!");
  }, [user?.id, profile?.full_name, supabasePostJob]);

  const deleteJob = useCallback((id: string) => {
    setMyPostedJobs((prev) => prev.filter((j) => j.id !== id));
    setJobs((prev) => prev.filter((j) => j.id !== id));
    toast.success("Job deleted");
  }, []);

  const updateJobStatus = useCallback((id: string, status: Job["status"]) => {
    const update = (prev: Job[]) => prev.map((j) => (j.id === id ? { ...j, status } : j));
    setMyPostedJobs(update);
    setJobs(update);
    toast.success(`Job marked as ${status.replace("_", " ")}`);
  }, []);

  const toggleRescueMode = useCallback((id: string) => {
    const update = (prev: Job[]) => prev.map((j) => (j.id === id ? { ...j, rescueMode: true, budget: j.budget * 1.5 } : j));
    setMyPostedJobs(update);
    setJobs(update);
    toast.success(`Rescue Mode activated! Budget increased by 50% and visibility boosted.`);
  }, []);

  const placeBid = useCallback((jobId: string, amount: number, message: string, deliveryDays: number) => {
    const job = [...jobs, ...myPostedJobs].find((j) => j.id === jobId);
    const newBid: UserBid = {
      id: `bid-${Date.now()}`,
      jobId,
      jobTitle: job?.title || "Unknown Job",
      bidder: { 
        name: currentUser.name, 
        avatar: currentUser.avatar, 
        rating: currentUser.rating, 
        completedJobs: currentUser.completedJobs,
        campus: currentUser.campus,
        skillScores: currentUser.skillScores
      },
      amount,
      message,
      deliveryDays,
      createdAt: new Date().toISOString().split("T")[0],
      status: "pending",
    };
    setMyBids((prev) => [newBid, ...prev]);
    const incBids = (prev: Job[]) => prev.map((j) => (j.id === jobId ? { ...j, bidsCount: j.bidsCount + 1 } : j));
    setJobs(incBids);
    setMyPostedJobs(incBids);
    // Send browser notification alarm to job poster
    sendBidNotification(job?.title || "Unknown Job", amount, currentUser.name);
    toast.success("Bid placed successfully!");
  }, [jobs, myPostedJobs]);

  const withdrawBid = useCallback((bidId: string) => {
    setMyBids((prev) => prev.filter((b) => b.id !== bidId));
    toast.success("Bid withdrawn");
  }, []);

  const acceptBid = useCallback(async (bidId: string) => {
    const bid = myBids.find((b) => b.id === bidId);

    // Try real Supabase accept if authenticated
    if (user?.id && bid?.jobId) {
      const result = await supabaseAcceptJob(bid.jobId, user.id);
      if (result) {
        // Update local state to reflect acceptance
        setMyBids((prev) => prev.map((b) => (b.id === bidId ? { ...b, status: "accepted" as const } : b)));
        const updateStatus = (jobs: Job[]) => jobs.map((j) => j.id === bid.jobId ? { ...j, status: "in_progress" as const } : j);
        setMyPostedJobs(updateStatus);
        setJobs(updateStatus);
        if (bid) sendJobAcceptedAlarm(bid.jobTitle, bid.amount);
        return;
      }
    }

    // Fallback: mock accept
    setMyBids((prev) => {
      const foundBid = prev.find((b) => b.id === bidId);
      if (foundBid) {
        const platformFee = Math.round(foundBid.amount * 0.1);
        const freelancerAmount = foundBid.amount - platformFee;
        const posterPayment: Payment = {
          id: `pay-${Date.now()}-poster`,
          jobId: foundBid.jobId,
          jobTitle: foundBid.jobTitle,
          amount: foundBid.amount,
          type: "spent",
          date: new Date().toISOString().split("T")[0],
          status: "completed",
          recipient: "platform",
        };
        const freelancerPayment: Payment = {
          id: `pay-${Date.now()}-freelancer`,
          jobId: foundBid.jobId,
          jobTitle: foundBid.jobTitle,
          amount: freelancerAmount,
          type: "earned",
          date: new Date().toISOString().split("T")[0],
          status: "escrow",
          recipient: "freelancer",
        };
        setPayments((p) => [posterPayment, freelancerPayment, ...p]);
        setPlatformBalance((b) => b + foundBid.amount);
        const updateStatus = (jobs: Job[]) => jobs.map((j) => j.id === foundBid.jobId ? { ...j, status: "in_progress" as const } : j);
        setMyPostedJobs(updateStatus);
        setJobs(updateStatus);
      }
      return prev.map((b) => (b.id === bidId ? { ...b, status: "accepted" as const } : b));
    });
    toast.success("Bid accepted! Payment has been processed. 10% platform fee applied.");
    const acceptedBid = myBids.find((b) => b.id === bidId);
    if (acceptedBid) {
      sendJobAcceptedAlarm(acceptedBid.jobTitle, acceptedBid.amount);
    }
  }, [user?.id, myBids, supabaseAcceptJob]);

  const releaseEscrow = useCallback(async (paymentId: string) => {
    // Try real Supabase release if authenticated
    const payment = payments.find((p) => p.id === paymentId && p.status === "escrow");
    if (user?.id && payment?.jobId && payment.jobId !== 'posting-fee') {
      const result = await supabaseReleaseEscrow(payment.jobId, user.id);
      if (result) {
        // Update local state
        setPayments((prev) => prev.map((p) => p.id === paymentId ? { ...p, status: "completed" as const } : p));
        setPlatformBalance((b) => b - payment.amount);
        return;
      }
    }

    // Fallback: mock release
    setPayments((prev) => {
      const foundPayment = prev.find((p) => p.id === paymentId && p.status === "escrow");
      if (!foundPayment) {
        toast.error("Escrow payment not found or already released.");
        return prev;
      }

      setPlatformBalance((b) => b - foundPayment.amount);
      currentUser.balance += foundPayment.amount;

      toast.success("Escrow released to freelancer (90% payout).");

      return prev.map((p) =>
        p.id === paymentId
          ? { ...p, status: "completed" as const }
          : p
      );
    });
  }, [user?.id, payments, supabaseReleaseEscrow]);

  const recordPostingFee = useCallback((jobTitle: string, amount: number) => {
    if (!amount || amount <= 0) return;
    const feePayment: Payment = {
      id: `pay-${Date.now()}-post-fee`,
      jobId: "posting-fee",
      jobTitle,
      amount,
      type: "spent",
      date: new Date().toISOString().split("T")[0],
      status: "completed",
      recipient: "platform",
    };
    setPayments((prev) => [feePayment, ...prev]);
    setPlatformBalance((b) => b + amount);
  }, []);

  const rejectBid = useCallback((bidId: string) => {
    setMyBids((prev) => prev.map((b) => (b.id === bidId ? { ...b, status: "rejected" as const } : b)));
    toast.success("Bid rejected");
  }, []);

  const getBidsForJob = useCallback((jobId: string) => {
    return myBids.filter((b) => b.jobId === jobId);
  }, [myBids]);

  return (
    <AppContext.Provider
      value={{
        // Supabase auth
        user,
        session,
        profile,
        authLoading,
        // Existing mock state
        jobs,
        myPostedJobs,
        myBids,
        payments,
        currentUser,
        isAdmin,
        platformBalance,
        addJob,
        deleteJob,
        updateJobStatus,
        placeBid,
        withdrawBid,
        acceptBid,
        rejectBid,
        getBidsForJob,
        releaseEscrow,
        recordPostingFee,
        toggleRescueMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
