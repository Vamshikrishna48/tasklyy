import React, { useState } from "react";
import { Search, Calendar, Video, ArrowRight, RotateCw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HowBookingWorksSectionProps {
  onBookClick: () => void;
}

export const HowBookingWorksSection: React.FC<HowBookingWorksSectionProps> = ({
  onBookClick,
}) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      num: "01",
      title: "Pick your goal and mentor",
      description: "Browse verified mentors from your dream college, target major, or company. Filter by rate, language, and immediate availability.",
      icon: Search,
      tag: "Step 1: Selection",
      previewHeadline: "Match with someone who succeeded",
      previewSub: "500+ verified seniors & alumni ready to help",
    },
    {
      num: "02",
      title: "Choose a time slot",
      description: "Pick any date from our horizontal 7-day strip and choose a convenient evening or weekend slot. No back-and-forth messaging.",
      icon: Calendar,
      tag: "Step 2: Instant Scheduling",
      previewHeadline: "Instant Google Meet confirmation",
      previewSub: "Calendar invites generated automatically",
    },
    {
      num: "03",
      title: "Join & get a follow-up plan in Tasskly",
      description: "Join your 1-on-1 video call. After the session, your mentor shares a structured action checklist integrated directly into your Tasskly workspace.",
      icon: Video,
      tag: "Step 3: Actionable Progress",
      previewHeadline: "Leave with an exact roadmap",
      previewSub: "Tasks & milestones added to your dashboard",
    },
  ];

  return (
    <section id="how-it-works-section" className="w-full py-16 md:py-24 px-4 md:px-8 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-left space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Booking Works
          </h2>
          <p className="text-base text-slate-600 max-w-2xl font-normal">
            No endless email threads. Book a verified mentor in less than 60 seconds and start moving forward.
          </p>
        </div>

        {/* 3 Steps + 3D Interactive Flipping Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column (7 cols): The 3 Numbered Steps */}
          <div className="lg:col-span-7 space-y-4">
            {steps.map((step, idx) => {
              const isSelected = activeStep === idx;
              const Icon = step.icon;

              return (
                <div
                  key={idx}
                  onClick={() => setActiveStep(idx)}
                  className={`p-6 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-600/10 scale-[1.01]"
                      : "bg-white/60 border-slate-200 hover:border-slate-300 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`text-2xl font-black font-mono shrink-0 ${
                      isSelected ? "text-blue-600" : "text-slate-300"
                    }`}>
                      {step.num}
                    </span>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span>{step.title}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (5 cols): 3D Booking Card Flipping Through the Steps */}
          <div className="lg:col-span-5" style={{ perspective: "1000px" }}>
            <div
              className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-left transition-all duration-500 will-change-transform"
              style={{
                transform: `rotateY(${activeStep * 8 - 8}deg) rotateX(${activeStep * -4 + 4}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                  {steps[activeStep].tag}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Step {activeStep + 1} of 3
                </span>
              </div>

              <div className="space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  {React.createElement(steps[activeStep].icon, { className: "h-7 w-7 text-blue-600" })}
                </div>

                <h4 className="text-xl font-bold text-slate-900">
                  {steps[activeStep].previewHeadline}
                </h4>

                <p className="text-xs text-slate-500">
                  {steps[activeStep].previewSub}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Session Type:</span>
                  <span className="font-bold text-slate-800">1-on-1 Video Consultation</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Platform:</span>
                  <span className="font-bold text-slate-800">Google Meet + Tasskly Workspace</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Output:</span>
                  <span className="font-bold text-emerald-600">Action Plan & Resource Pack</span>
                </div>
              </div>

              <Button
                onClick={onBookClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm h-11 rounded-xl shadow-xs gap-2"
              >
                <span>Book a session now</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
