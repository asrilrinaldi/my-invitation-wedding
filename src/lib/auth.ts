import crypto from 'crypto';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'asrilsisi2027';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'asril-sisi-wedding-admin-secret-token-key-2027';

export const SESSION_COOKIE_NAME = 'admin_session';

export function validateAdminCredentials(user: string, pass: string): boolean {
  if (!user || !pass) return false;
  return user.trim() === ADMIN_USERNAME.trim() && pass === ADMIN_PASSWORD;
}

export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', ADMIN_SECRET).update(`${ADMIN_USERNAME}:${timestamp}`).digest('hex');
  return `${timestamp}.${hmac}`;
}

export function verifySessionToken(token?: string | null): boolean {
  if (!token) return false;
  try {
    const [timestamp, hash] = token.split('.');
    if (!timestamp || !hash) return false;

    // Check expiration (e.g., valid for 7 days)
    const age = Date.now() - parseInt(timestamp, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (isNaN(age) || age < 0 || age > maxAge) return false;

    const expectedHash = crypto.createHmac('sha256', ADMIN_SECRET).update(`${ADMIN_USERNAME}:${timestamp}`).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch (err) {
    return false;
  }
}
