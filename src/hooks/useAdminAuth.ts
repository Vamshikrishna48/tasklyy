import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { Database } from "@/lib/database.types";

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Demo admin bypass
        if (localStorage.getItem("demoAdminAuth") === "true") {
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single() as { data: Profile | null, error: any };

        if (error || !profile || profile.role !== 'admin') {
          setIsAdmin(false);
          setAdminProfile(null);
        } else {
          setIsAdmin(true);
          setAdminProfile(profile);
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [navigate]);

  return { isAdmin, loading, adminProfile };
};
