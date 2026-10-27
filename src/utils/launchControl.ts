import { supabase } from "@/lib/supabase";

export const LAUNCH_KEY = "tasskly_platform_launched";
export const LAUNCH_EVENT = "tasskly_launch_status_changed";

/** Canonical allowlist — only these emails may use the Admin Portal. */
export const ADMIN_EMAILS = [
  "karthikmethuku180@gmail.com",
  "shrikarakarapu@gmail.com",
  "karshikalamvamshi48@gmail.com",
  "karshikalamvamshi34@gmail.com",
  "tasskly@admin.com",
  "admin@tasskly.com",
  "admin@gmail.com",
] as const;

/** Set only after successful Admin Portal password login. */
export const ADMIN_GATE_KEY = "tasskly_admin_gate_verified";
export const ADMIN_GATE_UID_KEY = "tasskly_admin_gate_uid";

export const isAdminGateVerified = (userId?: string | null): boolean => {
  try {
    if (sessionStorage.getItem(ADMIN_GATE_KEY) !== "true") return false;
    if (userId) {
      const gatedUid = sessionStorage.getItem(ADMIN_GATE_UID_KEY);
      if (!gatedUid || gatedUid !== userId) return false;
    }
    return true;
  } catch {
    return false;
  }
};

export const markAdminGateVerified = (userId: string): void => {
  try {
    sessionStorage.setItem(ADMIN_GATE_KEY, "true");
    sessionStorage.setItem(ADMIN_GATE_UID_KEY, userId);
  } catch { /* ignore */ }
  localStorage.removeItem("demoAdminAuth");
};

export const clearAdminGate = (): void => {
  try {
    sessionStorage.removeItem(ADMIN_GATE_KEY);
    sessionStorage.removeItem(ADMIN_GATE_UID_KEY);
  } catch { /* ignore */ }
  localStorage.removeItem("demoAdminAuth");
};

/** Returns true if the platform is launched. Defaults to true to ensure website access on all devices. */
export const getIsPlatformLaunched = (): boolean => {
  try {
    const cached = localStorage.getItem(LAUNCH_KEY);
    if (cached !== null) {
      return cached !== "false";
    }
  } catch { /* ignore */ }
  return true;
};

const broadcastLaunch = (launched: boolean) => {
  try {
    localStorage.setItem(LAUNCH_KEY, launched ? "true" : "false");
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(LAUNCH_EVENT, { detail: { launched } }));
};

/**
 * Saves launch state to backend & Supabase so ALL users/browsers see it.
 * Also updates localStorage immediately for the current session.
 */
export const setPlatformLaunched = async (launched: boolean): Promise<boolean> => {
  // Update localStorage immediately so this device responds instantly
  broadcastLaunch(launched);

  // Try via serverless backend with service role first
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      const res = await fetch("/api/platform-launch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ launched }),
      });
      if (res.ok) {
        return true;
      }
    }
  } catch (e) {
    console.warn("Backend /api/platform-launch sync failed:", e);
  }

  // Persist to Supabase client fallback
  try {
    const { error } = await (supabase as any)
      .from("platform_settings")
      .upsert(
        { key: "is_launched", value: launched ? "true" : "false" },
        { onConflict: "key" }
      );
    if (error) {
      console.warn("Could not save launch state to Supabase:", error.message);
    }
    return true;
  } catch (e) {
    console.warn("Could not save launch state to Supabase:", e);
    return true;
  }
};

/**
 * Reads launch state from backend or Supabase and syncs to localStorage.
 * Call on app mount so all devices get the real server state.
 */
export const syncLaunchStateFromServer = async (): Promise<boolean> => {
  // 1. Try serverless endpoint first
  try {
    const res = await fetch("/api/platform-launch");
    if (res.ok) {
      const json = await res.json();
      if (typeof json.launched === "boolean") {
        broadcastLaunch(json.launched);
        return json.launched;
      }
    }
  } catch { /* fallback to supabase client */ }

  // 2. Direct Supabase query
  try {
    const { data, error } = await (supabase as any)
      .from("platform_settings")
      .select("value")
      .eq("key", "is_launched")
      .maybeSingle();

    if (error || !data) {
      return getIsPlatformLaunched();
    }

    const serverLaunched = data.value !== "false";
    broadcastLaunch(serverLaunched);
    return serverLaunched;
  } catch (e) {
    console.warn("Could not sync launch state:", e);
    return getIsPlatformLaunched();
  }
};

/**
 * Subscribe to Supabase realtime so other browsers update without refresh.
 * Returns an unsubscribe function.
 */
export const subscribeToLaunchState = (onChange: (launched: boolean) => void) => {
  try {
    const channel = (supabase as any)
      .channel("platform_launch_sync")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "platform_settings",
          filter: "key=eq.is_launched",
        },
        (payload: any) => {
          const value = payload?.new?.value ?? payload?.old?.value;
          if (value === undefined) return;
          const launched = value !== "false";
          broadcastLaunch(launched);
          onChange(launched);
        }
      )
      .subscribe();

    return () => {
      try { (supabase as any).removeChannel(channel); } catch { /* ignore */ }
    };
  } catch {
    return () => {};
  }
};

/** Helper to check if an email belongs to an Administrator. */
export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return (ADMIN_EMAILS as readonly string[]).includes(e);
};
