// Skrip utama: menyusun seluruh dokumen panduan. Jalankan: node scripts/buat_panduan.js
const L = require("./panduan_lib.js");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  PageBreak, Footer, PageNumber, NumberFormat, SectionType, AlignmentType,
  WidthType, BorderStyle, ShadingType, LevelFormat, TableOfContents,
  fs, path, C, LOGO, OUT, PAGENUM, NAVY, BODY, GRAY, NB, allNoBorders, FONT,
  h1, h2, h3, body, bodyRuns, bullet, numbered, callout, spacer, code,
  dataTable, figure,
} = L;

const { APP } = C;

// ============ SAMPUL (mengikuti sampul panduan acuan) ============
function buildCover() {
  const logoBuf = fs.readFileSync(LOGO);
  const mid = "Pengembangan Chatbot Pendamping Percakapan Berbasis";
  const mid2 = "Large Language Model (LLM) Sebagai Media Dukungan Awal";
  const mid3 = "pada UPA BK Universitas Trunojoyo Madura";
  const line = (t, opt = {}) => new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: opt.line ?? 300, lineRule: "atLeast", before: opt.before ?? 0, after: opt.after ?? 0 },
    children: [new TextRun({ text: t, size: opt.size ?? 24, bold: opt.bold ?? false, color: opt.color ?? BODY, font: FONT })],
  });
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: allNoBorders,
      rows: [new TableRow({
        height: { value: 16838, rule: "exact" },
        children: [new TableCell({
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: { left: 900, right: 900 },
          shading: { type: ShadingType.CLEAR, fill: "FFFFFF" },
          children: [
            new Paragraph({ spacing: { before: 1250, line: 240 }, children: [] }),
            new Paragraph({
              alignment: AlignmentType.CENTER, spacing: { after: 240 },
              children: [new ImageRun({ data: logoBuf, transformation: { width: 112, height: 112 }, type: "jpg" })],
            }),
            line("BUKU PANDUAN PENGGUNA", { size: 52, bold: true, color: NAVY, line: 598, after: 200 }),
            line(mid, { size: 24, after: 0 }),
            line(mid2, { size: 24, after: 0 }),
            line(mid3, { size: 24, bold: true, after: 220 }),
            line("Program " + APP.program, { size: 22, after: 420 }),
            line("Disusun oleh", { size: 22, after: 80 }),
            line("IMRO ATUN JAMILAH S.A", { size: 26, bold: true, after: 40 }),
            line("(NIM 230411100123)", { size: 22, after: 300 }),
            line("Dosen Pembimbing", { size: 22, after: 80 }),
            line("IKA OKTAVIA SUZANTI, S.KOM., M.CS.", { size: 26, bold: true, after: 40 }),
            line("(NIDN 0018108803)", { size: 22, after: 900 }),
            line("PROGRAM STUDI TEKNIK INFORMATIKA", { size: 26, bold: true, after: 60 }),
            line("JURUSAN TEKNIK INFORMATIKA - FAKULTAS TEKNIK", { size: 26, bold: true, after: 60 }),
            line("UNIVERSITAS TRUNOJOYO MADURA", { size: 26, bold: true, after: 60 }),
            line("2026", { size: 26, bold: true }),
          ],
        })],
      })],
    }),
  ];
}

// ============ HALAMAN PERNYATAAN ============
function buildPernyataan() {
  return [
    h1("HALAMAN PERNYATAAN"),
    body("Dokumen ini adalah Buku Panduan Pengguna aplikasi Obrolan ETA (Ruang Layanan Konseling UPA BK UTM). Pembaca dan pengguna diminta memperhatikan pernyataan berikut sebelum menggunakan aplikasi maupun hasilnya."),
    body("Keterbatasan yang perlu dipahami:"),
    bullet("Skrining DASS-21 pada aplikasi hanyalah instrumen skrining awal; hasilnya BUKAN diagnosis dan tidak menggantikan penilaian konselor, psikolog, atau psikiater."),
    bullet("Sesuai kebijakan layanan, hasil skrining tidak ditampilkan kepada mahasiswa; hasil hanya ditinjau oleh petugas UPA BK melalui Panel Petugas."),
    bullet("Chatbot berbasis LLM memberikan dukungan awal dan dapat keliru; jawabannya tidak boleh dijadikan dasar keputusan medis maupun psikologis."),
    bullet("Lapisan keselamatan krisis bekerja dengan pencocokan kata kunci (bukan model bahasa); deteksi dapat meleset dua arah. Dalam keadaan mendesak selalu hubungi 112 atau 119 ext. 8."),
    bullet("Data pendaftaran, jawaban skrining, dan percakapan tersimpan pada basis data PostgreSQL (layanan Neon) dan hanya boleh diakses petugas UPA BK untuk kepentingan layanan dan tindak lanjut."),
    bullet("Aplikasi adalah prototipe riset (proof of concept) dan memerlukan persetujuan UPA BK sebelum digunakan sebagai layanan produksi."),
    body("Data penelitian yang menjadi latar aplikasi berasal dari skrining daring 449 responden (11-12 Agustus 2026); sesuai etika penelitian, 15 responden yang tidak bersedia dieksklusi sehingga analisis menggunakan N = 434. Kategori skor mengikuti cut-off publikasi Lovibond & Lovibond (1995)."),
    body("Lisensi: All Rights Reserved - disajikan untuk kepentingan akademik, demonstrasi layanan UPA BK, dan peninjauan penelitian.", { after: 0 }),
  ];
}

