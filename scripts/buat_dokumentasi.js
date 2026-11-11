// Dokumentasi UPA BK: penjelasan isi web + metodologi data + panduan laporan
// Resep cover: R1 (design-system.md), palet WM-1 (education), 3 seksi + TOC.
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  SectionType, TableOfContents, LevelFormat, TableLayoutType,
} = require("docx");
const fs = require("fs");

// ---------- Palet WM-1 (Warm Teal - education) ----------
const P = {
  bg: "F4F1E9", primary: "15857A", accent: "FF6A3B",
  titleColor: "15857A", subtitleColor: "606060", metaColor: "707070", footerColor: "A0A0A0",
  headerBg: "15857A", headerText: "FFFFFF", accentLine: "15857A", innerLine: "D5D0C8", surface: "F0EDE5",
};
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

const FONT_BODY = { ascii: "Times New Roman", eastAsia: "SimSun" };
const FONT_HEAD = { ascii: "Times New Roman", eastAsia: "SimHei" };

// ---------- Util cover (design-system.md) ----------
function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([..."，。、；：！？", ..."的与和及之在于为", ..."-_—–·/", ..." \t"]);
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
  const charWidth = (pt) => pt * 20;
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
  const safeRemaining = Math.max(usableHeight - contentHeight, 400);
  const FOOTER_MIN = 800;
  const rawTop = Math.floor(safeRemaining * 0.45);
  const rawBottom = Math.floor(safeRemaining * 0.45);
  const bottomSpacing = Math.max(rawBottom, FOOTER_MIN);
  const topSpacing = Math.max(rawTop - Math.max(0, FOOTER_MIN - rawBottom), 400);
  return { topSpacing, midSpacing: Math.max(safeRemaining - topSpacing - bottomSpacing, 0), bottomSpacing };
}
function buildCoverR1(config) {
  const PL = config.palette;
  const padL = 1200, padR = 800;
  // Judul Latin ~0.55x lebar CJK: lebarkan budget sesuai Rule 3 (estimateTextWidth)
  const availableWidth = Math.floor((11906 - padL - padR - 300) * 1.7);
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 36, 24);
  const titleSize = titlePt * 2;
  const spacing = calcCoverSpacing({
    titleLineCount: titleLines.length, titlePt,
    hasSubtitle: !!config.subtitle, hasEnglishLabel: !!config.englishLabel,
    metaLineCount: (config.metaLines || []).length, fixedHeight: 400,
  });
  const accentLeft = { style: BorderStyle.SINGLE, size: 8, color: PL.accent, space: 12 };
  const children = [];
  children.push(new Paragraph({ spacing: { before: spacing.topSpacing } }));
  if (config.englishLabel) {
    children.push(new Paragraph({
      indent: { left: padL, right: padR }, spacing: { after: 500 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: PL.accent, space: 8 } },
      children: [new TextRun({ text: config.englishLabel.split("").join("  "), size: 18, color: PL.accent, font: { ascii: "Calibri", eastAsia: "SimHei" }, characterSpacing: 40 })],
    }));
  }
  for (let i = 0; i < titleLines.length; i++) {
    children.push(new Paragraph({
      indent: { left: padL },
      spacing: { after: i < titleLines.length - 1 ? 100 : 300, line: Math.ceil(titlePt * 23), lineRule: "atLeast" },
      children: [new TextRun({ text: titleLines[i], size: titleSize, bold: true, color: PL.titleColor, font: { eastAsia: "SimHei", ascii: "Arial" } })],
    }));
  }
  if (config.subtitle) {
    children.push(new Paragraph({
      indent: { left: padL }, spacing: { after: 800 },
      children: [new TextRun({ text: config.subtitle, size: 24, color: PL.subtitleColor, font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }
  for (const line of (config.metaLines || [])) {
    children.push(new Paragraph({
      indent: { left: padL + 200 }, spacing: { after: 80 },
      border: { left: accentLeft },
      children: [new TextRun({ text: line, size: 24, color: PL.metaColor, font: { eastAsia: "Microsoft YaHei", ascii: "Arial" } })],
    }));
  }
  children.push(new Paragraph({ spacing: { before: spacing.bottomSpacing } }));
  children.push(new Paragraph({
    indent: { left: padL, right: padR },
    border: { top: { style: BorderStyle.SINGLE, size: 2, color: PL.accent, space: 8 } },
    spacing: { before: 200 },
    children: [
      new TextRun({ text: config.footerLeft || "", size: 16, color: PL.footerColor, font: { ascii: "Arial" } }),
      new TextRun({ text: "                                        " }),
      new TextRun({ text: config.footerRight || "", size: 16, color: PL.footerColor, font: { ascii: "Arial" } }),
    ],
  }));
  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({ shading: { type: ShadingType.CLEAR, fill: PL.bg }, borders: noBorders, children })],
    })],
  })];
}

