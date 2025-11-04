// utils/auth.tsx
export const ADMIN_KEY = "cc_isAdmin";

export function isAdminLoggedIn(): boolean {
  try {
    return localStorage.getItem(ADMIN_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAdminLoggedIn(v: boolean) {
  try {
    localStorage.setItem(ADMIN_KEY, v ? "true" : "false");
  } catch {}
}

export function clearAdminAuth() {
  try {
    localStorage.removeItem(ADMIN_KEY);
  } catch {}
}
