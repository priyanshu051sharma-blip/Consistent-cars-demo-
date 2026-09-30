export interface CustomerSession {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
}

const CUSTOMER_SESSION_KEY = 'cc_customer_session';

export function getCustomerSession(): CustomerSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const direct = window.localStorage.getItem(CUSTOMER_SESSION_KEY);
    if (direct) return JSON.parse(direct) as CustomerSession;

    const cookieValue = document.cookie
      .split('; ')
      .find((entry) => entry.startsWith(`${CUSTOMER_SESSION_KEY}=`));
    if (!cookieValue) return null;
    const encoded = cookieValue.split('=')[1];
    if (!encoded) return null;
    return JSON.parse(decodeURIComponent(encoded)) as CustomerSession;
  } catch {
    return null;
  }
}

export function setCustomerSession(session: CustomerSession): void {
  if (typeof window === 'undefined') return;
  const serialized = encodeURIComponent(JSON.stringify(session));
  document.cookie = `${CUSTOMER_SESSION_KEY}=${serialized}; path=/; max-age=2592000; SameSite=Lax`;
  window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
}

export function clearCustomerSession(): void {
  if (typeof window === 'undefined') return;
  document.cookie = `${CUSTOMER_SESSION_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
}

export function isCustomerLoggedIn(): boolean {
  return Boolean(getCustomerSession());
}
