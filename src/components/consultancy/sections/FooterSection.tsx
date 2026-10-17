import React from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, ShieldCheck, Heart, GraduationCap } from "lucide-react";

interface FooterSectionProps {
  isDark?: boolean;
}

export const FooterSection: React.FC<FooterSectionProps> = ({ isDark = true }) => {
  return (
    <footer className={`relative z-10 border-t ${
      isDark ? "border-slate-800 bg-[#020617]/95 text-slate-300" : "border-slate-200 bg-white/95 text-slate-700"
    }`}>
      {/* Subtle Campus Skyline Illustration on Top Edge */}
      <div className="w-full overflow-hidden leading-none opacity-20 -mt-8 pointer-events-none">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className={`w-full h-12 fill-current ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
        >
          {/* Stylized Campus Skyline: Towers, Columns, Library Domes */}
          <path d="M0,120 L0,90 L40,90 L40,70 L50,50 L60,70 L60,90 L120,90 L120,60 L140,60 L140,40 L150,20 L160,40 L160,60 L180,60 L180,90 L240,90 L240,75 L280,75 L280,90 L340,90 L340,50 L370,50 L370,30 L385,15 L400,30 L400,50 L430,50 L430,90 L520,90 L520,65 L540,65 L540,45 L560,45 L560,65 L580,65 L580,90 L680,90 L680,55 L700,55 L710,35 L720,55 L740,55 L740,90 L820,90 L820,70 L860,70 L860,90 L920,90 L920,40 L935,25 L950,40 L950,90 L1040,90 L1040,60 L1070,60 L1070,90 L1140,90 L1140,75 L1200,75 L1200,120 Z" />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 pb-14">
        {/* 4 Columns Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-12 text-left">
          
          {/* Column 1: Brand & Tagline */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`text-xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                TASSKLY
              </span>
              <span className="text-emerald-400 font-bold">/</span>
              <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                CAMPUS
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              The student-first task and productivity platform built specifically for learners, clubs, and universities.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">Campus Edition</span>
            </div>
          </div>

          {/* Column 2: For Students */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              For Students
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/consultancy" className="hover:text-emerald-400 transition-colors">
                  Study Planning & Audits
                </Link>
              </li>
              <li>
                <Link to="/consultancy" className="hover:text-emerald-400 transition-colors">
                  Exam Revision Sprints
                </Link>
              </li>
              <li>
                <Link to="/internships" className="hover:text-emerald-400 transition-colors">
                  Placement & Internships
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-emerald-400 transition-colors">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: For Colleges */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-teal-400">
              For Colleges
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">
                Campus-Wide Rollout
              </li>
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">
                Club & Fest Management
              </li>
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">
                Department Workflows
              </li>
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">
                NAAC & ABET Vaults
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-sky-400">
              Contact
            </h4>
            <div className="space-y-2.5 text-xs">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=support@tasskly.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                <span>support@tasskly.com</span>
              </a>

              <a
                href="https://wa.me/919640008684"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-teal-400" />
                <span>WhatsApp: +91 9640008684</span>
              </a>

              <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Official Tasskly Studio</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Row */}
        <div className={`pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-3 text-xs uppercase tracking-widest font-mono ${
          isDark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500"
        }`}>
          <p>© 2026 Tasskly Studio — All rights reserved</p>
          <p className="flex items-center gap-1.5 normal-case tracking-normal">
            <span>Created with passion for students & universities</span>
            <Heart className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
