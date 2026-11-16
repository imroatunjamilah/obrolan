/**
 * Generator Laporan Kerja Praktik (docx) — mengikuti format referensi
 * "Laporan KP Zuzu.docx" (A5 8391x11906, TNR 12pt, spasi 1,5, footer bawah
 * tengah, roman untuk bagian awal + arabic untuk isi).
 * Pemakaian: node scripts/generate_laporan_kp.js [halamanDaftarJSON]
 *   halamanDaftarJSON = file JSON { gambar: {...}, tabel: {...}, lampiran: n }
 *   untuk nomor halaman statis Daftar Gambar/Tabel/Lampiran (pass kedua).
 */
const docx = require("docx");
const fs = require("fs");
const path = require("path");
const K1 = require("./laporan_konten.js");
const K2 = require("./laporan_konten2.js");

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  PageBreak, Footer, AlignmentType, HeadingLevel, WidthType, BorderStyle,
  ShadingType, TabStopType, LeaderType, NumberFormat, SectionType,
  TableOfContents, VerticalAlign,
} = docx;

// ------------------------------------------------------------------ konstanta
const HAL = { width: 8391, height: 11906 }; // A5
const MARGIN = { top: 1701, right: 1418, bottom: 1418, left: 1701, header: 720, footer: 720 };
const USABLE = HAL.width - MARGIN.left - MARGIN.right; // 5272 twips
const FONT = "Times New Roman";
const BODY_START = process.env.BODY_START ? parseInt(process.env.BODY_START, 10) : 11;
const DIR_GAMBAR = path.join(__dirname, "..", "download", "gambar-laporan");

// Nomor halaman statis (pass kedua); default 0 yang akan dipatch dari PDF.
let HALAMAN = { gambar: {}, tabel: {}, lampiran: 0 };
if (process.argv[2] && fs.existsSync(process.argv[2])) {
  HALAMAN = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
}

// ------------------------------------------------------------------ helpers
const R = (text, opts = {}) => new TextRun({ text, font: FONT, size: 24, color: "000000", ...opts });

