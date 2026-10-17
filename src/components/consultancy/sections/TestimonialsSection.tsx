import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card3D } from "../Card3D";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  ShieldCheck,
  Building,
  Sparkles,
} from "lucide-react";

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  tags: string[];
}

export const TESTIMONIALS_DATA: TestimonialItem[] = [
  {
    id: "test-1",
    quote:
      "Tasskly completely changed how our engineering department functions. Within three weeks of their workflow audit, we cut 6 hours of repetitive standups and daily syncs per dev. Our cycle time dropped from 2 weeks to 4 days.",
    author: "Siddharth Rao",
    role: "Head of Engineering",
    company: "HyperScale Cloud Systems",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=SiddharthRao&backgroundColor=0284c7",
    rating: 5,
    tags: ["Workflow Audit", "Linear Automation"],
  },
  {
    id: "test-2",
    quote:
      "We were drowning in notification noise across Slack, Jira, and GitHub. Tasskly's consultants built automated webhook triage bots that route priorities instantly. It feels like we hired an elite ops team for a fraction of the cost.",
    author: "Ananya Mehta",
    role: "VP of Product",
    company: "FinFlow Technologies",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AnanyaMehta&backgroundColor=059669",
    rating: 5,
    tags: ["Process Automation", "Slack Webhooks"],
  },
  {
    id: "test-3",
    quote:
      "The 1-on-1 team productivity coaching unlocked massive focus time. We adopted their 4-hour uninterrupted deep work blocks and async status updates. Employee satisfaction and sprint delivery are both at all-time highs.",
    author: "Devon Chen",
    role: "Founder & CTO",
    company: "Aether AI Labs",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=DevonChen&backgroundColor=0ea5e9",
    rating: 5,
    tags: ["Deep Work", "Team Coaching"],
  },
  {
    id: "test-4",
    quote:
      "Migrating 80+ team members from Jira to Linear felt terrifying until Tasskly stepped in. They engineered zero-downtime data sync scripts and trained every single project lead. We did not drop a single task.",
    author: "Pooja Krishnan",
    role: "Engineering Operations Lead",
    company: "Stratos Platforms",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=PoojaK&backgroundColor=14b8a6",
    rating: 5,
    tags: ["Tool Migration", "Zero Downtime"],
  },
  {
    id: "test-5",
    quote:
      "As a university project team preparing for our venture round, Tasskly helped us structure our engineering cadence like a Series-A startup. The investor due diligence team was blown away by our development velocity.",
    author: "Arjun Nair",
    role: "Founder & Student Lead",
    company: "IIT Madras Incubator",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ArjunNair&backgroundColor=10b981",
    rating: 5,
    tags: ["Startup Advisory", "Velocity Metrics"],
  },
];

interface TestimonialsSectionProps {
  onBookClick: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ onBookClick }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = TESTIMONIALS_DATA.length;

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevTestimonial();
      if (e.key === "ArrowRight") nextTestimonial();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      id="testimonials-section"
      className="min-h-screen w-full flex flex-col justify-center px-4 md:px-8 py-20 relative z-10"
    >
      <div className="w-full max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Client Testimonials</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Trusted by Builders,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Validated by Results
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            See how forward-thinking leaders and high-performing teams scaled their velocity with Tasskly Consultancy.
          </p>
        </div>

        {/* 3D Testimonials Carousel Presentation */}
        <div className="relative max-w-4xl mx-auto">
          {/* Main Active Testimonial Card */}
          <div className="relative min-h-[360px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -15 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="w-full"
              >
                <Card3D depth={18} glare={true} className="w-full">
                  <div className="p-8 sm:p-12 rounded-3xl bg-[#040e24]/95 backdrop-blur-2xl border border-teal-500/30 shadow-2xl relative overflow-hidden space-y-8">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Top Row: Rating & Tags */}
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="ml-2 font-mono text-xs font-bold text-slate-300">
                          5.0 / 5.0
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {TESTIMONIALS_DATA[activeIndex].tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-teal-500/30 text-[10px] font-mono text-teal-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Big Quote */}
                    <div className="relative">
                      <Quote className="h-10 w-10 text-emerald-500/20 absolute -top-5 -left-3 pointer-events-none" />
                      <p className="text-base sm:text-xl text-slate-100 font-medium leading-relaxed relative z-10 pl-6 sm:pl-8 italic">
                        "{TESTIMONIALS_DATA[activeIndex].quote}"
                      </p>
                    </div>

                    {/* Author Info */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                      <div className="flex items-center gap-4">
                        <img
                          src={TESTIMONIALS_DATA[activeIndex].avatar}
                          alt={TESTIMONIALS_DATA[activeIndex].author}
                          className="h-12 w-12 rounded-2xl border-2 border-emerald-400/40 p-0.5 bg-slate-900"
                        />
                        <div>
                          <h4 className="text-base font-bold text-white">
                            {TESTIMONIALS_DATA[activeIndex].author}
                          </h4>
                          <p className="text-xs text-emerald-400 font-medium">
                            {TESTIMONIALS_DATA[activeIndex].role} • {TESTIMONIALS_DATA[activeIndex].company}
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-mono">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span>Verified Client</span>
                      </div>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-8">
            {/* Prev Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="h-11 w-11 rounded-full bg-[#040e24]/80 border-teal-500/30 text-slate-200 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-400 transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {TESTIMONIALS_DATA.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    activeIndex === idx
                      ? "w-8 bg-gradient-to-r from-emerald-400 to-sky-400"
                      : "w-2.5 bg-slate-800 hover:bg-slate-700"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="h-11 w-11 rounded-full bg-[#040e24]/80 border-teal-500/30 text-slate-200 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-400 transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
