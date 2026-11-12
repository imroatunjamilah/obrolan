// Dump daftar caption Gambar/Tabel ke JSON (untuk ekstraksi nomor halaman)
const L = require("./panduan_lib.js");
require("./panduan_bagian1.js");
require("./panduan_bagian2.js");
require("./panduan_bagian3.js");
// builder belum dijalankan: jalankan manual untuk mengisi counter
const { bagian0 } = require("./panduan_bagian1.js");
const { bagian1, bagian2 } = require("./panduan_bagian2.js");
const { bagian3, lampiran } = require("./panduan_bagian3.js");
bagian0(); bagian1(); bagian2(); bagian3(); lampiran();
const fs = require("fs");
fs.writeFileSync(
  "/home/z/my-project/data_out/panduan_captions.json",
  JSON.stringify({ fig: L.FIG_INDEX, tbl: L.TBL_INDEX }, null, 2)
);
console.log("captions dumped:", L.FIG_INDEX.length, "fig,", L.TBL_INDEX.length, "tbl");
