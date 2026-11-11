import { NextResponse } from 'next/server';
import { getSession } from '@/lib/admin-guard';

// GET /api/admin/me — info sesi petugas/admin yang sedang login.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({
    authenticated: true,
    username: session.sub,
    role: session.role,
  });
}
