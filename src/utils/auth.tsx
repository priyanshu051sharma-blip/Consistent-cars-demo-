// utils/auth.tsx
export const ADMIN_KEY = "cc_isAdmin";

export function isAdminLoggedIn(): boolean {
  try {
    if (typeof document !== 'undefined') {
      const cookie = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith('cc_admin_session='));
      if (cookie) {
        return decodeURIComponent(cookie.split('=')[1] || '') === 'true';
      }
    }
    return localStorage.getItem(ADMIN_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAdminLoggedIn(v: boolean) {
  try {
    localStorage.setItem(ADMIN_KEY, v ? "true" : "false");
    if (typeof document !== 'undefined') {
      document.cookie = `cc_admin_session=${encodeURIComponent(v ? 'true' : 'false')}; path=/; max-age=28800; SameSite=Lax`;
    }
  } catch { }
}

export function clearAdminAuth() {
  try {
    localStorage.removeItem(ADMIN_KEY);
    if (typeof document !== 'undefined') {
      document.cookie = 'cc_admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    }
  } catch { }
}

export const logoutAdmin = clearAdminAuth;
