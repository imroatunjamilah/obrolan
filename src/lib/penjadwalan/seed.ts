/**
 * Seed data DUMMY untuk Modul KP Penjadwalan Konseling.
 * Semua identitas mahasiswa di bawah adalah fiktif. Idempoten: hanya
 * mengisi tabel kosong, tidak pernah menyentuh data milik aplikasi riset.
 */

import { db } from '@/lib/db';
import { getEngine } from './klasifikasi';
import { hariKerjaBerikutnya } from './penjadwalan';

const KONSELOR_DUMMY = [
  { nama: 'Rina Hartati, M.Psi.', spesialisasi: 'Konseling Pribadi–Sosial', kuotaHarian: 3 },
  { nama: 'Ahmad Fauzi, M.Psi.', spesialisasi: 'Konseling Akademik & Karier', kuotaHarian: 3 },
  { nama: 'Dewi Lestari, M.Psi.', spesialisasi: 'Kesehatan Mental & Krisis', kuotaHarian: 2 },
  { nama: 'Yoga Prasetyo, M.Psi.', spesialisasi: 'Pengembangan Diri Mahasiswa', kuotaHarian: 3 },
];

interface SeedItem {
  nama: string;
  nim: string;
  prodi: string;
  kontak: string;
  keluhan: string;
  prefHari: string[];
  prefSesi: string[];
  umurJam: number; // berapa jam lalu diajukan
  status?: 'menunggu' | 'terjadwal' | 'selesai' | 'ditolak';
  catatan?: string;
}

const PERMINTAAN_DUMMY: SeedItem[] = [
  { nama: 'Siti Rahma', nim: '2311001', prodi: 'Teknik Informatika', kontak: '081234000001', keluhan: 'Aku tidak tahan lagi, setiap malam aku berpikir untuk mengakhiri hidup', prefHari: [], prefSesi: [], umurJam: 3 },
  { nama: 'Bagus Prakoso', nim: '2211002', prodi: 'Manajemen', kontak: '081234000002', keluhan: 'Aku sering terbangun dini hari karena cemas soal tugas menumpuk', prefHari: ['Selasa', 'Kamis'], prefSesi: ['S2'], umurJam: 26, status: 'terjadwal' },
  { nama: 'Nadya Putri', nim: '2311003', prodi: 'Akuntansi', kontak: '081234000003', keluhan: 'Ingin konsultasi cara menyusun rencana belajar semester depan', prefHari: ['Senin'], prefSesi: ['S1'], umurJam: 40 },
  { nama: 'Rizky Maulana', nim: '2211004', prodi: 'Kesehatan Masyarakat', kontak: '081234000004', keluhan: 'Aku mengalami serangan panik hebat tadi pagi sampai sesak napas', prefHari: [], prefSesi: [], umurJam: 5 },
  { nama: 'Tania Kusuma', nim: '2311005', prodi: 'PGSD', kontak: '081234000005', keluhan: 'Aku rindu rumah sampai sulit fokus dan sering menangis diam-diam', prefHari: ['Rabu'], prefSesi: ['S3'], umurJam: 52 },
  { nama: 'Farel Saputra', nim: '2211006', prodi: 'Teknik Sipil', kontak: '081234000006', keluhan: 'Mau tanya tips mengatur waktu antara organisasi dan kuliah', prefHari: [], prefSesi: ['S4'], umurJam: 65 },
  { nama: 'Ayu Wulandari', nim: '2311007', prodi: 'Ilmu Komunikasi', kontak: '081234000007', keluhan: 'Aku menyayat tanganku karena merasa sangat tertekan belakangan', prefHari: [], prefSesi: [], umurJam: 1 },
  { nama: 'Dimas Anggara', nim: '2111008', prodi: 'Administrasi Bisnis', kontak: '081234000008', keluhan: 'Aku baru putus dan motivasi belajarku hilang, sulit tidur nyenyak', prefHari: ['Kamis'], prefSesi: ['S1'], umurJam: 30, status: 'terjadwal' },
  { nama: 'Lestari Ningsih', nim: '2311009', prodi: 'Teknik Informatika', kontak: '081234000009', keluhan: 'Ingin meningkatkan kemampuan berbicara di depan umum', prefHari: ['Jumat'], prefSesi: ['S2'], umurJam: 80 },
  { nama: 'Yogi Ramadhan', nim: '2211010', prodi: 'Manajemen', kontak: '081234000010', keluhan: 'Aku khawatir berlebihan soal cicilan dan nilai menurun terus', prefHari: ['Senin', 'Selasa'], prefSesi: [], umurJam: 44 },
  { nama: 'Karina Melati', nim: '2311011', prodi: 'Akuntansi', kontak: '081234000011', keluhan: 'Aku merasa diburu bayangan yang menyuruhku melompat dari atap', prefHari: [], prefSesi: [], umurJam: 2 },
  { nama: 'Hendra Wijaya', nim: '2211012', prodi: 'Kesehatan Masyarakat', kontak: '081234000012', keluhan: 'Saya mau berdiskusi soal beasiswa yang bisa diajukan', prefHari: ['Rabu'], prefSesi: ['S1'], umurJam: 100, status: 'selesai' },
  { nama: 'Putri Ayu Lestari', nim: '2311013', prodi: 'PGSD', kontak: '081234000013', keluhan: 'Aku sulit berkonsentrasi sejak bertengkar dengan sahabat kamar', prefHari: ['Selasa'], prefSesi: ['S3'], umurJam: 58 },
  { nama: 'Rian Hidayat', nim: '2211014', prodi: 'Teknik Sipil', kontak: '081234000014', keluhan: 'Aku ingin tahu cara membuat cv untuk magang tahun depan', prefHari: [], prefSesi: ['S1'], umurJam: 120 },
  { nama: 'Mega Utami', nim: '2311015', prodi: 'Ilmu Komunikasi', kontak: '081234000015', keluhan: 'Aku takut keluar kamar karena diganggu terus oleh seseorang', prefHari: [], prefSesi: [], umurJam: 6 },
  { nama: 'Anton Bahtiar', nim: '2111016', prodi: 'Administrasi Bisnis', kontak: '081234000016', keluhan: 'Aku sering menangis sendirian dan merasa tidak berguna belakangan ini', prefHari: ['Jumat'], prefSesi: ['S4'], umurJam: 70 },
  { nama: 'Nadia Zahra', nim: '2311017', prodi: 'Teknik Informatika', kontak: '081234000017', keluhan: 'Aku ingin konsultasi mengatur keuangan sederhana sebagai mahasiswa', prefHari: ['Kamis'], prefSesi: ['S2'], umurJam: 90, status: 'ditolak', catatan: 'Di luar lingkup layanan UPA BK — diarahkan ke unit bantuan keuangan kampus.' },
  { nama: 'Ilham Nur', nim: '2211018', prodi: 'Manajemen', kontak: '081234000018', keluhan: 'Aku lelah terus, tugas menumpuk, dan mulai kesulitan bangun pagi', prefHari: ['Senin'], prefSesi: ['S4'], umurJam: 35 },
];

