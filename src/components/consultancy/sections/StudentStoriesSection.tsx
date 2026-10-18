import React from "react";
import { Quote, ArrowRight, CheckCircle2 } from "lucide-react";
import { STUDENT_STORIES_DATA } from "../data/mentorsData";

export const StudentStoriesSection: React.FC = () => {
  return (
    <section id="stories-section" className="w-full py-16 md:py-24 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-left space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Real Student Outcomes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Before & After Stories
          </h2>
          <p className="text-base text-slate-600 max-w-2xl font-normal">
            Real college students and school leavers who turned uncertainty into high-velocity career breakthroughs.
          </p>
        </div>

        {/* 3 Before-and-After Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STUDENT_STORIES_DATA.map((story) => (
            <div
              key={story.id}
              className="p-7 rounded-2xl bg-[#f8fafc] border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between text-left space-y-6"
            >
              <div className="space-y-5">
                {/* Before vs After Visual Box */}
                <div className="space-y-2.5">
                  <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/60 text-xs">
                    <span className="text-[10px] uppercase font-mono font-bold text-rose-600 block">
                      Before Session
                    </span>
                    <p className="text-slate-700 font-medium mt-0.5">
                      "{story.before}"
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <span className="text-[10px] uppercase font-mono font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> After Session
                    </span>
                    <p className="text-slate-800 font-bold mt-0.5">
                      {story.after}
                    </p>
                  </div>
                </div>

                {/* Quote */}
                <div className="relative">
                  <Quote className="h-6 w-6 text-blue-600/20 absolute -top-2 -left-1" />
                  <p className="text-xs sm:text-sm text-slate-700 italic pl-5 leading-relaxed">
                    "{story.quote}"
                  </p>
                </div>
              </div>

              {/* Student Bio */}
              <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
                <img
                  src={story.photo}
                  alt={story.name}
                  className="h-11 w-11 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{story.name}</h4>
                  <p className="text-xs text-blue-600 font-medium">{story.college}</p>
                  <p className="text-[10px] text-slate-400">Mentored by {story.mentorName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