function body(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 709 },
    spacing: { line: 360, after: 120 },
    children: [R(text, opts)],
  });
}
function bodyLeftIndent(text, left = 567) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { left },
    spacing: { line: 360, after: 120 },
    children: [R(text)],
  });
}
function heading1(lines) {
  const children = [R(lines[0], { bold: true, size: 28 })];
  for (let i = 1; i < lines.length; i++) {
    children.push(new TextRun({ text: ` ${lines[i]}`, font: FONT, size: 28, bold: true, color: "000000", break: 1 }));
  }
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 240, line: 360 },
    children,
  });
}
function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 100, line: 360 },
    children: [R(text, { bold: true })],
  });
}
function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    alignment: AlignmentType.LEFT,
    spacing: { before: 200, after: 100, line: 360 },
    children: [R(text, { bold: true })],
  });
}
function judulKaps(baris, opts = {}) {
  const children = [R(baris[0], { bold: true, size: 28 })];
  for (let i = 1; i < baris.length; i++) {
    children.push(new TextRun({ text: baris[i], font: FONT, size: 28, bold: true, color: "000000", break: 1 }));
  }
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: opts.after != null ? opts.after : 240, line: opts.line || 360 },
    children,
  });
}
function tengahRapat(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: 290, after: 30 },
    children: [R(text, opts)],
  });
}
function h1Awal(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 40, line: 320 },
    children: [R(text, { bold: true, size: 28 })],
  });
}
function tengah(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: 360, after: 60 },
    children: [R(text, opts)],
  });
}
function listItem(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 680, hanging: 397 },
    spacing: { line: 360, after: 80 },
    children: Array.isArray(text) ? text.map((t, i) => R(t, i === 0 && opts.boldPertama ? { bold: true } : {})) : [R(text)],
  });
}
function pasangan(kepala, isi) {
  return listItem([kepala, isi], { boldPertama: true });
}
function tahapItem(no, judul, isi) {
  return [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      indent: { left: 680, hanging: 397 },
      spacing: { line: 360, after: 80, before: 120 },
      children: [R(`${no}. `, { bold: true }), R(judul, { bold: true })],
    }),
    bodyLeftIndent(isi),
  ];
}
function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 200, line: 280 },
    children: [R(text, { bold: true, size: 18 })],
  });
}
function captionTabel(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    keepNext: true,
    spacing: { before: 160, after: 80, line: 280 },
    children: [R(text, { bold: true, size: 18 })],
  });
}
function entriDaftar(label, judul, hal) {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: USABLE, leader: LeaderType.DOT }],
    spacing: { line: 360, after: 40 },
    children: [R(`${label} ${judul}`), R("\t"), R(String(hal))],
  });
}
function gambar(file, lebarPx, labelGambar, halKey) {
  const p = path.join(DIR_GAMBAR, file);
  const data = fs.readFileSync(p);
  const tinggi = Math.round(lebarPx * (900 / 1440));
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      keepNext: true,
      spacing: { before: 160 },
      children: [new ImageRun({ data, transformation: { width: lebarPx, height: tinggi }, type: "png" })],
    }),
    caption(`Gambar ${halKey}. ${labelGambar}`),
  ];
}
const BORDER = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const GRID = { top: BORDER, bottom: BORDER, left: BORDER, right: BORDER, insideHorizontal: BORDER, insideVertical: BORDER };
function sel(text, opts = {}) {
  return new TableCell({
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      spacing: { line: 280 },
      children: [R(text, { size: 20, bold: !!opts.bold })],
    })],
    width: { size: opts.width, type: WidthType.PERCENTAGE },
    margins: { top: 50, bottom: 50, left: 60, right: 60 },
    verticalAlign: VerticalAlign.CENTER,
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
  });
}
function tabelData(t) {
  const header = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: t.header.map((h, i) => sel(h, { bold: true, align: AlignmentType.CENTER, width: t.lebar[i], fill: "F2F2F2" })),
  });
  const rows = t.baris.map((b, ri) => new TableRow({
    cantSplit: true,
    children: b.map((c, i) => sel(c, {
      width: t.lebar[i],
      align: i === 0 ? AlignmentType.LEFT : (String(c).length <= 6 && t.lebar[i] <= 22 ? AlignmentType.CENTER : AlignmentType.LEFT),
      bold: ri === t.baris.length - 1 && /^Total/i.test(String(b[0])),
    })),
  }));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: GRID, rows: [header, ...rows] });
}
function pageBreak() { return new Paragraph({ spacing: { line: 240, after: 0 }, children: [new PageBreak()] }); }
function footerNomor(ukuran) {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumberField()], font: FONT, size: ukuran, color: "000000" })],
    })],
  });
}
function PageNumberField() { return docx.PageNumber.CURRENT; }

// Tanda tangan pengesahan --------------------------------------------------
function selTtd(lines, width) {
  const paras = [];
  for (const l of lines) {
    if (l === "") {
      paras.push(new Paragraph({ spacing: { line: 270 }, children: [] }));
      continue;
    }
    paras.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { line: 270 },
      children: [R(l.teks, { bold: !!l.bold, underline: !!l.underline, size: 24 })],
    }));
  }
  return new TableCell({
    children: paras,
    width: { size: width, type: WidthType.PERCENTAGE },
    margins: { top: 20, bottom: 20, left: 100, right: 100 },
    verticalAlign: VerticalAlign.TOP,
  });
}
function tabelTtdDua(kiri, kanan) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: GRID,
    rows: [new TableRow({ cantSplit: true, children: [selTtd(kiri, 50), selTtd(kanan, 50)] })],
  });
}
function tabelTtdSatu(kolom) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: GRID,
    rows: [new TableRow({ cantSplit: true, children: [selTtd(kolom, 100)] })],
  });
}

