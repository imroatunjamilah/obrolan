import { NextResponse } from 'next/server';
import {
  DASS21_QUESTIONS,
  DASS21_ANSWER_OPTIONS,
  INTRO_DASS21,
} from '@/lib/dass21';

// GET /api/screening/dass21/questions — daftar 21 pernyataan + opsi jawaban
// untuk halaman skrining mahasiswa. Tidak mengandung data hasil.
export async function GET() {
  return NextResponse.json({
    pengantar: INTRO_DASS21,
    pertanyaan: DASS21_QUESTIONS.map((q) => ({ no: q.no, teks: q.text })),
    opsi: DASS21_ANSWER_OPTIONS,
  });
}
