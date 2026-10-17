import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Sparkles,
  ArrowLeft,
  Calendar,
  Sun,
  Moon,
  MousePointer,
  ChevronDown,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
} from "lucide-react";

// 3D Campus Scene Engine & Modular Section Components
import { Scene } from "@/components/consultancy/Scene";
import { HeroSection } from "@/components/consultancy/sections/HeroSection";
import { WhoWeHelpSection } from "@/components/consultancy/sections/WhoWeHelpSection";
import { ServicesSection } from "@/components/consultancy/sections/ServicesSection";
import { ProcessSection } from "@/components/consultancy/sections/ProcessSection";
import { ResultsSection } from "@/components/consultancy/sections/ResultsSection";
import { PricingSection } from "@/components/consultancy/sections/PricingSection";
import { TestimonialsSection } from "@/components/consultancy/sections/TestimonialsSection";
import { PartnersSection } from "@/components/consultancy/sections/PartnersSection";
import { BookingSection } from "@/components/consultancy/sections/BookingSection";
import { FooterSection } from "@/components/consultancy/sections/FooterSection";

// Dot navigation list with Campus Stop labels
const CAMPUS_STOPS = [
  { id: "hero-section", label: "Main Gate" },
  { id: "who-we-help-section", label: "Campus Quad" },
  { id: "services-section", label: "Central Library" },
  { id: "process-section", label: "Academic Path" },
  { id: "results-section", label: "Project Lab" },
  { id: "pricing-section", label: "Innovation Center" },
  { id: "testimonials-section", label: "Amphitheater" },
  { id: "partners-section", label: "Partners Boulevard" },
  { id: "booking-section", label: "Graduation Stage" },
];

