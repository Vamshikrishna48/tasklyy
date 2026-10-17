import React from "react";
import { Card3D } from "../Card3D";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  Award,
} from "lucide-react";

export interface AudienceCardData {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  features: string[];
  gradient: string;
  tagline: string;
}

export const AUDIENCE_DATA: AudienceCardData[] = [
  {
    id: "students",
    title: "Students",
    subtitle: "Undergrads, Postgrads & Researchers",
    badge: "Personal Mastery",
    icon: GraduationCap,
    description:
      "Transform chaotic course syllabi into calm, structured weekly gameplans. Never pull an all-nighter before midterms again.",
    features: [
      "Custom semester timetable & deadline calendars",
      "Exam revision sprints & spaced repetition boards",
      "Internship & placement application pipelines",
      "Capstone & final-year project task architecture",
    ],
    gradient: "from-emerald-500/20 via-teal-500/10 to-sky-500/20 text-emerald-400 border-emerald-500/30",
    tagline: "For individual learners striving for A+ results without burnout.",
  },
  {
    id: "clubs",
    title: "Clubs & Societies",
    subtitle: "Student Leaders, Fest Heads & Chapters",
    badge: "Campus Collaboration",
    icon: Users,
    description:
      "Manage annual cultural fests, tech hackathons, and society operations with transparent task ownership and sponsor tracking.",
    features: [
      "Fest planning templates & timeline milestones",
      "New member onboarding & volunteer dispatch",
      "Sponsorship outreach & corporate pitch pipeline",
      "Budget allocation & real-time expenditure tracking",
    ],
    gradient: "from-sky-500/20 via-blue-500/10 to-indigo-500/20 text-sky-400 border-sky-500/30",
    tagline: "For student teams running massive campus events and societies.",
  },
  {
    id: "colleges",
    title: "Colleges & Universities",
    subtitle: "Deans, HODs & Placement Cells",
    badge: "Institutional Scale",
    icon: Building2,
    description:
      "Deploy campus-wide productivity frameworks across departments to elevate student placement rates, NIRF scores, and course completion.",
    features: [
      "Campus-wide Tasskly workspace rollouts",
      "Placement cell recruitment drive trackers",
      "Faculty grading & assignment submission workflows",
      "Accreditation & NAAC/ABET documentation vaults",
    ],
    gradient: "from-amber-500/20 via-orange-500/10 to-emerald-500/20 text-amber-400 border-amber-500/30",
    tagline: "For higher education institutions scaling student achievement.",
  },
];

interface WhoWeHelpSectionProps {
  onSelectAudience: (audienceName: string) => void;
  isDark?: boolean;
}

export const WhoWeHelpSection: React.FC<WhoWeHelpSectionProps> = ({
  onSelectAudience,
  isDark = true,
}) => {
  return (
    <section
      id="who-we-help-section"
      className="min-h-screen w-full flex flex-col justify-center px-4 md:px-8 py-20 relative z-10"
    >
      <div className="w-full max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Stop 02: Campus Quad</span>
          </div>

          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Who We Help{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Excel Every Semester
            </span>
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed ${
            isDark ? "text-slate-300" : "text-slate-700 font-normal"
          }`}>
            Whether you are a freshman juggling five classes or a Dean modernizing department workflows, Tasskly builds systems that work for academia.
          </p>
        </div>

        {/* 3 Tall 3D Tilt Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {AUDIENCE_DATA.map((card) => {
            const Icon = card.icon;

            return (
              <Card3D
                key={card.id}
                depth={20}
                glare={true}
                className="h-full group cursor-pointer"
                onClick={() => onSelectAudience(card.title)}
              >
                <div
                  className={`h-full p-7 sm:p-8 rounded-3xl flex flex-col justify-between transition-all backdrop-blur-2xl border ${
                    isDark
                      ? "bg-[#040e24]/90 border-teal-500/25 group-hover:border-emerald-400/60 shadow-xl"
                      : "bg-white/85 border-slate-200 group-hover:border-emerald-400 shadow-lg"
                  }`}
                >
                  <div className="space-y-6">
                    {/* Top Row: Icon & Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${card.gradient} border flex items-center justify-center`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-slate-900/60 border-teal-500/30 text-teal-300 text-[11px] font-mono"
                      >
                        {card.badge}
                      </Badge>
                    </div>

                    <div>
                      <h3 className={`text-2xl font-bold transition-colors ${
                        isDark ? "text-white group-hover:text-emerald-300" : "text-slate-900 group-hover:text-emerald-600"
                      }`}>
                        {card.title}
                      </h3>
                      <p className="text-xs text-emerald-400 font-semibold mt-1">
                        {card.subtitle}
                      </p>
                    </div>

                    <p className={`text-xs sm:text-sm leading-relaxed ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}>
                      {card.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2.5 pt-2">
                      {card.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className={isDark ? "text-slate-200" : "text-slate-700"}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Learn more
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAudience(card.title);
                      }}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs h-8 px-3.5 rounded-xl gap-1 group-hover:bg-emerald-400 group-hover:text-slate-950 transition-all font-bold"
                    >
                      <span>Explore Plans</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card3D>
            );
          })}
        </div>
      </div>
    </section>
  );
};
