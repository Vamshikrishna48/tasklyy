import React from "react";
import { Card3D } from "../Card3D";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  Building2,
  Gift,
} from "lucide-react";

export interface CampusPlan {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  badge?: string;
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  features: string[];
  ctaText: string;
}

export const CAMPUS_PLANS: CampusPlan[] = [
  {
    id: "student-starter",
    name: "Student Starter",
    subtitle: "For individual undergraduate & postgraduate learners",
    price: "Free",
    period: "always complimentary for students",
    icon: GraduationCap,
    description:
      "Essential study workflow advisory, syllabus calendar setup, and access to student template kits.",
    features: [
      "1-on-1 Personalized Study Audit Session",
      "Semester Revision & Exam Calendar Blueprint",
      "Internship Application Kanban Template",
      "Access to Tasskly Campus Student Discord",
      "Weekly Focus & Spaced Repetition Worksheets",
    ],
    ctaText: "Get Free Student Session",
  },
  {
    id: "club-department",
    name: "Club & Department Plan",
    subtitle: "For student councils, tech societies & academic departments",
    price: "$299",
    period: "per fest or semester program",
    badge: "Most Popular",
    popular: true,
    icon: Users,
    description:
      "End-to-end operational architecture for college societies, annual fests, hackathons, and departmental labs.",
    features: [
      "Campus Fest & Hackathon Milestone Playbook",
      "Member Task Handoff & Volunteer Dispatch System",
      "Corporate Sponsorship Outreach Pipeline",
      "60-Minute Live Interactive Workshop for Members",
      "Dedicated Slack / WhatsApp Advisory Channel",
      "Budget & Expense Real-Time Tracking Vault",
    ],
    ctaText: "Get Club Consultation",
  },
  {
    id: "campus-partnership",
    name: "Campus-Wide Partnership",
    subtitle: "For Deans, Registrars & University Administrators",
    price: "Custom",
    period: "institutional annual partnership",
    icon: Building2,
    description:
      "University-wide digital modernization, LMS integration, departmental governance, and placement cell enablement.",
    features: [
      "Campus-Wide Student & Faculty Workspace Provisioning",
      "LMS & College Portal Integration (Moodle, Canvas)",
      "University Dean High-Level Analytics Dashboard",
      "Dedicated On-Campus Productivity Architect",
      "NAAC / ABET Accreditation Document Vaults",
      "Placement Cell Company Tracking Suite",
    ],
    ctaText: "Discuss Campus Partnership",
  },
];

interface PricingSectionProps {
  onSelectPlan: (planName: string) => void;
  isDark?: boolean;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
  isDark = true,
}) => {
  return (
    <section
      id="pricing-section"
      className="min-h-screen w-full flex flex-col justify-center px-4 md:px-8 py-20 relative z-10"
    >
      <div className="w-full max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Stop 06: Innovation Center</span>
          </div>

          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Campus Engagement{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Plans
            </span>
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed ${
            isDark ? "text-slate-300" : "text-slate-700 font-normal"
          }`}>
            Accessible plans built with student budgets and university procurement in mind. From free 1-on-1 sessions to full campus partnerships.
          </p>
        </div>

        {/* 3 Plans Grid (Middle Card larger with Most Popular badge) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {CAMPUS_PLANS.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;

            return (
              <Card3D
                key={plan.id}
                depth={isPopular ? 22 : 14}
                glare={true}
                className={`h-full ${isPopular ? "lg:-translate-y-4" : ""}`}
              >
                <div
                  className={`h-full p-7 sm:p-8 rounded-3xl flex flex-col justify-between transition-all relative overflow-hidden backdrop-blur-2xl text-left ${
                    isPopular
                      ? "bg-[#040e24]/95 border-2 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                      : isDark
                      ? "bg-[#040e24]/85 border border-teal-500/25 hover:border-teal-400/50 shadow-xl"
                      : "bg-white/90 border border-slate-200 hover:border-emerald-300 shadow-md"
                  }`}
                >
                  {/* Most Popular Badge on Middle Card */}
                  {isPopular && (
                    <div className="absolute top-0 right-0">
                      <span className="inline-block px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-2xl border ${
                          isPopular
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
                            : "bg-slate-900/60 text-slate-300 border-slate-700"
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                          {plan.name}
                        </h3>
                        <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {plan.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="pt-2 pb-4 border-b border-slate-800">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl sm:text-5xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                          {plan.price}
                        </span>
                        {plan.price !== "Free" && plan.price !== "Custom" && (
                          <span className="text-xs text-slate-400 font-mono">USD</span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-400 font-medium mt-1">
                        {plan.period}
                      </p>
                    </div>

                    <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      {plan.description}
                    </p>

                    {/* 4-5 Checkmarked Features */}
                    <div className="space-y-3 pt-2">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        What's Included:
                      </p>
                      <ul className="space-y-2.5">
                        {plan.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-slate-200"
                          >
                            <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className={isDark ? "text-slate-200" : "text-slate-700"}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="pt-8">
                    <Button
                      onClick={() => onSelectPlan(plan.name)}
                      className={`w-full h-12 rounded-xl text-sm font-bold gap-2 transition-all ${
                        isPopular
                          ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95"
                          : "bg-slate-900/80 hover:bg-emerald-500/20 text-white hover:text-emerald-300 border border-teal-500/30"
                      }`}
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="h-4 w-4" />
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
