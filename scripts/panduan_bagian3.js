// BAGIAN 3 (cara memakai) + LAMPIRAN A-F + Catatan Akhir
const L = require("./panduan_lib.js");
const C = require("./panduan_konten.js");
const { h1, h2, h3, body, bullet, numbered, callout, spacer, code, dataTable, figure, Paragraph, TextRun, FONT } = L;

function bagian3() {
  return [
    h1("BAGIAN 3 - CARA MEMAKAI APLIKASI"),
    body("Bagian ini wajib dibaca - nama modul, status, dan label di layar punya arti spesifik. Semua contoh gambar diambil langsung dari aplikasi."),
    h2("3.1 Beranda dan Menu Layanan"),
    body("Setelah aplikasi dibuka, layar utama menampilkan Ruang Obrolan Konseling dengan empat modul pada menu di sisi kiri. Pada layar HP, menu dibuka lewat ikon menu di kiri atas."),
    ...dataTable(
      "Empat modul pada menu layanan",
      ["Modul", "Fungsi", "Siapa yang memakai"],
      [
        ["Ruang Obrolan Konseling", "Bercakap dengan chatbot dukungan awal (LLM)", "Mahasiswa"],
        ["Skrining DASS-21", "Mengisi 21 pernyataan skrining kesehatan mental", "Mahasiswa (setelah mendaftar)"],
        ["Pendaftaran Layanan", "Mengisi identitas dan kebutuhan layanan konseling", "Mahasiswa"],
        ["Panel Petugas", "Login petugas; statistik, data, dan tindak lanjut", "Petugas/admin UPA BK"],
      ],
      [30, 42, 28]
    ),
    body("Bilah bawah aplikasi selalu menampilkan pengingat: aplikasi ini prototipe riset, bukan pengganti konseling profesional, beserta nomor darurat 112 dan 119 ext. 8."),
    ...figure("01-konseling-awal.png", "Tampilan awal Ruang Obrolan Konseling (beranda)"),
    h2("3.2 Pendaftaran Layanan"),
    body("Pendaftaran adalah pintu masuk seluruh layanan. Tanpa mendaftar, skrining DASS-21 tidak dapat dibuka. Langkahnya:"),
    numbered("step-reg", "Klik menu Pendaftaran Layanan."),
    numbered("step-reg", "Isi formulir sesuai Tabel 16; kolom bertanda wajib tidak boleh kosong."),
    numbered("step-reg", "Beri centang persetujuan penggunaan data."),
    numbered("step-reg", "Klik tombol kirim; halaman Pendaftaran Berhasil akan muncul beserta tombol lanjutan ke skrining atau konseling."),
    ...dataTable(
      "Isian Formulir Pendaftaran Layanan",
      ["Isian", "Pilihan/Ketentuan", "Wajib?"],
      [
        ["Nama", "Nama lengkap mahasiswa", "Wajib"],
        ["NIM", "Nomor induk mahasiswa", "Wajib"],
        ["Kontak", "Nomor HP atau media sosial agar petugas dapat menghubungi", "Wajib"],
        ["Jenis Layanan", "Konseling Individu / Konseling Kelompok / Konsultasi Karier / Edukasi Kesehatan Mental / Lainnya", "Wajib"],
        ["Preferensi Hari", "Senin / Selasa / Rabu / Kamis / Jumat", "Wajib"],
        ["Preferensi Waktu", "Pagi (08.00-11.00) / Siang (11.00-14.00) / Sore (14.00-17.00)", "Wajib"],
        ["Keluhan", "Tulisan singkat keluhan/kebutuhan; boleh dikosongkan", "Opsional"],
        ["Persetujuan penggunaan data", "Centang setuju agar data dipakai untuk layanan dan riset", "Wajib"],
      ],
      [26, 56, 18]
    ),
    ...figure("03-registrasi-kosong.png", "Formulir Pendaftaran Layanan sebelum diisi"),
    ...figure("04-registrasi-terisi.png", "Formulir Pendaftaran Layanan yang telah diisi"),
    ...figure("06-registrasi-sukses.png", "Pemberitahuan pendaftaran berhasil"),
    callout("CATATAN", "Setelah berhasil, sistem menyimpan token obrolan di peramban Anda. Terima kasih atas kejujuran Anda mengisi data; data ini hanya dilihat petugas UPA BK untuk kepentingan layanan dan tindak lanjut.", "note"),
    spacer(80),
    h2("3.3 Skrining DASS-21"),
    body("DASS-21 mengukur gejala depresi, kecemasan, dan stres berdasarkan kondisi Anda selama seminggu terakhir. Langkahnya:"),
    numbered("step-dass", "Klik menu Skrining DASS-21; baca halaman pengantar lalu mulai."),
    numbered("step-dass", "Jawab 21 pernyataan satu per satu dengan memilih salah satu dari empat pilihan (lihat Gambar 8)."),
    numbered("step-dass", "Gunakan jawaban yang paling menggambarkan kondisi seminggu terakhir; tidak ada jawaban benar/salah."),
    numbered("step-dass", "Setelah 21 item terisi, kirim jawaban; halaman Skrining Terkirim akan muncul."),
    ...dataTable(
      "Pilihan jawaban DASS-21 dan bobotnya",
      ["Pilihan", "Bobot", "Arti"],
      [
        ["Tidak Pernah", "0", "Tidak pernah merasakan itu selama seminggu terakhir"],
        ["Kadang-kadang", "1", "Jarang / sesekali"],
        ["Sering", "2", "Cukup sering"],
        ["Selalu", "3", "Hampir selalu / sangat sering"],
      ],
      [24, 14, 62]
    ),
    ...figure("02-dass-intro.png", "Pengantar skrining DASS-21"),
    ...figure("07-dass-pertanyaan.png", "Item pernyataan DASS-21 dengan empat pilihan jawaban"),
    ...figure("08-dass-terisi.png", "Item DASS-21 yang telah dijawab"),
    ...figure("09-dass-terkirim.png", "Pemberitahuan skrining terkirim"),
    callout("PERINGATAN", "Sesuai kebijakan layanan, hasil skrining TIDAK ditampilkan kepada mahasiswa. Skor dan kategori hanya ditinjau petugas UPA BK melalui Panel Petugas, lalu dibicarakan dalam pendampingan. Hal ini menjaga kerahasiaan dan mencegah salah tafsir.", "warn"),
    spacer(80),
    body("Cara penghitungan (untuk peninjau): skor tiap subskala = jumlah jawaban 7 item dikali 2 (rentang 0-42). Item menurut subskala: depresi = 3, 5, 10, 13, 16, 17, 21; kecemasan = 2, 4, 7, 9, 15, 19, 20; stres = 1, 6, 8, 11, 12, 14, 18. Kategori cut-off ada di Tabel 18 dan LAMPIRAN B."),
    h2("3.4 Ruang Obrolan Konseling (Chatbot)"),
    body("Ruang obrolan adalah tempat bercerita dengan chatbot dukungan awal berbasis LLM. Chatbot mendengarkan, menenangkan, dan memberi informasi umum - bukan pengganti konselor. Langkahnya:"),
    numbered("step-chat", "Klik menu Ruang Obrolan Konseling, lalu tombol memulai percakapan baru."),
    numbered("step-chat", "Ceritakan dengan bahasa sendiri; tidak perlu formal, tidak perlu teratur."),
    numbered("step-chat", "Chatbot akan membalas; Anda dapat melanjutkan percakapan kapan saja dari daftar percakapan di menu kiri."),
    numbered("step-chat", "Jika ingin didampingi manusia, tuliskan saja (mis. saya ingin bicara dengan konselor) - permintaan akan dicatat untuk petugas."),
    ...dataTable(
      "Hal penting pada percakapan",
      ["Elemen", "Artinya"],
      [
        ["Pesan pengingat (disclaimer)", "Chatbot BUKAN pengganti konseling profesional; untuk pendampingan menyeluruh, ajukan layanan konseling UPA BK"],
        ["Respons keselamatan otomatis", "Muncul saat pesan berpotensi krisis: mengarahkan ke 112 / 119 ext. 8, UPA BK UTM, dan orang terdekat"],
        ["Penandaan [ESKALASI]", "Percakapan yang ditandai segera muncul di Panel Petugas untuk ditinjau"],
        ["Permintaan konselor", "Pesan yang meminta pendampingan manusia dicatat sebagai permintaan tindak lanjut"],
        ["Daftar percakapan", "Riwayat percakapan Anda; tersimpan dan dapat ditinjau petugas untuk tindak lanjut"],
      ],
      [32, 68]
    ),
    ...figure("10-chat-balasan.png", "Contoh percakapan dukungan awal dengan chatbot"),
    ...figure("11-chat-krisis.png", "Respons keselamatan otomatis saat potensi krisis terdeteksi"),
    ...figure("23-chat-varian.png", "Variasi percakapan pada topik yang berbeda"),
    body("Yang perlu diingat saat berobrolan:"),
    bullet("Jawaban chatbot bersifat dukungan awal; bisa meleset; jangan jadikan rujukan medis."),
    bullet("Tidak perlu menyebut data pribadi yang tidak perlu (mis. alamat lengkap); identitas yang cukup sudah ada di pendaftaran."),
    bullet("Percakapan bersifat kerahasiaan layanan namun tetap dapat ditinjau petugas - ini sengaja dirancang agar ada manusia yang menindaklanjuti."),
    bullet("Dalam keadaan mendesak, jangan menunggu balasan chatbot: hubungi 112 atau 119 ext. 8."),
    h2("3.5 Panel Petugas (Admin UPA BK)"),
    body("Panel Petugas khusus petugas/admin UPA BK; mahasiswa tidak memiliki akun. Masuk dengan username dan password internal."),
    numbered("step-admin", "Klik menu Panel Petugas."),
    numbered("step-admin", "Masukkan username dan password, klik tombol masuk."),
    numbered("step-admin", "Dashboard menampilkan statistik ringkas dan daftar pendaftaran; klik salah satu baris untuk membuka detail."),
    numbered("step-admin", "Baca hasil DASS-21 dan transkrip percakapan, lalu atur status tindak lanjut."),
    numbered("step-admin", "Keluar (logout) setelah selesai, terutama di komputer bersama."),
    ...figure("12-petugas-login.png", "Halaman masuk Panel Petugas UPA BK"),
    ...figure("13-petugas-dashboard.png", "Dashboard petugas dengan statistik ringkas"),
    ...dataTable(
      "Arti kartu statistik pada dashboard petugas",
      ["Kartu", "Artinya"],
      [
        ["Total pendaftaran", "Jumlah mahasiswa yang mendaftar layanan"],
        ["Total skrining", "Jumlah pengiriman skrining DASS-21 yang tersimpan"],
        ["Total percakapan", "Jumlah percakapan yang dibuat mahasiswa"],
        ["Percakapan krisis", "Jumlah percakapan yang ditandai berpotensi krisis (prioritas ditinjau)"],
        ["Tindak lanjut per status", "Sebaran pendaftaran menurut status di Tabel 21"],
      ],
      [34, 66]
    ),
    ...figure("14-petugas-daftar.png", "Daftar pendaftaran pada Panel Petugas"),
    ...dataTable(
      "Status tindak lanjut dan artinya",
      ["Status", "Artinya", "Kapan dipakai"],
      [
        ["Menunggu ditinjau", "Baru masuk, belum dibaca petugas", "Kondisi awal setelah pendaftaran/skrining"],
        ["Sedang diproses", "Petugas sedang meninjau/menghubungi", "Saat proses berjalan"],
        ["Dijadwalkan", "Jadwal konseling sudah ditentukan", "Sesi dengan konselor disepakati"],
        ["Selesai", "Layanan tuntas", "Setelah sesi/kasus berakhir"],
        ["Perlu ditinjau segera", "Prioritas tinggi (mis. potensi krisis)", "Segera setelah temuan krisis/skor berat"],
      ],
      [26, 40, 34]
    ),
    ...dataTable(
      "Alur penanganan harian oleh petugas",
      ["Langkah", "Kegiatan"],
      [
        ["1. Periksa dashboard", "Lihat angka percakapan krisis dan status Perlu ditinjau segera terlebih dahulu"],
        ["2. Buka daftar pendaftaran", "Cari nama/NIM; baris paling atas adalah data terbaru"],
        ["3. Buka detail", "Baca identitas, jenis layanan, keluhan, skor DASS-21, dan transkrip percakapan"],
        ["4. Tentukan tindak lanjut", "Catat hasil penilaian dan ubah status (proses/jadwal/selesai/prioritas)"],
        ["5. Hubungi mahasiswa", "Gunakan kontak pada pendaftaran untuk mengatur sesi konseling"],
      ],
      [28, 72]
    ),
    ...figure("16-petugas-percakapan.png", "Transkrip percakapan pada detail pendaftaran"),
    ...figure("22-followup-status.png", "Pembaruan status tindak lanjut"),
    h2("3.6 Membaca Hasil Skrining (Untuk Petugas)"),
    body("Pada detail pendaftaran, petugas melihat jawaban per item beserta skor tiga subskala dan kategorinya. Cara membacanya:"),
    bullet("Skor subskala = jumlah jawaban 7 item x 2 (rentang 0-42); makin tinggi makin berat."),
    bullet("Kategori mengikuti cut-off publikasi Lovibond & Lovibond (1995) - lihat Tabel 18."),
    bullet("Kategori adalah penyaring awal, bukan diagnosis; gunakan sebagai pembicaraan awal saat pendampingan."),
    bullet("Kombinasikan dengan keluhan tertulis dan isi percakapan; angka saja tidak cukup untuk menilai."),
    ...figure("21-detail-dass-skor.png", "Jawaban dan skor DASS-21 pada detail pendaftaran"),
    ...dataTable(
      "Kategori skor DASS-21 (cut-off Lovibond & Lovibond, 1995)",
      ["Subskala", "Normal", "Ringan", "Sedang", "Berat", "Sangat Berat"],
      C.TABEL_KATEGORI.rows,
      [20, 16, 16, 16, 16, 16]
    ),
    callout("CATATAN", "Kategori umum berdasarkan cut-off publikasi DASS-21; bukan kategori resmi UPA BK, bukan diagnosis, dan tidak ditampilkan kepada mahasiswa.", "note"),
    spacer(80),
    h2("3.7 Contoh Cerita Siap Coba"),
    body("Untuk menguji percakapan (petugas atau peneliti), coba salah satu contoh berikut pada Ruang Obrolan:"),
    bullet("Saya merasa cemas berlebihan menjelang ujian dan sulit tidur."),
    bullet("Kangen banget sama keluarga di rumah; ini pertama kali saya jauh dari mereka."),
    bullet("Aku sering overthinking dan menyalahkan diri sendiri untuk hal kecil."),
    bullet("Jadwal kuliah dan organisasi bikin aku lelah dan jenuh terus."),
    callout("TIPS", "Coba juga pesan uji keselamatan (mis. saya tidak ingin hidup lagi) untuk melihat respons keselamatan otomatis muncul dan percakapan ter tandai untuk petugas - ini bukti lapisan keselamatan bekerja tanpa bergantung pada model bahasa.", "tip"),
    spacer(80),
  ];
}

