export const LAUNCH_KEY = "tasskly_platform_launched";
export const LAUNCH_EVENT = "tasskly_launch_status_changed";

/**
 * Returns true if the admin has published/launched the platform to the public.
 * Default is false (Under Development Mode).
 */
export const getIsPlatformLaunched = (): boolean => {
  return localStorage.getItem(LAUNCH_KEY) === "true";
};

/**
 * Updates platform launch state and dispatches a global event for live reactivity.
 */
export const setPlatformLaunched = (launched: boolean): void => {
  localStorage.setItem(LAUNCH_KEY, launched ? "true" : "false");
  window.dispatchEvent(new CustomEvent(LAUNCH_EVENT, { detail: { launched } }));
};

/**
 * Helper to check if an email belongs to an Administrator.
 */
export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  const e = email.toLowerCase().trim();
  const adminEmails = [
    "tasskly@admin.com",
    "karthikmethuku180@gmail.com",
    "shrikarakarapu@gmail.com"
  ];
  return adminEmails.includes(e);
};
