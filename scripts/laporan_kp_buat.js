// Builder Laporan KP — docx-js, mengikuti struktur template Laporan KP Zuzu
// Run: node scripts/laporan_kp_buat.js
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat, SectionType,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TabStopType, TableOfContents, VerticalAlign,
  Math: OoxmlMath, MathRun, MathFraction, MathSuperScript, MathSubScript,
  MathSubSuperScript, MathSum, MathRadical,
} = require("docx");
const fs = require("fs");
const path = require("path");

const { META, ABSTRAK, KATA_PENGANTAR, BAB1, BAB2, BAB3 } = require("./laporan_kp_konten.js");
const { BAB4, BAB5, BAB6, PUSTAKA, LAMPIRAN, DAFTAR_GAMBAR, DAFTAR_TABEL, DAFTAR_LAMPIRAN } = require("./laporan_kp_konten2.js");

// ---- Nomor halaman dua-pass ----
let NOMOR = null;
const nomorPath = path.join(__dirname, "nomor_halaman.json");
if (fs.existsSync(nomorPath)) {
  try { NOMOR = JSON.parse(fs.readFileSync(nomorPath, "utf8")); } catch (e) { NOMOR = null; }
}
const nomorGambar = DAFTAR_GAMBAR.map((g, i) => ({ ...g, p: NOMOR?.gambar?.[i] ?? g.p }));
const nomorTabel = DAFTAR_TABEL.map((t, i) => ({ ...t, p: NOMOR?.tabel?.[i] ?? t.p }));
const nomorLampiran = DAFTAR_LAMPIRAN.map((l, i) => ({ ...l, p: NOMOR?.lampiran?.[i] ?? l.p }));

// ---- Konstanta ----
const FONT = { ascii: "Times New Roman", hAnsi: "Times New Roman", eastAsia: "Times New Roman" };
const MARGIN = { top: 1701, right: 1418, bottom: 1418, left: 1701, header: 720, footer: 720 };
const CONTENT_W = 11906 - 1701 - 1418; // 8787 twips
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ---- Helper teks: parse *italic* markup ----
function runs(text, opt = {}) {
  const out = [];
  const parts = String(text).split("*");
  for (let i = 0; i < parts.length; i++) {
    if (parts[i] === "") continue;
    out.push(new TextRun({ text: parts[i], italics: i % 2 === 1 ? true : undefined, ...opt }));
  }
  return out.length ? out : [new TextRun({ text: "", ...opt })];
}

// Paragraf isi: justified, indent baris pertama 1,25 cm, spasi 1,5
function pBody(text, opt = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 709 },
    spacing: { line: 360 },
    children: runs(text, { size: 24, font: FONT }),
    ...opt,
  });
}
function pNoIndent(text, opt = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 360 },
    children: runs(text, { size: 24, font: FONT }),
    ...opt,
  });
}
// Item bernomor manual: hanging indent
function pList(text, opt = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 720, hanging: 360 },
    spacing: { line: 360 },
    children: runs(text, { size: 24, font: FONT }),
    ...opt,
  });
}
// Entri daftar pustaka: hanging indent
function pPustaka(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    indent: { left: 709, hanging: 709 },
    spacing: { line: 360, after: 120 },
    children: runs(text, { size: 24, font: FONT }),
  });
}
// Item daftar gambar/tabel: dot leader ke nomor halaman
function pDaftarEntry(text, page) {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W, leader: "dot" }],
    spacing: { line: 360 },
    children: [
      ...runs(text, { size: 24, font: FONT }),
      new TextRun({ text: "\t", size: 24, font: FONT }),
      new TextRun({ text: String(page), size: 24, font: FONT }),
    ],
  });
}

