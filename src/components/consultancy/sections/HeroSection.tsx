import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Calendar,
  Building2,
  Users,
  Award,
  BookOpen,
  ArrowRight,
  MousePointer,
  ChevronDown,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

interface HeroSectionProps {
  onBookClick: () => void;
  onExploreColleges: () => void;
  isDark?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBookClick,
  onExploreColleges,
  isDark = true,
}) => {
  return (
    <section
      id="hero-section"
      className="min-h-screen w-full flex flex-col justify-center px-4 md:px-8 lg:px-12 pt-20 pb-16 relative z-10"
    >
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column (7 Cols on desktop): Editorial Content & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-left pointer-events-auto">
          
          {/* Eyebrow Label */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold tracking-widest uppercase shadow-md ${
              isDark
                ? "bg-emerald-500/15 border border-emerald-400/30 text-emerald-300"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            <GraduationCap className="h-4 w-4 text-emerald-500 animate-pulse" />
            <span>TASSKLY FOR CAMPUS</span>
          </motion.div>

          {/* Bold, Friendly Rounded Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={`text-4xl sm:text-6xl lg:text-[72px] font-black tracking-tight leading-[1.08] ${
              isDark ? "text-white" : "text-slate-900"
            }`}
          >
            Stay Organized.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500">
              Beat Deadlines.
            </span>{" "}
            Graduate Ahead.
          </motion.h1>

          {/* 2-Line Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`text-base sm:text-xl leading-relaxed max-w-2xl ${
              isDark ? "text-slate-300" : "text-slate-700 font-normal"
            }`}
          >
            The dedicated academic productivity consultancy helping ambitious students, campus clubs, and universities replace deadline stress with frictionless study workflows.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
          >
            <Button
              onClick={onBookClick}
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-sm px-8 h-13 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.35)] border border-teal-300/40 transition-all hover:scale-105 active:scale-95 gap-2"
            >
              <Calendar className="h-4 w-4" />
              <span>Book a free consultation</span>
            </Button>

            <Button
              variant="outline"
              onClick={onExploreColleges}
              className={`h-13 rounded-2xl px-7 text-sm font-bold gap-2 transition-all ${
                isDark
                  ? "border-teal-500/30 bg-slate-950/60 hover:bg-emerald-500/10 text-emerald-300 hover:text-white"
                  : "border-slate-300 bg-white/80 hover:bg-slate-100 text-slate-800"
              }`}
            >
              <Building2 className="h-4 w-4 text-emerald-500" />
              <span>Explore for colleges</span>
            </Button>
          </motion.div>

          {/* Three Trust Stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-6 grid grid-cols-3 gap-3 sm:gap-6 max-w-xl"
          >
            <div
              className={`p-3.5 sm:p-4 rounded-2xl border backdrop-blur-xl ${
                isDark
                  ? "bg-[#040e24]/75 border-teal-500/25"
                  : "bg-white/80 border-slate-200/80 shadow-sm"
              }`}
            >
              <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                25,000+
              </p>
              <p className={`text-[11px] sm:text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Students Guided
              </p>
            </div>

            <div
              className={`p-3.5 sm:p-4 rounded-2xl border backdrop-blur-xl ${
                isDark
                  ? "bg-[#040e24]/75 border-teal-500/25"
                  : "bg-white/80 border-slate-200/80 shadow-sm"
              }`}
            >
              <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
                60+
              </p>
              <p className={`text-[11px] sm:text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Partner Campuses
              </p>
            </div>

            <div
              className={`p-3.5 sm:p-4 rounded-2xl border backdrop-blur-xl ${
                isDark
                  ? "bg-[#040e24]/75 border-teal-500/25"
                  : "bg-white/80 border-slate-200/80 shadow-sm"
              }`}
            >
              <p className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                3.8x
              </p>
              <p className={`text-[11px] sm:text-xs mt-0.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Productivity Gain
              </p>
            </div>
          </motion.div>

        </div>

        {/* Right Column (5 Cols): Interactive 3D Callout Card showcasing campus centerpiece */}
        <div className="lg:col-span-5 relative flex flex-col items-center justify-center pointer-events-auto">
          <div
            className={`w-full max-w-md p-6 rounded-3xl border backdrop-blur-2xl transition-all ${
              isDark
                ? "bg-[#040e24]/80 border-teal-500/30 shadow-[0_0_40px_rgba(16,185,129,0.15)]"
                : "bg-white/85 border-slate-200 shadow-xl"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
              <div className="flex items-center gap-2.5">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Live 3D Campus World
                </span>
              </div>
              <span className={`text-[10px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Stop 01: Main Gate
              </span>
            </div>

            <div className="py-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className={isDark ? "text-slate-300" : "text-slate-700"}>Central University Quad</span>
                <span className="text-emerald-400 font-bold">100% In Focus</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isDark ? "bg-slate-900/60 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <span className="flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5 text-teal-400" />
                    <span>Semester Exam Roadmap</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">Done</span>
                </div>

                <div className={`p-2.5 rounded-xl border flex items-center justify-between ${
                  isDark ? "bg-slate-900/60 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}>
                  <span className="flex items-center gap-2">
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    <span>Club Hackathon Registration</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">Active</span>
                </div>
              </div>
            </div>

            <p className={`text-[11px] leading-relaxed italic ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              Scroll down to travel through the Central Library, Project Labs, and Graduation Stage.
            </p>
          </div>
        </div>

      </div>

      {/* Scroll Indicator at Bottom Center */}
      <div className="pt-12 flex flex-col items-center justify-center gap-1.5 text-xs font-mono text-slate-400 pointer-events-auto">
        <MousePointer className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
        <span>Scroll to tour our 3D campus path</span>
        <ChevronDown className="h-4 w-4 text-teal-400 animate-bounce" />
      </div>
    </section>
  );
};
