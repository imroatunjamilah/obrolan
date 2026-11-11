import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { makeChatToken } from '@/lib/auth';
import { JENIS_LAYANAN, HARI, WAKTU } from '@/lib/layanan';

// POST /api/registrations — pendaftaran layanan konseling oleh mahasiswa
// (tanpa akun). Setiap pendaftaran otomatis membuat baris tindak lanjut
// (menunggu_ditinjau) dan chat_token yang menjadi "kunci akses" mahasiswa
// atas data skrining/obrolannya sendiri.
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const nama = typeof body.nama === 'string' ? body.nama.trim() : '';
    const nim = typeof body.nim === 'string' ? body.nim.trim() : '';
    const kontak = typeof body.kontak === 'string' ? body.kontak.trim() : '';
    const jenisLayanan = typeof body.jenisLayanan === 'string' ? body.jenisLayanan : '';
    const preferensiHari = typeof body.preferensiHari === 'string' ? body.preferensiHari : '';
    const preferensiWaktu = typeof body.preferensiWaktu === 'string' ? body.preferensiWaktu : '';
    const keluhan = typeof body.keluhan === 'string' ? body.keluhan.trim() : '';
    const consent = body.setujuPenggunaanData === true;

    if (nama.length < 2 || nama.length > 120) {
      return NextResponse.json({ error: 'Nama wajib diisi (2-120 karakter).' }, { status: 422 });
    }
    if (nim.length < 4 || nim.length > 30) {
      return NextResponse.json({ error: 'NIM wajib diisi (4-30 karakter).' }, { status: 422 });
    }
    if (kontak.length < 5 || kontak.length > 120) {
      return NextResponse.json({ error: 'Kontak wajib diisi (5-120 karakter).' }, { status: 422 });
    }
    if (!(JENIS_LAYANAN as readonly string[]).includes(jenisLayanan)) {
      return NextResponse.json({ error: 'Jenis layanan tidak dikenal.' }, { status: 422 });
    }
    if (!(HARI as readonly string[]).includes(preferensiHari)) {
      return NextResponse.json({ error: 'Preferensi hari tidak dikenal.' }, { status: 422 });
    }
    if (!(WAKTU as readonly string[]).includes(preferensiWaktu)) {
      return NextResponse.json({ error: 'Preferensi waktu tidak dikenal.' }, { status: 422 });
    }
    if (!consent) {
      return NextResponse.json(
        { error: 'Persetujuan penggunaan data wajib diberikan (consent).' },
        { status: 422 }
      );
    }
    if (keluhan.length > 4000) {
      return NextResponse.json({ error: 'Keluhan maksimal 4000 karakter.' }, { status: 422 });
    }

    const reg = await db.registration.create({
      data: {
        nama,
        nim,
        kontak,
        jenisLayanan,
        preferensiHari,
        preferensiWaktu,
        keluhan: keluhan || null,
        consentStatus: 'disetujui',
        // placeholder unik, langsung diganti HMAC token setelah id final diketahui
        chatToken: `tmp-${randomUUID()}`,
        followup: { create: { status: 'menunggu_ditinjau' } },
      },
    });

    // chatToken dihitung dari id final (HMAC), lalu disimpan sekali.
    const chatToken = makeChatToken(reg.id);
    await db.registration.update({ where: { id: reg.id }, data: { chatToken } });

    return NextResponse.json(
      {
        registrationId: reg.id,
        chatToken,
        nama: reg.nama,
        pesan:
          'Pendaftaran berhasil. Preferensi jadwal Anda akan dikonfirmasi terpisah ' +
          'oleh petugas UPA BK - ini bukan jadwal terkonfirmasi.',
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/registrations POST] error:', message);
    return NextResponse.json({ error: 'Gagal menyimpan pendaftaran.' }, { status: 500 });
  }
}
