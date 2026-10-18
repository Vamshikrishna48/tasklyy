import React from "react";
import { BookingPanel } from "../BookingPanel";
import { Mentor } from "../data/mentorsData";

interface BookingSectionProps {
  selectedMentor?: Mentor;
  onSuccess?: () => void;
}

export const BookingSection: React.FC<BookingSectionProps> = ({
  selectedMentor,
  onSuccess,
}) => {
  return (
    <section id="booking-section" className="w-full py-16 md:py-24 px-4 md:px-8 bg-[#f0f7ff]/50">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Direct 1-on-1 Scheduling
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Book Your Mentorship Session
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Choose your discussion topic, select an open evening slot, and confirm your video session instantly.
          </p>
        </div>

        {/* Embedded Booking Panel */}
        <div className="max-w-2xl mx-auto">
          <BookingPanel
            mentor={selectedMentor}
            onSuccess={onSuccess}
          />
        </div>

      </div>
    </section>
  );
};
