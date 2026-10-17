import React from "react";
import { motion } from "framer-motion";
import { Card3D } from "../Card3D";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  Rocket,
  Crown,
} from "lucide-react";

export interface PricingTier {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  period: string;
  badge?: string;
  popular?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  ctaText: string;
  description: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter-advisory",
    name: "Starter Advisory",
    subtitle: "For early-stage startups & lean teams",
    price: "$1,499",
    period: "one-time engagement",
    icon: Rocket,
    description:
      "A fast-paced diagnostic sprint to eliminate chaotic bottlenecks and establish clean async rhythms.",
    features: [
      "Full 2-Week Operational & Tool Audit",
      "3 Private Executive Strategy Sessions",
      "Asynchronous Communication Blueprint",
      "Actionable Bottleneck Scorecard",
      "Standard Linear / Jira Template Pack",
      "30 Days of Priority Email Q&A",
    ],
    ctaText: "Talk to us",
  },
  {
    id: "team-transformation",
    name: "Team Transformation",
    subtitle: "For scaling engineering & product teams",
    price: "$3,499",
    period: "full 60-day overhaul",
    badge: "Most Popular",
    popular: true,
    icon: Zap,
    description:
      "Our signature full-stack consulting experience: we rebuild workflows, build custom webhooks, and coach your entire team.",
    features: [
      "End-to-End Workflow Architecture Redesign",
      "5 Custom Webhook & Tool Automation Pipelines",
      "4 Live Interactive Team Rollout Workshops",
      "Dedicated Slack / Discord Channel Access",
      "Bi-Weekly Velocity & PR Turnaround Audits",
      "Custom Role-Based Video Onboarding Playbooks",
      "90-Day ROI & Performance Money-Back Guarantee",
    ],
    ctaText: "Talk to us",
  },
  {
    id: "enterprise-partnership",
    name: "Enterprise Partnership",
    subtitle: "For multi-department organizations",
    price: "Custom",
    period: "bespoke quarterly retainer",
    icon: Crown,
    description:
      "Continuous embedded advisory for complex organizations needing custom migrations, high security, and cross-departmental governance.",
    features: [
      "Multi-Tool Consolidation & Full Data Migration",
      "Bespoke Internal Automation Middleware & APIs",
      "Unlimited Leadership Coaching & Team Sessions",
      "Dedicated Lead Productivity Architect",
      "Custom Enterprise SLA & Security Compliance",
      "Continuous Quarterly Benchmarking & Retrospectives",
      "Executive Dashboard & Velocity Metric Feeds",
    ],
    ctaText: "Talk to us",
  },
];

interface PricingSectionProps {
  onSelectTier: (tierName: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onSelectTier }) => {
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
            <span>Engagement Models</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Transparent Investment.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Guaranteed ROI.
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Select the engagement model that matches your team size and operational complexity. No hidden fees or bloated retainers.
          </p>
        </div>

        {/* 3 Pricing Cards Grid with 3D Hover Lift */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {PRICING_TIERS.map((tier) => {
            const Icon = tier.icon;
            const isPopular = tier.popular;

            return (
              <Card3D
                key={tier.id}
                depth={isPopular ? 24 : 16}
                glare={true}
                className={`h-full ${isPopular ? "lg:-translate-y-3" : ""}`}
              >
                <div
                  className={`h-full p-7 sm:p-8 rounded-3xl flex flex-col justify-between transition-all relative overflow-hidden backdrop-blur-2xl ${
                    isPopular
                      ? "bg-[#040e24]/95 border-2 border-emerald-400/80 shadow-[0_0_40px_rgba(16,185,129,0.3)]"
                      : "bg-[#040e24]/85 border border-teal-500/25 hover:border-teal-400/50 shadow-xl"
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="absolute top-0 right-0">
                      <span className="inline-block px-4 py-1.5 rounded-bl-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
                        {tier.badge}
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
                        <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                        <p className="text-xs text-slate-400">{tier.subtitle}</p>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="pt-2 pb-4 border-b border-slate-800">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                          {tier.price}
                        </span>
                        {tier.price !== "Custom" && (
                          <span className="text-xs text-slate-400 font-mono">USD</span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-400 font-medium mt-1">
                        {tier.period}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {tier.description}
                    </p>

                    {/* Features List */}
                    <div className="space-y-3 pt-2">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                        What's Included:
                      </p>
                      <ul className="space-y-2.5">
                        {tier.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-slate-200"
                          >
                            <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-8">
                    <Button
                      onClick={() => onSelectTier(tier.name)}
                      className={`w-full h-12 rounded-xl text-sm font-bold gap-2 transition-all ${
                        isPopular
                          ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95"
                          : "bg-slate-900/80 hover:bg-emerald-500/20 text-white hover:text-emerald-300 border border-teal-500/30 hover:border-emerald-400/50"
                      }`}
                    >
                      <span>{tier.ctaText}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card3D>
            );
          })}
        </div>

        {/* Custom Scoping Callout */}
        <div className="text-center pt-4">
          <p className="text-xs text-slate-400">
            Have a custom workflow setup, proprietary internal tools, or on-premise security requirements?{" "}
            <button
              onClick={() => onSelectTier("Custom Enterprise Solution")}
              className="text-emerald-400 underline font-semibold hover:text-emerald-300 transition-colors ml-1"
            >
              Request a custom scope consultation
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};
