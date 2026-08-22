import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Construction, Sparkles, Clock, ShieldCheck, Rocket, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIsPlatformLaunched, LAUNCH_EVENT } from "@/utils/launchControl";

interface UnderDevelopmentModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const UnderDevelopmentModal: React.FC<UnderDevelopmentModalProps> = ({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLaunched, setIsLaunched] = useState(() => getIsPlatformLaunched());

  useEffect(() => {
    // Listen for launch status changes from Admin Panel
    const handleLaunchChange = (e: any) => {
      const launched = e.detail?.launched ?? getIsPlatformLaunched();
      setIsLaunched(launched);
      if (launched) {
        setInternalIsOpen(false);
      }
    };

    window.addEventListener(LAUNCH_EVENT, handleLaunchChange);
    return () => window.removeEventListener(LAUNCH_EVENT, handleLaunchChange);
  }, []);

  useEffect(() => {
    // Only open popup if platform is NOT launched yet
    if (!isLaunched && externalIsOpen === undefined) {
      const timer = setTimeout(() => {
        setInternalIsOpen(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [externalIsOpen, isLaunched]);

  // Listen for custom trigger event (e.g. when user clicks badge in Navbar)
  useEffect(() => {
    const handleOpenEvent = () => {
      if (!isLaunched) {
        setInternalIsOpen(true);
      }
    };
    window.addEventListener("open-under-dev-modal", handleOpenEvent);
    return () => window.removeEventListener("open-under-dev-modal", handleOpenEvent);
  }, [isLaunched]);

  // If platform is officially launched by Admin, do not render modal at all
  if (isLaunched) return null;

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const handleClose = () => {
    sessionStorage.setItem("tasskly_under_dev_modal_shown", "true");
    setInternalIsOpen(false);
    if (externalOnClose) {
      externalOnClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-violet-100 dark:border-slate-800 overflow-hidden z-10 my-8"
          >
            {/* Top decorative gradient bar */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-violet-600 to-indigo-600" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              {/* Header Status Badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <Construction className="w-3.5 h-3.5" />
                  UNDER DEVELOPMENT
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60">
                  <Sparkles className="w-3 h-3" />
                  LAUNCHING SOON
                </span>
              </div>

              {/* Icon & Title Header */}
              <div className="flex flex-col items-start gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25 shrink-0">
                    <Rocket className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Tasskly is Launching Soon!
                    </h2>
                    <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
                      India's Premier Student Marketplace
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Message */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 mb-6">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Thank you for visiting! Our platform is currently under active development and internal testing. You are exploring an early preview version.
                </p>
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 gap-3 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100/80 dark:border-violet-900/30">
                  <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active Development Phase</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Features are being updated daily. Full commercial rollout is coming shortly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/80 dark:border-indigo-900/30">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Platform Preview Enabled</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">You can freely browse assignments, tasks, and test user registration.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/30">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Safe & Verified Platform</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">All registered accounts, security protocols, and test data are active.</p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end pt-2">
                <Button
                  onClick={handleClose}
                  className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-violet-500/25 rounded-xl px-6 py-2.5 flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  Got It
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UnderDevelopmentModal;
