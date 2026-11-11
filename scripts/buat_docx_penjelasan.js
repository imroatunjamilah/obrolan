// Dokumen penjelasan: cara olah data DASS-21, alat, panduan isi laporan, penjelasan web
// Recipe cover: R1 (Pure Paragraph Left) + palet MC-1 Medical Blue (skill docx design-system)
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableLayoutType, SectionType, LevelFormat, TableOfContents,
} = require("docx");
const fs = require("fs");

// ---------- palet MC-1 (Medical Blue) ----------
const PAL = {
  bg: "F5F8FC", primary: "1A5276", accent: "2E86C1",
  cover: { titleColor: "1A5276", subtitleColor: "606060", metaColor: "707070", footerColor: "A0A0A0" },
  table: { headerBg: "2E86C1", headerText: "FFFFFF", accentLine: "1A5276", innerLine: "D0DDE8", surface: "EDF3F8" },
};
const BODY = "000000";
const FONT = { ascii: "Times New Roman", eastAsia: "SimSun" };
const FONT_H = { ascii: "Times New Roman", eastAsia: "SimHei" };

const noBorders = {
  top: { style: BorderStyle.NONE, size: 0, color: "auto" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
  left: { style: BorderStyle.NONE, size: 0, color: "auto" },
  right: { style: BorderStyle.NONE, size: 0, color: "auto" },
};
const allNoBorders = {
  ...noBorders,
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
};

// ---------- helper layout cover (design-system.md) ----------
function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([..."\uFF0C\u3002\u3001\uFF1B\uFF1A\uFF01\uFF1F", ..."-_\u2014\u2013\u00B7/", ..." \t"]);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
    }
    if (breakAt === -1) {
      const limit = Math.min(remaining.length, Math.ceil(charsPerLine * 1.3));
      for (let i = charsPerLine + 1; i < limit; i++) {
        if (breakAfter.has(remaining[i - 1])) { breakAt = i; break; }
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 2) {
    const last = lines.pop();
    lines[lines.length - 1] += last;
  }
  return lines;
}

function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  // teks Latin ~ 0.55x lebar CJK; pakai 11 twips/pt per karakter Latin
  const charWidth = (pt) => pt * 11;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt, lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    lines = splitTitleLines(title, charsPerLine(minPt));
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}

function calcCoverSpacing(params) {
  const { titleLineCount = 1, titlePt = 36, hasSubtitle = false, hasEnglishLabel = false,
    metaLineCount = 0, fixedHeight = 800, pageHeight = 16838, marginTop = 0, marginBottom = 0 } = params;
  const SAFETY = 1200;
  const usableHeight = pageHeight - marginTop - marginBottom - SAFETY;
  const titleHeight = titleLineCount * (titlePt * 23 + 200);
  const subtitleHeight = hasSubtitle ? (12 * 23 + 600) : 0;
  const englishLabelHeight = hasEnglishLabel ? (9 * 23 + 600) : 0;
  const metaHeight = metaLineCount * (10 * 23 + 100);
  const implicitParaHeight = 3 * 300;
  const contentHeight = titleHeight + subtitleHeight + englishLabelHeight + metaHeight + fixedHeight + implicitParaHeight;
  const remainingSpace = usableHeight - contentHeight;
  const safeRemaining = Math.max(remainingSpace, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  const midSpacing = Math.max(safeRemaining - topSpacing - bottomSpacing, 0);
  return { topSpacing, midSpacing, bottomSpacing };
}

// ---------- cover R1 ----------
function buildCoverR1(config) {
  const P = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length, fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: P.accent, space: 12 };
  const children = [];
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: P.accent, space: 8 } },
      children: [new TextRun({ text: config.englishLabel.split("").join("  "), size: 18,
        color: P.accent, font: { ascii: "Calibri", eastAsia: "SimHei" }, characterSpacing: 40 })],
    }));
  }
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true,
        color: P.cover.titleColor, font: FONT_H })],
    }));
  }
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: P.cover.subtitleColor, font: FONT })],
    }));
  }
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 24, color: P.cover.metaColor, font: FONT })],
    }));
  }
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: P.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: P.cover.footerColor, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: P.cover.footerColor, font: { ascii: "Arial" } }),
    ],
  }));
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: P.bg }, borders: noBorders, children,
      })],
    })],
  })];
}

