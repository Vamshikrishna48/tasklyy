import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { isAdminEmail, isAdminGateVerified, clearAdminGate } from "@/utils/launchControl";

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        localStorage.removeItem("demoAdminAuth");

        // Must have completed Admin Portal password login this browser session
        if (!isAdminGateVerified()) {
          setIsAdmin(false);
          setAdminProfile(null);
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          clearAdminGate();
          setIsAdmin(false);
          setAdminProfile(null);
          setLoading(false);
          return;
        }

        const email = session.user.email?.toLowerCase().trim() || "";

        if (!isAdminEmail(email)) {
          clearAdminGate();
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
        clearAdminGate();
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
