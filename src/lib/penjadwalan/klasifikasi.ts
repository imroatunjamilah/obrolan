/**
 * Modul klasifikasi urgensi keluhan — Modul KP Penjadwalan Konseling.
 *
 * Pipeline (metodologi mengikuti Suherman & Ismail, 2026 — JISTI):
 *   teks → pra-pemrosesan → TF-IDF → klasifikasi 3 kelas
 *   (DARURAT / SEDANG / NORMAL) dengan tiga model yang dibandingkan:
 *     1. Multinomial Naive Bayes
 *     2. SVM linear (one-vs-rest, averaged SGD hinge loss)
 *     3. Logistic Regression (softmax, full-batch gradient descent)
 *
 * Semua implementasi TypeScript murni dan deterministik (RNG ber-seed),
 * tanpa dependensi eksternal, sehingga metrik dapat direproduksi untuk
 * laporan KP. Evaluasi memakai pembagian latih-uji 80/20 berstrata.
 */

import { tokenisasi } from './teks';
import { DATASET, LABEL_KELAS, type KelasPrioritas, type ContohKeluhan } from './dataset';

export type ModelKey = 'naive_bayes' | 'svm' | 'logistic_regression';

export const NAMA_MODEL: Record<ModelKey, string> = {
  naive_bayes: 'Naive Bayes (Multinomial)',
  svm: 'SVM Linear (OvR)',
  logistic_regression: 'Logistic Regression (Softmax)',
};

export interface MetrikPerKelas {
  presisi: number;
  recall: number;
  f1: number;
  dukungan: number;
}

export interface MetrikModel {
  akurasi: number;
  presisiMacro: number;
  recallMacro: number;
  f1Macro: number;
  perKelas: Record<KelasPrioritas, MetrikPerKelas>;
  matriks: number[][]; // baris = kelas sebenarnya, kolom = prediksi
}

export interface HasilKlasifikasi {
  prioritas: KelasPrioritas;
  confidence: number;
  modelDigunakan: ModelKey;
  skorKelas: Record<KelasPrioritas, number>;
  kataKunci: string[];
  prediksiPerModel: Record<ModelKey, { kelas: KelasPrioritas; confidence: number }>;
}

export interface HasilEvaluasi {
  jumlahData: number;
  jumlahLatih: number;
  jumlahUji: number;
  komposisi: Record<KelasPrioritas, number>;
  model: Record<ModelKey, MetrikModel>;
  terbaik: ModelKey;
}

// ---------------------------------------------------------------------------
// PRNG deterministik (mulberry32) agar pembagian data & SGD reproducible.
// ---------------------------------------------------------------------------
function buatRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function acakArray<T>(arr: T[], rng: () => number): T[] {
  const hasil = [...arr];
  for (let i = hasil.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [hasil[i], hasil[j]] = [hasil[j], hasil[i]];
  }
  return hasil;
}

function softmax(z: number[]): number[] {
  const maks = Math.max(...z);
  const exp = z.map((v) => Math.exp(v - maks));
  const total = exp.reduce((a, b) => a + b, 0);
  return exp.map((v) => v / total);
}

// ---------------------------------------------------------------------------
// TF-IDF Vectorizer
// ---------------------------------------------------------------------------
class TfidfVectorizer {
  kosakata: string[] = [];
  indeks = new Map<string, number>();
  idf: number[] = [];

  fit(dokumenList: string[]): void {
    const df = new Map<string, number>();
    for (const d of dokumenList) {
      const token = tokenisasi(d);
      const unik = new Set(token);
      for (const t of unik) df.set(t, (df.get(t) ?? 0) + 1);
    }
    this.kosakata = [...df.keys()];
    this.indeks = new Map(this.kosakata.map((t, i) => [t, i]));
    const N = dokumenList.length;
    this.idf = this.kosakata.map((t) => Math.log((1 + N) / (1 + (df.get(t) ?? 0))) + 1);
  }

