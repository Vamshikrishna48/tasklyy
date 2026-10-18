import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Eye, EyeOff } from "lucide-react";

interface NavbarSectionProps {
  onBookClick: () => void;
  isReducedMotion: boolean;
  onToggleMotion: () => void;
}

export const NavbarSection: React.FC<NavbarSectionProps> = ({
  onBookClick,
  isReducedMotion,
  onToggleMotion,
}) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 md:px-8 py-3.5 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Home link & Brand */}
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl text-xs h-9"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-blue-600" />
              <span>Home</span>
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-slate-900">
              Tasskly
            </span>
            <span className="text-blue-600 font-bold text-xs">/</span>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Mentors
            </span>
          </div>
        </div>

        {/* Center: Clean links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <button
            onClick={() => scrollTo("marketplace-section")}
            className="hover:text-blue-600 transition-colors"
          >
            Find a mentor
          </button>
          <button
            onClick={() => scrollTo("how-it-works-section")}
            className="hover:text-blue-600 transition-colors"
          >
            How it works
          </button>
          <button
            onClick={() => scrollTo("stories-section")}
            className="hover:text-blue-600 transition-colors"
          >
            Stories
          </button>
          <button
            onClick={() => scrollTo("become-mentor-section")}
            className="hover:text-blue-600 transition-colors"
          >
            Become a mentor
          </button>
        </nav>

        {/* Right: Motion Toggle & Book a session button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleMotion}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
            title={isReducedMotion ? "Enable 3D Journey" : "Reduce Motion"}
            aria-label="Toggle reduced motion"
          >
            {isReducedMotion ? <EyeOff className="h-4 w-4 text-amber-500" /> : <Eye className="h-4 w-4 text-blue-600" />}
            <span className="hidden md:inline">{isReducedMotion ? "Motion Off" : "3D Path"}</span>
          </button>

          <Button
            onClick={onBookClick}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 h-10 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 gap-2"
          >
            <Calendar className="h-4 w-4" />
            <span>Book a session</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
