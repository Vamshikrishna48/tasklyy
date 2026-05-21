import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { useApp } from "@/context/AppContext";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminOverview from "./pages/admin/AdminOverview.tsx";
import AdminEscrow from "./pages/admin/AdminEscrow.tsx";
import AdminLedger from "./pages/admin/AdminLedger.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminNotifications from "./pages/admin/AdminNotifications.tsx";
import AdminAuth from "./pages/admin/AdminAuth.tsx";
import AdminGuard from "./components/AdminGuard.tsx";
import Index from "./pages/Index.tsx";
import BrowseJobs from "./pages/BrowseJobs.tsx";
import JobDetail from "./pages/JobDetail.tsx";
import PostJob from "./pages/PostJob.tsx";
import OnTimeWorks from "./pages/OnTimeWorks.tsx";
import Auth from "./pages/Auth.tsx";
import DashboardLayout from "./pages/dashboard/DashboardLayout.tsx";
import DashboardOverview from "./pages/dashboard/DashboardOverview.tsx";
import MyJobs from "./pages/dashboard/MyJobs.tsx";
import Earnings from "./pages/dashboard/Earnings.tsx";
import Portfolio from "./pages/dashboard/Portfolio.tsx";
import Profile from "./pages/dashboard/Profile.tsx";
import SubmittedWork from "./pages/dashboard/SubmittedWork.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useNotificationPermission } from "./hooks/useNotificationPermission";
import NotificationBanner from "./components/NotificationBanner";
import { motion } from "framer-motion";
import CircularText from "./components/CircularText";

const NotificationGate = ({ children }: { children: React.ReactNode }) => {
  useNotificationPermission();
  return <>{children}</>;
};

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState(0);

  const loadingTexts = [
    "Finding assignments for you...",
    "Connecting students & experts...",
    "Loading your marketplace...",
    "Almost ready...",
  ];

  useEffect(() => {
    const duration = 8000; // 8 seconds total loading
    const intervalTime = 50; // update progress every 50ms
    const step = 100 / (duration / intervalTime); // increment step: 0.625% per step

    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300); // Pause briefly at 100% so it is fully visible
          return 100;
        }
        return Math.min(old + step, 100);
      });
    }, intervalTime);
    return () => clearInterval(timer);
  }, [onComplete]);

  useEffect(() => {
    const t = setInterval(() => {
      setCurrentText((old) => (old + 1) % loadingTexts.length);
    }, 2000); // calm transition matching the 8 second load time
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 relative overflow-hidden">

      {/* Animated gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] rounded-full bg-teal-400/10 blur-[100px]" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Center content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8"
      >
        {/* Logo + Circular Text */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
          className="relative flex items-center justify-center mb-4"
        >
          {/* Outer glow ring adjusted to match the smaller 220px circle */}
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.15, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[240px] h-[240px] rounded-full bg-gradient-to-br from-blue-500/20 to-emerald-400/20 blur-3xl pointer-events-none"
          />
          <CircularText 
            text="TASKLYY • INDIA'S STUDENT MARKETPLACE • " 
            spinDuration={20}
            onHover="speedUp"
            size={220}
            radius={84}
          >
            {/* Brand elements aligned side-by-side with absolutely zero space */}
            <div className="flex flex-row items-center justify-center gap-0">
              <img
                src="/taskly-logo.png"
                alt="Tasklyy Logo"
                className="w-18 h-18 object-contain animate-pulse"
                style={{ animationDuration: '4s' }}
              />
              <h1 className="text-4xl font-black tracking-tight text-white leading-none">
                Tasklyy
              </h1>
            </div>
            <p className="text-[8px] font-semibold text-blue-300 tracking-widest uppercase mt-1">
              India's Student Marketplace
            </p>
          </CircularText>
        </motion.div>

        {/* Animated loading text */}
        <motion.p
          key={currentText}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="text-xs text-gray-400 tracking-wide"
        >
          {loadingTexts[currentText]}
        </motion.p>

        {/* Progress bar */}
        <div className="w-64">
          <div className="w-full h-[3px] bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-teal-400 to-emerald-400"
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-gray-600">Loading</span>
            <span className="text-[10px] text-gray-500">{Math.round(progress)}%</span>
          </div>
        </div>
      </motion.div>

      {/* Bottom tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-8 text-[11px] text-gray-600 tracking-widest uppercase"
      >
        Upload · Assign · Deliver
      </motion.p>
    </div>
  );
};

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <NotificationGate>
            <NotificationBanner />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              {showSplash ? (
                <SplashScreen onComplete={() => setShowSplash(false)} />
              ) : (
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/jobs" element={<ProtectedRoute><BrowseJobs /></ProtectedRoute>} />
                  <Route path="/jobs/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
                  <Route path="/post-job" element={<ProtectedRoute><PostJob /></ProtectedRoute>} />
                  <Route path="/on-time-works" element={<ProtectedRoute><OnTimeWorks /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                    <Route index element={<DashboardOverview />} />
                    <Route path="jobs" element={<MyJobs />} />
                    <Route path="earnings" element={<Earnings />} />
                    <Route path="portfolio" element={<Portfolio />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="submitted" element={<SubmittedWork />} />
                  </Route>
                  <Route path="/admin/auth" element={<AdminAuth />} />
                  <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                    <Route index element={<AdminOverview />} />
                    <Route path="escrow" element={<AdminEscrow />} />
                    <Route path="ledger" element={<AdminLedger />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="notifications" element={<AdminNotifications />} />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              )}
            </BrowserRouter>
          </NotificationGate>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
