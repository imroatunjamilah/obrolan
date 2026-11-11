// Generator: Panduan Pengolahan Data & Penyusunan Laporan (docx)
// R1 cover (WM-1 Warm Teal) + TOC 3-section + body dengan tabel & grafik
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  SectionType, TableOfContents, TableLayoutType,
} = require("docx");
const fs = require("fs");

// ---------- Palet WM-1 (Warm Teal — education) ----------
const P = {
  bg: "F4F1E9", primary: "15857A", accent: "FF6A3B",
  cover: { titleColor: "15857A", subtitleColor: "606060", metaColor: "707070", footerColor: "A0A0A0" },
  table: { headerBg: "15857A", headerText: "FFFFFF", accentLine: "15857A", innerLine: "D5D0C8", surface: "F0EDE5" },
};

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder };

// ---------- helper umum ----------
const FONT_BODY = { ascii: "Times New Roman", eastAsia: "SimSun" };
const FONT_HEAD = { ascii: "Arial", eastAsia: "SimHei" };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 32, color: P.primary, font: FONT_HEAD })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120, line: 312 },
    children: [new TextRun({ text, bold: true, size: 28, color: "222222", font: FONT_HEAD })],
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: [new TextRun({ text, size: 24, color: "000000", font: FONT_BODY, ...opts })],
  });
}
function bodyRuns(runs) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312, after: 120 },
    children: runs.map(r => new TextRun({ size: 24, color: "000000", font: FONT_BODY, ...r })),
  });
}
function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 200, line: 312 },
    children: [new TextRun({ text, size: 20, color: "666666", italics: true, font: FONT_BODY })],
  });
}
function tableTitle(text) {
  return new Paragraph({
    keepNext: true,
    spacing: { before: 120, after: 80, line: 312 },
    children: [new TextRun({ text, bold: true, size: 21, color: "333333", font: FONT_BODY })],
  });
}
function cellPara(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { line: 312 },
    children: [new TextRun({ text: String(text), size: opts.size || 21, bold: opts.bold || false, color: opts.color || "000000", font: FONT_BODY })],
  });
}
// Tabel gaya three-line dengan header teal
function dataTable(headers, rows, widths, aligns) {
  const headerRow = new TableRow({
    tableHeader: true, cantSplit: true,
    children: headers.map((t, i) => new TableCell({
      children: [cellPara(t, { bold: true, color: P.table.headerText, align: aligns ? aligns[i] : AlignmentType.LEFT })],
      shading: { type: ShadingType.CLEAR, fill: P.table.headerBg },
      margins: { top: 70, bottom: 70, left: 120, right: 120 },
      width: { size: widths[i], type: WidthType.PERCENTAGE },
      verticalAlign: "center",
    })),
  });
  const dataRows = rows.map((r, ri) => new TableRow({
    cantSplit: true,
    children: r.map((v, i) => new TableCell({
      children: [cellPara(v, { align: aligns ? aligns[i] : AlignmentType.LEFT, bold: (aligns === undefined) ? false : false })],
      shading: { type: ShadingType.CLEAR, fill: ri % 2 === 0 ? "FFFFFF" : P.table.surface },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      width: { size: widths[i], type: WidthType.PERCENTAGE },
      verticalAlign: "center",
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: P.table.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: P.table.accentLine },
      left: noBorder, right: noBorder,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: P.table.innerLine },
      insideVertical: noBorder,
    },
    rows: [headerRow, ...dataRows],
  });
}
function chartImage(path, pxW, pxH, dispW) {
  const dispH = Math.round(dispW * pxH / pxW);
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 40 },
    children: [new ImageRun({ data: fs.readFileSync(path), transformation: { width: dispW, height: dispH }, type: "png" })],
  });
}

