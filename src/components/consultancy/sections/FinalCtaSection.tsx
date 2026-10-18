import React from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FinalCtaSectionProps {
  onFindMentor: () => void;
}

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onFindMentor }) => {
  return (
    <section className="w-full py-16 md:py-24 px-4 md:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl p-10 sm:p-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-xl shadow-blue-600/10">
          
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-mono font-bold tracking-wider uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Get Started Today</span>
            </span>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Your next step is one conversation away.
            </h2>

            <p className="text-sm sm:text-base text-blue-100 font-normal">
              Stop stressing over college choices, resume rejections, or study abroad applications. Talk to someone who already cleared the path.
            </p>

            <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 text-xs text-blue-200">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <span>Free intro available. No spam. 100% money-back guarantee.</span>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Button
              onClick={onFindMentor}
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-blue-600 font-black text-sm sm:text-base px-8 h-13 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 gap-2"
            >
              <span>Find my mentor</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};