// Heading
function h1(text, { breakBefore = false, lines = null, first = false } = {}) {
  const children = [];
  if (lines) {
    lines.forEach((ln, i) => {
      if (i > 0) children.push(new TextRun({ text: "", break: 1 }));
      children.push(...runs(ln, { bold: true, size: 28, font: FONT }));
    });
  } else {
    children.push(...runs(text, { bold: true, size: 28, font: FONT }));
  }
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: first ? 0 : 360, after: 300, line: 360 },
    pageBreakBefore: breakBefore && !first,
    children,
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 160, line: 360 },
    children: runs(text, { bold: true, size: 24, font: FONT }),
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 120, line: 360 },
    children: runs(text, { bold: true, size: 24, font: FONT }),
  });
}

// Keterangan gambar/tabel
function caption(text, { above = false } = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: above ? 200 : 80, after: above ? 100 : 200, line: 300 },
    keepNext: above,
    children: runs(text, { size: 21, font: FONT }),
  });
}

// Tabel data
function cellPara(text, { bold = false, align = AlignmentType.LEFT } = {}) {
  return new Paragraph({
    alignment: align,
    spacing: { line: 276 },
    children: runs(text, { bold: bold || undefined, size: 21, font: FONT }),
  });
}
function buildTable({ header, widths, rows, centerCols = null }) {
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: header.map((t, i) => new TableCell({
      width: { size: widths[i], type: WidthType.PERCENTAGE },
      shading: { type: ShadingType.CLEAR, fill: "EFEFEF" },
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      verticalAlign: VerticalAlign.CENTER,
      children: [cellPara(t, { bold: true, align: AlignmentType.CENTER })],
    })),
  });
  const dataRows = rows.map((r) => new TableRow({
    cantSplit: true,
    children: r.map((t, i) => new TableCell({
      width: { size: widths[i], type: WidthType.PERCENTAGE },
      margins: { top: 50, bottom: 50, left: 100, right: 100 },
      verticalAlign: VerticalAlign.CENTER,
      children: [cellPara(t, { align: centerCols?.includes(i) ? AlignmentType.CENTER : AlignmentType.LEFT })],
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "9A9A9A" },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "9A9A9A" },
    },
    rows: [headerRow, ...dataRows],
  });
}

// Gambar (PNG 1440x900 -> lebar 570 px, tinggi 356 px)
function gambar(pngPath, { width = 570, height = 356, captionText = null } = {}) {
  const buf = fs.readFileSync(pngPath);
  const els = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 160, after: 60 },
      keepNext: true,
      children: [new ImageRun({ data: buf, transformation: { width, height }, type: "png" })],
    }),
  ];
  if (captionText) els.push(caption(captionText));
  return els;
}

// Persamaan: rumus di tengah + nomor di kanan
function persamaan(mathChildren, no) {
  return new Paragraph({
    tabStops: [
      { type: TabStopType.CENTER, position: Math.round(CONTENT_W / 2) },
      { type: TabStopType.RIGHT, position: CONTENT_W },
    ],
    spacing: { before: 120, after: 120, line: 360 },
    children: [
      new TextRun({ text: "\t", size: 24, font: FONT }),
      new OoxmlMath({ children: mathChildren }),
      new TextRun({ text: "\t(" + no + ")", size: 24, font: FONT }),
    ],
  });
}
const mr = (t) => new MathRun(t);
const frac = (n, d) => new MathFraction({ numerator: n, denominator: d });
const msub = (b, s) => new MathSubScript({ children: [mr(b)], subScript: [mr(s)] });
const msup = (b, s) => new MathSuperScript({ children: [mr(b)], superScript: [mr(s)] });

