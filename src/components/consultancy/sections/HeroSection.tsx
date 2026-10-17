import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, ChevronDown, MousePointer, ShieldCheck, Zap, Users, TrendingUp } from "lucide-react";

interface HeroSectionProps {
  onBookClick: () => void;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onBookClick, onExploreClick }) => {
  return (
    <section
      id="hero-section"
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-8 text-center relative z-10"
    >
      <div className="w-full max-w-4xl mx-auto space-y-6 pointer-events-auto">
        
        {/* Eyebrow Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase shadow-[0_0_25px_rgba(16,185,129,0.3)]"
        >
          <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>TASSKLY / CONSULTANCY</span>
        </motion.div>

        {/* Exact Requested Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]"
        >
          Consulting that gets{" "}
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
            your team moving
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-slate-200 text-base md:text-xl leading-relaxed max-w-2xl mx-auto drop-shadow-md"
        >
          Strategic productivity audits, workflow engineering, and hands-on system implementation to eliminate operational bottlenecks and 10x your team's velocity.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            onClick={onBookClick}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-sm px-8 h-13 rounded-2xl shadow-[0_0_35px_rgba(16,185,129,0.5)] border border-teal-300/40 transition-all hover:scale-105 active:scale-95 gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Book a free consultation</span>
          </Button>

          <Button
            variant="outline"
            onClick={onExploreClick}
            className="w-full sm:w-auto border-teal-500/40 bg-slate-950/60 hover:bg-emerald-500/10 text-emerald-300 hover:text-white h-13 rounded-2xl px-7 text-sm backdrop-blur-xl gap-2 font-bold transition-all"
          >
            <span>Explore Services</span>
            <ChevronDown className="h-4 w-4 animate-bounce" />
          </Button>
        </motion.div>

        {/* Metric Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-3.5 max-w-3xl mx-auto"
        >
          {[
            { icon: Zap, label: "40% Time Saved", sub: "Less Status Meetings" },
            { icon: TrendingUp, label: "3.2x Task Velocity", sub: "Faster Sprint Cycles" },
            { icon: Users, label: "85% Handover Drop", sub: "Reduced Delay Friction" },
            { icon: ShieldCheck, label: "100% Escrow Protected", sub: "Guaranteed Outcome" },
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

        {/* Scroll Indicator */}
        <div className="pt-8 flex flex-col items-center justify-center gap-1.5 text-xs font-mono text-slate-400">
          <MousePointer className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
          <span>Scroll to explore the 3D workflow journey</span>
          <ChevronDown className="h-4 w-4 text-teal-400 animate-bounce" />
        </div>

      </div>
    </section>
  );
};
