import React, { useRef } from "react";
import { ArrowUpRight, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Layers, Sliders, FileText, Compass, Award, Building, Check } from "lucide-react";
import { MENTORS_DATA, Mentor } from "./data/mentorsData";

interface BlueprintModule {
  id: string;
  number: string;
  chapterBadge: string;
  badgeColor: string;
  title: string;
  lede: string;
  deliverables: string[];
  mentorId: string;
  mentorName: string;
  mentorRole: string;
  mentorInst: string;
  visualType: "seat-matrix" | "campus-roi" | "branch-tree" | "sop-audit" | "visa-meter" | "cs-venn" | "spot-radar" | "hostel-blueprint";
}

const BLUEPRINT_MODULES: BlueprintModule[] = [
  {
    id: "bp-seat-matrix",
    number: "01",
    chapterBadge: "05 SEAT ALLOTMENT",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    title: "JoSAA & CET Choice-Filling Allotment Matrix",
    lede: "Algorithmic rank-versus-seat ladder optimization. Eliminate branch sliding regret and lock your optimal college seat.",
    deliverables: ["Rank-vs-Seat Probability Calculation", "Curated Priority Choice Sheet", "Branch Freeze vs Float Strategy"],
    mentorId: "arjun-sharma",
    mentorName: "Arjun Sharma",
    mentorRole: "Senior Counseling Fellow",
    mentorInst: "IIT Delhi Alum",
    visualType: "seat-matrix",
  },
  {
    id: "bp-campus-roi",
    number: "02",
    chapterBadge: "04 COLLEGE COMPARISON",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    title: "Tier-1 vs Tier-2 Campus ROI Diagnostic",
    lede: "Real placement statistics, faculty accessibility, tech club culture, and 5-year career trajectories before paying admission deposits.",
    deliverables: ["Median Salary & Placement Audit", "Peer Group & Coding Culture Index", "Fee-to-Return Breakeven Model"],
    mentorId: "ananya-sengupta",
    mentorName: "Ananya Sengupta",
    mentorRole: "Senior Dual-Degree Scholar",
    mentorInst: "BITS Pilani",
    visualType: "campus-roi",
  },
  {
    id: "bp-branch-tree",
    number: "03",
    chapterBadge: "02 COURSE SELECTION",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    title: "Branch Sliding & Core-to-Tech Transition Lab",
    lede: "Evaluate whether shifting branches is statistically feasible at your target university and map your course credits.",
    deliverables: ["CGPA Cutoff Probability Engine", "Core-to-Software Bridge Roadmap", "Dual-Degree Credit Audit"],
    mentorId: "david-kim",
    mentorName: "David Kim",
    mentorRole: "Principal AI Engineer",
    mentorInst: "Microsoft AI (Tech Alum)",
    visualType: "branch-tree",
  },
  {
    id: "bp-sop-audit",
    number: "04",
    chapterBadge: "03 STUDY ABROAD",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    title: "US & EU Top-20 SOP Critique Blueprint",
    lede: "Line-by-line statement of purpose audit. Frame research interests, narrative arc, and professor alignments for Stanford, CMU, and ETH.",
    deliverables: ["Sentence-by-Sentence Critique", "Professor Alignment Mapping", "Funding & TA/RA Positioning"],
    mentorId: "sarah-jenkins",
    mentorName: "Sarah Jenkins",
    mentorRole: "Graduate Admissions Fellow",
    mentorInst: "Stanford MS CS",
    visualType: "sop-audit",
  },
  {
    id: "bp-visa-meter",
    number: "05",
    chapterBadge: "03 VISA PREP",
    badgeColor: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    title: "F-1 & Schengen Student Visa Mock Chamber",
    lede: "Live mock interview with rigorous consular officer questioning rubrics to address 214(b) non-immigrant intent with confidence.",
    deliverables: ["214(b) Immigrant Intent Risk Gauge", "Financial Affidavit Stress Test", "15-Question Live Mock Drill"],
    mentorId: "rohan-nair",
    mentorName: "Rohan Nair",
    mentorRole: "Visa & Research Fellow",
    mentorInst: "Carnegie Mellon (Ex-NIT)",
    visualType: "visa-meter",
  },
  {
    id: "bp-cs-venn",
    number: "06",
    chapterBadge: "02 MAJOR ADVICE",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    title: "CS vs AI/ML vs Data Science Degree Audit",
    lede: "Deconstruct course curriculum overlap, market recruiter filters, and discover whether specialized degrees limit or help you.",
    deliverables: ["Curriculum Overlap Venn Matrix", "Recruiter Filter Screening Test", "5-Year Tech Role Salary Spread"],
    mentorId: "marcus-vance",
    mentorName: "Marcus Vance",
    mentorRole: "Senior Systems Engineer",
    mentorInst: "Uber Tech",
    visualType: "cs-venn",
  },
  {
    id: "bp-spot-radar",
    number: "07",
    chapterBadge: "05 SPOT ROUNDS",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    title: "Spot Rounds & Vacancy Heatmap Strategy",
    lede: "Tactical roadmap for institutional spot counseling rounds, unreserved seats, and cutoff sliding after main rounds close.",
    deliverables: ["Round-by-Round Vacancy Heatmap", "Merit Quota Conversion Strategy", "Instant Slot Alert Plan"],
    mentorId: "priya-patel",
    mentorName: "Priya Patel",
    mentorRole: "Management Consultant",
    mentorInst: "IIM Ahmedabad Alum",
    visualType: "spot-radar",
  },
  {
    id: "bp-hostel-blueprint",
    number: "08",
    chapterBadge: "04 CAMPUS REALITIES",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    title: "Hostel Living, Mess & Peer Community Vetting",
    lede: "Unfiltered truths about hostel room allocation, mess food quality, campus curfews, internet reliability, and tech societies.",
    deliverables: ["Senior Uncensored Hostel Dossier", "Living Expense Monthly Model", "Active Tech Clubs Directory"],
    mentorId: "ananya-sengupta",
    mentorName: "Ananya Sengupta",
    mentorRole: "Senior Dual-Degree Scholar",
    mentorInst: "BITS Pilani",
    visualType: "hostel-blueprint",
  },
];

