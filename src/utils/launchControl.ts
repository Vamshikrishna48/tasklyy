import { supabase } from "@/lib/supabase";
import { getApiUrl } from "@/lib/api";

export const LAUNCH_KEY = "tasskly_platform_launched";
export const LAUNCH_EVENT = "tasskly_launch_status_changed";

/** Canonical allowlist — only these emails may use the Admin Portal. */
export const ADMIN_EMAILS = [
  "karthikmethuku180@gmail.com",
  "shrikarakarapu@gmail.com",
  "karshikalamvamshi34@gmail.com",
] as const;

/** Set only after successful Admin Portal password login — prevents session auto-bypass. */
export const ADMIN_GATE_KEY = "tasskly_admin_gate_verified";

export const isAdminGateVerified = (): boolean => {
  try {
    return sessionStorage.getItem(ADMIN_GATE_KEY) === "true";
  } catch {
    return false;
  }
};

export const markAdminGateVerified = (): void => {
  try {
    sessionStorage.setItem(ADMIN_GATE_KEY, "true");
  } catch {
    /* ignore */
  }
  localStorage.removeItem("demoAdminAuth");
};

export const clearAdminGate = (): void => {
  try {
    sessionStorage.removeItem(ADMIN_GATE_KEY);
  } catch {
    /* ignore */
  }
  localStorage.removeItem("demoAdminAuth");
};

/**
 * Returns true if the admin has published/launched the platform to the public.
 * Reads from localStorage (populated from server on load).
 */
export const getIsPlatformLaunched = (): boolean => {
  return localStorage.getItem(LAUNCH_KEY) === "true";
};

const broadcastLaunch = (launched: boolean) => {
  localStorage.setItem(LAUNCH_KEY, launched ? "true" : "false");
  window.dispatchEvent(new CustomEvent(LAUNCH_EVENT, { detail: { launched } }));
};

/**
 * Updates platform launch state on the server (API + Supabase) and localStorage,
 * then dispatches a global event for live reactivity on this device.
 * Other devices pick this up via syncLaunchStateFromServer / realtime / polling.
 */
export const setPlatformLaunched = async (launched: boolean): Promise<boolean> => {
  let persisted = false;

  // 1. Prefer serverless API (service role) so all devices see the same value
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      const res = await fetch(getApiUrl("/api/platform-launch"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ launched }),
      });
      if (res.ok) {
        persisted = true;
      } else {
        const errBody = await res.json().catch(() => ({}));
        console.warn("platform-launch API failed:", errBody);
      }
    }
  } catch (e) {
    console.warn("platform-launch API unreachable:", e);
  }

  // 2. Also write via client Supabase (fallback / local projects)
  try {
    const { error } = await (supabase as any)
      .from("platform_settings")
      .upsert(
        { key: "is_launched", value: launched ? "true" : "false" },
        { onConflict: "key" }
      );
    if (!error) persisted = true;
    else console.warn("Could not persist launch state to Supabase:", error.message);
  } catch (e) {
    console.warn("Could not persist launch state to Supabase:", e);
  }

  // 3. Always update local device immediately
  broadcastLaunch(launched);
  return persisted;
};

/**
 * Fetches launch state from API / Supabase and syncs it to localStorage.
 * Call on app boot and periodically so other devices see Launch Website.
 */
export const syncLaunchStateFromServer = async (): Promise<boolean> => {
  // Prefer API (readable by all devices without RLS issues)
  try {
    const res = await fetch(getApiUrl("/api/platform-launch"), { method: "GET" });
    if (res.ok) {
      const body = await res.json();
      const serverLaunched = !!body.launched;
      broadcastLaunch(serverLaunched);
      return serverLaunched;
    }
  } catch (e) {
    console.warn("platform-launch GET failed, trying Supabase:", e);
  }

  try {
    const { data } = await (supabase as any)
      .from("platform_settings")
      .select("value")
      .eq("key", "is_launched")
      .maybeSingle();

    const serverLaunched = data?.value === "true";
    broadcastLaunch(serverLaunched);
    return serverLaunched;
  } catch (e) {
    console.warn("Could not sync launch state from server:", e);
    return getIsPlatformLaunched();
  }
};

/**
 * Subscribe to platform_settings changes so other browsers update without refresh.
 */
export const subscribeToLaunchState = (onChange: (launched: boolean) => void) => {
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
    try {
      (supabase as any).removeChannel(channel);
    } catch {
      /* ignore */
    }
  };
};

/** Helper to check if an email belongs to an Administrator. */
export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  return (ADMIN_EMAILS as readonly string[]).includes(e);
};