// Tabel CV lampiran ---------------------------------------------------------
function tabelCV() {
  const cv = K2.LAMPIRAN.cv;
  const barisJudul = (t) => new TableRow({
    cantSplit: true,
    children: [new TableCell({
      children: [new Paragraph({ spacing: { line: 280 }, children: [R(t, { bold: true, size: 20 })] })],
      width: { size: 100, type: WidthType.PERCENTAGE },
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
      shading: { type: ShadingType.CLEAR, fill: "F2F2F2" },
    })],
  });
  const barisDua = (a, b, w) => new TableRow({
    cantSplit: true,
    children: [
      new TableCell({ children: selPara(a), width: { size: w[0], type: WidthType.PERCENTAGE }, margins: { top: 60, bottom: 60, left: 100, right: 100 } }),
      new TableCell({ children: selPara(b), width: { size: w[1], type: WidthType.PERCENTAGE }, margins: { top: 60, bottom: 60, left: 100, right: 100 } }),
    ],
  });
  const selPara = (teks) => {
    if (Array.isArray(teks)) {
      return teks.map((t) => new Paragraph({ spacing: { line: 280 }, children: [R(t, { size: 20 })] }));
    }
    return [new Paragraph({ spacing: { line: 280 }, children: [R(String(teks), { size: 20 })] })];
  };
  const rows = [];
  rows.push(barisJudul(cv.pribadiJudul));
  for (const [k, v] of cv.pribadi) rows.push(barisDua(k, v, [35, 65]));
  rows.push(barisJudul(cv.pendidikanJudul));
  rows.push(new TableRow({
    cantSplit: true,
    children: cv.pendidikanHeader.map((h, i) => sel(h, { bold: true, width: i === 0 ? 30 : i === 1 ? 45 : 25, align: AlignmentType.CENTER })),
  }));  for (const [j, ins, p] of cv.pendidikan) rows.push(barisDua(j, `${ins} (${p})`, [30, 70]));
  rows.push(barisJudul(cv.keahlianJudul));
  rows.push(barisDua("", cv.keahlian.map((k) => `\u2022 ${k}`), [2, 98]));
  rows.push(barisJudul(cv.organisasiJudul));
  for (const [o, p] of cv.organisasi) rows.push(barisDua(o, p, [70, 30]));
  return new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, borders: GRID, rows });
}

// ------------------------------------------------------------------ isi BAB
function babSatu() {
  const B = K1.BAB1;
  const out = [heading1(["BAB I", ...B.judul])];
  out.push(heading2("1.1 Latar Belakang"));
  B.latar.forEach((p) => out.push(body(p)));
  out.push(heading2("1.2 Rumusan Masalah"));
  out.push(body(B.rumusanIntro));
  B.rumusan.forEach((t, i) => out.push(listItem(`${i + 1}. ${t}`)));
  out.push(heading2("1.3 Tujuan"));
  out.push(body(B.tujuanIntro));
  B.tujuan.forEach((t, i) => out.push(listItem(`${i + 1}. ${t}`)));
  out.push(heading2("1.4 Manfaat"));
  out.push(body(B.manfaatIntro));
  B.manfaat.forEach(([k, v], i) => out.push(listItem([`${i + 1}. `, k, v])));
  out.push(heading2("1.5 Batasan Masalah"));
  out.push(body(B.batasanIntro));
  B.batasan.forEach((t, i) => out.push(listItem(`${i + 1}. ${t}`)));
  out.push(heading2("1.6 Sistematika Penulisan"));
  out.push(body("Laporan Kerja Praktik ini disusun dalam enam bab dengan sistematika sebagai berikut:"));
  B.sistematika.forEach(([k, v]) => out.push(pasangan(`\u2013 ${k}`, v)));
  return out;
}

function babDua() {
  const B = K1.BAB2;
  const out = [heading1(["BAB II", ...B.judul])];
  out.push(heading2("2.1 Profil Instansi"));
  B.profil1.forEach((p) => out.push(body(p)));
  out.push(heading2("2.2 Job Description Mahasiswa selama KP"));
  out.push(body(B.jdIntro));
  B.jd.forEach(([j, t], i) => out.push(...tahapItem(i + 1, j, t)));
  out.push(body(B.jdClosing));
  return out;
}

function babTiga() {
  const B = K1.BAB3;
  const out = [heading1(["BAB III", ...B.judul])];
  B.bagian.forEach(([judul, paras]) => {
    const nomor = judul.match(/^(\d+)\.\s*/);
    out.push(heading2(nomor ? `3.${nomor[1]} ${judul.replace(nomor[0], "")}` : judul));
    paras.forEach((p) => out.push(body(p)));
  });
  return out;
}

function babEmpat() {
  const B = K2.BAB4;
  const out = [heading1(["BAB IV", ...B.judul])];
  B.intro.forEach((p) => out.push(body(p)));
  out.push(heading2("4.1 Tahapan Kegiatan"));
  out.push(body(B.tahapanIntro));
  B.tahapan.forEach(([j, t], i) => out.push(...tahapItem(i + 1, j, t)));
  out.push(heading2("4.2 Jadwal Kegiatan"));
  out.push(body(B.jadwalIntro));
  out.push(captionTabel(B.jadwalTabel.judul));
  out.push(tabelData(B.jadwalTabel));
  return out;
}