// ---------- builder konten ----------
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 30, color: PAL.primary, font: FONT_H })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, size: 26, color: PAL.primary, font: FONT_H })],
  });
}
function body(runs, opts = {}) {
  const children = (typeof runs === "string")
    ? [new TextRun({ text: runs, size: 24, color: BODY, font: FONT })]
    : runs;
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: opts.noIndent ? 0 : 480 },
    spacing: { line: 312, after: 80 },
    children,
  });
}
function r(text, extra = {}) {
  return new TextRun({ text, size: 24, color: BODY, font: FONT, ...extra });
}
function rb(text) { return r(text, { bold: true }); }
function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 60, after: 200 },
    children: [new TextRun({ text, size: 20, color: "606060", italics: true, font: FONT })],
  });
}
function tableTitle(text) {
  return new Paragraph({
    keepNext: true, spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 21, color: BODY, font: FONT })],
  });
}
function cell(text, { header = false, pct = 25, align = AlignmentType.LEFT, fill = null } = {}) {
  return new TableCell({
    width: { size: pct, type: WidthType.PERCENTAGE },
    shading: header ? { type: ShadingType.CLEAR, fill: PAL.table.headerBg }
      : (fill ? { type: ShadingType.CLEAR, fill } : undefined),
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: align, spacing: { line: 312 },
      children: [new TextRun({ text, size: 21, bold: header, color: header ? PAL.table.headerText : BODY, font: FONT })],
    })],
  });
}
function makeTable(headers, rows, widths, aligns) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: PAL.table.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: PAL.table.accentLine },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: PAL.table.innerLine },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
    },
    rows: [
      new TableRow({
        tableHeader: true, cantSplit: true,
        children: headers.map((t, i) => cell(t, { header: true, pct: widths[i], align: aligns[i] })),
      }),
      ...rows.map((rw) => new TableRow({
        cantSplit: true,
        children: rw.map((t, i) => cell(t, { pct: widths[i], align: aligns[i] })),
      })),
    ],
  });
}
function pngSize(buf) { return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }; }
function figure(path, displayWidth) {
  const buf = fs.readFileSync(path);
  const { w, h } = pngSize(buf);
  const dh = Math.round(displayWidth * h / w);
  return new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 120 },
    children: [new ImageRun({ data: buf, transformation: { width: displayWidth, height: dh }, type: "png" })],
  });
}

// ---------- data hasil olahan (terverifikasi skrip analisis) ----------
const distRows = [
  ["Normal", "234 (52,1%)", "122 (27,2%)", "275 (61,2%)"],
  ["Ringan", "93 (20,7%)", "47 (10,5%)", "83 (18,5%)"],
  ["Sedang", "98 (21,8%)", "150 (33,4%)", "56 (12,5%)"],
  ["Berat", "14 (3,1%)", "63 (14,0%)", "29 (6,5%)"],
  ["Sangat Berat", "10 (2,2%)", "67 (14,9%)", "6 (1,3%)"],
  ["Total di atas Normal", "215 (47,9%)", "327 (72,8%)", "174 (38,8%)"],
];
const statRows = [
  ["Depresi", "9,30", "8", "6,94", "0", "34"],
  ["Kecemasan", "11,81", "12", "7,30", "0", "42"],
  ["Stres", "13,71", "14", "7,69", "0", "42"],
];
const temaRows = [
  ["Rindu keluarga / rumah (homesick)", "95", "21,2%"],
  ["Cemas dan overthinking", "49", "10,9%"],
  ["Akademik (tugas, nilai, dosen, skripsi)", "39", "8,7%"],
  ["Kelelahan dan stres", "37", "8,2%"],
  ["Tidur dan kesehatan fisik", "20", "4,5%"],
  ["Hubungan sosial (teman, lingkungan baru)", "19", "4,2%"],
  ["Keuangan / ekonomi", "15", "3,3%"],
  ["Sedih / hilang semangat / mood turun", "13", "2,9%"],
  ["Percaya diri / takut gagal", "6", "1,3%"],
  ["Masalah keluarga (konflik, kondisi orang tua)", "5", "1,1%"],
  ["Tidak ada keluhan spesifik", "151", "33,6%"],
];
const cutRows = [
  ["Normal", "0-9", "0-7", "0-14"],
  ["Ringan", "10-13", "8-9", "15-18"],
  ["Sedang", "14-20", "10-14", "19-25"],
  ["Berat", "21-27", "15-19", "26-33"],
  ["Sangat Berat", "28-42", "20-42", "34-42"],
];

