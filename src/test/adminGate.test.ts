import { describe, it, expect, beforeEach } from "vitest";
import {
  isAdminGateVerified,
  markAdminGateVerified,
  clearAdminGate,
  ADMIN_GATE_KEY,
  ADMIN_GATE_UID_KEY,
} from "@/utils/launchControl";

describe("admin gate verification", () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("returns false until a matching admin gate is explicitly marked", () => {
    expect(isAdminGateVerified("user-123")).toBe(false);
    expect(sessionStorage.getItem(ADMIN_GATE_KEY)).toBeNull();
  });

  it("accepts an admin gate only for the matching verified user id", () => {
    markAdminGateVerified("user-123");

    expect(isAdminGateVerified("user-123")).toBe(true);
    expect(isAdminGateVerified("user-456")).toBe(false);
  });

  it("clears the gate state when a user signs out or resets the admin panel", () => {
    markAdminGateVerified("user-123");
    clearAdminGate();

    expect(isAdminGateVerified("user-123")).toBe(false);
    expect(sessionStorage.getItem(ADMIN_GATE_KEY)).toBeNull();
    expect(sessionStorage.getItem(ADMIN_GATE_UID_KEY)).toBeNull();
  });
});
