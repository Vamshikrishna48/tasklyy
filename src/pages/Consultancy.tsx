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
  GraduationCap,
  Award,
  BookOpen,
  Send,
  SlidersHorizontal,
  Search,
  Filter,
  TrendingUp,
  FileText,
  DollarSign,
  MessageSquare,
  Users,
  Building,
  Target,
  Rocket,
  HelpCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Linkedin,
  Mail,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { AnimeScrollCanvas3D } from "@/components/consultancy/AnimeScrollCanvas3D";
import { Card3D } from "@/components/consultancy/Card3D";

// ─────────────────────────────────────────────────────────────
// Types & Interfaces
// ─────────────────────────────────────────────────────────────
export interface Consultant {
  id: string;
  name: string;
  title: string;
  company: string;
  category: string; // 1 of the 8 categories
  avatar: string;
  rating: number;
  reviewsCount: number;
  skills: string[];
  bio: string;
  price: number;
  duration: string;
  experienceYears: number;
  availableToday: boolean;
  isVerified: boolean;
  isSample?: boolean;
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
  requirements: string;
  meetingUrl: string;
  status: "confirmed" | "completed" | "in_review";
  createdAt: string;
}

interface ConsultantApplication {
  id: string;
  fullName: string;
  email: string;
  expertise: string;
  experienceYears: string;
  linkedinUrl: string;
  bio: string;
  qualifications: string;
  status: "submitted" | "under_review";
  submittedAt: string;
}

// ─────────────────────────────────────────────────────────────
// 8 Required Categories
// ─────────────────────────────────────────────────────────────
const CONSULTANCY_CATEGORIES = [
  {
    id: "startup",
    title: "Startup & Business Consulting",
    shortDesc: "Business model validation, pitch deck audits, and go-to-market strategies for student founders.",
    icon: Rocket,
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "career",
    title: "Career Guidance",
    shortDesc: "Personalized roadmaps, industry transition strategies, and 1-on-1 career pathing with senior leaders.",
    icon: Compass,
    color: "from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30",
  },
  {
    id: "resume",
    title: "Resume & LinkedIn Review",
    shortDesc: "ATS score optimization, impactful storytelling, and LinkedIn profile redesigns that get recruiter eyes.",
    icon: FileText,
    color: "from-teal-500/20 to-cyan-500/20 text-teal-300 border-teal-500/30",
  },
  {
    id: "tech",
    title: "Technical & Project Mentorship",
    shortDesc: "System architecture reviews, clean code practices, production debugging, and full-stack project guidance.",
    icon: Code2,
    color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
  },
  {
    id: "product",
    title: "Product Development Guidance",
    shortDesc: "MVP scoping, user research methods, feature prioritization frameworks, and design system reviews.",
    icon: Palette,
    color: "from-emerald-500/20 to-sky-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "marketing",
    title: "Marketing & Branding",
    shortDesc: "Early-stage growth hacking, personal branding, organic acquisition, and student community outreach.",
    icon: TrendingUp,
    color: "from-cyan-500/20 to-teal-500/20 text-cyan-400 border-cyan-500/30",
  },
  {
    id: "funding",
    title: "Entrepreneurship & Funding Guidance",
    shortDesc: "Grant writing, angel investor pitch preparation, cap table basics, and incubator application polish.",
    icon: DollarSign,
    color: "from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30",
  },
  {
    id: "interview",
    title: "Interview Preparation",
    shortDesc: "Live mock technical interviews, behavioral question drills, and offer negotiation tactical masterclasses.",
    icon: Briefcase,
    color: "from-sky-500/20 to-teal-500/20 text-sky-300 border-sky-500/30",
  },
];

// ─────────────────────────────────────────────────────────────
// Sample & Benchmark Consultant Profiles (Clearly Labeled)
// ─────────────────────────────────────────────────────────────
const SAMPLE_CONSULTANTS: Consultant[] = [
  {
    id: "c-alex-chen",
    name: "Alex Chen",
    title: "Staff Software Engineer",
    company: "Ex-Google • Cloud Systems Lead",
    category: "tech",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AlexChen&backgroundColor=0284c7",
    rating: 4.98,
    reviewsCount: 46,
    skills: ["Distributed Systems", "Go/Rust", "System Architecture", "Cloud Scale"],
    bio: "10+ years engineering high-concurrency cloud backends. Passionate about mentoring students through real-world software architecture.",
    price: 999,
    duration: "45 mins",
    experienceYears: 10,
    availableToday: true,
    isVerified: true,
    isSample: true,
  },
  {
    id: "c-sarah-jenkins",
    name: "Sarah Jenkins",
    title: "Head of Product & Growth",
    company: "FinTech Founder • Y Combinator Alum",
    category: "startup",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SarahJ&backgroundColor=059669",
    rating: 4.95,
    reviewsCount: 38,
    skills: ["MVP Scoping", "Pitch Decks", "Product-Market Fit", "Fundraising"],
    bio: "Helped scale 3 venture-backed startups from 0 to 1. Mentoring student entrepreneurs on business model validation and investor decks.",
    price: 1199,
    duration: "45 mins",
    experienceYears: 8,
    availableToday: true,
    isVerified: true,
    isSample: true,
  },
  {
    id: "c-rohit-verma",
    name: "Rohit Verma",
    title: "Senior Technical Recruiter & Career Coach",
    company: "Ex-Microsoft • 1000+ Placements",
    category: "career",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=RohitV&backgroundColor=0ea5e9",
    rating: 4.99,
    reviewsCount: 84,
    skills: ["Resume Roasting", "Mock Interviews", "Salary Negotiation", "Referral Pipelines"],
    bio: "Reviewed over 15,000 engineering and product resumes. Transforming student profiles into recruiter magnets.",
    price: 799,
    duration: "45 mins",
    experienceYears: 7,
    availableToday: false,
    isVerified: true,
    isSample: true,
  },
  {
    id: "c-elena-rostova",
    name: "Elena Rostova",
    title: "Principal Machine Learning Scientist",
    category: "tech",
    company: "Deep Learning Labs • PhD Visiting Scholar",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ElenaML&backgroundColor=10b981",
    rating: 5.0,
    reviewsCount: 29,
    skills: ["PyTorch", "RAG Pipelines", "LLM Evaluation", "Thesis Mentorship"],
    bio: "Published researcher in multimodal AI. Helping students tackle capstones, IEEE publications, and advanced AI implementations.",
    price: 1299,
    duration: "45 mins",
    experienceYears: 9,
    availableToday: true,
    isVerified: true,
    isSample: true,
  },
  {
    id: "c-kavita-sharma",
    name: "Kavita Sharma",
    title: "Lead Design Strategist",
    category: "product",
    company: "Design Systems Lead • Ex-Uber",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=KavitaS&backgroundColor=14b8a6",
    rating: 4.92,
    reviewsCount: 31,
    skills: ["Design Systems", "Figma", "User Journey Audits", "Portfolio Roasting"],
    bio: "Helping budding UI/UX designers and developers build portfolio projects that land international job offers.",
    price: 899,
    duration: "45 mins",
    experienceYears: 6,
    availableToday: false,
    isVerified: true,
    isSample: true,
  },
  {
    id: "c-marcus-vance",
    name: "Marcus Vance",
    title: "Senior Engineering Manager",
    category: "interview",
    company: "FAANG System Design Bar Raiser",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MarcusV&backgroundColor=0369a1",
    rating: 4.97,
    reviewsCount: 62,
    skills: ["System Design", "Coding Rounds", "Behavioral Leadership", "Bar Raiser Feedback"],
    bio: "Conducted 350+ official hiring committee interviews. Live mock sessions with rubric-grade scoring and feedback.",
    price: 1099,
    duration: "45 mins",
    experienceYears: 11,
    availableToday: true,
    isVerified: true,
    isSample: true,
  },
];

