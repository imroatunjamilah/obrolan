import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/admin-guard';
import { FOLLOWUP_STATUSES } from '@/lib/layanan';

// PATCH /api/admin/registrations/[id]/followup — perbarui status tindak
// lanjut, catatan petugas, dan/atau nama petugas penangani.
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Tidak diizinkan.' }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();

    const data: { status?: string; catatanPetugas?: string | null; petugasNama?: string | null } = {};

    if (body.status !== undefined) {
      if (!(FOLLOWUP_STATUSES as readonly string[]).includes(body.status)) {
        return NextResponse.json({ error: 'Status tindak lanjut tidak dikenal.' }, { status: 422 });
      }
      data.status = body.status;
    }
    if (body.catatanPetugas !== undefined) {
      const catatan = typeof body.catatanPetugas === 'string' ? body.catatanPetugas.trim() : '';
      if (catatan.length > 4000) {
        return NextResponse.json({ error: 'Catatan maksimal 4000 karakter.' }, { status: 422 });
      }
      data.catatanPetugas = catatan || null;
    }
    if (body.petugasNama !== undefined) {
      const nama = typeof body.petugasNama === 'string' ? body.petugasNama.trim() : '';
      if (nama.length > 120) {
        return NextResponse.json({ error: 'Nama petugas maksimal 120 karakter.' }, { status: 422 });
      }
      data.petugasNama = nama || null;
    }

    const followup = await db.followup.update({
      where: { registrationId: id },
      data,
    });

    return NextResponse.json({
      status: followup.status,
      catatanPetugas: followup.catatanPetugas,
      petugasNama: followup.petugasNama,
      updatedAt: followup.updatedAt.toISOString(),
    });
  } catch (err: unknown) {
    const code = typeof (err as { code?: string }).code === 'string' ? (err as { code: string }).code : '';
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Pendaftaran tidak ditemukan.' }, { status: 404 });
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/admin/registrations/:id/followup PATCH] error:', message);
    return NextResponse.json({ error: 'Gagal memperbarui tindak lanjut.' }, { status: 500 });
  }
}