// ---------- Cover R1 ----------
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  // Latin text: rata-rata lebar huruf ~ pt*11 twips (lebih sempit dari CJK pt*20)
  const charWidth = (pt) => pt * 11;
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
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
function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([..."-_/ \t", ...",.;:"]);
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
    lines[lines.length - 1] += " " + last;
  }
  return lines;
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
function buildCoverR1(config) {
  const p = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR - 300;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length, fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: p.accent, space: 12 };
  const children = [];
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: p.accent, space: 8 } },
      children: [new TextRun({ text: config.englishLabel.split("").join("  "), size: 18, color: p.accent, font: { ascii: "Calibri", eastAsia: "SimHei" }, characterSpacing: 40 })],
    }));
  }
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true, color: p.cover.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })],
    }));
  }
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 800 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: p.cover.subtitleColor, font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 24, color: p.cover.metaColor, font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: p.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: p.cover.footerColor, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: p.cover.footerColor, font: { ascii: "Arial" } }),
    ],
  }));
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { type: ShadingType.CLEAR, fill: p.bg }, borders: allNoBorders,
        children,
      })],
    })],
  })];
}

// ---------- footer nomor halaman ----------
function pageNumFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: FONT_BODY })],
    })],
  });
}
function docHeader() {
  return new Header({
    children: [new Paragraph({
      alignment: AlignmentType.RIGHT,
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: "CCCCCC", space: 4 } },
      children: [new TextRun({ text: "Panduan Pengolahan Data & Penyusunan Laporan — Skrining DASS-21", size: 18, color: "808080", font: FONT_BODY })],
    })],
  });
}

// ---------- data hasil ----------
const hasil = JSON.parse(fs.readFileSync("/home/z/my-project/data_out/hasil_agregat.json", "utf-8"));
const temaCounts = JSON.parse(fs.readFileSync("/home/z/my-project/data_out/tema_keluhan.json", "utf-8")).counts;
const G = "/home/z/my-project/download/grafik";

const M = AlignmentType.CENTER, L = AlignmentType.LEFT, R = AlignmentType.RIGHT;

// ============================================================
// BODY CONTENT
// ============================================================
const bodyChildren = [];

// ---- 1. Ringkasan ----
bodyChildren.push(h1("1. Ringkasan"));
bodyChildren.push(body(
  "Dokumen ini menjelaskan tiga hal yang dibutuhkan untuk melaporkan data skrining kesehatan mental mahasiswa: " +
  "bagaimana data 449 responden diolah, alat (tools) yang dipakai dalam pengolahan, serta apa saja yang perlu dijelaskan " +
  "di laporan (skripsi). Seluruh angka yang disajikan di dokumen ini berasal dari file kerja " +
  "Analisis-DASS21-dan-Keluhan-449-Responden.xlsx yang menyertai dokumen ini, sehingga setiap angka dapat ditelusuri " +
  "kembali ke data per responden."));
bodyChildren.push(body(
  "Hasil utama: dari 449 mahasiswa yang mengisi kuesioner, 434 memberikan persetujuan dan dianalisis. " +
  "Sekitar 278 mahasiswa (64,1%) berada pada kategori minimal Sedang pada setidaknya satu subskala DASS-21. " +
  "Kecemasan menjadi kondisi paling menonjol: 317 mahasiswa (73,0%) berada di atas kategori Normal, " +
  "dengan rata-rata skor 11,89 (SD 7,37). Tema keluhan yang paling banyak muncul adalah rindu keluarga/rumah (96 jawaban, sekitar 21%), " +
  "disusul cemas dan overthinking (49), akademik (40), serta kelelahan dan stres (38)."));

