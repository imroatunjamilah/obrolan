'use client';

/**
 * Tab Pengajuan — form mahasiswa mengajukan konseling.
 * Setelah dikirim: klasifikasi urgensi tampil (prioritas, confidence,
 * skor kelas, kata kunci, perbandingan model) + usulan jadwal Greedy.
 */

import { useState } from 'react';
import { toast } from 'sonner';
import { CalendarClock, Loader2, Send, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  BadgePrioritas,
  BarSkor,
  LabelSesi,
  persen,
  tanggalIndo,
} from './ui-bersama';
import { HARI_KERJA, KODE_SESI, LABEL_SESI } from '@/lib/penjadwalan/penjadwalan';
import type { KelasPrioritas } from '@/lib/penjadwalan/dataset';

interface HasilPost {
  klasifikasi: {
    prioritas: KelasPrioritas;
    confidence: number;
    modelDigunakan: string;
    skorKelas: Record<KelasPrioritas, number>;
    kataKunci: string[];
    prediksiPerModel: Record<string, { kelas: KelasPrioritas; confidence: number }>;
  };
  usulanJadwal: {
    tanggal: string;
    hari: string;
    sesi: string;
    konselorNama: string;
    melanggarPreferensi: boolean;
    tungguHari: number;
  } | null;
  pesan: string;
}

