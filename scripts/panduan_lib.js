// Generator Buku Panduan Pengguna - Obrolan ETA (UPA BK UTM)
// Mode template-following: struktur mengikuti BUKU PANDUAN HealthKB Demo milik
// rekan sekelas, isi diganti total untuk aplikasi penelitian mahasiswa.
//
// Jalankan: node scripts/buat_panduan.js
// Dua-pass: jika data_out/panduan_pagenum.json ada, nomor halaman daftar
// gambar/tabel diisi otomatis.

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Footer, PageNumber, NumberFormat, SectionType,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  LevelFormat, TableOfContents,
} = require("docx");
const fs = require("fs");
const path = require("path");
const C = require("./panduan_konten.js");

const MEDIA = path.join(__dirname, "..", "logbook_media");
const LOGO = path.join(__dirname, "..", "upload", "logo.jpg");
const OUT = path.join(__dirname, "..", "download", "Buku-Panduan-Pengguna-Obrolan-ETA-v1.0.docx");

// nomor halaman hasil pass pertama (opsional)
let PAGENUM = { fig: {}, tbl: {} };
const pageNumPath = path.join(__dirname, "..", "data_out", "panduan_pagenum.json");
if (fs.existsSync(pageNumPath)) PAGENUM = JSON.parse(fs.readFileSync(pageNumPath, "utf8"));

// ---------- palet & konstanta ----------
const NAVY = "1F3864";
const BODY = "1A1A1A";
const GRAY = "595959";
const HEAD_FILL = "DCE6F1";
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };
const TBL_BORDER = { style: BorderStyle.SINGLE, size: 4, color: "8EA9C1" };
const tblBorders = { top: TBL_BORDER, bottom: TBL_BORDER, left: TBL_BORDER, right: TBL_BORDER, insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: "C5D5E4" }, insideVertical: { style: BorderStyle.SINGLE, size: 2, color: "C5D5E4" } };
const FONT = { ascii: "Times New Roman", hAnsi: "Times New Roman", eastAsia: "Times New Roman" };
const CODE_FONT = { ascii: "Courier New", hAnsi: "Courier New" };

// dimensi screenshot (dari PIL, logbook_media)
const DIMS = {
  "18-github-repo.png": [1280, 800], "19-produksi-live.png": [1280, 800],
  "01-konseling-awal.png": [1280, 800], "02-dass-intro.png": [1280, 800],
  "03-registrasi-kosong.png": [1280, 800], "04-registrasi-terisi.png": [1280, 800],
  "05-registrasi-terisi-lengkap.png": [1280, 800], "06-registrasi-sukses.png": [1280, 800],
  "07-dass-pertanyaan.png": [1280, 800], "08-dass-terisi.png": [1280, 800],
  "09-dass-terkirim.png": [1280, 800], "10-chat-balasan.png": [1280, 800],
  "11-chat-krisis.png": [1280, 800], "12-petugas-login.png": [1280, 800],
  "13-petugas-dashboard.png": [1280, 800], "14-petugas-daftar.png": [1280, 800],
  "15-petugas-detail.png": [1280, 800], "16-petugas-percakapan.png": [1280, 800],
  "21-detail-dass-skor.png": [1280, 577], "22-followup-status.png": [1280, 577],
  "23-chat-varian.png": [1280, 577],
};

// daftar gambar (urut kemunculan) - [file, caption]
const FIGS = [
  ["18-github-repo.png", "Halaman repositori GitHub penelitian (Code - Download ZIP)"],
  ["19-produksi-live.png", "Aplikasi versi online dibuka di peramban"],
  ["01-konseling-awal.png", "Tampilan awal Ruang Obrolan Konseling (beranda)"],
  ["03-registrasi-kosong.png", "Formulir Pendaftaran Layanan sebelum diisi"],
  ["04-registrasi-terisi.png", "Formulir Pendaftaran Layanan yang telah diisi"],
  ["06-registrasi-sukses.png", "Pemberitahuan pendaftaran berhasil"],
  ["02-dass-intro.png", "Pengantar skrining DASS-21"],
  ["07-dass-pertanyaan.png", "Item pernyataan DASS-21 dengan empat pilihan jawaban"],
  ["08-dass-terisi.png", "Item DASS-21 yang telah dijawab"],
  ["09-dass-terkirim.png", "Pemberitahuan skrining terkirim"],
  ["10-chat-balasan.png", "Contoh percakapan dukungan awal dengan chatbot"],
  ["11-chat-krisis.png", "Respons keselamatan otomatis saat potensi krisis terdeteksi"],
  ["23-chat-varian.png", "Variasi percakapan pada topik yang berbeda"],
  ["12-petugas-login.png", "Halaman masuk Panel Petugas UPA BK"],
  ["13-petugas-dashboard.png", "Dashboard petugas dengan statistik ringkas"],
  ["14-petugas-daftar.png", "Daftar pendaftaran pada Panel Petugas"],
  ["16-petugas-percakapan.png", "Transkrip percakapan pada detail pendaftaran"],
  ["21-detail-dass-skor.png", "Jawaban dan skor DASS-21 pada detail pendaftaran"],
  ["22-followup-status.png", "Pembaruan status tindak lanjut"],
];