// ---- 2. Cara mengolah data ----
bodyChildren.push(h1("2. Cara Data Diolah"));
bodyChildren.push(h2("2.1 Persiapan dan pembersihan data"));
bodyChildren.push(body(
  "Sumber data adalah file ekspor Google Form berisi 449 baris jawaban dengan 26 kolom: stempel waktu, pernyataan persetujuan, " +
  "pertanyaan kebahagiaan bersama keluarga, jawaban keluhan berbentuk narasi, dan 21 butir pernyataan DASS-21. " +
  "Langkah pertama adalah memeriksa kelengkapan kolom dan memastikan tidak ada nilai aneh. Seluruh 449 baris lengkap, " +
  "sehingga tidak ada baris yang dibuang karena kosong. Setiap responden kemudian diberi kode anonim (R-001 sampai R-449) " +
  "agar data pribadi tidak muncul pada laporan."));
bodyChildren.push(h2("2.2 Pemetaan jawaban menjadi skor DASS-21"));
bodyChildren.push(body(
  "Jawaban pada Google Form berbentuk label frekuensi: Tidak Pernah, Kadang-kadang, Sering, dan Selalu. " +
  "Label ini dipetakan ke angka 0, 1, 2, dan 3 mengikuti skala asli DASS-21. Skor tiap subskala dihitung dengan " +
  "menjumlahkan tujuh butir milik subskala tersebut lalu mengalikan hasilnya dengan dua, sehingga setara dengan skala DASS-42. " +
  "Pembagian butir mengikuti struktur standar DASS-21 dan identik dengan rumus yang dipakai aplikasi web:"));
bodyChildren.push(tableTitle("Tabel 1. Pembagian butir dan rentang skor kategori DASS-21"));
bodyChildren.push(dataTable(
  ["Subskala", "Butir", "Skor (0-42)", "Rentang kategori"],
  [
    ["Depresi", "3, 5, 10, 13, 16, 17, 21", "jumlah x 2", "Normal 0-9; Ringan 10-13; Sedang 14-20; Berat 21-27; Sangat Berat >= 28"],
    ["Kecemasan", "2, 4, 7, 9, 15, 19, 20", "jumlah x 2", "Normal 0-7; Ringan 8-9; Sedang 10-14; Berat 15-19; Sangat Berat >= 20"],
    ["Stres", "1, 6, 8, 11, 12, 14, 18", "jumlah x 2", "Normal 0-14; Ringan 15-18; Sedang 19-25; Berat 26-33; Sangat Berat >= 34"],
  ],
  [16, 26, 14, 44]
));
bodyChildren.push(body(
  "Rentang kategori di tabel di atas adalah cut-off publikasi umum DASS-21 dari Lovibond dan Lovibond (1995). " +
  "Hasil skrining berfungsi sebagai alat deteksi dini, bukan diagnosis klinis; pembatasan ini wajib dituliskan di laporan."));
bodyChildren.push(h2("2.3 Etika penelitian: pemisahan responden yang tidak bersedia"));
bodyChildren.push(body(
  "Pada pernyataan persetujuan, 434 responden memilih Saya bersedia dan 15 memilih Saya tidak bersedia. " +
  "Menjaga etika penelitian, kelima belas responden tersebut tetap tercatat di file Excel (dengan tanda Tidak pada kolom Bersedia) " +
  "tetapi dikeluarkan dari seluruh perhitungan statistik, grafik, dan kutipan keluhan. Dengan demikian semua angka pada laporan " +
  "menggunakan n = 434. Praktik yang sama patut dituliskan di bagian metode sebagai bukti kepatuhan pada asas informed consent."));
