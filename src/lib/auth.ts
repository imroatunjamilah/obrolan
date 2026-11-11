// Port dari app/security.py (proyek riset UPA BK UTM) ke Node crypto.
//
// Prinsip:
// - Password DIHASH dengan PBKDF2-SHA256 (salt acak per user) - tidak pernah plain.
// - Token sesi admin = payload JSON bertanda tangan HMAC-SHA256 (stateless,
//   bermasa aktif), dikirim sebagai cookie httpOnly.
// - Token obrolan mahasiswa = HMAC dari SECRET_KEY terhadap registrationId,
//   sehingga mahasiswa hanya dapat mengakses data miliknya sendiri.
// - Tidak ada password/API key yang ditulis ke log.

import { createHmac, pbkdf2, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const pbkdf2Async = promisify(pbkdf2);

const PBKDF2_ITERATIONS = 390_000; // rekomendasi OWASP untuk PBKDF2-SHA256

function secretKey(): string {
  return process.env.SECRET_KEY || 'dev-secret-key-CHANGE-ME-please';
}

// ---------------------------------------------------------------- password

/** Format kompatibel dengan Python: pbkdf2_sha256$<iters>$<salt_b64>$<hash_b64> */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const dk = await pbkdf2Async(password, salt, PBKDF2_ITERATIONS, 32, 'sha256');
  return [
    'pbkdf2_sha256',
    String(PBKDF2_ITERATIONS),
    salt.toString('base64'),
    dk.toString('base64'),
  ].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [, itersStr, saltB64, hashB64] = stored.split('$');
    const iters = parseInt(itersStr, 10);
    if (!Number.isFinite(iters) || iters <= 0) return false;
    const dk = await pbkdf2Async(
      password,
      Buffer.from(saltB64, 'base64'),
      iters,
      Buffer.from(hashB64, 'base64').length,
      'sha256'
    );
    const expected = Buffer.from(hashB64, 'base64');
    return dk.length === expected.length && timingSafeEqual(dk, expected);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- token mahasiswa

/** HMAC-SHA256( SECRET_KEY, "chat-access:<registrationId>" ) — 32 char hex. */
export function makeChatToken(registrationId: string): string {
  return createHmac('sha256', secretKey())
    .update(`chat-access:${registrationId}`)
    .digest('hex')
    .slice(0, 32);
}

export function verifyChatToken(registrationId: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const expected = makeChatToken(registrationId);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(token, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------------------------------------------------------------- token sesi admin

function b64e(data: Buffer | string): string {
  return Buffer.from(data).toString('base64url');
}

function b64d(data: string): Buffer {
  return Buffer.from(data, 'base64url');
}

function sign(payload: string): string {
  return b64e(createHmac('sha256', secretKey()).update(payload).digest());
}

export class TokenError extends Error {}

export function createSessionToken(
  username: string,
  role: string,
  expiresMinutes = Number(process.env.TOKEN_EXPIRE_MINUTES || 480)
): string {
  const exp = Math.floor(Date.now() / 1000) + expiresMinutes * 60;
  const payload = JSON.stringify({ sub: username, role, exp });
  const body = b64e(payload);
  return `${body}.${sign(body)}`;
}

export interface SessionPayload {
  sub: string;
  role: string;
  exp: number;
}

export function decodeSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload), 'utf8');
  const received = Buffer.from(signature, 'utf8');
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const data = JSON.parse(b64d(payload).toString('utf8')) as SessionPayload;
    if (typeof data.exp !== 'number' || data.exp * 1000 < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
