import React, { useState, useEffect, useRef } from "react";
import { Search, ArrowRight, Layers, Compass, Sparkles, X } from "lucide-react";
import { Mentor } from "./data/mentorsData";

interface SandboxCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMentor: (mentor?: Mentor, topic?: string) => void;
  onSelectChapter: (chapterId: string) => void;
}

export const SandboxCommandPalette: React.FC<SandboxCommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectMentor,
  onSelectChapter,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // List of searchable roadmap chapters
  const chapters = [
    { id: "sb-ch-admissions", title: "01 Admissions & SOP Strategy", type: "chapter" },
    { id: "sb-ch-courses", title: "02 Course Selection & Branch Changes", type: "chapter" },
    { id: "sb-ch-abroad", title: "03 Study Abroad & Visa Counseling", type: "chapter" },
    { id: "sb-ch-college", title: "04 College Comparison & Campus Realities", type: "chapter" },
    { id: "sb-ch-seat", title: "05 Seat Allotment & Counseling Strategy", type: "chapter" },
  ];

  // List of searchable strategy blueprints (decision topics)
  const blueprints = [
    {
      id: "bp-seat-matrix",
      title: "JoSAA & CET Choice-Filling Allotment Matrix",
      category: "05 Seat Allotment",
      keywords: ["josaa", "cet", "seat", "allotment", "choice", "filling", "rank", "counseling"],
    },
    {
      id: "bp-campus-roi",
      title: "Tier-1 vs Tier-2 Campus ROI Diagnostic",
      category: "04 College Comparison",
      keywords: ["tier-1", "tier-2", "roi", "placement", "campus", "college", "package", "salary"],
    },
    {
      id: "bp-branch-tree",
      title: "Branch Sliding & Core-to-Tech Transition Lab",
      category: "02 Course Selection",
      keywords: ["branch", "sliding", "change", "core", "tech", "transition", "cs", "mechanical", "electrical"],
    },
    {
      id: "bp-sop-audit",
      title: "US & EU Top-20 SOP Critique Blueprint",
      category: "03 Study Abroad",
      keywords: ["sop", "statement of purpose", "us", "eu", "admissions", "audit", "stanford", "cmu", "eth"],
    },
    {
      id: "bp-visa-meter",
      title: "F-1 & Schengen Student Visa Mock Chamber",
      category: "03 Visa Prep",
      keywords: ["visa", "f-1", "schengen", "mock", "interview", "embassy", "consulate", "214b"],
    },
    {
      id: "bp-cs-venn",
      title: "CS vs AI/ML vs Data Science Degree Audit",
      category: "02 Course Selection",
      keywords: ["cs", "ai", "ml", "data science", "degree", "audit", "curriculum", "syllabus"],
    },
    {
      id: "bp-spot-radar",
      title: "Spot Rounds & Vacancy Heatmap Strategy",
      category: "05 Seat Allotment",
      keywords: ["spot", "rounds", "vacancy", "heatmap", "cutoff", "sliding", "allotment"],
    },
    {
      id: "bp-hostel-blueprint",
      title: "Hostel Living, Mess & Peer Community Vetting",
      category: "04 Campus Realities",
      keywords: ["hostel", "mess", "food", "campus", "living", "curfew", "peer", "life"],
    },
  ];

  const filteredChapters = chapters.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredBlueprints = blueprints.filter(
    (b) =>
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      b.category.toLowerCase().includes(query.toLowerCase()) ||
      b.keywords.some((kw) => kw.toLowerCase().includes(query.toLowerCase()))
  );

  const allItems = [
    ...filteredChapters.map((c) => ({ ...c, itemType: "chapter" as const })),
    ...filteredBlueprints.map((b) => ({ ...b, itemType: "blueprint" as const })),
  ];

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = allItems[selectedIndex];
      if (current) {
        if (current.itemType === "chapter") {
          onSelectChapter(current.id);
        } else {
          onSelectMentor(undefined, current.title);
        }
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="sb-palette-overlay" onClick={onClose}>
      <div
        className="sb-palette-modal animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="sb-palette-input-wrap">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="sb-palette-input"
            placeholder="Search milestones, blueprints, or decision topics (e.g. SOP, JoSAA, Visa)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <ul className="sb-palette-list">
          {allItems.length === 0 ? (
            <li className="py-8 text-center text-sm text-slate-400">
              No milestones or blueprints found for &quot;{query}&quot;
            </li>
          ) : (
            allItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <li
                  key={item.id}
                  className={`sb-palette-item ${isSelected ? "is-selected" : ""}`}
                  onClick={() => {
                    if (item.itemType === "chapter") {
                      onSelectChapter(item.id);
                    } else {
                      onSelectMentor(undefined, item.title);
                    }
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        item.itemType === "chapter"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      {item.itemType === "chapter" ? (
                        <Compass className="h-4 w-4" />
                      ) : (
                        <Layers className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {item.itemType === "chapter" ? "Milestone Roadmap" : `Decision Blueprint · ${item.category}`}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 shrink-0 ml-2" />
                </li>
              );
            })
          )}
        </ul>

        {/* Footer shortcuts */}
        <div className="sb-palette-foot">
          <div className="flex items-center gap-4">
            <span><kbd className="sb-kbd">↑</kbd> <kbd className="sb-kbd">↓</kbd> navigate</span>
            <span><kbd className="sb-kbd">↵</kbd> select</span>
            <span><kbd className="sb-kbd">Esc</kbd> close</span>
          </div>
          <span className="text-[11px] font-medium text-blue-600 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Tasskly Consultancy
          </span>
        </div>
      </div>
    </div>
  );
};