const numberingCfg = ["langkah-olah", "list-web"].map((ref) => ({
  reference: ref,
  levels: [{
    level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 720, hanging: 360 } } },
  }],
}));

// ---------- isi dokumen ----------
const bodyChildren = [];

// 1. Ringkasan
bodyChildren.push(h1("1. Ringkasan"));
bodyChildren.push(body([
  r("Dokumen ini menjelaskan tiga hal yang Anda minta: "),
  rb("bagaimana data 449 responden diolah"), r(", "),
  rb("perangkat apa yang dipakai"), r(", dan "),
  rb("apa yang perlu Anda jelaskan di laporan (skripsi)"), r(". Penjelasan isi web Obrolan juga disertakan di bagian akhir. Data mentah berasal dari formulir Google Form yang diisi 11-12 Agustus 2026 dan berisi 21 pernyataan DASS-21 beserta kolom keluhan terbuka."),
]));
bodyChildren.push(body([
  r("Hasil pengolahan menunjukkan "),
  rb("kecemasan adalah aspek dengan keparahan tertinggi"),
  r(": 327 responden (72,8%) berada di atas kategori Normal dan 130 di antaranya (29,0%) berada di kategori Berat atau Sangat Berat. Sebagai pembanding, kondisi di atas Normal ditemui pada 215 responden (47,9%) untuk depresi dan 174 responden (38,8%) untuk stres. Tema keluhan yang paling banyak ditulis adalah rindu keluarga atau rumah (95 responden), disusul cemas dan overthinking (49), lalu masalah akademik (39)."),
]));
bodyChildren.push(body([
  r("Seluruh hasil tersimpan dalam satu file Excel: "),
  rb("olahan-dass21-449-responden.xlsx"),
  r(" (tujuh sheet: Ringkasan, Skor Responden, Statistik, Tema Keluhan, Grafik, Data Mentah, dan Review). File kode program web dalam bentuk ZIP juga sudah disediakan: "),
  rb("obrolan-kode.zip"), r("."),
]));

// 2. Data yang diolah
bodyChildren.push(h1("2. Data yang Diolah dan Sumbernya"));
bodyChildren.push(body([
  r("Sumber data adalah satu file Excel Google Form dengan satu sheet berisi "), rb("449 baris respons"),
  r(" (bukan 450; satu respons tidak tercatat pada file) dan 26 kolom. Kolom terdiri atas waktu pengisian, pernyataan persetujuan, dua pertanyaan tentang kebahagiaan keluarga, satu kolom keluhan bebas, dan 21 kolom pernyataan DASS-21. Setiap pernyataan dijawab dengan pilihan frekuensi: Tidak Pernah, Kadang-kadang, Sering, atau Selalu."),
]));
bodyChildren.push(body([
  r("Sebanyak "), rb("434 responden (96,7%) menyatakan bersedia"), r(" menjadi responden; 15 sisanya tidak menyatakan persetujuan. Kolom keluhan terbuka diisi bermakna oleh 317 responden, sementara sisanya menulis jawaban singkat seperti tidak ada atau aman. Seluruh 449 responden menjawab lengkap 21 pernyataan, sehingga tidak ada data yang perlu dibuang dan tidak ada imputasi yang dilakukan."),
]));

