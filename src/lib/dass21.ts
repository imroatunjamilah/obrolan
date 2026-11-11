// Port 1:1 dari app/services/dass21_questions.py + dass21_scoring.py (proyek riset UPA BK UTM).
//
// CATATAN VALIDASI: redaksi pertanyaan adalah terjemahan kerja DASS-21
// (Lovibond & Lovibond, 1995) dan harus direview/disetujui UPA BK sebelum
// dipakai untuk layanan sesungguhnya.
//
// PERINGATAN KLINIS (WAJIB DIPATUHI):
// - Skor ini ALAT SKRINING, bukan diagnosis.
// - Kategori di bawah adalah cut-off publikasi umum DASS-21 dan BUKAN kategori
//   resmi UPA BK.
// - Skor/kategori TIDAK PERNAH ditampilkan kepada mahasiswa (hanya petugas).

export const SCORING_VERSION = 'DASS21-ID-STD-1.0';

export const INTRO_DASS21 =
  'Pernyataan berikut berkaitan dengan cara Anda merasa dan berperilaku ' +
  'selama 7 hari terakhir. Tidak ada jawaban benar atau salah. Pilihlah ' +
  'jawaban yang paling menggambarkan kondisi Anda. Jawaban Anda bersifat ' +
  'rahasia: hasilnya hanya dapat diakses oleh petugas UPA BK dan tidak ' +
  'ditampilkan kepada mahasiswa.';

export const DASS21_CONFIRMATION_MESSAGE =
  'Terima kasih! Jawaban skrining Anda telah tersimpan dan akan ditinjau ' +
  'oleh petugas UPA BK. Sesuai kebijakan layanan, hasil tidak ditampilkan ' +
  'kepada mahasiswa.';

export const SEVERITY_DISCLAIMER =
  'Kategori umum berdasarkan cut-off publikasi DASS-21 (Lovibond & Lovibond, 1995). ' +
  'Bukan kategori resmi UPA BK, bukan diagnosis, dan tidak ditampilkan kepada mahasiswa.';

export interface Dass21Question {
  no: number;
  subscale: 'depresi' | 'kecemasan' | 'stres';
  text: string;
}

// (nomor, subskala, teks)
export const DASS21_QUESTIONS: Dass21Question[] = [
  { no: 1, subscale: 'stres', text: 'Saya merasa sulit untuk menjadi tenang (sulit rileks).' },
  { no: 2, subscale: 'kecemasan', text: 'Saya merasa mulut saya kering.' },
  { no: 3, subscale: 'depresi', text: 'Saya merasa tidak ada perasaan positif sama sekali.' },
  {
    no: 4,
    subscale: 'kecemasan',
    text: 'Saya mengalami gangguan pernapasan (misalnya bernapas cepat atau sesak) tanpa melakukan aktivitas fisik yang berat.',
  },
  { no: 5, subscale: 'depresi', text: 'Saya merasa sulit memiliki inisiatif untuk memulai sesuatu.' },
  { no: 6, subscale: 'stres', text: 'Saya cenderung bereaksi berlebihan terhadap situasi.' },
  { no: 7, subscale: 'kecemasan', text: 'Saya merasa tubuh saya gemetar (misalnya tangan terasa gemetar).' },
  { no: 8, subscale: 'stres', text: 'Saya merasa telah menghabiskan banyak energi karena cemas.' },
  {
    no: 9,
    subscale: 'kecemasan',
    text: 'Saya merasa khawatir dengan situasi di mana saya bisa panik dan mempermalukan diri.',
  },
  { no: 10, subscale: 'depresi', text: 'Saya merasa tidak ada lagi hal yang bisa saya harapkan.' },
  { no: 11, subscale: 'stres', text: 'Saya merasa gelisah dan sulit untuk menenangkan diri.' },
  { no: 12, subscale: 'stres', text: 'Saya merasa sulit untuk bersantai.' },
  { no: 13, subscale: 'depresi', text: 'Saya merasa sedih dan murung.' },
  {
    no: 14,
    subscale: 'stres',
    text: 'Saya merasa tidak sabar atau mudah marah ketika menghadapi hambatan.',
  },
  { no: 15, subscale: 'kecemasan', text: 'Saya merasa hampir mengalami kepanikan.' },
  { no: 16, subscale: 'depresi', text: 'Saya merasa tidak dapat bersemangat terhadap apa pun.' },
  { no: 17, subscale: 'depresi', text: 'Saya merasa hidup saya tidak berharga.' },
  {
    no: 18,
    subscale: 'stres',
    text: 'Saya merasa sulit untuk mentoleransi gangguan terhadap hal yang sedang saya lakukan.',
  },
  {
    no: 19,
    subscale: 'kecemasan',
    text: 'Saya menyadari detak jantung saya padahal tidak sedang melakukan aktivitas fisik.',
  },
  { no: 20, subscale: 'kecemasan', text: 'Saya merasa takut tanpa alasan yang jelas.' },
  { no: 21, subscale: 'depresi', text: 'Saya merasa hidup saya tidak bermakna.' },
];