// ============ KATA PENGANTAR ============
function buildPengantar() {
  return [
    h1("KATA PENGANTAR"),
    body("Puji syukur penulis panjatkan atas terselesaikannya Buku Panduan Pengguna ini. Buku ini disusun sebagai pedoman penggunaan Obrolan ETA, yaitu Ruang Layanan Konseling UPA BK Universitas Trunojoyo Madura: aplikasi web pendaftaran layanan, skrining DASS-21, dan obrolan pendamping awal berbasis Large Language Model (LLM) untuk mahasiswa."),
    body("Panduan ini ditujukan bagi mahasiswa yang ingin mendaftar layanan dan mencoba skrining serta obrolan, bagi petugas UPA BK yang meninjau hasil dan melakukan tindak lanjut, maupun bagi pihak yang ingin menjalankan aplikasi di komputer sendiri untuk menelaah kode dan data. Aplikasi tidak memerlukan pengguna membuat akun; petugas memakai akun internal yang dikelola UPA BK."),
    body("Terdapat dua cara memakai aplikasi. Pertama, secara online sebagaimana dijelaskan pada BAGIAN 2: cukup membuka tautan " + APP.url + " melalui peramban tanpa menginstal apa pun. Kedua, secara lokal sebagaimana dijelaskan pada BAGIAN 1: aplikasi dijalankan di komputer sendiri dengan Node.js, basis data PostgreSQL (Neon), dan kunci API model bahasa. Kedua cara menampilkan fitur yang sama persis."),
    body("Selanjutnya, BAGIAN 3 menjelaskan cara memakai setiap modul beserta arti status dan label yang tampil. Pembaca diminta memperhatikan bahwa aplikasi ini bukan alat diagnosis; seluruh hasil bersifat skrining awal dan selalu diikuti pendampingan manusia di UPA BK."),
    body("Penulis mengucapkan terima kasih kepada Dosen Pembimbing, Ika Oktavia Suzanti, S.Kom., M.Cs., atas bimbingan selama penelitian berlangsung, serta kepada UPA BK Universitas Trunojoyo Madura atas izin dan arahan pengembangan layanan. Penulis berharap buku panduan ini bermanfaat bagi pengguna dan peninjau, serta terbuka terhadap kritik dan saran."),
    new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 400, after: 40 }, children: [new TextRun({ text: "Penulis,", size: 22, font: FONT, color: BODY })] }),
    new Paragraph({ spacing: { after: 240, line: 240 }, children: [] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0, line: 312 }, children: [new TextRun({ text: "Imro Atun Jamilah S.A", bold: true, size: 22, font: FONT, color: BODY })] }),
    new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0, line: 312 }, children: [new TextRun({ text: "NIM 230411100123", size: 22, font: FONT, color: BODY })] }),
  ];
}

