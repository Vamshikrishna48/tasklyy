import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { isAdminEmail } from "@/utils/launchControl";

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Clear legacy bypass flag if present
        if (localStorage.getItem("demoAdminAuth")) {
          localStorage.removeItem("demoAdminAuth");
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          setIsAdmin(false);
          setAdminProfile(null);
          setLoading(false);
          return;
        }

        const email = session.user.email?.toLowerCase().trim() || "";

        // Hard allowlist — credentials alone are never enough
        if (!isAdminEmail(email)) {
          setIsAdmin(false);
          setAdminProfile(null);
          setLoading(false);
          return;
        }

        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .limit(1)
          .maybeSingle();

        // Ensure profile role stays admin for allowlisted emails
        if (profile && profile.role !== "admin") {
          await (supabase as any)
            .from("profiles")
            .update({ role: "admin" })
            .eq("id", session.user.id);
        }

        setIsAdmin(true);
        setAdminProfile(
          profile
            ? { ...profile, role: "admin" }
            : { role: "admin", full_name: "Admin User", email: session.user.email }
        );
      } catch {
        setIsAdmin(false);
        setAdminProfile(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, loading, adminProfile };
};