// ---------- Komponen isi ----------
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
    children: [new TextRun({ text, bold: true, size: 28, color: P.primary, font: FONT_HEAD })],
  });
}
function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: "000000", font: FONT_BODY, ...opts })],
  });
}
function bodyRuns(runs) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 80 },
    children: runs.map((r) => new TextRun({ size: 24, color: "000000", font: FONT_BODY, ...r })),
  });
}
function numbered(text, ref) {
  return new Paragraph({
    numbering: { reference: ref, level: 0 },
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 60 },
    children: [new TextRun({ text, size: 24, color: "000000", font: FONT_BODY })],
  });
}
function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 60 },
    children: [new TextRun({ text, size: 24, color: "000000", font: FONT_BODY })],
  });
}
function captionTable(text) {
  return new Paragraph({
    keepNext: true, alignment: AlignmentType.CENTER,
    spacing: { before: 160, after: 80, line: 312 },
    children: [new TextRun({ text, bold: true, size: 21, color: "000000", font: FONT_BODY })],
  });
}
function captionFigure(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 60, after: 160, line: 312 },
    children: [new TextRun({ text, bold: true, size: 21, color: "000000", font: FONT_BODY })],
  });
}
function makeTable(headers, rows, widths) {
  const headerRow = new TableRow({
    tableHeader: true, cantSplit: true,
    children: headers.map((text, i) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: P.headerBg },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      width: { size: widths[i], type: WidthType.PERCENTAGE },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT, spacing: { line: 312 },
        children: [new TextRun({ text, bold: true, size: 21, color: P.headerText, font: FONT_BODY })],
      })],
    })),
  });
  const dataRows = rows.map((row, ri) => new TableRow({
    cantSplit: true,
    children: row.map((text, i) => new TableCell({
      shading: { type: ShadingType.CLEAR, fill: ri % 2 === 1 ? P.surface : "FFFFFF" },
      margins: { top: 60, bottom: 60, left: 120, right: 120 },
      width: { size: widths[i], type: WidthType.PERCENTAGE },
      children: [new Paragraph({
        alignment: AlignmentType.LEFT, spacing: { line: 312 },
        children: [new TextRun({ text: String(text), size: 21, color: "000000", font: FONT_BODY })],
      })],
    })),
  }));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: P.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: P.accentLine },
      left: NB, right: NB,
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: P.innerLine },
      insideVertical: NB,
    },
    rows: [headerRow, ...dataRows],
  });
}
function pngSize(buf) { return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) }; }
function figure(path, targetW) {
  const buf = fs.readFileSync(path);
  const { w, h } = pngSize(buf);
  const width = targetW || 560;
  const height = Math.round(width * (h / w));
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120 },
    children: [new ImageRun({ data: buf, transformation: { width, height }, type: "png" })],
  });
}
function pageNumFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080", font: FONT_BODY })],
    })],
  });
}

// ---------- ISI DOKUMEN ----------
const bodyChildren = [];

// BAB 1
bodyChildren.push(h1("1. Ringkasan Eksekutif"));
bodyChildren.push(body("Dokumen ini merangkum tiga hal yang dibutuhkan untuk melaporkan proyek layanan konseling digital UPA Bimbingan Konseling. Pertama, penjelasan isi aplikasi web \"Obrolan\" yang telah dideploy dan dapat diakses dari perangkat apa pun pada alamat obrolan-eta.vercel.app. Kedua, transparansi pengolahan data skrining 449 responden: perangkat yang digunakan, langkah kerja, rumus skor DASS-21, serta hasil utamanya. Ketiga, panduan struktur laporan beserta contoh redaksi temuan yang siap dipakai."));
bodyChildren.push(body("Hasil pengolahan data menunjukkan temuan yang jelas. Dari 434 responden yang bersedia dianalisis, 271 responden (62,4%) berada pada kategori kecemasan Sedang hingga Sangat Berat, 117 responden (27,0%) pada kategori depresi Sedang ke atas, dan 90 responden (20,7%) pada kategori stres Sedang ke atas. Secara keseluruhan, 278 responden (64,1%) memiliki minimal satu aspek berkategori Sedang ke atas. Tema keluhan yang paling sering muncul adalah rindu rumah atau homesick (25,0%) serta cemas, stres, dan overthinking (24,4%)."));
bodyChildren.push(body("Temuan tersebut menunjukkan urgensi program pendampingan adaptasi dan manajemen kecemasan bagi mahasiswa, terutama mahasiswa baru. Aplikasi web yang telah berjalan memberi UPA BK saluran layanan sepanjang waktu, sedangkan hasil analisis memberi dasar berbasis data untuk merancang program intervensi pada laporan."));

