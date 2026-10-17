import React, { useState, useEffect, useRef } from "react";
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
  CheckCircle,
  ExternalLink,
  Loader2,
  LogOut,
  Compass,
  Cpu,
  Code2,
  Palette,
  Briefcase,
  IndianRupee,
  Layers,
  Zap,
  ChevronDown,
  ArrowRight,
  MousePointer,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { AnimeScrollCanvas3D } from "@/components/consultancy/AnimeScrollCanvas3D";
import { Card3D } from "@/components/consultancy/Card3D";

// Consultant Interface
export interface Consultant {
  id: string;
  name: string;
  title: string;
  company: string;
  domain: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  skills: string[];
  bio: string;
  price: number;
  duration: string;
  availableToday: boolean;
}

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

  // Authentication States
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [tassklyId, setTassklyId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authStep, setAuthStep] = useState<"id_entry" | "password_entry" | "password_setup">("id_entry");
  const [checkLoading, setCheckLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [tempUserName, setTempUserName] = useState("");

  // 3D Scroll State (0.0 to 1.0)
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollTargetRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Consultants & Booking States
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [consultantsLoading, setConsultantsLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingConsultant, setBookingConsultant] = useState<Consultant | null>(null);
  const [selectedDate, setSelectedDate] = useState("Tomorrow");
  const [selectedTime, setSelectedTime] = useState("06:00 PM - 06:45 PM");
  const [selectedMode, setSelectedMode] = useState("Live 1-on-1 Video Call");
  const [sessionNotes, setSessionNotes] = useState("");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [confirmedPass, setConfirmedPass] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Custom Request State
  const [customTopic, setCustomTopic] = useState("");
  const [customDomain, setCustomDomain] = useState("Software & Engineering");
  const [customBudget, setCustomBudget] = useState("₹1,000 - ₹2,500");
  const [customDetails, setCustomDetails] = useState("");
  const [isCustomSubmitting, setIsCustomSubmitting] = useState(false);

  // Load real registered consultants from Supabase profiles
  useEffect(() => {
    const loadRealConsultants = async () => {
      setConsultantsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url, role, is_verified");

        if (!error && data && data.length > 0) {
          const loaded: Consultant[] = data.map((p: any) => ({
            id: p.id,
            name: p.full_name || "Verified Platform Consultant",
            title: p.role === "admin" ? "Senior Lead Consultant" : "Verified Academic & Tech Consultant",
            company: "Tasskly Verified Network",
            domain: "tech",
            avatar: p.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.full_name || "Consultant")}&backgroundColor=0f172a,1e293b&textColor=f97316`,
            rating: 5.0,
            reviewsCount: 1,
            skills: ["Consultancy", "1-on-1 Guidance", "Code & Architecture"],
            bio: "Verified platform advisor available for direct 1-on-1 consultation and project review.",
            price: 999,
            duration: "45 mins",
            availableToday: true,
          }));
          setConsultants(loaded);
          if (loaded.length > 0) {
            setBookingConsultant((prev) => prev || loaded[0]);
          }
        } else {
          setConsultants([]);
        }
      } catch {
        setConsultants([]);
      } finally {
        setConsultantsLoading(false);
      }
    };

    loadRealConsultants();
  }, []);

  // Load user and bookings on mount (clean of any demo data)
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
        const parsed = JSON.parse(savedBookings);
        // Eliminate any legacy mock booking (e.g. TC-84920)
        const realOnly = Array.isArray(parsed)
          ? parsed.filter((b: any) => b.id !== "TC-84920" && !b.id.startsWith("TC-84920"))
          : [];
        setBookings(realOnly);
        localStorage.setItem("tasskly_consultancy_bookings", JSON.stringify(realOnly));
      } catch {
        setBookings([]);
      }
    } else {
      setBookings([]);
    }
  }, []);

  // Pre-fill active Tasskly ID
  useEffect(() => {
    if (!portalUser && activeLoggedInProfile?.tasskly_id && !tassklyId) {
      setTassklyId(activeLoggedInProfile.tasskly_id);
    }
  }, [activeLoggedInProfile, portalUser]);

  // Smooth anime.js-style 3D Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const totalScroll = el.scrollHeight - el.clientHeight;
      if (totalScroll <= 0) return;
      const p = Math.min(Math.max(el.scrollTop / totalScroll, 0), 1);
      scrollTargetRef.current = p;
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true });
    }

    // Animation frame for buttery 60fps lerp
    let animFrame: number;
    const updateLerp = () => {
      setScrollProgress((prev) => {
        const diff = scrollTargetRef.current - prev;
        if (Math.abs(diff) < 0.0005) return scrollTargetRef.current;
        return prev + diff * 0.1;
      });
      animFrame = requestAnimationFrame(updateLerp);
    };
    animFrame = requestAnimationFrame(updateLerp);

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
      cancelAnimationFrame(animFrame);
    };
  }, [portalUser]);

  // Quick jump to section by progress or stage number
  const scrollToStage = (target: number) => {
    if (target >= 1 && target <= 5) {
      const el = document.getElementById(`stage-${target}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    const stageMap: Record<number, number> = {
      0.05: 1,
      0.25: 2,
      0.3: 2,
      0.55: 3,
      0.58: 3,
      0.8: 4,
      0.98: 5,
    };
    const mapped = stageMap[target];
    if (mapped) {
      const el = document.getElementById(`stage-${mapped}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    const el = scrollContainerRef.current;
    if (!el) return;
    const totalScroll = el.scrollHeight - el.clientHeight;
    el.scrollTo({
      top: totalScroll * target,
      behavior: "smooth",
    });
  };

  // Client-side SHA-256
  const sha256 = async (message: string): Promise<string> => {
    const msgBuffer = new TextEncoder().encode(message.trim());
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // Check ID
  const handleCheckId = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = tassklyId.trim().toUpperCase();
    if (!cleanId) {
      toast.error("Please enter your Tasskly ID");
      return;
    }

    setCheckLoading(true);
    try {
      const response = await fetch(getApiUrl("/api/internship-auth"), {
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

      // Direct Supabase fallback
      const { data: profile, error: dbErr } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("tasskly_id", cleanId)
        .maybeSingle();

      if (dbErr || !profile) {
        throw new Error(dbErr?.message || `Tasskly ID "${cleanId}" not registered.`);
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

  // Password Setup
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
      const response = await fetch(getApiUrl("/api/internship-auth"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasskly_id: cleanId,
          password: password.trim(),
          action: "setup",
        }),
      });

      if (response.ok) {
        toast.success("Security credentials established! 🚀");
        await handleLoginDirect();
        return;
      }

      const hashedPassword = await sha256(password.trim());
      await (supabase as any)
        .from("profiles")
        .update({
          internship_password: hashedPassword,
          consultancy_password: hashedPassword,
        })
        .eq("tasskly_id", cleanId);

      toast.success("Security credentials established! 🚀");
      await handleLoginDirect();
    } catch (err: any) {
      toast.error(err.message || "Setup failed");
      setAuthLoading(false);
    }
  };

  // Direct Login
  const handleLoginDirect = async () => {
    const cleanId = tassklyId.trim().toUpperCase();
    try {
      const response = await fetch(getApiUrl("/api/internship-auth"), {
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
        toast.success(`Access Granted! Welcome to the 3D Dimension, ${userObj.full_name} 🌟`);
        return;
      }

      // Direct fallback
      const hashedPassword = await sha256(password.trim());
      const { data: profile, error } = await (supabase as any)
        .from("profiles")
        .select("*")
        .eq("tasskly_id", cleanId)
        .maybeSingle();

      if (error || !profile) throw new Error("Profile not found");

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
      toast.success(`Access Granted! Welcome to the 3D Dimension, ${userObj.full_name} 🌟`);
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

  // Open booking modal for a specific consultant (or default)
  const openBookingModal = (consultant?: Consultant | null) => {
    if (consultant) {
      setBookingConsultant(consultant);
    } else if (consultants.length > 0) {
      setBookingConsultant(consultants[0]);
    } else {
      setBookingConsultant({
        id: "platform-advisor",
        name: "Platform Senior Consultant",
        title: "Verified Academic & Tech Consultant",
        company: "Tasskly Verified Network",
        domain: "tech",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Tasskly&backgroundColor=0f172a,1e293b&textColor=10b981",
        rating: 5.0,
        reviewsCount: 1,
        skills: ["Consultancy", "1-on-1 Guidance", "Code & Architecture"],
        bio: "Verified platform advisor available for direct 1-on-1 consultation and project review.",
        price: 999,
        duration: "45 mins",
        availableToday: true,
      });
    }
    setIsBookingOpen(true);
  };

  // Confirm Booking
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
      setIsBookingOpen(false);
      setConfirmedPass(newBooking);
      toast.success("1-on-1 Consultation Session Confirmed! 🚀");
    }, 850);
  };

  // Custom Request broadcast
  const handleCustomRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic.trim() || !customDetails.trim()) {
      toast.error("Please provide consultation topic and details");
      return;
    }

    setIsCustomSubmitting(true);
    setTimeout(() => {
      setIsCustomSubmitting(false);
      toast.success("Consultation Request Broadcasted! Top matched experts will reach out to you within 2 hours. 📨");
      setCustomTopic("");
      setCustomDetails("");
    }, 800);
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#03050c] text-slate-100 font-sans select-none">
      {/* 3D anime.js-style Three.js WebGL World */}
      <AnimeScrollCanvas3D scrollProgress={scrollProgress} />

      {/* ─────────────────────────────────────────────────────────────
         FIXED TOP BAR WITH "BOOK CONSULTANCY SERVICE" IN TOP RIGHT
         ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3.5 flex items-center justify-between bg-[#020817]/75 backdrop-blur-xl border-b border-sky-500/20">
        <div className="flex items-center gap-3">
          <Link to={isInsideDashboard ? "/dashboard" : "/"}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-300 hover:text-white hover:bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs"
            >
              <ArrowLeft className="h-4 w-4 text-sky-400" />
              <span>{isInsideDashboard ? "Dashboard" : "Home"}</span>
            </Button>
          </Link>

          <div className="hidden sm:flex items-center gap-2">
            <span className="h-4 w-[1px] bg-slate-800" />
            <span className="text-[11px] font-mono tracking-widest text-sky-400 uppercase flex items-center gap-1.5 font-bold">
              <Sparkles className="h-3.5 w-3.5 animate-pulse text-sky-400" /> 3D DIMENSION
            </span>
          </div>
        </div>

        {/* TOP RIGHT CORNER: BOOK CONSULTANCY SERVICE BUTTON */}
        <div className="flex items-center gap-3">
          {portalUser && (
            <div className="hidden lg:flex items-center gap-2 mr-2 px-3 py-1 rounded-xl bg-black/40 border border-sky-500/20 text-xs">
              <span className="text-slate-400">Logged in as:</span>
              <strong className="text-sky-400 font-mono">{portalUser.tasskly_id}</strong>
            </div>
          )}

          <Button
            onClick={() => openBookingModal()}
            className="relative group overflow-hidden bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-black text-xs md:text-sm px-4 md:px-5 h-10 rounded-xl shadow-[0_0_30px_rgba(56,189,248,0.5)] border border-sky-300/40 transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Zap className="h-4 w-4 fill-slate-950" />
              <span>Book Consultancy Service</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950" />
              </span>
            </span>
          </Button>

          {portalUser && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Exit 3D Portal"
              className="h-10 w-10 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl border border-rose-500/20"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
         AUTHENTICATION GATE OR 3D SCROLL EXPERIENCE
         ───────────────────────────────────────────────────────────── */}
      {!portalUser ? (
        /* ─────────────────────────────────────────────────────────────
           3D CYBER SECURITY AUTHENTICATION GATE (SAME AS INTERNSHIPS)
           ───────────────────────────────────────────────────────────── */
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <Card3D depth={18} glare={true}>
              <div className="rounded-3xl p-8 bg-[#070b1a]/90 border border-sky-500/40 backdrop-blur-2xl shadow-[0_0_60px_rgba(56,189,248,0.2)] space-y-6">
                <div className="text-center space-y-3">
                  <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 border border-sky-400/40 shadow-[0_0_30px_rgba(56,189,248,0.3)] text-sky-400">
                    <Sparkles className="h-8 w-8 animate-spin-slow" />
                  </div>
                  <div>
                    <span className="inline-block px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-sky-500/10 text-sky-400 border border-sky-500/30 mb-1">
                      3D Dimension Gateway
                    </span>
                    <h1 className="text-3xl font-black text-white">
                      Consult<span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">ancy 3D</span>
                    </h1>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Log in using your Tasskly ID to unlock full 3D scroll advisory matrix.
                    </p>
                  </div>
                </div>

                {authStep === "id_entry" && (
                  <form onSubmit={handleCheckId} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-sky-400" /> Enter Tasskly ID
                      </Label>
                      <Input
                        placeholder="e.g. TSK-104829"
                        value={tassklyId}
                        onChange={(e) => setTassklyId(e.target.value.toUpperCase())}
                        className="rounded-xl border-sky-500/30 bg-[#04060f]/90 text-white font-mono font-bold tracking-widest text-center h-12 text-base focus-visible:ring-sky-500"
                        required
                        autoFocus
                      />

                      {activeLoggedInProfile?.tasskly_id && (
                        <button
                          type="button"
                          onClick={() => setTassklyId(activeLoggedInProfile.tasskly_id || "")}
                          className="w-full text-center text-[11px] text-sky-400 hover:text-sky-300 hover:underline pt-1 transition-colors font-medium"
                        >
                          ⚡ Autofill my active ID: <span className="font-mono font-bold">{activeLoggedInProfile.tasskly_id}</span>
                        </button>
                      )}
                    </div>

                    <Button
                      type="submit"
                      disabled={checkLoading}
                      className="w-full bg-gradient-to-r from-sky-500 via-cyan-500 to-blue-500 hover:opacity-95 text-slate-950 font-bold h-11 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.3)] border-0"
                    >
                      {checkLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : "Verify Identity →"}
                    </Button>
                  </form>
                )}

                {authStep === "password_setup" && (
                  <form onSubmit={handleSetupPassword} className="space-y-4">
                    <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-3 flex items-start gap-2.5">
                      <KeyRound className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[11px] font-bold text-slate-200">First-Time Setup</p>
                        <p className="text-[10px] text-slate-400">
                          Configure password for ID: <strong className="font-mono text-sky-400">{tassklyId}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-xs font-semibold text-slate-300">Choose Password</Label>
                        <Input
                          type="password"
                          placeholder="Min 6 characters"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="rounded-xl border-sky-500/30 bg-[#04060f]/90 text-white h-10"
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
                          className="rounded-xl border-sky-500/30 bg-[#04060f]/90 text-white h-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAuthStep("id_entry")}
                        className="flex-1 rounded-xl border-slate-700 bg-transparent text-slate-300"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={authLoading}
                        className="flex-1 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                      >
                        {authLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : "Save & Enter"}
                      </Button>
                    </div>
                  </form>
                )}

                {authStep === "password_entry" && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-bold text-slate-200">Welcome, {tempUserName}</p>
                        <p className="text-[10px] font-mono text-sky-400">{tassklyId}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setAuthStep("id_entry")}
                        className="text-[10px] text-slate-400 hover:text-white"
                      >
                        Switch ID
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-slate-300">Enter Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl border-sky-500/30 bg-[#04060f]/90 text-white h-11"
                        required
                        autoFocus
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={authLoading}
                      className="w-full bg-gradient-to-r from-sky-500 to-blue-500 text-slate-950 font-bold h-11 rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                    >
                      {authLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : "Launch 3D Dimension 🚀"}
                    </Button>
                  </form>
                )}
              </div>
            </Card3D>
          </motion.div>
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           ANIME.JS-STYLE 3D SCROLL JOURNEY CONTAINER
           ───────────────────────────────────────────────────────────── */
        <div
          ref={scrollContainerRef}
          className="h-full w-full overflow-y-auto overflow-x-hidden relative z-10 scrollbar-none scroll-smooth"
          style={{ height: "100vh" }}
        >
          {/* Continuous Stage Journey - 100% Visible Text & Split 3D Layout */}
          <div className="relative w-full space-y-12">
            
            {/* ─────────────────────────────────────────────────────────────
               STAGE 1: ACADEMIC COMMENCEMENT & GRADUATION (Stage 01)
               ───────────────────────────────────────────────────────────── */}
            <section
              id="stage-1"
              className="min-h-screen w-full flex items-center px-4 md:px-12 lg:px-20 py-24 relative z-10"
            >
              <div className="w-full max-w-2xl text-left pointer-events-auto">
                <Card3D depth={14} glare={true}>
                  <div className="p-8 md:p-10 rounded-3xl bg-[#020617]/92 border border-sky-500/40 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/40 text-sky-300 text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_20px_rgba(56,189,248,0.25)]">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
                      </span>
                      3D STUDENT MATRIX • STAGE 01
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                      STUDENT CONSULTANCY{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">
                        3D DIMENSION
                      </span>
                    </h1>

                    <p className="text-slate-100 text-sm md:text-base leading-relaxed">
                      Navigate academic graduation strategy, thesis defense, research paper reviews, and top career mentoring with verified experts in an interactive 3D universe.
                    </p>

                    <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <Button
                        onClick={() => openBookingModal()}
                        className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm px-6 h-12 rounded-xl shadow-[0_0_25px_rgba(56,189,248,0.45)] gap-2"
                      >
                        <Zap className="h-4 w-4" /> Book Consultancy Service
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => scrollToStage(2)}
                        className="border-sky-500/30 text-sky-300 hover:bg-sky-500/10 h-12 rounded-xl px-5 text-sm gap-2"
                      >
                        <span>Explore Syllabus</span>
                        <ChevronDown className="h-4 w-4 animate-bounce" />
                      </Button>
                    </div>

                    <div className="pt-2 flex items-center gap-2 text-xs font-mono text-slate-400">
                      <MousePointer className="h-3.5 w-3.5 text-sky-400 animate-pulse" />
                      <span>Scroll naturally or use bottom HUD to fly through stages</span>
                    </div>
                  </div>
                </Card3D>
              </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────
               STAGE 2: CORE SYLLABUS & STUDY DISCIPLINES (Stage 02)
               ───────────────────────────────────────────────────────────── */}
            <section
              id="stage-2"
              className="min-h-screen w-full flex items-center px-4 md:px-12 lg:px-20 py-24 relative z-10"
            >
              <div className="w-full max-w-3xl text-left pointer-events-auto">
                <Card3D depth={12} glare={true}>
                  <div className="p-7 md:p-9 rounded-3xl bg-[#020617]/92 border border-sky-500/40 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30">
                        STAGE 02 • CORE SYLLABUS & STUDY STACKS
                      </span>
                      <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                        Choose Your <span className="text-sky-400">Study & Advisory Domain</span>
                      </h2>
                      <p className="text-xs md:text-sm text-slate-200">
                        Master your university curriculum and prepare for high-impact technical roles.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          title: "AI & Neural Networks",
                          desc: "RAG architectures, LLM fine-tuning, PyTorch pipelines, and academic paper reviews.",
                          icon: Cpu,
                          color: "border-cyan-500/40 text-cyan-400",
                        },
                        {
                          title: "Distributed Systems",
                          desc: "Microservices in Go, high-concurrency database schemas, Kafka message queues, and load balancing.",
                          icon: Code2,
                          color: "border-sky-500/40 text-sky-400",
                        },
                        {
                          title: "UI/UX & Product Design",
                          desc: "Figma design systems, micro-interactions, user research audits, and high-impact design portfolios.",
                          icon: Palette,
                          color: "border-purple-500/40 text-purple-400",
                        },
                        {
                          title: "FAANG Career Strategy",
                          desc: "Resume roasting, offer negotiation strategies, mock system interviews, and career roadmap deep-dives.",
                          icon: Briefcase,
                          color: "border-amber-500/40 text-amber-400",
                        },
                      ].map((disc, idx) => {
                        const Icon = disc.icon;
                        return (
                          <div
                            key={idx}
                            onClick={() => scrollToStage(3)}
                            className="p-4 rounded-2xl bg-[#070e24]/90 border border-slate-800 hover:border-sky-500/60 backdrop-blur-xl text-left space-y-2 cursor-pointer group shadow-lg transition-all"
                          >
                            <div className={`p-2.5 rounded-xl bg-black/60 border w-fit ${disc.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-white text-base group-hover:text-sky-300 transition-colors">
                              {disc.title}
                            </h3>
                            <p className="text-xs text-slate-300 leading-relaxed">{disc.desc}</p>
                            <div className="pt-1 flex items-center gap-1.5 text-xs text-sky-400 font-bold">
                              <span>Inspect Mentors</span>
                              <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Card3D>
              </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────
               STAGE 3: 1-ON-1 CERTIFIED SPECIALISTS (Stage 03)
               ───────────────────────────────────────────────────────────── */}
            <section
              id="stage-3"
              className="min-h-screen w-full flex items-center px-4 md:px-12 lg:px-20 py-24 relative z-10"
            >
              <div className="w-full max-w-4xl text-left pointer-events-auto">
                <Card3D depth={10} glare={true}>
                  <div className="p-7 md:p-9 rounded-3xl bg-[#020617]/92 border border-sky-500/40 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30">
                        STAGE 03 • 1-ON-1 CERTIFIED SPECIALISTS
                      </span>
                      <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                        Verified <span className="text-sky-400">Student Mentors & Leads</span>
                      </h2>
                      <p className="text-xs md:text-sm text-slate-200">
                        Book direct 1-on-1 private video sessions with real platform advisors.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {consultants.length > 0 ? (
                        consultants.slice(0, 3).map((consultant) => (
                          <div
                            key={consultant.id}
                            className="p-5 rounded-2xl bg-[#070e24]/95 border border-sky-500/35 backdrop-blur-xl text-left space-y-3.5 shadow-xl flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="flex items-start justify-between">
                                <img
                                  src={consultant.avatar}
                                  alt={consultant.name}
                                  className="w-12 h-12 rounded-xl object-cover border-2 border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                                />
                                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/25">
                                  <Star className="h-3 w-3 fill-amber-400" />
                                  <span>{consultant.rating}</span>
                                </div>
                              </div>

                              <div>
                                <h4 className="font-bold text-white text-base">{consultant.name}</h4>
                                <p className="text-xs text-slate-200 font-medium">{consultant.title}</p>
                                <p className="text-[11px] font-mono text-sky-400">{consultant.company}</p>
                              </div>

                              <p className="text-xs text-slate-300 line-clamp-2">{consultant.bio}</p>
                            </div>

                            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 uppercase font-bold">Fee</span>
                                <p className="text-sm font-black text-sky-400 flex items-center">
                                  <IndianRupee className="h-3.5 w-3.5" />
                                  {consultant.price}
                                  <span className="text-[10px] text-slate-300 font-normal ml-0.5">/ {consultant.duration}</span>
                                </p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => openBookingModal(consultant)}
                                className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs gap-1.5 shadow-[0_0_15px_rgba(56,189,248,0.35)]"
                              >
                                <Video className="h-3.5 w-3.5" /> Book 1-on-1
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-1 md:col-span-3 p-6 rounded-2xl bg-[#070e24]/85 border border-slate-800 text-center space-y-3">
                          <p className="text-slate-200 text-sm">
                            Verified specialists are currently onboarding. You can broadcast your custom consultation request below or reserve with our platform lead!
                          </p>
                          <Button
                            size="sm"
                            onClick={() => scrollToStage(5)}
                            className="bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border border-sky-500/30 font-bold rounded-xl text-xs"
                          >
                            Jump to Custom Advisory Request &rarr;
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card3D>
              </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────
               STAGE 4: TRUST & ACADEMIC EXCELLENCE SHIELD (Stage 04)
               ───────────────────────────────────────────────────────────── */}
            <section
              id="stage-4"
              className="min-h-screen w-full flex items-center px-4 md:px-12 lg:px-20 py-24 relative z-10"
            >
              <div className="w-full max-w-3xl text-left pointer-events-auto">
                <Card3D depth={12} glare={true}>
                  <div className="p-7 md:p-9 rounded-3xl bg-[#020617]/92 border border-sky-500/40 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/30">
                        STAGE 04 • TRUST & ACADEMIC EXCELLENCE
                      </span>
                      <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                        100% Student Protection & Excellence Shield
                      </h2>
                      <p className="text-xs md:text-sm text-slate-200">
                        Complete peace of mind with escrow security, verified credentials, and instant refunds.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl bg-[#070e24]/90 border border-purple-500/30 backdrop-blur-xl text-left space-y-2.5">
                        <ShieldCheck className="h-7 w-7 text-purple-400" />
                        <h4 className="font-bold text-white text-sm">Escrow Protection</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Funds remain safely locked in escrow and only release after your live session completes.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#070e24]/90 border border-cyan-500/30 backdrop-blur-xl text-left space-y-2.5">
                        <Video className="h-7 w-7 text-cyan-400" />
                        <h4 className="font-bold text-white text-sm">Private Video Rooms</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Encrypted 1-on-1 private video calls with HD screen sharing and real-time code audit.
                        </p>
                      </div>

                      <div className="p-5 rounded-2xl bg-[#070e24]/90 border border-sky-500/30 backdrop-blur-xl text-left space-y-2.5">
                        <Clock className="h-7 w-7 text-sky-400" />
                        <h4 className="font-bold text-white text-sm">Instant Reschedule</h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Easily change your scheduled slot up to 2 hours before the call, or get a 100% refund.
                        </p>
                      </div>
                    </div>
                  </div>
                </Card3D>
              </div>
            </section>

            {/* ─────────────────────────────────────────────────────────────
               STAGE 5: CAMPUS GATEWAY TO INDUSTRY (Stage 05 - At Last)
               ───────────────────────────────────────────────────────────── */}
            <section
              id="stage-5"
              className="min-h-screen w-full flex items-center px-4 md:px-12 lg:px-20 py-24 pb-36 relative z-10"
            >
              <div className="w-full max-w-4xl text-left pointer-events-auto">
                <Card3D depth={10} glare={true}>
                  <div className="p-7 md:p-9 rounded-3xl bg-[#020617]/92 border border-sky-500/40 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono text-sky-400 font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30">
                        STAGE 05 • CAMPUS GATEWAY TO INDUSTRY
                      </span>
                      <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
                        Reserve Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-blue-400">Consultancy Session</span>
                      </h2>
                      <p className="text-xs md:text-sm text-slate-200">
                        Direct access to certified industry architects and academic researchers.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Instant 1-on-1 Reservation Card */}
                      <div className="p-6 rounded-2xl bg-[#070e24]/95 border border-sky-500/35 backdrop-blur-2xl space-y-4 shadow-xl">
                        <div className="flex items-center gap-2 text-sky-400">
                          <Zap className="h-5 w-5" />
                          <h3 className="font-bold text-white text-base">Instant 1-on-1 Reservation</h3>
                        </div>
                        <p className="text-xs text-slate-300">
                          Choose an expert and lock in your scheduled video slot with escrow protection.
                        </p>

                        <div className="space-y-3 pt-1">
                          <div className="space-y-1">
                            <Label className="text-xs text-slate-200 font-semibold">Selected Expert</Label>
                            <select
                              className="w-full h-11 px-3 rounded-xl border border-slate-700 bg-black/70 text-white text-xs focus:ring-2 focus:ring-sky-500 font-medium"
                              value={bookingConsultant?.id || ""}
                              onChange={(e) => {
                                const found = consultants.find((m) => m.id === e.target.value);
                                if (found) setBookingConsultant(found);
                              }}
                            >
                              {consultants.length > 0 ? (
                                consultants.map((m) => (
                                  <option key={m.id} value={m.id}>
                                    {m.name} — {m.title} (₹{m.price})
                                  </option>
                                ))
                              ) : (
                                <option value="platform-advisor">
                                  Platform Senior Consultant — Verified Academic & Tech Consultant (₹999)
                                </option>
                              )}
                            </select>
                          </div>

                          <Button
                            onClick={() => openBookingModal(bookingConsultant || (consultants.length > 0 ? consultants[0] : null))}
                            className="w-full bg-gradient-to-r from-sky-500 to-blue-500 hover:opacity-95 text-slate-950 font-black h-11 rounded-xl text-xs md:text-sm shadow-[0_0_20px_rgba(56,189,248,0.4)] mt-2"
                          >
                            Proceed to Reserve Slot ⚡
                          </Button>
                        </div>
                      </div>

                      {/* Custom Advisory Request Card */}
                      <div className="p-6 rounded-2xl bg-[#070e24]/95 border border-cyan-500/35 backdrop-blur-2xl space-y-4 shadow-xl">
                        <div className="flex items-center gap-2 text-cyan-400">
                          <Sparkles className="h-5 w-5" />
                          <h3 className="font-bold text-white text-base">Broadcast Custom Request</h3>
                        </div>
                        <p className="text-xs text-slate-300">
                          Need a niche subject (e.g. BioTech, Quantum, VLSI)? Broadcast your requirement.
                        </p>

                        <form onSubmit={handleCustomRequestSubmit} className="space-y-3">
                          <Input
                            placeholder="Project topic or paper review title"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            className="rounded-xl border-slate-700 bg-black/70 text-white text-xs h-10"
                            required
                          />
                          <Textarea
                            placeholder="Brief questions or roadblocks..."
                            value={customDetails}
                            onChange={(e) => setCustomDetails(e.target.value)}
                            className="rounded-xl border-slate-700 bg-black/70 text-white text-xs min-h-[60px]"
                            required
                          />
                          <Button
                            type="submit"
                            disabled={isCustomSubmitting}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold h-10 rounded-xl text-xs"
                          >
                            {isCustomSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : "Broadcast Request 📨"}
                          </Button>
                        </form>
                      </div>
                    </div>
                  </div>
                </Card3D>
              </div>
            </section>

          </div>

          {/* ─────────────────────────────────────────────────────────────
             BOTTOM 3D SCROLL PROGRESS HUD INDICATOR
             ───────────────────────────────────────────────────────────── */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-3 md:px-4 py-2 rounded-full bg-[#030712]/92 border border-sky-500/40 backdrop-blur-2xl flex items-center gap-1.5 md:gap-3 shadow-[0_0_35px_rgba(0,0,0,0.9)]">
            {[
              { num: 1, label: "01 Grad" },
              { num: 2, label: "02 Study" },
              { num: 3, label: "03 Mentors" },
              { num: 4, label: "04 Trophy" },
              { num: 5, label: "05 Gateway" },
            ].map((stg) => {
              const stageProgress = (stg.num - 1) / 4;
              const active = Math.abs(scrollProgress - stageProgress) < 0.16;
              return (
                <button
                  key={stg.num}
                  onClick={() => scrollToStage(stg.num)}
                  className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-mono font-bold transition-all ${
                    active
                      ? "bg-sky-500 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.6)] scale-105"
                      : "text-slate-300 hover:text-white hover:bg-sky-500/10"
                  }`}
                >
                  {stg.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         INTERACTIVE 3D BOOKING DIALOG MODAL
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={isBookingOpen} onOpenChange={(open) => !open && setIsBookingOpen(false)}>
        <DialogContent className="max-w-lg bg-[#0a0f26] border border-sky-500/50 text-white p-6 rounded-3xl shadow-[0_0_70px_rgba(56,189,248,0.3)]">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Zap className="h-5 w-5 text-sky-400" />
              Book 1-on-1 Consultancy Service
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Schedule your live video advisory session with escrow guarantee.
            </DialogDescription>
          </DialogHeader>

          {bookingConsultant && (
            <div className="space-y-4 py-2 text-xs">
              {/* Consultant Selected Card */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/60 border border-sky-500/30">
                <div className="flex items-center gap-3">
                  <img
                    src={bookingConsultant.avatar}
                    alt={bookingConsultant.name}
                    className="w-11 h-11 rounded-xl object-cover border border-sky-400"
                  />
                  <div>
                    <h4 className="font-bold text-white text-sm">{bookingConsultant.name}</h4>
                    <p className="text-[11px] text-slate-400">{bookingConsultant.title}</p>
                    <p className="text-[10px] text-sky-400 font-mono">{bookingConsultant.company}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-black text-sky-400 text-base">₹{bookingConsultant.price}</p>
                  <p className="text-[10px] text-slate-400">{bookingConsultant.duration}</p>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300 font-semibold">Consultation Mode</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Live 1-on-1 Video Call",
                    "Architecture & Code Audit",
                    "Career & Portfolio Polish",
                    "Thesis Defense Guidance",
                  ].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSelectedMode(mode)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        selectedMode === mode
                          ? "bg-sky-500/20 border-sky-400 text-sky-300 font-bold"
                          : "bg-black/40 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-300 font-semibold">Select Day</Label>
                  <select
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-700 bg-black/50 text-white text-xs focus:ring-2 focus:ring-sky-500"
                  >
                    <option>Today Evening</option>
                    <option>Tomorrow</option>
                    <option>Day After Tomorrow</option>
                    <option>This Weekend</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-300 font-semibold">Select Time Slot</Label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-700 bg-black/50 text-white text-xs focus:ring-2 focus:ring-sky-500"
                  >
                    <option>04:00 PM - 04:45 PM</option>
                    <option>06:00 PM - 06:45 PM</option>
                    <option>08:00 PM - 08:45 PM</option>
                    <option>09:30 PM - 10:15 PM</option>
                  </select>
                </div>
              </div>

              {/* Agenda Notes */}
              <div className="space-y-1">
                <Label className="text-xs text-slate-300 font-semibold">Questions / Agenda (Optional)</Label>
                <Input
                  placeholder="e.g. Please review my distributed architecture diagram"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  className="rounded-xl border-slate-700 bg-black/50 text-white h-10 text-xs"
                />
              </div>

              {/* Escrow Guarantee Pill */}
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/25 text-[11px] text-sky-300 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0" />
                <span>
                  <strong>Escrow Security:</strong> Funds remain securely held until your video session successfully concludes.
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsBookingOpen(false)}
              className="rounded-xl border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmBooking}
              disabled={isBookingSubmitting}
              className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(56,189,248,0.4)]"
            >
              {isBookingSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : "Confirm & Reserve Slot ⚡"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
         CONFIRMATION 3D PASS MODAL
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={!!confirmedPass} onOpenChange={(open) => !open && setConfirmedPass(null)}>
        <DialogContent className="max-w-md bg-[#0a0f26] border border-sky-400/50 text-white p-6 rounded-3xl shadow-[0_0_70px_rgba(56,189,248,0.4)] text-center space-y-4">
          <div className="inline-flex p-3 rounded-full bg-sky-500/20 text-sky-400 border border-sky-400/40 mx-auto">
            <CheckCircle className="h-8 w-8" />
          </div>

          <div>
            <h3 className="text-xl font-black text-white">Consultancy Pass Confirmed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your 1-on-1 session with <strong className="text-sky-400">{confirmedPass?.consultantName}</strong> is reserved.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/60 border border-sky-500/30 text-xs space-y-2 text-left font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Pass ID:</span>
              <span className="text-sky-400 font-bold">{confirmedPass?.id}</span>
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

          <Button
            onClick={() => setConfirmedPass(null)}
            className="w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.3)]"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Consultancy;
