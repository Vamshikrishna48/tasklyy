import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Bell, Rocket, GraduationCap, Building2, Star, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const floatingIcons = [
  { icon: GraduationCap, x: "10%", y: "20%", delay: 0, color: "#6366f1" },
  { icon: Building2, x: "80%", y: "15%", delay: 0.4, color: "#10b981" },
  { icon: Star, x: "88%", y: "70%", delay: 0.8, color: "#f59e0b" },
  { icon: Clock, x: "8%", y: "75%", delay: 1.2, color: "#ec4899" },
  { icon: Rocket, x: "50%", y: "8%", delay: 0.2, color: "#8b5cf6" },
];

const features = [
  {
    icon: Briefcase,
    title: "Internship Listings",
    desc: "Discover paid and unpaid internships from top companies and startups.",
    color: "from-violet-500 to-indigo-500",
  },
  {
    icon: GraduationCap,
    title: "Student-First",
    desc: "Opportunities tailored for students at every level — freshers to final year.",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Building2,
    title: "Top Recruiters",
    desc: "Connect directly with verified companies and hiring managers.",
    color: "from-amber-500 to-orange-500",
  },
];

const Internships = () => {
  const [email, setEmail] = useState("");
  const [notified, setNotified] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNotified(true);
    toast.success("You're on the list! We'll notify you when Internships launches 🚀");
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(135deg, #0f0c29 0%, #1a1040 40%, #0d1b2a 100%)",
      }}
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)" }}
        />
      </div>

      {/* Star field */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.6 + 0.1,
            }}
            animate={{ opacity: [null, 0.1, 0.8] }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      {/* Floating icons */}
      {floatingIcons.map(({ icon: Icon, x, y, delay, color }, i) => (
        <motion.div
          key={i}
          className="absolute z-0 pointer-events-none hidden md:flex"
          style={{ left: x, top: y }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center opacity-20"
            style={{ background: color + "33", border: `1px solid ${color}44` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </motion.div>
      ))}

      {/* Back button */}
      <div className="relative z-10 p-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-white/60 hover:text-white hover:bg-white/10">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-16 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.4)",
              color: "#a5b4fc",
            }}
          >
            <Rocket className="h-3 w-3" />
            Coming Soon
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1
            className="text-5xl sm:text-7xl font-black text-white mb-4 leading-tight"
            style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
          >
            Intern
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #6366f1, #10b981, #f59e0b)" }}
            >
              ships
            </span>
          </h1>
          <p className="text-xl sm:text-2xl font-light text-white/50 mt-2">
            on <span className="text-white font-bold">Tasskly</span>
          </p>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 max-w-lg text-base text-white/60 leading-relaxed"
        >
          We're building India's most student-friendly internship platform. Real opportunities, real companies,
          and real experience — all right here on Tasskly.
        </motion.p>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-3xl w-full"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ scale: 1.04, y: -4 }}
              className="rounded-2xl p-5 text-left flex flex-col gap-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                <p className="text-xs text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Notify form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 w-full max-w-md"
        >
          {!notified ? (
            <>
              <p className="text-sm text-white/40 mb-4 flex items-center justify-center gap-2">
                <Bell className="h-4 w-4" />
                Get notified when we launch
              </p>
              <form onSubmit={handleNotify} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl text-sm text-white outline-none"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
                >
                  Notify Me
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4 px-6 rounded-2xl flex items-center justify-center gap-3"
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "1px solid rgba(16,185,129,0.3)",
              }}
            >
              <span className="text-2xl">🎉</span>
              <p className="text-sm font-medium text-emerald-400">
                You're on the list! We'll notify you at launch.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* CTA back */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10"
        >
          <Link to="/jobs">
            <Button
              variant="ghost"
              className="text-white/50 hover:text-white hover:bg-white/10 gap-2 text-sm"
            >
              Meanwhile, explore Jobs on Tasskly →
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Internships;
