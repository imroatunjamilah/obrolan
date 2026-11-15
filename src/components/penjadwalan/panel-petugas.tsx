'use client';

/**
 * Tab Panel Petugas — dashboard pengelolaan permintaan konseling:
 * statistik antrean, eksekusi penjadwalan Greedy, grid jadwal, dan
 * aksi petugas (jadwalkan manual, tolak, selesai, buka kembali).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CalendarClock,
  CalendarX2,
  CheckCheck,
  ClipboardList,
  Hourglass,
  Loader2,
  Play,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { hariKerjaBerikutnya, KODE_SESI, LABEL_SESI } from '@/lib/penjadwalan/penjadwalan';
import { persen, tanggalIndo, BadgePrioritas, BadgeStatus, LabelSesi } from './ui-bersama';
import type { KelasPrioritas } from '@/lib/penjadwalan/dataset';

interface Permintaan {
  id: string;
  nama: string;
  nim: string;
  prodi: string;
  kontak: string;
  keluhan: string;
  prefHari: string[];
  prefSesi: string[];
  prioritas: KelasPrioritas;
  confidence: number;
  modelDigunakan: string;
  kataKunci: string[];
  status: string;
  jadwalTanggal: string | null;
  jadwalHari: string | null;
  jadwalSesi: string | null;
  konselorId: string | null;
  konselorNama: string | null;
  catatanPetugas: string | null;
  createdAt: string;
}

interface Konselor {
  id: string;
  nama: string;
  spesialisasi: string;
  kuotaHarian: number;
}

interface Metrik {
  totalPermintaan: number;
  terjadwal: number;
  belumTerjadwal: number;
  konflikSlot: number;
  pelanggaranPreferensi: number;
  perPrioritas: Record<string, { permintaan: number; terjadwal: number; tungguRataHari: number; tungguMaksHari: number; dalamTenggat: number }>;
}

interface HasilGreedy {
  penugasan: { id: string; nama: string; prioritas: KelasPrioritas; hari: string; tanggal: string; sesi: string; konselorNama: string; melanggarPreferensi: boolean }[];
  gagal: { id: string; nama: string; prioritas: KelasPrioritas; alasan: string }[];
  metrik: Metrik;
  jejakKeputusan: string[];
}

export function PanelPetugas({ muatUlang, onMuatUlang }: { muatUlang: number; onMuatUlang: () => void }) {
  const [permintaan, setPermintaan] = useState<Permintaan[]>([]);
  const [konselor, setKonselor] = useState<Konselor[]>([]);
  const [memuat, setMemuat] = useState(true);
  const [menjalankan, setMenjalankan] = useState(false);
  const [hasilAkhir, setHasilAkhir] = useState<HasilGreedy | null>(null);
  const [modeHasil, setModeHasil] = useState<'simulasi' | 'eksekusi' | null>(null);
  const [hariDipilih, setHariDipilih] = useState(0);
  const [dialogJadwalkan, setDialogJadwalkan] = useState<Permintaan | null>(null);
  const [dialogTolak, setDialogTolak] = useState<Permintaan | null>(null);
  const [catatanTolak, setCatatanTolak] = useState('');
  const [pilihTanggal, setPilihTanggal] = useState('');
  const [pilihSesi, setPilihSesi] = useState('');
  const [pilihKonselor, setPilihKonselor] = useState('');
  const [menyimpan, setMenyimpan] = useState(false);

  const hariKerja = useMemo(() => hariKerjaBerikutnya(new Date(), 10), [muatUlang]);

  const muat = useCallback(async () => {
    setMemuat(true);
    try {
      const res = await fetch('/api/penjadwalan/permintaan', { cache: 'no-store' });
      const data = await res.json();
      setPermintaan(data.permintaan ?? []);
      setKonselor(data.konselor ?? []);
    } catch {
      toast.error('Gagal memuat data permintaan.');
    } finally {
      setMemuat(false);
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat, muatUlang]);

  const jalankan = async (mode: 'simulasi' | 'eksekusi') => {
    setMenjalankan(true);
    try {
      const res = await fetch('/api/penjadwalan/penjadwalan', mode === 'eksekusi' ? { method: 'POST' } : { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menjalankan penjadwalan.');
      setHasilAkhir(data as HasilGreedy);
      setModeHasil(mode);
      if (mode === 'eksekusi') {
        toast.success(data.pesan ?? 'Penjadwalan selesai.');
        onMuatUlang();
      } else {
        toast.info('Simulasi selesai — lihat ringkasan di bawah.');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menjalankan penjadwalan.');
    } finally {
      setMenjalankan(false);
    }
  };

  const aksi = async (id: string, payload: Record<string, unknown>, pesanSukses: string) => {
    setMenyimpan(true);
    try {
      const res = await fetch(`/api/penjadwalan/permintaan/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Gagal menyimpan perubahan.');
      toast.success(pesanSukses);
      onMuatUlang();
      void muat();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.');
    } finally {
      setMenyimpan(false);
    }
  };

  // Statistik antrean
  const menunggu = permintaan.filter((p) => p.status === 'menunggu');
  const terjadwal = permintaan.filter((p) => p.status === 'terjadwal');
  const selesai = permintaan.filter((p) => p.status === 'selesai');
  const hitungPrioritas = (arr: Permintaan[], kelas: string) => arr.filter((p) => p.prioritas === kelas).length;

  const terbuka = dialogJadwalkan !== null;
  const bukaDialog = (p: Permintaan) => {
    setDialogJadwalkan(p);
    setPilihTanggal(hariKerja[0]?.tanggal ?? '');
    setPilihSesi(p.prefSesi[0] ?? 'S1');
    setPilihKonselor('');
  };

  const tanggalSama = (a: Permintaan) =>
    a.status === 'terjadwal' || a.status === 'selesai' ? a.jadwalTanggal === hariKerja[hariDipilih]?.tanggal : false;

  const prioritasKelas: KelasPrioritas[] = ['DARURAT', 'SEDANG', 'NORMAL'];

  return (
    <div className="grid gap-4 p-4 sm:p-6">
      {/* Statistik */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Hourglass className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-semibold tabular-nums">{menunggu.length}</p>
              <p className="truncate text-xs text-muted-foreground">
                Menunggu ({hitungPrioritas(menunggu, 'DARURAT')} darurat)
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <CalendarClock className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-semibold tabular-nums">{terjadwal.length}</p>
              <p className="truncate text-xs text-muted-foreground">Terjadwal</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCheck className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-semibold tabular-nums">{selesai.length}</p>
              <p className="truncate text-xs text-muted-foreground">Selesai</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <ClipboardList className="size-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-2xl font-semibold tabular-nums">
                {menunggu.length > 0 ? Math.max(...menunggu.map((p) => (Date.now() - new Date(p.createdAt).getTime()) / 3600000)).toFixed(0) : 0} j
              </p>
              <p className="truncate text-xs text-muted-foreground">Antrean tertua</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kontrol penjadwalan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            Penjadwalan Otomatis (Greedy Prioritas)
          </CardTitle>
          <CardDescription>
            Aturan: DARURAT didahulukan ≤ 48 jam (bisa melampaui preferensi), SEDANG minggu berjalan
            dengan fallback, NORMAL mengikuti preferensi. Kendala: tanpa bentrok slot & kuota
            konselor/hari.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button onClick={() => jalankan('eksekusi')} disabled={menjalankan || menunggu.length === 0}>
            {menjalankan ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="size-4" aria-hidden="true" />
            )}
            Jalankan Penjadwalan ({menunggu.length} antrean)
          </Button>
          <Button variant="outline" onClick={() => jalankan('simulasi')} disabled={menjalankan || menunggu.length === 0}>
            Simulasi Tanpa Menyimpan
          </Button>
        </CardContent>
      </Card>

      {/* Hasil penjadwalan terakhir */}
      {hasilAkhir && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              Hasil {modeHasil === 'eksekusi' ? 'Penjadwalan' : 'Simulasi'} —{' '}
              {hasilAkhir.metrik.terjadwal} terjadwal · {hasilAkhir.metrik.belumTerjadwal} belum ·{' '}
              {hasilAkhir.metrik.konflikSlot} konflik slot · {hasilAkhir.metrik.pelanggaranPreferensi} pelanggaran
              preferensi
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-3">
              {prioritasKelas.map((k) => {
                const m = hasilAkhir.metrik.perPrioritas[k];
                return (
                  <div key={k} className="rounded-lg border p-2.5 text-xs">
                    <BadgePrioritas kelas={k} className="mb-1.5" />
                    <p className="tabular-nums">
                      terjadwal {m?.terjadwal ?? 0}/{m?.permintaan ?? 0} · tunggu rata{' '}
                      {(m?.tungguRataHari ?? 0).toFixed(1)} hari (maks {m?.tungguMaksHari ?? 0})
                    </p>
                    {k === 'DARURAT' && (
                      <p className="mt-1 text-muted-foreground">
                        dalam tenggat 48 jam: {m?.dalamTenggat ?? 0}/{m?.terjadwal ?? 0}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/40 p-2.5 text-xs leading-relaxed">
              {hasilAkhir.jejakKeputusan.map((j, i) => (
                <p key={i}>{j}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daftar permintaan */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daftar Permintaan Konseling</CardTitle>
          <CardDescription>Data demo dummy — identitas mahasiswa fiktif.</CardDescription>
        </CardHeader>
        <CardContent>
          {memuat ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Memuat…
            </div>
          ) : permintaan.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Belum ada permintaan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Mahasiswa</th>
                    <th className="py-2 pr-3 font-medium">Keluhan</th>
                    <th className="py-2 pr-3 font-medium">Urgensi</th>
                    <th className="py-2 pr-3 font-medium">Jadwal</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {permintaan.map((p) => (
                    <tr key={p.id} className="border-b align-top last:border-0">
                      <td className="py-2.5 pr-3">
                        <p className="font-medium">{p.nama}</p>
                        <p className="text-xs text-muted-foreground">
                          {p.nim} · {p.prodi}
                        </p>
                        <p className="text-xs text-muted-foreground">pref: {p.prefHari.length > 0 ? p.prefHari.join(', ') : 'bebas'} / {p.prefSesi.length > 0 ? p.prefSesi.join(', ') : 'bebas'}</p>
                      </td>
                      <td className="max-w-[240px] py-2.5 pr-3">
                        <p className="line-clamp-2 text-[13px]" title={p.keluhan}>
                          {p.keluhan}
                        </p>
                        {p.kataKunci.length > 0 && (
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            kunci: {p.kataKunci.slice(0, 3).join(', ')}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        <BadgePrioritas kelas={p.prioritas} />
                        <p className="mt-1 text-[11px] text-muted-foreground">{persen(p.confidence)}</p>
                      </td>
                      <td className="py-2.5 pr-3 text-[13px]">
                        {p.jadwalTanggal ? (
                          <>
                            <p className="font-medium">
                              {p.jadwalHari}, {tanggalIndo(p.jadwalTanggal)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {LABEL_SESI[p.jadwalSesi ?? ''] ?? p.jadwalSesi}
                            </p>
                            <p className="text-xs text-muted-foreground">{p.konselorNama}</p>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 pr-3">
                        <BadgeStatus status={p.status} />
                        {p.catatanPetugas && (
                          <p className="mt-1 max-w-[140px] text-[11px] text-muted-foreground" title={p.catatanPetugas}>
                            {p.catatanPetugas}
                          </p>
                        )}
                      </td>
                      <td className="py-2.5">
                        <div className="flex flex-col gap-1.5">
                          {p.status === 'menunggu' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => bukaDialog(p)}>
                                <CalendarClock className="size-3.5" aria-hidden="true" /> Jadwalkan
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => { setDialogTolak(p); setCatatanTolak(''); }}>
                                <X className="size-3.5" aria-hidden="true" /> Tolak
                              </Button>
                            </>
                          )}
                          {p.status === 'terjadwal' && (
                            <>
                              <Button size="sm" variant="outline" onClick={() => aksi(p.id, { aksi: 'selesai' }, `${p.nama} ditandai selesai.`)}>
                                <CheckCheck className="size-3.5" aria-hidden="true" /> Selesai
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => aksi(p.id, { aksi: 'buka' }, `${p.nama} dikembalikan ke antrean.`)}>
                                Buka kembali
                              </Button>
                            </>
                          )}
                          {p.status === 'ditolak' && (
                            <Button size="sm" variant="ghost" onClick={() => aksi(p.id, { aksi: 'buka' }, `${p.nama} dikembalikan ke antrean.`)}>
                              Buka kembali
                            </Button>
                          )}
                          {p.status === 'selesai' && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid jadwal */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Papan Jadwal Konselor</CardTitle>
              <CardDescription>Pilih hari kerja untuk melihat pemakaian slot sesi.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hariKerja.slice(0, 5).map((h, i) => (
                <button
                  key={h.tanggal}
                  type="button"
                  onClick={() => setHariDipilih(i)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    hariDipilih === i
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'bg-background text-muted-foreground hover:bg-accent'
                  )}
                >
                  {h.hari} {tanggalIndo(h.tanggal).replace(/ \d{4}$/, '')}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Sesi</th>
                  {konselor.map((k) => (
                    <th key={k.id} className="py-2 pr-3 font-medium">
                      {k.nama}
                      <span className="block text-[11px] font-normal normal-case">
                        kuota {k.kuotaHarian}/hari · {k.spesialisasi}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {KODE_SESI.map((s) => (
                  <tr key={s} className="border-b last:border-0">
                    <td className="py-2.5 pr-3 text-xs font-medium text-muted-foreground">
                      <LabelSesi kode={s} />
                    </td>
                    {konselor.map((k) => {
                      const isi = permintaan.find(
                        (p) => tanggalSama(p) && p.jadwalSesi === s && p.konselorId === k.id
                      );
                      return (
                        <td key={k.id} className="py-2.5 pr-3">
                          {isi ? (
                            <div
                              className={cn(
                                'rounded-md border px-2 py-1.5 text-xs',
                                isi.prioritas === 'DARURAT'
                                  ? 'border-red-200 bg-red-50 text-red-900'
                                  : isi.prioritas === 'SEDANG'
                                    ? 'border-amber-200 bg-amber-50 text-amber-900'
                                    : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                              )}
                            >
                              <p className="font-medium">{isi.nama}</p>
                              <p className="text-[10px] opacity-80">{isi.prioritas}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">kosong</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog jadwalkan manual */}
      <Dialog open={terbuka} onOpenChange={(o) => !o && setDialogJadwalkan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Jadwalkan — {dialogJadwalkan?.nama}</DialogTitle>
            <DialogDescription>
              Prioritas terdeteksi:{' '}
              {dialogJadwalkan && <BadgePrioritas kelas={dialogJadwalkan.prioritas} className="inline" />} ·
              pilih slot yang masih kosong.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Tanggal (10 hari kerja ke depan)</Label>
              <Select value={pilihTanggal} onValueChange={setPilihTanggal}>
                <SelectTrigger aria-label="Pilih tanggal">
                  <SelectValue placeholder="Pilih tanggal" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {hariKerja.map((h) => (
                    <SelectItem key={h.tanggal} value={h.tanggal}>
                      {h.hari}, {tanggalIndo(h.tanggal)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Sesi</Label>
              <Select value={pilihSesi} onValueChange={setPilihSesi}>
                <SelectTrigger aria-label="Pilih sesi">
                  <SelectValue placeholder="Pilih sesi" />
                </SelectTrigger>
                <SelectContent>
                  {KODE_SESI.map((s) => (
                    <SelectItem key={s} value={s}>
                      {LABEL_SESI[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Konselor</Label>
              <Select value={pilihKonselor} onValueChange={setPilihKonselor}>
                <SelectTrigger aria-label="Pilih konselor">
                  <SelectValue placeholder="Pilih konselor" />
                </SelectTrigger>
                <SelectContent>
                  {konselor.map((k) => (
                    <SelectItem key={k.id} value={k.id}>
                      {k.nama} (kuota {k.kuotaHarian}/hari)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogJadwalkan(null)}>
              Batal
            </Button>
            <Button
              disabled={!pilihTanggal || !pilihSesi || !pilihKonselor || menyimpan}
              onClick={async () => {
                if (!dialogJadwalkan) return;
                await aksi(
                  dialogJadwalkan.id,
                  { aksi: 'jadwalkan', tanggal: pilihTanggal, sesi: pilihSesi, konselorId: pilihKonselor },
                  `${dialogJadwalkan.nama} terjadwal.`
                );
                setDialogJadwalkan(null);
              }}
            >
              {menyimpan && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Simpan Jadwal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog tolak */}
      <Dialog open={dialogTolak !== null} onOpenChange={(o) => !o && setDialogTolak(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak permintaan — {dialogTolak?.nama}</DialogTitle>
            <DialogDescription>
              Berikan alasan singkat; alasan ini tersimpan sebagai catatan petugas.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={catatanTolak}
            onChange={(e) => setCatatanTolak(e.target.value)}
            rows={3}
            placeholder="cth. Di luar lingkup layanan — diarahkan ke unit terkait."
            aria-label="Alasan penolakan"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogTolak(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={menyimpan}
              onClick={async () => {
                if (!dialogTolak) return;
                await aksi(dialogTolak.id, { aksi: 'tolak', catatan: catatanTolak }, `Permintaan ${dialogTolak.nama} ditolak.`);
                setDialogTolak(null);
              }}
            >
              <CalendarX2 className="size-4" aria-hidden="true" /> Tolak Permintaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
