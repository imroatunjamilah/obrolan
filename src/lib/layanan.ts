// Port dari app/services/options.py — sumber tunggal opsi form pendaftaran
// (dipakai API dan frontend).

export const JENIS_LAYANAN = [
  'Konseling Individu',
  'Konseling Kelompok',
  'Konsultasi Karier',
  'Edukasi Kesehatan Mental',
  'Lainnya',
] as const;

export const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'] as const;

export const WAKTU = [
  'Pagi (08.00-11.00)',
  'Siang (11.00-14.00)',
  'Sore (14.00-17.00)',
] as const;

export const FOLLOWUP_STATUSES = [
  'menunggu_ditinjau',
  'sedang_diproses',
  'dijadwalkan',
  'selesai',
  'perlu_ditinjau_segera',
] as const;

export const FOLLOWUP_LABELS: Record<string, string> = {
  menunggu_ditinjau: 'Menunggu ditinjau',
  sedang_diproses: 'Sedang diproses',
  dijadwalkan: 'Dijadwalkan',
  selesai: 'Selesai',
  perlu_ditinjau_segera: 'Perlu ditinjau segera',
};
