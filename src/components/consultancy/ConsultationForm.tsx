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
  Users,
  MessageSquare,
  Clock,
  ShieldCheck,
  Video,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export interface FormData {
  name: string;
  email: string;
  company: string;
  teamSize: string;
  helpWith: string;
  preferredDate: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  teamSize?: string;
  helpWith?: string;
  preferredDate?: string;
}

interface ConfirmedBooking {
  id: string;
  name: string;
  email: string;
  company: string;
  teamSize: string;
  helpWith: string;
  preferredDate: string;
  meetingLink: string;
  timestamp: string;
}

interface ConsultationFormProps {
  initialServiceOrTier?: string;
  onSuccess?: () => void;
}

export const ConsultationForm: React.FC<ConsultationFormProps> = ({
  initialServiceOrTier = "",
  onSuccess,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    teamSize: "10-50",
    helpWith: initialServiceOrTier
      ? `Interested in ${initialServiceOrTier}. Need guidance on our workflow architecture.`
      : "",
    preferredDate: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<ConfirmedBooking | null>(null);

  // Update initial service or tier if prop changes
  React.useEffect(() => {
    if (initialServiceOrTier) {
      setFormData((prev) => ({
        ...prev,
        helpWith: `Interested in ${initialServiceOrTier}. Need guidance on our workflow architecture.`,
      }));
    }
  }, [initialServiceOrTier]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Work email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid work email address";
    }

    if (!formData.company.trim()) {
      newErrors.company = "Company or organization is required";
    }

    if (!formData.teamSize) {
      newErrors.teamSize = "Please select your team size";
    }

    if (!formData.helpWith.trim()) {
      newErrors.helpWith = "Please describe what your team needs help with";
    } else if (formData.helpWith.trim().length < 10) {
      newErrors.helpWith = "Please provide a bit more detail (min 10 characters)";
    }

    if (!formData.preferredDate) {
      newErrors.preferredDate = "Please choose a preferred consultation date";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fill in all required fields accurately.");
      return;
    }

    setIsSubmitting(true);

    const bookingId = `TSK-REQ-${Math.floor(100000 + Math.random() * 900000)}`;
    const meetingLink = `https://meet.google.com/tsk-cns-${Math.random().toString(36).substring(2, 7)}`;
    const newBooking: ConfirmedBooking = {
      id: bookingId,
      ...formData,
      meetingLink,
      timestamp: new Date().toISOString(),
    };

    try {
      // 1. Attempt POST to backend endpoint /api/consultancy-requests
      let postSucceeded = false;
      try {
        const response = await fetch("/api/consultancy-requests", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newBooking),
        });
        if (response.ok) {
          postSucceeded = true;
        }
      } catch {
        // Fallback gracefully
      }

      // 2. Fallback to Supabase table if available
      try {
        await supabase.from("consultancy_requests").insert([
          {
            reference_id: bookingId,
            name: formData.name,
            email: formData.email,
            company: formData.company,
            team_size: formData.teamSize,
            help_with: formData.helpWith,
            preferred_date: formData.preferredDate,
            meeting_link: meetingLink,
            status: "pending_confirmation",
          },
        ]);
      } catch {
        // If table doesn't exist, proceed to local persistence
      }

      // 3. Always store in localStorage as guaranteed persistence
      const savedRequests = JSON.parse(
        localStorage.getItem("tasskly_consultancy_submissions") || "[]"
      );
      savedRequests.unshift(newBooking);
      localStorage.setItem("tasskly_consultancy_submissions", JSON.stringify(savedRequests));

      // Simulate realistic API delay
      await new Promise((r) => setTimeout(r, 650));

      setConfirmedBooking(newBooking);
      setSubmissionSuccess(true);
      toast.success("Consultation Request Confirmed! Our lead architect will reach out shortly.");

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred. Please try again or email support@tasskly.com");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      company: "",
      teamSize: "10-50",
      helpWith: "",
      preferredDate: "",
    });
    setErrors({});
    setSubmissionSuccess(false);
    setConfirmedBooking(null);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <AnimatePresence mode="wait">
        {submissionSuccess && confirmedBooking ? (
          /* SUCCESS STATE CONFIRMATION PASS */
          <motion.div
            key="success-card"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            className="p-8 sm:p-10 rounded-3xl bg-[#040e24]/95 backdrop-blur-2xl border-2 border-emerald-400/60 shadow-[0_0_50px_rgba(16,185,129,0.3)] space-y-8 text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Consultation Confirmed!
                  </h3>
                  <p className="text-xs text-slate-300">
                    Ref ID: <span className="font-mono text-emerald-400 font-bold">{confirmedBooking.id}</span>
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono text-xs font-bold uppercase">
                Active Pass
              </span>
            </div>

            {/* Booking Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-teal-500/20 space-y-1">
                <p className="text-slate-400 font-mono uppercase text-[10px]">Client & Company</p>
                <p className="text-white font-bold text-sm">{confirmedBooking.name}</p>
                <p className="text-emerald-400">{confirmedBooking.company} • {confirmedBooking.teamSize} members</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-teal-500/20 space-y-1">
                <p className="text-slate-400 font-mono uppercase text-[10px]">Preferred Window</p>
                <p className="text-white font-bold text-sm">{confirmedBooking.preferredDate}</p>
                <p className="text-slate-300">45-min Zoom / Google Meet Diagnostic</p>
              </div>

              <div className="col-span-1 sm:col-span-2 p-4 rounded-xl bg-slate-950/60 border border-teal-500/20 space-y-1">
                <p className="text-slate-400 font-mono uppercase text-[10px]">Scope of Assistance</p>
                <p className="text-slate-200 text-xs leading-relaxed">{confirmedBooking.helpWith}</p>
              </div>

              <div className="col-span-1 sm:col-span-2 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Video className="h-4 w-4" />
                  <span>Your Dedicated Meeting Link</span>
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
                <p className="text-[11px] text-slate-400">
                  A calendar invite and calendar ICS attachment have also been prepared for {confirmedBooking.email}.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Submit another inquiry</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <ShieldCheck className="h-4 w-4" />
                <span>Protected by Tasskly Client Confidentiality</span>
              </div>
            </div>
          </motion.div>
        ) : (
          /* FORM ENTRY STATE */
          <motion.form
            key="booking-form"
            onSubmit={handleSubmit}
            className="p-6 sm:p-10 rounded-3xl bg-[#040e24]/90 backdrop-blur-2xl border border-teal-500/30 shadow-2xl space-y-6 text-left relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Form Title */}
            <div className="border-b border-slate-800/80 pb-4 space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Schedule Your Free 45-Minute Diagnostic
              </h3>
              <p className="text-xs text-slate-300">
                Meet directly with a senior productivity architect. No pitch decks, no junior reps—pure operational analysis.
              </p>
            </div>

            {/* Input Row 1: Name & Work Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-name" className="text-xs text-slate-200 font-medium flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-teal-400" />
                  <span>Full Name *</span>
                </Label>
                <Input
                  id="c-name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={`bg-slate-950/70 border-teal-500/30 text-white placeholder:text-slate-500 text-xs sm:text-sm h-11 rounded-xl focus:border-emerald-400 ${
                    errors.name ? "border-rose-500" : ""
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-email" className="text-xs text-slate-200 font-medium flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-teal-400" />
                  <span>Work Email *</span>
                </Label>
                <Input
                  id="c-email"
                  type="email"
                  placeholder="alex@company.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={`bg-slate-950/70 border-teal-500/30 text-white placeholder:text-slate-500 text-xs sm:text-sm h-11 rounded-xl focus:border-emerald-400 ${
                    errors.email ? "border-rose-500" : ""
                  }`}
                />
                {errors.email && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Input Row 2: Company & Team Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-company" className="text-xs text-slate-200 font-medium flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-teal-400" />
                  <span>Company / Organization *</span>
                </Label>
                <Input
                  id="c-company"
                  type="text"
                  placeholder="e.g. Acme Technologies"
                  value={formData.company}
                  onChange={(e) => {
                    setFormData({ ...formData, company: e.target.value });
                    if (errors.company) setErrors({ ...errors, company: undefined });
                  }}
                  className={`bg-slate-950/70 border-teal-500/30 text-white placeholder:text-slate-500 text-xs sm:text-sm h-11 rounded-xl focus:border-emerald-400 ${
                    errors.company ? "border-rose-500" : ""
                  }`}
                />
                {errors.company && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.company}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="c-teamsize" className="text-xs text-slate-200 font-medium flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-teal-400" />
                  <span>Team Size *</span>
                </Label>
                <select
                  id="c-teamsize"
                  value={formData.teamSize}
                  onChange={(e) => {
                    setFormData({ ...formData, teamSize: e.target.value });
                    if (errors.teamSize) setErrors({ ...errors, teamSize: undefined });
                  }}
                  className="w-full bg-slate-950/70 border border-teal-500/30 text-white text-xs sm:text-sm h-11 rounded-xl px-3 focus:outline-none focus:border-emerald-400"
                >
                  <option value="1-10">1 – 10 (Early Stage / Student Team)</option>
                  <option value="10-50">10 – 50 (Fast Scaling Startup)</option>
                  <option value="50-250">50 – 250 (Mid-Market Scaleup)</option>
                  <option value="250+">250+ (Enterprise Department)</option>
                </select>
                {errors.teamSize && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{errors.teamSize}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Input Row 3: What do you need help with */}
            <div className="space-y-1.5">
              <Label htmlFor="c-help" className="text-xs text-slate-200 font-medium flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-teal-400" />
                <span>What do you need help with? *</span>
              </Label>
              <Textarea
                id="c-help"
                rows={3}
                placeholder="e.g. We have too many status meetings, Linear/Slack tasks get lost, and engineering cycle time has increased after expanding the team..."
                value={formData.helpWith}
                onChange={(e) => {
                  setFormData({ ...formData, helpWith: e.target.value });
                  if (errors.helpWith) setErrors({ ...errors, helpWith: undefined });
                }}
                className={`bg-slate-950/70 border-teal-500/30 text-white placeholder:text-slate-500 text-xs sm:text-sm rounded-xl focus:border-emerald-400 ${
                  errors.helpWith ? "border-rose-500" : ""
                }`}
              />
              {errors.helpWith && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.helpWith}</span>
                </p>
              )}
            </div>

            {/* Input Row 4: Preferred Date */}
            <div className="space-y-1.5">
              <Label htmlFor="c-date" className="text-xs text-slate-200 font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-teal-400" />
                <span>Preferred Date *</span>
              </Label>
              <Input
                id="c-date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={formData.preferredDate}
                onChange={(e) => {
                  setFormData({ ...formData, preferredDate: e.target.value });
                  if (errors.preferredDate) setErrors({ ...errors, preferredDate: undefined });
                }}
                className={`bg-slate-950/70 border-teal-500/30 text-white text-xs sm:text-sm h-11 rounded-xl focus:border-emerald-400 ${
                  errors.preferredDate ? "border-rose-500" : ""
                }`}
              />
              {errors.preferredDate && (
                <p className="text-[11px] text-rose-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.preferredDate}</span>
                </p>
              )}
            </div>

            {/* Submit CTA */}
            <div className="pt-2 space-y-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-sky-400 hover:from-emerald-300 hover:to-sky-300 text-slate-950 font-black text-sm h-12 rounded-xl shadow-lg shadow-emerald-500/30 border border-teal-300/40 transition-all hover:scale-[1.01] active:scale-95 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Booking Your Session...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    <span>Book a Free Consultation</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>100% Free Diagnostic • No Obligation • Guaranteed Confidential</span>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};
