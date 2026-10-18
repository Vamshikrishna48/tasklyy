import React from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export const FooterSection: React.FC = () => {
  return (
    <footer className="w-full bg-[#f8fafc] border-t border-slate-200 py-14 px-4 md:px-8 text-slate-600">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* 3 Link Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Tasskly
              </span>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider font-mono bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Mentorship
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 font-normal">
              1-on-1 mentorship for college admissions, course selection, study abroad, internships, and placements.
            </p>
          </div>

          {/* Col 1: For Students */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-900">For Students</h4>
            <ul className="space-y-2">
              <li>
                <a href="#goals-section" className="hover:text-blue-600 transition-colors">
                  Choose Your Goal
                </a>
              </li>
              <li>
                <a href="#marketplace-section" className="hover:text-blue-600 transition-colors">
                  Find Verified Mentors
                </a>
              </li>
              <li>
                <a href="#how-it-works-section" className="hover:text-blue-600 transition-colors">
                  How Booking Works
                </a>
              </li>
              <li>
                <a href="#stories-section" className="hover:text-blue-600 transition-colors">
                  Student Success Stories
                </a>
              </li>
            </ul>
          </div>

          {/* Col 2: For Mentors & Partners */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-900">For Mentors</h4>
            <ul className="space-y-2">
              <li>
                <a href="#become-mentor-section" className="hover:text-blue-600 transition-colors">
                  Apply to Be a Mentor
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-blue-600 transition-colors">
                  Mentor Code of Conduct
                </a>
              </li>
              <li>
                <a href="#faq-section" className="hover:text-blue-600 transition-colors">
                  Verification Standards
                </a>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-blue-600 transition-colors">
                  Tasskly Platform
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Contact */}
          <div className="space-y-2.5 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-slate-900">Support</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=support@tasskly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                >
                  support@tasskly.com
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919640008684"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 transition-colors"
                >
                  WhatsApp: +91 9640008684
                </a>
              </li>
              <li>
                <span className="text-slate-400">Response time: &lt; 2 hours</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-colors"
                aria-label="Twitter"
              >
                𝕏
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-colors"
                aria-label="LinkedIn"
              >
                in
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-400 transition-colors"
                aria-label="Instagram"
              >
                ig
              </a>
            </div>
          </div>

        </div>

        {/* Small Copyright Bottom Row */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 Tasskly Mentorship. All rights reserved.</p>
          <p className="flex items-center gap-1">
            <span>Built with care for students everywhere</span>
            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>

      </div>
    </footer>
  );
};