// 3. Cara mengolah
bodyChildren.push(h1("3. Cara Mengolah Data: Langkah demi Langkah"));
bodyChildren.push(h2("3.1 Menyiapkan dan membersihkan data"));
bodyChildren.push(body([
  r("File Excel dibaca dengan program komputer, lalu dilakukan tiga pembersihan kecil. Pertama, satu nilai waktu pengisian yang tersimpan sebagai angka serial Excel dikembalikan menjadi tanggal kalender yang benar. Kedua, label jawaban dinormalisasi (spasi dan kapital dibersihkan) supaya tidak ada jawaban yang terlewat hanya karena penulisan berbeda. Ketiga, setiap responden diberi kode anonim berurutan (R-001 sampai R-449) sehingga identitas tidak muncul di file olahan mana pun."),
]));
bodyChildren.push(h2("3.2 Menghitung skor DASS-21"));
bodyChildren.push(body([
  r("Label jawaban dikonversi menjadi angka 0 sampai 3: Tidak Pernah = 0, Kadang-kadang = 1, Sering = 2, Selalu = 3. Kemudian 21 pernyataan dikelompokkan menjadi tiga subskala sesuai struktur standar DASS-21 (Lovibond & Lovibond, 1995): "),
  rb("depresi item 3, 5, 10, 13, 16, 17, 21; kecemasan item 2, 4, 7, 9, 15, 19, 20; stres item 1, 6, 8, 11, 12, 14, 18"),
  r(". Skor tiap subskala dihitung dengan menjumlahkan tujuh item lalu dikalikan dua supaya setara skala DASS-42, sehingga rentang skor menjadi 0-42 per subskala."),
]));
bodyChildren.push(body([
  r("Rumus ini persis sama dengan yang dipakai di program web Obrolan (file src/lib/dass21.ts), sehingga angka di Excel dan angka yang dilihat petugas di web akan selalu konsisten."),
]));
bodyChildren.push(h2("3.3 Mengkategorikan tingkat keparahan"));
bodyChildren.push(body([
  r("Skor tiap subskala dimasukkan ke lima kategori berdasarkan cut-off publikasi umum DASS-21 (Tabel 1). Kategori ini adalah alat skrining, bukan diagnosis, dan bukan kategori resmi UPA BK; kalimat ini sebaiknya Anda tuliskan juga di laporan."),
]));
bodyChildren.push(tableTitle("Tabel 1. Cut-off DASS-21 (skor setara DASS-42)"));
bodyChildren.push(makeTable(
  ["Kategori", "Depresi", "Kecemasan", "Stres"], cutRows,
  [28, 24, 24, 24],
  [AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER]
));
bodyChildren.push(h2("3.4 Mengklasifikasi tema keluhan"));
bodyChildren.push(body([
  r("Keluhan bebas (misalnya kangen rumah atau takut tidak bisa mengikuti kuliah) diklasifikasikan ke dalam 11 tema dengan dua tahap. Tahap pertama memakai daftar kata kunci yang transparan dan dapat diperiksa ulang. Tahap kedua memakai model bahasa besar (Large Language Model / LLM) untuk keluhan yang bermakna ganda. Dari 317 keluhan berisi, 264 langsung terjawab oleh kata kunci dan 52 diputuskan oleh LLM; sisanya memang tidak berisi keluhan spesifik. Pemetaan per responden tersimpan pada kolom Tema Keluhan di sheet Skor Responden sehingga Anda dapat memeriksa dan memperbaikinya secara manual bila perlu."),
]));
bodyChildren.push(h2("3.5 Pemeriksaan silang otomatis"));
bodyChildren.push(body([
  r("File Excel dilengkapi sheet Review yang memeriksa enam hal secara otomatis dengan formula hidup: jumlah responden, jumlah distribusi tiap subskala harus sama dengan N, jumlah tema harus sama dengan N, dan skor maksimum tidak boleh melebihi 42. Semua pemeriksaan berstatus PASS, dan file lolos validasi struktur tanpa satu pun kesalahan formula (4.118 formula, 0 error)."),
]));

