import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/admin-guard';

// GET /api/admin/stats — ringkasan angka untuk dashboard petugas.
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  }
  try {
    const [totalRegistrations, totalScreened, totalConversations, crisisConversations, followupGroups] =
      await Promise.all([
        db.registration.count(),
        db.dass21Response.count(),
        db.conversation.count(),
        db.conversation.count({ where: { status: { in: ['crisis', 'handoff'] } } }),
        db.followup.groupBy({ by: ['status'], _count: { _all: true } }),
      ]);

    const tindakLanjut: Record<string, number> = {};
    for (const g of followupGroups) tindakLanjut[g.status] = g._count._all;

    return NextResponse.json({
      totalRegistrations,
      totalScreened,
      totalConversations,
      crisisConversations,
      tindakLanjut,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/admin/stats GET] error:', message);
    return NextResponse.json({ error: 'Gagal memuat statistik.' }, { status: 500 });
  }
}