// ---- Halaman sampul ----
function buildCover() {
  const center = (text, { bold = true, size = 28, before = 0, after = 0, line = 400 } = {}) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before, after, line },
      children: runs(text, { bold, size, font: FONT }),
    });
  return [
    center("LAPORAN KERJA PRAKTIK", { size: 28, before: 600, after: 500 }),
    center(META.judulBaris[0], { size: 28, after: 0, line: 460 }),
    center(META.judulBaris[1], { size: 28, after: 0, line: 460 }),
    center(META.judulBaris[2], { size: 28, after: 400, line: 460 }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 300, after: 300 },
      children: [new ImageRun({
        data: fs.readFileSync("/home/z/my-project/upload/logo.jpg"),
        transformation: { width: 160, height: 160 },
        type: "jpg",
      })],
    }),
    center("Disusun Oleh:", { bold: false, size: 24, after: 100, line: 340 }),
    center(META.nama, { bold: false, size: 24, after: 40, line: 340 }),
    center(META.nim, { bold: false, size: 24, after: 500, line: 340 }),
    center("Dosen Pembimbing:", { bold: false, size: 24, after: 100, line: 340 }),
    center(META.pembimbing, { bold: false, size: 24, after: 40, line: 340 }),
    center(META.nipPembimbing, { bold: false, size: 24, after: 700, line: 340 }),
    center(META.prodi, { size: 24, after: 60, line: 360 }),
    center(META.fakultas, { size: 24, after: 60, line: 360 }),
    center(META.universitas, { size: 24, after: 60, line: 360 }),
    center(META.tahun, { size: 24, after: 0, line: 360 }),
  ];
}

// ---- Sel tanda tangan ----
function selTtd({ label, nama, nip = null, extra = null }) {
  const paras = [
    new Paragraph({ spacing: { line: 320, after: 0 }, children: runs(label, { size: 24, font: FONT }) }),
    new Paragraph({ spacing: { line: 320 }, children: [] }),
    new Paragraph({ spacing: { line: 320 }, children: [] }),
    new Paragraph({ spacing: { line: 320 }, children: [] }),
  ];
  if (extra) paras.push(new Paragraph({ spacing: { line: 320 }, children: runs(extra, { size: 24, font: FONT }) }));
  paras.push(new Paragraph({
    spacing: { line: 320 },
    children: [new TextRun({ text: nama, bold: true, underline: { type: "single" }, size: 24, font: FONT })],
  }));
  if (nip) paras.push(new Paragraph({ spacing: { line: 320 }, children: runs(nip, { size: 24, font: FONT }) }));
  return paras;
}
function tabelTtd2(kiri, kanan) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      cantSplit: true,
      children: [kiri, kanan].map((c) => new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        borders: allNoBorders,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: selTtd(c),
      })),
    })],
  });
}
function tabelTtd1(satu) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        borders: allNoBorders,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: selTtd(satu),
      })],
    })],
  });
}

// ---- Front matter ----
function buildPengesahan() {
  return [
    h1("LEMBAR PENGESAHAN", { first: true }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 300, line: 360 }, children: runs("UNIVERSITAS TRUNODJOYO MADURA", { bold: true, size: 28, font: FONT }) }),
    new Paragraph({ spacing: { after: 100, line: 360 }, children: runs("Oleh:", { size: 24, font: FONT }) }),
    new Paragraph({ spacing: { after: 40, line: 360 }, children: runs(META.nama, { size: 24, font: FONT }) }),
    new Paragraph({ spacing: { after: 300, line: 360 }, children: runs(META.nim, { size: 24, font: FONT }) }),
    new Paragraph({ spacing: { after: 300, line: 360 }, children: runs("Tanggal: " + META.tglPengesahan, { size: 24, font: FONT }) }),
    new Paragraph({ spacing: { after: 200, line: 360 }, children: runs("Disetujui Oleh:", { size: 24, font: FONT }) }),
    tabelTtd2(
      { label: "Koordinator KP", nama: META.koordinator, nip: META.nipKoordinator },
      { label: "Dosen Pembimbing KP", nama: META.pembimbing, nip: "NIP. " + META.nipPembimbing },
    ),
    new Paragraph({ spacing: { after: 200 }, children: [] }),
    tabelTtd1({ label: "Ketua Jurusan", nama: META.ketuaJurusan, nip: META.nipKetua }),
  ];
}

