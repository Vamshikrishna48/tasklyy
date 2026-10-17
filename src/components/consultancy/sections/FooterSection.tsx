import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, Phone, ShieldCheck, Heart } from "lucide-react";

export const FooterSection: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-slate-800/80 bg-[#020617]/95 backdrop-blur-2xl py-16 text-slate-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-14 text-left">
          
          {/* Brand Col (2 cols on lg) */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white tracking-tight">TASSKLY</span>
              <span className="text-emerald-400 font-bold">/</span>
              <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                CONSULTANCY
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm leading-relaxed">
              The high-velocity task and productivity platform engineered for ambitious students, engineering teams, and fast-scaling startups.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-teal-500/20 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400 transition-colors"
                aria-label="Twitter"
              >
                𝕏
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-teal-500/20 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400 transition-colors"
                aria-label="LinkedIn"
              >
                in
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-teal-500/20 flex items-center justify-center text-slate-300 hover:text-white hover:border-emerald-400 transition-colors"
                aria-label="GitHub"
              >
                git
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-400">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="text-slate-300 hover:text-emerald-300 transition-colors">
                  Home Platform
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-slate-300 hover:text-emerald-300 transition-colors">
                  Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/internships" className="text-slate-300 hover:text-emerald-300 transition-colors">
                  Internships & Gigs
                </Link>
              </li>
              <li>
                <Link to="/consultancy" className="text-slate-300 hover:text-emerald-300 transition-colors">
                  3D Consultancy
                </Link>
              </li>
            </ul>
          </div>

          {/* Consultancy Services */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-teal-400">
              Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer">
                Workflow Audits
              </li>
              <li className="text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer">
                Process Automation
              </li>
              <li className="text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer">
                Team Productivity
              </li>
              <li className="text-slate-300 hover:text-emerald-300 transition-colors cursor-pointer">
                Tool Consolidation
              </li>
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-sky-400">
              Direct Contact
            </h4>
            <div className="space-y-2.5 text-xs">
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=support@tasskly.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-emerald-300 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                <span>support@tasskly.com</span>
              </a>

              <a
                href="https://wa.me/919640008684"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-emerald-300 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-teal-400" />
                <span>WhatsApp: +91 9640008684</span>
              </a>

              <div className="pt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Studio Support</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 uppercase tracking-widest font-mono">
          <p>© 2026 Tasskly Studio — All rights reserved</p>
          <p className="flex items-center gap-1.5 normal-case tracking-normal">
            <span>Built with precision for students and engineering teams</span>
            <Heart className="h-3.5 w-3.5 text-emerald-400 fill-emerald-400 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
