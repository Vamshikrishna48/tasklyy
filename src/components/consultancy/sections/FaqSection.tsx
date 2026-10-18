import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_DATA } from "../data/mentorsData";

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section id="faq-section" className="w-full py-16 md:py-24 px-4 md:px-8 bg-white">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="text-left space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Common questions from students
          </h2>
          <p className="text-base text-slate-600 font-normal">
            Everything you need to know about our mentors, sessions, and guarantee.
          </p>
        </div>

        {/* 5 Accordions */}
        <div className="space-y-3">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-[#f8fafc] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-blue-600 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-left text-xs sm:text-sm text-slate-600 leading-relaxed font-normal border-t border-slate-200/60 bg-white">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