function buildPengesahanPerusahaan() {
  return [
    h1("LEMBAR PENGESAHAN PERUSAHAAN", { breakBefore: true }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 300, line: 360 }, children: runs("UNIVERSITAS TRUNODJOYO MADURA", { bold: true, size: 28, font: FONT }) }),
    new Paragraph({ spacing: { after: 100, line: 360 }, children: runs("Disusun oleh:", { size: 24, font: FONT }) }),
    new Paragraph({ spacing: { after: 40, line: 360 }, children: runs(META.nama, { size: 24, font: FONT }) }),
    new Paragraph({ spacing: { after: 300, line: 360 }, children: runs(META.nim, { size: 24, font: FONT }) }),
    new Paragraph({ spacing: { after: 300, line: 360 }, children: runs("Tanggal Ujian: " + META.tglUjian, { size: 24, font: FONT }) }),
    new Paragraph({ spacing: { after: 200, line: 360 }, children: runs("Disetujui oleh:", { size: 24, font: FONT }) }),
    tabelTtd2(
      { label: "UPA Layanan Bimbingan Konseling", extra: "Universitas Trunodjoyo Madura", nama: META.pembimbingLapangan },
      { label: "Pembimbing KP", nama: META.pembimbing, nip: "NIP. " + META.nipPembimbing },
    ),
  ];
}

function buildAbstrak() {
  return [
    h1("ABSTRAK", { breakBefore: true }),
    ...ABSTRAK.isi.map((t) => pNoIndent(t)),
    new Paragraph({ spacing: { before: 300, line: 360 }, children: runs("Kata kunci: ", { bold: true, size: 24, font: FONT }).concat(runs(ABSTRAK.kataKunci, { size: 24, font: FONT })) }),
  ];
}

function buildKataPengantar() {
  const els = [h1("KATA PENGANTAR", { breakBefore: true })];
  KATA_PENGANTAR.forEach((t) => els.push(pBody(t)));
  els.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 500, line: 360 }, children: runs("Bangkalan, " + META.tglPengantar, { size: 24, font: FONT }) }));
  els.push(new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 60, line: 360 }, children: runs(META.nama, { size: 24, font: FONT }) }));
  return els;
}

function buildDaftarIsi() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300, line: 360 },
      children: runs("DAFTAR ISI", { bold: true, size: 28, font: FONT }),
    }),
    new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-3" }),
    new Paragraph({
      spacing: { before: 240, line: 300 },
      children: [
        new TextRun({
          text: "Catatan: Daftar isi ini dibuat dengan kode field. Setelah dokumen disunting, klik kanan daftar isi lalu pilih \u201CUpdate Field\u201D untuk memperbarui nomor halaman.",
          italics: true, size: 18, color: "888888", font: FONT,
        }),
        new PageBreak(),
      ],
    }),
  ];
}

function buildDaftarGambar() {
  return [
    h1("DAFTAR GAMBAR", { first: true }),
    ...nomorGambar.map((g) => pDaftarEntry(g.t, g.p)),
  ];
}
function buildDaftarTabel() {
  return [
    h1("DAFTAR TABEL", { breakBefore: true }),
    ...nomorTabel.map((t) => pDaftarEntry(t.t, t.p)),
  ];
}
function buildDaftarLampiran() {
  return [
    h1("DAFTAR LAMPIRAN", { breakBefore: true }),
    ...nomorLampiran.map((l) => pDaftarEntry(l.t, l.p)),
  ];
}

// ---- BAB I ----
function buildBAB1() {
  const els = [h1(null, { lines: ["BAB I", "PENDAHULUAN"], first: true })];
  els.push(h2("1.1 Latar Belakang"));
  BAB1.latar.forEach((t) => els.push(pBody(t)));
  els.push(h2("1.2 Rumusan Masalah"));
  els.push(pBody(BAB1.rumusanIntro));
  BAB1.rumusan.forEach((t, i) => els.push(pList((i + 1) + ". " + t)));
  els.push(h2("1.3 Tujuan"));
  els.push(pBody(BAB1.tujuanIntro));
  BAB1.tujuan.forEach((t, i) => els.push(pList((i + 1) + ". " + t)));
  els.push(h2("1.4 Manfaat"));
  els.push(pBody(BAB1.manfaatIntro));
  BAB1.manfaat.forEach(([label, isi], i) => els.push(pList((i + 1) + ". " + label + isi)));
  els.push(h2("1.5 Batasan Masalah"));
  els.push(pBody(BAB1.batasanIntro));
  BAB1.batasan.forEach((t, i) => els.push(pList((i + 1) + ". " + t)));
  els.push(h2("1.6 Sistematika Penulisan"));
  els.push(pBody(BAB1.sistematikaIntro));
  BAB1.sistematika.forEach(([bab, isi]) => {
    els.push(new Paragraph({
      indent: { left: 360 },
      spacing: { before: 120, after: 40, line: 360 },
      children: runs(bab, { bold: true, size: 24, font: FONT }),
    }));
    els.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 720 },
      spacing: { after: 120, line: 360 },
      children: runs(isi, { size: 24, font: FONT }),
    }));
  });
  return els;
}

