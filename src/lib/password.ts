import crypto from 'crypto';

const PASSWORD_ITERATIONS = 120000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  if (!passwordHash || typeof passwordHash !== 'string') return false;
  const [salt, hash] = passwordHash.split(':');
  if (!salt || !hash) return false;
  const generated = crypto.pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, KEY_LENGTH, DIGEST).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(generated), Buffer.from(hash));
}