function babLima() {
  const B = K2.BAB5;
  const out = [heading1(["BAB V", ...B.judul])];
  out.push(heading2("5.1 Hasil"));
  out.push(body(B.hasilIntro));
  // 5.1.1 - 5.1.6
  const noSub = ["5.1.1", "5.1.2", "5.1.3", "5.1.4", "5.1.5", "5.1.6"];
  B.hasil.forEach(([judul, paras, file, label], i) => {
    out.push(heading3(`${noSub[i]} ${judul.replace(/^\d+\.\s*/, "")}`));
    paras.forEach((p) => out.push(body(p)));
    if (i === 3) { // Hasil Penjadwalan Greedy
      out.push(captionTabel(B.tabel51.judul));
      out.push(tabelData(B.tabel51));
      out.push(captionTabel(B.tabel52.judul));
      out.push(tabelData(B.tabel52));
    }
    if (i === 4) { // Halaman Evaluasi Metode
      out.push(captionTabel(B.tabel53.judul));
      out.push(tabelData(B.tabel53));
    }
    if (i === 5) { // Perbandingan Model
      out.push(captionTabel(B.tabel54.judul));
      out.push(tabelData(B.tabel54));
      out.push(captionTabel(B.tabel55.judul));
      out.push(tabelData(B.tabel55));
    }
    const nomorGambar = i + 1;
    out.push(...gambar(file, 340, label, `5.${nomorGambar}`));
  });
  out.push(heading2("5.2 Pembahasan"));
  B.pembahasan.forEach(([judul, paras], i) => {
    out.push(heading3(`5.2.${i + 1} ${judul.replace(/^\d+\.\s*/, "")}`));
    paras.forEach((p) => out.push(body(p)));
  });
  return out;
}

function babEnam() {
  const B = K2.BAB6;
  const out = [heading1(["BAB VI", ...B.judul])];
  out.push(heading2("6.1 Kesimpulan"));
  B.kesimpulan.forEach((p) => out.push(body(p)));
  out.push(heading2("6.2 Saran"));
  out.push(body(B.saranIntro));
  B.saran.forEach((t, i) => out.push(listItem(`${i + 1}. ${t}`)));
  return out;
}

function daftarPustaka() {
  const out = [heading1(["DAFTAR PUSTAKA"])];
  K2.PUSTAKA.forEach((p) => out.push(new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 567, hanging: 567 },
    spacing: { line: 360, after: 120 },
    children: [R(p)],
  })));
  return out;
}

function lampiran() {
  const out = [heading1(["LAMPIRAN"])];
  out.push(new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 360, after: 160 },
    children: [R(K2.LAMPIRAN.cvJudul, { bold: true })],
  }));
  out.push(tabelCV());
  return out;
}