// BAB 2
bodyChildren.push(h1("2. Penjelasan Isi Aplikasi Web \"Obrolan\""));
bodyChildren.push(body("Aplikasi Obrolan adalah situs web layanan konseling untuk mahasiswa yang berjalan sepenuhnya di internet tanpa biaya sewa server. Mahasiswa cukup membuka alamat obrolan-eta.vercel.app melalui peramban pada ponsel atau laptop, tanpa perlu memasang aplikasi tambahan. Situs ini dibangun dengan kerangka Next.js, menyimpan data pada basis data Postgres terkelola (Neon), dan memanfaatkan model bahasa GLM dari z.ai sebagai otak chatbot. Seluruh fitur diakses melalui menu di sisi kiri layar, sehingga tampilan tetap rapi baik di ponsel maupun komputer."));
bodyChildren.push(body("Aplikasi memiliki empat modul utama: Ruang Obrolan (chatbot pendamping), Pendaftaran Layanan, Skrining DASS-21, dan Panel Petugas untuk pengelola UPA BK. Keempat modul ini saling terhubung: hasil pendaftaran dan skrining mahasiswa masuk ke Panel Petugas, sementara percakapan yang terdeteksi berisiko juga ditandai untuk ditinjau petugas."));
bodyChildren.push(h2("2.1 Ruang Obrolan (Chatbot Pendamping)"));
bodyChildren.push(body("Ruang Obrolan adalah tempat mahasiswa berbincang dengan chatbot pendamping yang siaga 24 jam. Chatbot dipandu oleh naskah sistem (system prompt) yang dikhususkan untuk konteks layanan bimbingan konseling kampus, sehingga gaya jawabannya empatik, tidak menghakimi, dan mengarahkan mahasiswa pada layanan profesional ketika dibutuhkan. Riwayat percakapan tersimpan sehingga mahasiswa dapat melanjutkan obrolan sebelumnya, dan mahasiswa dapat menghubungkan percakapan dengan pendaftaran layanannya."));
bodyChildren.push(body("Ruang ini juga dilengkapi pengendalian risiko. Jika isi percakapan mengandung indikasi krisis seperti niat menyakiti diri, aplikasi menampilkan spanduk peringatan berisi nomor bantuan darurat dan menandai percakapan tersebut agar mendapat perhatian petugas. Di bagian bawah obrolan selalu tercantum penegasan bahwa chatbot bukan pengganti konselor profesional, melainkan jalur pendampingan awal."));
bodyChildren.push(h2("2.2 Pendaftaran Layanan"));
bodyChildren.push(body("Modul Pendaftaran Layanan menggantikan formulir kertas. Mahasiswa mengisi nama, nomor induk, kontak, jenis layanan yang dipilih, preferensi hari dan waktu, serta keluhan yang ingin disampaikan secara bebas. Sebelum mengirim, mahasiswa diminta menyetujui pernyataan persetujuan layanan, sehingga aspek persetujuan tercatat sistematis."));
bodyChildren.push(body("Setelah formulir terkirim, sistem memberikan token pendaftaran yang menghubungkan mahasiswa tersebut dengan percakapan chatbot dan hasil skriningnya. Seluruh pendaftaran langsung tampak pada Panel Petugas lengkap dengan status tindak lanjut, sehingga tidak ada pendaftar yang terlewat."));
bodyChildren.push(h2("2.3 Skrining DASS-21"));
bodyChildren.push(body("Modul Skrining memakai instrumen DASS-21 (Depression Anxiety Stress Scales) berisi 21 pernyataan tentang kondisi emosi dan fisik dalam tujuh hari terakhir. Mahasiswa memilih salah satu dari empat opsi frekuensi pada setiap pernyataan: Tidak Pernah, Kadang-kadang, Sering, atau Selalu. Tujuh pernyataan pertama dan seterusnya terbagi otomatis ke dalam tiga aspek: depresi, kecemasan, dan stres."));
bodyChildren.push(body("Sesuai kebijakan layanan yang menjaga kenyamanan mahasiswa, skor dan kategori hasil skrining tidak pernah ditampilkan kepada mahasiswa. Hasil hanya dapat dilihat petugas melalui Panel Petugas, dan skrining ini berkedudukan sebagai alat saringan awal, bukan alat diagnosis."));
bodyChildren.push(h2("2.4 Panel Petugas"));
bodyChildren.push(body("Panel Petugas adalah dasbor khusus pengelola UPA BK yang diakses dengan nama pengguna dan kata sandi admin. Panel menampilkan ringkasan statistik layanan, daftar pendaftar, skor dan kategori DASS-21 per mahasiswa, serta percakapan yang ditandai berisiko. Dari panel ini petugas dapat menindaklanjuti setiap pendaftaran: mengubah status dari menunggu ditinjau menjadi sedang diproses, dijadwalkan, selesai, atau perlu ditinjau segera, disertai catatan petugas."));
bodyChildren.push(body("Dengan demikian alur layanan dari pendaftaran, skrining, obrolan awal, hingga jadwal konseling tercatat dalam satu tempat dan tidak tersebar di berbagai berkas."));
bodyChildren.push(h2("2.5 Keamanan dan Privasi"));
bodyChildren.push(body("Aplikasi dirancang dengan prinsip hati-hati terhadap data yang sensitif. Mahasiswa tidak perlu membuat akun; identitas hanya diisi saat mendaftar layanan. Kata sandi admin disimpan dalam bentuk hash PBKDF2, bukan teks asli, dan seluruh kredensial rahasia disimpan pada variabel lingkungan di server, tidak pernah ditulis di dalam kode. Hasil skrining tidak pernah dikirim kembali ke mahasiswa maupun digunakan oleh chatbot untuk dinilai ulang."));
bodyChildren.push(body("Sebagai praktik lanjutan, disarankan memperhatikan kebijakan retensi data, melakukan pencadangan berkala melalui konsol Neon, dan membagikan akses Panel Petugas hanya kepada petugas yang berwenang."));

