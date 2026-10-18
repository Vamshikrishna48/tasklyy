import React, { useState } from "react";
import { Search, Star, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentPathCanvas3D } from "../StudentPathCanvas3D";
import { GOAL_CATEGORIES } from "../data/mentorsData";

interface HeroSectionProps {
  onSearch: (query: string, category?: string) => void;
  onSelectCategory: (categoryId: string) => void;
  selectedCategory: string;
  isReducedMotion: boolean;
  onBookClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSearch,
  onSelectCategory,
  selectedCategory,
  isReducedMotion,
  onBookClick,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownCategory, setDropdownCategory] = useState("all");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, dropdownCategory);
    const el = document.getElementById("marketplace-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const categoryChips = [
    { id: "admissions", label: "Admissions" },
    { id: "course-selection", label: "Course selection" },
    { id: "study-abroad", label: "Study abroad" },
    { id: "internships", label: "Internships" },
    { id: "placements", label: "Placements" },
  ];

  return (
    <section
      id="hero-section"
      className="w-full min-h-[92vh] flex flex-col justify-center pt-24 pb-16 px-4 md:px-8 bg-gradient-to-b from-[#f8fafc] via-[#f0f7ff]/40 to-white"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        
        {/* Left Column (7 cols): Editorial Content, Large Search, Category Chips & Trust Row */}
        <div className="lg:col-span-7 space-y-7 text-left">
          
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold font-mono">
            <span>Verified Student & Alumni Mentorship</span>
          </div>

          {/* Exact Headline (H1 64px desktop, 36px mobile) */}
          <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-extrabold tracking-tight text-slate-900 leading-[1.08]">
            Talk to someone who's{" "}
            <span className="text-blue-600 underline decoration-blue-200 decoration-wavy underline-offset-4">
              already where
            </span>{" "}
            you want to be.
          </h1>

          {/* One Line of Subtext */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl font-normal">
            Book 1-on-1 video sessions with verified seniors, alumni, and working professionals who will guide your next career move.
          </p>

          {/* Large Search Bar with Dropdown */}
          <form
            onSubmit={handleSearchSubmit}
            className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-300 shadow-lg shadow-blue-900/5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 max-w-2xl"
          >
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="What do you need help with? (e.g. Google SWE, CMU SOP...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
            </div>

            <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />

            <select
              value={dropdownCategory}
              onChange={(e) => setDropdownCategory(e.target.value)}
              className="h-10 px-3 rounded-xl bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 border border-slate-200 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Goals</option>
              <option value="admissions">Admissions</option>
              <option value="course-selection">Course Selection</option>
              <option value="study-abroad">Study Abroad</option>
              <option value="internships">Internships</option>
              <option value="placements">Placements</option>
            </select>

            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 h-11 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              Find mentors
            </Button>
          </form>

          {/* Five Category Chips */}
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Popular Goals:
            </span>
            <div className="flex flex-wrap gap-2">
              {categoryChips.map((chip) => {
                const isSelected = selectedCategory === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => onSelectCategory(chip.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50"
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Small Trust Row */}
          <div className="pt-4 flex flex-wrap items-center gap-6 sm:gap-8 text-xs font-semibold text-slate-600 border-t border-slate-200/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>2,000+ sessions booked</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>500+ verified mentors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <span>4.8 average rating</span>
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): 3D Path starting at first milestone with floating mentors */}
        <div className="lg:col-span-5 relative w-full h-[460px] sm:h-[500px] rounded-3xl bg-white border border-slate-200 shadow-lg p-4 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 z-10">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
                Your Career Milestone Path
              </span>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
              Stop 1: Choose Course
            </span>
          </div>

          {/* 3D Canvas Container */}
          <div className="w-full flex-1 relative">
            <StudentPathCanvas3D
              scrollProgress={0.05}
              activeMilestoneIndex={0}
              isReducedMotion={isReducedMotion}
              className="w-full h-full"
            />
          </div>

          {/* Bottom Card Summary */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between z-10">
            <span className="text-xs text-slate-500">
              Scroll down to travel through your student journey
            </span>
            <button
              onClick={onBookClick}
              className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <span>Explore</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
