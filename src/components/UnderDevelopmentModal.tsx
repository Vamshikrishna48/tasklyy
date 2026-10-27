import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Construction, Sparkles, Clock, Rocket, Lock, Shield, ArrowRight, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getIsPlatformLaunched,
  LAUNCH_EVENT,
  syncLaunchStateFromServer,
  subscribeToLaunchState,
  clearAdminGate,
} from "@/utils/launchControl";

export const UnderDevelopmentModal: React.FC = () => {
  const [isLaunched, setIsLaunched] = useState(() => getIsPlatformLaunched());
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("tasskly_preview_dismissed") === "true";
    } catch {
      return false;
    }
  });
  const location = useLocation();

  useEffect(() => {
    // Sync from server on mount so other devices pick up Launch Website
    syncLaunchStateFromServer().then((launched) => setIsLaunched(launched));

    const handleLaunchChange = (e: any) => {
      const launched = e.detail?.launched ?? getIsPlatformLaunched();
      setIsLaunched(launched);
    };

    const handleOpenModal = () => {
      setIsDismissed(false);
    };

    window.addEventListener(LAUNCH_EVENT, handleLaunchChange);
    window.addEventListener("open-under-dev-modal", handleOpenModal);

    // Realtime Supabase updates when admin toggles launch on another machine
    const unsubscribe = subscribeToLaunchState((launched) => setIsLaunched(launched));

    // Poll every 8s as a reliable cross-device fallback
    const pollId = window.setInterval(() => {
      syncLaunchStateFromServer().then((launched) => setIsLaunched(launched));
    }, 8000);

    return () => {
      window.removeEventListener(LAUNCH_EVENT, handleLaunchChange);
      window.removeEventListener("open-under-dev-modal", handleOpenModal);
      unsubscribe();
      window.clearInterval(pollId);
    };
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem("tasskly_preview_dismissed", "true");
    } catch { /* ignore */ }
  };

  // Hide lock overlay when platform is live, dismissed for this session, or on exempt routes
  if (
    isLaunched ||
    isDismissed ||
    location.pathname.startsWith("/admin") ||
    location.pathname === "/admin-login" ||
    location.pathname.startsWith("/consultancy")
  ) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity pointer-events-auto"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-violet-200 dark:border-slate-800 overflow-hidden z-10 my-auto pointer-events-auto"
        >
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Close and preview platform"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="h-2.5 w-full bg-gradient-to-r from-amber-500 via-violet-600 to-indigo-600 animate-pulse" />

          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6 pr-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 shadow-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <Construction className="w-3.5 h-3.5" />
                UNDER DEVELOPMENT
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800/60">
                <Sparkles className="w-3 h-3" />
                LAUNCHING SOON
              </span>
            </div>

            <div className="flex flex-col items-start gap-3 mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/30 shrink-0">
                  <Rocket className="w-7 h-7 animate-bounce" style={{ animationDuration: "3s" }} />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Tasskly is Launching Soon!
                  </h2>
                  <p className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                    India's Premier Student Marketplace
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200/80 dark:border-amber-900/40 mb-6">
              <p className="text-xs sm:text-sm text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                🚧 This website is currently under active development and internal testing. You can explore the platform in preview mode.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-100/80 dark:border-violet-900/30">
                <Clock className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Active System Building &amp; Testing</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Our engineering team is finalizing system features. Official rollout is coming shortly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
                <Lock className="w-5 h-5 text-slate-600 dark:text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Administrator Access Available</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Authorized administrators can log in to configure settings and launch controls.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  onClick={handleDismiss}
                  className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-extrabold rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm shadow-md cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  Explore Platform
                </Button>

                <Button
                  onClick={() => {
                    clearAdminGate();
                    window.location.assign("/admin-login");
                  }}
                  className="w-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-extrabold rounded-2xl py-3.5 flex items-center justify-center gap-2 text-sm shadow-xl shadow-violet-500/30 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-white" />
                  Admin Login
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-center border border-slate-200 dark:border-slate-700">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  ⚡ Preview mode is unlocked. You can explore all marketplace features.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UnderDevelopmentModal;
