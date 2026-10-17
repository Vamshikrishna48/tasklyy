import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card3D } from "../Card3D";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Quote,
  GraduationCap,
  Sparkles,
  School,
} from "lucide-react";

export interface CampusStory {
  id: string;
  quote: string;
  name: string;
  role: string;
  college: string;
  avatar: string;
  rating: number;
}

export const CAMPUS_STORIES: CampusStory[] = [
  {
    id: "story-1",
    quote:
      "Tasskly saved my final semester. Between my IEEE research paper, campus placements, and five subject finals, I was completely overwhelmed. The 1-on-1 study audit gave me a daily 4-hour revision block that helped me graduate with a 9.4 GPA!",
    name: "Rohan Malhotra",
    role: "B.Tech Computer Science, Final Year",
    college: "IIT Delhi",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=RohanM&backgroundColor=0284c7",
    rating: 5,
  },
  {
    id: "story-2",
    quote:
      "Running our annual 8,000-attendee cultural festival used to mean 30 messy WhatsApp groups and constant missed sponsorship deadlines. Tasskly's club framework streamlined volunteer dispatches and sponsor follow-ups effortlessly.",
    name: "Aanya Sen",
    role: "Student Council President",
    college: "BITS Pilani, Goa Campus",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=AanyaS&backgroundColor=059669",
    rating: 5,
  },
  {
    id: "story-3",
    quote:
      "We partnered with Tasskly for our department's 180 final-year students. Coursework completion rates jumped by 40% and our faculty saved hours every week managing assignment submissions. An indispensable academic tool.",
    name: "Dr. K. S. Ramanathan",
    role: "Head of Electrical Engineering",
    college: "National Institute of Technology",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=DrRaman&backgroundColor=0ea5e9",
    rating: 5,
  },
  {
    id: "story-4",
    quote:
      "The placement application pipeline template was a game-changer. I tracked over 65 applications, automated interview follow-ups, and converted 3 full-time software engineering offers with zero deadline stress.",
    name: "Meera Krishnan",
    role: "Dual Degree Scholar (B.Tech + M.Tech)",
    college: "IIT Madras",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=MeeraK&backgroundColor=14b8a6",
    rating: 5,
  },
  {
    id: "story-5",
    quote:
      "Our AI student society organized a nationwide 36-hour hackathon with 450 participants. Tasskly's milestone boards and automated check-in schedules kept our 25 student organizers completely in sync.",
    name: "Devrat Joshi",
    role: "Tech Society Lead",
    college: "VIT Vellore",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=DevratJ&backgroundColor=10b981",
    rating: 5,
  },
];

interface TestimonialsSectionProps {
  onBookClick: () => void;
  isDark?: boolean;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  onBookClick,
  isDark = true,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = CAMPUS_STORIES.length;

  const nextStory = () => setActiveIndex((prev) => (prev + 1) % total);
  const prevStory = () => setActiveIndex((prev) => (prev - 1 + total) % total);

  const prevIdx = (activeIndex - 1 + total) % total;
  const nextIdx = (activeIndex + 1) % total;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevStory();
      if (e.key === "ArrowRight") nextStory();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section
      id="testimonials-section"
      className="min-h-screen w-full flex flex-col justify-center px-4 md:px-8 py-20 relative z-10 overflow-hidden"
    >
      <div className="w-full max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Stop 07: Alumni Amphitheater</span>
          </div>

