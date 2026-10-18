import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Search,
  Calendar,
  ShieldCheck,
  Star,
  Sparkles,
  Compass,
  CheckCircle2,
  Lock,
} from "lucide-react";

import "@/components/consultancy/sandbox-consultancy.css";
import { Sandbox3DCore } from "@/components/consultancy/Sandbox3DCore";
import { SandboxLoader } from "@/components/consultancy/SandboxLoader";
import { SandboxCommandPalette } from "@/components/consultancy/SandboxCommandPalette";
import { SandboxMentorsTrack } from "@/components/consultancy/SandboxMentorsTrack";
import { SandboxScrubStatement } from "@/components/consultancy/SandboxScrubStatement";
import { BookingPanel } from "@/components/consultancy/BookingPanel";
import { MENTORS_DATA, Mentor } from "@/components/consultancy/data/mentorsData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export const Consultancy: React.FC = () => {
  // Scroll and layout state
  const [scrollY, setScrollY] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isDarkTop, setIsDarkTop] = useState(true);
  const [isSolidTop, setIsSolidTop] = useState(false);
  const [isRailActive, setIsRailActive] = useState(false);
  const [railMarkerY, setRailMarkerY] = useState(0);

  // Frame insets for scroll expansion animation
  const [frameInsets, setFrameInsets] = useState({
    top: 80,
    x: 24,
    bottom: 24,
    radius: 24,
  });

  // Modal and palette state
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLoaderDone, setIsLoaderDone] = useState(false);

  // Chapter DOM references
  const storyRef = useRef<HTMLDivElement | null>(null);
  const chaptersRefs = useRef<(HTMLElement | null)[]>([]);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll tracking and animation updates
  const handleScroll = useCallback(() => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    setScrollY(y);

    // 1. Frame expansion animation (From inset card to full bleed)
    // Between 0 and 0.6 vh, insets contract to 0
    const openProgress = Math.max(0, Math.min(1, y / (vh * 0.65)));
    const gutter = Math.min(40, Math.max(16, window.innerWidth * 0.025));

    // When approaching end of story (around 6.5 vh), close frame back
    const storyEl = storyRef.current;
    const storyHeight = storyEl ? storyEl.offsetHeight : vh * 7;
    const closeThreshold = storyHeight - vh * 1.5;
    const closeProgress = Math.max(0, Math.min(1, (y - closeThreshold) / (vh * 0.8)));

    if (closeProgress > 0) {
      setFrameInsets({
        top: Math.round(closeProgress * 80),
        x: Math.round(closeProgress * gutter),
        bottom: Math.round(closeProgress * gutter),
        radius: Math.round(closeProgress * 24),
      });
      setIsDarkTop(closeProgress < 0.7);
    } else {
      setFrameInsets({
        top: Math.round((1 - openProgress) * 80),
        x: Math.round((1 - openProgress) * gutter),
        bottom: Math.round((1 - openProgress) * gutter),
        radius: Math.round((1 - openProgress) * 24),
      });
      setIsDarkTop(true);
    }

    // Header background state when past the dark story
    const isPastStory = y > storyHeight - 80;
    setIsSolidTop(isPastStory);
    if (isPastStory) setIsDarkTop(false);

    // 2. Chapter calculations
    // Hero is 0. 5 Chapters correspond to 1, 2, 3, 4, 5.
    const heroH = vh;
    const chapterH = vh * 1.2;

    if (y < heroH * 0.5) {
      setCurrentChapter(y / (heroH * 0.5));
      setIsRailActive(false);
      setActiveChapterIndex(0);
    } else {
      const chapterOffset = Math.max(0, y - heroH);
      const rawChapter = 1 + chapterOffset / chapterH;
      const clampedChapter = Math.min(5, Math.max(1, rawChapter));
      setCurrentChapter(clampedChapter);

      const activeIdx = Math.min(4, Math.max(0, Math.floor(clampedChapter - 1)));
      setActiveChapterIndex(activeIdx);

      // Rail visibility: only during chapters
      const inChapterRegion = y >= heroH * 0.7 && y < storyHeight - vh * 0.8;
      setIsRailActive(inChapterRegion);

      // Smooth rail marker Y (approx 36px per rail button)
      const markerPos = (clampedChapter - 1) * 38;
      setRailMarkerY(markerPos);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Jump to Chapter
  const scrollToChapter = (chapterId: string) => {
    const el = document.getElementById(chapterId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Open booking modal for a specific mentor
  const handleOpenBooking = (mentor?: Mentor) => {
    setSelectedMentor(mentor || MENTORS_DATA[0]);
    setIsBookingOpen(true);
  };

  // Chapters Data
  const CHAPTERS_LIST = [
    {
      id: "sb-ch-admissions",
      number: "01",
      railLabel: "Admissions",
      title: "Get in where you belong.",
      lede: "SOP strategy, college shortlisting, and entrance counseling from seniors who cracked your dream university.",
      modules: [
        {
          id: "mod-1",
          number: "01",
          title: "Ivy League & US Top-20 SOP Critique",
          mentorName: "Sarah Jenkins",
          mentorInst: "Stanford MS CS",
          mentorId: "sarah-jenkins",
        },
        {
          id: "mod-2",
          number: "02",
          title: "IIT & Top Engineering College Counseling",
          mentorName: "Arjun Sharma",
          mentorInst: "IIT Delhi",
          mentorId: "arjun-sharma",
        },
        {
          id: "mod-3",
          number: "03",
          title: "MBA & Business School Application Strategy",
          mentorName: "Priya Patel",
          mentorInst: "IIM Ahmedabad",
          mentorId: "priya-patel",
        },
      ],
    },
    {
      id: "sb-ch-courses",
      number: "02",
      railLabel: "Course Selection",
      title: "Choose with certainty. Not hearsay.",
      lede: "Pick the right major, avoid four years of regret, and map your academic curriculum directly to industry demands.",
      modules: [
        {
          id: "mod-4",
          number: "04",
          title: "CS vs AI/ML vs Data Science Degree Audit",
          mentorName: "David Kim",
          mentorInst: "Microsoft AI",
          mentorId: "david-kim",
        },
        {
          id: "mod-5",
          number: "05",
          title: "Branch Change & Dual Degree Roadmaps",
          mentorName: "Ananya Sengupta",
          mentorInst: "BITS Pilani",
          mentorId: "ananya-sengupta",
        },
        {
          id: "mod-6",
          number: "06",
          title: "Core Engineering to Software Transition",
          mentorName: "Marcus Vance",
          mentorInst: "Uber Tech",
          mentorId: "marcus-vance",
        },
      ],
    },
    {
      id: "sb-ch-abroad",
      number: "03",
      railLabel: "Study Abroad",
      title: "Fly with zero surprises.",
      lede: "GRE/IELTS shortcuts, mock visa interviews, tuition scholarships, and post-study work visa realities.",
      modules: [
        {
          id: "mod-7",
          number: "07",
          title: "US, UK & Germany Master's Roadmap",
          mentorName: "Sarah Jenkins",
          mentorInst: "Stanford University",
          mentorId: "sarah-jenkins",
        },
        {
          id: "mod-8",
          number: "08",
          title: "Full-Ride Scholarships & TA/RA Tactics",
          mentorName: "Elena Rostova",
          mentorInst: "ETH Zurich",
          mentorId: "elena-rostova",
        },
        {
          id: "mod-9",
          number: "09",
          title: "F-1 Student Visa Mock Interview Prep",
          mentorName: "Rohan Nair",
          mentorInst: "Carnegie Mellon",
          mentorId: "rohan-nair",
        },
      ],
    },
    {
      id: "sb-ch-internships",
      number: "04",
      railLabel: "Internships",
      title: "Land the summer gig.",
      lede: "Cold outreach templates, open-source portfolio proof, and getting noticed by hiring managers before rounds close.",
      modules: [
        {
          id: "mod-10",
          number: "10",
          title: "FAANG & High-Growth Startup Outreach",
          mentorName: "Arjun Sharma",
          mentorInst: "Google L4",
          mentorId: "arjun-sharma",
        },
        {
          id: "mod-11",
          number: "11",
          title: "GitHub & Production Portfolio Audit",
          mentorName: "David Kim",
          mentorInst: "Microsoft",
          mentorId: "david-kim",
        },
        {
          id: "mod-12",
          number: "12",
          title: "First-Year & Sophomore Internship Strategy",
          mentorName: "Ananya Sengupta",
          mentorInst: "BITS Pilani",
          mentorId: "ananya-sengupta",
        },
      ],
    },
    {
      id: "sb-ch-placements",
      number: "05",
      railLabel: "Placements",
      title: "Crack the code. Secure the package.",
      lede: "Live 1-on-1 coding mock interviews, system design breakdown, and high-impact compensation negotiation.",
      modules: [
        {
          id: "mod-13",
          number: "13",
          title: "FAANG LeetCode & System Design Simulation",
          mentorName: "Arjun Sharma",
          mentorInst: "Google",
          mentorId: "arjun-sharma",
        },
        {
          id: "mod-14",
          number: "14",
          title: "Quant Finance & FinTech Engineering Prep",
          mentorName: "Marcus Vance",
          mentorInst: "Uber / FinTech",
          mentorId: "marcus-vance",
        },
        {
          id: "mod-15",
          number: "15",
          title: "Multiple Offer Negotiation & Equity Strategy",
          mentorName: "Priya Patel",
          mentorInst: "McKinsey Alumni",
          mentorId: "priya-patel",
        },
      ],
    },
  ];

  return (
    <div className="sb-root">
      {/* ─────────────────────────────────────────────────────────────
         SESSION BOOT LOADER (Matching sandbox-os loader)
         ───────────────────────────────────────────────────────────── */}
      <SandboxLoader onComplete={() => setIsLoaderDone(true)} />

      {/* ─────────────────────────────────────────────────────────────
         FLOATING COMMAND PALETTE (Ctrl + K)
         ───────────────────────────────────────────────────────────── */}
      <SandboxCommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelectMentor={(mentor) => handleOpenBooking(mentor)}
        onSelectChapter={(chapterId) => scrollToChapter(chapterId)}
      />

      {/* ─────────────────────────────────────────────────────────────
         HEADER (Matching sandbox-os k-top with brand mark & pills)
         ───────────────────────────────────────────────────────────── */}
      <header className={`sb-top ${isDarkTop ? "is-dark" : ""} ${isSolidTop ? "is-solid" : ""}`}>
        <Link to="/" className="sb-mark">
          <div className="sb-mark-icon">
            <svg width="20" height="20" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="10" fill="#FF8F2E" fillOpacity="0.4" />
              <circle cx="32" cy="32" r="5" fill="#FF8F2E" />
            </svg>
          </div>
          <span>tasskly</span>
        </Link>

        <p className="sb-top-tag">
          Direct 1-on-1 sessions with verified seniors &amp; alumni.
        </p>

        <nav className="sb-top-nav">
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="sb-pill sb-pill-ghost"
            type="button"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <span className="sb-kbd">Ctrl K</span>
          </button>

          <button
            onClick={() => scrollToChapter("sb-ch-admissions")}
            className="sb-pill sb-pill-ghost hidden md:inline-flex"
          >
            Roadmap
          </button>

          <button
            onClick={() => scrollToChapter("sb-mentors-catalog")}
            className="sb-pill sb-pill-ghost hidden sm:inline-flex"
          >
            Mentors
          </button>

          <button
            onClick={() => handleOpenBooking()}
            className="sb-pill sb-pill-dark"
          >
            <span>Book Session</span>
            <span className="sb-pill-dot" />
          </button>
        </nav>
      </header>

      {/* ─────────────────────────────────────────────────────────────
         THE STORY CONTAINER & 3D STICKY FRAME
         ───────────────────────────────────────────────────────────── */}
      <div ref={storyRef} className="sb-story" id="sb-story">
        {/* Sticky Background 3D Scene */}
        <div className="sb-scene">
          <div
            className="sb-frame"
            style={{
              clipPath: `inset(${frameInsets.top}px ${frameInsets.x}px ${frameInsets.bottom}px ${frameInsets.x}px round ${frameInsets.radius}px)`,
            }}
          >
            <div className="sb-canvas-holder">
              <Sandbox3DCore currentChapter={currentChapter} scrollY={scrollY} />
            </div>
            <div className="sb-shade" />
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
           STICKY RIGHT-HAND CHAPTER RAIL (Matching sandbox-os k-rail)
           ───────────────────────────────────────────────────────────── */}
        <ol className={`sb-rail ${isRailActive ? "is-active" : ""}`} aria-label="Roadmap Chapters">
          <div
            className="sb-rail-marker"
            style={{ transform: `translateY(${railMarkerY}px)` }}
          />
          {CHAPTERS_LIST.map((chap, idx) => {
            const isCurrent = idx === activeChapterIndex;
            return (
              <li key={chap.id}>
                <button
                  onClick={() => scrollToChapter(chap.id)}
                  className={`sb-rail-btn ${isCurrent ? "is-current" : ""}`}
                >
                  <span className="sb-rail-n">{chap.number}</span>
                  <span className="sb-rail-t">{chap.railLabel}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* ─────────────────────────────────────────────────────────────
           MAIN EDITORIAL CONTENT OVER THE PINNED 3D SCENE
           ───────────────────────────────────────────────────────────── */}
        <main className="relative z-10 outline-none">
          {/* Chapter 0: Hero Section */}
          <section className="sb-hero" id="sb-hero">
            <div className="sb-hero-inner">
              <h1 className="sb-wordmark">consultancy</h1>
              <div>
                <p className="sb-hero-lede">
                  Direct one-on-one sessions with verified seniors, alumni, and industry engineers who have already walked your path.
                </p>
                <div className="sb-actions">
                  <button
                    onClick={() => scrollToChapter("sb-ch-admissions")}
                    className="sb-pill sb-pill-white sb-pill-lg"
                  >
                    <span>Explore Roadmap</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => scrollToChapter("sb-mentors-catalog")}
                    className="sb-pill sb-pill-glass sb-pill-lg"
                  >
                    Browse Mentors
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Chapters 1 to 5: Sequential Editorial Chapters */}
          {CHAPTERS_LIST.map((chap, idx) => (
            <section
              key={chap.id}
              id={chap.id}
              className="sb-chapter"
              ref={(el) => (chaptersRefs.current[idx] = el)}
            >
              <div className="sb-chapter-inner">
                <p className="sb-chapter-n">{chap.number}</p>
                <h2 className="sb-h2">{chap.title}</h2>
                <p className="sb-p">{chap.lede}</p>

                {/* Module rows list */}
                <ul className="sb-mods">
                  {chap.modules.map((mod) => (
                    <li key={mod.id} className="sb-mods-item">
                      <button
                        onClick={() => {
                          const matchedMentor = MENTORS_DATA.find((m) => m.id === mod.mentorId);
                          handleOpenBooking(matchedMentor || MENTORS_DATA[0]);
                        }}
                        className="sb-mods-link"
                      >
                        <span className="sb-mods-n">{mod.number}</span>
                        <span className="sb-mods-t">{mod.title}</span>
                        <span className="sb-mods-tag">{mod.mentorInst}</span>
                        <ArrowUpRight className="sb-mods-arrow" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}

          {/* Chapter Closing Transition Card */}
          <section className="sb-chapter-closing">
            <div>
              <p className="sb-chapter-n">06</p>
              <h2 className="sb-closing-title">One platform. Every milestone.</h2>
              <p className="sb-p mx-auto text-slate-300 max-w-lg mb-8">
                From choosing your degree to negotiating your dream tech package, connect directly with mentors who hold the keys.
              </p>
              <button
                onClick={() => handleOpenBooking()}
                className="sb-pill sb-pill-white sb-pill-lg mx-auto"
              >
                <span>Book a Verified Session</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
         HORIZONTAL WORK TRACK (Pinned sideways scroll matching k-work)
         ───────────────────────────────────────────────────────────── */}
      <SandboxMentorsTrack
        onSelectMentor={(mentor) => handleOpenBooking(mentor)}
      />

      {/* ─────────────────────────────────────────────────────────────
         WORD-SCRUBBING STATEMENT (Matching sandbox-os data-scrub-words)
         ───────────────────────────────────────────────────────────── */}
      <SandboxScrubStatement
        label="The Mentorship Standard"
        statement="Every student deserves direct access to someone who has already walked the path. No middlemen. No obsolete hearsay. Just real, verified 1-on-1 guidance from top seniors, alumni, and working engineers."
      />

      {/* ─────────────────────────────────────────────────────────────
         CTA BLOCK
         ───────────────────────────────────────────────────────────── */}
      <section className="sb-cta">
        <h2 className="sb-cta-h">
          <button
            onClick={() => handleOpenBooking()}
            className="sb-cta-link group"
          >
            <span>Book your session</span>
            <ArrowRight className="h-10 w-10 sm:h-16 sm:w-16 group-hover:translate-x-3 transition-transform" />
          </button>
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600 font-medium">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 100% Verified Mentors
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" /> Google Meet Calendar Sync
          </span>
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-slate-600" /> Guaranteed Escrow Protection
          </span>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
         FOOTER
         ───────────────────────────────────────────────────────────── */}
      <footer className="sb-foot">
        <div className="sb-foot-top">
          <div>
            <p className="font-bold text-lg text-slate-900 mb-2">tasskly</p>
            <p className="text-sm text-slate-500 max-w-xs">
              The student freelance marketplace &amp; verified 1-on-1 mentorship ecosystem.
            </p>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Roadmap</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li><button onClick={() => scrollToChapter("sb-ch-admissions")} className="hover:text-blue-600">Admissions</button></li>
              <li><button onClick={() => scrollToChapter("sb-ch-courses")} className="hover:text-blue-600">Course Selection</button></li>
              <li><button onClick={() => scrollToChapter("sb-ch-abroad")} className="hover:text-blue-600">Study Abroad</button></li>
              <li><button onClick={() => scrollToChapter("sb-ch-internships")} className="hover:text-blue-600">Internships</button></li>
              <li><button onClick={() => scrollToChapter("sb-ch-placements")} className="hover:text-blue-600">Placements</button></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3">Platform</p>
            <ul className="space-y-1.5 text-sm text-slate-600">
              <li><Link to="/jobs" className="hover:text-blue-600">Browse Jobs</Link></li>
              <li><Link to="/post-job" className="hover:text-blue-600">Post a Task</Link></li>
              <li><Link to="/internships" className="hover:text-blue-600">Internships</Link></li>
              <li><Link to="/dashboard" className="hover:text-blue-600">Student Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="sb-foot-bottom">
          <p>© 2026 Tasskly Technologies. All rights reserved.</p>
          <p>Crafted for students, future engineers, and campus builders.</p>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
         BOOKING MODAL DIALOG
         ───────────────────────────────────────────────────────────── */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border-slate-200">
          <DialogHeader className="p-6 bg-slate-900 text-white">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
              <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Verified 1-on-1 Mentorship
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              {selectedMentor ? `Book Session with ${selectedMentor.name}` : "Book a Verified Mentor"}
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-sm">
              {selectedMentor
                ? `${selectedMentor.role} · ${selectedMentor.institution} (₹${selectedMentor.price} / 30m session)`
                : "Select a date and time slot for your 1-on-1 video call."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 max-h-[75vh] overflow-y-auto">
            <BookingPanel
              mentor={selectedMentor || MENTORS_DATA[0]}
              onClose={() => setIsBookingOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Consultancy;