// --------------------------------------------------------------- bagian awal
function bagianAwal() {
  const NAMA = "Imro Atun Jamilah S.A";
  const NIM = "230411100123";
  const PEMBIMBING = "Ika Oktavia Suzanti, S.Kom., M.Cs.";
  const NIDN = "NIDN 0018108803";
  const TANGGAL = "16 November 2026";
  const out = [];

  // Halaman ii: Halaman judul + Lembar Pengesahan
  out.push(judulKaps(K1.JUDUL_KAPS_BARIS, { after: 40, line: 320 }));
  out.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
  out.push(h1Awal("LEMBAR PENGESAHAN"));
  out.push(tengahRapat("UNIVERSITAS TRUNOJOYO MADURA", { size: 22 }));
  out.push(tengahRapat("Oleh:"));
  out.push(tengahRapat(NAMA));
  out.push(tengahRapat(NIM));
  out.push(tengahRapat(`Tanggal: ${TANGGAL}`));
  out.push(tengahRapat("Disetujui Oleh:"));
  out.push(tabelTtdDua(
    [
      { teks: "Koordinator KP" },
      "",
      { teks: "Dwi Kuswanto, S.Pd., M.T.", bold: true, underline: true },
      { teks: "NIP. 197402212008011006" },
    ],
    [
      { teks: "Dosen Pembimbing KP" },
      "",
      { teks: PEMBIMBING, bold: true, underline: true },
      { teks: NIDN },
    ],
  ));
  out.push(tengahRapat("Ketua Jurusan"));
  out.push(tabelTtdSatu([
    { teks: "Husni, S.Kom., M.T.", bold: true, underline: true },
    { teks: "NIP. 197907222003121006" },
  ]));
  out.push(pageBreak());

  // Halaman iii: Lembar Pengesahan Perusahaan/Instansi
  out.push(judulKaps(K1.JUDUL_KAPS_BARIS, { after: 40, line: 320 }));
  out.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
  out.push(h1Awal("LEMBAR PENGESAHAN PERUSAHAAN"));
  out.push(tengahRapat("UNIVERSITAS TRUNOJOYO MADURA", { size: 22 }));
  out.push(tengahRapat("Disusun oleh:"));
  out.push(tengahRapat(NAMA));
  out.push(tengahRapat(NIM));
  out.push(tengahRapat(`Tanggal Ujian: ${TANGGAL}`));
  out.push(tengahRapat("Disetujui oleh:"));
  out.push(tabelTtdDua(
    [
      { teks: "UPA Bimbingan dan Konseling" },
      "",
      { teks: "Hera Wahyuni", bold: true, underline: true },
      { teks: "Kepala UPA Bimbingan dan Konseling" },
    ],
    [
      { teks: "Pembimbing KP" },
      "",
      { teks: PEMBIMBING, bold: true, underline: true },
      { teks: NIDN },
    ],
  ));
  out.push(pageBreak());

  // Halaman iv: Abstrak
  out.push(h1Awal("ABSTRAK"));
  out.push(new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 300, after: 100 },
    children: [R(K1.ABSTRAK)],
  }));
  out.push(new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 300, after: 0 },
    children: [R(K1.KATA_KUNCI, { italics: true }), new PageBreak()],
  }));

  // Halaman v: Kata Pengantar
  const kpBody = (teks) => new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 709 },
    spacing: { line: 320, after: 100 },
    children: [R(teks)],
  });
  out.push(h1Awal("KATA PENGANTAR"));
  out.push(kpBody(K1.KATA_PENGANTAR_1));
  out.push(kpBody(K1.KATA_PENGANTAR_2));
  out.push(new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { before: 20, line: 320 },
    children: [R(`Bangkalan, ${TANGGAL}`)],
  }));
  out.push(new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { before: 60, line: 320 },
    children: [R(NAMA), new PageBreak()],
  }));

  // Daftar Isi (judul TIDAK memakai Heading agar tidak mengindeks dirinya)
  out.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 240, line: 360 },
    children: [R("DAFTAR ISI", { bold: true, size: 28 })],
  }));
  out.push(new TableOfContents("Daftar Isi", { hyperlink: true, headingStyleRange: "1-3" }));
  out.push(new Paragraph({
    spacing: { before: 200 },
    children: [new TextRun({
      text: "Catatan: Daftar isi ini dibuat dengan kode field. Setelah dokumen diubah, klik kanan pada daftar isi lalu pilih Update Field agar nomor halaman terbaru.",
      font: FONT, italics: true, size: 18, color: "888888",
    })],
  }));
  out.push(pageBreak());

  // Daftar Gambar
  out.push(heading1(["DAFTAR GAMBAR"]));
  const glist = [
    ["Gambar 5.1", "Halaman pengajuan konseling"],
    ["Gambar 5.2", "Hasil klasifikasi urgensi dan usulan jadwal (Greedy)"],
    ["Gambar 5.3", "Halaman panel petugas (daftar permintaan dan aksi)"],
    ["Gambar 5.4", "Panel petugas pada bagian riwayat penugasan jadwal"],
    ["Gambar 5.5", "Halaman evaluasi metode (pipeline dan dataset)"],
    ["Gambar 5.6", "Halaman evaluasi metode (perbandingan model dan matriks kebingungan)"],
  ];
  glist.forEach(([l, j]) => out.push(entriDaftar(l, j, HALAMAN.gambar[l.split(" ")[1]] || 0)));
  out.push(pageBreak());

  // Daftar Tabel
  out.push(heading1(["DAFTAR TABEL"]));
  const tlist = [
    ["Tabel 4.1", "Jadwal Kegiatan"],
    ["Tabel 5.1", "Metrik Penjadwalan Greedy pada Simulasi 14 Permintaan"],
    ["Tabel 5.2", "Distribusi Beban Konselor pada Hasil Penjadwalan"],
    ["Tabel 5.3", "Komposisi Dataset Keluhan Sintetis"],
    ["Tabel 5.4", "Hasil Evaluasi Ketiga Model pada Data Uji (30 Data)"],
    ["Tabel 5.5", "Matriks Kebingungan Logistic Regression pada Data Uji"],
  ];
  tlist.forEach(([l, j]) => out.push(entriDaftar(l, j, HALAMAN.tabel[l.split(" ")[1]] || 0)));
  out.push(pageBreak());

  // Daftar Lampiran
  out.push(heading1(["DAFTAR LAMPIRAN"]));
  out.push(entriDaftar("Lampiran 1.", "Curriculum Vitae Penulis.", HALAMAN.lampiran || 0));
  return out;
}

