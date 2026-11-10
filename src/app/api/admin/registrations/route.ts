import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/admin-guard';

// GET /api/admin/registrations — daftar semua pendaftaran untuk dashboard
// petugas (berikut status DASS-21, tindak lanjut, dan jumlah percakapan).
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  }
  try {
    const regs = await db.registration.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        dass21: {
          select: {
            skorDepresi: true,
            skorKecemasan: true,
            skorStres: true,
            katDepresi: true,
            katKecemasan: true,
            katStres: true,
            submittedAt: true,
          },
        },
        followup: true,
        _count: { select: { conversations: true } },
      },
    });

    const data = regs.map((r) => ({
      id: r.id,
      nama: r.nama,
      nim: r.nim,
      kontak: r.kontak,
      jenisLayanan: r.jenisLayanan,
      preferensiHari: r.preferensiHari,
      preferensiWaktu: r.preferensiWaktu,
      keluhan: r.keluhan,
      createdAt: r.createdAt.toISOString(),
      dass21: r.dass21
        ? {
            skorDepresi: r.dass21.skorDepresi,
            skorKecemasan: r.dass21.skorKecemasan,
            skorStres: r.dass21.skorStres,
            katDepresi: r.dass21.katDepresi,
            katKecemasan: r.dass21.katKecemasan,
            katStres: r.dass21.katStres,
            submittedAt: r.dass21.submittedAt.toISOString(),
          }
        : null,
      followup: r.followup
        ? {
            status: r.followup.status,
            catatanPetugas: r.followup.catatanPetugas,
            petugasNama: r.followup.petugasNama,
            updatedAt: r.followup.updatedAt.toISOString(),
          }
        : null,
      conversationCount: r._count.conversations,
    }));

    return NextResponse.json({ registrations: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/admin/registrations GET] error:', message);
    return NextResponse.json({ error: 'Gagal memuat data pendaftaran.' }, { status: 500 });
  }
}
