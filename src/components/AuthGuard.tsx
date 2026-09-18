import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import PageLoader from "./PageLoader";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { profile, authLoading: loading, user: sessionUser, refreshProfile } = useApp();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!profile || !sessionUser) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
