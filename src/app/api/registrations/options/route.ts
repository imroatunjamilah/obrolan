import { NextResponse } from 'next/server';
import { JENIS_LAYANAN, HARI, WAKTU } from '@/lib/layanan';

// GET /api/registrations/options — opsi pilihan untuk form pendaftaran.
export async function GET() {
  return NextResponse.json({
    jenisLayanan: JENIS_LAYANAN,
    hari: HARI,
    waktu: WAKTU,
  });
}