// ---- BAB II ----
function buildBAB2() {
  const els = [h1(null, { lines: ["BAB II", "PROFIL LOKASI KERJA PRAKTIK"], breakBefore: true })];
  els.push(h2("2.1 Profil Instansi"));
  BAB2.profil1.forEach((t) => els.push(pBody(t)));
  els.push(h2("2.2 Job Description Mahasiswa selama KP"));
  els.push(pBody(BAB2.jobdescIntro));
  BAB2.jobdesc.forEach(([judul, isi], i) => {
    els.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 360, hanging: 0 },
      spacing: { before: 160, after: 60, line: 360 },
      children: runs((i + 1) + ". " + judul, { bold: true, size: 24, font: FONT }),
    }));
    els.push(new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: 720 },
      spacing: { after: 80, line: 360 },
      children: runs(isi, { size: 24, font: FONT }),
    }));
  });
  els.push(pBody(BAB2.jobdescPenutup));
  return els;
}

// ---- BAB III ----
function buildBAB3() {
  const els = [h1(null, { lines: ["BAB III", "DASAR TEORI"], breakBefore: true })];
  els.push(h2("3.1 Layanan Bimbingan dan Konseling di Perguruan Tinggi"));
  BAB3.s31.forEach((t) => els.push(pBody(t)));
  els.push(h2("3.2 Klasifikasi Teks"));
  BAB3.s32.forEach((t) => els.push(pBody(t)));
  els.push(h2("3.3 Pra-pemrosesan Teks"));
  BAB3.s33.forEach((t) => els.push(pBody(t)));
  els.push(h2("3.4 Term Frequency-Inverse Document Frequency (TF-IDF)"));
  BAB3.s34.forEach((t) => els.push(pBody(t)));
  els.push(persamaan([
    mr("tf(t,d) = "),
    frac([mr("f(t,d)")], [mr("\u2211"), msub("t\u2032\u2208d", " "), mr("f(t\u2032,d)")]),
  ], 1));
  els.push(persamaan([
    mr("idf(t) = ln"),
    frac([mr("N")], [mr("df(t)")]),
    mr(" + 1"),
  ], 2));
  els.push(persamaan([
    mr("w(t,d) = tf(t,d) \u00D7 idf(t)"),
  ], 3));
  els.push(pBody("Bobot w(t,d) tinggi ketika kata t sering muncul pada dokumen d tetapi jarang muncul pada dokumen lain, sehingga kata tersebut menjadi penanda karakteristik dokumen. Vektor bobot kemudian dinormalisasi dengan norma L2 agar panjang vektor tidak dipengaruhi oleh jumlah kata pada keluhan. Pada proyek ini digunakan unigram sehingga setiap kata menjadi satu fitur."));
  els.push(h2("3.5 Naive Bayes"));
  BAB3.s35.forEach((t) => els.push(pBody(t)));
  els.push(persamaan([
    mr("\u0177 = "),
    msub("argmax", "c\u2208C"),
    mr(" P(c) "),
    new MathSubSuperScript({ children: [mr("\u220F")], subScript: [mr("i=1")], superScript: [mr("n")] }),
    mr(" P("),
    msub("t", "i"),
    mr("|c)"),
  ], 4));
  els.push(pBody("dengan C himpunan kelas urgensi (DARURAT, SEDANG, NORMAL), n jumlah kata pada keluhan, dan t\u1D62 kata ke-i hasil pra-pemrosesan. Pelatihan Multinomial Naive Bayes mengestimasi P(c) dari proporsi kelas pada data latih dan P(t|c) dari frekuensi kemunculan kata t pada kelas c dengan penghalus (smoothing) Laplace, sehingga kata baru yang belum pernah terlihat tidak membuat probabilitas menjadi nol."));
  els.push(h2("3.6 SVM Linear dan Logistic Regression"));
  BAB3.s36.forEach((t) => els.push(pBody(t)));
  els.push(persamaan([
    mr("f(x) = "),
    msup("w", "T"),
    mr("x + b"),
  ], 5));
  els.push(persamaan([
    mr("P(y = c | x) = "),
    frac([
      mr("exp("),
      new MathSubSuperScript({ children: [mr("w")], subScript: [mr("c")], superScript: [mr("T")] }),
      mr("x)"),
    ], [
      new MathSum({
        children: [mr("exp("), new MathSubSuperScript({ children: [mr("w")], subScript: [mr("k")], superScript: [mr("T")] }), mr("x)")],
        subScript: [mr("k=1")],
        superScript: [mr("K")],
      }),
    ]),
  ], 6));
  els.push(pBody("dengan w vektor bobot, b bias, dan K jumlah kelas. Pada SVM Linear, kelas dipilih dari klasifier OvR dengan nilai f(x) terbesar, sedangkan pada Logistic Regression kelas dipilih dari probabilitas softmax terbesar. Kedua model sekaligus menghasilkan skor per kelas yang digunakan aplikasi untuk menampilkan tingkat keyakinan prediksi."));
  els.push(h2("3.7 Metrik Evaluasi Klasifikasi"));
  BAB3.s37.forEach((t) => els.push(pBody(t)));
  els.push(persamaan([
    mr("Accuracy = "),
    frac([mr("TP + TN")], [mr("TP + TN + FP + FN")]),
  ], 7));
  els.push(persamaan([
    msub("Precision", "c"),
    mr(" = "),
    frac([msub("TP", "c")], [msub("TP", "c"), mr(" + "), msub("FP", "c")]),
  ], 8));
  els.push(persamaan([
    msub("Recall", "c"),
    mr(" = "),
    frac([msub("TP", "c")], [msub("TP", "c"), mr(" + "), msub("FN", "c")]),
  ], 9));
  els.push(persamaan([
    msub("F1", "c"),
    mr(" = "),
    frac([mr("2 \u00D7 "), msub("Precision", "c"), mr(" \u00D7 "), msub("Recall", "c")], [msub("Precision", "c"), mr(" + "), msub("Recall", "c")]),
  ], 10));
  els.push(pBody("dengan TP (true positive) jumlah prediksi benar pada kelas c, FP prediksi salah yang diprediksi sebagai c, FN kasus kelas c yang terlewat, dan TN sisanya. Untuk tiga kelas, perhitungan dilakukan dengan skema satu-terhadap-sisa per kelas lalu dirata-ratakan makro."));
  els.push(h2("3.8 Algoritma Greedy untuk Penjadwalan"));
  BAB3.s38.forEach((t) => els.push(pBody(t)));
  return els;
}

