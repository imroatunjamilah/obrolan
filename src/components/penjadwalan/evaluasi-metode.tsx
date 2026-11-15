'use client';

/**
 * Tab Evaluasi Metode — dokumentasi hidup untuk laporan KP:
 * pipeline, komposisi dataset sintetis, perbandingan 3 model
 * (akurasi/presisi/recall/F1 makro), matriks kebingungan model terbaik,
 * metrik penjadwalan Greedy, dan uji klasifikasi langsung.
 */

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Beaker, FlaskConical, Loader2, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  BadgePrioritas,
  BarSkor,
  GAYA_PRIORITAS,
  persen,
} from './ui-bersama';
import type { KelasPrioritas } from '@/lib/penjadwalan/dataset';

interface MetrikPerKelas {
  presisi: number;
  recall: number;
  f1: number;
  dukungan: number;
}

interface DataEvaluasi {
  dataset: {
    jumlahData: number;
    jumlahLatih: number;
    jumlahUji: number;
    komposisi: Record<KelasPrioritas, number>;
    deskripsiKelas: Record<KelasPrioritas, string>;
    keterangan: string;
  };
  model: Record<
    string,
    {
      nama: string;
      akurasi: number;
      presisiMacro: number;
      recallMacro: number;
      f1Macro: number;
      perKelas: Record<KelasPrioritas, MetrikPerKelas>;
      matriks: number[][];
    }
  >;
  terbaik: string;
  namaTerbaik: string;
  pipeline: string[];
}

interface Simulasi {
  metrik: {
    totalPermintaan: number;
    terjadwal: number;
    belumTerjadwal: number;
    konflikSlot: number;
    pelanggaranPreferensi: number;
    perPrioritas: Record<
      string,
      { permintaan: number; terjadwal: number; tungguRataHari: number; tungguMaksHari: number; dalamTenggat: number }
    >;
    bebanKonselor: Record<string, number>;
  };
  jejakKeputusan: string[];
}

interface HasilUji {
  prioritas: KelasPrioritas;
  confidence: number;
  modelDigunakan: string;
  skorKelas: Record<KelasPrioritas, number>;
  kataKunci: string[];
}

const KELAS: KelasPrioritas[] = ['DARURAT', 'SEDANG', 'NORMAL'];
const URUTAN_MODEL = ['naive_bayes', 'svm', 'logistic_regression'];

