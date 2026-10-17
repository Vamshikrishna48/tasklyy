import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  LineChart,
  Cpu,
  Trophy,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ProcessStep {
  number: string;
  id: string;
  title: string;
  timeframe: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  deliverables: string[];
  keyOutcome: string;
  accent: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: "01",
    id: "discover",
    title: "Discover",
    timeframe: "Days 1 – 7",
    tagline: "Forensic Operational Audit",
    icon: Compass,
    description:
      "We dive deep into your active sprints, communication channels, and tooling architecture. Through structured 1-on-1 team interviews and asynchronous activity tracking, we identify every friction point slowing your engineers down.",
    deliverables: [
      "Cross-functional team workflow interviews",
      "Meeting fatigue and calendar overlap analysis",
      "Tool sprawl and notification audit",
    ],
    keyOutcome: "Pinpointed baseline latency and high-value target areas.",
    accent: "text-emerald-400 border-emerald-400/40 bg-emerald-500/10",
  },
  {
    number: "02",
    id: "analyze",
    title: "Analyze",
    timeframe: "Days 8 – 14",
    tagline: "Friction Mapping & Strategy",
    icon: LineChart,
    description:
      "We turn qualitative feedback into hard operational metrics. You receive a comprehensive Bottleneck Heatmap, highlighting where tasks stall, where context switching occurs, and how many productive hours are lost each sprint.",
    deliverables: [
      "Sprint cycle time & WIP bottleneck heatmaps",
      "Quantified velocity scorecard with benchmark comparison",
      "Prioritized 90-day roadmap with guaranteed ROI metrics",
    ],
    keyOutcome: "A bulletproof strategic blueprint for team velocity.",
    accent: "text-sky-400 border-sky-400/40 bg-sky-500/10",
  },
  {
    number: "03",
    id: "implement",
    title: "Implement",
    timeframe: "Days 15 – 45",
    tagline: "Hands-On System Engineering",
    icon: Cpu,
    description:
      "We don't just hand you a PDF and leave. Our consultants actively build out your automated pipelines, configure your workspace templates, write webhook integrations, and guide your team through seamless onboarding without pausing ongoing sprints.",
    deliverables: [
      "Custom webhook automations (Slack / Linear / GitHub / Notion)",
      "Standardized async task triage and handoff protocols",
      "Live interactive workshops and role-specific playbooks",
    ],
    keyOutcome: "Zero-friction operational systems running in production.",
    accent: "text-teal-300 border-teal-400/40 bg-teal-500/10",
  },
  {
    number: "04",
    id: "optimize",
    title: "Optimize",
    timeframe: "Days 46 – 90",
    tagline: "Continuous Benchmarking & Culture",
    icon: Trophy,
    description:
      "Long-term velocity requires continuous validation. We conduct bi-weekly velocity retrospectives, monitor automated health checks, and fine-tune team rituals to ensure high performance becomes second nature.",
    deliverables: [
      "Bi-weekly sprint retrospective auditing",
      "Automated team health scorecards and sentiment surveys",
      "Final 90-Day ROI & Velocity Acceleration Report",
    ],
    keyOutcome: "Sustained high-velocity culture that scales with headcount.",
    accent: "text-cyan-400 border-cyan-400/40 bg-cyan-500/10",
  },
];

interface ProcessSectionProps {
  onBookClick: () => void;
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({ onBookClick }) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = PROCESS_STEPS[activeStepIndex];
  const StepIcon = activeStep.icon;

  return (
    <section
      id="process-section"
      className="min-h-screen w-full flex flex-col justify-center px-4 md:px-8 py-20 relative z-10"
    >
      <div className="w-full max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Our Proven Framework</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            The 4-Step Velocity{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Trajectory
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            A battle-tested methodology engineered to transition chaotic, meeting-heavy teams into asynchronous, high-focus productivity powerhouses.
          </p>
        </div>

        {/* 4 Steps Interactive Navigation Rail */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {PROCESS_STEPS.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-4 md:p-5 rounded-2xl text-left transition-all relative overflow-hidden backdrop-blur-xl border ${
                  isSelected
                    ? "bg-[#040e24]/90 border-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.25)] scale-[1.02]"
                    : "bg-[#040e24]/60 border-teal-500/20 hover:border-teal-400/40 hover:bg-[#040e24]/80 opacity-80 hover:opacity-100"
                }`}
              >
                {/* Glowing Active Indicator Bar */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-sky-400" />
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-black tracking-widest text-slate-400">
                    STEP {step.number}
                  </span>
                  <div
                    className={`p-2 rounded-xl border ${
                      isSelected
                        ? step.accent
                        : "text-slate-400 border-slate-700 bg-slate-900/40"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="text-base md:text-lg font-bold text-white tracking-tight">
                  {step.title}
                </h3>
                <p className="text-xs text-emerald-400/90 font-medium mt-1">
                  {step.timeframe}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Step Deep-Dive Showcase Card */}
        <div className="p-6 md:p-10 rounded-3xl bg-[#040e24]/90 backdrop-blur-2xl border border-teal-500/30 shadow-2xl relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                  PHASE {activeStep.number} OF 04
                </span>
                <span className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                  <Clock className="h-3.5 w-3.5 text-teal-400" />
                  {activeStep.timeframe}
                </span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {activeStep.title}:{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                    {activeStep.tagline}
                  </span>
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mt-3">
                  {activeStep.description}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Core Deliverables
                </h4>
                <div className="space-y-2">
                  {activeStep.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={onBookClick}
                  className="bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-xs sm:text-sm px-6 h-11 rounded-xl shadow-lg shadow-emerald-500/25 border border-teal-300/40 transition-all hover:scale-105 active:scale-95 gap-2"
                >
                  <span>Start Phase 1 with Our Team</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right Card: Outcome Spotlight (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950/70 border border-teal-500/30 backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${activeStep.accent}`}>
                    <StepIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">Guaranteed Outcome</h5>
                    <p className="text-[11px] text-slate-400">Tangible Sprint Impact</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed italic bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20">
                "{activeStep.keyOutcome}"
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Transformation Completion</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {((activeStepIndex + 1) / 4) * 100}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 transition-all duration-500 rounded-full"
                    style={{ width: `${((activeStepIndex + 1) / 4) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Integrated with Linear, Jira & Notion</span>
                <span className="text-emerald-400 font-mono">100% Guaranteed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
