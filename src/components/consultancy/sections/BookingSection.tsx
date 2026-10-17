import React from "react";
import { motion } from "framer-motion";
import { ConsultationForm } from "../ConsultationForm";
import { Sparkles, Calendar, ShieldCheck, Zap, Video, CheckCircle2 } from "lucide-react";

interface BookingSectionProps {
  selectedServiceOrTier: string;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ selectedServiceOrTier }) => {
  return (
    <section
      id="booking-section"
      className="min-h-screen w-full flex flex-col justify-center px-4 md:px-8 py-24 relative z-10"
    >
      <div className="w-full max-w-5xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Final Step • Direct Access</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            Ready to Accelerate Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Team's Velocity?
            </span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Reserve your complimentary 45-minute workflow consultation with a senior Tasskly systems consultant.
          </p>
        </div>

        {/* Consultation Booking Form Container */}
        <ConsultationForm initialServiceOrTier={selectedServiceOrTier} />
      </div>
    </section>
  );
};
