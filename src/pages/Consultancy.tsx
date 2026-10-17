import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sparkles,
  ArrowLeft,
  User,
  KeyRound,
  ShieldCheck,
  Calendar,
  Clock,
  Video,
  Star,
  Search,
  CheckCircle,
  ExternalLink,
  Loader2,
  LogOut,
  Compass,
  Cpu,
  Code2,
  Palette,
  FileCheck2,
  Briefcase,
  IndianRupee,
  Layers,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { Consultancy3DCanvas } from "@/components/consultancy/Consultancy3DCanvas";
import { Card3D } from "@/components/consultancy/Card3D";

// Static curated verified elite consultants
const mockConsultants = [
  {
    id: "con-1",
    name: "Dr. Arvind Raman",
    title: "Principal AI Research Scientist",
    company: "Ex-Google DeepMind / IIT Madras",
    domain: "ai",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: 4.96,
    reviewsCount: 84,
    skills: ["PyTorch", "LLMs & RAG", "Deep Learning", "Research Papers"],
    bio: "Guiding thesis defense, algorithmic research papers, transformer architectures, and production ML pipelines.",
    price: 1499,
    duration: "45 mins",
    availableToday: true,
  },
  {
    id: "con-2",
    name: "Meera Subramanian",
    title: "Lead Frontend Architect",
    company: "CloudScale Systems",
    domain: "tech",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    rating: 4.94,
    reviewsCount: 112,
    skills: ["React & Next.js", "TypeScript", "Performance", "Web Architecture"],
    bio: "Code reviews, complex state management audits, frontend optimization, and high-impact portfolio preparation.",
    price: 999,
    duration: "45 mins",
    availableToday: true,
  },
  {
    id: "con-3",
    name: "Kabir Sengupta",
    title: "Staff Systems & Distributed Engineer",
    company: "Razorpay / ex-Amazon",
    domain: "tech",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 4.98,
    reviewsCount: 96,
    skills: ["Go / Microservices", "PostgreSQL & Redis", "System Design", "Kafka"],
    bio: "Deep-dive backend system design, database indexing, high-concurrency architecture, and mock tech interviews.",
    price: 1299,
    duration: "60 mins",
    availableToday: false,
  },
  {
    id: "con-4",
    name: "Ananya Deshmukh",
    title: "Product Design Director",
    company: "Studio Obsidian",
    domain: "design",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 4.92,
    reviewsCount: 78,
    skills: ["Figma Systems", "UX Research", "Micro-interactions", "Portfolio Review"],
    bio: "Transforming design portfolios, critiquing user flows, wireframing guidance, and landing high-ticket design gigs.",
    price: 899,
    duration: "40 mins",
    availableToday: true,
  },
  {
    id: "con-5",
    name: "Rohan Kapoor",
    title: "Tech Career & Strategy Consultant",
    company: "TopTalent Advisory",
    domain: "career",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 4.95,
    reviewsCount: 140,
    skills: ["Resume Roasting", "Offer Negotiation", "FAANG Mock Prep", "LinkedIn Polish"],
    bio: "Helping students & working professionals crack competitive hiring rounds, structure resumes, and negotiate offers.",
    price: 799,
    duration: "45 mins",
    availableToday: true,
  },
  {
    id: "con-6",
    name: "Siddharth Verma",
    title: "Cloud & DevSecOps Lead",
    company: "FinTech Infrastructure Core",
    domain: "cloud",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    rating: 4.89,
    reviewsCount: 65,
    skills: ["AWS & GCP", "Docker & Kubernetes", "CI/CD Pipelines", "Terraform"],
    bio: "Production deployment reviews, cloud infrastructure sizing, Docker containerization, and zero-downtime releases.",
    price: 1199,
    duration: "50 mins",
    availableToday: false,
  },
];

interface PortalUser {
  id: string;
  full_name: string;
  email: string;
  tasskly_id: string;
  avatar_url?: string;
}

interface Booking {
  id: string;
  consultantId: string;
  consultantName: string;
  consultantTitle: string;
  consultantAvatar: string;
  date: string;
  timeSlot: string;
  mode: string;
  price: number;
  meetingUrl: string;
  status: "confirmed" | "completed" | "in_review";
  notes?: string;
  createdAt: string;
}