// BAB 3
bodyChildren.push(h1("3. Pengolahan Data Skrining Responden"));
bodyChildren.push(h2("3.1 Sumber dan Profil Data"));
bodyChildren.push(body("Data berasal dari Google Form skrining yang diisi responden pada 11 s.d. 12 Agustus 2026. Berkas mentah berisi 449 respons dalam satu lembar kerja, tanpa nama maupun NIM, sehingga sifatnya anonim sejak awal. Kolomnya terdiri atas waktu pengisian, pernyataan persetujuan, pertanyaan kebahagiaan bersama keluarga beserta alasannya, keluhan bebas dua minggu terakhir, dan 21 butir jawaban DASS-21."));
bodyChildren.push(body("Dari 449 respons, sebanyak 434 responden (96,7%) menyatakan \"Saya bersedia\" dan seluruh analisis dihitung atas kelompok ini. Lima belas responden yang tidak bersedia dikeluarkan dari perhitungan sesuai prinsip etika penelitian, meskipun jawaban mereka tetap tersimpan. Tidak ditemukan baris ganda maupun jawaban kosong pada butir DASS-21, sehingga tidak diperlukan imputasi data."));
bodyChildren.push(h2("3.2 Perangkat yang Digunakan"));
bodyChildren.push(body("Pengolahan dilakukan sepenuhnya secara terprogram agar angka yang dilaporkan dapat dipertanggungjawabkan dan diulang kapan pun. Tabel 1 merangkum perangkat beserta perannya."));
bodyChildren.push(captionTable("Tabel 1. Perangkat pengolahan data dan perannya"));
bodyChildren.push(makeTable(
  ["Perangkat", "Peran dalam Pengolahan"],
  [
    ["Python 3 + pandas", "Membaca berkas Excel, memvalidasi jawaban, mengonversi label ke angka 0-3, menghitung skor dan kategori DASS-21, serta menghitung seluruh tabel frekuensi dan statistik."],
    ["Model bahasa GLM (z.ai)", "Mengklasifikasikan 316 teks keluhan bebas ke dalam tema terstandar (maksimal 2 tema per keluhan), diproses per 20 teks dengan suhu rendah agar konsisten."],
    ["openpyxl", "Menyusun berkas Excel hasil olahan tujuh lembar lengkap dengan format, grafik, dan lembar cek silang."],
    ["LibreOffice (mode teks)", "Menghitung ulang seluruh formula pemeriksaan silang untuk menjamin tidak ada kesalahan hitung."],
    ["Excel dan Word", "Media penyajian akhir: grafik pada Excel dan narasi laporan pada Word."],
  ],
  [30, 70]
));
bodyChildren.push(body("Seluruh langkah tertuang dalam skrip yang tersimpan, sehingga bila data diperbarui, hasil dapat dibuat ulang dengan perintah yang sama. Setiap angka pada lembar ringkasan juga disandingkan dengan lembar cek silang yang membandingkan hasil agregasi terhadap data per responden; seluruh pemeriksaan berstatus PASS."));
bodyChildren.push(h2("3.3 Langkah Pengolahan"));
bodyChildren.push(body("Alur pengolahan terdiri atas tujuh langkah berikut."));
bodyChildren.push(numbered("Membaca berkas mentah dan memeriksa jumlah baris, duplikasi, serta kelengkapan jawaban.", "langkah-olah"));
bodyChildren.push(numbered("Menyaring persetujuan: hanya respons \"Saya bersedia\" yang masuk analisis (N = 434).", "langkah-olah"));
bodyChildren.push(numbered("Mengonversi jawaban teks ke angka: Tidak Pernah = 0, Kadang-kadang = 1, Sering = 2, Selalu = 3.", "langkah-olah"));
bodyChildren.push(numbered("Menjumlahkan tujuh butir tiap aspek lalu mengalikan dua agar setara DASS-42: skor = jumlah 7 butir x 2 (rentang 0-42).", "langkah-olah"));
bodyChildren.push(numbered("Mengategorikan skor tiap aspek memakai cut-off publikasi DASS-21 (Tabel 2).", "langkah-olah"));
bodyChildren.push(numbered("Mengklasifikasikan teks keluhan bebas ke dalam 11 tema dengan model bahasa, disertai penghitungan sebutan dan kutipan contoh.", "langkah-olah"));
bodyChildren.push(numbered("Menyusun berkas Excel hasil: ringkasan, distribusi kategori, tema keluhan, frekuensi butir, data keluarga, skor per responden, dan lembar cek silang, lengkap dengan grafik.", "langkah-olah"));
bodyChildren.push(captionTable("Tabel 2. Cut-off kategori skor DASS-21 (Lovibond & Lovibond, 1995)"));
bodyChildren.push(makeTable(
  ["Kategori", "Depresi", "Kecemasan", "Stres"],
  [
    ["Normal", "0 - 9", "0 - 7", "0 - 14"],
    ["Ringan", "10 - 13", "8 - 9", "15 - 18"],
    ["Sedang", "14 - 20", "10 - 14", "19 - 25"],
    ["Berat", "21 - 27", "15 - 19", "26 - 33"],
    ["Sangat Berat", "28 ke atas", "20 ke atas", "34 ke atas"],
  ],
  [25, 25, 25, 25]
));
bodyChildren.push(h2("3.4 Hasil Utama"));
bodyChildren.push(body("Pada aspek depresi, rerata skor 9,3 (SD 7,0). Sebanyak 226 responden (52,1%) berkategori Normal dan 91 (21,0%) Ringan, sementara 93 (21,4%) Sedang, 14 (3,2%) Berat, dan 10 (2,3%) Sangat Berat. Gambar 1 memperlihatkan perbandingan ketiga aspek sekaligus; pola yang tampak adalah beban kecemasan yang jauh lebih tinggi dibanding dua aspek lainnya."));
bodyChildren.push(figure("/home/z/my-project/data_out/gambar1_distribusi.png"));
bodyChildren.push(captionFigure("Gambar 1. Distribusi kategori DASS-21 per subskala (N = 434)"));
bodyChildren.push(body("Aspek kecemasan paling menonjol: rerata skor 11,9 (SD 7,4) dan hanya 117 responden (27,0%) berkategori Normal. Sebanyak 143 responden (32,9%) Sedang, 61 (14,1%) Berat, dan 67 (15,4%) Sangat Berat, sehingga total kategori Sedang ke atas mencapai 271 responden (62,4%), dengan kategori Berat dan Sangat Berat saja 128 responden (29,5%). Butir dengan jawaban Sering atau Selalu tertinggi pun bertema kecemasan: \"menghabiskan banyak energi karena cemas\" (33,6%), \"mulut sering kering\" (31,6%), dan \"khawatir dengan situasi yang bisa memicu panik\" (28,8%)."));
bodyChildren.push(body("Aspek stres relatif lebih terjaga dengan rerata 13,8 (SD 7,7); 264 responden (60,8%) Normal dan 90 (20,7%) kategori Sedang ke atas. Meskipun demikian, bila ketiga aspek digabung, 278 responden (64,1%) memiliki minimal satu aspek berkategori Sedang ke atas, dan hanya 106 responden (24,4%) yang seluruh aspeknya Normal. Kelompok inilah yang layak menjadi sasaran tindak lanjut UPA BK."));
bodyChildren.push(figure("/home/z/my-project/data_out/gambar2_tema.png"));
bodyChildren.push(captionFigure("Gambar 2. Tema keluhan mahasiswa (316 responden mengajukan keluhan)"));
bodyChildren.push(body("Dari 434 responden dianalisis, 316 orang (72,8%) menuliskan keluhan bebas, sementara 118 orang menulis tanpa keluhan. Tema terbanyak adalah Homesick & Rindu Rumah (79 sebutan; 25,0% dari pengaju keluhan), disusul Cemas, Stres & Overthinking (77; 24,4%) dan Sosial & Percaya Diri (57; 18,0%). Tema berikutnya berturut-turut adalah mood dan motivasi turun (35), tidur dan kesehatan fisik (33), aktivitas padat dan waktu (33), keuangan (30), keluarga (27), serta akademik dan studi (18). Dominasi tema rindu rumah dan kecemasan ini konsisten dengan profil kampus yang banyak menerima mahasiswa dari luar daerah."));
bodyChildren.push(body("Pada pertanyaan kebahagiaan keluarga, 428 dari 449 respons (95,3%) menjawab Bahagia dan 21 (4,7%) menjawab Tidak Bahagia. Alasan yang ditulis kelompok kedua antara lain konflik dengan anggota keluarga, kehadiran ibu tiri, dan jarak dengan orang tua; kutipan lengkapnya tersedia pada lembar Keluarga di berkas Excel."));
bodyChildren.push(h2("3.5 Keterbatasan dan Etika"));
bodyChildren.push(body("Empat keterbatasan perlu dicantumkan dalam laporan agar pembacaannya tetap proporsional. Pertama, DASS-21 adalah alat saringan, bukan diagnosis; kategori yang tinggi menandakan kebutuhan perhatian, bukan kepastian gangguan. Kedua, data bersifat laporan diri sehingga rentan bias jawaban. Ketiga, teks butir 16 pada kuesioner survei salah ketik (menyalin teks butir 15); jawaban tetap dianalisis sesuai posisi standar DASS-21 dan keterbatasan ini dicatat pada berkas hasil. Keempat, 15 responden yang tidak memberi persetujuan dikeluarkan, sehingga hasil mencerminkan kelompok yang bersedia."));
bodyChildren.push(body("Dari sisi etika, seluruh analisis memakai data anonim tanpa nama dan NIM, hanya responden bersedia yang dianalisis, dan identitas kutipan keluhan dilindungi. Berkas Excel berisi skor per responden (tanpa identitas) bersifat rahasia dan sebaiknya tidak dibagikan ke publik."));

