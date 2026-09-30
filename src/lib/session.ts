import crypto from 'crypto';

const SESSION_SECRET = process.env.CUSTOMER_SESSION_SECRET || process.env.JWT_SECRET || 'consistent-cars-local-dev-secret';

export function signSessionPayload(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(json).digest('hex');
  return Buffer.from(`${json}.${signature}`).toString('base64url');
}

export function verifySessionPayload(rawValue: string | undefined) {
  if (!rawValue) return null;

  try {
    const decoded = Buffer.from(rawValue, 'base64url').toString('utf8');
    const separatorIndex = decoded.lastIndexOf('.');
    if (separatorIndex < 0) return null;

    const payload = decoded.slice(0, separatorIndex);
    const expectedSignature = decoded.slice(separatorIndex + 1);
    const actualSignature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(actualSignature), Buffer.from(expectedSignature))) {
      return null;
    }

    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getSessionCookieValue(cookieHeader: string | undefined): Record<string, unknown> | null {
  if (!cookieHeader) return null;

  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((entry) => entry.startsWith('cc_customer_session='));

  if (!match) return null;

  const encoded = match.slice('cc_customer_session='.length);
  return verifySessionPayload(encoded);
}
