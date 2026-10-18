import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Search, ArrowRight, ShieldCheck } from "lucide-react";

// Sections in exact order
import { NavbarSection } from "@/components/consultancy/sections/NavbarSection";
import { HeroSection } from "@/components/consultancy/sections/HeroSection";
import { ChooseGoalSection } from "@/components/consultancy/sections/ChooseGoalSection";
import { MarketplaceSection } from "@/components/consultancy/sections/MarketplaceSection";
import { FeaturedMentorSection } from "@/components/consultancy/sections/FeaturedMentorSection";
import { HowBookingWorksSection } from "@/components/consultancy/sections/HowBookingWorksSection";
import { BookingSection } from "@/components/consultancy/sections/BookingSection";
import { StudentStoriesSection } from "@/components/consultancy/sections/StudentStoriesSection";
import { BecomeMentorSection } from "@/components/consultancy/sections/BecomeMentorSection";
import { FaqSection } from "@/components/consultancy/sections/FaqSection";
import { FinalCtaSection } from "@/components/consultancy/sections/FinalCtaSection";
import { FooterSection } from "@/components/consultancy/sections/FooterSection";

// 3D Canvas & Data
import { StudentPathCanvas3D, MILESTONES } from "@/components/consultancy/StudentPathCanvas3D";
import { BookingPanel } from "@/components/consultancy/BookingPanel";
import { MENTORS_DATA, Mentor, GoalCategory } from "@/components/consultancy/data/mentorsData";

