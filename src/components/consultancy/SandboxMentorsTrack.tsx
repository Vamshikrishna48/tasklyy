import React, { useRef } from "react";
import { ArrowUpRight, ArrowLeft, ArrowRight, ShieldCheck, Star } from "lucide-react";
import { MENTORS_DATA, Mentor } from "./data/mentorsData";

interface SandboxMentorsTrackProps {
  onSelectMentor: (mentor: Mentor) => void;
}

export const SandboxMentorsTrack: React.FC<SandboxMentorsTrackProps> = ({ onSelectMentor }) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -460, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 460, behavior: "smooth" });
    }
  };

  return (
    <section className="sb-work" id="sb-mentors-catalog">
      {/* Section Header */}
      <div className="sb-work-head">
        <div>
          <h2 className="sb-display">Verified Mentors.</h2>
        </div>
        <div>
          <p className="sb-work-sub">
            Direct 1-on-1 video sessions. Real seniors and engineers from top universities and tech giants.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={scrollLeft}
              className="h-10 w-10 rounded-full border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs"
              aria-label="Scroll left"
            >
              <ArrowLeft className="h-4 w-4 text-slate-700" />
            </button>
            <button
              onClick={scrollRight}
              className="h-10 w-10 rounded-full border border-slate-300 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-xs"
              aria-label="Scroll right"
            >
              <ArrowRight className="h-4 w-4 text-slate-700" />
            </button>
            <span className="text-xs font-mono font-medium text-slate-500 ml-2">
              {MENTORS_DATA.length} verified mentors available
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div ref={scrollContainerRef} className="sb-work-track-wrapper">
        <ol className="sb-work-track">
          {MENTORS_DATA.map((mentor, index) => {
            const formattedIndex = index < 9 ? `0${index + 1}` : `${index + 1}`;
            return (
              <li key={mentor.id} className="sb-tile">
                {/* Media preview banner */}
                <div className="sb-tile-media">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="sb-tile-img"
                    loading="lazy"
                  />
                  <div className="sb-tile-badge">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Verified</span>
                  </div>
                  <div className="sb-tile-price">
                    ₹{mentor.price} <span className="text-[11px] font-normal text-slate-500">/ session</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="sb-tile-body">
                  <div className="sb-tile-meta">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">{formattedIndex}</span>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span>{mentor.rating.toFixed(2)}</span>
                        <span className="text-slate-400 font-normal">({mentor.reviewsCount})</span>
                      </div>
                    </div>
                    <h3 className="sb-tile-name mt-1">{mentor.name}</h3>
                    <p className="sb-tile-role">{mentor.role}</p>
                    <span className="sb-tile-uni mt-1">{mentor.institution}</span>
                  </div>

                  {/* Topics Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {mentor.topics.slice(0, 3).map((topic, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Action CTA */}
                  <button
                    onClick={() => onSelectMentor(mentor)}
                    className="w-full mt-2 h-11 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Book 1-on-1 Session</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};
