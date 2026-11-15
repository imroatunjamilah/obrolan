/**
 * API modul KP — hasil evaluasi metodologi.
 * GET : metrik per model (Naive Bayes / SVM / Logistic Regression) pada
 *       pembagian latih-uji 80/20 berstrata + komposisi dataset sintetis.
 */

import { NextResponse } from 'next/server';
import { getEngine, NAMA_MODEL, type ModelKey } from '@/lib/penjadwalan/klasifikasi';
import { DESKRIPSI_KELAS } from '@/lib/penjadwalan/dataset';

export const dynamic = 'force-dynamic';

export async function GET() {
  const engine = getEngine();
  const ev = engine.evaluasi;
  return NextResponse.json({
    dataset: {
      jumlahData: ev.jumlahData,
      jumlahLatih: ev.jumlahLatih,
      jumlahUji: ev.jumlahUji,
      komposisi: ev.komposisi,
      deskripsiKelas: DESKRIPSI_KELAS,
      keterangan:
        'Dataset keluhan sintetis (dummy) berlabel yang ditulis meniru tema keluhan mahasiswa hasil riset; tidak memuat data skrining asli.',
    },
    model: Object.fromEntries(
      (Object.keys(NAMA_MODEL) as ModelKey[]).map((k) => [
        k,
        { nama: NAMA_MODEL[k], ...ev.model[k] },
      ])
    ),
    terbaik: ev.terbaik,
    namaTerbaik: NAMA_MODEL[ev.terbaik],
    pipeline: [
      'Pra-pemrosesan teks (normalisasi, case folding, tokenisasi, stopword removal, pemangkasan sufiks)',
      'Ekstraksi fitur TF-IDF (L2-normalized)',
      'Klasifikasi 3 kelas: DARURAT / SEDANG / NORMAL',
      'Evaluasi akurasi, presisi, recall, F1 (makro) pada data uji 20%',
      'Model dengan F1 makro terbaik dipakai untuk prediksi pengajuan baru',
      'Hasil klasifikasi menjadi input penjadwalan Greedy prioritas',
    ],
  });
}
