/**
 * API modul KP — aksi petugas atas satu permintaan.
 * PATCH  : aksi = jadwalkan (atur slot manual dengan validasi bentrok &
 *          kuota), tolak, selesai, buka-kembali ke menunggu.
 * DELETE : hapus permintaan (untuk reset demo).
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

type Aksi = 'jadwalkan' | 'tolak' | 'selesai' | 'buka';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body bukan JSON valid.' }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const aksi = typeof b.aksi === 'string' ? (b.aksi as Aksi) : null;

  const item = await db.permintaanKonseling.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: 'Permintaan tidak ditemukan.' }, { status: 404 });

  if (aksi === 'jadwalkan') {
    const tanggal = typeof b.tanggal === 'string' ? b.tanggal : '';
    const sesi = typeof b.sesi === 'string' ? b.sesi : '';
    const konselorId = typeof b.konselorId === 'string' ? b.konselorId : '';
    if (!tanggal || !sesi || !konselorId) {
      return NextResponse.json({ error: 'Tanggal, sesi, dan konselor wajib dipilih.' }, { status: 400 });
    }
    const konselor = await db.konselor.findUnique({ where: { id: konselorId } });
    if (!konselor) return NextResponse.json({ error: 'Konselor tidak ditemukan.' }, { status: 400 });

    // Validasi anti-bentrok: slot konselor unik.
    const bentrok = await db.permintaanKonseling.findFirst({
      where: {
        id: { not: id },
        status: { in: ['terjadwal', 'selesai'] },
        jadwalTanggal: tanggal,
        jadwalSesi: sesi,
        konselorId,
      },
    });
    if (bentrok) {
      return NextResponse.json(
        { error: `Slot ${sesi} konselor tersebut pada tanggal itu sudah terisi (oleh ${bentrok.nama}).` },
        { status: 409 }
      );
    }
    // Validasi kuota harian konselor.
    const terpakai = await db.permintaanKonseling.count({
      where: {
        id: { not: id },
        status: { in: ['terjadwal', 'selesai'] },
        jadwalTanggal: tanggal,
        konselorId,
      },
    });
    if (terpakai >= konselor.kuotaHarian) {
      return NextResponse.json(
        { error: `Kuota harian ${konselor.nama} (${konselor.kuotaHarian} sesi/hari) sudah penuh pada tanggal itu.` },
        { status: 409 }
      );
    }

    const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const d = new Date(tanggal + 'T00:00:00');
    const diperbarui = await db.permintaanKonseling.update({
      where: { id },
      data: {
        status: 'terjadwal',
        jadwalTanggal: tanggal,
        jadwalHari: namaHari[d.getDay()] ?? null,
        jadwalSesi: sesi,
        konselorId,
        catatanPetugas: typeof b.catatan === 'string' ? b.catatan : item.catatanPetugas,
      },
    });
    return NextResponse.json({ ok: true, permintaan: { id: diperbarui.id, status: diperbarui.status } });
  }

  if (aksi === 'tolak') {
    const diperbarui = await db.permintaanKonseling.update({
      where: { id },
      data: {
        status: 'ditolak',
        catatanPetugas: typeof b.catatan === 'string' && b.catatan.trim() ? b.catatan.trim() : 'Ditolak oleh petugas.',
        jadwalTanggal: null,
        jadwalHari: null,
        jadwalSesi: null,
        konselorId: null,
      },
    });
    return NextResponse.json({ ok: true, permintaan: { id: diperbarui.id, status: diperbarui.status } });
  }

  if (aksi === 'selesai') {
    const diperbarui = await db.permintaanKonseling.update({
      where: { id },
      data: { status: 'selesai' },
    });
    return NextResponse.json({ ok: true, permintaan: { id: diperbarui.id, status: diperbarui.status } });
  }

  if (aksi === 'buka') {
    const diperbarui = await db.permintaanKonseling.update({
      where: { id },
      data: {
        status: 'menunggu',
        jadwalTanggal: null,
        jadwalHari: null,
        jadwalSesi: null,
        konselorId: null,
        catatanPetugas: null,
      },
    });
    return NextResponse.json({ ok: true, permintaan: { id: diperbarui.id, status: diperbarui.status } });
  }

  return NextResponse.json({ error: 'Aksi tidak dikenal.' }, { status: 400 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await db.permintaanKonseling.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Permintaan tidak ditemukan.' }, { status: 404 });
  }
}
