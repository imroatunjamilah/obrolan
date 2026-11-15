/**
 * API modul KP — mesin penjadwalan Greedy.
 * GET  : simulasi (dry-run) atas seluruh permintaan "menunggu" —
 *        mengembalikan usulan + metrik tanpa menulis ke database.
 * POST : jalankan penjadwalan nyata — semua hasil Greedy dipersist
 *        (status → terjadwal), mengembalikan ringkasan + metrik.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jalankanGreedy, type ItemPermintaan } from '@/lib/penjadwalan/penjadwalan';
import { ensureSeed } from '@/lib/penjadwalan/seed';

export const dynamic = 'force-dynamic';

async function siapkanInput() {
  await ensureSeed();
  const [konselorList, menunggu, terpasang] = await Promise.all([
    db.konselor.findMany({ where: { isActive: true }, orderBy: { nama: 'asc' } }),
    db.permintaanKonseling.findMany({ where: { status: 'menunggu' }, orderBy: { createdAt: 'asc' } }),
    db.permintaanKonseling.findMany({
      where: { status: { in: ['terjadwal', 'selesai'] }, jadwalTanggal: { not: null }, konselorId: { not: null } },
      select: { jadwalTanggal: true, jadwalSesi: true, konselorId: true },
    }),
  ]);

  const permintaan: ItemPermintaan[] = menunggu.map((p) => {
    let prefHari: string[] = [];
    let prefSesi: string[] = [];
    try {
      const h = JSON.parse(p.prefHari);
      if (Array.isArray(h)) prefHari = h.filter((x) => typeof x === 'string');
    } catch {}
    try {
      const s = JSON.parse(p.prefSesi);
      if (Array.isArray(s)) prefSesi = s.filter((x) => typeof x === 'string');
    } catch {}
    return {
      id: p.id,
      nama: p.nama,
      prioritas: p.prioritas as ItemPermintaan['prioritas'],
      prefHari,
      prefSesi,
      createdAt: p.createdAt.toISOString(),
    };
  });

  const bookingAda = terpasang
    .filter((b) => b.jadwalTanggal && b.jadwalSesi && b.konselorId)
    .map((b) => ({
      tanggal: b.jadwalTanggal as string,
      sesi: b.jadwalSesi as string,
      konselorId: b.konselorId as string,
    }));

  return { permintaan, bookingAda, konselorList };
}

export async function GET() {
  const { permintaan, bookingAda, konselorList } = await siapkanInput();
  const hasil = jalankanGreedy({
    permintaan,
    konselor: konselorList.map((k) => ({ id: k.id, nama: k.nama, kuotaHarian: k.kuotaHarian })),
    bookingAda,
    hariIni: new Date(),
  });
  return NextResponse.json({
    mode: 'simulasi',
    permintaanDiproses: permintaan.length,
    ...hasil,
  });
}

export async function POST() {
  const { permintaan, bookingAda, konselorList } = await siapkanInput();
  if (permintaan.length === 0) {
    return NextResponse.json({ ok: true, pesan: 'Tidak ada permintaan berstatus menunggu.', ...jalankanGreedy({ permintaan: [], konselor: [], bookingAda: [], hariIni: new Date() }) });
  }

  const hasil = jalankanGreedy({
    permintaan,
    konselor: konselorList.map((k) => ({ id: k.id, nama: k.nama, kuotaHarian: k.kuotaHarian })),
    bookingAda,
    hariIni: new Date(),
  });

  // Persist semua penugasan.
  for (const p of hasil.penugasan) {
    await db.permintaanKonseling.update({
      where: { id: p.id },
      data: {
        status: 'terjadwal',
        jadwalTanggal: p.tanggal,
        jadwalHari: p.hari,
        jadwalSesi: p.sesi,
        konselorId: p.konselorId,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    pesan:
      hasil.penugasan.length === 0
        ? 'Tidak ada slot yang dapat dialokasikan.'
        : `${hasil.penugasan.length} permintaan terjadwal, ${hasil.gagal.length} belum terjadwal, ${hasil.metrik.konflikSlot} konflik slot.`,
    mode: 'eksekusi',
    ...hasil,
  });
}