// 4. Perangkat
bodyChildren.push(h1("4. Perangkat yang Dipakai dan Alasannya"));
bodyChildren.push(body([
  r("Seluruh pengolahan dilakukan dengan "), rb("bahasa Python"),
  r(" melalui beberapa pustaka (library) yang masing-masing punya peran jelas. "),
  rb("pandas"), r(" dipakai membaca file Excel dan menghitung skor serta statistik secara massal; "),
  rb("openpyxl"), r(" dipakai membangun file Excel hasil olahan berisi formula hidup, pemformatan, dan grafik; "),
  rb("matplotlib"), r(" dipakai menggambar grafik statistik (diagram batang distribusi, histogram skor, dan diagram batang horizontal tema keluhan); "),
  rb("model bahasa GLM"), r(" (via layanan z.ai) dipakai sekadar membantu mengelompokkan 52 keluhan yang bermakna ganda. Semua langkah tertulis dalam skrip yang bisa dijalankan ulang, sehingga hasilnya dapat direproduksi kapan pun bila data diperbarui."),
]));
bodyChildren.push(body([
  r("Untuk laporan, Anda cukup menulis bahwa data diolah secara komputerisasi menggunakan Python (pustaka pandas, openpyxl, matplotlib) dengan perhitungan skor DASS-21 mengikuti panduan resmi Lovibond & Lovibond (1995), dan pengelompokan tema keluhan dibantu kata kunci serta model bahasa. Tidak perlu menyebut detail teknis lain."),
]));

// 5. Hasil utama
bodyChildren.push(h1("5. Hasil Utama Pengolahan"));
bodyChildren.push(body([
  r("Tabel 2 menyajikan distribusi tingkat keparahan ketiga subskala, dan Tabel 3 merangkum statistik deskriptifnya. Grafik pada Gambar 1 dan Gambar 2 memvisualkan hal yang sama."),
]));
bodyChildren.push(tableTitle("Tabel 2. Distribusi tingkat keparahan (n = 449)"));
bodyChildren.push(makeTable(
  ["Kategori", "Depresi", "Kecemasan", "Stres"], distRows,
  [28, 24, 24, 24],
  [AlignmentType.LEFT, AlignmentType.CENTER, AlignmentType.CENTER, AlignmentType.CENTER]
));
bodyChildren.push(tableTitle("Tabel 3. Statistik deskriptif skor (skala 0-42)"));
bodyChildren.push(makeTable(
  ["Subskala", "Rata-rata", "Median", "SD", "Min", "Maks"], statRows,
  [25, 15, 15, 15, 15, 15],
  [AlignmentType.LEFT, AlignmentType.RIGHT, AlignmentType.RIGHT, AlignmentType.RIGHT, AlignmentType.RIGHT, AlignmentType.RIGHT]
));
bodyChildren.push(figure("/home/z/my-project/data_out/grafik_distribusi.png", 560));
bodyChildren.push(caption("Gambar 1. Distribusi tingkat keparahan DASS-21 per subskala"));
bodyChildren.push(figure("/home/z/my-project/data_out/grafik_tema.png", 560));
bodyChildren.push(caption("Gambar 2. Frekuensi tema keluhan responden"));
bodyChildren.push(body([
  r("Tiga temuan yang paling menonjol: "),
  rb("(1) kecemasan paling parah"),
  r(" - rata-rata 11,81 dengan 130 responden (29,0%) di kategori Berat atau Sangat Berat; "),
  rb("(2) rindu keluarga adalah keluhan terbanyak"),
  r(" - 95 responden (21,2%), pola yang wajar bagi mahasiswa baru yang merantau; "),
  rb("(3) keluhan berbeda dari skor"),
  r(" - 151 responden menulis tidak ada keluhan spesifik, namun banyak di antara mereka tetap memiliki skor di atas Normal, sehingga skrining tetap penting meskipun mahasiswa merasa aman. Angka lengkap per responden, per tema, dan grafik siap salin tersedia di file Excel."),
]));