bodyChildren.push(h2("2.4 Klasifikasi tema keluhan (kata kunci + kecerdasan buatan)"));
bodyChildren.push(body(
  "Kolom keluhan berisi 416 jawaban naratif pendek (rata-rata tujuh kata) dan 33 jawaban yang isinya tidak ada keluhan. " +
  "Klasifikasi dilakukan dua tahap agar hasilnya transparan dan dapat diulang. Tahap pertama memakai daftar kata kunci " +
  "Indonesia (misalnya kangen, homesick, tugas, capek, overthinking, uang) sehingga jawaban yang jelas langsung masuk ke temanya. " +
  "Tahap kedua memakai Large Language Model (LLM) untuk menilai jawaban yang kalimatnya tidak pasti, misalnya " +
  "belum betah di kost dengan hidup sendiri atau banyak pikiran karena teringat kejadian masa lalu. " +
  "Model yang dipakai adalah GLM melalui pustaka z-ai-web-dev-sdk dengan suhu (temperature) 0,1 agar jawaban model stabil, " +
  "dan jawaban model dibatasi memilih salah satu dari 11 tema yang sudah ditetapkan. Bila model gagal dijawab, aturan kata kunci " +
  "dipakai sebagai cadangan. Hasil akhirnya: seluruh 449 jawaban terklasifikasi tanpa ada yang tersisa ke kategori Lainnya."));
bodyChildren.push(h2("2.5 Pengecekan ulang otomatis"));
bodyChildren.push(body(
  "File Excel hasil pengolahan dilengkapi lembar Review yang berisi lima pemeriksaan konsistensi (jumlah baris, jumlah responden " +
  "bersedia, total skor depresi, jumlah kategori Normal kecemasan, dan jumlah tema rindu keluarga). Kelima pemeriksaan dihitung " +
  "ulang oleh rumus di dalam file itu sendiri dan semuanya berstatus PASS, sehingga angka pada laporan dapat dipercaya tanpa " +
  "pemeriksaan manual."));

// ---- 3. Tools ----
bodyChildren.push(h1("3. Alat yang Dipakai"));
bodyChildren.push(body(
  "Pengolahan dilakukan di komputer dengan bantuan bahasa pemrograman Python dan JavaScript. " +
  "Tidak ada satu pun langkah yang dilakukan manual per baris, sehingga jika data bertambah, pengolahan dapat diulang dengan cepat."));
bodyChildren.push(tableTitle("Tabel 2. Perangkat pengolahan data"));
bodyChildren.push(dataTable(
  ["Alat", "Peran", "Tahapan yang memakainya"],
  [
    ["Python + pandas", "Membaca file Excel Google Form, memetakan label ke skor 0-3, menghitung skor dan kategori DASS-21, statistik deskriptif, korelasi Pearson", "Skoring, kategorisasi, agregasi"],
    ["openpyxl", "Menyusun workbook Excel hasil: 7 lembar, pemformatan, pewarnaan kategori, lembar Review dengan rumus hidup", "Pembuatan file Excel"],
    ["matplotlib", "Menggambar 4 grafik (distribusi kategori, rata-rata skor, tema keluhan, histogram)", "Visualisasi untuk laporan"],
    ["Node.js + z-ai-web-dev-sdk", "Menjalankan model GLM untuk mengklasifikasi 11 tema keluhan dari jawaban naratif", "Klasifikasi tema"],
    ["Excel / LibreOffice", "Memeriksa ulang hasil, validasi rumus (recalc), dan sebagai media penyajian data", "Pemeriksaan kualitas"],
  ],
  [22, 46, 32]
));

// ---- 4. Temuan ----
bodyChildren.push(h1("4. Temuan Utama dari Data"));
bodyChildren.push(h2("4.1 Sebaran kategori DASS-21"));
bodyChildren.push(body(
  "Tabel 3 merangkum sebaran kategori ketiga subskala. Kecemasan terlihat jauh lebih menonjol dibanding depresi dan stres: " +
  "hanya 27,0% mahasiswa berada di kategori Normal, sementara 62,4% berada di kategori Sedang ke atas (termasuk 128 mahasiswa " +
  "pada kategori Berat atau Sangat Berat). Depresi dan stres justru didominasi kategori Normal (masing-masing 52,1% dan 60,8%)."));
