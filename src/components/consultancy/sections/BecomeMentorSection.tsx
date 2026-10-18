import React, { useState } from "react";
import { Heart, IndianRupee, Award, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const BecomeMentorSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [roleAndCompany, setRoleAndCompany] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [expertiseTopic, setExpertiseTopic] = useState("Admissions");
  const [shortBio, setShortBio] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !roleAndCompany || !linkedinUrl) {
      toast.error("Please fill in all required mentor application fields.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const applications = JSON.parse(localStorage.getItem("tasskly_mentor_applications") || "[]");
      applications.unshift({
        fullName,
        email,
        roleAndCompany,
        linkedinUrl,
        expertiseTopic,
        shortBio,
        appliedAt: new Date().toISOString(),
      });
      localStorage.setItem("tasskly_mentor_applications", JSON.stringify(applications));

      setIsSubmitting(false);
      setIsModalOpen(false);
      toast.success("Application Submitted! Our vetting team will review your profile within 48 hours.");
      setFullName("");
      setEmail("");
      setRoleAndCompany("");
      setLinkedinUrl("");
      setShortBio("");
    }, 600);
  };

  const benefits = [
    {
      icon: Heart,
      title: "Help juniors navigate your path",
      description: "Share the hard-earned lessons from your college admissions, placement prep, or study abroad journey with ambitious juniors who need real guidance.",
    },
    {
      icon: IndianRupee,
      title: "Earn per 45-minute session",
      description: "Set your own hourly rate and take sessions on your schedule. Receive weekly direct deposits to your bank account with zero platform commission for early mentors.",
    },
    {
      icon: Award,
      title: "Build your professional profile",
      description: "Earn verified mentor badges, collect authenticated student reviews, and showcase your leadership credentials directly on your LinkedIn and resume.",
    },
  ];

  return (
    <section id="become-mentor-section" className="w-full py-16 md:py-24 px-4 md:px-8 bg-[#f0f7ff]">
      <div className="max-w-7xl mx-auto rounded-3xl p-8 sm:p-14 bg-white border border-blue-200 shadow-sm space-y-10 text-left">
        
        {/* Header */}
        <div className="space-y-3 max-w-3xl">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
            For Seniors & Alumni
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Are you already where students want to be?
          </h2>
          <p className="text-base text-slate-600 font-normal">
            Join Tasskly as a verified mentor. Help motivated students achieve what you accomplished, build your personal brand, and earn on your schedule.
          </p>
        </div>

        {/* 3 Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b, idx) => {
            const Icon = b.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#f8fafc] border border-slate-200/80 space-y-3"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{b.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Strict vetting: 100% verified credentials required. 48-hour approval turnaround.</span>
          </div>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 h-11 rounded-xl shadow-xs transition-all hover:scale-105 active:scale-95 gap-2 shrink-0"
          >
            <span>Apply to be a mentor</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

      </div>

      {/* Mentor Application Dialog Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg p-6 rounded-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Apply to Become a Mentor
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Share your achievements. We review official emails and LinkedIn profiles to keep our directory trusted.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleApply} className="space-y-4 text-left pt-2">
            <div className="space-y-1">
              <Label className="text-xs text-slate-700">Full Name *</Label>
              <Input
                type="text"
                placeholder="e.g. Vikramaditya Rathore"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-700">Work / College Email *</Label>
              <Input
                type="email"
                placeholder="vikram@google.com or vikram@iitb.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-700">Current Role & College / Company *</Label>
              <Input
                type="text"
                placeholder="e.g. Software Engineer at Google (Ex-IIT Delhi)"
                value={roleAndCompany}
                onChange={(e) => setRoleAndCompany(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-700">LinkedIn Profile URL *</Label>
              <Input
                type="url"
                placeholder="https://linkedin.com/in/username"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                required
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-700">Primary Mentorship Focus *</Label>
              <select
                value={expertiseTopic}
                onChange={(e) => setExpertiseTopic(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800"
              >
                <option value="Admissions">College Admissions & Cutoffs</option>
                <option value="Course Selection">Course Selection & Streams</option>
                <option value="Study Abroad">Study Abroad & SOP Reviews</option>
                <option value="Internships">Internships & Resume Reviews</option>
                <option value="Placements">Campus Placements & Tech Coding</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-700">Short Bio / Achievements</Label>
              <Textarea
                rows={2}
                placeholder="e.g. Ranked AIR 142 in JEE Advanced, currently working on distributed databases..."
                value={shortBio}
                onChange={(e) => setShortBio(e.target.value)}
                className="text-xs rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-xl"
            >
              {isSubmitting ? "Submitting application..." : "Submit Application"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};