export const Consultancy: React.FC = () => {
  // Scroll Progress (0.0 to 1.0)
  const [scrollProgress, setScrollProgress] = useState(0);

  // Active Milestone Index (0: Course, 1: Admission, 2: Study Abroad, 3: Internship, 4: Placements)
  const [activeMilestoneIndex, setActiveMilestoneIndex] = useState(0);

  // Category filter state
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Reduced motion preference
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Selected Mentor for Booking Modal
  const [activeBookingMentor, setActiveBookingMentor] = useState<Mentor | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Featured Mentor Preview Modal
  const [previewMentor, setPreviewMentor] = useState<Mentor | null>(null);

  // Track scroll position to update top progress bar and active milestone
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;
      const progress = Math.min(Math.max(window.scrollY / totalScroll, 0), 1);
      setScrollProgress(progress);

      // Map progress to the 5 milestones along the student path
      if (progress < 0.18) {
        setActiveMilestoneIndex(0); // Choose Course
      } else if (progress < 0.38) {
        setActiveMilestoneIndex(1); // Get Admission
      } else if (progress < 0.58) {
        setActiveMilestoneIndex(2); // Study Abroad
      } else if (progress < 0.78) {
        setActiveMilestoneIndex(3); // Land Internship
      } else {
        setActiveMilestoneIndex(4); // Get Placed
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check prefers-reduced-motion on mount
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) setIsReducedMotion(true);
  }, []);

  // Category Selection
  const handleSelectCategory = (cat: GoalCategory | string) => {
    const catId = typeof cat === "string" ? cat : cat.id;
    setSelectedCategory(catId);

    // Map to milestone index
    const milestoneMap: Record<string, number> = {
      "course-selection": 0,
      "admissions": 1,
      "study-abroad": 2,
      "internships": 3,
      "placements": 4,
    };
    if (milestoneMap[catId] !== undefined) {
      setActiveMilestoneIndex(milestoneMap[catId]);
    }

    // Smooth scroll to marketplace
    const el = document.getElementById("marketplace-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Search Submit
  const handleSearch = (query: string, category?: string) => {
    if (category && category !== "all") {
      setSelectedCategory(category);
    }
  };

  // Open booking modal
  const handleOpenBooking = (mentor?: Mentor) => {
    setActiveBookingMentor(mentor || MENTORS_DATA[0]);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* ─────────────────────────────────────────────────────────────
         THIN PROGRESS BAR ON TOP
         ───────────────────────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-100">
        <div
          className="h-full bg-blue-600 transition-all duration-75"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 1: NAVBAR (FIXED)
         ───────────────────────────────────────────────────────────── */}
      <NavbarSection
        onBookClick={() => handleOpenBooking()}
        isReducedMotion={isReducedMotion}
        onToggleMotion={() => setIsReducedMotion(!isReducedMotion)}
      />

      {/* ─────────────────────────────────────────────────────────────
         MOBILE MILESTONE STRIP (SLIM STICKY TOP STRIP FOR PHONES)
         ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-14 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2 flex items-center justify-between overflow-x-auto gap-2">
        {MILESTONES.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => handleSelectCategory(m.id)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
              idx === activeMilestoneIndex
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ─────────────────────────────────────────────────────────────
         MAIN CONTENT CONTAINER
         ───────────────────────────────────────────────────────────── */}
      <main className="w-full">
        
        {/* SECTION 2: HERO */}
        <HeroSection
          onSearch={handleSearch}
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
          isReducedMotion={isReducedMotion}
          onBookClick={() => handleOpenBooking()}
        />

        {/* SECTION 3: CHOOSE YOUR GOAL */}
        <ChooseGoalSection
          onSelectCategory={handleSelectCategory}
          selectedCategory={selectedCategory}
        />

        {/* SECTION 4: MENTOR MARKETPLACE */}
        <MarketplaceSection
          onBookMentor={(m) => handleOpenBooking(m)}
          onPreviewMentor={(m) => setPreviewMentor(m)}
          selectedCategory={selectedCategory}
          onCategoryChange={(cat) => setSelectedCategory(cat)}
        />

        {/* SECTION 5: MENTOR PROFILE PREVIEW (FEATURED MENTOR) */}
        <FeaturedMentorSection
          onSuccessBooking={() => {}}
        />

        {/* SECTION 6: HOW BOOKING WORKS */}
        <HowBookingWorksSection
          onBookClick={() => handleOpenBooking()}
        />

        {/* SECTION 7: BOOKING PANEL DESIGN (STANDALONE SECTION) */}
        <BookingSection
          selectedMentor={activeBookingMentor || undefined}
          onSuccess={() => {}}
        />

        {/* SECTION 8: STUDENT STORIES */}
        <StudentStoriesSection />

        {/* SECTION 9: BECOME A MENTOR */}
        <BecomeMentorSection />

        {/* SECTION 10: FAQ */}
        <FaqSection />

        {/* SECTION 11: FINAL CTA */}
        <FinalCtaSection
          onFindMentor={() => {
            const el = document.getElementById("marketplace-section");
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }}
        />

      </main>

      {/* ─────────────────────────────────────────────────────────────
         SECTION 12: FOOTER
         ───────────────────────────────────────────────────────────── */}
      <FooterSection />

      {/* ─────────────────────────────────────────────────────────────
         STICKY BOTTOM MOBILE ACTION BAR (MOBILE FIRST)
         ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-xl flex items-center justify-between gap-3">
        <div className="text-left">
          <p className="text-xs font-bold text-slate-900">Need Guidance?</p>
          <p className="text-[11px] text-slate-500">Free 1-on-1 intro available</p>
        </div>
        <Button
          onClick={() => handleOpenBooking()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-xs"
        >
          <span>Find a mentor</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         BOOKING MODAL DIALOG (OPENED FROM ANY MENTOR CARD)
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-xl p-0 rounded-2xl overflow-hidden border-0 bg-transparent">
          <BookingPanel
            mentor={activeBookingMentor || undefined}
            onSuccess={() => {}}
          />
        </DialogContent>
      </Dialog>

      {/* ─────────────────────────────────────────────────────────────
         MENTOR PROFILE PREVIEW MODAL
         ───────────────────────────────────────────────────────────── */}
      {previewMentor && (
        <Dialog open={!!previewMentor} onOpenChange={(open) => !open && setPreviewMentor(null)}>
          <DialogContent className="max-w-2xl p-6 rounded-2xl text-left space-y-4">
            <DialogHeader className="text-left space-y-1">
              <div className="flex items-center gap-3">
                <img
                  src={previewMentor.avatar}
                  alt={previewMentor.name}
                  className="h-14 w-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs"
                />
                <div>
                  <DialogTitle className="text-xl font-bold text-slate-900">
                    {previewMentor.name}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-blue-600 font-semibold">
                    {previewMentor.role} • {previewMentor.companyOrCollege}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
              {previewMentor.bio}
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {previewMentor.tags.map((t, i) => (
                <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                  {t}
                </span>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">Session Investment:</span>
              <span className="font-extrabold text-blue-600">{previewMentor.priceLabel}</span>
            </div>

            <Button
              onClick={() => {
                const target = previewMentor;
                setPreviewMentor(null);
                handleOpenBooking(target);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl"
            >
              Proceed to Book Session
            </Button>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default Consultancy;