bodyChildren.push(tableTitle("Tabel 3. Distribusi kategori DASS-21 (n = 434)"));
bodyChildren.push(dataTable(
  ["Subskala", "Mean (SD)", "Normal", "Ringan", "Sedang", "Berat", "Sangat Berat", ">= Sedang"],
  [
    ["Depresi", "9,3 (7,0)", "226", "91", "93", "14", "10", "117 (27,0%)"],
    ["Kecemasan", "11,9 (7,4)", "117", "46", "143", "61", "67", "271 (62,4%)"],
    ["Stres", "13,8 (7,7)", "264", "80", "55", "29", "6", "90 (20,7%)"],
  ],
  [15, 14, 11, 10, 11, 9, 13, 17],
  [L, M, M, M, M, M, M, M]
));
bodyChildren.push(chartImage(`${G}/grafik1_distribusi_kategori.png`, 1839, 919, 560));
bodyChildren.push(caption("Gambar 1. Distribusi kategori DASS-21 per subskala (persentase responden)"));
bodyChildren.push(body(
  "Secara gabungan, 278 mahasiswa (64,1%) memperoleh kategori minimal Sedang pada setidaknya satu subskala. " +
  "Angka ini bisa dipakai sebagai argumen utama perlunya layanan konseling proaktif di kampus."));
bodyChildren.push(h2("4.2 Hubungan antar subskala dan faktor keluarga"));
bodyChildren.push(body(
  "Ketiga subskala berkorelasi kuat (r = 0,72 sampai 0,77), menandakan mahasiswa yang mengalami satu kelompok gejala " +
  "cenderung mengalami kelompok gejala lain juga. Perbandingan berdasarkan jawaban kebahagiaan bersama keluarga memberi temuan " +
  "yang menarik untuk dibahas: 20 mahasiswa yang menjawab Tidak Bahagia memiliki rata-rata skor jauh lebih tinggi " +
  "(depresi 15,5; kecemasan 17,5; stres 19,2) dan 95,0% di antara mereka berada pada kategori minimal Sedang, " +
  "dibanding 62,6% pada kelompok yang menjawab Bahagia. Hubungan keluarga dengan kondisi mental mahasiswa ini cocok " +
  "dijadikan salah satu sudut pembahasan di laporan."));
bodyChildren.push(h2("4.3 Tema keluhan mahasiswa"));
bodyChildren.push(chartImage(`${G}/grafik3_tema_keluhan.png`, 1839, 1080, 560));
bodyChildren.push(caption("Gambar 2. Distribusi tema keluhan mahasiswa (jawaban bebas, 2 minggu terakhir)"));
bodyChildren.push(body(
  "Rindu keluarga/rumah (homesick) menjadi tema keluhan tertinggi dengan 96 jawaban (21%). " +
  "Tema ini selaras dengan profil mahasiswa tahun pertama yang baru merantau. Tema berikutnya adalah cemas dan overthinking (49), " +
  "akademik (40), kelelahan dan stres (38), tidur dan kesehatan fisik (20), serta hubungan sosial (21). " +
  "Sementara 146 jawaban (33%) menyatakan tidak ada keluhan spesifik. Tema rindu keluarga yang menonjol sekaligus skor kecemasan " +
  "yang tinggi saling menguatkan dan bisa dijadikan narasi utama laporan."));

// ---- 5. Apa yang dijelaskan di laporan ----
bodyChildren.push(h1("5. Apa yang Harus Dijelaskan di Laporan"));
bodyChildren.push(body(
  "Bagian ini adalah panduan menuliskan hasil pengolahan ke dalam laporan/skripsi. Kerangka berikut mengikuti pola umum " +
  "BAB laporan penelitian; sesuaikan penomoran bab dengan struktur yang diminta pembimbing."));