// ---- BAB IV ----
function buildBAB4() {
  const els = [h1(null, { lines: ["BAB IV", "METODOLOGI"], breakBefore: true })];
  BAB4.intro.forEach((t) => els.push(pBody(t)));
  els.push(h2("4.1 Tahapan Kegiatan"));
  els.push(pBody(BAB4.tahapanIntro));
  BAB4.tahapan.forEach(([judul, isi], i) => {
    els.push(h3("4.1." + (i + 1) + " " + judul));
    els.push(pBody(isi));
  });
  els.push(h2("4.2 Jadwal Kegiatan"));
  els.push(pBody(BAB4.jadwalIntro));
  els.push(caption(BAB4.jadwalTabel.caption, { above: true }));
  els.push(buildTable({
    header: BAB4.jadwalTabel.header,
    widths: BAB4.jadwalTabel.widths,
    rows: BAB4.jadwalTabel.rows,
    centerCols: [0, 2, 3, 4, 5],
  }));
  return els;
}

// ---- BAB V ----
function buildBAB5() {
  const dir = "/home/z/my-project/download/gambar-laporan";
  const els = [h1(null, { lines: ["BAB V", "HASIL DAN PEMBAHASAN"], breakBefore: true })];
  els.push(h2("5.1 Hasil"));
  els.push(pNoIndent(BAB5.hasilIntro));

  els.push(h3("5.1.1 Halaman Pengajuan Konseling"));
  els.push(pBody(BAB5.halaman1));
  els.push(...gambar(path.join(dir, "gambar-5-1-form-pengajuan.png"), { captionText: BAB5.g51 }));

  els.push(h3("5.1.2 Hasil Klasifikasi Urgensi"));
  els.push(pBody(BAB5.halaman2));
  els.push(...gambar(path.join(dir, "gambar-5-2-hasil-klasifikasi.png"), { captionText: BAB5.g52 }));

  els.push(h3("5.1.3 Panel Petugas dan Penjadwalan Otomatis"));
  els.push(pBody(BAB5.halaman3));
  els.push(...gambar(path.join(dir, "gambar-5-3-panel-petugas.png"), { captionText: BAB5.g53 }));

  els.push(h3("5.1.4 Hasil Evaluasi Metode Klasifikasi"));
  els.push(pBody(BAB5.halaman5));
  els.push(caption(BAB5.tabelKomposisi.caption, { above: true }));
  els.push(buildTable({ header: BAB5.tabelKomposisi.header, widths: BAB5.tabelKomposisi.widths, rows: BAB5.tabelKomposisi.rows, centerCols: [2, 3] }));
  els.push(caption(BAB5.tabelModel.caption, { above: true }));
  els.push(buildTable({ header: BAB5.tabelModel.header, widths: BAB5.tabelModel.widths, rows: BAB5.tabelModel.rows, centerCols: [1, 2, 3, 4] }));
  els.push(caption(BAB5.tabelMatriks.caption, { above: true }));
  els.push(buildTable({ header: BAB5.tabelMatriks.header, widths: BAB5.tabelMatriks.widths, rows: BAB5.tabelMatriks.rows, centerCols: [1, 2, 3] }));
  els.push(...gambar(path.join(dir, "gambar-5-4-evaluasi-model.png"), { captionText: BAB5.g56 }));
  els.push(...gambar(path.join(dir, "gambar-5-5-evaluasi-jadwal.png"), { captionText: BAB5.g57 }));

  els.push(h3("5.1.5 Hasil Penjadwalan Greedy"));
  els.push(pBody(BAB5.halaman4));
  els.push(caption(BAB5.tabelJadwalMetrik.caption, { above: true }));
  els.push(buildTable({ header: BAB5.tabelJadwalMetrik.header, widths: BAB5.tabelJadwalMetrik.widths, rows: BAB5.tabelJadwalMetrik.rows, centerCols: [1, 2, 3, 4, 5] }));

  els.push(h2("5.2 Pembahasan"));
  els.push(pNoIndent(BAB5.pembahasanIntro));
  els.push(h3("5.2.1 " + BAB5.pemb1Judul));
  BAB5.pemb1.forEach((t) => els.push(pBody(t)));
  els.push(h3("5.2.2 " + BAB5.pemb2Judul));
  BAB5.pemb2.forEach((t) => els.push(pBody(t)));
  els.push(h3("5.2.3 " + BAB5.pemb3Judul));
  BAB5.pemb3.forEach((t) => els.push(pBody(t)));
  els.push(h3("5.2.4 " + BAB5.pemb4Judul));
  BAB5.pemb4.forEach((t) => els.push(pBody(t)));
  return els;
}

