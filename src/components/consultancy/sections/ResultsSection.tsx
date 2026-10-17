import React, { useState, useEffect } from "react";
import { Card3D } from "../Card3D";
import {
  TrendingUp,
  Clock,
  Sparkles,
  Building2,
  Users,
  Award,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const STUDENT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
];

interface ResultsSectionProps {
  onBookClick: () => void;
  isDark?: boolean;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  onBookClick,
  isDark = true,
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="results-section"
      className="min-h-screen w-full flex flex-col justify-center px-4 md:px-8 lg:px-12 py-20 relative z-10"
    >
      <div className="w-full max-w-6xl mx-auto space-y-12">
        {/* Split Layout: Left Content, Right 3 Stacked Metric Cards at different depths */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          
          {/* Left Column (5 Cols): Heading, Story & Avatar Row */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Stop 05: Project Lab</span>
            </div>

            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Measurable Academic{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                Impact & Results
              </span>
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              We replace chaotic, last-minute cramming and unorganized club fests with crystal-clear workflows. Real metrics recorded across university cohorts.
            </p>

            {/* Small Student-Photo Avatar Row */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center -space-x-2.5">
                {STUDENT_AVATARS.map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    alt={`Student ${idx + 1}`}
                    className="h-10 w-10 rounded-full border-2 border-emerald-400/80 object-cover shadow-md"
                  />
                ))}
                <div className="h-10 w-10 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center border-2 border-slate-900 shadow-md">
                  +10k
                </div>
              </div>

              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                Joined by over <span className="font-bold text-emerald-400">10,000+ ambitious students</span> across IITs, NITs, BITS, and premier universities worldwide.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onBookClick}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Schedule Campus Audit
              </button>
            </div>
          </div>

          {/* Right Column (7 Cols): 3 Stacked Metric Cards at Different 3D Depths */}
          <div className="lg:col-span-7 space-y-4 relative">
            
            {/* Card 1: 35% Fewer Missed Deadlines (Front Depth) */}
            <Card3D depth={20} glare={true} className="w-full">
              <div className={`p-6 rounded-3xl border backdrop-blur-2xl transition-all shadow-xl flex items-center justify-between ${
                isDark ? "bg-[#040e24]/90 border-teal-500/30" : "bg-white/90 border-slate-200"
              }`}>
                <div className="space-y-1 text-left">
                  <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px] font-mono">
                    Time Management
                  </Badge>
                  <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                    35%
                  </p>
                  <h4 className={`text-sm sm:text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    fewer missed deadlines
                  </h4>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Students report on-time submissions across coursework and labs.
                  </p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Clock className="h-8 w-8" />
                </div>
              </div>
            </Card3D>

            {/* Card 2: 50+ Campuses (Middle Depth) */}
            <Card3D depth={14} glare={true} className="w-full lg:translate-x-3">
              <div className={`p-6 rounded-3xl border backdrop-blur-2xl transition-all shadow-xl flex items-center justify-between ${
                isDark ? "bg-[#040e24]/90 border-teal-500/30" : "bg-white/90 border-slate-200"
              }`}>
                <div className="space-y-1 text-left">
                  <Badge variant="outline" className="bg-sky-500/10 border-sky-500/30 text-sky-400 text-[10px] font-mono">
                    Institutional Adoption
                  </Badge>
                  <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
                    50+
                  </p>
                  <h4 className={`text-sm sm:text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    campuses partnered
                  </h4>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Colleges and universities using Tasskly for departmental success.
                  </p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Building2 className="h-8 w-8" />
                </div>
              </div>
            </Card3D>

            {/* Card 3: 10,000+ Students (Deepest Depth) */}
            <Card3D depth={10} glare={true} className="w-full lg:translate-x-6">
              <div className={`p-6 rounded-3xl border backdrop-blur-2xl transition-all shadow-xl flex items-center justify-between ${
                isDark ? "bg-[#040e24]/90 border-teal-500/30" : "bg-white/90 border-slate-200"
              }`}>
                <div className="space-y-1 text-left">
                  <Badge variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400 text-[10px] font-mono">
                    Student Community
                  </Badge>
                  <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                    10,000+
                  </p>
                  <h4 className={`text-sm sm:text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    students organized
                  </h4>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    Active learners hitting target GPAs and landing top internships.
                  </p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Users className="h-8 w-8" />
                </div>
              </div>
            </Card3D>

          </div>

        </div>
      </div>
    </section>
  );
};
