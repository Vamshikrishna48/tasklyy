import React, { useState, useMemo } from "react";
import { Filter, Search, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MentorCard } from "../MentorCard";
import { MENTORS_DATA, Mentor } from "../data/mentorsData";

interface MarketplaceSectionProps {
  onBookMentor: (mentor: Mentor) => void;
  onPreviewMentor: (mentor: Mentor) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
}

export const MarketplaceSection: React.FC<MarketplaceSectionProps> = ({
  onBookMentor,
  onPreviewMentor,
  selectedCategory,
  onCategoryChange,
}) => {
  const [companyFilter, setCompanyFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(6);

  const filteredMentors = useMemo(() => {
    return MENTORS_DATA.filter((m) => {
      // Goal Filter
      if (selectedCategory !== "all" && m.category !== selectedCategory) {
        return false;
      }
      // Company or College Filter
      if (companyFilter !== "all") {
        if (!m.companyOrCollege.toLowerCase().includes(companyFilter.toLowerCase())) {
          return false;
        }
      }
      // Language Filter
      if (languageFilter !== "all") {
        if (!m.languages.some((lang) => lang.toLowerCase() === languageFilter.toLowerCase())) {
          return false;
        }
      }
      // Price Filter
      if (priceFilter === "free" && m.price !== 0) return false;
      if (priceFilter === "under500" && (m.price === 0 || m.price > 499)) return false;
      if (priceFilter === "above500" && m.price < 500) return false;

      // Availability Filter
      if (availabilityFilter === "today" && !m.nextAvailable.toLowerCase().includes("today")) {
        return false;
      }

      return true;
    });
  }, [selectedCategory, companyFilter, languageFilter, priceFilter, availabilityFilter]);

  const displayedMentors = filteredMentors.slice(0, visibleCount);

  const handleResetFilters = () => {
    onCategoryChange("all");
    setCompanyFilter("all");
    setLanguageFilter("all");
    setPriceFilter("all");
    setAvailabilityFilter("all");
  };

  return (
    <section id="marketplace-section" className="w-full py-16 md:py-24 px-4 md:px-8 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-left space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Verified Directory
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Find Your Mentor
              </h2>
              <p className="text-base text-slate-600 font-normal mt-1">
                Browse verified seniors and working professionals ready for 1-on-1 video sessions.
              </p>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              Showing <strong className="text-slate-900">{displayedMentors.length}</strong> of {filteredMentors.length} mentors
            </span>
          </div>
        </div>

        {/* Filter Bar: Goal, College/Company, Language, Price, Availability */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1">
            <Filter className="h-4 w-4 text-blue-600" />
            <span>Filters:</span>
          </div>

          {/* 1. Goal */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Goals</option>
            <option value="course-selection">Course Selection</option>
            <option value="admissions">College Admissions</option>
            <option value="study-abroad">Study Abroad</option>
            <option value="internships">Internships</option>
            <option value="placements">Placements</option>
          </select>

          {/* 2. College or Company */}
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Colleges & Companies</option>
            <option value="google">Google</option>
            <option value="microsoft">Microsoft</option>
            <option value="uber">Uber</option>
            <option value="goldman">Goldman Sachs</option>
            <option value="iit">IIT Alumni</option>
            <option value="bits">BITS Pilani Alumni</option>
            <option value="oxford">Oxford Alumni</option>
            <option value="carnegie">Carnegie Mellon</option>
          </select>

          {/* 3. Language */}
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Languages</option>
            <option value="english">English</option>
            <option value="hindi">Hindi</option>
            <option value="tamil">Tamil</option>
            <option value="bengali">Bengali</option>
            <option value="marathi">Marathi</option>
          </select>

          {/* 4. Price */}
          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">Any Price</option>
            <option value="free">Free Intro Session</option>
            <option value="under500">Under ₹500</option>
            <option value="above500">₹500 & Above</option>
          </select>

          {/* 5. Availability */}
          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="h-9 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-600"
          >
            <option value="all">Any Time</option>
            <option value="today">Available Today</option>
          </select>

          {(selectedCategory !== "all" || companyFilter !== "all" || languageFilter !== "all" || priceFilter !== "all" || availabilityFilter !== "all") && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 ml-auto"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>

        {/* Grid of Mentor Cards, 3 Across */}
        {displayedMentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onBook={onBookMentor}
                onPreview={onPreviewMentor}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-3">
            <p className="text-slate-600 font-medium">No mentors found matching your filter combination.</p>
            <Button variant="outline" size="sm" onClick={handleResetFilters} className="rounded-xl">
              Reset Filters
            </Button>
          </div>
        )}

        {/* Load More Button Below */}
        {visibleCount < filteredMentors.length && (
          <div className="pt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="h-11 px-8 rounded-xl border-slate-300 font-bold text-xs sm:text-sm text-slate-800 hover:border-blue-600 hover:text-blue-600 transition-colors shadow-xs"
            >
              Load more mentors ({filteredMentors.length - visibleCount} remaining)
            </Button>
          </div>
        )}

      </div>
    </section>
  );
};