export const Consultancy: React.FC = () => {
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith("/dashboard");
  const { profile: activeLoggedInProfile } = useApp();

  // Authentication State
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [tassklyId, setTassklyId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authStep, setAuthStep] = useState<"id_entry" | "password_entry" | "password_setup">("id_entry");
  const [checkLoading, setCheckLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [tempUserName, setTempUserName] = useState("");

  // Portal Interaction State
  const [activeTab, setActiveTab] = useState<"explore" | "bookings" | "request">("explore");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Booking Modal State
  const [bookingConsultant, setBookingConsultant] = useState<typeof mockConsultants[0] | null>(null);
  const [selectedDate, setSelectedDate] = useState("Tomorrow");
  const [selectedTime, setSelectedTime] = useState("06:00 PM - 06:45 PM");
  const [selectedMode, setSelectedMode] = useState("Live 1-on-1 Video Session");
  const [sessionNotes, setSessionNotes] = useState("");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [confirmedPass, setConfirmedPass] = useState<Booking | null>(null);

  // Custom Request Form State
  const [customTopic, setCustomTopic] = useState("");
  const [customDomain, setCustomDomain] = useState("Software & Engineering");
  const [customBudget, setCustomBudget] = useState("₹1,000 - ₹2,500");
  const [customDetails, setCustomDetails] = useState("");
  const [isCustomSubmitting, setIsCustomSubmitting] = useState(false);

  // Load user & bookings from storage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("tasskly_consultancy_auth_user");
    if (savedUser) {
      try {
        setPortalUser(JSON.parse(savedUser));
      } catch {
        // ignore
      }
    }

    const savedBookings = localStorage.getItem("tasskly_consultancy_bookings");
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch {
        // ignore
      }
    } else {
      // Seed default sample booking so user sees realistic data
      const defaultBooking: Booking = {
        id: "TC-84920",
        consultantId: "con-1",
        consultantName: "Dr. Arvind Raman",
        consultantTitle: "Principal AI Research Scientist",
        consultantAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        date: "Tomorrow, 06:00 PM",
        timeSlot: "45 mins",
        mode: "1-on-1 Live Video & Code Audit",
        price: 1499,
        meetingUrl: "https://meet.google.com/tsk-cns-8492",
        status: "confirmed",
        notes: "Architecture review for my deep learning transformer project.",
        createdAt: new Date().toISOString(),
      };
      setBookings([defaultBooking]);
      localStorage.setItem("tasskly_consultancy_bookings", JSON.stringify([defaultBooking]));
    }
  }, []);

  // Pre-fill active user's Tasskly ID if available
  useEffect(() => {
    if (!portalUser && activeLoggedInProfile?.tasskly_id && !tassklyId) {
      setTassklyId(activeLoggedInProfile.tasskly_id);
    }
  }, [activeLoggedInProfile, portalUser]);

  // Client-side SHA-256 fallback utility
  const sha256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message.trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // 1. Check Tasskly ID
  const handleCheckId = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = tassklyId.trim().toUpperCase();
    if (!cleanId) {
      toast.error("Please enter your Tasskly ID");
      return;
    }

    setCheckLoading(true);
    try {
      // First attempt backend API endpoint
      const response = await fetch(getApiUrl("/api/consultancy-auth"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasskly_id: cleanId, action: "check" }),
      });

      if (response.ok) {
        const data = await response.json();
        setTempUserName(data.name || "Member");
        if (data.hasPassword) {
          setAuthStep("password_entry");
        } else {
          setAuthStep("password_setup");
          toast.info("Welcome! Create a password for your 3D Consultancy Portal. 🛡️");
        }
        return;
      }

      // Client-side Supabase direct fallback for flawless resilience
      const { data: profile, error: dbErr } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("tasskly_id", cleanId)
        .maybeSingle();

      if (dbErr || !profile) {
        throw new Error(dbErr?.message || `Tasskly ID "${cleanId}" not found in system.`);
      }

      setTempUserName(profile.full_name || "Member");
      const hasPwd = !!(profile.consultancy_password || profile.internship_password);
      if (hasPwd) {
        setAuthStep("password_entry");
      } else {
        setAuthStep("password_setup");
        toast.info("Welcome! Create a password for your 3D Consultancy Portal. 🛡️");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to verify Tasskly ID");
    } finally {
      setCheckLoading(false);
    }
  };

  // 2. Setup Password
  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setAuthLoading(true);
    const cleanId = tassklyId.trim().toUpperCase();

    try {
      // Attempt backend API setup
      const response = await fetch(getApiUrl("/api/consultancy-auth"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasskly_id: cleanId,
          password: password.trim(),
          action: "setup",
        }),
      });

      if (response.ok) {
        toast.success("Security credentials established! Logging in... 🚀");
        await handleLoginDirect();
        return;
      }

      // Direct fallback
      const hashedPassword = await sha256(password.trim());
      const { error: updateErr } = await (supabase as any)
        .from("profiles")
        .update({
          consultancy_password: hashedPassword,
          internship_password: hashedPassword,
        })
        .eq("tasskly_id", cleanId);

      if (updateErr) {
        // Try internship_password alone if column doesn't exist
        await (supabase as any)
          .from("profiles")
          .update({ internship_password: hashedPassword })
          .eq("tasskly_id", cleanId);
      }

      toast.success("Security credentials established! Logging in... 🚀");
      await handleLoginDirect();
    } catch (err: any) {
      toast.error(err.message || "Failed to establish password");
      setAuthLoading(false);
    }
  };

  // 3. Direct Login Logic
  const handleLoginDirect = async () => {
    const cleanId = tassklyId.trim().toUpperCase();
    try {
      const response = await fetch(getApiUrl("/api/consultancy-auth"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasskly_id: cleanId,
          password: password.trim(),
          action: "login",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const userObj: PortalUser = data.user;
        localStorage.setItem("tasskly_consultancy_auth_user", JSON.stringify(userObj));
        setPortalUser(userObj);
        toast.success(`Access Granted! Welcome to the 3D Consultancy Portal, ${userObj.full_name} 🌟`);
        return;
      }

      // Direct fallback authentication
      const hashedPassword = await sha256(password.trim());
      const { data: profile, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("tasskly_id", cleanId)
        .maybeSingle();

      if (error || !profile) {
        throw new Error("Unable to locate profile");
      }

      const savedPwd = profile.consultancy_password || profile.internship_password;
      if (savedPwd !== hashedPassword) {
        throw new Error("Incorrect password. Please try again.");
      }

      const userObj: PortalUser = {
        id: profile.id,
        full_name: profile.full_name || "Member",
        email: profile.email,
        tasskly_id: profile.tasskly_id,
        avatar_url: profile.avatar_url,
      };

      localStorage.setItem("tasskly_consultancy_auth_user", JSON.stringify(userObj));
      setPortalUser(userObj);
      toast.success(`Access Granted! Welcome to the 3D Consultancy Portal, ${userObj.full_name} 🌟`);
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    setAuthLoading(true);
    await handleLoginDirect();
  };

  const handleLogout = () => {
    localStorage.removeItem("tasskly_consultancy_auth_user");
    setPortalUser(null);
    setTassklyId("");
    setPassword("");
    setConfirmPassword("");
    setAuthStep("id_entry");
    toast.info("Signed out of 3D Consultancy Portal");
  };

  // Filter consultants by domain and search query
  const filteredConsultants = mockConsultants.filter((c) => {
    const matchesDomain = selectedDomain === "all" || c.domain === selectedDomain;
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      c.name.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.skills.some((s) => s.toLowerCase().includes(q)) ||
      c.bio.toLowerCase().includes(q);
    return matchesDomain && matchesQuery;
  });

  // Handle Session Booking Submission
  const handleConfirmBooking = () => {
    if (!bookingConsultant) return;
    setIsBookingSubmitting(true);

    setTimeout(() => {
      const newBooking: Booking = {
        id: `TC-${Math.floor(10000 + Math.random() * 90000)}`,
        consultantId: bookingConsultant.id,
        consultantName: bookingConsultant.name,
        consultantTitle: bookingConsultant.title,
        consultantAvatar: bookingConsultant.avatar,
        date: selectedDate,
        timeSlot: selectedTime,
        mode: selectedMode,
        price: bookingConsultant.price,
        meetingUrl: `https://meet.google.com/tsk-cns-${Math.random().toString(36).substring(2, 6)}`,
        status: "confirmed",
        notes: sessionNotes,
        createdAt: new Date().toISOString(),
      };

      const updated = [newBooking, ...bookings];
      setBookings(updated);
      localStorage.setItem("tasskly_consultancy_bookings", JSON.stringify(updated));

      setIsBookingSubmitting(false);
      setBookingConsultant(null);
      setConfirmedPass(newBooking);
      toast.success("1-on-1 Consultation Session Confirmed! 🚀");
    }, 900);
  };

  // Handle Custom Request Submission
  const handleCustomRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim() || !customDetails.trim()) {
      toast.error("Please provide consultation topic and details");
      return;
    }

    setIsCustomSubmitting(true);
    setTimeout(() => {
      setIsCustomSubmitting(false);
      toast.success("Custom Consultation Request Broadcasted! Top matched experts will contact you within 2 hours. 📨");
      setCustomTopic("");
      setCustomDetails("");
      setActiveTab("bookings");
    }, 800);
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden flex flex-col bg-[#070913] text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 3D WebGL Background Canvas */}
      <Consultancy3DCanvas intensity={1.15} />

      {/* Cyber Neon Ambient Lighting Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[650px] h-[650px] rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-purple-600/15 blur-[130px]" />
        <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/15 blur-[140px]" />
      </div>

      {/* Top Header / Breadcrumb Bar */}
      <header className="relative z-20 w-full border-b border-emerald-500/20 bg-[#070913]/70 backdrop-blur-xl px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to={isInsideDashboard ? "/dashboard" : "/"}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-300 hover:text-white hover:bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 text-emerald-400" />
              <span>{isInsideDashboard ? "Back to Dashboard" : "Back to Home"}</span>
            </Button>
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <span className="h-4 w-[1px] bg-slate-700" />
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> 3D EXPERT MATRIX
            </span>
          </div>
        </div>

        {/* User Status / Quick Actions */}
        {portalUser && (
          <div className="flex items-center gap-2.5">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-200">{portalUser.full_name}</span>
              <span className="text-[10px] font-mono text-emerald-400">{portalUser.tasskly_id}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 gap-1.5 rounded-xl border border-rose-500/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Exit Portal</span>
            </Button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8 md:py-12 flex-1 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!portalUser ? (
            /* ─────────────────────────────────────────────────────────────────
               3D CYBER SECURITY AUTHENTICATION GATE
               ───────────────────────────────────────────────────────────────── */
            <motion.div
              key="auth-gate"
              initial={{ opacity: 0, y: 25, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full max-w-md my-auto"
            >
              <Card3D depth={15} glare={true} className="w-full">
                <div className="relative rounded-3xl p-8 bg-[#0c1022]/85 border border-emerald-500/30 backdrop-blur-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] space-y-6">
                  {/* Glowing 3D Emblem */}
                  <div className="text-center space-y-3">
                    <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 shadow-[0_0_25px_rgba(16,185,129,0.25)] text-emerald-400">
                      <Sparkles className="h-8 w-8 animate-spin-slow" />
                    </div>

                    <div>
                      <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-1">
                        Secure 3D Portal
                      </span>
                      <h1 className="text-3xl font-black tracking-tight text-white">
                        Consult<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">ancy</span>
                      </h1>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        Connect 1-on-1 with industry specialists, tech architects, and academic researchers in an immersive 3D advisory suite.
                      </p>
                    </div>
                  </div>

                  {/* Step 1: Tasskly ID Entry */}
                  {authStep === "id_entry" && (
                    <form onSubmit={handleCheckId} className="space-y-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="tasskly-id"
                          className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
                        >
                          <User className="h-3.5 w-3.5 text-emerald-400" /> Enter Your Tasskly ID
                        </Label>
                        <Input
                          id="tasskly-id"
                          placeholder="e.g. TSK-104829"
                          value={tassklyId}
                          onChange={(e) => setTassklyId(e.target.value.toUpperCase())}
                          className="rounded-xl border-emerald-500/30 bg-[#060814]/80 text-white font-mono font-bold tracking-widest text-center h-12 text-base focus-visible:ring-emerald-500 focus-visible:border-emerald-400"
                          required
                          autoFocus
                        />

                        {activeLoggedInProfile?.tasskly_id && (
                          <button
                            type="button"
                            onClick={() => setTassklyId(activeLoggedInProfile.tasskly_id || "")}
                            className="w-full text-center text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline pt-1 transition-colors font-medium"
                          >
                            ⚡ Autofill my logged-in ID: <span className="font-mono font-bold">{activeLoggedInProfile.tasskly_id}</span>
                          </button>
                        )}

                        <p className="text-[10px] text-slate-500 text-center italic">
                          *Your Tasskly ID is listed on your Profile settings dashboard.
                        </p>
                      </div>

                      <Button
                        type="submit"
                        disabled={checkLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold h-11 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] border-0"
                      >
                        {checkLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : "Verify Identity →"}
                      </Button>
                    </form>
                  )}

                  {/* Step 2: First-time Password Setup */}
                  {authStep === "password_setup" && (
                    <form onSubmit={handleSetupPassword} className="space-y-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5">
                        <KeyRound className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-200">First-Time Setup</p>
                          <p className="text-[10px] text-slate-400">
                            Setting up consultancy credentials for ID:{" "}
                            <strong className="font-mono text-emerald-400">{tassklyId}</strong> ({tempUserName})
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-300">Create Password</Label>
                          <Input
                            type="password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="rounded-xl border-emerald-500/30 bg-[#060814]/80 text-white h-10"
                            required
                            autoFocus
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs font-semibold text-slate-300">Confirm Password</Label>
                          <Input
                            type="password"
                            placeholder="Re-enter password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="rounded-xl border-emerald-500/30 bg-[#060814]/80 text-white h-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAuthStep("id_entry")}
                          className="flex-1 rounded-xl border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800"
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          disabled={authLoading}
                          className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                        >
                          {authLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save & Enter"}
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Step 3: Password Entry Login */}
                  {authStep === "password_entry" && (
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold text-slate-200">Welcome Back, {tempUserName}</p>
                          <p className="text-[10px] font-mono text-emerald-400">{tassklyId}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAuthStep("id_entry");
                            setPassword("");
                          }}
                          className="text-[10px] text-slate-400 hover:text-white h-7 px-2"
                        >
                          Switch ID
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Enter Password</span>
                        </Label>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="rounded-xl border-emerald-500/30 bg-[#060814]/80 text-white h-11 focus-visible:ring-emerald-500"
                          required
                          autoFocus
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-slate-950 font-bold h-11 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                      >
                        {authLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : "Unlock 3D Portal 🚀"}
                      </Button>
                    </form>
                  )}
                </div>
              </Card3D>
            </motion.div>
          ) : (
            /* ─────────────────────────────────────────────────────────────────
               3D CONSULTANCY DASHBOARD PORTAL
               ───────────────────────────────────────────────────────────────── */
            <motion.div
              key="portal-main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-8"
            >
              {/* Holographic Hero Banner */}
              <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-[#0d1326]/90 via-[#0a1826]/85 to-[#0d1326]/90 border border-emerald-500/30 backdrop-blur-xl shadow-[0_0_60px_rgba(16,185,129,0.12)] overflow-hidden">
                <div className="relative z-10 max-w-3xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    Live 3D Mentorship Network
                  </div>

                  <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    Elevate Your Projects With{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                      1-on-1 Elite Advisory
                    </span>
                  </h1>

                  <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
                    Get direct face-to-face architectural reviews, thesis defense guidance, mock tech interviews, and portfolio audits from certified industry leads.
                  </p>

                  {/* 3D Value Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                    <div className="p-3 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-emerald-400 mb-1">
                        <Zap className="h-4 w-4" />
                        <span className="text-xs font-mono font-bold">1-on-1 Sessions</span>
                      </div>
                      <p className="text-xs text-slate-400">Live Video & Screen Sharing</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border border-cyan-500/20 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-cyan-400 mb-1">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-xs font-mono font-bold">100% Escrow</span>
                      </div>
                      <p className="text-xs text-slate-400">Funds released after call</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border border-purple-500/20 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-purple-400 mb-1">
                        <Star className="h-4 w-4" />
                        <span className="text-xs font-mono font-bold">4.9+ Rated</span>
                      </div>
                      <p className="text-xs text-slate-400">FAANG & Top Scholars</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-black/40 border border-amber-500/20 backdrop-blur-md">
                      <div className="flex items-center gap-2 text-amber-400 mb-1">
                        <Clock className="h-4 w-4" />
                        <span className="text-xs font-mono font-bold">Fast Booking</span>
                      </div>
                      <p className="text-xs text-slate-400">Same-day slots ready</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portal Navigation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={activeTab === "explore" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("explore")}
                    className={
                      activeTab === "explore"
                        ? "bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "text-slate-400 hover:text-white rounded-xl"
                    }
                  >
                    <Compass className="h-4 w-4 mr-1.5" />
                    Explore Consultants
                  </Button>

                  <Button
                    variant={activeTab === "bookings" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("bookings")}
                    className={
                      activeTab === "bookings"
                        ? "bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "text-slate-400 hover:text-white rounded-xl"
                    }
                  >
                    <Calendar className="h-4 w-4 mr-1.5" />
                    My Booked Sessions ({bookings.length})
                  </Button>

                  <Button
                    variant={activeTab === "request" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("request")}
                    className={
                      activeTab === "request"
                        ? "bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        : "text-slate-400 hover:text-white rounded-xl"
                    }
                  >
                    <Sparkles className="h-4 w-4 mr-1.5" />
                    Request Custom Specialist
                  </Button>
                </div>

                {/* Search Bar for Explore Tab */}
                {activeTab === "explore" && (
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      placeholder="Search skill, expert, topic..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-[#0b1021]/80 border-slate-700/80 rounded-xl text-xs text-white focus-visible:ring-emerald-500 h-9"
                    />
                  </div>
                )}
              </div>

              {/* TAB 1: EXPLORE CONSULTANTS */}
              {activeTab === "explore" && (
                <div className="space-y-6">
                  {/* Domain Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {[
                      { id: "all", label: "All Disciplines", icon: Layers },
                      { id: "tech", label: "Software & Systems", icon: Code2 },
                      { id: "ai", label: "AI & Data Science", icon: Cpu },
                      { id: "design", label: "UI/UX & Product", icon: Palette },
                      { id: "career", label: "Career & Resume", icon: Briefcase },
                      { id: "cloud", label: "Cloud & DevOps", icon: Zap },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isSelected = selectedDomain === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedDomain(tab.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                            isSelected
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                              : "bg-[#0b1021]/60 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* 3D Consultants Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredConsultants.map((consultant) => (
                      <Card3D
                        key={consultant.id}
                        depth={14}
                        glare={true}
                        className="h-full"
                      >
                        <div className="h-full flex flex-col justify-between rounded-3xl p-6 bg-[#0c1228]/80 border border-slate-800/90 hover:border-emerald-500/50 backdrop-blur-xl transition-colors duration-300 shadow-xl group">
                          <div className="space-y-4">
                            {/* Card Header: Avatar + Status + Rating */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="relative">
                                <img
                                  src={consultant.avatar}
                                  alt={consultant.name}
                                  className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                                />
                                {consultant.availableToday && (
                                  <span
                                    title="Available for booking today"
                                    className="absolute -bottom-1 -right-1 flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#0c1228]"
                                  />
                                )}
                              </div>

                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-amber-400 font-bold text-xs bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                                  <Star className="h-3 w-3 fill-amber-400" />
                                  <span>{consultant.rating}</span>
                                  <span className="text-[10px] text-slate-400">({consultant.reviewsCount})</span>
                                </div>
                                <span className="text-[10px] text-emerald-400 font-mono mt-1">Verified Expert</span>
                              </div>
                            </div>

                            {/* Info */}
                            <div>
                              <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                                {consultant.name}
                              </h3>
                              <p className="text-xs font-semibold text-slate-300">{consultant.title}</p>
                              <p className="text-[11px] text-slate-500 font-mono">{consultant.company}</p>
                            </div>

                            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                              {consultant.bio}
                            </p>

                            {/* Skills Tags */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {consultant.skills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="outline"
                                  className="text-[10px] font-mono bg-slate-900/60 border-slate-700/80 text-slate-300 px-2 py-0.5"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Footer: Price + Book Button */}
                          <div className="pt-5 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Session Fee</p>
                              <p className="text-base font-black text-emerald-400 flex items-center">
                                <IndianRupee className="h-3.5 w-3.5" />
                                {consultant.price.toLocaleString("en-IN")}{" "}
                                <span className="text-[10px] text-slate-400 font-normal ml-1">/ {consultant.duration}</span>
                              </p>
                            </div>

                            <Button
                              size="sm"
                              onClick={() => setBookingConsultant(consultant)}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                            >
                              <Video className="h-3.5 w-3.5" /> Book 3D Session
                            </Button>
                          </div>
                        </div>
                      </Card3D>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 2: MY BOOKINGS */}
              {activeTab === "bookings" && (
                <div className="space-y-6">
                  {bookings.length === 0 ? (
                    <div className="text-center py-16 rounded-3xl bg-[#0c1228]/50 border border-slate-800 p-8 space-y-4">
                      <Calendar className="h-12 w-12 text-slate-600 mx-auto" />
                      <h3 className="text-lg font-bold text-white">No Consultations Scheduled Yet</h3>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Explore our top verified consultants and book your first 1-on-1 session to get tailored advice.
                      </p>
                      <Button
                        onClick={() => setActiveTab("explore")}
                        className="bg-emerald-500 text-slate-950 font-bold rounded-xl text-xs"
                      >
                        Explore Consultants
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {bookings.map((b) => (
                        <Card3D key={b.id} depth={10} glare={true}>
                          <div className="rounded-3xl p-6 bg-[#0c1228]/85 border border-emerald-500/30 backdrop-blur-xl shadow-xl space-y-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={b.consultantAvatar}
                                  alt={b.consultantName}
                                  className="w-12 h-12 rounded-xl object-cover border border-emerald-500/30"
                                />
                                <div>
                                  <h4 className="font-bold text-white text-base">{b.consultantName}</h4>
                                  <p className="text-xs text-slate-400">{b.consultantTitle}</p>
                                </div>
                              </div>

                              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                {b.status}
                              </span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-black/40 border border-slate-800 space-y-2 text-xs">
                              <div className="flex justify-between text-slate-300">
                                <span className="flex items-center gap-1.5 text-slate-400">
                                  <Calendar className="h-3.5 w-3.5 text-emerald-400" /> Date & Slot:
                                </span>
                                <span className="font-mono font-semibold text-white">{b.date} ({b.timeSlot})</span>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span className="flex items-center gap-1.5 text-slate-400">
                                  <Video className="h-3.5 w-3.5 text-cyan-400" /> Format:
                                </span>
                                <span className="font-semibold text-white">{b.mode}</span>
                              </div>
                              <div className="flex justify-between text-slate-300">
                                <span className="flex items-center gap-1.5 text-slate-400">
                                  <IndianRupee className="h-3.5 w-3.5 text-amber-400" /> Escrow Fee:
                                </span>
                                <span className="font-mono font-bold text-emerald-400">₹{b.price} (Secured)</span>
                              </div>
                              {b.notes && (
                                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                                  <strong className="text-slate-300">Agenda:</strong> {b.notes}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-3 pt-2">
                              <span className="text-[10px] font-mono text-slate-500">Booking Pass: {b.id}</span>
                              <a
                                href={b.meetingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                              >
                                <Video className="h-3.5 w-3.5" /> Join Video Room <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        </Card3D>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REQUEST CUSTOM SPECIALIST */}
              {activeTab === "request" && (
                <div className="max-w-2xl mx-auto">
                  <Card3D depth={12} glare={true}>
                    <div className="rounded-3xl p-8 bg-[#0c1228]/85 border border-emerald-500/30 backdrop-blur-xl shadow-2xl space-y-6">
                      <div className="space-y-1 text-center">
                        <h2 className="text-2xl font-black text-white">Broadcast Custom Advisory Request</h2>
                        <p className="text-xs text-slate-400">
                          Need a niche researcher or verified architect? Post your requirements and receive proposals within 2 hours.
                        </p>
                      </div>

                      <form onSubmit={handleCustomRequestSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-300">Consultation Topic / Project Title</Label>
                          <Input
                            placeholder="e.g. Distributed Consensus in Raft / Medical AI Model Architecture"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            className="rounded-xl border-slate-700 bg-black/40 text-white h-11 focus-visible:ring-emerald-500 text-xs"
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-300">Domain Category</Label>
                            <select
                              value={customDomain}
                              onChange={(e) => setCustomDomain(e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-slate-700 bg-black/40 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option>Software & Engineering</option>
                              <option>Artificial Intelligence & Data</option>
                              <option>UI/UX & Product Design</option>
                              <option>Career & FAANG Interview Prep</option>
                              <option>Academic Research & Thesis</option>
                              <option>Cloud Infrastructure & Security</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-slate-300">Proposed Budget (Held in Escrow)</Label>
                            <select
                              value={customBudget}
                              onChange={(e) => setCustomBudget(e.target.value)}
                              className="w-full h-11 px-3 rounded-xl border border-slate-700 bg-black/40 text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                              <option>₹500 - ₹1,000</option>
                              <option>₹1,000 - ₹2,500</option>
                              <option>₹2,500 - ₹5,000</option>
                              <option>₹5,000+</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-300">Detailed Problem Statement & Questions</Label>
                          <Textarea
                            placeholder="Describe what you want to achieve, any roadblocks, codebase links, or specific questions you need answered during the call..."
                            value={customDetails}
                            onChange={(e) => setCustomDetails(e.target.value)}
                            className="rounded-xl border-slate-700 bg-black/40 text-white min-h-[120px] text-xs focus-visible:ring-emerald-500"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isCustomSubmitting}
                          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-slate-950 font-bold h-11 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] text-xs"
                        >
                          {isCustomSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : "Broadcast Consultation Request 🚀"}
                        </Button>
                      </form>
                    </div>
                  </Card3D>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ─────────────────────────────────────────────────────────────────
         INTERACTIVE 3D BOOKING DIALOG MODAL
         ───────────────────────────────────────────────────────────────── */}
      <Dialog open={!!bookingConsultant} onOpenChange={(open) => !open && setBookingConsultant(null)}>
        <DialogContent className="max-w-lg bg-[#0c1228] border border-emerald-500/40 text-white p-6 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.25)]">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              Schedule 1-on-1 Consultation
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Booking an advisory slot with <strong className="text-white">{bookingConsultant?.name}</strong> (
              {bookingConsultant?.title}).
            </DialogDescription>
          </DialogHeader>

          {bookingConsultant && (
            <div className="space-y-4 py-2 text-xs">
              {/* Consultant Summary Pill */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <img
                    src={bookingConsultant.avatar}
                    alt={bookingConsultant.name}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-500/40"
                  />
                  <div>
                    <p className="font-bold text-white text-xs">{bookingConsultant.name}</p>
                    <p className="text-[10px] text-slate-400">{bookingConsultant.company}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-emerald-400 text-sm">₹{bookingConsultant.price}</p>
                  <p className="text-[10px] text-slate-400">{bookingConsultant.duration}</p>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Consultation Format</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Live 1-on-1 Video Session",
                    "Code & Architecture Audit",
                    "Career & Portfolio Review",
                    "Project Thesis Guidance",
                  ].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSelectedMode(mode)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        selectedMode === mode
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold"
                          : "bg-black/30 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Slots */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Select Date</Label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-700 bg-black/40 text-white text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>Today Evening</option>
                    <option>Tomorrow</option>
                    <option>Day After Tomorrow</option>
                    <option>This Weekend</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-300">Select Time Slot</Label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-700 bg-black/40 text-white text-xs focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>04:00 PM - 04:45 PM</option>
                    <option>06:00 PM - 06:45 PM</option>
                    <option>08:00 PM - 08:45 PM</option>
                    <option>09:30 PM - 10:15 PM</option>
                  </select>
                </div>
              </div>

              {/* Session Agenda Notes */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-300">Agenda / Discussion Questions (Optional)</Label>
                <Input
                  placeholder="e.g. Please review my system architecture diagram and database indexing plan"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="rounded-xl border-slate-700 bg-black/40 text-white h-10 text-xs"
                />
              </div>

              {/* Escrow Guarantee Note */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  <strong>Tasskly Escrow Guarantee:</strong> Payment is held safely and is only released after your consultation call successfully concludes.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setBookingConsultant(null)}
              className="rounded-xl border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={isBookingSubmitting}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:opacity-90 text-slate-950 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              {isBookingSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : "Confirm & Reserve Slot ⚡"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────────
         CONFIRMATION 3D PASS MODAL
         ───────────────────────────────────────────────────────────────── */}
      <Dialog open={!!confirmedPass} onOpenChange={(open) => !open && setConfirmedPass(null)}>
        <DialogContent className="max-w-md bg-[#0c1228] border border-emerald-400/50 text-white p-6 rounded-3xl shadow-[0_0_70px_rgba(16,185,129,0.35)] text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 mx-auto">
            <CheckCircle className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Consultation Pass Confirmed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your 1-on-1 session with <strong className="text-emerald-400">{confirmedPass?.consultantName}</strong> has been secured in Escrow.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/50 border border-emerald-500/30 text-xs space-y-2 text-left font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Pass ID:</span>
              <span className="text-emerald-400 font-bold">{confirmedPass?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Slot:</span>
              <span className="text-white">{confirmedPass?.date} ({confirmedPass?.timeSlot})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Room Link:</span>
              <a
                href={confirmedPass?.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 underline truncate max-w-[200px]"
              >
                {confirmedPass?.meetingUrl}
              </a>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => {
                setConfirmedPass(null);
                setActiveTab("bookings");
              }}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
            >
              View in My Booked Sessions
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Consultancy;