let sedangSeed = false;

/**
 * Pastikan data dummy tersedia. Aman dipanggil berulang dari route mana pun.
 */
export async function ensureSeed(): Promise<void> {
  if (sedangSeed) return;
  sedangSeed = true;
  try {
    const jumlahKonselor = await db.konselor.count();
    if (jumlahKonselor === 0) {
      await db.konselor.createMany({ data: KONSELOR_DUMMY });
    }

    const jumlahPermintaan = await db.permintaanKonseling.count();
    if (jumlahPermintaan > 0) return;

    const engine = getEngine();
    const konselor = await db.konselor.findMany({ orderBy: { nama: 'asc' } });
    const hariKerja = hariKerjaBerikutnya(new Date(), 10);
    const sekarang = Date.now();

    let slotTerjadwal = 0;
    for (const item of PERMINTAAN_DUMMY) {
      const h = engine.klasifikasi(item.keluhan);
      const dibuat = new Date(sekarang - item.umurJam * 3600 * 1000);

      let jadwal: {
        jadwalTanggal: string;
        jadwalHari: string;
        jadwalSesi: string;
        konselorId: string;
      } | null = null;

      if (item.status === 'terjadwal') {
        const hari = hariKerja[0];
        const sesi = slotTerjadwal === 0 ? 'S1' : 'S2';
        const target = konselor[0] ?? konselor[slotTerjadwal % Math.max(1, konselor.length)];
        if (target && hari) {
          jadwal = {
            jadwalTanggal: hari.tanggal,
            jadwalHari: hari.hari,
            jadwalSesi: sesi,
            konselorId: target.id,
          };
          slotTerjadwal++;
        }
      } else if (item.status === 'selesai') {
        const hari = hariKerja[0];
        const target = konselor[1] ?? konselor[0];
        if (target && hari) {
          jadwal = {
            jadwalTanggal: hari.tanggal,
            jadwalHari: hari.hari,
            jadwalSesi: 'S3',
            konselorId: target.id,
          };
        }
      }

      await db.permintaanKonseling.create({
        data: {
          nama: item.nama,
          nim: item.nim,
          prodi: item.prodi,
          kontak: item.kontak,
          keluhan: item.keluhan,
          prefHari: JSON.stringify(item.prefHari),
          prefSesi: JSON.stringify(item.prefSesi),
          prioritas: h.prioritas,
          confidence: h.confidence,
          modelDigunakan: h.modelDigunakan,
          skorKelas: JSON.stringify(h.skorKelas),
          kataKunci: JSON.stringify(h.kataKunci),
          status: item.status ?? 'menunggu',
          catatanPetugas: item.catatan ?? null,
          createdAt: dibuat,
          ...(jadwal ? { ...jadwal, status: item.status ?? 'menunggu' } : {}),
        },
      });
    }
  } finally {
    sedangSeed = false;
  }
}
