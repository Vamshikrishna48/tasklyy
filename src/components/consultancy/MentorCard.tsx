import React, { useState, useRef } from "react";
import { Star, Clock, CheckCircle2, Video, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mentor } from "./data/mentorsData";

interface MentorCardProps {
  mentor: Mentor;
  onBook: (mentor: Mentor) => void;
  onPreview?: (mentor: Mentor) => void;
}

export const MentorCard: React.FC<MentorCardProps> = ({ mentor, onBook, onPreview }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    setRotX(((y - centerY) / centerY) * -8);
    setRotY(((x - centerX) / centerX) * 8);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotX(0);
    setRotY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: "1000px" }}
      className="h-full"
    >
      <div
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(${isHovered ? "-6px" : "0px"})`,
          transformStyle: "preserve-3d",
          transition: isHovered ? "transform 0.08s ease-out" : "transform 0.4s ease-out",
        }}
        className="h-full p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 shadow-sm hover:shadow-xl transition-shadow flex flex-col justify-between text-left will-change-transform"
      >
        {/* Top: Mentor Portrait & Verified Status */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="relative">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 h-5 w-5 bg-blue-600 rounded-full flex items-center justify-center text-white ring-2 ring-white">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Next Available Pill (In Amber) */}
            <div className="text-right space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="h-3 w-3 text-amber-600" />
                <span>Next: {mentor.nextAvailable}</span>
              </span>
              <div className="flex items-center justify-end gap-1 text-xs font-bold text-slate-700">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{mentor.rating.toFixed(2)}</span>
                <span className="text-slate-400 font-normal">({mentor.sessionCount} sessions)</span>
              </div>
            </div>
          </div>

          {/* Name & Role */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {mentor.name}
            </h3>
            <p className="text-xs font-semibold text-blue-600 mt-0.5">
              {mentor.role}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {mentor.companyOrCollege}
            </p>
          </div>

          {/* Short Bio */}
          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {mentor.bio}
          </p>

          {/* 3 Expertise Tags */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {mentor.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Row: Price & Action */}
        <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-mono text-slate-400 font-bold">Session Fee</span>
            <span className="text-sm font-black text-slate-900">
              {mentor.priceLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPreview(mentor)}
                className="text-xs text-slate-500 hover:text-blue-600 h-9 px-2.5"
              >
                View Profile
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => onBook(mentor)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl gap-1 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <span>Book session</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