// BAB 4
bodyChildren.push(h1("4. Panduan Isi Laporan"));
bodyChildren.push(body("Bab ini memberi kerangka siap pakai untuk menulis laporan atau skripsi: struktur bab, sumber angka untuk setiap bagian, cara menyajikan tabel dan grafik, contoh redaksi temuan, serta gagasan rekomendasi program yang lahir dari data. Kombinasikan penjelasan sistem (Bab 2 dokumen ini) dan hasil analisis (Bab 3) dengan gaya penulisan formal kampus Anda."));
bodyChildren.push(h2("4.1 Struktur Bab yang Disarankan"));
bodyChildren.push(captionTable("Tabel 3. Struktur laporan dan sumber materinya"));
bodyChildren.push(makeTable(
  ["Bab", "Isi Pokok", "Sumber Material"],
  [
    ["BAB I Pendahuluan", "Latar belakang kesehatan mental mahasiswa, keterbatasan layanan konvensional, rumusan masalah, tujuan, manfaat.", "Data awal kebutuhan UPA BK; ringkasan eksekutif dokumen ini."],
    ["BAB II Tinjauan Pustaka", "Teori kesehatan mental, instrumen DASS-21 (Lovibond & Lovibond, 1995), konsep chatbot konseling dan penelitian sejenis.", "Literatur kampus; bagian 2.3 dan 3.3 dokumen ini."],
    ["BAB III Metode", "Deskripsi sistem (arsitektur web, empat modul, privasi), populasi dan sampel 434 responden, instrumen, prosedur pengolahan.", "Bab 2 dan Bab 3 dokumen ini; skrip pengolahan."],
    ["BAB IV Hasil dan Pembahasan", "Distribusi kategori tiga aspek, tema keluhan, kebahagiaan keluarga, pembahasan keterkaitan antartemuan.", "Berkas Excel (lembar Ringkasan, Distribusi Kategori, Tema Keluhan, Keluarga); Gambar 1-2."],
    ["BAB V Penutup", "Simpulan menjawab rumusan masalah dan rekomendasi program layanan.", "Bagian 4.3 dan 4.4 dokumen ini."],
  ],
  [22, 44, 34]
));
bodyChildren.push(body("Untuk metode, cukup nyatakan bahwa data diolah dengan bantuan program komputer (Python) dengan rumus DASS-21 yang dijelaskan pada Tabel 2, serta klasifikasi tema keluhan dengan bantuan model bahasa. Cara ini lazim disebut analisis data terprogram dan keunggulannya adalah dapat diulang; lampirkan daftar langkah pada bagian 3.3 bila dosen meminta detail."));
bodyChildren.push(h2("4.2 Menyajikan Tabel, Grafik, dan Kutipan Keluhan"));
bodyChildren.push(body("Penomoran tabel dan gambar sebaiknya mengikuti bab, misalnya Tabel 4.1 dan Gambar 4.1 pada BAB IV. Grafik pada Gambar 1 dan Gambar 2 dokumen ini dapat dijadikan Gambar 4.1 dan 4.2 di laporan, atau dibuat ulang langsung dari lembar Excel yang sama. Setiap tabel dan gambar wajib diberi keterangan sumber, misalnya \"Sumber: hasil pengolahan data skrining UPA BK, 2026\"."));
bodyChildren.push(body("Saat mengutip keluhan mahasiswa, pilih kutipan yang representatif per tema, ubah ejaan seperlunya tanpa mengubah makna, dan jangan mencantumkan nama maupun ciri yang mengidentifikasikan orangnya. Skor per individu tidak perlu ditampilkan di laporan; sajikan dalam bentuk agregat (jumlah dan persentase) sebagaimana lembar Distribusi Kategori."));
bodyChildren.push(h2("4.3 Contoh Redaksi Temuan Siap Pakai"));
bodyChildren.push(body("Empat kalimat berikut dapat langsung dipakai atau disesuaikan pada bab hasil."));
bodyChildren.push(bullet("\"Dari 434 responden yang bersedia dianalisis, 271 responden (62,4%) berada pada kategori kecemasan Sedang hingga Sangat Berat, dengan 128 responden (29,5%) pada kategori Berat atau Sangat Berat.\""));
bodyChildren.push(bullet("\"Tema keluhan yang paling banyak diajukan adalah rindu rumah (homesick) sebanyak 79 sebutan (25,0%), diikuti cemas, stres, dan overthinking sebanyak 77 sebutan (24,4%).\""));
bodyChildren.push(bullet("\"Butir DASS-21 dengan jawaban Sering atau Selalu tertinggi adalah menghabiskan banyak energi karena cemas (33,6%) dan mulut sering kering (31,6%).\""));
bodyChildren.push(bullet("\"Sebanyak 278 responden (64,1%) memiliki minimal satu aspek berkategori Sedang ke atas sehingga memerlukan pemantauan dan tindak lanjut layanan konseling.\""));
bodyChildren.push(body("Konsistenkan gaya penulisan angka: gunakan tanda koma untuk desimal (62,4%) dan satu angka di belakang koma untuk persentase, seperti contoh di atas."));
bodyChildren.push(h2("4.4 Gagasan Rekomendasi Program"));
bodyChildren.push(body("Rekomendasi pada BAB V akan kuat jika menjawab tema keluhan yang ditemukan. Pemetaan berikut dapat dipakai sebagai titik tolak."));
bodyChildren.push(bullet("Homesick dan adaptasi: program orientasi tambahan, kelompok mentoring sejawat antarangkatan, dan kegiatan pengenalan kampus bagi mahasiswa perantauan."));
bodyChildren.push(bullet("Kecemasan dan overthinking: pelatihan manajemen kecemasan, teknik relaksasi, serta edukasi mengenai penggunaan Ruang Obrolan sebagai saluran pendampingan awal."));
bodyChildren.push(bullet("Sosial dan percaya diri: kelompok keterampilan sosial (social skills training) dan kegiatan penghubung pertemanan baru."));
bodyChildren.push(bullet("Tidur dan kesehatan fisik: edukasi higienitas tidur serta pengenalan tanda kelelahan akademik."));
bodyChildren.push(bullet("Keuangan dan keluarga: kolaborasi dengan bagian kesejahteraan mahasiswa untuk edukasi perencanaan keuangan dan konseling keluarga bila diperlukan."));

