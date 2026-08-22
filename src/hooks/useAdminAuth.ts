import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const isDemoAdmin = localStorage.getItem("demoAdminAuth") === "true";
        const { data: { session } } = await supabase.auth.getSession();

        if (!session && !isDemoAdmin) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        if (isDemoAdmin) {
          setIsAdmin(true);
          setAdminProfile({
            role: "admin",
            full_name: "System Administrator",
            email: session?.user?.email || "tasskly@admin.com"
          });
          setLoading(false);
          return;
        }

        const { data: profile, error } = await (supabase as any)
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .limit(1)
          .maybeSingle();

        const lowerEmail = session.user.email?.toLowerCase();
        const isAdminEmail = lowerEmail === "tasskly@admin.com" || 
                             lowerEmail === "karthikmethuku180@gmail.com" || 
                             lowerEmail === "shrikarakarapu@gmail.com" ||
                             lowerEmail === "karshikalamvamshi34@gmail.com" ||
                             lowerEmail === "admin@tasskly.com" ||
                             lowerEmail === "admin@gmail.com";

        if (error || (!profile && !isAdminEmail) || (
          profile && profile.role !== "admin" && !isAdminEmail
        )) {
          setIsAdmin(false);
          setAdminProfile(null);
        } else {
          setIsAdmin(true);
          setAdminProfile(profile || { role: "admin", full_name: "Admin User", email: session.user.email });
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    // React to auth changes (e.g. logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, loading, adminProfile };
};