  /** Ubah teks menjadi vektor TF-IDF ter-normalisasi L2. */
  transform(teks: string): Float64Array {
    const v = new Float64Array(this.kosakata.length);
    const token = tokenisasi(teks);
    const hitung = new Map<string, number>();
    for (const t of token) hitung.set(t, (hitung.get(t) ?? 0) + 1);
    for (const [t, c] of hitung) {
      const i = this.indeks.get(t);
      if (i === undefined) continue;
      v[i] = (1 + Math.log(c)) * this.idf[i];
    }
    let norm = 0;
    for (const x of v) norm += x * x;
    norm = Math.sqrt(norm);
    if (norm > 0) for (let i = 0; i < v.length; i++) v[i] /= norm;
    return v;
  }
}

// ---------------------------------------------------------------------------
// Multinomial Naive Bayes (dipakai pada vektor TF-IDF non-negatif)
// ---------------------------------------------------------------------------
class NaiveBayes {
  logPrior: number[] = [];
  logProb: number[][] = []; // [kelas][term]

  fit(X: Float64Array[], y: number[], nKelas: number, alpha = 0.3): void {
    const D = X[0].length;
    const jumlah = Array.from({ length: nKelas }, () => new Float64Array(D));
    const totalKelas = new Array(nKelas).fill(0);
    const N = X.length;

    for (let i = 0; i < N; i++) {
      for (let d = 0; d < D; d++) {
        if (X[i][d] > 0) {
          jumlah[y[i]][d] += X[i][d];
          totalKelas[y[i]] += X[i][d];
        }
      }
    }

    this.logPrior = LABEL_KELAS.map(
      (_, c) => Math.log(y.filter((v) => v === c).length / N)
    );

    this.logProb = jumlah.map((baris, c) => {
      const total = totalKelas[c] + alpha * D;
      return Array.from(baris, (w) => Math.log((w + alpha) / total));
    });
  }

  predictLogJoint(x: Float64Array): number[] {
    const skor = [...this.logPrior];
    for (let c = 0; c < this.logProb.length; c++) {
      let s = 0;
      for (let d = 0; d < x.length; d++) {
        if (x[d] > 0) s += x[d] * this.logProb[c][d];
      }
      skor[c] = s;
    }
    return skor;
  }

  predictProba(x: Float64Array): number[] {
    return softmax(this.predictLogJoint(x));
  }

  /** Kontribusi relatif satu term terhadap suatu kelas (untuk penjelasan). */
  bobotTerm(c: number, t: number): number {
    const logP = this.logProb[c][t];
    const rata = this.logProb.reduce((a, baris) => a + baris[t], 0) / this.logProb.length;
    return logP - rata;
  }
}

// ---------------------------------------------------------------------------
// SVM Linear one-vs-rest (averaged SGD, hinge loss)
// ---------------------------------------------------------------------------
class LinearSvmOvR {
  w: number[][] = []; // [kelas][term]
  b: number[] = [];

  fit(X: Float64Array[], y: number[], nKelas: number, seed = 42): void {
    const D = X[0].length;
    const N = X.length;
    const rng = buatRng(seed);
    const epochs = 15;
    const lr0 = 0.1;
    const lambda = 1e-4;

    this.w = [];
    this.b = [];
    for (let c = 0; c < nKelas; c++) {
      let w = new Float64Array(D);
      let bias = 0;
      let wAkum = new Float64Array(D);
      let bAkum = 0;
      let hitung = 0;
      const indeksBaris = Array.from({ length: N }, (_, i) => i);

      for (let e = 0; e < epochs; e++) {
        acakArray(indeksBaris, rng).forEach((i) => {
          const langkah = e * N + i + 1;
          const lr = lr0 / (1 + 0.01 * langkah);
          const yi = y[i] === c ? 1 : -1;
          // penurunan bobot (regularisasi)
          for (let d = 0; d < D; d++) w[d] *= 1 - lr * lambda;
          const margin = yi * (dot(w, X[i]) + bias);
          if (margin < 1) {
            for (let d = 0; d < D; d++) w[d] += lr * yi * X[i][d];
            bias += lr * yi;
          }
          for (let d = 0; d < D; d++) wAkum[d] += w[d];
          bAkum += bias;
          hitung++;
        });
      }
      this.w.push(Array.from(wAkum, (v) => v / hitung));
      this.b.push(bAkum / hitung);
    }
  }

