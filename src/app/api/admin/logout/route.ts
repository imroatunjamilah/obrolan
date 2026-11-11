import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin-guard';

// POST /api/admin/logout — hapus cookie sesi.
export async function POST() {
  const res = NextResponse.json({ status: 'keluar' });
  res.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
