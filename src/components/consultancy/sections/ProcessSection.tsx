import React, { useState } from "react";
import {
  Compass,
  MapPin,
  Cpu,
  Trophy,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Building,
  GraduationCap,
  BookOpen,
  School,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CampusProcessStep {
  number: string;
  id: string;
  title: string;
  landmark: string;
  timeframe: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  deliverables: string[];
  keyOutcome: string;
  accent: string;
}

export const CAMPUS_PROCESS_STEPS: CampusProcessStep[] = [
  {
    number: "01",
    id: "understand",
    title: "Understand Your Campus",
    landmark: "Campus Admissions & Quad",
    timeframe: "Week 1",
    icon: Compass,
    description:
      "We interview students, professors, and department chairs to map your academic calendar, peak exam pressure points, and current tools in use.",
    deliverables: [
      "Semester Deadline & Exam Stress Mapping",
      "Club & Department Toolchain Inventory",
      "Student Workload & Friction Assessment",
    ],
    keyOutcome: "A clear diagnosis of where deadlines slip and stress originates.",
    accent: "text-emerald-400 border-emerald-400/40 bg-emerald-500/10",
  },
  {
    number: "02",
    id: "plan",
    title: "Plan",
    landmark: "Department Blueprint Hall",
    timeframe: "Week 2",
    icon: School,
    description:
      "We architect a tailored academic operating system: custom syllabus templates, club event pipelines, and study sprint boards optimized for your university.",
    deliverables: [
      "Custom Course & Syllabus Template Architecture",
      "Student Club Collaboration Schemas",
      "Placement Cell Company Tracking Board",
    ],
    keyOutcome: "A structured, frictionless academic operating blueprint.",
    accent: "text-sky-400 border-sky-400/40 bg-sky-500/10",
  },
  {
    number: "03",
    id: "implement",
    title: "Implement",
    landmark: "Innovation Lab & Workshop",
    timeframe: "Weeks 3 – 4",
    icon: Cpu,
    description:
      "We roll out workspaces, connect student calendars, configure Discord/Slack reminders, and conduct live interactive workshops with students and faculty.",
    deliverables: [
      "Workspace Setup & Calendar Synchronization",
      "Live 60-Minute Student Onboarding Workshop",
      "Faculty & Club Lead Training Sessions",
    ],
    keyOutcome: "Fully functional, live academic workspaces in production.",
    accent: "text-teal-300 border-teal-400/40 bg-teal-500/10",
  },
  {
    number: "04",
    id: "support-grow",
    title: "Support & Grow",
    landmark: "Convocation & Alumni Hall",
    timeframe: "Ongoing Semesters",
    icon: Trophy,
    description:
      "Continuous milestone reviews at midterms and finals, student ambassador support, and new semester template refreshes to ensure enduring success.",
    deliverables: [
      "Midterm & Finals Productivity Health Checks",
      "Dedicated Campus Ambassador Guild Access",
      "Semester-by-Semester Template Refreshes",
    ],
    keyOutcome: "Permanent campus culture of calm, high-velocity achievement.",
    accent: "text-amber-400 border-amber-400/40 bg-amber-500/10",
  },
];

interface ProcessSectionProps {
  onBookClick: () => void;
  isDark?: boolean;
}

export const ProcessSection: React.FC<ProcessSectionProps> = ({
  onBookClick,
  isDark = true,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = CAMPUS_PROCESS_STEPS[activeStepIndex];
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
            <span>Stop 04: Academic Path</span>
          </div>

          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Our Campus{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Path & Process
            </span>
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed ${
            isDark ? "text-slate-300" : "text-slate-700 font-normal"
          }`}>
            Four milestone stops along our curved 3D campus road to bring clarity, calm, and high performance to your semester.
          </p>
        </div>

        {/* 4 Numbered Stops along Curved Road Rail */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CAMPUS_PROCESS_STEPS.map((step, idx) => {
            const isSelected = activeStepIndex === idx;
            const Icon = step.icon;

            return (
              <button
                key={step.id}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-5 rounded-3xl text-left transition-all relative overflow-hidden backdrop-blur-xl border ${
                  isSelected
                    ? "bg-[#040e24]/95 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-[1.03] z-20"
                    : isDark
                    ? "bg-[#040e24]/60 border-teal-500/20 hover:border-teal-400/40 opacity-70 hover:opacity-100 scale-95"
                    : "bg-white/80 border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100 scale-95 shadow-sm"
                }`}
              >
                {/* Active Indicator Top Glow */}
                {isSelected && (
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400" />
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-black tracking-widest text-emerald-400">
                    STOP {step.number}
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

                <h3 className={`text-base font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {step.title}
                </h3>
                <p className="text-[11px] text-teal-400 font-medium mt-1">
                  {step.landmark}
                </p>
              </button>
            );
          })}
        </div>

        {/* Active Stop Spotlight Showcase Card */}
        <div
          className={`p-6 sm:p-10 rounded-3xl backdrop-blur-2xl border shadow-2xl relative overflow-hidden ${
            isDark
              ? "bg-[#040e24]/95 border-teal-500/30"
              : "bg-white/90 border-slate-200 shadow-xl"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                  CAMPUS MILESTONE {activeStep.number} OF 04
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  <Clock className="h-3.5 w-3.5 text-teal-400" />
                  {activeStep.timeframe}
                </span>
              </div>

              <div>
                <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  {activeStep.title}:{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                    {activeStep.landmark}
                  </span>
                </h3>
                <p className={`text-sm sm:text-base leading-relaxed mt-3 ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  {activeStep.description}
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                  Core Campus Deliverables
                </h4>
                <div className="space-y-2">
                  {activeStep.deliverables.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className={isDark ? "text-slate-200" : "text-slate-700"}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={onBookClick}
                  className="bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-xs sm:text-sm px-6 h-11 rounded-xl shadow-lg shadow-emerald-500/25 border border-teal-300/40 transition-all hover:scale-105 active:scale-95 gap-2"
                >
                  <span>Book Stop 1 Diagnostic</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Right Card (5 Cols): Guaranteed Campus Impact */}
            <div className={`lg:col-span-5 p-6 sm:p-7 rounded-2xl border backdrop-blur-xl space-y-6 text-left ${
              isDark ? "bg-slate-950/70 border-teal-500/30" : "bg-slate-50 border-slate-200"
            }`}>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-700/40">
                <div className={`p-3 rounded-2xl border ${activeStep.accent}`}>
                  <StepIcon className="h-6 w-6" />
                </div>
                <div>
                  <h5 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    Academic Outcome
                  </h5>
                  <p className="text-[11px] text-slate-400">Guaranteed Semester Impact</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/30">
                "{activeStep.keyOutcome}"
              </p>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Implementation Progress</span>
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
