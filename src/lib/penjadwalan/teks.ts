/**
 * Pra-pemrosesan teks keluhan bahasa Indonesia.
 * Tahap: normalisasi → case folding → tokenisasi → penghapusan stopword
 * → pemangkasan sufiks ringan (stemming sederhana).
 * Dipakai oleh modul klasifikasi urgensi (Modul KP — Penjadwalan Konseling).
 */

// Normalisasi kata informal / singkatan umum pada teks keluhan mahasiswa.
const NORMALISASI: Record<string, string> = {
  gak: 'tidak',
  nggak: 'tidak',
  ngga: 'tidak',
  gk: 'tidak',
  tdk: 'tidak',
  banget: 'sangat',
  bgt: 'sangat',
  dah: 'sudah',
  udah: 'sudah',
  aja: 'saja',
  sy: 'saya',
  aq: 'saya',
  ak: 'saya',
  km: 'kamu',
  dr: 'dari',
  dgn: 'dengan',
  krn: 'karena',
  karna: 'karena',
  sm: 'sama',
  trus: 'terus',
  bikin: 'membuat',
  bener: 'benar',
  gimana: 'bagaimana',
  gitu: 'begitu',
  kok: '',
  deh: '',
  sih: '',
  dong: '',
  nih: 'ini',
  ni: 'ini',
  wkwk: '',
  hehe: '',
};

// Stopword bahasa Indonesia (daftar ringkas, cukup untuk domain keluhan).
const STOPWORDS = new Set<string>([
  'yang', 'untuk', 'dengan', 'pada', 'dari', 'ke', 'di', 'dan', 'atau', 'tapi',
  'tetapi', 'juga', 'akan', 'sudah', 'telah', 'sedang', 'belum', 'jangan',
  'tidak', 'bukan', 'bisa', 'dapat', 'harus', 'mesti', 'saya', 'aku', 'kami',
  'kita', 'kamu', 'dia', 'ia', 'mereka', 'ini', 'itu', 'ada', 'adalah',
  'ialah', 'yaitu', 'sebagai', 'karena', 'sehingga', 'jika', 'kalau',
  'ketika', 'saat', 'agar', 'supaya', 'oleh', 'secara', 'dalam', 'luar',
  'antara', 'sampai', 'hingga', 'lebih', 'paling', 'sangat', 'sekali',
  'hanya', 'saja', 'pun', 'per', 'tiap', 'setiap', 'para', 'lah',
  'kah', 'nya', 'ku', 'mu', 'oke', 'ya', 'iya', 'halo', 'selamat', 'pagi',
  'siang', 'sore', 'malam', 'tolong', 'mau', 'ingin', 'pakai', 'buat',
  'gimana', 'begitu', 'terus', 'mas', 'mbak', 'kak', 'min', 'gitu', 'deh',
  'dong', 'sih', 'kok', 'memang', 'waktu', 'benar', 'siap',
]);

// Pemangkasan sufiks umum (satu lapis, untuk memadatkan variasi morfologi).
const SUFIKS = ['nya', 'lah', 'kah', 'pun', 'ku', 'mu', 'kan', 'an', 'i'];

function pangkasSufiks(kata: string): string {
  for (const s of SUFIKS) {
    if (kata.endsWith(s) && kata.length - s.length >= 4) {
      return kata.slice(0, kata.length - s.length);
    }
  }
  return kata;
}

/**
 * Mengubah teks keluhan menjadi array token bersih.
 * Contoh: "Saya gak bisa tidur berhari-hari!" → ["tidak", "tidur", "hari"]
 */
export function tokenisasi(teks: string): string[] {
  const kecil = teks.toLowerCase().normalize('NFC');
  const mentah = kecil
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const hasil: string[] = [];
  for (const w of mentah) {
    const dinormalisasi = Object.prototype.hasOwnProperty.call(NORMALISASI, w)
      ? NORMALISASI[w]
      : w;
    for (const fragmen of dinormalisasi.split(' ')) {
      if (!fragmen) continue;
      if (STOPWORDS.has(fragmen)) continue;
      if (fragmen.length < 3) continue;
      const pangkas = pangkasSufiks(fragmen);
      if (STOPWORDS.has(pangkas)) continue;
      hasil.push(pangkas);
    }
  }
  return hasil;
}

/** Gabungkan token menjadi dokumen ber-spasi (input vektorisasi). */
export function dokumen(teks: string): string {
  return tokenisasi(teks).join(' ');
}