// ---- BAB VI ----
function buildBAB6() {
  const els = [h1(null, { lines: ["BAB VI", "KESIMPULAN DAN SARAN"], breakBefore: true })];
  els.push(h2("6.1 Kesimpulan"));
  BAB6.kesimpulan.forEach((t) => els.push(pBody(t)));
  els.push(h2("6.2 Saran"));
  els.push(pBody(BAB6.saranIntro));
  BAB6.saran.forEach((t, i) => els.push(pList((i + 1) + ". " + t)));
  return els;
}

// ---- Daftar Pustaka + Lampiran ----
function buildPustaka() {
  const els = [h1("DAFTAR PUSTAKA", { breakBefore: true })];
  PUSTAKA.forEach((t) => els.push(pPustaka(t)));
  return els;
}
function buildLampiran() {
  const els = [h1("LAMPIRAN", { breakBefore: true })];
  els.push(h2("Lampiran 1. Dokumentasi Halaman dan Layanan API Aplikasi"));
  els.push(pNoIndent(LAMPIRAN.intro));
  els.push(caption(LAMPIRAN.tabelHalaman.caption, { above: true }));
  els.push(buildTable({ header: LAMPIRAN.tabelHalaman.header, widths: LAMPIRAN.tabelHalaman.widths, rows: LAMPIRAN.tabelHalaman.rows }));
  els.push(caption(LAMPIRAN.tabelApi.caption, { above: true }));
  els.push(buildTable({ header: LAMPIRAN.tabelApi.header, widths: LAMPIRAN.tabelApi.widths, rows: LAMPIRAN.tabelApi.rows }));
  return els;
}