// ------------------------------------------------------------------ cover
function cover() {
  const out = [];
  const t = (text, opts = {}) => new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { line: 320, after: 30 },
    children: [R(text, opts)],
  });
  out.push(t("LAPORAN KERJA PRAKTIK", { bold: true, size: 28 }));
  out.push(judulKaps(K1.JUDUL_BARIS, { after: 40, line: 320 }));
  out.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 40, after: 40 },
    children: [new ImageRun({
      data: fs.readFileSync(path.join(DIR_GAMBAR, "logo_upa_bk.jpg")),
      transformation: { width: 120, height: 120 },
      type: "jpg",
    })],
  }));
  out.push(t("Disusun Oleh:"));
  out.push(t("Imro Atun Jamilah S.A"));
  out.push(t("230411100123"));
  out.push(t("Dosen Pembimbing:"));
  out.push(t("Ika Oktavia Suzanti, S.Kom., M.Cs."));
  out.push(t("NIDN 0018108803"));
  out.push(new Paragraph({ spacing: { after: 60 }, children: [] }));
  out.push(t("PROGRAM STUDI TEKNIK INFORMATIKA", { bold: true }));
  out.push(t("FAKULTAS TEKNIK", { bold: true }));
  out.push(t("UNIVERSITAS TRUNODJOYO MADURA", { bold: true }));
  out.push(t("2026", { bold: true }));
  return out;
}

// ------------------------------------------------------------------ dokumen
const doc = new Document({
  creator: "Imro Atun Jamilah S.A",
  title: K1.JUDUL,
  styles: {
    default: {
      document: {
        run: { font: { ascii: FONT, eastAsia: FONT, hAnsi: FONT }, size: 24, color: "000000" },
        paragraph: { spacing: { line: 360 } },
      },
      heading1: {
        run: { font: { ascii: FONT, eastAsia: FONT, hAnsi: FONT }, size: 28, bold: true, color: "000000" },
        paragraph: { spacing: { before: 240, after: 240, line: 360 }, outlineLevel: 0 },
      },
      heading2: {
        run: { font: { ascii: FONT, eastAsia: FONT, hAnsi: FONT }, size: 24, bold: true, color: "000000" },
        paragraph: { spacing: { before: 240, after: 100, line: 360 }, outlineLevel: 1 },
      },
      heading3: {
        run: { font: { ascii: FONT, eastAsia: FONT, hAnsi: FONT }, size: 24, bold: true, color: "000000" },
        paragraph: { spacing: { before: 200, after: 100, line: 360 }, outlineLevel: 2 },
      },
    },
  },
  features: { updateFields: true },
  sections: [
    { // S1: cover — tanpa footer, roman i (tersembunyi)
      properties: {
        page: { size: HAL, margin: MARGIN, pageNumbers: { start: 1, formatType: NumberFormat.LOWER_ROMAN } },
      },
      children: cover(),
    },
    { // S2: bagian awal — roman lanjutan (ii, iii, ...)
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: HAL, margin: MARGIN, pageNumbers: { formatType: NumberFormat.LOWER_ROMAN } },
      },
      footers: { default: footerNomor(20) },
      children: bagianAwal(),
    },
    { // S3: isi — arabic mulai BODY_START
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: HAL, margin: MARGIN, pageNumbers: { start: BODY_START, formatType: NumberFormat.DECIMAL } },
      },
      footers: { default: footerNomor(24) },
      children: [
        ...babSatu(),
        ...babDua(),
        ...babTiga(),
        ...babEmpat(),
        ...babLima(),
        ...babEnam(),
        ...daftarPustaka(),
        ...lampiran(),
      ],
    },
  ],
});

const OUT = process.env.OUT || path.join(__dirname, "..", "download", "Laporan KP - Penjadwalan Konseling UPA BK.docx");
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("OK ->", OUT, `(${(buf.length / 1024).toFixed(0)} KB)`);
});