const NAMA_MODEL: Record<string, string> = {
  naive_bayes: 'Naive Bayes',
  svm: 'SVM Linear',
  logistic_regression: 'Logistic Regression',
};

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export function FormPengajuan({ onSuccess }: { onSuccess: () => void }) {
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [prodi, setProdi] = useState('');
  const [kontak, setKontak] = useState('');
  const [keluhan, setKeluhan] = useState('');
  const [prefHari, setPrefHari] = useState<string[]>([]);
  const [prefSesi, setPrefSesi] = useState<string[]>([]);
  const [kirim, setKirim] = useState(false);
  const [hasil, setHasil] = useState<HasilPost | null>(null);

  const toggleHari = (h: string) =>
    setPrefHari((v) => (v.includes(h) ? v.filter((x) => x !== h) : [...v, h]));
  const toggleSesi = (s: string) =>
    setPrefSesi((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]));

  async function kirimPengajuan(e: React.FormEvent) {
    e.preventDefault();
    if (!nama.trim() || !nim.trim() || !prodi.trim() || keluhan.trim().length < 10) {
      toast.error('Lengkapi nama, NIM, prodi, dan keluhan (min. 10 karakter).');
      return;
    }
    setKirim(true);
    try {
      const res = await fetch('/api/penjadwalan/permintaan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama, nim, prodi, kontak, keluhan, prefHari, prefSesi }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal mengirim pengajuan.');
      setHasil(data as HasilPost);
      toast.success('Pengajuan terkirim dan terklasifikasi.');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal mengirim pengajuan.');
    } finally {
      setKirim(false);
    }
  }

  return (
    <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-5">
      {/* Form */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="size-4 text-primary" aria-hidden="true" />
            Ajukan Sesi Konseling
          </CardTitle>
          <CardDescription>
            Tuliskan keluhanmu — sistem menilai tingkat urgensinya secara otomatis, lalu
            petugas UPA BK mengonfirmasi jadwalnya. Contoh keluhan:{' '}
            <button
              type="button"
              className="font-medium text-primary underline-offset-2 hover:underline"
              onClick={() => setKeluhan('Sudah dua minggu aku sulit tidur karena terus overthinking soal tugas dan nilai')}
            >
              cemas dan sulit tidur
            </button>
            {' · '}
            <button
              type="button"
              className="font-medium text-primary underline-offset-2 hover:underline"
              onClick={() => setKeluhan('Aku sering muncul pikiran untuk menyakiti diri sendiri dan tidak tahu harus ke mana')}
            >
              pikiran menyakiti diri
            </button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={kirimPengajuan} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="nama">Nama lengkap *</Label>
                <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="cth. Siti Rahma" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="nim">NIM *</Label>
                <Input id="nim" value={nim} onChange={(e) => setNim(e.target.value)} placeholder="cth. 2311001" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="prodi">Program studi *</Label>
                <Input id="prodi" value={prodi} onChange={(e) => setProdi(e.target.value)} placeholder="cth. Teknik Informatika" />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="kontak">No. HP / kontak</Label>
                <Input id="kontak" value={kontak} onChange={(e) => setKontak(e.target.value)} placeholder="cth. 0812xxxx" />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="keluhan">Keluhan yang kamu alami *</Label>
              <Textarea
                id="keluhan"
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                placeholder="Ceritakan dalam beberapa kalimat apa yang sedang kamu rasakan atau alami…"
                rows={4}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>Preferensi hari (boleh dikosongkan)</Label>
              <div className="flex flex-wrap gap-2">
                {HARI.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => toggleHari(h)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      prefHari.includes(h)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-accent'
                    )}
                    aria-pressed={prefHari.includes(h)}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Preferensi sesi (boleh dikosongkan)</Label>
              <div className="flex flex-wrap gap-2">
                {KODE_SESI.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSesi(s)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      prefSesi.includes(s)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'bg-background text-muted-foreground hover:bg-accent'
                    )}
                    aria-pressed={prefSesi.includes(s)}
                  >
                    {LABEL_SESI[s]}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={kirim} className="w-full sm:w-auto">
              {kirim ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Send className="size-4" aria-hidden="true" />}
              {kirim ? 'Mengklasifikasi…' : 'Kirim Pengajuan'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Hasil klasifikasi */}
      <div className="grid gap-4 lg:col-span-2 lg:content-start">
        {!hasil ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
              <CalendarClock className="size-8 text-muted-foreground/60" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                Hasil klasifikasi urgensi dan usulan jadwal akan tampil di sini setelah
                pengajuan dikirim.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Hasil Klasifikasi Urgensi</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center justify-between gap-2">
                  <BadgePrioritas kelas={hasil.klasifikasi.prioritas} className="text-sm" />
                  <span className="text-xs text-muted-foreground">
                    keyakinan {persen(hasil.klasifikasi.confidence)} ·{' '}
                    {NAMA_MODEL[hasil.klasifikasi.modelDigunakan] ?? hasil.klasifikasi.modelDigunakan}
                  </span>
                </div>
                {hasil.klasifikasi.prioritas === 'DARURAT' && (
                  <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                    <span>
                      Kasus darurat didahulukan ≤ 48 jam. Bila sedang ada risiko segera,
                      hubungi <a href="tel:112" className="font-semibold underline">112</a> /{' '}
                      <a href="tel:119" className="font-semibold underline">119 ext. 8</a>.
                    </span>
                  </div>
                )}
                <div className="grid gap-2">
                  <BarSkor label="DARURAT" nilai={hasil.klasifikasi.skorKelas.DARURAT ?? 0} kelasKelas="DARURAT" />
                  <BarSkor label="SEDANG" nilai={hasil.klasifikasi.skorKelas.SEDANG ?? 0} kelasKelas="SEDANG" />
                  <BarSkor label="NORMAL" nilai={hasil.klasifikasi.skorKelas.NORMAL ?? 0} kelasKelas="NORMAL" />
                </div>
                {hasil.klasifikasi.kataKunci.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Kata kunci penunjang:{' '}
                    {hasil.klasifikasi.kataKunci.map((k) => (
                      <span key={k} className="mr-1 inline-block rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                        {k}
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid gap-1 rounded-lg border p-2.5 text-xs">
                  <p className="mb-1 font-medium">Perbandingan ketiga model:</p>
                  {Object.entries(hasil.klasifikasi.prediksiPerModel).map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{NAMA_MODEL[k] ?? k}</span>
                      <span className="font-medium">
                        {v.kelas} · {persen(v.confidence)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Usulan Jadwal (Greedy)</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                {hasil.usulanJadwal ? (
                  <>
                    <p className="flex items-center gap-2">
                      <CalendarClock className="size-4 text-primary" aria-hidden="true" />
                      <span className="font-medium">
                        {hasil.usulanJadwal.hari}, {tanggalIndo(hasil.usulanJadwal.tanggal)} ·{' '}
                        {LABEL_SESI[hasil.usulanJadwal.sesi]}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      Konselor: {hasil.usulanJadwal.konselorNama} · estimasi tunggu{' '}
                      {hasil.usulanJadwal.tungguHari} hari
                    </p>
                    {hasil.usulanJadwal.melanggarPreferensi && (
                      <p className="text-xs text-amber-700">
                        Catatan: preferensi waktumu dilanggar demi kebijakan prioritas — petugas
                        dapat menyesuaikannya.
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Usulan awal — jadwal final ditetapkan petugas UPA BK lewat menu Panel Petugas.
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Belum ada slot tersedia — permintaanmu masuk antrean dan dijadwalkan saat
                    petugas menjalankan penjadwalan.
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
