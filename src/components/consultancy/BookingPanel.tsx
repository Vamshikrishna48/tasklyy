import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  CheckCircle2,
  Video,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  User,
  Mail,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Mentor } from "./data/mentorsData";

interface BookingPanelProps {
  mentor?: Mentor;
  initialTopic?: string;
  onSuccess?: () => void;
  className?: string;
  compact?: boolean;
}

export const BookingPanel: React.FC<BookingPanelProps> = ({
  mentor,
  initialTopic = "Admissions & College Guidance",
  onSuccess,
  className = "",
  compact = false,
}) => {
  // Generate next 7 days for the horizontal day strip
  const today = new Date();
  const dayStrip = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const dateNum = d.getDate();
    const monthName = d.toLocaleDateString("en-US", { month: "short" });
    return {
      label: dayName,
      sub: `${dateNum} ${monthName}`,
      isoString: d.toISOString().split("T")[0],
    };
  });

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("06:00 PM");
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userNote, setUserNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [confirmedData, setConfirmedData] = useState<any>(null);

  const timeSlots = ["04:30 PM", "06:00 PM", "07:30 PM", "08:30 PM"];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      toast.error("Please enter your name and student email address.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    const bookingId = `TSK-${Math.floor(10000 + Math.random() * 90000)}`;
    const meetUrl = `https://meet.google.com/tsk-${Math.random().toString(36).substring(2, 6)}-cns`;
    const selectedDate = dayStrip[selectedDayIdx];

    const confirmed = {
      bookingId,
      mentorName: mentor ? mentor.name : "Senior Verified Mentor",
      mentorRole: mentor ? mentor.role : "Career Advisor",
      mentorAvatar: mentor ? mentor.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      date: `${selectedDate.label}, ${selectedDate.sub}`,
      time: selectedTimeSlot,
      topic: selectedTopic,
      userName,
      userEmail,
      meetUrl,
      price: mentor ? mentor.priceLabel : "Free Intro Session",
    };

    setConfirmedData(confirmed);
    setIsBooked(true);
    setIsSubmitting(false);

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem("tasskly_student_sessions") || "[]");
    saved.unshift(confirmed);
    localStorage.setItem("tasskly_student_sessions", JSON.stringify(saved));

    toast.success("1-on-1 Session Confirmed! Calendar invitation sent.");
    if (onSuccess) onSuccess();
  };

  const handleGoogleCalendarAdd = () => {
    if (!confirmedData) return;
    const title = encodeURIComponent(`Tasskly Mentorship: ${confirmedData.topic} with ${confirmedData.mentorName}`);
    const details = encodeURIComponent(`Meeting Link: ${confirmedData.meetUrl}\nStudent: ${confirmedData.userName}\nTopic: ${confirmedData.topic}`);
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&add=${confirmedData.userEmail}`;
    window.open(gCalUrl, "_blank");
  };

  if (isBooked && confirmedData) {
    return (
      <div className={`p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-5 text-left ${className}`}>
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900">Session Confirmed!</h4>
            <p className="text-xs text-slate-500 font-mono">Ref ID: {confirmedData.bookingId}</p>
          </div>
        </div>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <img src={confirmedData.mentorAvatar} alt="" className="h-10 w-10 rounded-full object-cover border" />
            <div>
              <p className="font-bold text-slate-900">{confirmedData.mentorName}</p>
              <p className="text-slate-500 text-xs">{confirmedData.mentorRole}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">When</span>
              <span className="font-bold text-slate-800">{confirmedData.date}</span>
              <span className="block text-slate-600">{confirmedData.time}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">Topic</span>
              <span className="font-bold text-slate-800 truncate block">{confirmedData.topic}</span>
              <span className="text-emerald-600 font-bold">{confirmedData.price}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
            <span className="flex items-center gap-1.5 font-bold text-xs text-blue-800">
              <Video className="h-4 w-4" /> Google Meet Room
            </span>
            <a
              href={confirmedData.meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-700 underline font-mono truncate block"
            >
              {confirmedData.meetUrl}
            </a>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleGoogleCalendarAdd}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl gap-2 shadow-sm"
          >
            <Calendar className="h-4 w-4" />
            <span>Add to Google Calendar</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setIsBooked(false);
              setConfirmedData(null);
            }}
            className="w-full sm:w-auto text-xs h-10 rounded-xl"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Book another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleBooking}
      className={`p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-5 text-left ${className}`}
    >
      {/* Mentor Header (if selected) */}
      {mentor && (
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src={mentor.avatar}
              alt={mentor.name}
              className="h-11 w-11 rounded-full object-cover border-2 border-blue-600/30"
            />
            <div>
              <p className="font-bold text-slate-900 text-sm">{mentor.name}</p>
              <p className="text-xs text-slate-500">{mentor.role} • {mentor.companyOrCollege}</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
            {mentor.priceLabel}
          </span>
        </div>
      )}

      {/* 1. Topic Dropdown */}
      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-slate-700">What do you want to discuss?</Label>
        <select
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
          className="w-full h-10 rounded-xl px-3 text-xs sm:text-sm border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:border-blue-600"
        >
          <option value="Admissions & College Guidance">College Admissions & Cutoffs</option>
          <option value="Course Selection & Major">Course Selection & Major Advice</option>
          <option value="Study Abroad & SOP Review">Study Abroad & SOP Review</option>
          <option value="Internship Search & Resume Audit">Internship Search & Resume Audit</option>
          <option value="Campus Placement Prep">Campus Placement & Coding Rounds</option>
        </select>
      </div>

      {/* 2. Date Picker (Horizontal Day Strip) */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>Choose Day</span>
          <span className="text-[11px] text-slate-400 font-normal">Next 7 days available</span>
        </Label>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {dayStrip.map((day, idx) => {
            const isSelected = selectedDayIdx === idx;
            return (
              <button
                type="button"
                key={idx}
                onClick={() => setSelectedDayIdx(idx)}
                className={`flex-1 min-w-[72px] p-2 rounded-xl text-center border transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm font-bold scale-[1.02]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                }`}
              >
                <span className="block text-[11px] uppercase tracking-wider">{day.label}</span>
                <span className="block text-xs font-bold mt-0.5">{day.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Time Slot Chips */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-blue-600" />
          <span>Select Time Slot</span>
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {timeSlots.map((slot) => {
            const isSelected = selectedTimeSlot === slot;
            return (
              <button
                type="button"
                key={slot}
                onClick={() => setSelectedTimeSlot(slot)}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                {slot}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Student Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1">
          <Label className="text-xs text-slate-700">Your Full Name *</Label>
          <Input
            type="text"
            placeholder="e.g. Rahul Verma"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="h-10 text-xs rounded-xl bg-slate-50 border-slate-300"
            required
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-700">Student Email *</Label>
          <Input
            type="email"
            placeholder="rahul@college.edu"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="h-10 text-xs rounded-xl bg-slate-50 border-slate-300"
            required
          />
        </div>
      </div>

      {/* Optional Note */}
      <div className="space-y-1">
        <Label className="text-xs text-slate-700">Optional note for mentor</Label>
        <Textarea
          rows={2}
          placeholder="e.g. Applying for summer internship, want feedback on my resume bullet points..."
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          className="text-xs rounded-xl bg-slate-50 border-slate-300"
        />
      </div>

      {/* 5. Price Summary & Confirm Button */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
          <span>Session Investment:</span>
          <span className="text-sm font-extrabold text-blue-600">
            {mentor ? mentor.priceLabel : "Free Intro Session"}
          </span>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm h-12 rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-95 gap-2"
        >
          {isSubmitting ? (
            <span>Securing your slot...</span>
          ) : (
            <>
              <span>Confirm & Book Session</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-[11px] text-center text-slate-400">
          Instant confirmation • 100% money-back guarantee if unsatisfied
        </p>
      </div>
    </form>
  );
};