// ============ DAFTAR ISI / GAMBAR / TABEL ============
function buildFrontMatter() {
  // dengan nomor halaman (pass 2) jika tersedia
  const figList = L.FIG_INDEX.map((t) => {
    const num = t.slice(0, t.indexOf("."));
    const rest = t.slice(t.indexOf(".") + 1).trim();
    const pg = PAGENUM.fig && PAGENUM.fig[num];
    const txt = "Gambar " + num + ". " + rest + (pg ? " .......... " + pg : "");
    return new Paragraph({ spacing: { line: 312, after: 60 }, children: [new TextRun({ text: txt, size: 22, color: BODY, font: FONT })] });
  });
  const tblList = L.TBL_INDEX.map((t) => {
    const num = t.slice(0, t.indexOf("."));
    const rest = t.slice(t.indexOf(".") + 1).trim();
    const pg = PAGENUM.tbl && PAGENUM.tbl[num];
    const txt = "Tabel " + num + ". " + rest + (pg ? " .......... " + pg : "");
    return new Paragraph({ spacing: { line: 312, after: 60 }, children: [new TextRun({ text: txt, size: 22, color: BODY, font: FONT })] });
  });
  return [
    // Judul DAFTAR ISI: TANPA HeadingLevel agar TOC tidak mengindeks dirinya sendiri
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 360, after: 200, line: 380, lineRule: "atLeast" },
      children: [new TextRun({ text: "DAFTAR ISI", bold: true, size: 30, color: NAVY, font: FONT })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 120, after: 200 },
      children: [new TextRun({ text: " ", size: 8, font: FONT })],
    }),
    new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-3" }),
    new Paragraph({
      spacing: { before: 200 },
      children: [new TextRun({
        text: "Catatan: Daftar isi dibuat dengan kode field. Setelah dokumen diedit, klik kanan daftar isi lalu pilih Update Field agar nomor halaman akurat.",
        italics: true, size: 18, color: "888888", font: FONT,
      })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
    h1("DAFTAR GAMBAR"),
    ...figList,
    h1("DAFTAR TABEL"),
    ...tblList,
  ];
}

// ============ BAGIAN 0 ============
function bagian0() {
  return [
    h1("BAGIAN 0 - SEBELUM MULAI"),
    h2("Identitas Aplikasi dan Dokumen"),
    body("Versi dokumen: " + APP.versi + "   |   Terakhir diperbarui: " + APP.tanggal),
    ...dataTable(
      "Identitas aplikasi dan dokumen",
      ["Item", "Keterangan"],
      [
        ["Nama Aplikasi", APP.nama],
        ["Judul Penelitian", APP.judul],
        ["Peneliti", APP.peneliti],
        ["Dosen Pembimbing", APP.pembimbing],
        ["Program", APP.program],
        ["Akses Online", APP.url],
        ["Teknologi", "Next.js (web), PostgreSQL via Neon (data), model GLM via API (obrolan)"],
        ["Ukuran kode", "Sekitar 120 file kode (ZIP tanpa data, sekitar 0,3 MB)"],
        ["Butuh instalasi?", "Tidak untuk versi online; hanya untuk mode lokal (pengembang)"],
        ["Akun?", "Mahasiswa tanpa akun; petugas memakai akun internal UPA BK"],
      ],
      [28, 72]
    ),
    h2("0.1 Panduan ini untuk siapa?"),
    body("Panduan ini dipakai oleh siapa saja yang ingin mencoba atau mengelola aplikasi, dengan tiga pilihan:"),
    ...dataTable(
      "Pilihan cara memakai aplikasi menurut peran pengguna",
      ["Siapa", "Kebutuhan", "Baca"],
      [
        ["Mahasiswa", "Mendaftar layanan, skrining, dan obrolan lewat browser", "BAGIAN 2, lalu 3.1 - 3.4"],
        ["Petugas/admin UPA BK", "Meninjau hasil skrining, membaca percakapan, menindaklanjuti", "BAGIAN 2, lalu 3.5 - 3.6"],
        ["Peneliti/pengembang", "Menjalankan aplikasi di komputer sendiri, menelaah kode", "BAGIAN 1, lalu BAGIAN 3"],
      ],
      [22, 48, 30]
    ),
    body("Versi online dan versi lokal menampilkan fitur yang sama; data tersimpan pada basis data yang sama bila .env lokal diarahkan ke basis data yang sama."),
    h2("0.2 Peringatan penting"),
    callout("PERINGATAN", "Aplikasi adalah prototipe riset (proof of concept), BUKAN alat diagnosis. Hasil skrining DASS-21 bersifat indikatif dan tidak boleh dijadikan dasar keputusan medis maupun psikologis. Selalu lanjutkan dengan pendampingan tenaga profesional di UPA BK.", "warn"),
    spacer(80),
    callout("PERINGATAN", "Dalam kondisi darurat atau potensi krisis, jangan menunggu aplikasi: hubungi 112 (darurat nasional, 24 jam) atau 119 ext. 8 (layanan Sejiwa, Kementerian Kesehatan), datang ke UPA BK UTM, atau ceritakan kepada orang yang Anda percaya.", "warn"),
    spacer(80),
    h2("0.3 Ringkasan waktu"),
    ...dataTable(
      "Ringkasan waktu penggunaan secara online dan lokal",
      ["Tahap", "Online (peramban)", "Lokal (mode pengembang)"],
      [
        ["Mendapatkan akses/file", "Beberapa detik (buka tautan)", "2 - 5 menit (unduh ZIP / clone)"],
        ["Instal Node.js", "-", "5 - 10 menit (sekali saja)"],
        ["npm install + persiapan basis data", "-", "3 - 8 menit (sekali saja)"],
        ["Mendaftar layanan", "3 - 5 menit", "3 - 5 menit"],
        ["Skrining DASS-21 (21 item)", "5 - 7 menit", "5 - 7 menit"],
        ["Memulai obrolan", "Secepat 10 - 30 detik", "Secepat 10 - 30 detik"],
        ["Total pertama kali", "Sekitar 10 menit", "Sekitar 25 menit"],
        ["Total berikutnya", "Langsung pakai", "± 30 detik (npm run dev)"],
      ],
      [30, 32, 38]
    ),
  ];
}

module.exports = { buildCover, buildPernyataan, buildPengantar, buildFrontMatter, bagian0 };
