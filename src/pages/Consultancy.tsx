import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowLeft,
  Calendar,
  Zap,
  MousePointer,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";

// 3D Scene Engine & Modular Section Components
import { Scene } from "@/components/consultancy/Scene";
import { HeroSection } from "@/components/consultancy/sections/HeroSection";
import { ServicesSection } from "@/components/consultancy/sections/ServicesSection";
import { ProcessSection } from "@/components/consultancy/sections/ProcessSection";
import { ResultsSection } from "@/components/consultancy/sections/ResultsSection";
import { PricingSection } from "@/components/consultancy/sections/PricingSection";
import { TestimonialsSection } from "@/components/consultancy/sections/TestimonialsSection";
import { BookingSection } from "@/components/consultancy/sections/BookingSection";
import { FooterSection } from "@/components/consultancy/sections/FooterSection";

// Dot navigation list mapping to section IDs
const SECTION_NAV_ITEMS = [
  { id: "hero-section", label: "Hero" },
  { id: "services-section", label: "Services" },
  { id: "process-section", label: "Process" },
  { id: "results-section", label: "Results" },
  { id: "pricing-section", label: "Pricing" },
  { id: "testimonials-section", label: "Testimonials" },
  { id: "booking-section", label: "Book Consultation" },
];

export const Consultancy: React.FC = () => {
  const location = useLocation();
  const isInsideDashboard = location.pathname.startsWith("/dashboard");

  // Scroll Progress State (0.0 to 1.0)
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTargetRef = useRef(0);

  // Active section for dot navigation
  const [activeSectionId, setActiveSectionId] = useState("hero-section");

  // Selected service/tier to pre-fill in consultation form
  const [prefilledService, setPrefilledService] = useState("");

  // WebGL & Accessibility States
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [is3DLoaded, setIs3DLoaded] = useState(false);

  // Check WebGL support & Reduced Motion preference on mount
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setIsWebGLSupported(false);
      }
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

    // Fallback timer to reveal content if WebGL is delayed
    const timer = setTimeout(() => {
      setIs3DLoaded(true);
    }, 850);

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      clearTimeout(timer);
    };
  }, []);

  // Smooth buttery scroll listener with lerp damping
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const totalScroll = container.scrollHeight - container.clientHeight;
      if (totalScroll <= 0) return;
      const progress = Math.min(Math.max(container.scrollTop / totalScroll, 0), 1);
      scrollTargetRef.current = progress;

      // Update active section based on scroll positions
      const sectionElements = SECTION_NAV_ITEMS.map((item) => ({
        id: item.id,
        el: document.getElementById(item.id),
      }));

      const scrollPos = container.scrollTop + container.clientHeight * 0.35;
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const item = sectionElements[i];
        if (item.el && item.el.offsetTop <= scrollPos) {
          setActiveSectionId(item.id);
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

  // Smooth scroll to section helper
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

  const handleSelectTier = (tierName: string) => {
    setPrefilledService(tierName);
    scrollToSection("booking-section");
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#020617] text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-white">
      
      {/* ─────────────────────────────────────────────────────────────
         1. FIXED TOP SCROLL PROGRESS BAR
         ───────────────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-950/80">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 transition-all duration-75 shadow-[0_0_12px_rgba(16,185,129,0.7)]"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
         2. PERSISTENT 3D SCENE (FIXED CANVAS BEHIND HTML CONTENT)
         ───────────────────────────────────────────────────────────── */}
      {!prefersReducedMotion && isWebGLSupported ? (
        <Scene
          scrollProgress={scrollProgress}
          onLoaded={() => setIs3DLoaded(true)}
          className="fixed inset-0 pointer-events-none z-0"
        />
      ) : (
        /* 2D Fallback Background if WebGL is disabled or Reduced Motion is active */
        <div className="fixed inset-0 pointer-events-none z-0 bg-[#020617]">
          <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-sky-500/10 rounded-full blur-[130px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px]" />
        </div>
      )}

      {/* Atmospheric Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/5 rounded-full blur-[130px]" />
        <div className="absolute top-1/2 right-1/4 w-[550px] h-[550px] bg-sky-500/5 rounded-full blur-[120px]" />
      </div>

      {/* ─────────────────────────────────────────────────────────────
         3. FIXED HEADER (TASSKLY / CONSULTANCY)
         ───────────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between bg-[#020617]/85 backdrop-blur-2xl border-b border-teal-500/20 shadow-lg">
        {/* Left Eyebrow & Brand */}
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
              3D SCENE
            </span>
          </div>
        </div>

        {/* Center Quick Nav (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 px-3 py-1 rounded-full bg-slate-950/70 border border-teal-500/20 backdrop-blur-xl">
          {SECTION_NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                activeSectionId === item.id
                  ? "text-emerald-300 bg-emerald-500/20 font-bold"
                  : "text-slate-300 hover:text-white hover:bg-emerald-500/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right CTA & Motion Toggle */}
        <div className="flex items-center gap-3">
          {/* Reduced Motion Toggle Button */}
          <button
            onClick={() => setPrefersReducedMotion(!prefersReducedMotion)}
            className="p-2 rounded-xl bg-slate-900/80 border border-teal-500/20 text-slate-400 hover:text-emerald-300 hover:border-emerald-400/40 transition-colors"
            title={prefersReducedMotion ? "Enable 3D Motion" : "Reduce Motion (2D Mode)"}
            aria-label="Toggle motion"
          >
            {prefersReducedMotion ? (
              <EyeOff className="h-4 w-4 text-amber-400" />
            ) : (
              <Eye className="h-4 w-4 text-emerald-400" />
            )}
          </button>

          <Button
            onClick={() => scrollToSection("booking-section")}
            className="relative group overflow-hidden bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-xs md:text-sm px-4 md:px-5 h-9 md:h-10 rounded-xl shadow-[0_0_25px_rgba(16,185,129,0.4)] border border-teal-300/40 transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>Book Consultation</span>
            </span>
          </Button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
         4. FIXED RIGHT-SIDE DOT NAVIGATION
         ───────────────────────────────────────────────────────────── */}
      <div className="fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-end gap-3.5 pointer-events-auto">
        {SECTION_NAV_ITEMS.map((item) => {
          const isActive = activeSectionId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="group flex items-center gap-2.5 focus:outline-none"
              aria-label={`Jump to ${item.label}`}
            >
              <span
                className={`text-[10px] font-mono tracking-wider transition-all duration-200 uppercase px-2 py-0.5 rounded-md backdrop-blur-md ${
                  isActive
                    ? "opacity-100 text-emerald-300 bg-slate-900/80 border border-emerald-400/40 translate-x-0"
                    : "opacity-0 group-hover:opacity-100 text-slate-400 bg-slate-950/70 border border-slate-800 translate-x-1 group-hover:translate-x-0"
                }`}
              >
                {item.label}
              </span>
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isActive
                    ? "h-3 w-3 bg-gradient-to-r from-emerald-400 to-sky-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] scale-125"
                    : "h-2 w-2 bg-slate-700 group-hover:bg-teal-400 group-hover:scale-110"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
         5. NON-WEBGL NOTIFICATION BANNER (IF UNSUPPORTED)
         ───────────────────────────────────────────────────────────── */}
      {!isWebGLSupported && (
        <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto z-40 p-3 rounded-xl bg-amber-950/90 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2.5 backdrop-blur-xl max-w-md shadow-xl">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>WebGL is unavailable on this device. Displaying optimized high-performance 2D view.</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
         6. CONTINUOUS SCROLL CONTAINER WITH ALL 7 SECTIONS + FOOTER
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
            onExploreClick={() => scrollToSection("services-section")}
          />

          {/* SECTION 2: SERVICES (6 3D TILT/FLIP CARDS) */}
          <ServicesSection onSelectService={handleSelectService} />

          {/* SECTION 3: OUR PROCESS (4-STEP TIMELINE) */}
          <ProcessSection onBookClick={() => scrollToSection("booking-section")} />

          {/* SECTION 4: RESULTS / CASE STUDIES (3 METRICS & 3D BARS) */}
          <ResultsSection onBookClick={() => scrollToSection("booking-section")} />

          {/* SECTION 5: ENGAGEMENT MODELS / PRICING (3 TIERS) */}
          <PricingSection onSelectTier={handleSelectTier} />

          {/* SECTION 6: TESTIMONIALS (3D CAROUSEL RING) */}
          <TestimonialsSection onBookClick={() => scrollToSection("booking-section")} />

          {/* SECTION 7: FINAL CTA + BOOKING FORM */}
          <BookingSection selectedServiceOrTier={prefilledService} />

          {/* SECTION 8: TASSKLY FOOTER */}
          <FooterSection />

        </div>
      </div>
    </div>
  );
};

export default Consultancy;