          <h2 className={`text-3xl sm:text-5xl font-black tracking-tight drop-shadow-md ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            Student & College{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Stories
            </span>
          </h2>

          <p className={`text-sm sm:text-base leading-relaxed ${
            isDark ? "text-slate-300" : "text-slate-700 font-normal"
          }`}>
            Hear from students, club presidents, and professors who turned academic chaos into calm, high-velocity achievement.
          </p>
        </div>

        {/* 3D Ring Carousel: Left blurred card, Center large card, Right blurred card */}
        <div className="relative max-w-5xl mx-auto flex items-center justify-center">
          
          {/* Left Preview Card (Smaller, Blurred) */}
          <div
            onClick={prevStory}
            className="hidden lg:block absolute -left-12 w-80 scale-90 opacity-40 blur-[1px] hover:opacity-70 transition-all cursor-pointer pointer-events-auto z-10"
          >
            <div className={`p-6 rounded-3xl border ${
              isDark ? "bg-[#040e24]/80 border-slate-800 text-slate-400" : "bg-white/80 border-slate-200 text-slate-500"
            }`}>
              <p className="text-xs line-clamp-3 italic">"{CAMPUS_STORIES[prevIdx].quote}"</p>
              <p className="text-xs font-bold text-white mt-3">{CAMPUS_STORIES[prevIdx].name}</p>
              <p className="text-[10px] text-teal-400">{CAMPUS_STORIES[prevIdx].college}</p>
            </div>
          </div>

          {/* Center Main Focused Card */}
          <div className="w-full max-w-3xl z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, scale: 0.94, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: -15 }}
                transition={{ duration: 0.4 }}
              >
                <Card3D depth={18} glare={true} className="w-full">
                  <div
                    className={`p-8 sm:p-12 rounded-3xl backdrop-blur-2xl border shadow-2xl relative overflow-hidden space-y-6 text-left ${
                      isDark
                        ? "bg-[#040e24]/95 border-teal-500/30"
                        : "bg-white/95 border-slate-200 shadow-xl"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="ml-2 font-mono text-xs font-bold text-emerald-400">
                          5.0 Academic Rating
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-teal-400 font-mono">
                        <School className="h-4 w-4" />
                        <span>Verified Campus Story</span>
                      </div>
                    </div>

                    <div className="relative">
                      <Quote className="h-10 w-10 text-emerald-500/20 absolute -top-4 -left-3 pointer-events-none" />
                      <p className={`text-base sm:text-xl font-medium leading-relaxed relative z-10 pl-6 sm:pl-8 italic ${
                        isDark ? "text-slate-100" : "text-slate-800"
                      }`}>
                        "{CAMPUS_STORIES[activeIndex].quote}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                      <div className="flex items-center gap-4">
                        <img
                          src={CAMPUS_STORIES[activeIndex].avatar}
                          alt={CAMPUS_STORIES[activeIndex].name}
                          className="h-12 w-12 rounded-2xl border-2 border-emerald-400/50 p-0.5 bg-slate-900"
                        />
                        <div>
                          <h4 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                            {CAMPUS_STORIES[activeIndex].name}
                          </h4>
                          <p className="text-xs text-emerald-400 font-medium">
                            {CAMPUS_STORIES[activeIndex].role}
                          </p>
                          <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {CAMPUS_STORIES[activeIndex].college}
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30 font-mono">
                        <GraduationCap className="h-4 w-4 text-emerald-400" />
                        <span>Alumni Network</span>
                      </div>
                    </div>
                  </div>
                </Card3D>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Preview Card (Smaller, Blurred) */}
          <div
            onClick={nextStory}
            className="hidden lg:block absolute -right-12 w-80 scale-90 opacity-40 blur-[1px] hover:opacity-70 transition-all cursor-pointer pointer-events-auto z-10"
          >
            <div className={`p-6 rounded-3xl border ${
              isDark ? "bg-[#040e24]/80 border-slate-800 text-slate-400" : "bg-white/80 border-slate-200 text-slate-500"
            }`}>
              <p className="text-xs line-clamp-3 italic">"{CAMPUS_STORIES[nextIdx].quote}"</p>
              <p className="text-xs font-bold text-white mt-3">{CAMPUS_STORIES[nextIdx].name}</p>
              <p className="text-[10px] text-teal-400">{CAMPUS_STORIES[nextIdx].college}</p>
            </div>
          </div>

        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="icon"
            onClick={prevStory}
            className="h-11 w-11 rounded-full bg-[#040e24]/80 border-teal-500/30 text-slate-200 hover:text-white hover:bg-emerald-500/20"
            aria-label="Previous story"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-2">
            {CAMPUS_STORIES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  activeIndex === idx
                    ? "w-8 bg-gradient-to-r from-emerald-400 to-sky-400"
                    : "w-2.5 bg-slate-700 hover:bg-slate-600"
                }`}
                aria-label={`Go to story ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={nextStory}
            className="h-11 w-11 rounded-full bg-[#040e24]/80 border-teal-500/30 text-slate-200 hover:text-white hover:bg-emerald-500/20"
            aria-label="Next story"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};