interface SandboxMentorsTrackProps {
  onSelectMentor: (mentor: Mentor, topic?: string) => void;
}

export const SandboxMentorsTrack: React.FC<SandboxMentorsTrackProps> = ({ onSelectMentor }) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -480, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 480, behavior: "smooth" });
    }
  };

  const handleBookBlueprint = (bp: BlueprintModule) => {
    const matchedMentor = MENTORS_DATA.find((m) => m.id === bp.mentorId) || MENTORS_DATA[0];
    onSelectMentor(matchedMentor, bp.title);
  };

  // Render high-tech vector graphics for each blueprint card
  const renderVisual = (type: BlueprintModule["visualType"]) => {
    switch (type) {
      case "seat-matrix":
        return (
          <svg viewBox="0 0 340 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="340" height="200" fill="#07090F" />
            {/* Grid background */}
            <g opacity="0.15" stroke="#F2A04A" strokeWidth="0.5">
              {[40, 80, 120, 160, 200, 240, 280, 320].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="200" />
              ))}
              {[30, 60, 90, 120, 150, 180].map((y) => (
                <line key={y} x1="0" y1={y} x2="340" y2={y} />
              ))}
            </g>
            {/* Seat Matrix Cells */}
            <g>
              {[
                { x: 30, y: 35, w: 65, h: 36, label: "IIT CSE", rank: "Top 0.1%", state: "LOCKED", color: "#FF8F2E" },
                { x: 105, y: 35, w: 65, h: 36, label: "BITS CS", rank: "Top 0.8%", state: "SLIDING", color: "#2E45FF" },
                { x: 180, y: 35, w: 65, h: 36, label: "NIT CSE", rank: "Top 1.5%", state: "FLOAT", color: "#10B981" },
                { x: 255, y: 35, w: 65, h: 36, label: "IIIT ECE", rank: "Top 2.5%", state: "MATCH", color: "#8B5CF6" },
                { x: 30, y: 85, w: 65, h: 36, label: "ROUND 1", rank: "Choice #1", state: "ALLOC", color: "#FF8F2E" },
                { x: 105, y: 85, w: 65, h: 36, label: "ROUND 2", rank: "Choice #2", state: "UPGRADE", color: "#2E45FF" },
                { x: 180, y: 85, w: 65, h: 36, label: "ROUND 3", rank: "Choice #3", state: "RETAIN", color: "#10B981" },
                { x: 255, y: 85, w: 65, h: 36, label: "SPOT", rank: "Merit Lock", state: "FINAL", color: "#8B5CF6" },
              ].map((c, i) => (
                <g key={i}>
                  <rect x={c.x} y={c.y} width={c.w} height={c.h} rx="6" fill="#0F131E" stroke={c.color} strokeWidth="1" strokeOpacity="0.4" />
                  <text x={c.x + 8} y={c.y + 16} fill="#F3F5FB" fontSize="10" fontWeight="bold" fontFamily="monospace">{c.label}</text>
                  <text x={c.x + 8} y={c.y + 28} fill={c.color} fontSize="8" fontFamily="monospace">{c.state}</text>
                </g>
              ))}
            </g>
            {/* Cutoff Curve */}
            <path d="M 30 160 Q 120 130 180 150 T 310 140" fill="none" stroke="#FF8F2E" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="180" cy="150" r="4" fill="#FF8F2E" />
            <text x="195" y="153" fill="#FF8F2E" fontSize="9" fontFamily="monospace">OPTIMAL SEAT CUTOFF</text>
          </svg>
        );

      case "campus-roi":
        return (
          <svg viewBox="0 0 340 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="340" height="200" fill="#07090F" />
            <g opacity="0.15" stroke="#2E45FF" strokeWidth="0.5">
              {[40, 80, 120, 160, 200, 240, 280, 320].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="200" />
              ))}
            </g>
            {/* Pillars & Comparative ROI Bars */}
            <rect x="50" y="50" width="40" height="110" rx="4" fill="#2E45FF" fillOpacity="0.15" stroke="#2E45FF" strokeWidth="1.5" />
            <text x="56" y="42" fill="#2E45FF" fontSize="9" fontWeight="bold" fontFamily="monospace">TIER-1</text>
            <text x="55" y="105" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">24 LPA</text>

            <rect x="110" y="85" width="40" height="75" rx="4" fill="#8B5CF6" fillOpacity="0.15" stroke="#8B5CF6" strokeWidth="1.5" />
            <text x="116" y="78" fill="#8B5CF6" fontSize="9" fontWeight="bold" fontFamily="monospace">TIER-2</text>
            <text x="115" y="125" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">14 LPA</text>

            {/* Radar / Metrics Box */}
            <rect x="180" y="45" width="130" height="115" rx="8" fill="#0D101C" stroke="#2E45FF" strokeWidth="1" strokeOpacity="0.3" />
            <text x="192" y="68" fill="#FFFFFF" fontSize="10" fontWeight="bold">Campus Diagnostic</text>
            <text x="192" y="88" fill="#94A3B8" fontSize="9">Peer Coding Hub: <span className="text-emerald-400 font-bold">9.4/10</span></text>
            <text x="192" y="105" fill="#94A3B8" fontSize="9">Tech Placements: <span className="text-blue-400 font-bold">92%</span></text>
            <text x="192" y="122" fill="#94A3B8" fontSize="9">Hostel &amp; Mess: <span className="text-amber-400 font-bold">Unfiltered</span></text>
            <text x="192" y="139" fill="#94A3B8" fontSize="9">Breakeven: <span className="text-white font-bold">14 Months</span></text>
          </svg>
        );

      case "branch-tree":
        return (
          <svg viewBox="0 0 340 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="340" height="200" fill="#07090F" />
            {/* Tree Nodes */}
            <circle cx="60" cy="100" r="18" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
            <text x="60" y="104" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">CORE</text>

            <path d="M 78 95 L 140 60" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />
            <path d="M 78 100 L 140 100" stroke="#10B981" strokeWidth="1.5" />
            <path d="M 78 105 L 140 140" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" />

            <circle cx="160" cy="60" r="18" fill="#1E293B" stroke="#2E45FF" strokeWidth="2" />
            <text x="160" y="64" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">AI/ML</text>

            <circle cx="160" cy="100" r="18" fill="#1E293B" stroke="#10B981" strokeWidth="2" />
            <text x="160" y="104" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">CSE</text>

            <circle cx="160" cy="140" r="18" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
            <text x="160" y="144" textAnchor="middle" fill="#FFFFFF" fontSize="8" fontWeight="bold">DATA</text>

            {/* Transition Stats */}
            <rect x="200" y="45" width="115" height="110" rx="8" fill="#0D101C" stroke="#10B981" strokeWidth="1" strokeOpacity="0.3" />
            <text x="210" y="68" fill="#10B981" fontSize="9" fontWeight="bold" fontFamily="monospace">BRANCH UPGRADE</text>
            <text x="210" y="88" fill="#FFFFFF" fontSize="10">Req. CGPA: <strong>8.8+</strong></text>
            <text x="210" y="108" fill="#94A3B8" fontSize="9">Credit Match: <strong>92%</strong></text>
            <text x="210" y="128" fill="#94A3B8" fontSize="9">Sliding Window: <strong>Sem 2</strong></text>
          </svg>
        );

      case "sop-audit":
        return (
          <svg viewBox="0 0 340 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="340" height="200" fill="#07090F" />
            {/* Document sheet */}
            <rect x="40" y="30" width="160" height="140" rx="6" fill="#0E121E" stroke="#6366F1" strokeWidth="1" strokeOpacity="0.4" />
            {/* Text lines */}
            <line x1="55" y1="50" x2="150" y2="50" stroke="#F3F5FB" strokeWidth="3" strokeLinecap="round" />
            <line x1="55" y1="65" x2="180" y2="65" stroke="#F3F5FB" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
            <line x1="55" y1="78" x2="170" y2="78" stroke="#F2A04A" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="55" y1="91" x2="160" y2="91" stroke="#F3F5FB" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
            <line x1="55" y1="104" x2="175" y2="104" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="55" y1="117" x2="140" y2="117" stroke="#F3F5FB" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
            <line x1="55" y1="130" x2="165" y2="130" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="55" y1="145" x2="130" y2="145" stroke="#F3F5FB" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />

            {/* Critique Callout Card */}
            <rect x="215" y="40" width="105" height="120" rx="6" fill="#181828" stroke="#6366F1" strokeWidth="1" />
            <text x="225" y="60" fill="#A5B4FC" fontSize="9" fontWeight="bold">IVY REVIEW</text>
            <text x="225" y="78" fill="#FFFFFF" fontSize="9">Stanford Rubric</text>
            <text x="225" y="98" fill="#34D399" fontSize="8">✓ Research Hook</text>
            <text x="225" y="114" fill="#F87171" fontSize="8">✗ Cut Fluff Words</text>
            <text x="225" y="130" fill="#38BDF8" fontSize="8">✓ Professor Link</text>
          </svg>
        );

      case "visa-meter":
        return (
          <svg viewBox="0 0 340 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="340" height="200" fill="#07090F" />
            {/* Gauge Arc */}
            <path d="M 80 140 A 70 70 0 0 1 220 140" fill="none" stroke="#1E293B" strokeWidth="16" strokeLinecap="round" />
            <path d="M 80 140 A 70 70 0 0 1 200 85" fill="none" stroke="#0284C7" strokeWidth="16" strokeLinecap="round" />
            {/* Needle */}
            <line x1="150" y1="140" x2="190" y2="95" stroke="#F3F5FB" strokeWidth="3" strokeLinecap="round" />
            <circle cx="150" cy="140" r="8" fill="#0284C7" />
            <text x="150" y="170" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">94% PASSED</text>
            <text x="150" y="184" textAnchor="middle" fill="#38BDF8" fontSize="8" fontFamily="monospace">F-1 VISA READINESS</text>

            <rect x="235" y="45" width="85" height="110" rx="6" fill="#0E1626" stroke="#0284C7" strokeWidth="1" strokeOpacity="0.4" />
            <text x="245" y="68" fill="#38BDF8" fontSize="8" fontWeight="bold">RUBRICS</text>
            <text x="245" y="86" fill="#94A3B8" fontSize="8">214(b) Risk: <span className="text-emerald-400">Low</span></text>
            <text x="245" y="104" fill="#94A3B8" fontSize="8">Fund Proof: <span className="text-emerald-400">OK</span></text>
            <text x="245" y="122" fill="#94A3B8" fontSize="8">Mock Score: <span className="text-white">9.6</span></text>
          </svg>
        );

      case "cs-venn":
        return (
          <svg viewBox="0 0 340 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="340" height="200" fill="#07090F" />
            {/* Venn circles */}
            <circle cx="120" cy="100" r="55" fill="#8B5CF6" fillOpacity="0.18" stroke="#8B5CF6" strokeWidth="1.5" />
            <circle cx="180" cy="100" r="55" fill="#2E45FF" fillOpacity="0.18" stroke="#2E45FF" strokeWidth="1.5" />
            <text x="95" y="95" fill="#C4B5FD" fontSize="10" fontWeight="bold">CORE CS</text>
            <text x="85" y="110" fill="#94A3B8" fontSize="8">OS &amp; Arch</text>
            <text x="205" y="95" fill="#93C5FD" fontSize="10" fontWeight="bold">AI / ML</text>
            <text x="200" y="110" fill="#94A3B8" fontSize="8">Pytorch &amp; Math</text>
            <text x="150" y="102" textAnchor="middle" fill="#FFFFFF" fontSize="9" fontWeight="bold">70% OVERLAP</text>

            <rect x="250" y="45" width="75" height="110" rx="6" fill="#131124" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.4" />
            <text x="257" y="66" fill="#C4B5FD" fontSize="8" fontWeight="bold">HIRING 2026</text>
            <text x="257" y="86" fill="#94A3B8" fontSize="8">SWE Roles: <span className="text-white">88%</span></text>
            <text x="257" y="104" fill="#94A3B8" fontSize="8">AI Roles: <span className="text-white">62%</span></text>
            <text x="257" y="122" fill="#94A3B8" fontSize="8">Recruiter: <span className="text-emerald-400">CS Favored</span></text>
          </svg>
        );

      case "spot-radar":
        return (
          <svg viewBox="0 0 340 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="340" height="200" fill="#07090F" />
            {/* Concentric Radar Rings */}
            <circle cx="130" cy="100" r="70" fill="none" stroke="#EA580C" strokeWidth="0.8" strokeOpacity="0.2" />
            <circle cx="130" cy="100" r="48" fill="none" stroke="#EA580C" strokeWidth="1" strokeOpacity="0.3" />
            <circle cx="130" cy="100" r="26" fill="none" stroke="#EA580C" strokeWidth="1.2" strokeOpacity="0.5" />
            <line x1="130" y1="25" x2="130" y2="175" stroke="#EA580C" strokeWidth="0.5" strokeOpacity="0.2" />
            <line x1="55" y1="100" x2="205" y2="100" stroke="#EA580C" strokeWidth="0.5" strokeOpacity="0.2" />

            {/* Sweep radar cone */}
            <path d="M 130 100 L 175 40 A 70 70 0 0 0 130 30 Z" fill="#EA580C" fillOpacity="0.25" />
            <circle cx="155" cy="65" r="4" fill="#FF8F2E" className="animate-ping" />
            <circle cx="155" cy="65" r="3" fill="#FF8F2E" />

            <rect x="220" y="45" width="105" height="110" rx="6" fill="#1C120C" stroke="#EA580C" strokeWidth="1" strokeOpacity="0.4" />
            <text x="230" y="68" fill="#FDBA74" fontSize="8" fontWeight="bold">SPOT ROUNDS</text>
            <text x="230" y="86" fill="#94A3B8" fontSize="8">Vacant Seats: <span className="text-white">Detected</span></text>
            <text x="230" y="104" fill="#94A3B8" fontSize="8">Threshold: <span className="text-emerald-400">Sliding</span></text>
            <text x="230" y="122" fill="#94A3B8" fontSize="8">Conversion: <span className="text-amber-400">84%</span></text>
          </svg>
        );

      case "hostel-blueprint":
        return (
          <svg viewBox="0 0 340 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="340" height="200" fill="#07090F" />
            {/* Campus Architectural layout */}
            <rect x="40" y="40" width="140" height="120" rx="4" fill="none" stroke="#0D9488" strokeWidth="1.5" strokeDasharray="4 2" />
            <rect x="55" y="55" width="45" height="40" fill="#0D9488" fillOpacity="0.15" stroke="#0D9488" strokeWidth="1" />
            <text x="60" y="78" fill="#5EEAD4" fontSize="8" fontWeight="bold">HOSTEL A</text>

            <rect x="115" y="55" width="50" height="40" fill="#0D9488" fillOpacity="0.15" stroke="#0D9488" strokeWidth="1" />
            <text x="120" y="78" fill="#5EEAD4" fontSize="8" fontWeight="bold">MESS HALL</text>

            <rect x="55" y="105" width="110" height="40" fill="#0D9488" fillOpacity="0.2" stroke="#0D9488" strokeWidth="1" />
            <text x="75" y="128" fill="#FFFFFF" fontSize="9" fontWeight="bold">TECH CLUBS &amp; WIFI LAB</text>

            <rect x="200" y="45" width="115" height="110" rx="6" fill="#091817" stroke="#0D9488" strokeWidth="1" strokeOpacity="0.4" />
            <text x="210" y="68" fill="#5EEAD4" fontSize="8" fontWeight="bold">CAMPUS REALITY</text>
            <text x="210" y="86" fill="#94A3B8" fontSize="8">Mess Rating: <span className="text-amber-400">7.2/10</span></text>
            <text x="210" y="104" fill="#94A3B8" fontSize="8">WiFi Ping: <span className="text-emerald-400">12ms (1 Gbps)</span></text>
            <text x="210" y="122" fill="#94A3B8" fontSize="8">Curfew: <span className="text-white">None (24/7 Lib)</span></text>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <section className="sb-work" id="sb-mentors-catalog">
      {/* Section Header (High-contrast editorial matching sandbox-os) */}
      <div className="sb-work-head">
        <div>
          <h2 className="sb-display">Consultation Blueprints.</h2>
        </div>
        <div>
          <p className="sb-work-sub">
            Structured 1-on-1 decision frameworks across admissions, college selection, and seat allotment. Flat ₹500 fee. Confirmed only when member approves.
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
              {BLUEPRINT_MODULES.length} Advisory Blueprints · Flat ₹500
            </span>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel Track with Technical Blueprint Cards */}
      <div ref={scrollContainerRef} className="sb-work-track-wrapper">
        <ol className="sb-work-track">
          {BLUEPRINT_MODULES.map((bp, index) => {
            return (
              <li key={bp.id} className="sb-tile">
                {/* Media Preview: Technical Vector Graphic (No stock photos!) */}
                <div className="sb-tile-media">
                  {renderVisual(bp.visualType)}
                  <div className={`sb-tile-badge ${bp.badgeColor}`}>
                    <Layers className="h-3.5 w-3.5" />
                    <span>{bp.chapterBadge}</span>
                  </div>
                  <div className="sb-tile-price">
                    ₹500 <span className="text-[11px] font-normal text-slate-500">/ 45 mins</span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="sb-tile-body">
                  <div className="sb-tile-meta">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-slate-400">BLUEPRINT #{bp.number}</span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        1-on-1 Deep Dive
                      </span>
                    </div>
                    <h3 className="sb-tile-name mt-1">{bp.title}</h3>
                    <p className="sb-tile-role text-xs text-slate-600 line-clamp-2 mt-1">{bp.lede}</p>
                    <span className="sb-tile-uni mt-1.5 flex items-center gap-1.5">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      Led by {bp.mentorName} ({bp.mentorInst})
                    </span>
                  </div>

                  {/* Concrete Deliverables Checklist */}
                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Key Takeaways:</p>
                    {bp.deliverables.map((del, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                        <Check className="h-3 w-3 text-blue-600 shrink-0" />
                        <span className="truncate">{del}</span>
                      </div>
                    ))}
                  </div>

                  {/* Policy Micro-badge */}
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-600 font-mono flex items-center justify-between">
                    <span>Awaiting Member Approval</span>
                    <span className="text-emerald-600 font-bold">2–3h Refund Guarantee</span>
                  </div>

                  {/* Action CTA Button */}
                  <button
                    onClick={() => handleBookBlueprint(bp)}
                    className="w-full mt-1 h-11 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-semibold text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Book Blueprint (₹500)</span>
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
