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

        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          clearAdminGate();
          setIsAdmin(false);
          setAdminProfile(null);
          return;
        }

        const email = session.user.email?.toLowerCase().trim() || "";

        // Require BOTH: allowlisted email AND password gate for this user id.
        // If the user is still carrying an old session without the explicit gate,
        // clear it immediately so the admin login form remains the only entry point.
        if (!isAdminEmail(email)) {
          await supabase.auth.signOut({ scope: "local" });
          clearAdminGate();
          setIsAdmin(false);
          setAdminProfile(null);
          return;
        }

        if (!isAdminGateVerified(session.user.id)) {
          await supabase.auth.signOut({ scope: "local" });
          clearAdminGate();
          setIsAdmin(false);
          setAdminProfile(null);
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event) => {
      // Re-validate on every auth change; do not trust prior isAdmin
      setLoading(true);
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, loading, adminProfile };
};
