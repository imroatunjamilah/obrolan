import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createSessionToken } from '@/lib/auth';
import { ADMIN_COOKIE } from '@/lib/admin-guard';

// POST /api/admin/login — autentikasi akun internal (admin/petugas UPA BK).
// Sesi = cookie httpOnly bertanda tangan HMAC (stateless, bermasa aktif).
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = typeof body.username === 'string' ? body.username.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password) {
      return NextResponse.json({ error: 'Username dan password wajib diisi.' }, { status: 422 });
    }

    const user = await db.adminUser.findUnique({ where: { username } });
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Username atau password salah, atau akun tidak aktif.' },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Username atau password salah.' }, { status: 401 });
    }

    const token = createSessionToken(user.username, user.role);
    const res = NextResponse.json({
      username: user.username,
      role: user.role,
      namaLengkap: user.namaLengkap,
    });
    res.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: Number(process.env.TOKEN_EXPIRE_MINUTES || 480) * 60,
    });
    return res;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/admin/login POST] error:', message);
    return NextResponse.json({ error: 'Login gagal.' }, { status: 500 });
  }
}