  /** Nilai keputusan per kelas (sebelum sigmoid). */
  decision(x: Float64Array): number[] {
    return this.w.map((wc, c) => dot(wc, x) + this.b[c]);
  }

  predictProba(x: Float64Array): number[] {
    return softmax(this.decision(x).map((z) => z * 1.5));
  }

  bobotKelas(c: number): number[] {
    return this.w[c];
  }
}

// ---------------------------------------------------------------------------
// Logistic Regression softmax (full-batch gradient descent, deterministik)
// ---------------------------------------------------------------------------
class SoftmaxRegression {
  w: number[][] = []; // [kelas][term]
  b: number[] = [];

  fit(X: Float64Array[], y: number[], nKelas: number, iters = 500, lr = 0.8, lambda = 1e-3): void {
    const D = X[0].length;
    const N = X.length;
    this.w = Array.from({ length: nKelas }, () => new Array(D).fill(0));
    this.b = new Array(nKelas).fill(0);

    const Y: number[][] = X.map((_, i) =>
      LABEL_KELAS.map((_, c) => (y[i] === c ? 1 : 0))
    );

    for (let it = 0; it < iters; it++) {
      // probabilitas untuk seluruh sampel
      const P = X.map((x) => softmax(this.decision(x)));
      // gradien
      const gradW = Array.from({ length: nKelas }, () => new Array(D).fill(0));
      const gradB = new Array(nKelas).fill(0);
      for (let i = 0; i < N; i++) {
        for (let c = 0; c < nKelas; c++) {
          const err = P[i][c] - Y[i][c];
          if (err === 0) continue;
          const gi = gradW[c];
          const xi = X[i];
          for (let d = 0; d < D; d++) gi[d] += err * xi[d];
          gradB[c] += err;
        }
      }
      for (let c = 0; c < nKelas; c++) {
        for (let d = 0; d < D; d++) {
          this.w[c][d] -= lr * (gradW[c][d] / N + lambda * this.w[c][d]);
        }
        this.b[c] -= lr * (gradB[c] / N);
      }
    }
  }

  decision(x: Float64Array): number[] {
    return this.w.map((wc, c) => dot(wc, x) + this.b[c]);
  }

  predictProba(x: Float64Array): number[] {
    return softmax(this.decision(x));
  }

  bobotKelas(c: number): number[] {
    return this.w[c];
  }
}

function dot(a: Float64Array | number[], b: Float64Array): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

// ---------------------------------------------------------------------------
// Evaluasi: pembagian berstrata + metrik
// ---------------------------------------------------------------------------
interface LatihUji {
  latih: ContohKeluhan[];
  uji: ContohKeluhan[];
}

function bagiStrata(data: ContohKeluhan[], rasioUji = 0.2, seed = 2026): LatihUji {
  const rng = buatRng(seed);
  const latih: ContohKeluhan[] = [];
  const uji: ContohKeluhan[] = [];
  for (const kelas of LABEL_KELAS) {
    const grup = acakArray(
      data.filter((d) => d.kelas === kelas),
      rng
    );
    const nUji = Math.max(1, Math.round(grup.length * rasioUji));
    uji.push(...grup.slice(0, nUji));
    latih.push(...grup.slice(nUji));
  }
  return { latih, uji };
}

function indexKelas(kelas: KelasPrioritas): number {
  return LABEL_KELAS.indexOf(kelas);
}

