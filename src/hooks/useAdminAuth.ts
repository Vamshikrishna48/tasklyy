import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data: profile, error } = await (supabase as any)
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error || !profile || profile.role !== "admin") {
          setIsAdmin(false);
          setAdminProfile(null);
        } else {
          setIsAdmin(true);
          setAdminProfile(profile);
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
