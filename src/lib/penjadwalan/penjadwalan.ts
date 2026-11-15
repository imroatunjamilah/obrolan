/**
 * Mesin penjadwalan Greedy berbasis prioritas — Modul KP.
 *
 * Prinsip (mengikuti pola Greedy prioritas berjenjang, Wijaya 2026):
 *   1. Urutkan permintaan berdasarkan prioritas (DARURAT → SEDANG → NORMAL),
 *      di dalam kelas yang sama urutkan berdasarkan waktu pengajuan (FCFS).
 *   2. Untuk setiap permintaan, pilih slot TERBAIK yang tersedia saat itu
 *      (hari terawal → sesi terawal → konselor dengan beban paling ringan),
 *      dengan kendala:
 *        - satu konselor maksimal satu sesi per slot (tanpa bentrok),
 *        - kuota sesi per konselor per hari tidak boleh terlampaui,
 *        - kasus DARURAT harus selesai ≤ 48 jam (di luar preferensi bila
 *          perlu — keputusan tercatat untuk audit),
 *        - kasus SEDANG fallback ke hari apa pun bila preferensi penuh,
 *        - kasus NORMAL hanya mengikuti preferensi (menunggu bila penuh).
 *   3. Jejak keputusan disimpan untuk ditampilkan (explainability).
 */

import { LABEL_KELAS, type KelasPrioritas } from './dataset';

export const HARI_KERJA = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const;
export const KODE_SESI = ['S1', 'S2', 'S3', 'S4'] as const;

export const LABEL_SESI: Record<string, string> = {
  S1: 'S1 · 08.00–09.30',
  S2: 'S2 · 09.30–11.00',
  S3: 'S3 · 13.00–14.30',
  S4: 'S4 · 14.30–16.00',
};

export interface ItemPermintaan {
  id: string;
  nama: string;
  prioritas: KelasPrioritas;
  prefHari: string[]; // nama hari (Senin..Jumat), boleh kosong
  prefSesi: string[]; // kode sesi (S1..S4), boleh kosong
  createdAt: string; // ISO datetime
}

export interface KonselorInfo {
  id: string;
  nama: string;
  kuotaHarian: number;
}

export interface BookingAda {
  tanggal: string; // yyyy-mm-dd
  sesi: string; // S1..S4
  konselorId: string;
}

export interface HasilPenugasan {
  id: string;
  nama: string;
  prioritas: KelasPrioritas;
  tanggal: string;
  hari: string;
  sesi: string;
  konselorId: string;
  konselorNama: string;
  melanggarPreferensi: boolean;
  tungguHari: number;
  dalamTenggat: boolean;
}

export interface ItemGagal {
  id: string;
  nama: string;
  prioritas: KelasPrioritas;
  alasan: string;
}

export interface MetrikPenjadwalan {
  totalPermintaan: number;
  terjadwal: number;
  belumTerjadwal: number;
  konflikSlot: number; // validasi; harus 0
  pelanggaranPreferensi: number;
  perPrioritas: Record<
    KelasPrioritas,
    { permintaan: number; terjadwal: number; tungguRataHari: number; tungguMaksHari: number; dalamTenggat: number }
  >;
  bebanKonselor: Record<string, number>;
  totalKuota: number;
  terpakaiKuota: number;
}

export interface HasilGreedy {
  penugasan: HasilPenugasan[];
  gagal: ItemGagal[];
  metrik: MetrikPenjadwalan;
  jejakKeputusan: string[];
}