bodyChildren.push(h2("5.1 Bagian metode (BAB III): hal yang wajib ditulis"));
bodyChildren.push(body(
  "Jelaskan enam hal: (1) instrumen DASS-21 beserta sumber teorinya (Lovibond & Lovibond, 1995) dan penggunaan versi 21 butir " +
  "dengan skor dikali dua; (2) rentang kategori yang dipakai, disalin dari Tabel 1 dokumen ini; (3) prosedur pengambilan data " +
  "melalui Google Form beserta pertanyaan tambahan (kebahagiaan keluarga dan keluhan bebas); (4) jumlah responden dan penyaringan " +
  "persetujuan: 449 terkumpul, 434 dianalisis, 15 dikeluarkan karena menolak persetujuan; (5) teknik pengolahan: pemetaan label " +
  "ke skor 0-3, penjumlahan per subskala, kategorisasi, statistik deskriptif, korelasi Pearson; (6) teknik klasifikasi tema " +
  "keluhan: kombinasi kata kunci dan LLM dengan daftar 11 tema yang ditetapkan sebelumnya."));
bodyChildren.push(h2("5.2 Bagian hasil (BAB IV): angka dan gambar yang bisa langsung dikutip"));
bodyChildren.push(body(
  "Sajikan Tabel 3 (distribusi kategori) dan Gambar 1 dari dokumen ini. Tuliskan tiga kalimat kunci: " +
  "(1) kecemasan adalah kondisi paling banyak (62,4% di atas Normal; 38,7% kategori Sedang ke atas); " +
  "(2) secara gabungan 64,1% mahasiswa berada pada kategori minimal Sedang di satu subskala mana pun; " +
  "(3) korelasi antar subskala kuat (r = 0,72-0,77). Tambahkan tabel tema keluhan dari lembar Tema Keluhan di file Excel, " +
  "serta kutipan anonim (kode R-xxx) sebagai ilustrasi kualitatif. Perbandingan kelompok keluarga (Tabel F di lembar Statistik) " +
  "dapat ditampilkan sebagai analisis tambahan."));
bodyChildren.push(h2("5.3 Bagian pembahasan (BAB V): cara mengartikan angka"));
bodyChildren.push(body(
  "Tiga arah pembahasan yang paling kuat dari data ini: pertama, tingginya kecemasan sekaligus dominannya tema rindu keluarga " +
  "menunjukkan penyesuaian diri (adaptasi) mahasiswa baru terhadap kehidupan kos dan jarak dengan keluarga sebagai masalah utama; " +
  "kedua, mahasiswa dengan hubungan keluarga yang kurang harmonis menunjukkan skor lebih tinggi, sehingga keluarga bisa dibaca " +
  "sebagai faktor protektif; ketiga, karena ketiga subskala berkorelasi kuat, intervensi satu bentuk layanan (misalnya kelompok " +
  "peersupport atau penanganan homesick) berpotensi menurunkan lebih dari satu jenis gejala. Kaitkan pembahasan dengan teori " +
  "penyesuaian diri mahasiswa dan layanan bimbingan konseling yang tersedia di UPA BK."));
bodyChildren.push(h2("5.4 Keterbatasan yang perlu diakui"));
bodyChildren.push(body(
  "Empat keterbatasan wajib ditulis agar laporan jujur secara ilmiah. Pertama, DASS-21 adalah alat skrining, bukan diagnosis; " +
  "kategori Berat atau Sangat Berat berarti perlu tindak lanjut profesional, bukan pasti mengalami gangguan. " +
  "Kedua, teks butir 15 dan 16 pada kuesioner identik (saling menduplikasi), sehingga nilai butir 16 patut dibaca hati-hati; " +
  "penilaian tetap mengikuti penomoran standar DASS-21. Ketiga, data merupakan potongan waktu (cross-sectional) tanpa data " +
  "demografis lengkap (angkatan, jenis kelamin, asal daerah) sehingga perbandingan antar kelompok terbatas. " +
  "Keempat, klasifikasi tema keluhan bersifat perkiraan untuk jawaban pendek yang ambigu; kehati-hatian diperlukan ketika " +
  "mengutip persentase tema."));
