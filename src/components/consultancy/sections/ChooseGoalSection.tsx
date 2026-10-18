import React from "react";
import { ArrowRight, Users } from "lucide-react";
import { GOAL_CATEGORIES, GoalCategory } from "../data/mentorsData";

interface ChooseGoalSectionProps {
  onSelectCategory: (category: GoalCategory) => void;
  selectedCategory: string;
}

export const ChooseGoalSection: React.FC<ChooseGoalSectionProps> = ({
  onSelectCategory,
  selectedCategory,
}) => {
  return (
    <section id="goals-section" className="w-full py-16 md:py-24 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="text-left space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Step 1 • Choose Your Goal
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Where are you in your journey?
          </h2>
          <p className="text-base text-slate-600 max-w-2xl font-normal">
            Select what you need help with right now. We'll connect you directly with mentors who recently achieved that exact milestone.
          </p>
        </div>

        {/* 5 Large Cards in a Row (Scrollable on Mobile) */}
        <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x">
          {GOAL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                className={`flex-none w-[280px] sm:w-[320px] rounded-2xl bg-white border cursor-pointer transition-all snap-start flex flex-col justify-between overflow-hidden group ${
                  isSelected
                    ? "border-blue-600 ring-2 ring-blue-600/20 shadow-lg scale-[1.02]"
                    : "border-slate-200 hover:border-blue-400 hover:shadow-md"
                }`}
              >
                {/* Photo Header */}
                <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                  <img
                    src={cat.photo}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-blue-200 font-bold block">
                      Milestone 0{cat.milestoneIndex + 1}
                    </span>
                    <h3 className="text-lg font-bold text-white drop-shadow-sm">
                      {cat.title}
                    </h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between text-left space-y-4">
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {cat.promise}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Users className="h-3.5 w-3.5" />
                      <span>{cat.mentorCount} mentors</span>
                    </span>

                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Find mentors</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
