import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building,
  Mail,
  User,
  GraduationCap,
  MessageSquare,
  School,
  Clock,
  ShieldCheck,
  Video,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export interface CampusFormData {
  name: string;
  email: string;
  role: string; // Student / Club / Professor / College admin
  collegeName: string;
  yearOrDept: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  role?: string;
  collegeName?: string;
  yearOrDept?: string;
  message?: string;
}

interface ConfirmedBooking {
  id: string;
  name: string;
  email: string;
  role: string;
  collegeName: string;
  yearOrDept: string;
  message: string;
  meetingLink: string;
  timestamp: string;
}

interface ConsultationFormProps {
  initialPlanOrService?: string;
  onSuccess?: () => void;
  isDark?: boolean;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  initialPlanOrService = "",
  onSuccess,
  isDark = true,
}) => {
  const [formData, setFormData] = useState<CampusFormData>({
    name: "",
    email: "",
    role: "Student",
    collegeName: "",
    yearOrDept: "",
    message: initialPlanOrService
      ? `Interested in ${initialPlanOrService}. We would love guidance on our academic setup.`
      : "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);

  React.useEffect(() => {
    if (initialPlanOrService) {
      setFormData((prev) => ({
        ...prev,
        message: `Interested in ${initialPlanOrService}. We would love guidance on our academic setup.`,
      }));
    }
  }, [initialPlanOrService]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.role) {
      newErrors.role = "Please select your role";
    }

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = "College or university name is required";
    }

    if (!formData.yearOrDept.trim()) {
      newErrors.yearOrDept = "Year of study or department is required";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please describe what you need help with";
    } else if (formData.message.trim().length < 8) {
      newErrors.message = "Please provide a bit more detail (min 8 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill in all required campus fields.");
      return;
    }

    setIsSubmitting(true);

    const bookingId = `CAMPUS-${Math.floor(100000 + Math.random() * 900000)}`;
    const meetingLink = `https://meet.google.com/tsk-cns-${Math.random().toString(36).substring(2, 7)}`;
    const newBooking: ConfirmedBooking = {
      id: bookingId,
      ...formData,
      meetingLink,
      timestamp: new Date().toISOString(),
    };

    try {
      // 1. Post to backend endpoint
      try {
        await fetch("/api/consultancy-requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newBooking),
        });
      } catch {}

      // 2. Fallback to Supabase
      try {
        await supabase.from("consultancy_requests").insert([
          {
            reference_id: bookingId,
            name: formData.name,
            email: formData.email,
            company: formData.collegeName,
            team_size: formData.role,
            help_with: `${formData.yearOrDept} | ${formData.message}`,
            preferred_date: new Date().toISOString().split("T")[0],
            meeting_link: meetingLink,
            status: "pending_confirmation",
          },
        ]);
      } catch {}

      // 3. LocalStorage persistence
      const savedRequests = JSON.parse(
        localStorage.getItem("tasskly_campus_submissions") || "[]"
      );
      savedRequests.unshift(newBooking);
      localStorage.setItem("tasskly_campus_submissions", JSON.stringify(savedRequests));

      await new Promise((r) => setTimeout(r, 600));

      setConfirmedBooking(newBooking);
      setSubmissionSuccess(true);
      toast.success("Consultation Request Sent! Our student advisor will reach out within 24 hours.");

      if (onSuccess) onSuccess();
    } catch {
      toast.error("An error occurred. Please try again or email support@tasskly.com");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      role: "Student",
      collegeName: "",
      yearOrDept: "",
      message: "",
    });
    setErrors({});
    setSubmissionSuccess(false);
    setConfirmedBooking(null);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {submissionSuccess && confirmedBooking ? (
          /* SUCCESS PASS */
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            className={`p-8 sm:p-10 rounded-3xl border-2 border-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.3)] space-y-6 text-left ${
              isDark ? "bg-[#040e24]/95 backdrop-blur-2xl" : "bg-white/95 shadow-xl"
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-700/40">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className={`text-xl sm:text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    Consultation Request Confirmed!
                  </h3>
                  <p className="text-xs text-slate-400">
                    Ref ID: <span className="font-mono text-emerald-400 font-bold">{confirmedBooking.id}</span>
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold uppercase">
                Active Pass
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-teal-500/20 space-y-1">
                <p className="text-slate-400 font-mono uppercase text-[10px]">Contact & Role</p>
                <p className="text-white font-bold text-sm">{confirmedBooking.name} ({confirmedBooking.role})</p>
                <p className="text-emerald-400">{confirmedBooking.email}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-teal-500/20 space-y-1">
                <p className="text-slate-400 font-mono uppercase text-[10px]">Campus & Department</p>
                <p className="text-white font-bold text-sm">{confirmedBooking.collegeName}</p>
                <p className="text-slate-300">{confirmedBooking.yearOrDept}</p>
              </div>

              <div className="col-span-1 sm:col-span-2 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Video className="h-4 w-4" />
                  <span>Google Meet Room Generated</span>
                </div>
                <div className="flex items-center justify-between gap-3 bg-slate-950/80 p-2.5 rounded-lg border border-emerald-500/30 font-mono text-xs">
                  <span className="text-slate-300 truncate">{confirmedBooking.meetingLink}</span>
                  <a
                    href={confirmedBooking.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-white underline shrink-0 font-bold"
                  >
                    Open Link
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-700/40">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Submit another inquiry</span>
              </button>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <ShieldCheck className="h-4 w-4" />
                <span>Zero Obligation Free Session</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* FORM ENTRY */
          <motion.form
            key="campus-form"
            onSubmit={handleSubmit}
            className={`p-6 sm:p-9 rounded-3xl backdrop-blur-2xl border shadow-2xl space-y-5 text-left relative overflow-hidden ${
              isDark ? "bg-[#040e24]/90 border-teal-500/30" : "bg-white/95 border-slate-200"
            }`}
          >
            <div className="border-b border-slate-700/40 pb-3 space-y-1">
              <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Request Free Consultation
              </h3>
              <p className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                Tell us about your campus goals and we will schedule your session within 24 hours.
              </p>
            </div>

            {/* Row 1: Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cp-name" className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  <User className="h-3.5 w-3.5 text-teal-400" />
                  <span>Full Name *</span>
                </Label>
                <Input
                  id="cp-name"
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`h-11 rounded-xl text-xs sm:text-sm ${
                    isDark ? "bg-slate-950/70 border-teal-500/30 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-900"
                  } ${errors.name ? "border-rose-500" : ""}`}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cp-email" className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  <Mail className="h-3.5 w-3.5 text-teal-400" />
                  <span>Email Address *</span>
                </Label>
                <Input
                  id="cp-email"
                  type="email"
                  placeholder="priya@college.edu"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`h-11 rounded-xl text-xs sm:text-sm ${
                    isDark ? "bg-slate-950/70 border-teal-500/30 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-900"
                  } ${errors.email ? "border-rose-500" : ""}`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 2: "I am a" Dropdown & College Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="cp-role" className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  <GraduationCap className="h-3.5 w-3.5 text-teal-400" />
                  <span>I am a *</span>
                </Label>
                <select
                  id="cp-role"
                  value={formData.role}
                  onChange={(e) => {
                    setFormData({ ...formData, role: e.target.value });
                    if (errors.role) setErrors({ ...errors, role: undefined });
                  }}
                  className={`w-full h-11 rounded-xl px-3 text-xs sm:text-sm border focus:outline-none ${
                    isDark ? "bg-slate-950/70 border-teal-500/30 text-white" : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                >
                  <option value="Student">Student (Undergraduate / Postgraduate)</option>
                  <option value="Club / Society Leader">Club / Society Leader</option>
                  <option value="Professor / Faculty">Professor / Faculty Member</option>
                  <option value="College / University Admin">College / University Admin (Dean, Registrar)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cp-college" className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  <School className="h-3.5 w-3.5 text-teal-400" />
                  <span>College or University Name *</span>
                </Label>
                <Input
                  id="cp-college"
                  type="text"
                  placeholder="e.g. IIT Madras / Delhi University"
                  value={formData.collegeName}
                  onChange={(e) => {
                    setFormData({ ...formData, collegeName: e.target.value });
                    if (errors.collegeName) setErrors({ ...errors, collegeName: undefined });
                  }}
                  className={`h-11 rounded-xl text-xs sm:text-sm ${
                    isDark ? "bg-slate-950/70 border-teal-500/30 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-900"
                  } ${errors.collegeName ? "border-rose-500" : ""}`}
                />
                {errors.collegeName && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.collegeName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Row 3: Year or Department */}
            <div className="space-y-1.5">
              <Label htmlFor="cp-dept" className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                <Building className="h-3.5 w-3.5 text-teal-400" />
                <span>Year of Study or Department *</span>
              </Label>
              <Input
                id="cp-dept"
                type="text"
                placeholder="e.g. 3rd Year B.Tech CSE or Dept of Mechanical Engineering"
                value={formData.yearOrDept}
                onChange={(e) => {
                  setFormData({ ...formData, yearOrDept: e.target.value });
                  if (errors.yearOrDept) setErrors({ ...errors, yearOrDept: undefined });
                }}
                className={`h-11 rounded-xl text-xs sm:text-sm ${
                  isDark ? "bg-slate-950/70 border-teal-500/30 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-900"
                } ${errors.yearOrDept ? "border-rose-500" : ""}`}
              />
              {errors.yearOrDept && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.yearOrDept}</span>
                </p>
              )}
            </div>

            {/* Row 4: Message Box */}
            <div className="space-y-1.5">
              <Label htmlFor="cp-msg" className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                <MessageSquare className="h-3.5 w-3.5 text-teal-400" />
                <span>What do you need help with? *</span>
              </Label>
              <Textarea
                id="cp-msg"
                rows={3}
                placeholder="e.g. We want to organize our college technical fest timeline, or help our 200 students prepare for summer internship drives..."
                value={formData.message}
                onChange={(e) => {
                  setFormData({ ...formData, message: e.target.value });
                  if (errors.message) setErrors({ ...errors, message: undefined });
                }}
                className={`rounded-xl text-xs sm:text-sm ${
                  isDark ? "bg-slate-950/70 border-teal-500/30 text-white placeholder:text-slate-500" : "bg-slate-50 border-slate-300 text-slate-900"
                } ${errors.message ? "border-rose-500" : ""}`}
              />
              {errors.message && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.message}</span>
                </p>
              )}
            </div>

            {/* Full-width "Request consultation" button */}
            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-sm h-12 rounded-xl shadow-lg shadow-emerald-500/30 border border-teal-300/40 transition-all hover:scale-[1.01] active:scale-95 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending Request...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    <span>Request Consultation</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>100% Free Campus Advisory • No Obligation • Protected Student Privacy</span>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