bodyChildren.push(h2("5.5 Saran praktis yang bisa dituliskan"));
bodyChildren.push(body(
  "Untuk UPA BK: mengadakan program penanganan homesick dan penyesuaian diri bagi mahasiswa baru, mengingat temanya paling dominan; " +
  "menyiapkan alur tindak lanjut bagi mahasiswa kategori Berat/Sangat Berat (128 mahasiswa pada kecemasan berada di kategori " +
  "Berat atau Sangat Berat); serta memanfaatkan aplikasi web Obrolan sebagai kanal skrining rutin karena hasil skrining langsung " +
  "tertampung ke database dan bisa ditinjau petugas. Untuk penelitian selanjutnya: melengkapi data demografis, menambah instrumen " +
  "kualitatif (wawancara), dan memperbaiki redaksi butir 15/16 pada kuesioner."));

// ---- 6. Penjelasan isi web ----
bodyChildren.push(h1("6. Penjelasan Isi Aplikasi Web Obrolan"));
bodyChildren.push(body(
  "Aplikasi web Obrolan (obrolan-eta.vercel.app) adalah layanan konseling daring milik UPA BK yang dibangun khusus untuk " +
  "proyek ini. Aplikasi dipakai mahasiswa untuk skrining dan ngobrol, dan dipakai petugas untuk memantau hasilnya. " +
  "Bagian ini bisa dipakai sebagai bahan menulis deskripsi produk di laporan."));
bodyChildren.push(h2("6.1 Fitur untuk mahasiswa"));
bodyChildren.push(body(
  "Mahasiswa mendaftar dengan nama, nomor WhatsApp, dan memilih preferensi waktu layanan (opsi lengkap sesuai jadwal UPA BK). " +
  "Selanjutnya mahasiswa mengisi skrining DASS-21 berisi 21 pernyataan dengan empat pilihan frekuensi selama tujuh hari terakhir. " +
  "Hasil skor tidak pernah ditampilkan kepada mahasiswa; yang tampil hanya pesan konfirmasi bahwa jawaban tersimpan dan akan " +
  "ditinjau petugas. Setelah skrining, mahasiswa bisa berbincang dengan asisten percakapan berbasis LLM yang dirancang sebagai " +
  "pendengar awal, bukan pengganti konselor, dengan kemampuan mengarahkan mahasiswa ke layanan UPA BK bila ditemukan indikasi berat."));
bodyChildren.push(h2("6.2 Fitur untuk petugas (admin)"));
bodyChildren.push(body(
  "Petugas masuk lewat halaman admin dengan nama pengguna dan kata sandi yang disimpan terenkripsi. Dashboard admin menampilkan " +
  "daftar pendaftaran, hasil skrining DASS-21 per mahasiswa beserta kategori tingkat keparahan tiap subskala, riwayat percakapan, " +
  "dan catatan tindak lanjut (follow-up). Petugas dapat menandai mahasiswa yang perlu dihubungi lebih dulu, sehingga skrining " +
  "daring tersambung dengan alur layanan tatap muka yang sebenarnya."));
bodyChildren.push(h2("6.3 Teknologi dan cara kerja singkat"));
bodyChildren.push(body(
  "Aplikasi dibangun dengan Next.js 16 (React + TypeScript) untuk antarmuka, Prisma sebagai penghubung database, dan database " +
  "PostgreSQL di layanan Neon. Percakapan mengunakan model GLM melalui kunci API yang hanya tersimpan di sisi server, " +
  "sehingga kunci tidak pernah terkirim ke peramban mahasiswa. Seluruh aplikasi di-deploy ke Vercel sehingga dapat diakses " +
  "dari mana saja tanpa server sendiri. Arsitektur ini dipilih karena gratis untuk skala layanan kampus dan mudah dipelihara."));
