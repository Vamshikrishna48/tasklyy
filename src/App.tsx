import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/context/AppContext";
import AdminLayout from "./pages/admin/AdminLayout.tsx";
import AdminOverview from "./pages/admin/AdminOverview.tsx";
import AdminEscrow from "./pages/admin/AdminEscrow.tsx";
import AdminNotifications from "./pages/admin/AdminNotifications.tsx";
import AdminAuth from "./pages/admin/AdminAuth.tsx";
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
import NotFound from "./pages/NotFound.tsx";
import { useNotificationPermission } from "./hooks/useNotificationPermission";
import NotificationBanner from "./components/NotificationBanner";
import { motion } from "framer-motion";

const NotificationGate = ({ children }: { children: React.ReactNode }) => {
  useNotificationPermission();
  return <>{children}</>;
};

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem("demoUserEmail");
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = useApp();
  const isAuthenticated = !!localStorage.getItem("demoUserEmail");

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/admin/auth" replace />;

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <NotificationGate>
            <NotificationBanner />
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin/auth" element={<AdminAuth />} />
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
                </Route>
                <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                  <Route index element={<AdminOverview />} />
                  <Route path="escrow" element={<AdminEscrow />} />
                  <Route path="notifications" element={<AdminNotifications />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </NotificationGate>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
