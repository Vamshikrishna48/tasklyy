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
  AlertCircle,
  CreditCard,
  Lock,
  XCircle,
  ExternalLink,
  Phone,
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
  initialTopic = "College Comparison & Campus Realities",
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
  const [userPhone, setUserPhone] = useState("");
  const [userNote, setUserNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [confirmedData, setConfirmedData] = useState<any>(null);

  // Simulation status: 'pending' (default after payment) | 'approved' | 'rejected'
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending");

  const timeSlots = ["04:30 PM", "06:00 PM", "07:30 PM", "08:30 PM"];

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      toast.error("Please enter your name and student email address.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const bookingId = `TSK-${Math.floor(10000 + Math.random() * 90000)}`;
    const meetUrl = `https://meet.google.com/tsk-${Math.random().toString(36).substring(2, 6)}-cns`;
    const selectedDate = dayStrip[selectedDayIdx];

    const confirmed = {
      bookingId,
      mentorName: mentor ? mentor.name : "Senior Verified Mentor",
      mentorRole: mentor ? mentor.role : "Career Advisor",
      mentorCompanyOrCollege: mentor ? mentor.companyOrCollege : "IIT / Stanford Alum",
      mentorAvatar: mentor ? mentor.avatar : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
      date: `${selectedDate.label}, ${selectedDate.sub}`,
      time: selectedTimeSlot,
      topic: selectedTopic,
      userName,
      userEmail,
      userPhone: userPhone || "Not provided",
      meetUrl,
      amountPaid: 500,
      currency: "₹",
      paidAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setConfirmedData(confirmed);
    setApprovalStatus("pending");
    setIsBooked(true);
    setIsSubmitting(false);

    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem("tasskly_student_sessions") || "[]");
    saved.unshift(confirmed);
    localStorage.setItem("tasskly_student_sessions", JSON.stringify(saved));

    toast.success("₹500 Payment Received! Confirmation mail dispatched. Pending member approval.");
    if (onSuccess) onSuccess();
  };

  const handleSimulateApproval = () => {
    setApprovalStatus("approved");
    toast.success("Member Approved! Session is now officially confirmed.");
  };

  const handleSimulateRejection = () => {
    setApprovalStatus("rejected");
    toast.info("Member declined request. ₹500 refund initiated (credited in 2-3 hrs).");
  };

  const handleGoogleCalendarAdd = () => {
    if (!confirmedData) return;
    const title = encodeURIComponent(`Tasskly Mentorship: ${confirmedData.topic} with ${confirmedData.mentorName}`);
    const details = encodeURIComponent(
      `Meeting Link: ${confirmedData.meetUrl}\nStudent: ${confirmedData.userName}\nTopic: ${confirmedData.topic}\nStatus: Approved by Member`
    );
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&add=${confirmedData.userEmail}`;
    window.open(gCalUrl, "_blank");
  };

  // ─────────────────────────────────────────────────────────────
  // POST-PAYMENT STATE: CONFIRMATION & APPROVAL TRACKER
  // ─────────────────────────────────────────────────────────────
  if (isBooked && confirmedData) {
    return (
      <div className={`p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-5 text-left ${className}`}>
        {/* Status Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {approvalStatus === "pending" && (
              <div className="h-11 w-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 animate-pulse">
                <Clock className="h-6 w-6" />
              </div>
            )}
            {approvalStatus === "approved" && (
              <div className="h-11 w-11 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            )}
            {approvalStatus === "rejected" && (
              <div className="h-11 w-11 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <XCircle className="h-6 w-6" />
              </div>
            )}

            <div>
              <h4 className="text-lg font-bold text-slate-900">
                {approvalStatus === "pending" && "₹500 Payment Received · Awaiting Approval"}
                {approvalStatus === "approved" && "Session Confirmed & Approved!"}
                {approvalStatus === "rejected" && "Session Declined · Refund Initiated"}
              </h4>
              <p className="text-xs text-slate-500 font-mono">
                Booking Ref: <span className="text-slate-800 font-bold">{confirmedData.bookingId}</span> · Paid: ₹500 at {confirmedData.paidAt}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              approvalStatus === "pending"
                ? "bg-amber-50 text-amber-700 border-amber-300"
                : approvalStatus === "approved"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                : "bg-rose-50 text-rose-700 border-rose-300"
            }`}
          >
            {approvalStatus === "pending" && "Pending Approval"}
            {approvalStatus === "approved" && "Approved"}
            {approvalStatus === "rejected" && "Refund in 2-3h"}
          </span>
        </div>

        {/* 1. Email Dispatched Banner (Exact user requirement) */}
        <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs text-blue-900">
            <Mail className="h-4 w-4 text-blue-600" />
            <span>Confirmation Mail Dispatched to {confirmedData.userEmail}</span>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">
            Your ₹500 payment has been verified. <strong>Your session is confirmed when and only when the member approves.</strong> You will receive a second notification as soon as {confirmedData.mentorName} reviews your slot.
          </p>
        </div>

        {/* 2. Refund Guarantee Banner (Exact user requirement) */}
        <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${
          approvalStatus === "rejected"
            ? "bg-rose-50 border-rose-300 text-rose-950"
            : "bg-slate-50 border-slate-200 text-slate-700"
        }`}>
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <RefreshCw className={`h-3.5 w-3.5 ${approvalStatus === "rejected" ? "text-rose-600 animate-spin" : "text-amber-600"}`} />
            <span>2–3 Hours Refund Policy</span>
          </div>
          <p>
            {approvalStatus === "rejected" ? (
              <span className="text-rose-700 font-semibold">
                The member was unavailable for this slot. Your ₹500 refund has been initiated and will reflect in your account within <strong>2–3 hours</strong>. No deductions applied.
              </span>
            ) : (
              <span>
                If the member rejects your request or cannot take your slot, your ₹500 will be <strong>automatically refunded within 2–3 hours</strong> to your original payment method.
              </span>
            )}
          </p>
        </div>

        {/* Session Details Card */}
        <div className="space-y-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={confirmedData.mentorAvatar} alt="" className="h-10 w-10 rounded-full object-cover border" />
              <div>
                <p className="font-bold text-slate-900">{confirmedData.mentorName}</p>
                <p className="text-slate-500 text-xs">{confirmedData.mentorRole} • {confirmedData.mentorCompanyOrCollege}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-900">₹500</span>
              <span className="block text-[10px] text-emerald-600 font-medium">Escrow Protected</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">Scheduled Time</span>
              <span className="font-bold text-slate-800">{confirmedData.date}</span>
              <span className="block text-slate-600">{confirmedData.time}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">Discussion Topic</span>
              <span className="font-bold text-slate-800 truncate block">{confirmedData.topic}</span>
              <span className="text-slate-500 font-mono text-[11px]">45-min Video Call</span>
            </div>
          </div>

          {/* Meeting Room Link */}
          {approvalStatus === "approved" ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
              <span className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                <Video className="h-4 w-4" /> Google Meet Room Active
              </span>
              <a
                href={confirmedData.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-700 underline font-mono truncate block hover:text-emerald-900"
              >
                {confirmedData.meetUrl}
              </a>
            </div>
          ) : approvalStatus === "pending" ? (
            <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-400" />
                Google Meet link unlocks once member approves
              </span>
              <span className="text-[11px] font-mono text-amber-600">Awaiting Member</span>
            </div>
          ) : null}
        </div>

        {/* Demo Simulator Controls (To allow the user to test both approval & refund states) */}
        <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>DEMO TEST: SIMULATE MEMBER RESPONSE</span>
            <span className="text-amber-400 font-bold">Interactive State Tester</span>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSimulateApproval}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                approvalStatus === "approved"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-800 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              Simulate Member Approval
            </button>
            <button
              type="button"
              onClick={handleSimulateRejection}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                approvalStatus === "rejected"
                  ? "bg-rose-600 text-white"
                  : "bg-slate-800 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30"
              }`}
            >
              Simulate Member Rejection (Refund 2-3h)
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          {approvalStatus === "approved" && (
            <Button
              onClick={handleGoogleCalendarAdd}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl gap-2 shadow-sm"
            >
              <Calendar className="h-4 w-4" />
              <span>Add to Google Calendar</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setIsBooked(false);
              setConfirmedData(null);
              setApprovalStatus("pending");
            }}
            className="w-full sm:w-auto text-xs h-10 rounded-xl"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Book another session
          </Button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PRE-BOOKING FORM: FLAT ₹500 & CLEAR APPROVAL/REFUND GUARANTEE
  // ─────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={handleBooking}
      className={`p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xl space-y-5 text-left ${className}`}
    >
      {/* Mentor Header with ₹500 badge */}
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
          <div className="text-right">
            <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              ₹500 / session
            </span>
            <span className="block text-[10px] text-slate-400 mt-0.5">45-min consultation</span>
          </div>
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
          <option value="JoSAA, CET & Seat Allotment Strategy">05. Seat Allotment & Counseling Strategy</option>
          <option value="Campus Realities, Hostels & College Comparison">04. College Comparison & Campus Realities</option>
          <option value="Study Abroad, SOP Review & Visa Mock">03. Study Abroad & Visa Counseling</option>
          <option value="Course Selection, AI vs CS & Major Advice">02. Course Selection & Branch Changes</option>
          <option value="Admissions, SOP & College Entrance Cutoffs">01. Admissions & Entrance Counseling</option>
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
          <Label className="text-xs text-slate-700">Student Email (For mail confirmation) *</Label>
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

      {/* Phone for SMS / WhatsApp alerts */}
      <div className="space-y-1">
        <Label className="text-xs text-slate-700 flex items-center justify-between">
          <span>Phone / WhatsApp (Optional for instant approval alerts)</span>
          <span className="text-[10px] text-slate-400">Optional</span>
        </Label>
        <Input
          type="tel"
          placeholder="+91 98765 43210"
          value={userPhone}
          onChange={(e) => setUserPhone(e.target.value)}
          className="h-10 text-xs rounded-xl bg-slate-50 border-slate-300"
        />
      </div>

      {/* Optional Note */}
      <div className="space-y-1">
        <Label className="text-xs text-slate-700">Note or specific question for mentor</Label>
        <Textarea
          rows={2}
          placeholder="e.g. JoSAA round 2 choice-filling, branch upgrade probability, or hostel life queries..."
          value={userNote}
          onChange={(e) => setUserNote(e.target.value)}
          className="text-xs rounded-xl bg-slate-50 border-slate-300"
        />
      </div>

      {/* 5. Policy & Guarantee Box (Strictly according to user request) */}
      <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Escrow &amp; Member Approval Guarantee</span>
          </div>
          <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
            Amount: ₹500
          </span>
        </div>

        <ul className="text-xs space-y-2 text-slate-300">
          <li className="flex items-start gap-2">
            <Mail className="h-3.5 w-3.5 text-blue-400 shrink-0 mt-0.5" />
            <span>
              <strong>Email Confirmation:</strong> After paying ₹500, you will receive an immediate confirmation email with your booking receipt.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Approval Condition:</strong> Your session is confirmed <strong>when and only when the member approves</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>2–3 Hours Refund Policy:</strong> If rejected or declined by the member, the entire amount of ₹500 will be refunded within <strong>2–3 hours</strong>.
            </span>
          </li>
        </ul>
      </div>

      {/* 6. Payment Method Selection */}
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>Select Payment Method</span>
          <span className="text-[11px] font-mono text-emerald-600 font-semibold">100% Secure SSL</span>
        </Label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setPaymentMethod("upi")}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
              paymentMethod === "upi"
                ? "bg-blue-50 border-blue-600 text-blue-700 shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            UPI / QR
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("card")}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
              paymentMethod === "card"
                ? "bg-blue-50 border-blue-600 text-blue-700 shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            Debit / Credit
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod("netbanking")}
            className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
              paymentMethod === "netbanking"
                ? "bg-blue-50 border-blue-600 text-blue-700 shadow-xs"
                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            NetBanking
          </button>
        </div>
      </div>

      {/* 7. Price Summary & Confirm Button */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Consultancy Fee (45 mins):</span>
          <span className="font-bold text-slate-900">₹500</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Escrow &amp; Platform Charge:</span>
          <span className="font-bold text-emerald-600">₹0 (Student Waiver)</span>
        </div>
        <div className="flex items-center justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-100">
          <span>Total Payable:</span>
          <span className="text-base text-blue-600">₹500</span>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-sm h-12 rounded-xl shadow-md transition-all hover:scale-[1.01] active:scale-95 gap-2"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" /> Processing ₹500 Escrow Payment...
            </span>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Pay ₹500 &amp; Request Booking</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>

        <p className="text-[11px] text-center text-slate-400">
          Session confirmed upon member approval • 100% refunded in 2–3 hours if rejected
        </p>
      </div>
    </form>
  );
};