function evaluasiModel(yTrue: KelasPrioritas[], yPred: KelasPrioritas[]): MetrikModel {
  const K = LABEL_KELAS.length;
  const matriks: number[][] = Array.from({ length: K }, () => new Array(K).fill(0));
  for (let i = 0; i < yTrue.length; i++) {
    matriks[indexKelas(yTrue[i])][indexKelas(yPred[i])] += 1;
  }
  const perKelas = {} as Record<KelasPrioritas, MetrikPerKelas>;
  const presisiArr: number[] = [];
  const recallArr: number[] = [];
  const f1Arr: number[] = [];
  for (let c = 0; c < K; c++) {
    const kelas = LABEL_KELAS[c];
    const tp = matriks[c][c];
    const fp = matriks.reduce((a, baris, r) => a + (r !== c ? baris[c] : 0), 0);
    const fn = matriks[c].reduce((a, v, p) => a + (p !== c ? v : 0), 0);
    const dukungan = matriks[c].reduce((a, v) => a + v, 0);
    const presisi = tp + fp > 0 ? tp / (tp + fp) : 0;
    const recall = dukungan > 0 ? tp / dukungan : 0;
    const f1 = presisi + recall > 0 ? (2 * presisi * recall) / (presisi + recall) : 0;
    perKelas[kelas] = { presisi, recall, f1, dukungan };
    presisiArr.push(presisi);
    recallArr.push(recall);
    f1Arr.push(f1);
  }
  const akurasi = yTrue.filter((t, i) => t === yPred[i]).length / yTrue.length;
  const rata = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  return {
    akurasi,
    presisiMacro: rata(presisiArr),
    recallMacro: rata(recallArr),
    f1Macro: rata(f1Arr),
    perKelas,
    matriks,
  };
}

// ---------------------------------------------------------------------------
// Mesin (engine) — dibangun sekali per proses
// ---------------------------------------------------------------------------
interface ModelTerlatih {
  jenis: ModelKey;
  vectorizer: TfidfVectorizer;
  nb?: NaiveBayes;
  svm?: LinearSvmOvR;
  lr?: SoftmaxRegression;
  prediksiProba(x: Float64Array): number[];
  kontribusi(c: number, d: number): number;
}

function latihModel(jenis: ModelKey, data: ContohKeluhan[]): ModelTerlatih {
  const vectorizer = new TfidfVectorizer();
  vectorizer.fit(data.map((d) => d.teks));
  const X = data.map((d) => vectorizer.transform(d.teks));
  const y = data.map((d) => indexKelas(d.kelas));
  const K = LABEL_KELAS.length;

  const model: ModelTerlatih = {
    jenis,
    vectorizer,
    prediksiProba: () => new Array(K).fill(1 / K),
    kontribusi: () => 0,
  };

  if (jenis === 'naive_bayes') {
    const nb = new NaiveBayes();
    nb.fit(X, y, K);
    model.nb = nb;
    model.prediksiProba = (x) => nb.predictProba(x);
    model.kontribusi = (c, d) => nb.bobotTerm(c, d);
  } else if (jenis === 'svm') {
    const svm = new LinearSvmOvR();
    svm.fit(X, y, K);
    model.svm = svm;
    model.prediksiProba = (x) => svm.predictProba(x);
    model.kontribusi = (c, d) => svm.bobotKelas(c)[d];
  } else {
    const lr = new SoftmaxRegression();
    lr.fit(X, y, K);
    model.lr = lr;
    model.prediksiProba = (x) => lr.predictProba(x);
    model.kontribusi = (c, d) => lr.bobotKelas(c)[d];
  }
  return model;
}

interface Engine {
  evaluasi: HasilEvaluasi;
  produksi: ModelTerlatih; // dilatih pada seluruh data, memakai arsitektur terbaik
  semuaModel: Record<ModelKey, ModelTerlatih>; // dilatih penuh, untuk perbandingan prediksi
  klasifikasi(teks: string): HasilKlasifikasi;
}

