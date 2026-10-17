import React from "react";
import { ConsultationForm } from "../ConsultationForm";
import {
  Sparkles,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  GraduationCap,
  School,
  CheckCircle2,
} from "lucide-react";

interface BookingSectionProps {
  selectedServiceOrTier: string;
  isDark?: boolean;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  selectedServiceOrTier,
  isDark = true,
}) => {
  return (
    <section
      id="booking-section"
      className="min-h-screen w-full flex flex-col justify-center px-4 md:px-8 lg:px-12 py-24 relative z-10"
    >
      <div className="w-full max-w-6xl mx-auto space-y-8">
        
        {/* Two Columns Grid: Left Details & Headline, Right Glass Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (5 Cols): Big Headline, Subtext, Contact Details */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Stop 09: Graduation Stage</span>
            </div>

            <h2 className={`text-3xl sm:text-5xl font-black tracking-tight leading-tight ${
              isDark ? "text-white" : "text-slate-900"
            }`}>
              Ready to Make Your Campus{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
                More Productive?
              </span>
            </h2>

            <p className={`text-sm sm:text-base leading-relaxed ${
              isDark ? "text-slate-300" : "text-slate-700"
            }`}>
              Whether you are an individual student aiming for an A+, a club president planning a major fest, or a college Dean modernizing your syllabus workflows—we are here to guide you.
            </p>

            {/* Direct Contact Details */}
            <div className={`p-6 rounded-2xl border backdrop-blur-xl space-y-3.5 ${
              isDark ? "bg-[#040e24]/80 border-teal-500/25" : "bg-white/80 border-slate-200"
            }`}>
              <h4 className={`text-xs font-mono font-bold uppercase tracking-wider text-emerald-400`}>
                Campus Advisory Desk
              </h4>

              <div className="space-y-2.5 text-xs">
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=support@tasskly.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 hover:text-emerald-400 transition-colors ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>support@tasskly.com</span>
                </a>

                <a
                  href="https://wa.me/919640008684"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 hover:text-emerald-400 transition-colors ${
                    isDark ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  <Phone className="h-4 w-4 text-teal-400 shrink-0" />
                  <span>WhatsApp Campus Help: +91 9640008684</span>
                </a>

                <div className={`flex items-center gap-2.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <Clock className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Session Hours: Mon – Sat (09:00 AM – 09:00 PM IST)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/40 flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Academic Advisory Network</span>
              </div>
            </div>
          </div>

          {/* Right Column (7 Cols): Glass Form with 3D Cap Background */}
          <div className="lg:col-span-7 relative">
            <ConsultationForm
              initialPlanOrService={selectedServiceOrTier}
              isDark={isDark}
            />
          </div>

        </div>

      </div>
    </section>
  );
};
