import React from "react";
import { Sparkles, Building2, School } from "lucide-react";

export const PARTNER_COLLEGES = [
  { name: "IIT Madras", location: "Chennai", type: "Institute of National Importance" },
  { name: "BITS Pilani", location: "Pilani & Goa", type: "Premier Tech Institute" },
  { name: "IIT Delhi", location: "New Delhi", type: "Engineering & Research" },
  { name: "NIT Trichy", location: "Tiruchirappalli", type: "National Tech Institute" },
  { name: "VIT University", location: "Vellore", type: "Autonomous University" },
  { name: "Delhi University", location: "New Delhi", type: "Central University" },
  { name: "PES University", location: "Bengaluru", type: "Engineering & Management" },
  { name: "IIT Bombay", location: "Mumbai", type: "Research & Innovation" },
];

interface PartnersSectionProps {
  isDark?: boolean;
}

export const PartnersSection: React.FC<PartnersSectionProps> = ({ isDark = true }) => {
  return (
    <section
      id="partners-section"
      className="w-full py-16 px-4 md:px-8 relative z-10 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-8 text-center">
        {/* Eyebrow & Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-wider">
            <School className="h-3 w-3" />
            <span>Stop 08: Partners Boulevard</span>
          </div>

          <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
            Trusted by Campuses Across the Country
          </h3>

          <p className={`text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Empowering students, student societies, and faculties across 60+ universities nationwide.
          </p>
        </div>

        {/* Slow-Moving Infinite Marquee Row */}
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex w-max gap-4 animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
            {[...PARTNER_COLLEGES, ...PARTNER_COLLEGES].map((college, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border backdrop-blur-xl flex items-center gap-3.5 min-w-[240px] text-left transition-all ${
                  isDark
                    ? "bg-[#040e24]/80 border-teal-500/20 hover:border-emerald-400/50"
                    : "bg-white/80 border-slate-200 hover:border-emerald-400 shadow-sm"
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-teal-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold font-mono text-sm">
                  {college.name.substring(0, 3)}
                </div>
                <div>
                  <h4 className={`text-sm font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    {college.name}
                  </h4>
                  <p className="text-[10px] text-teal-400 font-medium">
                    {college.location} • {college.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