export const Consultancy: React.FC = () => {
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith("/dashboard");

  // Theme state: dark mode default, with bright energetic academic mode toggle
  const [isDark, setIsDark] = useState(true);

  // Scroll Progress State (0.0 to 1.0)
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTargetRef = useRef(0);

  // Active campus stop for dot navigation
  const [activeStopId, setActiveStopId] = useState("hero-section");

  // Selected service or plan to pre-populate booking form
  const [prefilledService, setPrefilledService] = useState("");

  // WebGL & Accessibility States
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // WebGL & Motion Check
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) setIsWebGLSupported(false);
    } catch {
      setIsWebGLSupported(false);
    }

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setPrefersReducedMotion(true);
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Smooth scroll listener with lerp damping
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const totalScroll = container.scrollHeight - container.clientHeight;
      if (totalScroll <= 0) return;
      const progress = Math.min(Math.max(container.scrollTop / totalScroll, 0), 1);
      scrollTargetRef.current = progress;

      // Track active campus stop
      const stopElements = CAMPUS_STOPS.map((stop) => ({
        id: stop.id,
        el: document.getElementById(stop.id),
      }));

      const scrollPos = container.scrollTop + container.clientHeight * 0.35;
      for (let i = stopElements.length - 1; i >= 0; i--) {
        const item = stopElements[i];
        if (item.el && item.el.offsetTop <= scrollPos) {
          setActiveStopId(item.id);
          break;
        }
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });

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
      container.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animFrame);
    };
  }, []);

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectService = (serviceName: string) => {
    setPrefilledService(serviceName);
    scrollToSection("booking-section");
  };

  const handleSelectAudience = (audienceName: string) => {
    setPrefilledService(`Academic Consultation for ${audienceName}`);
    scrollToSection("booking-section");
  };

  const handleSelectPlan = (planName: string) => {
    setPrefilledService(`Engagement Plan: ${planName}`);
    scrollToSection("booking-section");
  };

  return (
    <div
      className={`h-screen w-screen relative overflow-hidden font-sans transition-colors duration-500 ${
        isDark ? "bg-[#020617] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* ─────────────────────────────────────────────────────────────
         1. THIN TOP SCROLL PROGRESS BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-1.5 z-50 bg-slate-950/20">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 transition-all duration-75 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
         2. PERSISTENT 3D CAMPUS SCENE (FIXED CANVAS BEHIND HTML)
         ───────────────────────────────────────────────────────────── */}
      {!prefersReducedMotion && isWebGLSupported ? (
        <Scene
          scrollProgress={scrollProgress}
          isDark={isDark}
          className="fixed inset-0 pointer-events-none z-0"
        />
      ) : (
        /* 2D Fallback Background */
        <div className={`fixed inset-0 pointer-events-none z-0 ${isDark ? "bg-[#020617]" : "bg-[#f1f5f9]"}`}>
          <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[130px]" />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         3. NAVBAR (FIXED, GLASS)
         Logo left. Links: Home, Features, For Students, For Colleges,
         Consultancy (active), Contact. Right: "Book a free session" button.
         ───────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between backdrop-blur-2xl border-b transition-colors ${
          isDark
            ? "bg-[#020617]/85 border-teal-500/20 shadow-lg shadow-black/40"
            : "bg-white/85 border-slate-200/80 shadow-sm"
        }`}
      >
        {/* Logo Left */}
        <div className="flex items-center gap-3">
          <Link to={isInsideDashboard ? "/dashboard" : "/"}>
            <Button
              variant="ghost"
              size="sm"
              className={`gap-2 rounded-xl text-xs h-9 ${
                isDark
                  ? "text-slate-300 hover:text-white hover:bg-emerald-500/10 border border-teal-500/25"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5 text-teal-400" />
              <span>{isInsideDashboard ? "Dashboard" : "Home"}</span>
            </Button>
          </Link>

          <div className="hidden sm:flex items-center gap-2.5">
            <span className="h-4 w-[1px] bg-slate-700/50" />
            <div className="flex items-center gap-1.5 font-bold tracking-tight">
              <span className={`text-sm font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                TASSKLY
              </span>
              <span className="text-emerald-500 text-xs">/</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-sky-500 text-sm font-extrabold">
                CAMPUS
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-400/30">
              3D WORLD
            </span>
          </div>
        </div>

        {/* Center Links (Desktop) */}
        <nav
          className={`hidden xl:flex items-center gap-1 px-3 py-1 rounded-full border backdrop-blur-xl ${
            isDark ? "bg-slate-950/70 border-teal-500/20" : "bg-white/80 border-slate-200"
          }`}
        >
          <Link
            to="/"
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Home
          </Link>

          <button
            onClick={() => scrollToSection("services-section")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Features
          </button>

          <button
            onClick={() => scrollToSection("who-we-help-section")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            For Students
          </button>

          <button
            onClick={() => scrollToSection("pricing-section")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            For Colleges
          </button>

          {/* Active Consultancy link */}
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            Consultancy
          </span>

          <button
            onClick={() => scrollToSection("booking-section")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isDark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Contact
          </button>
        </nav>

        {/* Right CTA & Theme Toggle */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button (Dark mode / Bright academic light mode) */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-2 rounded-xl border transition-colors ${
              isDark
                ? "bg-slate-900/80 border-teal-500/25 text-amber-400 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
            title={isDark ? "Switch to Bright Academic Mode" : "Switch to Cinematic Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>

          {/* Reduced Motion Toggle Button */}
          <button
            onClick={() => setPrefersReducedMotion(!prefersReducedMotion)}
            className={`p-2 rounded-xl border transition-colors hidden sm:block ${
              isDark
                ? "bg-slate-900/80 border-teal-500/25 text-slate-400 hover:text-emerald-400"
                : "bg-white border-slate-200 text-slate-600 hover:text-emerald-600"
            }`}
            title={prefersReducedMotion ? "Enable 3D Motion" : "Reduce Motion (2D Mode)"}
            aria-label="Toggle motion"
          >
            {prefersReducedMotion ? (
              <EyeOff className="h-4 w-4 text-amber-400" />
            ) : (
              <Eye className="h-4 w-4 text-emerald-400" />
            )}
          </button>

          {/* "Book a free session" Button */}
          <Button
            onClick={() => scrollToSection("booking-section")}
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-xs sm:text-sm px-4 sm:px-5 h-9 sm:h-10 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.35)] border border-teal-300/40 transition-all hover:scale-105 active:scale-95 gap-1.5"
          >
            <Calendar className="h-4 w-4" />
            <span>Book a free session</span>
          </Button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
         4. SLIM RIGHT-SIDE DOT NAVIGATION (WITH CAMPUS STOP NAMES)
         ───────────────────────────────────────────────────────────── */}
      <div className="fixed right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-end gap-3 pointer-events-auto">
        {CAMPUS_STOPS.map((stop) => {
          const isActive = activeStopId === stop.id;
          return (
            <button
              key={stop.id}
              onClick={() => scrollToSection(stop.id)}
              className="group flex items-center gap-2.5 focus:outline-none"
              aria-label={`Jump to ${stop.label}`}
            >
              <span
                className={`text-[10px] font-mono tracking-wider transition-all duration-200 uppercase px-2.5 py-0.5 rounded-md backdrop-blur-md ${
                  isActive
                    ? "opacity-100 text-emerald-300 bg-slate-950/80 border border-emerald-400/40 translate-x-0 font-bold"
                    : "opacity-0 group-hover:opacity-100 text-slate-400 bg-slate-950/70 border border-slate-800 translate-x-1 group-hover:translate-x-0"
                }`}
              >
                {stop.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "h-3 w-3 bg-gradient-to-r from-emerald-400 to-sky-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] scale-125"
                    : "h-2 w-2 bg-slate-600 group-hover:bg-teal-400 group-hover:scale-110"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
         5. NON-WEBGL NOTIFICATION (IF UNSUPPORTED)
         ───────────────────────────────────────────────────────────── */}
      {!isWebGLSupported && (
        <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto z-40 p-3 rounded-xl bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2.5 backdrop-blur-xl max-w-md shadow-xl">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>WebGL unavailable on this browser. Running high-performance 2D view.</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         6. CONTINUOUS SCROLL CONTAINER WITH ALL 10 SECTIONS IN ORDER
         ───────────────────────────────────────────────────────────── */}
      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-auto overflow-x-hidden relative z-10 scrollbar-none scroll-smooth pt-14"
        style={{ height: "100vh" }}
      >
        <div className="relative w-full space-y-24 md:space-y-36">

          {/* SECTION 1: HERO */}
          <HeroSection
            onBookClick={() => scrollToSection("booking-section")}
            onExploreColleges={() => scrollToSection("pricing-section")}
            isDark={isDark}
          />

          {/* SECTION 2: WHO WE HELP (3 TALL 3D CARDS) */}
          <WhoWeHelpSection
            onSelectAudience={handleSelectAudience}
            isDark={isDark}
          />

          {/* SECTION 3: SERVICES (3 X 2 GRID) */}
          <ServicesSection
            onSelectService={handleSelectService}
            isDark={isDark}
          />

          {/* SECTION 4: OUR PROCESS (CAMPUS PATH 4 STOPS) */}
          <ProcessSection
            onBookClick={() => scrollToSection("booking-section")}
            isDark={isDark}
          />

          {/* SECTION 5: RESULTS (SPLIT LAYOUT WITH 3 STACKED METRIC CARDS) */}
          <ResultsSection
            onBookClick={() => scrollToSection("booking-section")}
            isDark={isDark}
          />

          {/* SECTION 6: ENGAGEMENT PLANS (3 COLUMNS) */}
          <PricingSection
            onSelectPlan={handleSelectPlan}
            isDark={isDark}
          />

          {/* SECTION 7: STUDENT & COLLEGE STORIES (3D CAROUSEL) */}
          <TestimonialsSection
            onBookClick={() => scrollToSection("booking-section")}
            isDark={isDark}
          />

          {/* SECTION 8: PARTNER COLLEGES STRIP */}
          <PartnersSection isDark={isDark} />

          {/* SECTION 9: FINAL CTA + FORM (TWO COLUMNS) */}
          <BookingSection
            selectedServiceOrTier={prefilledService}
            isDark={isDark}
          />

          {/* SECTION 10: CAMPUS SKYLINE FOOTER */}
          <FooterSection isDark={isDark} />

        </div>
      </div>
    </div>
  );
};

export default Consultancy;