// ---------------------------------------------------------------------------
// Util tanggal
// ---------------------------------------------------------------------------
function keTanggalIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const t = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${t}`;
}

function dariTanggalIso(s: string): Date {
  const [y, m, t] = s.split('-').map(Number);
  return new Date(y, m - 1, t);
}

/** N working-day berikutnya (Senin–Jumat), mulai dari `mulai`. */
export function hariKerjaBerikutnya(mulai: Date, n: number): { tanggal: string; hari: string }[] {
  const hasil: { tanggal: string; hari: string }[] = [];
  const kursor = new Date(mulai.getFullYear(), mulai.getMonth(), mulai.getDate());
  while (hasil.length < n) {
    const namaHari = HARI_KERJA[kursor.getDay() - 1];
    if (kursor.getDay() >= 1 && kursor.getDay() <= 5) {
      hasil.push({ tanggal: keTanggalIso(kursor), hari: namaHari });
    }
    kursor.setDate(kursor.getDate() + 1);
  }
  return hasil;
}

function bedaHari(iso1: string, iso2: string): number {
  // hari (iso2) − hari (iso1), dibulatkan ke bawah
  const d1 = dariTanggalIso(iso1).getTime();
  const d2 = dariTanggalIso(iso2).getTime();
  return Math.floor((d2 - d1) / 86400000);
}

// ---------------------------------------------------------------------------
// Penjadwal Greedy
// ---------------------------------------------------------------------------
const URUTAN_PRIORITAS: Record<KelasPrioritas, number> = {
  DARURAT: 0,
  SEDANG: 1,
  NORMAL: 2,
};

const HORIZON_HARI_KERJA = 10;

export function jalankanGreedy(input: {
  permintaan: ItemPermintaan[];
  konselor: KonselorInfo[];
  bookingAda: BookingAda[];
  hariIni: Date;
  horizon?: number;
}): HasilGreedy {
  const { permintaan, konselor, bookingAda, hariIni } = input;
  const horizon = input.horizon ?? HORIZON_HARI_KERJA;
  const kalender = hariKerjaBerikutnya(hariIni, horizon); // [0] = hari ini/besok kerja

  // Peta pemakaian kuota & slot yang sudah ada di database.
  const terpakaiHarian = new Map<string, number>(); // `${konselorId}|${tanggal}` → jumlah sesi
  const slotDipakai = new Set<string>(); // `${konselorId}|${tanggal}|${sesi}`
  for (const b of bookingAda) {
    slotDipakai.add(`${b.konselorId}|${b.tanggal}|${b.sesi}`);
    const k = `${b.konselorId}|${b.tanggal}`;
    terpakaiHarian.set(k, (terpakaiHarian.get(k) ?? 0) + 1);
  }

  // Urutkan: prioritas → FCFS
  const antrean = [...permintaan].sort((a, b) => {
    const p = URUTAN_PRIORITAS[a.prioritas] - URUTAN_PRIORITAS[b.prioritas];
    if (p !== 0) return p;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  const penugasan: HasilPenugasan[] = [];
  const gagal: ItemGagal[] = [];
  const jejak: string[] = [];
  let pelanggaranPreferensi = 0;
  let no = 0;

  for (const item of antrean) {
    no++;
    const prefHari = item.prefHari.filter((h) => (HARI_KERJA as readonly string[]).includes(h));
    const prefSesi = item.prefSesi.filter((s) => (KODE_SESI as readonly string[]).includes(s));
    const dibuatPada = dariTanggalIso(keTanggalIso(new Date(item.createdAt)));
    const dibuatIso = keTanggalIso(dibuatPada);

    // Daftar tanggal kandidat sesuai aturan per prioritas.
    let tanggalKandidat: { tanggal: string; hari: string }[];
    let tenggatIso: string | null = null;
    let bolehLewatPreferensi = false;

    if (item.prioritas === 'DARURAT') {
      const tenggat = new Date(dibuatPada.getTime() + 48 * 3600 * 1000);
      tenggatIso = keTanggalIso(tenggat);
      tanggalKandidat = kalender.filter((d) => bedaHari(dibuatIso, d.tanggal) >= 0 && d.tanggal <= tenggatIso!);
      bolehLewatPreferensi = true; // tenggat mengalahkan preferensi
    } else if (item.prioritas === 'SEDANG') {
      tanggalKandidat = kalender.filter((d) => bedaHari(dibuatIso, d.tanggal) >= 0);
    } else {
      tanggalKandidat = kalender.filter((d) => bedaHari(dibuatIso, d.tanggal) >= 0);
    }

    // Utamakan hari yang sesuai preferensi, sisanya sebagai fallback
    // (DARURAT & SEDANG boleh fallback; NORMAL tidak).
    const dalamPref = tanggalKandidat.filter((d) => prefHari.length === 0 || prefHari.includes(d.hari));
    const luarPref = tanggalKandidat.filter((d) => prefHari.length > 0 && !prefHari.includes(d.hari));

    const urutanTanggal: { tanggal: string; hari: string; lewatPref: boolean }[] = [
      ...dalamPref.map((d) => ({ ...d, lewatPref: false })),
      ...(bolehLewatPreferensi ? luarPref.map((d) => ({ ...d, lewatPref: true })) : []),
    ];

    let ditemukan: HasilPenugasan | null = null;

    for (const kandidat of urutanTanggal) {
      // urutan sesi: preferensi dulu, lalu S1..S4
      const sesiPref = prefSesi.filter((s) => (KODE_SESI as readonly string[]).includes(s));
      const sesiUrut: { kode: string; lewatPref: boolean }[] = [
        ...sesiPref.map((s) => ({ kode: s, lewatPref: false })),
        ...(item.prioritas !== 'NORMAL' || prefSesi.length === 0
          ? KODE_SESI.filter((s) => !sesiPref.includes(s)).map((s) => ({ kode: s, lewatPref: prefSesi.length > 0 }))
          : []),
      ];

      // Konselor dengan beban paling ringan di hari itu (load balancing).
      const bebanHariIni = konselor
        .map((k) => ({ k, beban: terpakaiHarian.get(`${k.id}|${kandidat.tanggal}`) ?? 0 }))
        .sort((a, b) => a.beban - b.beban);

      for (const sesi of sesiUrut) {
        for (const { k, beban } of bebanHariIni) {
          const kunciSlot = `${k.id}|${kandidat.tanggal}|${sesi.kode}`;
          if (slotDipakai.has(kunciSlot)) continue;
          if (beban >= k.kuotaHarian) continue;

          // Ditemukan slot terbaik — catat.
          slotDipakai.add(kunciSlot);
          terpakaiHarian.set(`${k.id}|${kandidat.tanggal}`, beban + 1);

          const tunggu = Math.max(0, bedaHari(dibuatIso, kandidat.tanggal));
          const lewatPref = kandidat.lewatPref || sesi.lewatPref;
          if (lewatPref) pelanggaranPreferensi++;
          const dalamTenggat = tenggatIso ? kandidat.tanggal <= tenggatIso : true;

          ditemukan = {
            id: item.id,
            nama: item.nama,
            prioritas: item.prioritas,
            tanggal: kandidat.tanggal,
            hari: kandidat.hari,
            sesi: sesi.kode,
            konselorId: k.id,
            konselorNama: k.nama,
            melanggarPreferensi: lewatPref,
            tungguHari: tunggu,
            dalamTenggat,
          };

          jejak.push(
            `${no}. [${item.prioritas}] ${item.nama} → ${kandidat.hari} ${LABEL_SESI[sesi.kode]}, ${k.nama}` +
              (lewatPref ? ' (preferensi dilanggar demi prioritas)' : '') +
              (tenggatIso ? ` (tenggat ${tenggatIso})` : '')
          );
          break;
        }
        if (ditemukan) break;
      }
      if (ditemukan) break;
    }

    if (ditemukan) {
      penugasan.push(ditemukan);
    } else {
      const alasan =
        item.prioritas === 'NORMAL' && prefHari.length > 0
          ? 'Tidak ada slot pada preferensi hari (kasus Normal tidak melewati preferensi)'
          : 'Kuota konselor penuh pada horizon jadwal';
      gagal.push({ id: item.id, nama: item.nama, prioritas: item.prioritas, alasan });
      jejak.push(`${no}. [${item.prioritas}] ${item.nama} → TIDAK TERJADWAL (${alasan})`);
    }
  }

  // Validasi anti-bentrok (harus 0 — slot unik dijaga saat penugasan).
  const setSlot = new Set<string>();
  let konflik = 0;
  for (const p of penugasan) {
    const kunci = `${p.konselorId}|${p.tanggal}|${p.sesi}`;
    if (setSlot.has(kunci)) konflik++;
    setSlot.add(kunci);
  }

  // Metrik per prioritas.
  const perPrioritas = {} as MetrikPenjadwalan['perPrioritas'];
  for (const kelas of LABEL_KELAS) {
    const semua = antrean.filter((a) => a.prioritas === kelas);
    const sukses = penugasan.filter((p) => p.prioritas === kelas);
    const tunggu = sukses.map((p) => p.tungguHari);
    perPrioritas[kelas] = {
      permintaan: semua.length,
      terjadwal: sukses.length,
      tungguRataHari: tunggu.length ? tunggu.reduce((a, b) => a + b, 0) / tunggu.length : 0,
      tungguMaksHari: tunggu.length ? Math.max(...tunggu) : 0,
      dalamTenggat: sukses.filter((p) => p.dalamTenggat).length,
    };
  }

  const bebanKonselor: Record<string, number> = {};
  for (const p of penugasan) bebanKonselor[p.konselorNama] = (bebanKonselor[p.konselorNama] ?? 0) + 1;
  const totalKuota = konselor.reduce((a, k) => a + k.kuotaHarian, 0) * horizon;

  return {
    penugasan,
    gagal,
    metrik: {
      totalPermintaan: antrean.length,
      terjadwal: penugasan.length,
      belumTerjadwal: gagal.length,
      konflikSlot: konflik,
      pelanggaranPreferensi,
      perPrioritas,
      bebanKonselor,
      totalKuota,
      terpakaiKuota: penugasan.length,
    },
    jejakKeputusan: jejak,
  };
}
