import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/admin-guard';

// GET /api/admin/registrations/[id] — detail lengkap satu pendaftaran:
// data diri, jawaban + skor DASS-21 (hanya petugas), semua percakapan
// (termasuk pesan "sistem" = penanda audit eskalasi), dan tindak lanjut.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const r = await db.registration.findUnique({
      where: { id },
      include: {
        dass21: true,
        followup: true,
        conversations: {
          orderBy: { updatedAt: 'desc' },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        },
      },
    });
    if (!r) {
      return NextResponse.json({ error: 'Pendaftaran tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({
      registration: {
        id: r.id,
        nama: r.nama,
        nim: r.nim,
        kontak: r.kontak,
        jenisLayanan: r.jenisLayanan,
        preferensiHari: r.preferensiHari,
        preferensiWaktu: r.preferensiWaktu,
        keluhan: r.keluhan,
        consentStatus: r.consentStatus,
        createdAt: r.createdAt.toISOString(),
      },
      dass21: r.dass21
        ? {
            jawaban: JSON.parse(r.dass21.jawaban) as number[],
            skorDepresi: r.dass21.skorDepresi,
            skorKecemasan: r.dass21.skorKecemasan,
            skorStres: r.dass21.skorStres,
            katDepresi: r.dass21.katDepresi,
            katKecemasan: r.dass21.katKecemasan,
            katStres: r.dass21.katStres,
            scoringVersion: r.dass21.scoringVersion,
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
      conversations: r.conversations.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        updatedAt: c.updatedAt.toISOString(),
        messages: c.messages.map((m) => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          createdAt: m.createdAt.toISOString(),
        })),
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/admin/registrations/:id GET] error:', message);
    return NextResponse.json({ error: 'Gagal memuat detail pendaftaran.' }, { status: 500 });
  }
}