// Opsi jawaban standar DASS-21 (frekuensi dalam 7 hari terakhir)
export const DASS21_ANSWER_OPTIONS = [
  { nilai: 0, label: 'Tidak sama sekali' },
  { nilai: 1, label: 'Sedikit, atau sesekali' },
  { nilai: 2, label: 'Sedang, atau sering' },
  { nilai: 3, label: 'Sangat cocok, atau hampir selalu' },
] as const;

export const SUBSCALE_ITEMS: Record<string, number[]> = {
  depresi: [3, 5, 10, 13, 16, 17, 21],
  kecemasan: [2, 4, 7, 9, 15, 19, 20],
  stres: [1, 6, 8, 11, 12, 14, 18],
};

// Cut-off publikasi umum (Lovibond & Lovibond, 1995)
export const SEVERITY_BANDS: Record<string, Array<[number, number, string]>> = {
  depresi: [
    [0, 9, 'Normal'],
    [10, 13, 'Ringan'],
    [14, 20, 'Sedang'],
    [21, 27, 'Berat'],
    [28, Number.MAX_SAFE_INTEGER, 'Sangat Berat'],
  ],
  kecemasan: [
    [0, 7, 'Normal'],
    [8, 9, 'Ringan'],
    [10, 14, 'Sedang'],
    [15, 19, 'Berat'],
    [20, Number.MAX_SAFE_INTEGER, 'Sangat Berat'],
  ],
  stres: [
    [0, 14, 'Normal'],
    [15, 18, 'Ringan'],
    [19, 25, 'Sedang'],
    [26, 33, 'Berat'],
    [34, Number.MAX_SAFE_INTEGER, 'Sangat Berat'],
  ],
};

export function validateAnswers(jawaban: unknown): jawaban is Record<string, number> {
  if (typeof jawaban !== 'object' || jawaban === null || Array.isArray(jawaban)) return false;
  const map = jawaban as Record<string, unknown>;
  for (let i = 1; i <= 21; i++) {
    const v = map[String(i)];
    if (typeof v !== 'number' || !Number.isInteger(v) || v < 0 || v > 3) return false;
  }
  return true;
}

export interface Dass21Scores {
  skorDepresi: number;
  skorKecemasan: number;
  skorStres: number;
}

/** Skor per subskala = jumlah 7 item × 2 (setara DASS-42). */
export function scoreAnswers(jawaban: Record<string, number>): Dass21Scores {
  const sum = (items: number[]) =>
    items.reduce((acc, i) => acc + jawaban[String(i)], 0) * 2;
  return {
    skorDepresi: sum(SUBSCALE_ITEMS.depresi),
    skorKecemasan: sum(SUBSCALE_ITEMS.kecemasan),
    skorStres: sum(SUBSCALE_ITEMS.stres),
  };
}

/** Kategori tingkat keparahan umum — hanya untuk petugas. */
export function classifySubscale(subscale: string, score: number): string {
  const bands = SEVERITY_BANDS[subscale];
  if (!bands) throw new Error(`Subskala tidak dikenal: ${subscale}`);
  for (const [low, high, label] of bands) {
    if (score >= low && score <= high) return label;
  }
  return 'Tidak terkategori';
}