// 6. Panduan laporan
bodyChildren.push(h1("6. Apa yang Perlu Anda Jelaskan di Laporan (Skripsi)"));
bodyChildren.push(h2("6.1 Di bab metodologi"));
bodyChildren.push(body([
  r("Jelaskan bahwa instrumen adalah DASS-21 berisi 21 pernyataan untuk tiga aspek (depresi, kecemasan, stres) dengan empat pilihan jawaban frekuensi (0-3). Tuliskan cara penilaian: skor per aspek = jumlah tujuh item dikali dua (setara DASS-42), lalu dikategorikan dengan cut-off Lovibond & Lovibond (1995) seperti Tabel 1. Cantumkan cara memperoleh data (Google Form, 11-12 Agustus 2026, 449 responden, 434 menyatakan persetujuan) dan cara mengolah data (komputerisasi dengan Python; pengelompokan tema keluhan dibantu kata kunci dan model bahasa)."),
]));
bodyChildren.push(h2("6.2 Di bab hasil"));
bodyChildren.push(body([
  r("Sajikan Tabel distribusi tingkat keparahan (salin Tabel 2 beserta Gambar 1), statistik deskriptif (Tabel 3), dan tabel tema keluhan. Anda bisa menyalin tabel dan grafik langsung dari file Excel. Urutan penyajian yang umum: profil responden, hasil tiap subskala satu per satu (depresi, kecemasan, stres), lalu tema keluhan."),
]));
bodyChildren.push(h2("6.3 Di bab pembahasan dan saran"));
bodyChildren.push(body([
  r("Arti penting temuan: kecemasan menjadi masalah paling luas, dan tema rindu keluarga/akademik mendominasi keluhan tertulis; kaitkan ini dengan kebutuhan layanan konseling, misalnya program penanganan kecemasan, pendampingan adaptasi mahasiswa baru, dan pengembangan layanan chat daring seperti web Obrolan. Untuk saran metodologis, sebutkan perbaikan formulir di periode berikutnya: memperbaiki redaksi item 16 (di formulir tertulis sama dengan item 15), mengingatkan responden agar menulis keluhan, dan menggabungkan skrining daring dengan tindak lanjut konseling."),
]));
bodyChildren.push(h2("6.4 Catatan kualitas data yang jujur untuk ditulis"));
bodyChildren.push(body([
  r("Empat hal kecil perlu disebutkan secara terbuka di laporan karena menunjukkan ketelitian Anda: (1) jumlah respons 449, bukan 450; (2) 15 responden tidak menyatakan persetujuan dan jawabannya tetap dihitung dengan catatan etik; (3) 50 pasang waktu pengisian berimpit persis (wajar pada formulir daring, responden tetap berbeda); (4) redaksi item 16 pada formulir meniru item 15, sementara skoring tetap mengikuti nomor item standar DASS-21. Selain itu, ingatkan pembaca bahwa skor adalah alat skrining, bukan diagnosis, dan kategori yang dipakai adalah cut-off publikasi umum, bukan kategori resmi UPA BK."),
]));

// 7. Web Obrolan
bodyChildren.push(h1("7. Penjelasan Isi Web Obrolan"));
bodyChildren.push(h2("7.1 Fitur dan alur pengguna"));
bodyChildren.push(body([
  r("Web Obrolan (alamat https://obrolan-eta.vercel.app) adalah layanan skrining dan konsultasi daring untuk mahasiswa. Alur mahasiswa: (1) registrasi berisi data diri dan kelas; (2) mengisi skrining DASS-21 sebanyak 21 pernyataan dengan empat pilihan jawaban; (3) masuk ke ruang chat yang diawali pesan sambutan dari asisten virtual. Mahasiswa tidak pernah melihat skor atau kategorinya; hasil hanya dapat diakses petugas."),
]));
bodyChildren.push(body([
  r("Alur petugas: login admin, melihat dashboard berisi daftar registrasi beserta skor dan kategori DASS-21 serta keluhan tertulis, lalu mencatat tindak lanjut (follow-up) untuk mahasiswa yang memerlukan perhatian. Ada pula penanda keselamatan: bila percakapan berisi tanda bahaya diri, sistem menampilkan spanduk anjuran menghubungi layanan bantuan segera."),
]));
bodyChildren.push(h2("7.2 Teknologi di balik web"));
bodyChildren.push(body([
  r("Web dibangun dengan kerangka kerja Next.js (React + TypeScript) dan Tailwind CSS untuk tampilannya; data tersimpan di basis data PostgreSQL yang dikelola lewat Prisma; layanan chat memanfaatkan model bahasa GLM melalui antarmuka API; semuanya di-hosting gratis di Vercel dengan basis data Neon. Kode sumber lengkap ada di berkas ZIP obrolan-kode.zip dan juga tersimpan di repositori GitHub Anda."),
]));
bodyChildren.push(h2("7.3 Kesesuaian rumus web dengan pengolahan data"));
bodyChildren.push(body([
  r("Perhitungan skor di web (file src/lib/dass21.ts) memakai rumus dan cut-off yang sama persis dengan pengolahan Excel di dokumen ini: pembagian item per subskala, penjumlahan tujuh item dikali dua, serta lima kategori keparahan. Artinya, angka yang Anda laporkan dari Excel akan sama dengan angka yang muncul saat sistem web digunakan untuk skrining - konsistensi ini layak Anda tegaskan di laporan sebagai jaminan kualitas."),
]));

