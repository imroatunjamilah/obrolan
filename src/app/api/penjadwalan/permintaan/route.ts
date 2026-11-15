/**
 * API modul KP — daftar & pengajuan permintaan konseling.
 * GET  : daftar permintaan + daftar konselor (data dummy).
 * POST : ajukan permintaan baru → langsung diklasifikasi (TF-IDF + model
 *        terbaik) dan diberi usulan slot dari penjadwal Greedy.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getEngine } from '@/lib/penjadwalan/klasifikasi';
import { jalankanGreedy, type ItemPermintaan } from '@/lib/penjadwalan/penjadwalan';
import { ensureSeed } from '@/lib/penjadwalan/seed';

export const dynamic = 'force-dynamic';

function parseJsonArray(s: string | null | undefined): string[] {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function parseJsonObject(s: string | null | undefined): Record<string, number> {
  if (!s) return {};
  try {
    const v = JSON.parse(s);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}

async function bookingTerpasang() {
  const baris = await db.permintaanKonseling.findMany({
    where: { status: { in: ['terjadwal', 'selesai'] }, jadwalTanggal: { not: null }, konselorId: { not: null } },
    select: { jadwalTanggal: true, jadwalSesi: true, konselorId: true },
  });
  return baris
    .filter((b) => b.jadwalTanggal && b.jadwalSesi && b.konselorId)
    .map((b) => ({
      tanggal: b.jadwalTanggal as string,
      sesi: b.jadwalSesi as string,
      konselorId: b.konselorId as string,
    }));
}

export async function GET() {
  await ensureSeed();
  const [permintaan, konselor] = await Promise.all([
    db.permintaanKonseling.findMany({ include: { konselor: true }, orderBy: { createdAt: 'desc' } }),
    db.konselor.findMany({ where: { isActive: true }, orderBy: { nama: 'asc' } }),
  ]);
  return NextResponse.json({
    permintaan: permintaan.map((p) => ({
      id: p.id,
      nama: p.nama,
      nim: p.nim,
      prodi: p.prodi,
      kontak: p.kontak,
      keluhan: p.keluhan,
      prefHari: parseJsonArray(p.prefHari),
      prefSesi: parseJsonArray(p.prefSesi),
      prioritas: p.prioritas,
      confidence: p.confidence,
      modelDigunakan: p.modelDigunakan,
      skorKelas: parseJsonObject(p.skorKelas),
      kataKunci: parseJsonArray(p.kataKunci),
      status: p.status,
      jadwalTanggal: p.jadwalTanggal,
      jadwalHari: p.jadwalHari,
      jadwalSesi: p.jadwalSesi,
      konselorId: p.konselorId,
      konselorNama: p.konselor?.nama ?? null,
      catatanPetugas: p.catatanPetugas,
      createdAt: p.createdAt,
    })),
    konselor: konselor.map((k) => ({
      id: k.id,
      nama: k.nama,
      spesialisasi: k.spesialisasi,
      kuotaHarian: k.kuotaHarian,
    })),
  });
}

export async function POST(request: Request) {
  await ensureSeed();
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body bukan JSON valid.' }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const nama = typeof b.nama === 'string' ? b.nama.trim() : '';
  const nim = typeof b.nim === 'string' ? b.nim.trim() : '';
  const prodi = typeof b.prodi === 'string' ? b.prodi.trim() : '';
  const kontak = typeof b.kontak === 'string' ? b.kontak.trim() : '';
  const keluhan = typeof b.keluhan === 'string' ? b.keluhan.trim() : '';
  const prefHari = Array.isArray(b.prefHari) ? b.prefHari.filter((x): x is string => typeof x === 'string') : [];
  const prefSesi = Array.isArray(b.prefSesi) ? b.prefSesi.filter((x): x is string => typeof x === 'string') : [];

  if (!nama || !nim || !prodi || !keluhan) {
    return NextResponse.json(
      { error: 'Nama, NIM, program studi, dan keluhan wajib diisi.' },
      { status: 400 }
    );
  }
  if (keluhan.length < 10) {
    return NextResponse.json(
      { error: 'Tulis keluhan minimal 10 karakter agar dapat diklasifikasi.' },
      { status: 400 }
    );
  }

  // 1) Klasifikasi urgensi.
  const engine = getEngine();
  const hasil = engine.klasifikasi(keluhan);

  // 2) Simpan permintaan (status menunggu konfirmasi petugas).
  const dibuat = await db.permintaanKonseling.create({
    data: {
      nama,
      nim,
      prodi,
      kontak,
      keluhan,
      prefHari: JSON.stringify(prefHari),
      prefSesi: JSON.stringify(prefSesi),
      prioritas: hasil.prioritas,
      confidence: hasil.confidence,
      modelDigunakan: hasil.modelDigunakan,
      skorKelas: JSON.stringify(hasil.skorKelas),
      kataKunci: JSON.stringify(hasil.kataKunci),
      status: 'menunggu',
    },
  });

  // 3) Usulan slot awal dari Greedy (terhadap slot yang sudah terpasang).
  const konselorList = await db.konselor.findMany({ where: { isActive: true }, orderBy: { nama: 'asc' } });
  const item: ItemPermintaan = {
    id: dibuat.id,
    nama,
    prioritas: hasil.prioritas,
    prefHari,
    prefSesi,
    createdAt: dibuat.createdAt.toISOString(),
  };
  const greedy = jalankanGreedy({
    permintaan: [item],
    konselor: konselorList.map((k) => ({ id: k.id, nama: k.nama, kuotaHarian: k.kuotaHarian })),
    bookingAda: await bookingTerpasang(),
    hariIni: new Date(),
  });
  const usulan = greedy.penugasan[0] ?? null;

  return NextResponse.json(
    {
      permintaan: {
        id: dibuat.id,
        nama,
        nim,
        prodi,
        keluhan,
        prefHari,
        prefSesi,
        status: dibuat.status,
        createdAt: dibuat.createdAt,
      },
      klasifikasi: {
        prioritas: hasil.prioritas,
        confidence: hasil.confidence,
        modelDigunakan: hasil.modelDigunakan,
        skorKelas: hasil.skorKelas,
        kataKunci: hasil.kataKunci,
        prediksiPerModel: hasil.prediksiPerModel,
      },
      usulanJadwal: usulan
        ? {
            tanggal: usulan.tanggal,
            hari: usulan.hari,
            sesi: usulan.sesi,
            konselorNama: usulan.konselorNama,
            melanggarPreferensi: usulan.melanggarPreferensi,
            tungguHari: usulan.tungguHari,
          }
        : null,
      pesan:
        hasil.prioritas === 'DARURAT'
          ? 'Kasus ini terdeteksi DARURAT — petugas UPA BK akan menghubungi Anda sesegera mungkin (≤ 48 jam). Bila ada risiko segera, hubungi 112 / 119 ext. 8.'
          : 'Pengajuan diterima. Petugas UPA BK akan mengonfirmasi jadwal Anda.',
    },
    { status: 201 }
  );
}