// ---------- helper dasar ----------
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER,
    spacing: { before: 360, after: 200, line: 380, lineRule: "atLeast" },
    children: [new TextRun({ text, bold: true, size: 30, color: NAVY, font: FONT })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140, line: 340, lineRule: "atLeast" },
    children: [new TextRun({ text, bold: true, size: 26, color: NAVY, font: FONT })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 220, after: 110, line: 312 },
    children: [new TextRun({ text, bold: true, size: 23, color: "2E5395", font: FONT })],
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: opts.after ?? 120 },
    children: [new TextRun({ text, size: 22, color: BODY, font: FONT, ...opts.run })],
  });
}
function bodyRuns(runs, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: opts.after ?? 120 },
    children: runs.map((r) => new TextRun({ size: 22, color: BODY, font: FONT, ...r })),
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level }, alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 60 },
    children: [new TextRun({ text, size: 22, color: BODY, font: FONT })],
  });
}
function numbered(ref, text) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 }, alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 60 },
    children: [new TextRun({ text, size: 22, color: BODY, font: FONT })],
  });
}
// kotak callout: PERINGATAN / PENTING / TIPS / CATATAN / AKSES ONLINE
function callout(label, text, kind = "warn") {
  const theme = {
    warn: { fill: "FDECEC", bar: "C0392B" },
    info: { fill: "E8F0FE", bar: "1A73E8" },
    tip: { fill: "E6F4EA", bar: "188038" },
    note: { fill: "FFF8E1", bar: "B06000" },
  }[kind];
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: theme.fill },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        borders: { top: NB, bottom: NB, right: NB, left: { style: BorderStyle.SINGLE, size: 24, color: theme.bar } },
        children: [
          new Paragraph({
            spacing: { line: 300, after: 40 },
            children: [new TextRun({ text: label, bold: true, size: 21, color: theme.bar, font: FONT })],
          }),
          new Paragraph({
            spacing: { line: 300, after: 0 }, alignment: AlignmentType.JUSTIFIED,
            children: [new TextRun({ text, size: 21, color: BODY, font: FONT })],
          }),
        ],
      })],
    })],
  });
}
function spacer(after = 120) {
  return new Paragraph({ spacing: { after, line: 240 }, children: [] });
}
// blok kode monospace
function code(lines) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: "F4F6F8" },
        margins: { top: 120, bottom: 120, left: 200, right: 200 },
        borders: { top: NB, bottom: NB, right: NB, left: { style: BorderStyle.SINGLE, size: 18, color: "9AA6B2" } },
        children: lines.map((ln) => new Paragraph({
          spacing: { line: 260, after: 0 },
          children: [new TextRun({ text: ln.length ? ln : " ", size: 18, color: "24292E", font: CODE_FONT })],
        })),
      })],
    })],
  });
}
// tabel data dengan caption "Tabel N."
let tblCounter = 0;
const TBL_INDEX = [];
function dataTable(caption, header, rows, widths) {
  tblCounter += 1;
  TBL_INDEX.push(tblCounter + ". " + caption);
  const n = tblCounter;
  const w = widths || header.map(() => Math.floor(100 / header.length));
  const mkCell = (text, i, isHead) => new TableCell({
    width: { size: w[i], type: WidthType.PERCENTAGE },
    shading: isHead ? { type: ShadingType.CLEAR, fill: HEAD_FILL } : undefined,
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: [new Paragraph({
      spacing: { line: 280, after: 0 },
      alignment: AlignmentType.LEFT,
      children: [new TextRun({ text: String(text), bold: isHead, size: 20, color: isHead ? NAVY : BODY, font: FONT })],
    })],
  });
  return [
    new Paragraph({
      keepNext: true, spacing: { before: 160, after: 80, line: 280 },
      children: [new TextRun({ text: "Tabel " + n + ". " + caption, bold: true, size: 20, color: NAVY, font: FONT })],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: tblBorders,
      rows: [
        new TableRow({ tableHeader: true, cantSplit: true, children: header.map((t, i) => mkCell(t, i, true)) }),
        ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((t, i) => mkCell(t, i, false)) })),
      ],
    }),
    spacer(100),
  ];
}
// gambar + caption "Gambar N."
let figCounter = 0;
const FIG_INDEX = [];
function figure(file, caption) {
  figCounter += 1;
  FIG_INDEX.push(figCounter + ". " + caption);
  const n = figCounter;
  const [w, h] = DIMS[file] || [1280, 800];
  const dispW = 470;
  const dispH = Math.round(dispW * h / w);
  const buf = fs.readFileSync(path.join(MEDIA, file));
  const pg = PAGENUM.fig && PAGENUM.fig[String(n)];
  return [
    new Paragraph({
      keepNext: true, alignment: AlignmentType.CENTER, spacing: { before: 160, after: 60 },
      children: [new ImageRun({ data: buf, transformation: { width: dispW, height: dispH }, type: "png" })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { after: 160, line: 280 },
      children: [new TextRun({ text: "Gambar " + n + ". " + caption, size: 20, color: GRAY, italics: true, font: FONT })],
    }),
  ];
}

module.exports = {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  PageBreak, Footer, PageNumber, NumberFormat, SectionType, AlignmentType,
  HeadingLevel, WidthType, BorderStyle, ShadingType, LevelFormat, TableOfContents,
  fs, path, C, MEDIA, LOGO, OUT, PAGENUM, NAVY, BODY, GRAY, HEAD_FILL, NB,
  allNoBorders, tblBorders, FONT, CODE_FONT, DIMS, FIGS,
  h1, h2, h3, body, bodyRuns, bullet, numbered, callout, spacer, code,
  dataTable, figure, TBL_INDEX, FIG_INDEX,
};