// 8. Etika
bodyChildren.push(h1("8. Etika dan Kerahasiaan Data"));
bodyChildren.push(body([
  r("Data ini sensitif karena menyentuh kondisi psikologis mahasiswa. Tiga aturan yang sudah diterapkan dan perlu Anda pertahankan: (1) setiap responden hanya muncul sebagai kode anonim (R-001, R-002, dan seterusnya) di semua file olahan; (2) file Excel berisi jawaban per responden hanya untuk Anda dan pembimbing, tidak untuk dibagikan publik atau dimasukkan ke repositori kode; (3) di laporan, tampilkan hanya angka agregat (jumlah dan persentase), dan bila mengutip keluhan, ubah sedikit redaksinya agar responden tidak dapat dikenali. Sebutkan juga bahwa penelitian meminta persetujuan responden di awal formulir."),
]));

// ---------- rakit dokumen ----------
const pgSize = { width: 11906, height: 16838 };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };
const headerDoc = new Header({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Penjelasan Olah Data DASS-21 - Web Obrolan UPA BK", size: 18, color: "808080", font: FONT })],
  })],
});
const footerNum = () => new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: FONT })],
  })],
});

const doc = new Document({
  creator: "Z.ai",
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 24, color: BODY },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: FONT_H, size: 30, bold: true, color: PAL.primary },
        paragraph: { spacing: { before: 360, after: 160, line: 312 }, outlineLevel: 0 },
      },
      heading2: {
        run: { font: FONT_H, size: 26, bold: true, color: PAL.primary },
        paragraph: { spacing: { before: 240, after: 120, line: 312 }, outlineLevel: 1 },
      },
    },
  },
  numbering: { config: numberingCfg },
  sections: [
    { // Section 1: cover — margin 0, tanpa footer
      properties: { page: { size: pgSize, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCoverR1({
        title: "Penjelasan Pengolahan Data DASS-21 dan Panduan Isi Laporan",
        subtitle: "Skrining Kesehatan Mental Mahasiswa - Web Obrolan UPA BK",
        englishLabel: "DATA PROCESSING GUIDE",
        metaLines: [
          "Data: 449 responden (pengisian 11-12 Agustus 2026)",
          "Instrumen: DASS-21 (depresi, kecemasan, stres)",
          "Output: Excel olahan, grafik, dan panduan laporan",
        ],
        footerLeft: "Layanan Konseling Mahasiswa (UPA BK)",
        footerRight: "November 2026",
        palette: PAL,
      }),
    },
    { // Section 2: daftar isi — roman
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } },
      },
      headers: { default: headerDoc },
      footers: { default: footerNum() },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 480, after: 360 },
          children: [new TextRun({ text: "Daftar Isi", bold: true, size: 32, color: PAL.primary, font: FONT_H })],
        }),
        new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({
          spacing: { before: 200 },
          children: [new TextRun({
            text: "Catatan: Daftar isi dibuat dengan field otomatis. Setelah dokumen diubah, klik kanan daftar isi lalu pilih Update Field agar nomor halaman diperbarui.",
            italics: true, size: 18, color: "888888", font: FONT,
          })],
        }),
      ],
    },
    { // Section 3: isi — arabic mulai 1
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } },
      },
      headers: { default: headerDoc },
      footers: { default: footerNum() },
      children: bodyChildren,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/z/my-project/download/penjelasan-olah-data-dan-laporan.docx", buf);
  console.log("OK -> download/penjelasan-olah-data-dan-laporan.docx");
});