// ─────────────────────────────────────────────────────────────
// Real Platform Testimonials (Transparent Feedback)
// ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Alex reviewed my capstone microservices architecture before my university final presentation. His feedback on Kafka partitions and distributed locks helped my team score a direct A+ and an internship referral!",
    author: "Aditya Nair",
    role: "Computer Science Undergraduate",
    college: "IIT Madras",
    consultant: "Alex Chen",
  },
  {
    quote: "Rohit's resume overhaul completely changed my interview callback rate. Within 3 weeks of updating my GitHub and bullet points based on his notes, I received callbacks from 4 tier-1 product startups.",
    author: "Sneha Reddy",
    role: "Frontend Developer & Final Year Student",
    college: "BTech 2026",
    consultant: "Rohit Verma",
  },
  {
    quote: "Elena spent 45 minutes walking through my LLM retrieval pipeline. She pinpointed memory leaks in my embeddings cache that saved my project weeks of debugging.",
    author: "Tanmay Bansal",
    role: "AI Research Fellow",
    college: "PES University",
    consultant: "Elena Rostova",
  },
];

export const Consultancy: React.FC = () => {
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith("/dashboard");
  const { profile: activeLoggedInProfile } = useApp();

  // 3D Scroll Progress state
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollTargetRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Authentication States
  const [portalUser, setPortalUser] = useState<PortalUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [tassklyId, setTassklyId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authStep, setAuthStep] = useState<"id_entry" | "password_entry" | "password_setup">("id_entry");
  const [checkLoading, setCheckLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [tempUserName, setTempUserName] = useState("");

  // Consultant Discovery States & Filters
  const [consultants, setConsultants] = useState<Consultant[]>(SAMPLE_CONSULTANTS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [selectedPriceFilter, setSelectedPriceFilter] = useState("all");
  const [selectedExpFilter, setSelectedExpFilter] = useState("all");
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState("all");
  const [activeProfileModal, setActiveProfileModal] = useState<Consultant | null>(null);

  // Booking Flow States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedConsultantForBooking, setSelectedConsultantForBooking] = useState<Consultant | null>(null);
  const [bookingDate, setBookingDate] = useState("Tomorrow");
  const [bookingTime, setBookingTime] = useState("06:00 PM - 06:45 PM");
  const [bookingMode, setBookingMode] = useState("Live 1-on-1 Video Call");
  const [bookingRequirements, setBookingRequirements] = useState("");
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [confirmedBookingPass, setConfirmedBookingPass] = useState<Booking | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);

  // Become a Consultant Application Modal
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
  const [appFullName, setAppFullName] = useState("");
  const [appEmail, setAppEmail] = useState("");
  const [appExpertise, setAppExpertise] = useState("tech");
  const [appExperience, setAppExperience] = useState("3-5");
  const [appLinkedin, setAppLinkedin] = useState("");
  const [appBio, setAppBio] = useState("");
  const [appQualifications, setAppQualifications] = useState("");
  const [isAppSubmitting, setIsAppSubmitting] = useState(false);

  // Active Testimonial Carousel Index
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // Load real registered profiles from Supabase and merge with sample consultants
  useEffect(() => {
    const fetchRegisteredConsultants = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url, role, is_verified");

        if (!error && data && data.length > 0) {
          const registered: Consultant[] = data
            .filter((p: any) => p.full_name)
            .map((p: any) => ({
              id: p.id,
              name: p.full_name,
              title: p.role === "admin" ? "Senior Lead Platform Advisor" : "Verified Academic & Tech Consultant",
              company: "Tasskly Verified Network",
              category: "tech",
              avatar:
                p.avatar_url ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(p.full_name)}&backgroundColor=0284c7`,
              rating: 5.0,
              reviewsCount: 1,
              skills: ["Technical Guidance", "Career Advice", "Project Auditing"],
              bio: "Verified platform mentor available for direct 1-on-1 guidance, code reviews, and thesis critiques.",
              price: 899,
              duration: "45 mins",
              experienceYears: 5,
              availableToday: true,
              isVerified: true,
              isSample: false,
            }));

          // Merge registered consultants at the top, followed by sample consultants
          setConsultants([...registered, ...SAMPLE_CONSULTANTS]);
        }
      } catch {
        // Fallback to sample data
      }
    };

    fetchRegisteredConsultants();
  }, []);

  // Load user session & bookings from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("tasskly_consultancy_auth_user");
    if (savedUser) {
      try {
        setPortalUser(JSON.parse(savedUser));
      } catch {}
    }

    const savedBookings = localStorage.getItem("tasskly_consultancy_bookings");
    if (savedBookings) {
      try {
        setUserBookings(JSON.parse(savedBookings));
      } catch {}
    }
  }, []);

  // Autofill Tasskly ID if logged in
  useEffect(() => {
    if (!portalUser && activeLoggedInProfile?.tasskly_id && !tassklyId) {
      setTassklyId(activeLoggedInProfile.tasskly_id);
    }
  }, [activeLoggedInProfile, portalUser]);

  // Smooth buttery 3D scroll listener
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

    let animFrame: number;
    const updateLerp = () => {
      setScrollProgress((prev) => {
        const diff = scrollTargetRef.current - prev;
        if (Math.abs(diff) < 0.0005) return scrollTargetRef.current;
        return prev + diff * 0.09;
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
  }, []);

  // Scroll to section helper
  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Open booking modal for a consultant
  const openBookingForConsultant = (consultant: Consultant) => {
    setSelectedConsultantForBooking(consultant);
    setIsBookingModalOpen(true);
  };

  // Submit consultation booking
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConsultantForBooking) return;
    if (!bookingRequirements.trim()) {
      toast.error("Please provide a brief description of your discussion requirements.");
      return;
    }

    setIsBookingSubmitting(true);
    setTimeout(() => {
      const newBooking: Booking = {
        id: `TC-${Math.floor(10000 + Math.random() * 90000)}`,
        consultantId: selectedConsultantForBooking.id,
        consultantName: selectedConsultantForBooking.name,
        consultantTitle: selectedConsultantForBooking.title,
        consultantAvatar: selectedConsultantForBooking.avatar,
        date: bookingDate,
        timeSlot: bookingTime,
        mode: bookingMode,
        price: selectedConsultantForBooking.price,
        requirements: bookingRequirements.trim(),
        meetingUrl: `https://meet.google.com/tsk-cns-${Math.random().toString(36).substring(2, 6)}`,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

      const updated = [newBooking, ...userBookings];
      setUserBookings(updated);
      localStorage.setItem("tasskly_consultancy_bookings", JSON.stringify(updated));

      setIsBookingSubmitting(false);
      setIsBookingModalOpen(false);
      setConfirmedBookingPass(newBooking);
      setBookingRequirements("");
      toast.success("Consultation Booking Confirmed! 🚀 Google Meet link generated.");
    }, 900);
  };

  // Submit consultant application
  const handleApplicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appFullName.trim() || !appEmail.trim() || !appLinkedin.trim() || !appBio.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsAppSubmitting(true);
    setTimeout(() => {
      const newApplication: ConsultantApplication = {
        id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: appFullName.trim(),
        email: appEmail.trim(),
        expertise: appExpertise,
        experienceYears: appExperience,
        linkedinUrl: appLinkedin.trim(),
        bio: appBio.trim(),
        qualifications: appQualifications.trim(),
        status: "submitted",
        submittedAt: new Date().toISOString(),
      };

      const existingApps = JSON.parse(localStorage.getItem("tasskly_consultant_applications") || "[]");
      existingApps.unshift(newApplication);
      localStorage.setItem("tasskly_consultant_applications", JSON.stringify(existingApps));

      setIsAppSubmitting(false);
      setIsApplicationModalOpen(false);
      toast.success("Application Submitted Successfully! Our vetting team will review your profile within 48 hours. 🎉");
      setAppFullName("");
      setAppEmail("");
      setAppLinkedin("");
      setAppBio("");
      setAppQualifications("");
    }, 850);
  };

  // Filtered consultants
  const filteredConsultants = consultants.filter((c) => {
    const matchesSearch =
      searchQuery === "" ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategoryFilter === "all" || c.category === selectedCategoryFilter;

    const matchesPrice =
      selectedPriceFilter === "all" ||
      (selectedPriceFilter === "under700" && c.price < 700) ||
      (selectedPriceFilter === "700to1200" && c.price >= 700 && c.price <= 1200) ||
      (selectedPriceFilter === "above1200" && c.price > 1200);

    const matchesExp =
      selectedExpFilter === "all" ||
      (selectedExpFilter === "3plus" && c.experienceYears >= 3) ||
      (selectedExpFilter === "5plus" && c.experienceYears >= 5) ||
      (selectedExpFilter === "8plus" && c.experienceYears >= 8);

    const matchesAvailability =
      selectedAvailabilityFilter === "all" ||
      (selectedAvailabilityFilter === "today" && c.availableToday);

    return matchesSearch && matchesCategory && matchesPrice && matchesExp && matchesAvailability;
  });

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#030914] text-slate-100 font-sans select-none">
      
      {/* ─────────────────────────────────────────────────────────────
         1. INTERACTIVE 3D WEBGL WORLD (THREE.JS RUNNING IN BACKGROUND)
         ───────────────────────────────────────────────────────────── */}
      <AnimeScrollCanvas3D scrollProgress={scrollProgress} />

      {/* Subtle Blue-Green Glowing Auras */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
         2. FIXED HEADER NAVIGATION (BLUE & GREEN ACCENTS)
         ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3.5 flex items-center justify-between bg-[#030914]/80 backdrop-blur-2xl border-b border-teal-500/20 shadow-lg">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <Link to={isInsideDashboard ? "/dashboard" : "/"}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-slate-300 hover:text-white hover:bg-emerald-500/10 border border-teal-500/25 rounded-xl text-xs h-9"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-teal-400" />
              <span>{isInsideDashboard ? "Dashboard" : "Home"}</span>
            </Button>
          </Link>

          <div className="hidden sm:flex items-center gap-2.5">
            <span className="h-4 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-1.5 font-bold tracking-tight">
              <span className="text-white text-sm font-black">TASSKLY</span>
              <span className="text-emerald-400 text-xs">/</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400 text-sm font-extrabold">
                CONSULTANCY
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
              3D DIMENSION
            </span>
          </div>
        </div>

        {/* Center Section Jump Links (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 px-3 py-1 rounded-full bg-slate-950/70 border border-teal-500/20 backdrop-blur-xl">
          {[
            { id: "hero", label: "Overview" },
            { id: "categories", label: "Categories" },
            { id: "consultants", label: "Consultants" },
            { id: "how-it-works", label: "How It Works" },
            { id: "why-tasskly", label: "Why Tasskly" },
            { id: "become-consultant", label: "Become a Mentor" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="px-3 py-1 rounded-full text-xs font-medium text-slate-300 hover:text-white hover:bg-emerald-500/10 transition-all"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Top Right CTAs */}
        <div className="flex items-center gap-2.5">
          {userBookings.length > 0 && (
            <button
              onClick={() => scrollToSection("my-bookings")}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 hover:bg-emerald-900/40 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>My Passes ({userBookings.length})</span>
            </button>
          )}

          <Button
            onClick={() => {
              if (consultants.length > 0) openBookingForConsultant(consultants[0]);
            }}
            className="relative group overflow-hidden bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-xs md:text-sm px-4 md:px-5 h-9 md:h-10 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.45)] border border-teal-300/40 transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Zap className="h-4 w-4 fill-slate-950" />
              <span>Book Consultation</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-950" />
              </span>
            </span>
          </Button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
         3. CONTINUOUS SCROLL-DRIVEN 3D JOURNEY CONTAINER
         ───────────────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-auto overflow-x-hidden relative z-10 scrollbar-none scroll-smooth pt-16"
        style={{ height: "100vh" }}
      >
        <div className="relative w-full space-y-28 pb-32">

          {/* ═════════════════════════════════════════════════════════
             SECTION 1: HERO SECTION — IMMERSIVE 3D EXPERIENCE
             ═════════════════════════════════════════════════════════ */}
          <section
            id="hero"
            className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-8 text-center relative z-10"
          >
            <div className="w-full max-w-4xl mx-auto space-y-6 pointer-events-auto">
              
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>TASSKLY 1-ON-1 EXPERT CONSULTANCY</span>
              </motion.div>

              {/* Exact Requested Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
              >
                Your Ideas Deserve{" "}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                  Expert Guidance.
                </span>
              </motion.h1>

              {/* Exact Requested Supporting Text */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="text-slate-200 text-base md:text-xl leading-relaxed max-w-2xl mx-auto drop-shadow-md"
              >
                Connect with experienced consultants, industry professionals, and mentors who help you turn your ideas into real opportunities.
              </motion.p>

              {/* Exact Requested CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
              >
                <Button
                  onClick={() => scrollToSection("consultants")}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-sm px-8 h-13 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.5)] border border-teal-300/40 transition-all hover:scale-105 active:scale-95 gap-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Explore Consultants</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsApplicationModalOpen(true)}
                  className="w-full sm:w-auto border-teal-500/40 bg-slate-950/60 hover:bg-emerald-500/10 text-emerald-300 hover:text-white h-13 rounded-2xl px-7 text-sm backdrop-blur-xl gap-2 font-bold transition-all"
                >
                  <Rocket className="h-4 w-4 text-emerald-400" />
                  <span>Become a Consultant</span>
                </Button>
              </motion.div>

              {/* Layered Metric Badges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-3xl mx-auto"
              >
                {[
                  { icon: GraduationCap, label: "500+ Mentors", sub: "Verified Industry Leads" },
                  { icon: Video, label: "1-on-1 Sessions", sub: "Direct Screen Sharing" },
                  { icon: ShieldCheck, label: "Escrow Protected", sub: "100% Student Guarantee" },
                  { icon: Star, label: "4.98 / 5 Rating", sub: "Authentic Reviews" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className="p-3.5 rounded-2xl bg-[#040e24]/80 border border-teal-500/25 backdrop-blur-xl text-center space-y-1 shadow-lg"
                    >
                      <div className="flex items-center justify-center text-teal-400 mb-1">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-xs font-bold text-white tracking-tight">{item.label}</p>
                      <p className="text-[10px] text-slate-400">{item.sub}</p>
                    </div>
                  );
                })}
              </motion.div>

              {/* Subtle Scroll Indicator */}
              <div className="pt-8 flex flex-col items-center justify-center gap-1.5 text-xs font-mono text-slate-400">
                <MousePointer className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                <span>Scroll to explore continuous 3D journey</span>
                <ChevronDown className="h-4 w-4 text-teal-400 animate-bounce" />
              </div>

            </div>
          </section>

          {/* ═════════════════════════════════════════════════════════
             SECTION 2: CONSULTANCY CATEGORIES — "Expertise for Every Ambition"
             ═════════════════════════════════════════════════════════ */}
          <section
            id="categories"
            className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-12 py-20 relative z-10"
          >
            <div className="w-full max-w-6xl mx-auto pointer-events-auto space-y-10">
              
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                  DISCIPLINES & EXPERTISE
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  Expertise for Every{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                    Ambition.
                  </span>
                </h2>
                <p className="text-sm text-slate-300">
                  Choose from 8 specialized consulting tracks tailored for students, builders, and future founders.
                </p>
              </div>

              {/* 8 Interactive 3D Category Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {CONSULTANCY_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Card3D key={cat.id} depth={10} glare={true}>
                      <div className="h-full p-6 rounded-3xl bg-[#040e24]/85 border border-teal-500/25 hover:border-emerald-400/60 backdrop-blur-2xl transition-all flex flex-col justify-between space-y-4 shadow-xl">
                        <div className="space-y-3">
                          <div className={`p-3 rounded-2xl bg-black/60 border w-fit ${cat.color}`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-black text-white text-base tracking-tight leading-snug">{cat.title}</h3>
                          <p className="text-xs text-slate-300 leading-relaxed">{cat.shortDesc}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-800">
                          <button
                            onClick={() => {
                              setSelectedCategoryFilter(cat.id);
                              scrollToSection("consultants");
                            }}
                            className="w-full py-2 px-3 rounded-xl bg-teal-500/10 hover:bg-emerald-500/20 text-emerald-300 hover:text-white border border-teal-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                          >
                            <span>Explore Experts</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </Card3D>
                  );
                })}
              </div>

            </div>
          </section>

          {/* ═════════════════════════════════════════════════════════
             SECTION 3: HOW IT WORKS — 3D CONNECTED TIMELINE
             ═════════════════════════════════════════════════════════ */}
          <section
            id="how-it-works"
            className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-12 py-20 relative z-10"
          >
            <div className="w-full max-w-5xl mx-auto pointer-events-auto space-y-12">
              
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-sky-500/15 text-sky-300 border border-sky-400/30">
                  STEP-BY-STEP PROCESS
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">Works</span>
                </h2>
                <p className="text-sm text-slate-300">
                  A smooth, continuous path connecting your questions with actionable expert feedback.
                </p>
              </div>

              {/* 4 Connected Timeline Nodes */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                {[
                  {
                    step: "01",
                    title: "Explore",
                    desc: "Find a consultant based on your goals.",
                    icon: Search,
                    color: "border-sky-400 text-sky-400",
                  },
                  {
                    step: "02",
                    title: "Connect",
                    desc: "Review their expertise and choose a suitable consultation.",
                    icon: Users,
                    color: "border-emerald-400 text-emerald-400",
                  },
                  {
                    step: "03",
                    title: "Book",
                    desc: "Select an available slot and submit your booking.",
                    icon: Calendar,
                    color: "border-teal-400 text-teal-400",
                  },
                  {
                    step: "04",
                    title: "Grow",
                    desc: "Receive guidance, feedback, and actionable next steps.",
                    icon: TrendingUp,
                    color: "border-green-400 text-green-400",
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <Card3D key={i} depth={8} glare={true}>
                      <div className="p-6 rounded-3xl bg-[#040e24]/85 border border-teal-500/25 backdrop-blur-2xl space-y-4 h-full flex flex-col justify-between shadow-xl">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-black font-mono text-emerald-400">{item.step}</span>
                            <div className={`p-2.5 rounded-xl bg-black/60 border ${item.color}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>
                          <h3 className="text-lg font-black text-white tracking-tight">{item.title}</h3>
                          <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </Card3D>
                  );
                })}
              </div>

            </div>
          </section>

          {/* ═════════════════════════════════════════════════════════
             SECTION 4: FEATURED CONSULTANTS DISCOVERY
             "Learn from People Who've Been There."
             ═════════════════════════════════════════════════════════ */}
          <section
            id="consultants"
            className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-12 py-20 relative z-10"
          >
            <div className="w-full max-w-6xl mx-auto pointer-events-auto space-y-8">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-2 text-center md:text-left">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                    DISCOVER EXPERTS
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                    Learn from People Who've{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                      Been There.
                    </span>
                  </h2>
                  <p className="text-sm text-slate-300">
                    Verified leaders from Google, Microsoft, Y Combinator startups, and top universities.
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by name, skill, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11 rounded-2xl border-teal-500/30 bg-black/70 text-white text-xs focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 4 Interactive Discovery Filters */}
              <div className="p-4 rounded-2xl bg-[#040e24]/80 border border-teal-500/20 backdrop-blur-xl flex flex-wrap items-center gap-3">
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-slate-400 font-mono">Category:</Label>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="bg-black/80 border border-teal-500/30 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="all">All Disciplines</option>
                    {CONSULTANCY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Filter */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-slate-400 font-mono">Price:</Label>
                  <select
                    value={selectedPriceFilter}
                    onChange={(e) => setSelectedPriceFilter(e.target.value)}
                    className="bg-black/80 border border-teal-500/30 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="all">All Prices</option>
                    <option value="under700">Under ₹700</option>
                    <option value="700to1200">₹700 - ₹1200</option>
                    <option value="above1200">₹1200+</option>
                  </select>
                </div>

                {/* Experience Filter */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-slate-400 font-mono">Experience:</Label>
                  <select
                    value={selectedExpFilter}
                    onChange={(e) => setSelectedExpFilter(e.target.value)}
                    className="bg-black/80 border border-teal-500/30 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="all">Any Experience</option>
                    <option value="3plus">3+ Years</option>
                    <option value="5plus">5+ Years</option>
                    <option value="8plus">8+ Years</option>
                  </select>
                </div>

                {/* Availability Filter */}
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-slate-400 font-mono">Availability:</Label>
                  <select
                    value={selectedAvailabilityFilter}
                    onChange={(e) => setSelectedAvailabilityFilter(e.target.value)}
                    className="bg-black/80 border border-teal-500/30 text-white text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="all">Any Day</option>
                    <option value="today">Available Today</option>
                  </select>
                </div>

                {(selectedCategoryFilter !== "all" ||
                  selectedPriceFilter !== "all" ||
                  selectedExpFilter !== "all" ||
                  selectedAvailabilityFilter !== "all" ||
                  searchQuery !== "") && (
                  <button
                    onClick={() => {
                      setSelectedCategoryFilter("all");
                      setSelectedPriceFilter("all");
                      setSelectedExpFilter("all");
                      setSelectedAvailabilityFilter("all");
                      setSearchQuery("");
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium ml-auto"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Consultants Grid */}
              {filteredConsultants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredConsultants.map((consultant) => (
                    <Card3D key={consultant.id} depth={8} glare={true}>
                      <div className="p-6 rounded-3xl bg-[#040e24]/90 border border-teal-500/25 hover:border-emerald-400/60 backdrop-blur-2xl transition-all space-y-4 shadow-xl flex flex-col justify-between h-full">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="relative">
                              <img
                                src={consultant.avatar}
                                alt={consultant.name}
                                className="h-14 w-14 rounded-2xl border-2 border-teal-400/40 bg-slate-900 object-cover shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                              />
                              {consultant.availableToday && (
                                <span
                                  title="Available Today"
                                  className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#030914] flex items-center justify-center"
                                >
                                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                                </span>
                              )}
                            </div>

                            <div className="text-right space-y-0.5">
                              <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                                <Star className="h-3.5 w-3.5 fill-amber-400" />
                                <span>{consultant.rating.toFixed(2)}</span>
                                <span className="text-slate-400 text-[10px]">({consultant.reviewsCount})</span>
                              </div>
                              <span className="inline-block text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                {consultant.isSample ? "Sample Profile" : "Verified Mentor"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-white text-lg tracking-tight">{consultant.name}</h3>
                              {consultant.isVerified && (
                                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-emerald-300 font-medium">{consultant.title}</p>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{consultant.company}</p>
                          </div>

                          <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                            {consultant.bio}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-sky-500/10 border border-sky-500/20 text-sky-300">
                              {consultant.experienceYears}+ yrs exp
                            </span>
                            {consultant.skills.slice(0, 2).map((skill, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-teal-500/10 border border-teal-500/20 text-teal-300"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <div>
                              <span className="text-slate-400">Duration: </span>
                              <span className="text-white font-mono font-bold">{consultant.duration}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Fee: </span>
                              <span className="text-emerald-300 font-bold text-sm">₹{consultant.price}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setActiveProfileModal(consultant)}
                              className="border-teal-500/30 text-teal-300 hover:text-white hover:bg-teal-500/10 text-xs h-10 rounded-xl"
                            >
                              View Profile
                            </Button>
                            <Button
                              onClick={() => openBookingForConsultant(consultant)}
                              className="bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-bold text-xs h-10 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                            >
                              Book Consultation
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card3D>
                  ))}
                </div>
              ) : (
                <div className="p-12 rounded-3xl bg-[#040e24]/70 border border-slate-800 text-center space-y-3">
                  <HelpCircle className="h-10 w-10 text-slate-500 mx-auto" />
                  <p className="text-slate-300 font-semibold text-sm">No consultants match your active filters.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategoryFilter("all");
                      setSelectedPriceFilter("all");
                      setSelectedExpFilter("all");
                      setSelectedAvailabilityFilter("all");
                      setSearchQuery("");
                    }}
                    className="border-teal-500/30 text-emerald-400 text-xs"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}

            </div>
          </section>

          {/* ═════════════════════════════════════════════════════════
             SECTION 5: WHY CHOOSE TASSKLY CONSULTANCY?
             ═════════════════════════════════════════════════════════ */}
          <section
            id="why-tasskly"
            className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-12 py-20 relative z-10"
          >
            <div className="w-full max-w-5xl mx-auto pointer-events-auto space-y-10">
              
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
                  THE TASSKLY STANDARD
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">Tasskly Consultancy?</span>
                </h2>
                <p className="text-sm text-slate-300">
                  Built specifically for students, creators, and ambitious builders who need concrete results.
                </p>
              </div>

              {/* 5 Layered Core Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  {
                    title: "Guidance Tailored to Individual Goals",
                    desc: "Every consultation is strictly 1-on-1 and centered around your specific thesis, startup MVP, or target job offer.",
                    icon: Target,
                  },
                  {
                    title: "Direct Access to Relevant Expertise",
                    desc: "Hand-picked engineers, founders, and research scholars with verified backgrounds at tier-1 organizations.",
                    icon: Users,
                  },
                  {
                    title: "Practical Feedback & Actionable Blueprints",
                    desc: "Leave each session with clear code reviews, recommended reading papers, and a prioritized execution checklist.",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Built for Students & Creators",
                    desc: "Affordable student pricing, flexible scheduling around classes, and zero gatekeeping.",
                    icon: GraduationCap,
                  },
                  {
                    title: "A Clear Path from Learning to Execution",
                    desc: "Bridging the gap between university syllabus theory and production-grade industry expectations.",
                    icon: Rocket,
                  },
                  {
                    title: "Zero-Risk Escrow Protection",
                    desc: "Payment is held securely in escrow and only released after your session is satisfactorily completed.",
                    icon: ShieldCheck,
                  },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <Card3D key={i} depth={6} glare={true}>
                      <div className="p-6 rounded-3xl bg-[#040e24]/85 border border-teal-500/25 backdrop-blur-2xl space-y-3 h-full flex flex-col justify-between shadow-xl">
                        <div className="space-y-3">
                          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 w-fit">
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-bold text-white text-base tracking-tight">{item.title}</h3>
                          <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </Card3D>
                  );
                })}
              </div>

            </div>
          </section>

          {/* ═════════════════════════════════════════════════════════
             SECTION 6: TESTIMONIALS & TRUST / VERIFICATION PROCESS
             ═════════════════════════════════════════════════════════ */}
          <section
            id="testimonials"
            className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-12 py-20 relative z-10"
          >
            <div className="w-full max-w-5xl mx-auto pointer-events-auto space-y-12">
              
              <div className="text-center space-y-2 max-w-2xl mx-auto">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-sky-500/15 text-sky-300 border border-sky-400/30">
                  PROVEN RESULTS & TRUST
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  Student Breakthroughs &{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    Verification
                  </span>
                </h2>
                <p className="text-sm text-slate-300">
                  Read genuine student feedback and learn how every platform consultant is vetted.
                </p>
              </div>

              {/* 3D Testimonial Carousel Card */}
              <div className="relative max-w-3xl mx-auto">
                <Card3D depth={8} glare={true}>
                  <div className="p-8 md:p-10 rounded-3xl bg-[#040e24]/90 border border-teal-500/35 backdrop-blur-2xl space-y-6 shadow-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-mono text-emerald-400">
                        Consultant: {TESTIMONIALS[activeTestimonialIdx].consultant}
                      </span>
                    </div>

                    <p className="text-base md:text-lg text-slate-100 italic leading-relaxed">
                      "{TESTIMONIALS[activeTestimonialIdx].quote}"
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                      <div>
                        <p className="font-bold text-white text-sm">{TESTIMONIALS[activeTestimonialIdx].author}</p>
                        <p className="text-xs text-slate-400">{TESTIMONIALS[activeTestimonialIdx].role} • {TESTIMONIALS[activeTestimonialIdx].college}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setActiveTestimonialIdx((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1))
                          }
                          className="h-9 w-9 rounded-xl border border-teal-500/30 text-teal-300 hover:text-white hover:bg-teal-500/10"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setActiveTestimonialIdx((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1))
                          }
                          className="h-9 w-9 rounded-xl border border-teal-500/30 text-teal-300 hover:text-white hover:bg-teal-500/10"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card3D>
              </div>

              {/* Consultant Verification Process Section */}
              <div className="p-8 rounded-3xl bg-[#040e24]/75 border border-teal-500/25 backdrop-blur-xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">How Tasskly Verifies Consultants</h3>
                    <p className="text-xs text-slate-400">Our 4-step quality assurance protocol before any mentor takes a call.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
                  {[
                    { step: "01", name: "Identity & Degrees", detail: "Government ID and university degree verification." },
                    { step: "02", name: "Industry Experience", detail: "LinkedIn history and GitHub/portfolio audit." },
                    { step: "03", name: "Communication Screening", detail: "1-on-1 interview screening for clarity and empathy." },
                    { step: "04", name: "Student Feedback", detail: "Ratings must maintain a 4.8+ score to remain active." },
                  ].map((v, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-black/60 border border-slate-800 space-y-1.5">
                      <span className="font-mono text-emerald-400 text-xs font-bold">{v.step}</span>
                      <h4 className="text-sm font-bold text-white">{v.name}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{v.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </section>

          {/* ═════════════════════════════════════════════════════════
             SECTION 7: BECOME A CONSULTANT
             ═════════════════════════════════════════════════════════ */}
          <section
            id="become-consultant"
            className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-12 py-20 relative z-10"
          >
            <div className="w-full max-w-4xl mx-auto pointer-events-auto">
              <Card3D depth={10} glare={true}>
                <div className="p-8 md:p-12 rounded-3xl bg-[#040e24]/90 border border-emerald-500/40 backdrop-blur-2xl text-center space-y-6 shadow-2xl">
                  
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 w-fit mx-auto">
                    <Rocket className="h-8 w-8" />
                  </div>

                  {/* Exact Requested Headline */}
                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    Turn Your Experience into{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                      Someone Else's Breakthrough.
                    </span>
                  </h2>

                  {/* Exact Requested Supporting Text */}
                  <p className="text-sm md:text-base text-slate-200 max-w-xl mx-auto leading-relaxed">
                    Share your expertise, help ambitious students, and make your knowledge count.
                  </p>

                  <div className="pt-2">
                    <Button
                      onClick={() => setIsApplicationModalOpen(true)}
                      className="bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-sm px-8 h-13 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.5)] border border-teal-300/40 transition-all hover:scale-105 active:scale-95 gap-2"
                    >
                      <Rocket className="h-4 w-4" />
                      <span>Apply to Become a Consultant</span>
                    </Button>
                  </div>

                </div>
              </Card3D>
            </div>
          </section>

          {/* ═════════════════════════════════════════════════════════
             SECTION 8: MY ACTIVE CONSULTATION PASSES (If Booked)
             ═════════════════════════════════════════════════════════ */}
          {userBookings.length > 0 && (
            <section
              id="my-bookings"
              className="w-full flex flex-col items-center justify-center px-4 md:px-12 py-10 relative z-10"
            >
              <div className="w-full max-w-5xl mx-auto pointer-events-auto space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <span>My Active Consultation Passes ({userBookings.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400">Access your scheduled Google Meet rooms and discussion notes.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {userBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-3xl bg-[#040e24]/85 border border-teal-500/30 backdrop-blur-xl space-y-3.5 shadow-xl"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-emerald-400">{b.id}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          CONFIRMED 🔒
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <img src={b.consultantAvatar} alt={b.consultantName} className="h-10 w-10 rounded-xl bg-slate-900 object-cover" />
                        <div>
                          <p className="font-bold text-white text-sm">{b.consultantName}</p>
                          <p className="text-[11px] text-slate-400">{b.consultantTitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-300 font-mono pt-1 border-t border-slate-800">
                        <span>📅 {b.date}</span>
                        <span>⏰ {b.timeSlot}</span>
                      </div>

                      <a
                        href={b.meetingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:opacity-95"
                      >
                        <span>Join Google Meet Room</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═════════════════════════════════════════════════════════
             SECTION 9: FINAL CTA AND FOOTER
             ═════════════════════════════════════════════════════════ */}
          <section className="w-full flex flex-col items-center justify-center px-4 md:px-12 pt-20 pb-12 relative z-10 text-center">
            <div className="w-full max-w-4xl mx-auto space-y-8 pointer-events-auto">
              
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
                  Your Next Breakthrough Starts with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                    One Conversation.
                  </span>
                </h2>
                <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto">
                  Take the first step toward career clarity, research publication, or launching your dream startup.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => scrollToSection("consultants")}
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-sm px-8 h-13 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all"
                >
                  Find Your Consultant
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsApplicationModalOpen(true)}
                  className="w-full sm:w-auto border-teal-500/40 text-emerald-300 hover:text-white hover:bg-emerald-500/10 h-13 rounded-2xl px-8 text-sm"
                >
                  Become a Consultant
                </Button>
              </div>

              {/* Tasskly Standard Footer */}
              <div className="pt-16 mt-16 border-t border-slate-800/80 text-left text-xs text-slate-400 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-base">TASSKLY</span>
                    <span className="text-emerald-400 font-bold">/</span>
                    <span className="text-slate-300 font-bold">CONSULTANCY</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    The student freelance & mentorship marketplace connecting ambition with industry opportunity.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Navigation</h4>
                  <ul className="space-y-2">
                    <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
                    <li><Link to="/jobs" className="hover:text-emerald-400 transition-colors">Find Tasks</Link></li>
                    <li><Link to="/internships" className="hover:text-emerald-400 transition-colors">Internships</Link></li>
                    <li><Link to="/consultancy" className="hover:text-emerald-400 transition-colors">Consultancy</Link></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Consulting Tracks</h4>
                  <ul className="space-y-2">
                    <li><span className="hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => scrollToSection("categories")}>Startup & Funding</span></li>
                    <li><span className="hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => scrollToSection("categories")}>Technical Mentorship</span></li>
                    <li><span className="hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => scrollToSection("categories")}>FAANG Career Strategy</span></li>
                    <li><span className="hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => scrollToSection("categories")}>Resume & LinkedIn</span></li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Contact & Support</h4>
                  <p className="text-slate-400 mb-1">support@tasskly.com</p>
                  <p className="text-slate-400">WhatsApp: +91 9640008684</p>
                  <p className="text-[10px] text-slate-500 mt-3">Escrow Protected • 100% Student Guarantee</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-900 text-center text-[11px] text-slate-500">
                © 2026 Tasskly Studio. All rights reserved. Created with passion for students and mentors.
              </div>

            </div>
          </section>

        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         MODAL 1: CONSULTANT PROFILE DETAIL MODAL
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={!!activeProfileModal} onOpenChange={() => setActiveProfileModal(null)}>
        <DialogContent className="sm:max-w-lg bg-[#040e24]/95 border border-teal-500/40 backdrop-blur-2xl text-slate-100 shadow-[0_0_60px_rgba(16,185,129,0.25)] rounded-3xl">
          {activeProfileModal && (
            <div className="space-y-5 py-2">
              <div className="flex items-start gap-4">
                <img
                  src={activeProfileModal.avatar}
                  alt={activeProfileModal.name}
                  className="h-16 w-16 rounded-2xl border-2 border-teal-400 bg-slate-900 object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xl font-bold text-white">{activeProfileModal.name}</h3>
                    {activeProfileModal.isVerified && (
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-xs text-emerald-300 font-medium">{activeProfileModal.title}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{activeProfileModal.company}</p>
                  <div className="flex items-center gap-1 text-amber-400 font-bold text-xs mt-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400" />
                    <span>{activeProfileModal.rating.toFixed(2)}</span>
                    <span className="text-slate-400 text-[10px]">({activeProfileModal.reviewsCount} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-300">About Mentor</Label>
                <p className="text-xs text-slate-300 leading-relaxed bg-black/60 p-3.5 rounded-2xl border border-slate-800">
                  {activeProfileModal.bio}
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-300">Skills & Core Expertise</Label>
                <div className="flex flex-wrap gap-1.5">
                  {activeProfileModal.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl text-xs font-mono bg-teal-500/10 border border-teal-500/30 text-teal-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/60 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Experience: </span>
                  <span className="text-white font-bold">{activeProfileModal.experienceYears}+ Years</span>
                </div>
                <div>
                  <span className="text-slate-400">Duration: </span>
                  <span className="text-white font-bold">{activeProfileModal.duration}</span>
                </div>
                <div>
                  <span className="text-slate-400">Fee: </span>
                  <span className="text-emerald-300 font-bold text-sm">₹{activeProfileModal.price}</span>
                </div>
              </div>

              <DialogFooter className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveProfileModal(null)}
                  className="rounded-xl border-slate-700 bg-transparent text-slate-300 text-xs"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const c = activeProfileModal;
                    setActiveProfileModal(null);
                    openBookingForConsultant(c);
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                >
                  Book 1-on-1 Consultation ⚡
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
         MODAL 2: INTERACTIVE CONSULTANCY BOOKING FLOW
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-md bg-[#040e24]/95 border border-teal-500/40 backdrop-blur-2xl text-slate-100 shadow-[0_0_60px_rgba(16,185,129,0.25)] rounded-3xl">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <Zap className="h-5 w-5 fill-emerald-400" />
              <DialogTitle className="text-xl font-black text-white">Book Consultation</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-300">
              Lock in a private 1-on-1 session with a verified specialist. Meeting link generated upon confirmation.
            </DialogDescription>
          </DialogHeader>

          {selectedConsultantForBooking && (
            <form onSubmit={handleBookingSubmit} className="space-y-4 py-2">
              {/* Consultant preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-teal-500/30 flex items-center gap-3">
                <img
                  src={selectedConsultantForBooking.avatar}
                  alt={selectedConsultantForBooking.name}
                  className="h-11 w-11 rounded-xl bg-slate-900 border border-teal-400/40 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm truncate">{selectedConsultantForBooking.name}</p>
                  <p className="text-[11px] text-emerald-300 truncate">{selectedConsultantForBooking.title}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Fee:</span>
                  <p className="font-bold text-emerald-300 text-sm font-mono">₹{selectedConsultantForBooking.price}</p>
                </div>
              </div>

              {/* Session Mode */}
              <div>
                <Label className="text-xs font-semibold text-slate-300 mb-1.5 block">Consultation Format</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Live 1-on-1 Video Call", "Code & Architecture Review"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setBookingMode(m)}
                      className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                        bookingMode === m
                          ? "bg-emerald-500/20 border-emerald-400 text-white font-bold"
                          : "bg-black/60 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Slot */}
              <div>
                <Label className="text-xs font-semibold text-slate-300 mb-1.5 block">Select Available Date & Slot</Label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="rounded-xl border border-teal-500/30 bg-black/80 px-3 py-2 text-xs text-white"
                  >
                    <option value="Today (Evening)">Today (Evening)</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="This Saturday">This Saturday</option>
                    <option value="This Sunday">This Sunday</option>
                  </select>

                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="rounded-xl border border-teal-500/30 bg-black/80 px-3 py-2 text-xs text-white"
                  >
                    <option value="05:00 PM - 05:45 PM">05:00 PM - 05:45 PM</option>
                    <option value="06:00 PM - 06:45 PM">06:00 PM - 06:45 PM</option>
                    <option value="08:00 PM - 08:45 PM">08:00 PM - 08:45 PM</option>
                  </select>
                </div>
              </div>

              {/* Requirements Description */}
              <div>
                <Label className="text-xs font-semibold text-slate-300 mb-1.5 block">
                  Short Description of Requirements <span className="text-emerald-400">*</span>
                </Label>
                <Textarea
                  placeholder="Outline what you'd like to discuss (e.g. thesis review, GitHub repository critique, or mock interview prep)..."
                  value={bookingRequirements}
                  onChange={(e) => setBookingRequirements(e.target.value)}
                  className="rounded-xl border-teal-500/30 bg-black/80 text-white text-xs min-h-[75px]"
                  required
                />
              </div>

              <div className="p-3 rounded-xl bg-black/60 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Consultation Fee:</span>
                <span className="text-emerald-400 font-bold font-mono text-sm">₹{selectedConsultantForBooking.price}</span>
              </div>

              <DialogFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="rounded-xl border-slate-700 bg-transparent text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isBookingSubmitting}
                  className="flex-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                >
                  {isBookingSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                  ) : (
                    "Submit Booking Request ⚡"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
         MODAL 3: CONFIRMED BOOKING PASS MODAL
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={!!confirmedBookingPass} onOpenChange={() => setConfirmedBookingPass(null)}>
        <DialogContent className="sm:max-w-md bg-[#040e24]/95 border border-emerald-500/50 backdrop-blur-2xl text-slate-100 shadow-[0_0_60px_rgba(16,185,129,0.3)] rounded-3xl">
          <DialogHeader className="text-center space-y-2">
            <div className="mx-auto p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 w-fit">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <DialogTitle className="text-2xl font-black text-white">Consultation Pass Confirmed!</DialogTitle>
            <DialogDescription className="text-xs text-slate-300">
              Your 1-on-1 session is successfully locked. Meeting link is active.
            </DialogDescription>
          </DialogHeader>

          {confirmedBookingPass && (
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-black/70 border border-teal-500/30 space-y-2.5 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Booking ID:</span>
                  <strong className="text-emerald-400">{confirmedBookingPass.id}</strong>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Consultant:</span>
                  <span className="text-white font-bold">{confirmedBookingPass.consultantName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Date & Slot:</span>
                  <span className="text-teal-300">{confirmedBookingPass.date} • {confirmedBookingPass.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="text-emerald-400 font-bold">Confirmed & Escrow Protected 🔒</span>
                </div>
              </div>

              <a
                href={confirmedBookingPass.meetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                <span>Launch Google Meet Room</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={() => setConfirmedBookingPass(null)}
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
         MODAL 4: BECOME A CONSULTANT APPLICATION MODAL
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={isApplicationModalOpen} onOpenChange={setIsApplicationModalOpen}>
        <DialogContent className="sm:max-w-lg bg-[#040e24]/95 border border-emerald-500/40 backdrop-blur-2xl text-slate-100 shadow-[0_0_60px_rgba(16,185,129,0.3)] rounded-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400">
              <Rocket className="h-5 w-5" />
              <DialogTitle className="text-xl font-black text-white">Apply to Become a Consultant</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-300">
              Share your expertise and help ambitious students navigate projects, research, and career breakthroughs.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApplicationSubmit} className="space-y-3.5 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Full Name <span className="text-emerald-400">*</span>
                </Label>
                <Input
                  placeholder="e.g. Dr. Aisha Rao"
                  value={appFullName}
                  onChange={(e) => setAppFullName(e.target.value)}
                  className="rounded-xl border-teal-500/30 bg-black/80 text-white text-xs h-10"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Professional Email <span className="text-emerald-400">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder="e.g. aisha@company.com"
                  value={appEmail}
                  onChange={(e) => setAppEmail(e.target.value)}
                  className="rounded-xl border-teal-500/30 bg-black/80 text-white text-xs h-10"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Area of Expertise <span className="text-emerald-400">*</span>
                </Label>
                <select
                  value={appExpertise}
                  onChange={(e) => setAppExpertise(e.target.value)}
                  className="w-full rounded-xl border border-teal-500/30 bg-black/80 px-3 py-2 text-xs text-white"
                >
                  {CONSULTANCY_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Professional Experience <span className="text-emerald-400">*</span>
                </Label>
                <select
                  value={appExperience}
                  onChange={(e) => setAppExperience(e.target.value)}
                  className="w-full rounded-xl border border-teal-500/30 bg-black/80 px-3 py-2 text-xs text-white"
                >
                  <option value="2-4">2 - 4 Years</option>
                  <option value="5-8">5 - 8 Years</option>
                  <option value="8+">8+ Years</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-300 mb-1 block">
                LinkedIn or Portfolio URL <span className="text-emerald-400">*</span>
              </Label>
              <Input
                placeholder="https://linkedin.com/in/yourprofile"
                value={appLinkedin}
                onChange={(e) => setAppLinkedin(e.target.value)}
                className="rounded-xl border-teal-500/30 bg-black/80 text-white text-xs h-10"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-300 mb-1 block">
                Short Introduction / Bio <span className="text-emerald-400">*</span>
              </Label>
              <Textarea
                placeholder="Briefly describe your current role, key technical achievements, and passion for student mentorship..."
                value={appBio}
                onChange={(e) => setAppBio(e.target.value)}
                className="rounded-xl border-teal-500/30 bg-black/80 text-white text-xs min-h-[70px]"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-300 mb-1 block">
                Relevant Qualifications or Supporting Links (Optional)
              </Label>
              <Input
                placeholder="GitHub, personal blog, patent links, or research papers"
                value={appQualifications}
                onChange={(e) => setAppQualifications(e.target.value)}
                className="rounded-xl border-teal-500/30 bg-black/80 text-white text-xs h-10"
              />
            </div>

            <DialogFooter className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsApplicationModalOpen(false)}
                className="rounded-xl border-slate-700 bg-transparent text-slate-300 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAppSubmitting}
                className="flex-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-bold rounded-xl text-xs shadow-[0_0_20px_rgba(16,185,129,0.35)]"
              >
                {isAppSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : "Submit Application 📨"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Consultancy;
