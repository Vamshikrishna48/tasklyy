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

/** Returns true if the platform is launched (from localStorage cache). */
export const getIsPlatformLaunched = (): boolean => {
  return localStorage.getItem(LAUNCH_KEY) === "true";
};

const broadcastLaunch = (launched: boolean) => {
  localStorage.setItem(LAUNCH_KEY, launched ? "true" : "false");
  window.dispatchEvent(new CustomEvent(LAUNCH_EVENT, { detail: { launched } }));
};

/**
 * Saves launch state to Supabase so ALL users/browsers see it.
 * Also updates localStorage immediately for the current session.
 */
export const setPlatformLaunched = async (launched: boolean): Promise<boolean> => {
  // Update localStorage immediately so this device responds instantly
  broadcastLaunch(launched);

  // Persist to Supabase so other devices/browsers see the change
  try {
    const { error } = await (supabase as any)
      .from("platform_settings")
      .upsert(
        { key: "is_launched", value: launched ? "true" : "false" },
        { onConflict: "key" }
      );
    if (error) {
      console.warn("Could not save launch state to Supabase:", error.message);
      // Still return true because localStorage is updated
    }
    return true;
  } catch (e) {
    console.warn("Could not save launch state to Supabase:", e);
    return true; // localStorage is already updated
  }
};

/**
 * Reads launch state from Supabase and syncs to localStorage.
 * Call on app mount so all devices get the real server state.
 */
export const syncLaunchStateFromServer = async (): Promise<boolean> => {
  try {
    const { data, error } = await (supabase as any)
      .from("platform_settings")
      .select("value")
      .eq("key", "is_launched")
      .maybeSingle();

    if (error) {
      // Table may not exist yet — default to not launched
      console.warn("platform_settings table not accessible:", error.message);
      return getIsPlatformLaunched();
    }

    const serverLaunched = data?.value === "true";
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
          const launched = value === "true";
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
