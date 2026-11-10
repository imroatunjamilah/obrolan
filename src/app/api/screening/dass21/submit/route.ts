import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyChatToken } from '@/lib/auth';
import {
  validateAnswers,
  scoreAnswers,
  classifySubscale,
  SCORING_VERSION,
  DASS21_CONFIRMATION_MESSAGE,
} from '@/lib/dass21';

// POST /api/screening/dass21/submit
//
// KEBIJAKAN PENTING (port dari routers/dass21.py asli): hasil (skor/kategori)
// TIDAK PERNAH dikirim ke mahasiswa. Respons submit hanya konfirmasi generik.
// Skor + kategori disimpan dan hanya dapat dilihat petugas/admin.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const registrationId =
      typeof body.registrationId === 'string' ? body.registrationId : '';
    const chatToken = typeof body.chatToken === 'string' ? body.chatToken : '';

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Pendaftaran tidak ditemukan. Isi pendaftaran terlebih dahulu.' },
        { status: 422 }
      );
    }

    const reg = await db.registration.findUnique({
      where: { id: registrationId },
      include: { dass21: true },
    });
    if (!reg) {
      return NextResponse.json({ error: 'Pendaftaran tidak ditemukan.' }, { status: 404 });
    }
    if (!verifyChatToken(registrationId, chatToken)) {
      return NextResponse.json(
        { error: 'Token akses tidak valid untuk pendaftaran ini.' },
        { status: 403 }
      );
    }
    if (reg.dass21) {
      return NextResponse.json(
        { error: 'Skrining untuk pendaftaran ini sudah pernah diisi.' },
        { status: 409 }
      );
    }

    if (!validateAnswers(body.jawaban)) {
      return NextResponse.json(
        { error: 'Jawaban belum lengkap atau nilainya tidak valid (harus 0-3 untuk nomor 1-21).' },
        { status: 422 }
      );
    }

    const jawaban = body.jawaban as Record<string, number>;
    const scores = scoreAnswers(jawaban);

    await db.dass21Response.create({
      data: {
        registrationId,
        jawaban: JSON.stringify(
          Array.from({ length: 21 }, (_, i) => jawaban[String(i + 1)])
        ),
        skorDepresi: scores.skorDepresi,
        skorKecemasan: scores.skorKecemasan,
        skorStres: scores.skorStres,
        katDepresi: classifySubscale('depresi', scores.skorDepresi),
        katKecemasan: classifySubscale('kecemasan', scores.skorKecemasan),
        katStres: classifySubscale('stres', scores.skorStres),
        scoringVersion: SCORING_VERSION,
      },
    });

    // Sengaja TIDAK mengembalikan skor ke mahasiswa.
    return NextResponse.json({
      status: 'tersimpan',
      pesan: DASS21_CONFIRMATION_MESSAGE,
      langkahSelanjutnya: 'konseling',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/screening/dass21/submit POST] error:', message);
    return NextResponse.json({ error: 'Gagal menyimpan jawaban skrining.' }, { status: 500 });
  }
}
