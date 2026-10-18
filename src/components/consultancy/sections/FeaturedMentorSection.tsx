import React, { useState } from "react";
import { Star, Play, CheckCircle2, Award, Calendar, Quote } from "lucide-react";
import { BookingPanel } from "../BookingPanel";
import { MENTORS_DATA, Mentor } from "../data/mentorsData";

interface FeaturedMentorSectionProps {
  onSuccessBooking?: () => void;
}

export const FeaturedMentorSection: React.FC<FeaturedMentorSectionProps> = ({
  onSuccessBooking,
}) => {
  const featuredMentor: Mentor = MENTORS_DATA[0]; // Aarav Sharma (Google SWE II)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  return (
    <section id="featured-mentor-section" className="w-full py-16 md:py-24 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="text-left space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Mentor Profile Spotlight
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            See how 1-on-1 mentorship works
          </h2>
          <p className="text-base text-slate-600 max-w-2xl font-normal">
            Take a deep look into our top-rated mentors: watch their intro, review their journey, and book directly.
          </p>
        </div>

        {/* Large Profile Layout (Two columns: Profile Info left, Sticky Booking Panel right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column (7 cols): Video Thumbnail, Bio, Timeline, Reviews */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Video Intro Thumbnail */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video shadow-md group">
              {isPlayingVideo ? (
                <div className="w-full h-full flex items-center justify-center bg-slate-950 text-white p-6 text-center">
                  <div className="space-y-2">
                    <p className="font-bold text-sm">"Hey! I'm Aarav. In our 1-on-1 sessions, I will break down real coding interview rubrics and audit your resume."</p>
                    <button
                      onClick={() => setIsPlayingVideo(false)}
                      className="text-xs text-blue-400 underline"
                    >
                      Close Video Preview
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <img
                    src={featuredMentor.videoThumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"}
                    alt="Video intro thumbnail"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Play Button Overlay */}
                  <button
                    onClick={() => setIsPlayingVideo(true)}
                    className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-blue-600/90 text-white flex items-center justify-center hover:bg-blue-600 hover:scale-110 transition-all shadow-xl"
                    aria-label="Play video introduction"
                  >
                    <Play className="h-7 w-7 fill-white translate-x-0.5" />
                  </button>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs uppercase font-mono tracking-wider text-blue-300 font-bold">
                      60-Second Video Intro
                    </p>
                    <h3 className="text-lg font-bold">
                      {featuredMentor.name} explains his mentorship roadmap
                    </h3>
                  </div>
                </>
              )}
            </div>

            {/* Mentor Details & Bio */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={featuredMentor.avatar}
                  alt={featuredMentor.name}
                  className="h-16 w-16 rounded-2xl object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-900">{featuredMentor.name}</h3>
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-blue-600">{featuredMentor.role}</p>
                  <p className="text-xs text-slate-500">{featuredMentor.companyOrCollege}</p>
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {featuredMentor.bio}
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                {featuredMentor.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="space-y-4">
              <h4 className="text-base font-bold text-slate-900">
                Career Journey Timeline
              </h4>
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
                {featuredMentor.journeyTimeline?.map((item, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pl-8">
                    <span className="absolute left-1.5 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-blue-600 shadow-sm" />
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600">{item.year}</span>
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="space-y-4 pt-2">
              <h4 className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Recent Student Feedback</span>
                <span className="text-xs font-semibold text-amber-600 flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.96 rating (78 reviews)
                </span>
              </h4>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Quote className="h-4 w-4 text-blue-600 shrink-0" />
                  <p className="text-xs sm:text-sm text-slate-700 italic">
                    "Aarav went through my distributed systems mock interview and gave me bar-raiser level feedback. I cleared my Google off-campus L3 interview on the first try!"
                  </p>
                </div>
                <p className="text-[11px] font-bold text-slate-900 pl-6">
                  — Priya R., B.Tech Final Year (Placed at Google Cloud)
                </p>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Sticky Booking Panel */}
          <div className="lg:col-span-5 sticky top-24">
            <BookingPanel
              mentor={featuredMentor}
              initialTopic="Placement Prep & FAANG Rounds"
              onSuccess={onSuccessBooking}
            />
          </div>

        </div>

      </div>
    </section>
  );
};
