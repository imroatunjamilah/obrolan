// Perakitan akhir: node scripts/buat_panduan.js
const L = require("./panduan_lib.js");
const { buildCover, buildPernyataan, buildPengantar, buildFrontMatter, bagian0 } = require("./panduan_bagian1.js");
const { bagian1, bagian2 } = require("./panduan_bagian2.js");
const { bagian3, lampiran } = require("./panduan_bagian3.js");
const {
  Document, Packer, Paragraph, TextRun, Footer, PageNumber, NumberFormat,
  SectionType, AlignmentType, LevelFormat, PageBreak, fs, OUT, FONT, GRAY,
} = L;

// Susun isi terlebih dahulu agar penghitung Gambar/Tabel terisi
const bodyChildren = [
  ...bagian0(),
  ...bagian1(),
  ...bagian2(),
  ...bagian3(),
  ...lampiran(),
];
const frontChildren = buildFrontMatter();

const numberingRefs = ["step-a", "step-b", "step-node", "step-reg", "step-dass", "step-chat", "step-admin"].map((ref) => ({
  reference: ref,
  levels: [{
    level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 480, hanging: 360 } } },
  }],
}));

function pageFooter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: GRAY, font: FONT })],
    })],
  });
}

const pgSize = { width: 11906, height: 16838 };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

const doc = new Document({
  numbering: { config: numberingRefs },
  styles: {
    default: {
      document: {
        run: { font: FONT, size: 22, color: "1A1A1A" },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: FONT, size: 30, bold: true, color: "1F3864" },
        paragraph: { spacing: { before: 360, after: 200, line: 380 } },
      },
      heading2: {
        run: { font: FONT, size: 26, bold: true, color: "1F3864" },
        paragraph: { spacing: { before: 280, after: 140, line: 340 } },
      },
      heading3: {
        run: { font: FONT, size: 23, bold: true, color: "2E5395" },
        paragraph: { spacing: { before: 220, after: 110, line: 312 } },
      },
    },
  },
  sections: [
    // Bagian 1: Sampul - tanpa nomor halaman, tanpa footer
    {
      properties: { page: { size: pgSize, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
      children: buildCover(),
    },
    // Bagian 2: Front matter - romawi (ii, iii, ...)
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 2, formatType: NumberFormat.UPPER_ROMAN } },
      },
      footers: { default: pageFooter() },
      children: [
        ...buildPernyataan(),
        new Paragraph({ children: [new PageBreak()] }),
        ...buildPengantar(),
        new Paragraph({ children: [new PageBreak()] }),
        ...frontChildren,
      ],
    },
    // Bagian 3: Isi utama - arab mulai 1
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } },
      },
      footers: { default: pageFooter() },
      children: bodyChildren,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log("OK ->", OUT, (buf.length / 1024 / 1024).toFixed(2) + " MB");
  console.log("gambar:", L.FIG_INDEX.length, "| tabel:", L.TBL_INDEX.length);
});