function lampiran() {
  return [
    h1("LAMPIRAN A - Daftar File Aplikasi"),
    code(C.TREE.split("\n")),
    ...dataTable(
      "Penjelasan per komponen aplikasi",
      ["Komponen", "Fungsi"],
      C.KOMPONEN,
      [34, 66]
    ),
    h1("LAMPIRAN B - Instrumen dan Kategori DASS-21"),
    body("Aplikasi memakai DASS-21 (Depression Anxiety Stress Scales, 21 item). Setiap subskala terdiri atas 7 item; skor subskala = jumlah jawaban 7 item dikali 2 (rentang 0-42)."),
    ...dataTable(
      "Item DASS-21 menurut subskala",
      ["Subskala", "Nomor item", "Jumlah item"],
      [
        ["Depresi", C.DASS_ITEM.depresi.join(", "), "7"],
        ["Kecemasan", C.DASS_ITEM.kecemasan.join(", "), "7"],
        ["Stres", C.DASS_ITEM.stres.join(", "), "7"],
      ],
      [26, 52, 22]
    ),
    ...dataTable(
      "Kategori skor DASS-21 menurut cut-off (Lovibond & Lovibond, 1995)",
      ["Subskala", "Normal", "Ringan", "Sedang", "Berat", "Sangat Berat"],
      C.TABEL_KATEGORI.rows,
      [20, 16, 16, 16, 16, 16]
    ),
    callout("CATATAN", "Catatan kecil dari data awal: pada formulir daring penelitian, item 15 dan 16 tertulis sama. Hal ini dicatat sebagai keterbatasan penelitian dan tidak mengubah cara aplikasi menghitung skor (aplikasi memakai 21 item sesuai skema di atas).", "note"),
    spacer(80),
    h1("LAMPIRAN C - FAQ"),
    ...C.FAQ.flatMap((qa, i) => [
      new Paragraph({
        spacing: { before: 140, after: 60, line: 312 },
        children: [new TextRun({ text: (i + 1) + ". " + qa[0], bold: true, size: 22, color: "2E5395", font: FONT })],
      }),
      body(qa[1]),
    ]),
    h1("LAMPIRAN D - Istilah"),
    ...dataTable(
      "Daftar istilah",
      ["Istilah", "Arti"],
      C.ISTILAH,
      [30, 70]
    ),
    h1("Catatan Akhir"),
    body("Dokumen ini disusun berdasarkan aplikasi nyata dan data penelitian berikut:"),
    ...dataTable(
      "Sumber angka-angka penelitian",
      ["Angka", "Nilai", "Sumber"],
      [
        ["Responden skrining awal", "449", "Formulir daring, 11-12 Agustus 2026"],
        ["Responden dianalisis", "434", "Setelah 15 responden tidak bersedia dieksklusi (etika)"],
        ["Kecemasan Berat/Sangat Berat", "128 (29,5%)", "Hasil kategorisasi N = 434"],
        ["Tema keluhan terbanyak", "Rindu keluarga/rumah (96); cemas/overthinking (49)", "Klasifikasi tema keluhan"],
        ["Skoring DASS-21", "Skor subskala x 2; cut-off 1995", "src/lib/dass21.ts; Lovibond & Lovibond (1995)"],
      ],
      [30, 26, 44]
    ),
    body("Lisensi: All Rights Reserved - disajikan untuk kepentingan akademik, demonstrasi layanan UPA BK, dan peninjauan penelitian."),
    body("Buku Panduan Pengguna Obrolan ETA v" + C.APP.versi + " - Imro Atun Jamilah S.A, 2026.", { after: 0 }),
    h1("LAMPIRAN E - Perintah Cepat"),
    body("Ringkasan perintah dari BAGIAN 1 (mode lokal). Untuk akses tanpa instalasi, buka " + C.APP.url + " (BAGIAN 2)."),
    body("Langkah lokal - Windows:", { run: { bold: true } }),
    code([
      "npm install",
      "copy .env.example .env    REM lalu isi kredensial",
      "npx prisma db push",
      "npm run dev",
      "REM buka http://localhost:3000 - hentikan dengan Ctrl + C",
    ]),
    body("Langkah lokal - Linux / macOS:", { run: { bold: true } }),
    code([
      "npm install",
      "cp .env.example .env      # lalu isi kredensial",
      "npx prisma db push",
      "npm run dev",
      "# buka http://localhost:3000",
    ]),
    body("Langkah petugas (online):", { run: { bold: true } }),
    bullet("Buka " + C.APP.url + " - menu Panel Petugas - masuk dengan akun internal."),
    bullet("Tinjau kartu percakapan krisis dan status Perlu ditinjau segera."),
    bullet("Buka detail pendaftaran, baca skor DASS-21 dan transkrip, atur status tindak lanjut."),
    bullet("Keluar (logout) setelah selesai."),
    h1("LAMPIRAN F - Lembar Pemeriksaan"),
    body("Lembar ini diisi saat uji coba aplikasi (online maupun lokal). Beri tanda pada kolom [ ] untuk setiap item yang sesuai; tulis temuan pada kolom Catatan. Jika semua item sesuai, uji coba dinyatakan berhasil."),
    ...dataTable(
      "Informasi pelaksanaan uji coba",
      ["Informasi", "Diisi oleh penguji"],
      [
        ["Nama pengisi", ""],
        ["Tanggal uji coba", ""],
        ["Cara akses (online/lokal)", ""],
        ["Perangkat dan peramban", ""],
      ],
      [40, 60]
    ),
    ...dataTable(
      "Lembar pemeriksaan fungsi aplikasi",
      ["No", "Yang diperiksa", "Hasil yang benar", "[ ]", "Catatan"],
      [
        ["1", "Buka tautan aplikasi", "Halaman utama tampil; judul UPA BK UTM - Ruang Layanan Konseling", "[ ]", ""],
        ["2", "Menu layanan", "4 modul tersedia: Obrolan, Skrining DASS-21, Pendaftaran, Panel Petugas", "[ ]", ""],
        ["3", "Pendaftaran Layanan", "Formulir terkirim; halaman Pendaftaran Berhasil muncul", "[ ]", ""],
        ["4", "Skrining DASS-21", "21 item terjawab; halaman Skrining Terkirim muncul", "[ ]", ""],
        ["5", "Ruang Obrolan", "Chatbot membalas percakapan dengan santun", "[ ]", ""],
        ["6", "Uji keselamatan krisis", "Pesan keselamatan (112 / 119 ext. 8) muncul otomatis", "[ ]", ""],
        ["7", "Panel Petugas - login", "Akun internal masuk; dashboard tampil", "[ ]", ""],
        ["8", "Statistik", "Kartu statistik dan daftar pendaftaran tampil", "[ ]", ""],
        ["9", "Detail dan skor", "Jawaban, skor, dan kategori DASS-21 terbaca", "[ ]", ""],
        ["10", "Tindak lanjut", "Status berhasil diubah dan tersimpan", "[ ]", ""],
        ["11", "Logout", "Petugas keluar; halaman kembali ke login", "[ ]", ""],
      ],
      [7, 26, 43, 8, 16]
    ),
    body("Hasil akhir: [  ] Berhasil    [  ] Gagal (jelaskan pada kolom Catatan).", { run: { bold: true } }),
  ];
}

module.exports = { bagian3, lampiran };