// ---- Header/Footer ----
function buildHeader() {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "666666" } },
      spacing: { after: 60 },
      children: runs(META.judul, { size: 16, color: "333333", font: FONT }),
    })],
  });
}
function buildFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 21, font: FONT })],
    })],
  });
}

// ---- Rakit dokumen ----
const doc = new Document({
  creator: META.nama,
  title: META.judul,
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 24, color: "000000" },
        paragraph: { spacing: { line: 360 } },
      },
      heading1: {
        run: { font: FONT, size: 28, bold: true, color: "000000" },
        paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 360, after: 300, line: 360 }, outlineLevel: 0 },
      },
      heading2: {
        run: { font: FONT, size: 24, bold: true, color: "000000" },
        paragraph: { spacing: { before: 280, after: 160, line: 360 }, outlineLevel: 1 },
      },
      heading3: {
        run: { font: FONT, size: 24, bold: true, color: "000000" },
        paragraph: { spacing: { before: 220, after: 120, line: 360 }, outlineLevel: 2 },
      },
    },
  },
  features: { updateFields: true },
  sections: [
    // S1: Sampul
    {
      properties: { page: { size: { width: 11906, height: 16838 }, margin: MARGIN } },
      children: buildCover(),
    },
    // S2: Front matter (Romawi)
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: MARGIN,
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      headers: { default: buildHeader() },
      footers: { default: buildFooter() },
      children: [
        ...buildPengesahan(),
        ...buildPengesahanPerusahaan(),
        ...buildAbstrak(),
        ...buildKataPengantar(),
        ...buildDaftarIsi(),
        ...buildDaftarGambar(),
        ...buildDaftarTabel(),
        ...buildDaftarLampiran(),
      ],
    },
    // S3: Isi (Arab mulai 1)
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: MARGIN,
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: { default: buildHeader() },
      footers: { default: buildFooter() },
      children: [
        ...buildBAB1(),
        ...buildBAB2(),
        ...buildBAB3(),
        ...buildBAB4(),
        ...buildBAB5(),
        ...buildBAB6(),
        ...buildPustaka(),
        ...buildLampiran(),
      ],
    },
  ],
});

const OUT = "/home/z/my-project/download/Laporan-KP-Penjadwalan-Konseling-UPA-BK.docx";
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("OK ->", OUT, buf.length, "bytes");
});
