// Guard untuk endpoint petugas/admin: verifikasi cookie sesi httpOnly.
import { cookies } from 'next/headers';
import { decodeSessionToken, type SessionPayload } from '@/lib/auth';

export const ADMIN_COOKIE = 'upa_admin';

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  return decodeSessionToken(store.get(ADMIN_COOKIE)?.value);
}