bodyChildren.push(h2("6.4 Privasi dan keamanan"));
bodyChildren.push(body(
  "Tiga prinsip keamanan diterapkan. Pertama, kategori skor DASS-21 hanya terlihat oleh petugas, tidak pernah ditampilkan ke " +
  "mahasiswa, sesuai kebijakan layanan konseling. Kedua, semua komunikasi ke model AI dan database melewati server aplikasi " +
  "(server-side), dan kata sandi admin disimpan dalam bentuk hash, bukan teks biasa. Ketiga, data sensitif seperti file mentah " +
  "Google Form tidak pernah masuk ke kode program, repositori GitHub, maupun file ZIP, dan hanya tersimpan di perangkat kerja " +
  "yang aman."));

// ---- 7. Lampiran file ----
bodyChildren.push(h1("7. Daftar Berkas yang Diserahkan"));
bodyChildren.push(body(
  "Tiga berkas menyertai dokumen ini. Pertama, Analisis-DASS21-dan-Keluhan-449-Responden.xlsx berisi tujuh lembar: Ringkasan, " +
  "Data Responden (449 baris dengan skor, kategori, dan tema keluhan), Distribusi Kategori, Statistik, Tema Keluhan, Grafik, " +
  "dan Review. Kedua, folder grafik berisi empat gambar PNG resolusi tinggi siap tempel ke Word (Gambar 1 dan 2 di dokumen ini " +
  "diambil dari folder tersebut). Ketiga, obrolan-kode.zip berisi seluruh kode sumber aplikasi web yang siap dibuka kembali " +
  "di komputer lain (cara membukanya: ekstrak ZIP, jalankan npm install, salin file .env.example menjadi .env, lalu npm run dev)."));

// ============================================================
// DOCUMENT
// ============================================================
const doc = new Document({
  creator: "Z.ai",
  styles: {
    default: {
      document: {
        run: { font: FONT_BODY, size: 24, color: "000000" },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: FONT_HEAD, size: 32, bold: true, color: P.primary },
        paragraph: { spacing: { before: 360, after: 160, line: 312 }, outlineLevel: 0 },
      },
      heading2: {
        run: { font: FONT_HEAD, size: 28, bold: true, color: "222222" },
        paragraph: { spacing: { before: 240, after: 120, line: 312 }, outlineLevel: 1 },
      },
    },
  },
  sections: [
    { // Section 1: cover — tanpa nomor halaman
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      children: buildCoverR1({
        title: "Panduan Pengolahan Data & Penyusunan Laporan",
        subtitle: "Skrining DASS-21 449 Responden dan Aplikasi Web Obrolan UPA BK",
        englishLabel: "LAPORAN PENGOLAHAN DATA",
        metaLines: [
          "Data: 449 responden skrining daring",
          "Instrumen: DASS-21 (Lovibond & Lovibond, 1995)",
          "Tanggal penyusunan: 11 November 2026",
        ],
        footerLeft: "UPA BK — Layanan Konseling",
        footerRight: "Dokumen pendamping skripsi",
        palette: P,
      }),
    },
    { // Section 2: TOC — angka romawi
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      footers: { default: pageNumFooter() },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 480, after: 360 },
          children: [new TextRun({ text: "DAFTAR ISI", bold: true, size: 32, font: FONT_HEAD, color: P.primary })],
        }),
        new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({
          spacing: { before: 200 },
          children: [new TextRun({
            text: "Catatan: Daftar isi dibuat dengan field otomatis. Setelah dokumen diedit, klik kanan daftar isi lalu pilih Update Field agar nomor halaman diperbarui.",
            italics: true, size: 18, color: "888888", font: FONT_BODY,
          })],
        }),
      ],
    },
    { // Section 3: body — angka arab mulai 1
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: { default: docHeader() },
      footers: { default: pageNumFooter() },
      children: bodyChildren,
    },
  ],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/home/z/my-project/download/Panduan-Pengolahan-Data-dan-Laporan.docx", buf);
  console.log("OK docx", buf.length, "bytes");
});