// BAB 5
bodyChildren.push(h1("5. Lampiran: File Serah Terima dan Administrasi Web"));
bodyChildren.push(h2("5.1 Daftar File yang Diserahkan"));
bodyChildren.push(captionTable("Tabel 4. Daftar file serah terima"));
bodyChildren.push(makeTable(
  ["File", "Isi", "Kegunaan"],
  [
    ["obrolan-kode-sumber.zip", "Seluruh kode sumber aplikasi web (147 file) yang sama persis dengan yang dideploy.", "Dibuka di komputer mana pun; dapat dijalankan ulang atau dikembangkan."],
    ["Hasil_Analisis_Data_Responden.xlsx", "Tujuh lembar hasil olahan data 449 responden beserta empat grafik dan lembar cek silang.", "Sumber angka, tabel, dan grafik untuk laporan."],
    ["Dokumentasi_Obrolan_dan_Panduan_Laporan.docx", "Dokumen ini.", "Acuan penjelasan isi web, metodologi, dan penulisan laporan."],
  ],
  [30, 40, 30]
));
bodyChildren.push(h2("5.2 Administrasi Web: Alamat, Sandi Admin, dan Pembaruan"));
bodyChildren.push(body("Mengganti alamat web dilakukan dengan mengubah nama proyek: masuk dasbor Vercel, pilih proyek, buka Settings lalu General, ubah kolom Project Name, kemudian Save. Alamat web otomatis mengikuti nama proyek, sehingga nama obrolan akan menghasilkan alamat obrolan.vercel.app bila nama tersebut tersedia."));
bodyChildren.push(body("Mengganti sandi admin dilakukan tiga langkah: ubah nilai ADMIN_PASSWORD pada Settings, Environment Variables; hapus akun lama di basis data Neon (tabel AdminUser); lalu klik Redeploy pada tab Deployments dan tunggu status Ready. Untuk memperbarui fitur aplikasi, ubah kode lalu unggah ke repositori GitHub; Vercel akan membangun ulang situs secara otomatis tanpa langkah tambahan."));
bodyChildren.push(body("Kredensial seperti LLM_API_KEY, SECRET_KEY, dan ADMIN_PASSWORD hanya tersimpan pada variabel lingkungan Vercel. Jangan menuliskannya di dalam kode maupun mengirimkannya melalui pesan, dan simpan salinan sandi admin di tempat yang aman."));

