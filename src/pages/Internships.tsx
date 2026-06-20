import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Briefcase, Bell, Rocket, GraduationCap, Building2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
      className="h-screen w-screen overflow-hidden relative flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #e0f7f4 0%, #f0fdf4 40%, #d1fae5 70%, #bae6fd 100%)",
      }}
    >
      {/* Animated blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, -15, 0], y: [0, 20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }}
        />
      </div>

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #0d9488 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Floating icons */}
      <motion.div
        className="absolute top-[15%] left-[8%] hidden md:flex"
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-100 border border-emerald-200 shadow-sm">
          <GraduationCap className="h-6 w-6 text-emerald-600" />
        </div>
      </motion.div>

      <motion.div
        className="absolute top-[20%] right-[8%] hidden md:flex"
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-sky-100 border border-sky-200 shadow-sm">
          <Building2 className="h-6 w-6 text-sky-600" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[20%] left-[10%] hidden md:flex"
        animate={{ y: [-6, 6, -6] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-violet-100 border border-violet-200 shadow-sm">
          <Briefcase className="h-6 w-6 text-violet-600" />
        </div>
      </motion.div>

      <motion.div
        className="absolute bottom-[18%] right-[9%] hidden md:flex"
        animate={{ y: [-8, 8, -8] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      >
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-100 border border-amber-200 shadow-sm">
          <Rocket className="h-6 w-6 text-amber-600" />
        </div>
      </motion.div>

      {/* Back button */}
      <div className="absolute top-5 left-5 z-20">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 text-gray-500 hover:text-gray-800 hover:bg-white/60">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-5"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
            <Rocket className="h-3 w-3" />
            Coming Soon
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-7xl font-black text-gray-800 leading-tight mb-3"
          style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        >
          Intern
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #059669, #0891b2)" }}
          >
            ships
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-gray-500 max-w-md leading-relaxed mb-8"
        >
          We're building India's most student-friendly internship platform — real opportunities, real companies, all on Tasskly.
        </motion.p>

        {/* Notify form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="w-full max-w-md"
        >
          {!notified ? (
            <>
              <p className="text-xs text-gray-400 mb-3 flex items-center justify-center gap-1.5">
                <Bell className="h-3.5 w-3.5" />
                Get notified when we launch
              </p>
              <form onSubmit={handleNotify} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl text-sm text-gray-700 outline-none bg-white/80 border border-white shadow-sm placeholder-gray-400 focus:border-emerald-300 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 whitespace-nowrap"
                  style={{ background: "linear-gradient(135deg, #059669, #0891b2)" }}
                >
                  Notify Me
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-4 px-6 rounded-2xl flex items-center justify-center gap-3 bg-emerald-50 border border-emerald-200"
            >
              <span className="text-2xl">🎉</span>
              <p className="text-sm font-semibold text-emerald-700">
                You're on the list! We'll notify you at launch.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-8"
        >
          <Link to="/jobs">
            <Button variant="ghost" className="text-gray-400 hover:text-gray-700 hover:bg-white/50 gap-2 text-sm">
              Meanwhile, explore Jobs on Tasskly →
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Internships;
