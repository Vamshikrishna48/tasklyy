import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card3D } from "../Card3D";
import {
  TrendingUp,
  Clock,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Building2,
  Quote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface MetricCardData {
  id: string;
  metric: string;
  label: string;
  highlight: string;
  fillPercentage: number;
  barColor: string;
  subtext: string;
  companyType: string;
  teamSize: string;
  quote: string;
  author: string;
  role: string;
  beforeStats: string;
  afterStats: string;
}

export const METRICS_DATA: MetricCardData[] = [
  {
    id: "metric-meetings",
    metric: "40%",
    label: "less time on status meetings",
    highlight: "Replaced 6.5 weekly meeting hours with async automated digests",
    fillPercentage: 40,
    barColor: "from-emerald-400 to-teal-300",
    subtext: "Replaced synchronous status roundtables with automated sprint digests and Slack integrations.",
    companyType: "FinTech Scaleup",
    teamSize: "65 Engineers & Leads",
    quote: "Our engineers got their mornings back. Focus time shot up immediately, and our pull request review turnaround dropped from 28 hours to under 4 hours.",
    author: "Karthik Subramanian",
    role: "VP of Engineering",
    beforeStats: "8.5 hrs/week in sync calls",
    afterStats: "2.1 hrs/week focused async",
  },
  {
    id: "metric-velocity",
    metric: "3.2x",
    label: "faster task completion",
    highlight: "Slashed sprint cycle times from 18 days to 5.5 days",
    fillPercentage: 85,
    barColor: "from-sky-400 to-blue-400",
    subtext: "Eliminated cross-team dependency blocking with crystal-clear handoff definitions and automated triggers.",
    companyType: "B2B SaaS Platform",
    teamSize: "120 Product Staff",
    quote: "Our roadmap was stalled by constant inter-team bottlenecks. Tasskly's consultants audited our system, rebuilt our Linear automations, and tripled our shipping velocity.",
    author: "Elena Rostova",
    role: "Director of Product Operations",
    beforeStats: "18.2 days per feature cycle",
    afterStats: "5.4 days per feature cycle",
  },
  {
    id: "metric-handovers",
    metric: "85%",
    label: "reduction in project handover delays",
    highlight: "Zero stalled tasks between Design, Frontend, and QA",
    fillPercentage: 85,
    barColor: "from-teal-300 to-emerald-400",
    subtext: "Standardized acceptance criteria with Figma-to-code automated webhooks and CI/CD status synchronization.",
    companyType: "E-Commerce Tech Group",
    teamSize: "40 Full-Stack Developers",
    quote: "Handoff friction between Figma and code practically evaporated. Every engineer knows exactly what to build without a single back-and-forth Slack thread.",
    author: "Marcus Vance",
    role: "Staff Infrastructure Architect",
    beforeStats: "4.2 days idle handover lag",
    afterStats: "Under 3 hours automated handover",
  },
];

interface ResultsSectionProps {
  onBookClick: () => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({ onBookClick }) => {
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
      className="min-h-screen w-full flex flex-col justify-center px-4 md:px-8 py-20 relative z-10"
    >
      <div className="w-full max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Proven Benchmarks</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Real Metrics.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Validated Velocity.
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            We don't deal in vague theories. Every consulting engagement is tied directly to measurable operational KPIs, tracked in real-time.
          </p>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {METRICS_DATA.map((item) => (
            <Card3D
              key={item.id}
              depth={18}
              glare={true}
              className="h-full group cursor-default"
            >
              <div className="h-full p-6 sm:p-7 rounded-3xl bg-[#040e24]/90 backdrop-blur-2xl border border-teal-500/25 group-hover:border-emerald-400/50 shadow-xl flex flex-col justify-between transition-colors space-y-6">
                {/* Metric Counter & Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className="bg-slate-900/60 border-teal-500/30 text-teal-300 text-[11px] font-mono flex items-center gap-1.5"
                    >
                      <Building2 className="h-3 w-3 text-teal-400" />
                      <span>{item.companyType}</span>
                    </Badge>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.teamSize}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl sm:text-6xl font-black text-white tracking-tighter drop-shadow-md">
                        {item.metric}
                      </span>
                    </div>
                    <p className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 mt-1">
                      {item.label}
                    </p>
                  </div>

                  {/* Animated 3D Metric Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>Metric Delta</span>
                      <span className="text-emerald-400 font-bold">{item.metric}</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-900/80 p-0.5 border border-teal-500/30 overflow-hidden shadow-inner">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${item.barColor} transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(16,185,129,0.5)]`}
                        style={{
                          width: animatedProgress ? `${item.fillPercentage}%` : "0%",
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pt-2">
                    {item.subtext}
                  </p>

                  {/* Before / After Impact comparison */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-left">
                      <p className="text-[10px] uppercase font-mono text-slate-400">Before</p>
                      <p className="text-xs font-semibold text-rose-300 line-through mt-0.5">
                        {item.beforeStats}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-left">
                      <p className="text-[10px] uppercase font-mono text-emerald-400">After Tasskly</p>
                      <p className="text-xs font-semibold text-emerald-300 mt-0.5">
                        {item.afterStats}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Client Quote Footer */}
                <div className="pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-start gap-2">
                    <Quote className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-300 italic line-clamp-3">
                      "{item.quote}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div>
                      <p className="font-bold text-white">{item.author}</p>
                      <p className="text-[10px] text-slate-400">{item.role}</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-mono">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card3D>
          ))}
        </div>

        {/* Guarantee Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#040e24] to-sky-950/40 border border-emerald-500/30 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>The Tasskly 90-Day Velocity Guarantee</span>
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">
              If your team does not experience a measurable reduction in meeting hours and a minimum 30% increase in sprint cycle completion within 90 days, we continue consulting for free.
            </p>
          </div>
          <button
            onClick={onBookClick}
            className="px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-black shrink-0 transition-all shadow-md shadow-emerald-500/20"
          >
            Claim Free Audit
          </button>
        </div>
      </div>
    </section>
  );
};
