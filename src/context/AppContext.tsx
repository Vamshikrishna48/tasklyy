import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { Job, Bid, AttachedFile } from "@/data/mockData";
import { toast } from "sonner";
import { 
  sendBidNotification, 
  sendJobAcceptedAlarm, 
  sendWorkSubmittedNotification, 
  sendPaymentVerifiedNotification 
} from "@/hooks/useNotificationPermission";
import { db } from "@/integrations/firebase/client";
import { mockJobs } from "@/data/mockData";
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  getDocs,
  setDoc,
  Timestamp
} from "firebase/firestore";

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
  date: any;
  status: "completed" | "pending" | "escrow" | "verified";
  recipient: "platform" | "freelancer" | "poster";
  posterName?: string;
  freelancerName?: string;
}

interface AppState {
  jobs: Job[];
  myPostedJobs: Job[];
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
  isAdmin: boolean;
  platformBalance: number;
  addJob: (job: Omit<Job, "id" | "postedBy" | "bidsCount" | "status" | "createdAt">) => void;
  deleteJob: (id: string) => void;
  updateJobStatus: (id: string, status: Job["status"]) => void;
  acceptJob: (jobId: string) => void;
  submitWork: (jobId: string, file: AttachedFile) => void;
  getPaymentTimeRemaining: (jobId: string) => number | null;
  releaseEscrow: (paymentId: string) => void;
  recordPostingFee: (jobTitle: string, amount: number) => void;
  toggleRescueMode: (id: string) => void;
  seedDatabase: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

const DEFAULT_USER = {
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

export function AppProvider({ children }: { children: ReactNode }) {
  // Load state from localStorage for Mock Mode persistence
  const getInitialJobs = () => {
    const saved = localStorage.getItem("taskly_mock_jobs");
    return saved ? JSON.parse(saved) : mockJobs;
  };

  const getInitialPayments = () => {
    const saved = localStorage.getItem("taskly_mock_payments");
    return saved ? JSON.parse(saved) : [];
  };

  const [jobs, setJobs] = useState<Job[]>(getInitialJobs);
  const [currentUser, setCurrentUser] = useState(DEFAULT_USER);
  const [payments, setPayments] = useState<Payment[]>(getInitialPayments);
  const [isAdmin, setIsAdmin] = useState(localStorage.getItem("isAdminLoggedIn") === "true");
  const [platformBalance, setPlatformBalance] = useState(0);

  const [myPostedJobs, setMyPostedJobs] = useState<Job[]>([]);

  // Update currentUser based on session
  useEffect(() => {
    const adminEmail = localStorage.getItem("demoUserEmail");
    if (adminEmail) {
      const name = adminEmail.split('@')[0];
      setCurrentUser(prev => ({
        ...prev,
        email: adminEmail,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        avatar: name.substring(0, 2).toUpperCase()
      }));
    } else {
      setCurrentUser(DEFAULT_USER);
    }
  }, [isAdmin]);

  // Sync state to localStorage for persistence in Mock Mode
  useEffect(() => {
    if (import.meta.env.VITE_FIREBASE_API_KEY === "...") {
      localStorage.setItem("taskly_mock_jobs", JSON.stringify(jobs));
      localStorage.setItem("taskly_mock_payments", JSON.stringify(payments));
    }
  }, [jobs, payments]);

  // Function to seed demo data into Firestore
  const seedDatabase = useCallback(async () => {
    if (import.meta.env.VITE_FIREBASE_API_KEY === "...") {
      toast.error("Connect Firebase first to seed data!");
      return;
    }
    
    try {
      const jobsCol = collection(db, "jobs");
      const snapshot = await getDocs(jobsCol);
      if (snapshot.empty) {
        toast.loading("Seeding demo projects...");
        for (const job of mockJobs) {
          const { id, ...jobData } = job;
          await setDoc(doc(db, "jobs", id), {
            ...jobData,
            createdAt: serverTimestamp()
          });
        }
        toast.success("Demo projects seeded to database!");
      } else {
        toast.info("Database already has data.");
      }
    } catch (error) {
      console.error("Seeding error:", error);
      toast.error("Failed to seed data.");
    }
  }, []);

  // Sync admin login status across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "isAdminLoggedIn") {
        setIsAdmin(e.newValue === "true");
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // --- CONNECTION VERIFICATION ---
  useEffect(() => {
    const isPlaceholder = import.meta.env.VITE_FIREBASE_API_KEY === "..." || !import.meta.env.VITE_FIREBASE_API_KEY;
    if (isPlaceholder) {
      toast.error("Firebase Credentials Missing! Open .env.local and add your actual Firebase keys to enable database sync.", {
        duration: 10000,
        id: "firebase-warning"
      });
    }
  }, []);

  // --- FIREBASE REAL-TIME LISTENERS ---
  useEffect(() => {
    if (import.meta.env.VITE_FIREBASE_API_KEY === "...") return;

    // 1. Listen for Jobs
    const jobsQuery = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      })) as Job[];
      
      if (jobsData.length > 0) {
        setJobs(jobsData);
      }
    }, (error) => {
      console.error("Firebase Jobs Listener Error:", error);
      if (import.meta.env.VITE_FIREBASE_API_KEY !== "...") {
        toast.error("Database error. Verification failed or permission denied.");
      }
    });

    // 3. Listen for Payments
    const paymentsQuery = query(collection(db, "payments"), orderBy("date", "desc"));
    const unsubscribePayments = onSnapshot(paymentsQuery, (snapshot) => {
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()?.toISOString() || new Date().toISOString()
      })) as Payment[];
      setPayments(paymentsData);
      
      const balance = paymentsData
        .filter(p => p.recipient === "platform")
        .reduce((sum, p) => sum + p.amount, 0);
      setPlatformBalance(balance);
    }, (error) => {
      console.error("Firebase Payments Listener Error:", error);
    });

    return () => {
      unsubscribeJobs();
      unsubscribePayments();
    };
  }, []);

  // Sync platform balance from payments state
  useEffect(() => {
    const balance = payments
      .filter(p => p.recipient === "platform")
      .reduce((sum, p) => sum + p.amount, 0);
    setPlatformBalance(balance);
  }, [payments]);

  // Sync myPostedJobs
  useEffect(() => {
    setMyPostedJobs(jobs.filter(j => j.postedBy.name === currentUser.name || j.postedBy.name === "Arjun Mehta" || j.postedBy.name === "You"));
  }, [jobs, currentUser.name]);

  const addJob = useCallback(async (jobData: Omit<Job, "id" | "postedBy" | "bidsCount" | "status" | "createdAt">) => {
    try {
      setJobs(prev => [{
        ...jobData,
        id: Math.random().toString(36).substr(2, 9),
        postedBy: { 
          name: currentUser.name, 
          avatar: currentUser.avatar, 
          rating: currentUser.rating,
          campus: currentUser.campus
        },
        bidsCount: 0,
        status: "open",
        createdAt: new Date().toISOString(),
      }, ...prev]);
      
      if (import.meta.env.VITE_FIREBASE_API_KEY === "...") {
        toast.success("Job posted! (Mock Mode)");
        return;
      }

      await addDoc(collection(db, "jobs"), {
        ...jobData,
        postedBy: { 
          name: currentUser.name, 
          avatar: currentUser.avatar, 
          rating: currentUser.rating,
          campus: currentUser.campus
        },
        bidsCount: 0,
        status: "open",
        createdAt: serverTimestamp(),
      });
      toast.success("Job posted! Syncing across devices...");
    } catch (error) {
      console.error("Firebase Add Job Error:", error);
      toast.error("Failed to post job.");
    }
  }, []);

  const deleteJob = useCallback(async (id: string) => {
    try {
      setJobs(prev => prev.filter(j => j.id !== id));
      setMyPostedJobs(prev => prev.filter(j => j.id !== id));

      if (import.meta.env.VITE_FIREBASE_API_KEY === "...") {
        toast.success("Job deleted (Mock Mode)");
        return;
      }

      await deleteDoc(doc(db, "jobs", id));
      toast.success("Job deleted");
    } catch (error) {
      console.error("Firebase Delete Job Error:", error);
    }
  }, []);

  const updateJobStatus = useCallback(async (id: string, status: Job["status"]) => {
    try {
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
      
      if (import.meta.env.VITE_FIREBASE_API_KEY === "...") {
        toast.success(`Job marked as ${status.replace("_", " ")} (Mock Mode)`);
        return;
      }

      await updateDoc(doc(db, "jobs", id), { status });
      toast.success(`Job marked as ${status.replace("_", " ")}`);
    } catch (error) {
      console.error("Firebase Update Job Status Error:", error);
    }
  }, []);

  const toggleRescueMode = useCallback(async (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (job) {
      await updateDoc(doc(db, "jobs", id), { 
        rescueMode: true, 
        budget: job.budget * 1.5 
      });
      toast.success(`Rescue Mode activated! Budget boosted.`);
    }
  }, [jobs]);

  const placeBid = useCallback(async (jobId: string, amount: number, message: string, deliveryDays: number) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

  }, [jobs]);

  const acceptJob = useCallback(async (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const platformFee = Math.round(job.budget * 0.1);
    const freelancerAmount = job.budget - platformFee;
    
    try {
      // Update Job locally - Move directly to in_progress with auto-payment
      setJobs(prev => prev.map(j => j.id === jobId ? {
        ...j,
        status: "in_progress",
        acceptedBidderId: "mock-worker-id",
        acceptedBidderName: currentUser.name,
        filesUnlocked: true,
        paymentDeadline: null,
      } : j));

      // Record Payments locally
      const newPayments: Payment[] = [
        {
          id: Math.random().toString(36).substr(2, 9),
          jobId,
          jobTitle: job.title,
          amount: job.budget,
          type: "spent" as const,
          date: new Date().toISOString(),
          status: "verified" as const,
          recipient: "platform" as const,
          posterName: job.postedBy.name,
          freelancerName: currentUser.name,
        },
        {
          id: Math.random().toString(36).substr(2, 9),
          jobId,
          jobTitle: job.title,
          amount: freelancerAmount,
          type: "earned" as const,
          date: new Date().toISOString(),
          status: "escrow" as const,
          recipient: "freelancer" as const,
          posterName: job.postedBy.name,
          freelancerName: currentUser.name,
        }
      ];
      setPayments(prev => [...newPayments, ...prev]);

      if (import.meta.env.VITE_FIREBASE_API_KEY === "...") {
        toast.success("Job accepted and payment secured! (Mock Mode)");
        return;
      }

      // Update Job in Firebase
      await updateDoc(doc(db, "jobs", jobId), {
        status: "in_progress",
        acceptedBidderId: "mock-worker-id",
        acceptedBidderName: currentUser.name,
        filesUnlocked: true,
        paymentDeadline: null,
      });

      // Record Payments in Firebase
      await addDoc(collection(db, "payments"), {
        jobId,
        jobTitle: job.title,
        amount: job.budget,
        type: "spent",
        date: serverTimestamp(),
        status: "verified",
        recipient: "platform",
        posterName: job.postedBy.name,
        freelancerName: currentUser.name,
      });

      await addDoc(collection(db, "payments"), {
        jobId,
        jobTitle: job.title,
        amount: freelancerAmount,
        type: "earned",
        date: serverTimestamp(),
        status: "escrow",
        recipient: "freelancer",
        posterName: job.postedBy.name,
        freelancerName: currentUser.name,
      });

      toast.success("Job taken and escrow secured!");
    } catch (error) {
      console.error("Firebase Direct Accept/Pay Error:", error);
    }
  }, [jobs, currentUser.name]);

  const submitWork = useCallback(async (jobId: string, file: AttachedFile) => {
    try {
      setJobs(prev => prev.map(j => j.id === jobId ? {
        ...j,
        status: "completed",
        submittedWork: file
      } : j));

      if (import.meta.env.VITE_FIREBASE_API_KEY === "...") {
        toast.success("Work submitted! (Mock Mode)");
        return;
      }

      await updateDoc(doc(db, "jobs", jobId), {
        status: "completed",
        submittedWork: file
      });

      const job = jobs.find(j => j.id === jobId);
      if (job) sendWorkSubmittedNotification(job.title, currentUser.name);
      toast.success("Work submitted and synced!");
    } catch (error) {
      console.error("Firebase Submit Work Error:", error);
    }
  }, [jobs]);

  const getPaymentTimeRemaining = useCallback((jobId: string): number | null => {
    const job = jobs.find(j => j.id === jobId);
    if (!job || job.status !== "payment_pending" || !job.paymentDeadline) return null;
    const remaining = job.paymentDeadline - Date.now();
    return remaining > 0 ? remaining : 0;
  }, [jobs]);

  const releaseEscrow = useCallback(async (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId && p.status === "escrow");
    if (!payment) return;

    try {
      await updateDoc(doc(db, "payments", paymentId), { status: "completed" });
      toast.success("Escrow released!");
    } catch (error) {
      console.error("Firebase Release Escrow Error:", error);
    }
  }, [payments]);

  const recordPostingFee = useCallback(async (jobTitle: string, amount: number) => {
    if (amount <= 0) return;
    try {
      await addDoc(collection(db, "payments"), {
        jobId: "posting-fee",
        jobTitle,
        amount,
        type: "spent",
        date: serverTimestamp(),
        status: "completed",
        recipient: "platform",
      });
    } catch (error) {
      console.error("Firebase Posting Fee Error:", error);
    }
  }, []);

  const getBidsForJob = (jobId: string) => []; // Legacy compatibility

  return (
    <AppContext.Provider
      value={{
        jobs,
        myPostedJobs,
        payments,
        currentUser,
        isAdmin,
        platformBalance,
        addJob,
        deleteJob,
        updateJobStatus,
        acceptJob,
        submitWork,
        getPaymentTimeRemaining,
        releaseEscrow,
        recordPostingFee,
        toggleRescueMode,
        seedDatabase,
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
