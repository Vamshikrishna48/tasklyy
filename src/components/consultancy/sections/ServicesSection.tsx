import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card3D } from "../Card3D";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Zap,
  Users,
  ArrowRightLeft,
  Terminal,
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  RotateCw,
  Sparkles,
} from "lucide-react";

export interface ServiceItem {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
  description: string;
  deliverables: string[];
  timeline: string;
  badge: string;
  gradient: string;
}

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: "workflow-audit",
    title: "Workflow Audit",
    icon: Search,
    tagline: "Uncover hidden operational friction",
    description:
      "A complete diagnostic of your team's async communication, meeting overlap, and task bottlenecks. We map every handoff to reclaim 10+ hours per person each week.",
    deliverables: [
      "Friction & Latency Heatmap",
      "Async Communication Playbook",
      "Executive Bottleneck Scorecard",
    ],
    timeline: "1 - 2 Weeks",
    badge: "Diagnostic",
    gradient: "from-emerald-500/20 via-teal-500/10 to-sky-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "process-automation",
    title: "Process Automation",
    icon: Zap,
    tagline: "Eliminate repetitive manual loops",
    description:
      "Custom automated pipelines linking Slack, Linear, Jira, GitHub, and Notion. Stop updating status boards manually—let event-driven triggers do the heavy lifting.",
    deliverables: [
      "Zero-Code & Webhook Pipelines",
      "Automated Sprint & Digest Reports",
      "Real-Time Incident Triaging",
    ],
    timeline: "2 - 4 Weeks",
    badge: "Automation",
    gradient: "from-sky-500/20 via-blue-500/10 to-emerald-500/20 text-sky-400 border-sky-500/30",
  },
  {
    id: "team-productivity-coaching",
    title: "Team Productivity Coaching",
    icon: Users,
    tagline: "Instill high-focus engineering habits",
    description:
      "Transform reactive teams into high-velocity execution engines with structured deep work windows, meeting pruning, and asynchronous sprint rituals.",
    deliverables: [
      "Deep Work Calendar Architectures",
      "Standup & Meeting Pruning Plan",
      "Leadership Velocity Coaching",
    ],
    timeline: "4 - 8 Weeks",
    badge: "Coaching",
    gradient: "from-teal-500/20 via-emerald-500/10 to-cyan-500/20 text-teal-300 border-teal-500/30",
  },
  {
    id: "tool-integration-migration",
    title: "Tool Integration & Migration",
    icon: ArrowRightLeft,
    tagline: "Consolidate fragmented toolchains",
    description:
      "Frictionless migration between legacy project suites (Jira, Asana, Trello) into unified modern workspaces (Linear, Notion) with zero downtime or data loss.",
    deliverables: [
      "Full Data & History Migration",
      "Custom API Webhook Bridges",
      "Unified Single-Source-of-Truth",
    ],
    timeline: "2 - 3 Weeks",
    badge: "Migration",
    gradient: "from-blue-500/20 via-indigo-500/10 to-teal-500/20 text-blue-400 border-blue-500/30",
  },
  {
    id: "custom-implementation",
    title: "Custom Implementation",
    icon: Terminal,
    tagline: "Bespoke task & workflow engines",
    description:
      "Tailored task architectures, automated dashboards, custom Discord/Slack bots, and enterprise internal tooling engineered precisely for your engineering culture.",
    deliverables: [
      "Production-Grade Workflow Scripts",
      "Custom Executive Dashboards",
      "Dedicated Notification Bots",
    ],
    timeline: "3 - 6 Weeks",
    badge: "Custom Build",
    gradient: "from-emerald-500/20 via-sky-500/10 to-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    id: "training-onboarding",
    title: "Training & Onboarding",
    icon: GraduationCap,
    tagline: "Guarantee 100% team-wide adoption",
    description:
      "Interactive onboarding workshops, step-by-step role playbooks, and certified adoption programs to make sure your newly engineered systems stick permanently.",
    deliverables: [
      "Interactive Team Workshops",
      "Role-Based Video Playbooks",
      "90-Day Adoption Monitoring",
    ],
    timeline: "2 Weeks",
    badge: "Enablement",
    gradient: "from-cyan-500/20 via-teal-500/10 to-sky-500/20 text-cyan-400 border-cyan-500/30",
  },
];

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  const toggleFlip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCardId((prev) => (prev === id ? null : id));
  };

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
            <span>Consultancy Services</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Productivity Systems{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Engineered for Velocity
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            From forensic bottleneck audits to custom webhook automation and team habit coaching—we eliminate the chaos so your talent can focus on high-impact work.
          </p>
        </div>

        {/* 6 Services Grid with 3D Tilt/Flip Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES_DATA.map((service) => {
            const Icon = service.icon;
            const isFlipped = flippedCardId === service.id;

            return (
              <Card3D
                key={service.id}
                depth={16}
                glare={true}
                className="h-[360px] group cursor-pointer"
                onClick={() => onSelectService(service.title)}
              >
                <div
                  className="w-full h-full rounded-2xl relative transition-transform duration-500 [transform-style:preserve-3d]"
                  style={{
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* FRONT FACE */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between bg-[#040e24]/90 backdrop-blur-2xl border border-teal-500/25 [backface-visibility:hidden] shadow-xl group-hover:border-emerald-400/50 transition-colors">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${service.gradient} border flex items-center justify-center`}>
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
                        <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-xs text-emerald-400 font-medium mt-1">
                          {service.tagline}
                        </p>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                        {service.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                      <button
                        onClick={(e) => toggleFlip(service.id, e)}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-300 transition-colors"
                        title="Flip to view deliverables"
                      >
                        <RotateCw className="h-3.5 w-3.5 text-teal-400" />
                        <span>Deliverables</span>
                      </button>

                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectService(service.title);
                        }}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs h-8 px-3 rounded-lg gap-1 group-hover:bg-emerald-400 group-hover:text-slate-950 transition-all font-semibold"
                      >
                        <span>Book Service</span>
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* BACK FACE (Deliverables & Scope) */}
                  <div
                    className="absolute inset-0 w-full h-full rounded-2xl p-6 flex flex-col justify-between bg-[#040e24]/95 backdrop-blur-2xl border border-emerald-500/40 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-2xl"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                          Deliverables & Timeline
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-emerald-950/40 border-emerald-500/40 text-emerald-300 text-[10px]"
                        >
                          {service.timeline}
                        </Badge>
                      </div>

                      <h4 className="text-base font-bold text-white">
                        {service.title}
                      </h4>

                      <ul className="space-y-2.5">
                        {service.deliverables.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-200"
                          >
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={(e) => toggleFlip(service.id, e)}
                        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        <RotateCw className="h-3.5 w-3.5 text-teal-400" />
                        <span>Back</span>
                      </button>

                      <Button
                        size="sm"
                        onClick={() => onSelectService(service.title)}
                        className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs h-8 px-3.5 rounded-lg font-bold shadow-md shadow-emerald-500/20"
                      >
                        <span>Select Service</span>
                      </Button>
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
