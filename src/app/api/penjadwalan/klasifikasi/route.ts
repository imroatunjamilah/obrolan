/**
 * API modul KP — uji klasifikasi tanpa menyimpan data.
 * POST : { teks } → hasil klasifikasi lengkap (prioritas, confidence,
 *        skor per kelas, kata kunci, perbandingan antar model).
 */

import { NextResponse } from 'next/server';
import { getEngine } from '@/lib/penjadwalan/klasifikasi';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body bukan JSON valid.' }, { status: 400 });
  }
  const teks = typeof (body as Record<string, unknown>).teks === 'string'
    ? ((body as Record<string, unknown>).teks as string).trim()
    : '';
  if (!teks) {
    return NextResponse.json({ error: 'Teks keluhan wajib diisi.' }, { status: 400 });
  }
  if (teks.length < 5) {
    return NextResponse.json({ error: 'Teks terlalu pendek untuk diklasifikasi.' }, { status: 400 });
  }
  const hasil = getEngine().klasifikasi(teks);
  return NextResponse.json(hasil);
}