// ---------- Rangkai dokumen ----------
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
        run: { font: FONT_HEAD, size: 28, bold: true, color: P.primary },
        paragraph: { spacing: { before: 240, after: 120, line: 312 }, outlineLevel: 1 },
      },
    },
  },
  numbering: {
    config: [{
      reference: "langkah-olah",
      levels: [{
        level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } },
      }],
    }],
  },
  sections: [
    { // Seksi 1: cover — tanpa nomor halaman
      properties: {
        page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 0, left: 0, right: 0 } },
      },
      children: buildCoverR1({
        title: "Aplikasi Obrolan & Analisis Data Skrining",
        subtitle: "Penjelasan Isi Web, Metodologi Pengolahan Data, dan Panduan Penyusunan Laporan",
        englishLabel: "UPA BIMBINGAN KONSELING",
        metaLines: [
          "Unit Penyelenggara : UPA Bimbingan Konseling",
          "Aplikasi : obrolan-eta.vercel.app",
          "Periode Data Skrining : 11 s.d. 12 Agustus 2026 (449 respons)",
          "Dokumen Disusun : 11 November 2026",
        ],
        footerLeft: "UPA Bimbingan Konseling",
        footerRight: "November 2026",
        palette: P,
      }),
    },
    { // Seksi 2: daftar isi — angka romawi
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
          alignment: AlignmentType.CENTER, spacing: { before: 480, after: 360 },
          children: [new TextRun({ text: "DAFTAR ISI", bold: true, size: 32, font: FONT_HEAD, color: P.primary })],
        }),
        new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({
          spacing: { before: 200 },
          children: [new TextRun({
            text: "Catatan: Daftar isi dibuat dengan kode field. Setelah dokumen diedit, klik kanan daftar isi lalu pilih \"Update Field\" agar nomor halaman akurat.",
            italics: true, size: 18, color: "888888", font: FONT_BODY,
          })],
        }),
        // Tidak perlu PageBreak: seksi isi sudah otomatis mulai di halaman baru (NEXT_PAGE)
      ],
    },
    { // Seksi 3: isi — angka arab mulai 1
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: P.innerLine, space: 4 } },
            children: [new TextRun({ text: "Dokumentasi Aplikasi Obrolan - UPA BK", size: 18, color: "808080", font: FONT_BODY })],
          })],
        }),
      },
      footers: { default: pageNumFooter() },
      children: bodyChildren,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("/home/z/my-project/download/Dokumentasi_Obrolan_dan_Panduan_Laporan.docx", buf);
  console.log("DOCX tersimpan:", buf.length, "byte");
});