export function EvaluasiMetode({ muatUlang }: { muatUlang: number }) {
  const [ev, setEv] = useState<DataEvaluasi | null>(null);
  const [sim, setSim] = useState<Simulasi | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [teksUji, setTeksUji] = useState('');
  const [menguji, setMenguji] = useState(false);
  const [hasilUji, setHasilUji] = useState<HasilUji | null>(null);

  const muat = useCallback(async () => {
    setMemuat(true);
    try {
      const [re, rs] = await Promise.all([
        fetch('/api/penjadwalan/evaluasi', { cache: 'no-store' }),
        fetch('/api/penjadwalan/penjadwalan', { cache: 'no-store' }),
      ]);
      setEv(await re.json());
      setSim(await rs.json());
    } catch {
      toast.error('Gagal memuat data evaluasi.');
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat, muatUlang]);

  const ujiKlasifikasi = async () => {
    if (teksUji.trim().length < 5) {
      toast.error('Tulis teks keluhan terlebih dahulu.');
      return;
    }
    setMenguji(true);
    try {
      const res = await fetch('/api/penjadwalan/klasifikasi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teks: teksUji }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menguji.');
      setHasilUji(data as HasilUji);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menguji klasifikasi.');
    } finally {
      setMenguji(false);
    }
  };

  if (memuat || !ev) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Menghitung metrik…
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 sm:p-6">
      {/* Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Route className="size-4 text-primary" aria-hidden="true" />
            Pipeline Metodologi
          </CardTitle>
          <CardDescription>
            Metodologi mengikuti alur klasifikasi prioritas pengaduan berbasis NLP+ML
            (Suherman &amp; Ismail, 2026) dan penjadwalan Greedy prioritas berjenjang (Wijaya, 2026).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-2 sm:grid-cols-2">
            {ev.pipeline.map((p, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg border p-2.5 text-sm">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Dataset */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Beaker className="size-4 text-primary" aria-hidden="true" />
              Dataset Keluhan (Sintetis)
            </CardTitle>
            <CardDescription>
              {ev.dataset.jumlahData} contoh · latih {ev.dataset.jumlahLatih} / uji{' '}
              {ev.dataset.jumlahUji} (80/20 berstrata)
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2.5">
            {KELAS.map((k) => (
              <div key={k} className="grid gap-1">
                <div className="flex items-center justify-between text-xs">
                  <BadgePrioritas kelas={k} />
                  <span className="tabular-nums text-muted-foreground">
                    {ev.dataset.komposisi[k]} contoh
                  </span>
                </div>
                <BarSkor label="porsi" nilai={ev.dataset.komposisi[k] / ev.dataset.jumlahData} kelasKelas={k} />
              </div>
            ))}
            <p className="pt-1 text-xs leading-relaxed text-muted-foreground">{ev.dataset.keterangan}</p>
          </CardContent>
        </Card>

        {/* Perbandingan model */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FlaskConical className="size-4 text-primary" aria-hidden="true" />
              Perbandingan Model (data uji 20%)
            </CardTitle>
            <CardDescription>
              Model terbaik: <span className="font-medium text-foreground">{ev.namaTerbaik}</span> — dipakai
              untuk klasifikasi pengajuan nyata.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Model</th>
                    <th className="py-2 pr-3 font-medium">Akurasi</th>
                    <th className="py-2 pr-3 font-medium">Presisi (makro)</th>
                    <th className="py-2 pr-3 font-medium">Recall (makro)</th>
                    <th className="py-2 font-medium">F1 (makro)</th>
                  </tr>
                </thead>
                <tbody>
                  {URUTAN_MODEL.map((k) => {
                    const m = ev.model[k];
                    if (!m) return null;
                    const terbaik = k === ev.terbaik;
                    return (
                      <tr
                        key={k}
                        className={cn(
                          'border-b last:border-0',
                          terbaik && 'bg-emerald-50/70 font-medium'
                        )}
                      >
                        <td className="py-2 pr-3">
                          {m.nama}
                          {terbaik && <span className="ml-1.5 text-[11px] text-emerald-700">terbaik</span>}
                        </td>
                        <td className="py-2 pr-3 tabular-nums">{persen(m.akurasi)}</td>
                        <td className="py-2 pr-3 tabular-nums">{persen(m.presisiMacro)}</td>
                        <td className="py-2 pr-3 tabular-nums">{persen(m.recallMacro)}</td>
                        <td className="py-2 tabular-nums">{persen(m.f1Macro)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matriks kebingungan model terbaik */}
            {ev.model[ev.terbaik] && (
              <div>
                <p className="mb-2 text-sm font-medium">Matriks kebingungan — {ev.namaTerbaik}</p>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[380px] border-collapse text-sm">
                    <thead>
                      <tr className="text-xs text-muted-foreground">
                        <th className="p-2 text-left font-medium">aktual ↓ / prediksi →</th>
                        {KELAS.map((k) => (
                          <th key={k} className="p-2 font-medium">{k}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ev.model[ev.terbaik].matriks.map((baris, i) => (
                        <tr key={i} className="border-t">
                          <td className="p-2 text-xs font-medium text-muted-foreground">{KELAS[i]}</td>
                          {baris.map((v, j) => (
                            <td
                              key={j}
                              className={cn(
                                'p-2 text-center tabular-nums',
                                i === j ? 'bg-emerald-50 font-semibold text-emerald-800' : v > 0 ? 'bg-red-50 text-red-800' : 'text-muted-foreground'
                              )}
                            >
                              {v}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Simulasi penjadwalan */}
      {sim && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Simulasi Penjadwalan Greedy (antrean berjalan)</CardTitle>
            <CardDescription>
              {sim.metrik.terjadwal} dari {sim.metrik.totalPermintaan} antrean terjadwal ·{' '}
              {sim.metrik.konflikSlot} konflik slot · {sim.metrik.pelanggaranPreferensi} pelanggaran
              preferensi · beban: {Object.entries(sim.metrik.bebanKonselor).map(([n, b]) => `${n.split(',')[0]} ${b}`).join(', ') || '—'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-3">
              {KELAS.map((k) => {
                const m = sim.metrik.perPrioritas[k];
                return (
                  <div key={k} className="rounded-lg border p-2.5 text-xs">
                    <BadgePrioritas kelas={k} className="mb-1.5" />
                    <p className="tabular-nums">
                      terjadwal {m?.terjadwal ?? 0}/{m?.permintaan ?? 0} · tunggu rata{' '}
                      {(m?.tungguRataHari ?? 0).toFixed(1)} hari (maks {m?.tungguMaksHari ?? 0})
                    </p>
                  </div>
                );
              })}
            </div>
            {sim.jejakKeputusan.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/40 p-2.5 text-xs leading-relaxed">
                {sim.jejakKeputusan.map((j, i) => (
                  <p key={i}>{j}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Uji klasifikasi */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Uji Klasifikasi Cepat</CardTitle>
          <CardDescription>
            Ketik kalimat keluhan apa pun (tidak disimpan) untuk melihat perilaku model terbaik.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Textarea
            value={teksUji}
            onChange={(e) => setTeksUji(e.target.value)}
            rows={2}
            placeholder="cth. Sudah seminggu aku tidak bisa tidur karena terus mikirin tugas"
            aria-label="Teks keluhan untuk uji klasifikasi"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={ujiKlasifikasi} disabled={menguji}>
              {menguji && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Uji
            </Button>
            <Button
              variant="ghost"
              onClick={() => setTeksUji('Aku sering pikir untuk bunuh diri karena merasa tidak berharga')}
            >
              Contoh darurat
            </Button>
            <Button variant="ghost" onClick={() => setTeksUji('Ingin konsultasi cara mengatur waktu belajar yang efektif')}>
              Contoh normal
            </Button>
          </div>
          {hasilUji && (
            <div className="grid gap-2.5 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">Hasil:</span>
                <BadgePrioritas kelas={hasilUji.prioritas} />
                <span className="text-xs text-muted-foreground">
                  keyakinan {persen(hasilUji.confidence)}
                </span>
              </div>
              <BarSkor label="DARURAT" nilai={hasilUji.skorKelas.DARURAT ?? 0} kelasKelas="DARURAT" />
              <BarSkor label="SEDANG" nilai={hasilUji.skorKelas.SEDANG ?? 0} kelasKelas="SEDANG" />
              <BarSkor label="NORMAL" nilai={hasilUji.skorKelas.NORMAL ?? 0} kelasKelas="NORMAL" />
              {hasilUji.kataKunci.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Kata kunci:{' '}
                  {hasilUji.kataKunci.map((k) => (
                    <span key={k} className={cn('mr-1 inline-block rounded bg-muted px-1.5 py-0.5 font-medium', GAYA_PRIORITAS[hasilUji.prioritas])}>
                      {k}
                    </span>
                  ))}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