let cacheEngine: Engine | null = null;

export function getEngine(): Engine {
  if (cacheEngine) return cacheEngine;

  // 1) Evaluasi pembandingan 3 model pada pembagian latih-uji 80/20.
  const { latih, uji } = bagiStrata(DATASET);
  const metrik = {} as Record<ModelKey, MetrikModel>;
  for (const jenis of Object.keys(NAMA_MODEL) as ModelKey[]) {
    const m = latihModel(jenis, latih);
    const yTrue = uji.map((d) => d.kelas);
    const yPred = uji.map((d) => {
      const p = m.prediksiProba(m.vectorizer.transform(d.teks));
      return LABEL_KELAS[p.indexOf(Math.max(...p))];
    });
    metrik[jenis] = evaluasiModel(yTrue, yPred);
  }

  let terbaik: ModelKey = 'logistic_regression';
  for (const jenis of Object.keys(NAMA_MODEL) as ModelKey[]) {
    if (metrik[jenis].f1Macro > metrik[terbaik].f1Macro) terbaik = jenis;
  }

  // 2) Model produksi: seluruh data, arsitektur terbaik (+ model lain untuk
  //    transparansi perbandingan prediksi per pengajuan).
  const semuaModel = {} as Record<ModelKey, ModelTerlatih>;
  for (const jenis of Object.keys(NAMA_MODEL) as ModelKey[]) {
    semuaModel[jenis] = latihModel(jenis, DATASET);
  }
  const produksi = semuaModel[terbaik];

  const komposisi = {} as Record<KelasPrioritas, number>;
  for (const kelas of LABEL_KELAS) {
    komposisi[kelas] = DATASET.filter((d) => d.kelas === kelas).length;
  }

  const engine: Engine = {
    evaluasi: {
      jumlahData: DATASET.length,
      jumlahLatih: latih.length,
      jumlahUji: uji.length,
      komposisi,
      model: metrik,
      terbaik,
    },
    produksi,
    semuaModel,
    klasifikasi(teks: string): HasilKlasifikasi {
      const v = produksi.vectorizer.transform(teks);
      const proba = produksi.prediksiProba(v);
      let idx = 0;
      for (let i = 1; i < proba.length; i++) if (proba[i] > proba[idx]) idx = i;
      const prioritas = LABEL_KELAS[idx];

      // Kata kunci penunjang: term TF-IDF dengan kontribusi terbesar
      // terhadap kelas terpilih.
      const pasangan: { kata: string; skor: number }[] = [];
      const token = tokenisasi(teks);
      const terlihat = new Set<string>();
      for (const t of token) {
        const d = produksi.vectorizer.indeks.get(t);
        if (d === undefined || terlihat.has(t) || v[d] <= 0) continue;
        terlihat.add(t);
        pasangan.push({ kata: t, skor: produksi.kontribusi(idx, d) * v[d] });
      }
      pasangan.sort((a, b) => b.skor - a.skor);
      const kataKunci = pasangan.slice(0, 5).map((p) => p.kata);

      const prediksiPerModel = {} as HasilKlasifikasi['prediksiPerModel'];
      for (const jenis of Object.keys(NAMA_MODEL) as ModelKey[]) {
        const m = semuaModel[jenis];
        const p = m.prediksiProba(produksi.vectorizer.transform(teks));
        let i = 0;
        for (let k = 1; k < p.length; k++) if (p[k] > p[i]) i = k;
        prediksiPerModel[jenis] = { kelas: LABEL_KELAS[i], confidence: p[i] };
      }

      return {
        prioritas,
        confidence: proba[idx],
        modelDigunakan: terbaik,
        skorKelas: {
          DARURAT: proba[0],
          SEDANG: proba[1],
          NORMAL: proba[2],
        },
        kataKunci,
        prediksiPerModel,
      };
    },
  };

  cacheEngine = engine;
  return engine;
}
