import React, { useState } from "react";
import { Card3D } from "../Card3D";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Layers,
  Briefcase,
  Building2,
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Check,
} from "lucide-react";

export interface CampusService {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  description: string;
  deliverables: string[];
  badge: string;
  accent: string;
}

export const CAMPUS_SERVICES: CampusService[] = [
  {
    id: "study-planning",
    title: "Study Planning & Time Management",
    icon: Calendar,
    tagline: "Master your weekly revision schedule",
    description:
      "Personalized academic timetable audits, pomodoro deep work blocks, and spaced repetition planners to conquer finals week without panic.",
    deliverables: [
      "Custom Semester Revision Matrix",
      "Spaced Repetition Notion/Linear Pack",
      "Daily 4-Hour Focus Routine Guide",
    ],
    badge: "Students",
    accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    id: "project-assignment",
    title: "Project & Assignment Workflows",
    icon: Layers,
    tagline: "Ship capstones and term papers on time",
    description:
      "Structured milestone tracking for group assignments, engineering capstones, and thesis papers with clear task ownership and zero free-rider friction.",
    deliverables: [
      "Group Task Accountability Boards",
      "LaTeX / Git Repository Pipelines",
      "Automated Milestone Deadline Reminders",
    ],
    badge: "Student Teams",
    accent: "text-sky-400 border-sky-500/30 bg-sky-500/10",
  },
  {
    id: "placement-prep",
    title: "Placement & Internship Preparation",
    icon: Briefcase,
    tagline: "Track 100+ company applications effortlessly",
    description:
      "High-velocity job application pipelines, resume ATS roasting, mock interview schedules, and referral tracking for summer internships and campus placements.",
    deliverables: [
      "Application Tracker Kanban Board",
      "Cold Outreach & Follow-up Sequences",
      "Technical & Behavioral Rubric Tracker",
    ],
    badge: "Career Growth",
    accent: "text-teal-300 border-teal-500/30 bg-teal-500/10",
  },
  {
    id: "campus-rollout",
    title: "Campus-Wide Tasskly Rollout",
    icon: Building2,
    tagline: "Modernize productivity across entire universities",
    description:
      "Full institutional onboarding of Tasskly across colleges, student LMS integration, centralized license management, and campus ambassador training.",
    deliverables: [
      "Institution-Wide Single Sign-On (SSO)",
      "University Dean Analytics Dashboard",
      "Student Council Adoption Toolkit",
    ],
    badge: "Institutions",
    accent: "text-blue-400 border-blue-500/30 bg-blue-500/10",
  },
  {
    id: "faculty-workflows",
    title: "Faculty & Department Workflows",
    icon: BookOpen,
    tagline: "Streamline grading and syllabus tracking",
    description:
      "Modernize departmental meetings, student office hour bookings, research grant drafting, and NAAC/ABET accreditation documentation.",
    deliverables: [
      "Office Hour Calendar Automations",
      "Accreditation Evidence Repository",
      "Department Meeting Async Protocol",
    ],
    badge: "Faculty",
    accent: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    id: "training-workshops",
    title: "Student Training Workshops",
    icon: GraduationCap,
    tagline: "Interactive 90-minute productivity bootcamps",
    description:
      "High-energy live campus workshops teaching practical second-brain architectures, task triage, and modern AI productivity tools for students.",
    deliverables: [
      "Live 90-Min Campus Keynote",
      "Interactive Q&A and Template Handoff",
      "Certified Certificate of Attendance",
    ],
    badge: "Workshops",
    accent: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  },
];

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
  isDark?: boolean;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
  isDark = true,
}) => {
  return (
    <section
      id="services-section"
      className="min-h-screen w-full flex flex-col justify-center px-4 md:px-8 py-20 relative z-10"
    >
      <div className="w-full max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Stop 03: Central Library</span>
          </div>

          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Campus Consultancy{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Services
            </span>
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed ${
            isDark ? "text-slate-300" : "text-slate-700 font-normal"
          }`}>
            Tailored advisory and hands-on systems designed for students, clubs, professors, and university leadership.
          </p>
        </div>

        {/* 3x2 Grid of Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CAMPUS_SERVICES.map((service) => {
            const Icon = service.icon;

            return (
              <Card3D
                key={service.id}
                depth={16}
                glare={true}
                className="h-[340px] group cursor-pointer"
                onClick={() => onSelectService(service.title)}
              >
                <div
                  className={`w-full h-full p-6 sm:p-7 rounded-3xl flex flex-col justify-between backdrop-blur-2xl border transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] ${
                    isDark
                      ? "bg-[#040e24]/90 border-teal-500/25 group-hover:border-emerald-400/60 shadow-xl"
                      : "bg-white/85 border-slate-200 group-hover:border-emerald-400 shadow-lg"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl border ${service.accent} flex items-center justify-center`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-slate-900/60 border-teal-500/30 text-teal-300 text-[11px] font-mono"
                      >
                        {service.badge}
                      </Badge>
                    </div>

                    <div>
                      <h3 className={`text-lg font-bold transition-colors ${
                        isDark ? "text-white group-hover:text-emerald-300" : "text-slate-900 group-hover:text-emerald-600"
                      }`}>
                        {service.title}
                      </h3>
                      <p className="text-xs text-emerald-400 font-semibold mt-1">
                        {service.tagline}
                      </p>
                    </div>

                    <p className={`text-xs leading-relaxed line-clamp-3 ${
                      isDark ? "text-slate-300" : "text-slate-600"
                    }`}>
                      {service.description}
                    </p>
                  </div>

                  {/* Bottom Row */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-400">
                      Request Blueprint
                    </span>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                      <span>Book Service</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
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
