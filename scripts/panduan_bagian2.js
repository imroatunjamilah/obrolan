// BAGIAN 1 (lokal) dan BAGIAN 2 (online)
const L = require("./panduan_lib.js");
const C = require("./panduan_konten.js");
const { h1, h2, h3, body, bodyRuns, bullet, numbered, callout, spacer, code, dataTable, figure } = L;

function bagian1() {
  return [
    h1("BAGIAN 1 - MENJALANKAN SECARA LOKAL (MODE PENGEMBANG)"),
    body("Bagian ini untuk peneliti dan pengembang yang ingin menjalankan aplikasi di komputer sendiri, misalnya untuk mengubah kode atau menelaah data. Bagian ini boleh dilewati jika Anda hanya akan memakai versi online (BAGIAN 2)."),
    body("Arah kerja aplikasi lokal:"),
    code([
      "[Peramban kamu]  ->  http://localhost:3000",
      "",
      "Next.js (npm run dev)",
      "   |-> Prisma  ->  PostgreSQL (basis data, mis. Neon)",
      "   |-> LLM API (model GLM)  ->  jawaban obrolan",
      "",
      "Kredensial dibaca dari file .env (DATABASE_URL, kunci LLM, dsb.)",
    ]),
    h2("1.1 Yang Dibutuhkan"),
    body("Perangkat:"),
    ...dataTable(
      "Kebutuhan perangkat (minimum dan disarankan)",
      ["Item", "Minimum", "Disarankan"],
      [
        ["Sistem operasi", "Windows 10 (64-bit) / Ubuntu 20.04 / macOS 11", "Windows 11 / Ubuntu 22.04"],
        ["RAM", "2 GB", "4 GB ke atas"],
        ["Ruang disk", "1 GB", "2 GB"],
        ["Prosesor", "Dual-core", "Quad-core"],
        ["Layar", "1280 x 720", "1920 x 1080"],
        ["Internet", "Saat instal dan saat obrolan (LLM + basis data cloud)", "-"],
      ],
      [26, 38, 36]
    ),
    body("Perangkat lunak:"),
    ...dataTable(
      "Kebutuhan perangkat lunak",
      ["Perangkat lunak", "Versi", "Wajib?"],
      [
        ["Node.js + npm", "18 LTS / 20 LTS / 22 LTS", "Wajib"],
        ["Basis data PostgreSQL", "Proyek Neon gratis (atau Postgres lokal)", "Wajib"],
        ["Kunci API model bahasa (GLM)", "Sesuai penyedia yang dipakai penelitian", "Wajib untuk fitur obrolan"],
        ["Peramban (Chrome/Edge/Firefox)", "Versi terbaru", "Wajib"],
        ["Git (opsional)", "Versi terbaru", "Tidak wajib"],
      ],
      [40, 36, 24]
    ),
    callout("PENTING", "Jangan memakai Node.js versi 16 ke bawah. Aplikasi memakai Next.js 16 dan Prisma 6 yang membutuhkan Node.js modern (18 ke atas). Gunakan versi LTS.", "note"),
    spacer(80),
    h2("1.2 Mendapatkan File Aplikasi"),
    body("Ada dua cara. Pilih salah satu:"),
    h3("Cara A - Dari repositori GitHub"),
    numbered("step-a", "Buka repositori penelitian: github.com/imroatunjamilah/obrolan."),
    numbered("step-a", "Klik tombol hijau Code, lalu pilih Download ZIP untuk mengunduh kode (lihat Gambar 1), atau clone dengan git clone jika Git tersedia."),
    numbered("step-a", "Lanjut ke 1.4 (ekstrak)."),
    ...figure("18-github-repo.png", "Halaman repositori GitHub penelitian (Code - Download ZIP)"),
    h3("Cara B - Salin paket ZIP dari peneliti"),
    numbered("step-b", "Minta file obrolan-kode.zip kepada peneliti (atau unduh dari folder hasil pada repositori)."),
    numbered("step-b", "Ekstrak ke folder kerja, lanjut ke 1.4."),
    body("Isi paket yang seharusnya kamu terima: folder src (kode), prisma (skema basis data), package.json, next.config.ts, vercel.json, dan .env.example. Kalau folder src atau prisma tidak ada, paketnya tidak lengkap - minta ulang."),
    h2("1.3 Instal Node.js (Windows)"),
    body("Lewati bagian ini jika node --version sudah menampilkan versi 18 ke atas."),
    numbered("step-node", "Buka https://nodejs.org lalu unduh versi LTS (tombol Recommended for Most Users)."),
    numbered("step-node", "Jalankan installer node-vXX.x.x-x64.msi yang baru diunduh."),
    numbered("step-node", "Biarkan pilihan Add to PATH tetap tercentang, klik Next hingga selesai, lalu tutup installer."),
    numbered("step-node", "Tutup terminal lama (jika ada), buka Command Prompt baru, dan jalankan:"),
    code(["node --version", "npm --version"]),
    ...dataTable(
      "Hasil pemeriksaan versi Node.js dan tindakan yang disarankan",
      ["Hasil di layar", "Artinya", "Tindakan"],
      [
        ["v20.x.x atau v22.x.x", "Sudah siap", "Lanjut ke 1.4"],
        ["v18.x.x", "Siap (versi minimum)", "Lanjut ke 1.4"],
        ["v16.x.x ke bawah", "Terlalu lama", "Pasang Node LTS dari nodejs.org"],
        ["'node' is not recognized...", "Belum ada / belum di PATH", "Ikuti 1.3 dari awal, lalu restart komputer"],
      ],
      [30, 28, 42]
    ),
    callout("PENTING", "Kalau masih 'not recognized': tutup semua terminal, restart komputer, lalu coba lagi. Kalau tetap gagal, ulangi instalasi dan pastikan opsi Add to PATH benar-benar tercentang.", "note"),
    spacer(80),
    h2("1.4 Ekstrak File ZIP"),
    bullet("Klik kanan file obrolan-kode.zip, pilih Extract All...."),
    bullet("Pilih lokasi yang mudah diingat dan tanpa karakter aneh, contoh yang benar: C:\\Proyek\\obrolan atau D:\\Aplikasi\\obrolan."),
    bullet("Hindari folder bertingkat seperti Downloads\\file (1)\\extract\\... dan jangan menjalankan aplikasi langsung dari dalam file ZIP."),
    bullet("Cek hasil ekstrak: harus ada folder src, folder prisma, file package.json, dan file .env.example."),
    h2("1.5 Menjalankan Aplikasi (Pertama Kali)"),
    body("Buka Command Prompt di folder aplikasi (cara cepat: klik kolom alamat di File Explorer, ketik cmd, tekan Enter). Lalu ikuti lima langkah berikut:"),
    ...dataTable(
      "Tahap menjalankan aplikasi pertama kali",
      ["Langkah", "Perintah", "Perkiraan waktu", "Yang terjadi"],
      [
        ["1. Pasang dependensi", "npm install", "2 - 5 menit", "Mengunduh Next.js, Prisma, dan pustaka lain (butuh internet)"],
        ["2. Salin pengaturan", "copy .env.example .env (Windows) / cp .env.example .env (Linux/macOS)", "1 menit", "Membuat file .env untuk kredensial"],
        ["3. Isi kredensial", "Edit .env dengan Notepad/VS Code", "2 menit", "DATABASE_URL (Neon) dan kunci API model bahasa"],
        ["4. Siapkan tabel", "npx prisma db push", "10 - 30 detik", "Membuat tabel di basis data sesuai skema"],
        ["5. Jalankan", "npm run dev", "10 - 20 detik", "Server lokal aktif di localhost:3000"],
      ],
      [18, 28, 16, 38]
    ),
    callout("TIPS", "Pada langkah 3, salin connection string dari proyek Neon (Dashboard - Connection Details). Tambahkan ?sslmode=require bila belum ada. Kunci API model bahasa juga disalin dari penyedia layanan yang dipakai penelitian. File .env tidak boleh dibagikan atau diunggah.", "tip"),
    spacer(80),
    body("Jika berhasil, terminal menampilkan tulisan semacam Ready dan aplikasi dapat dibuka di http://localhost:3000."),
    h2("1.6 Memastikan Aplikasi Berjalan Benar"),
    body("Setelah halaman terbuka, lakukan lima pemeriksaan ini:"),
    ...dataTable(
      "Lima pemeriksaan keberhasilan instalasi",
      ["No", "Yang diperiksa", "Hasil yang benar"],
      [
        ["1", "Judul di bilah atas", "UPA BK UTM - Ruang Layanan Konseling"],
        ["2", "Menu layanan di sisi kiri", "4 modul: Ruang Obrolan Konseling, Skrining DASS-21, Pendaftaran Layanan, Panel Petugas"],
        ["3", "Pendaftaran Layanan", "Formulir terkirim dan halaman Pendaftaran Berhasil muncul"],
        ["4", "Skrining DASS-21", "21 item bisa dijawab; halaman Skrining Terkirim muncul"],
        ["5", "Panel Petugas", "Login berhasil, statistik dan daftar pendaftaran tampil"],
      ],
      [8, 32, 60]
    ),
    body("Kalau ada yang tidak sesuai:"),
    bullet("Muncul Error P1001 / can't reach database - kredensial basis data salah atau proyek Neon belum aktif; periksa .env lalu ulangi langkah 4."),
    bullet("Muncul Prisma Client did not initialize - jalankan npx prisma generate lalu npm run dev lagi."),
    bullet("Obrolan tidak membalas tetapi halaman normal - kunci API model bahasa belum benar di .env."),
    bullet("Halaman putih - tunggu 10-30 detik lalu muat ulang (F5)."),
    h2("1.7 Cara Manual (Ringkas)"),
    code([
      "REM 1. Pasang dependensi",
      "npm install",
      "",
      "REM 2. Siapkan pengaturan",
      "copy .env.example .env",
      "",
      "REM 3. Siapkan tabel basis data",
      "npx prisma db push",
      "",
      "REM 4. Jalankan aplikasi",
      "npm run dev",
    ]),
    ...dataTable(
      "Penjelasan singkat perintah pada mode lokal",
      ["Perintah", "Fungsinya"],
      [
        ["npm install", "Mengunduh seluruh pustaka yang dibutuhkan aplikasi"],
        ["npx prisma db push", "Membuat/menyesuaikan tabel di basis data sesuai prisma/schema.prisma"],
        ["npm run dev", "Menjalankan server pengembangan di localhost:3000"],
        ["npm run build", "Membangun versi produksi (dipakai Vercel saat deploy)"],
      ],
      [34, 66]
    ),
    h2("1.8 Linux / macOS"),
    code([
      "# Pasang Node LTS sesuai distro (contoh Ubuntu):",
      "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -",
      "sudo apt install -y nodejs",
      "",
      "# Di folder aplikasi:",
      "npm install",
      "cp .env.example .env   # lalu isi kredensial",
      "npx prisma db push",
      "npm run dev",
    ]),
    body("Akses di peramban: http://localhost:3000."),
    h2("1.9 Menghentikan Aplikasi"),
    ...dataTable(
      "Cara menghentikan aplikasi lokal",
      ["Cara", "Langkah"],
      [
        ["Paling sopan", "Klik jendela terminal lalu tekan Ctrl + C"],
        ["Tutup jendela", "Klik tombol X pada jendela terminal"],
        ["Paksa (kalau macet)", "Task Manager (Ctrl + Shift + Esc) - cari node.exe - End task"],
      ],
      [26, 74]
    ),
    body("Setelah dihentikan, http://localhost:3000 menampilkan This site can't be reached - itu normal, artinya server sudah mati. Menutup tab peramban tidak menghentikan server."),
    h2("1.10 Kebutuhan Internet pada Setiap Fase"),
    ...dataTable(
      "Kebutuhan koneksi internet pada setiap fase (mode lokal)",
      ["Fase", "Butuh internet?", "Alasan"],
      [
        ["Mendapatkan kode", "Ya", "Mengunduh ZIP / git clone"],
        ["npm install", "Ya", "Mengunduh pustaka dari registri"],
        ["npx prisma db push", "Ya", "Menghubungi basis data cloud (Neon)"],
        ["Menjalankan npm run dev", "Ya (untuk fitur obrolan & data)", "Model bahasa dan basis data berada di layanan cloud"],
        ["Membuka halaman tanpa fitur simpan", "Tidak", "Antarmuka dimuat lokal"],
      ],
      [30, 22, 48]
    ),
    body("Perbedaan penting dibanding aplikasi statis: karena basis data dan model bahasa berada di layanan cloud, mode lokal tetap memerlukan koneksi internet saat fitur dipakai."),
    h2("1.11 Troubleshooting Lokal"),
    ...dataTable(
      "Troubleshooting lokal: gejala, penyebab, dan solusi",
      ["Gejala", "Penyebab", "Solusi"],
      C.TROUBLE,
      [30, 30, 40]
    ),
    body("Cara reset total (kalau semua gagal): hapus folder node_modules dan file .env, jalankan ulang langkah 1.5 dari awal. Jika masih gagal, ekstrak ulang ZIP kode."),
  ];
}

function bagian2() {
  return [
    h1("BAGIAN 2 - MENJALANKAN SECARA ONLINE"),
    body("Aplikasi sudah dihosting di Vercel dan siap dipakai tanpa instalasi apa pun - cukup peramban, di laptop maupun HP."),
    callout("AKSES ONLINE", "https://obrolan-eta.vercel.app  -  buka tautan di atas; dapat diakses mahasiswa dan petugas dari perangkat apa pun.", "info"),
    spacer(80),
    body("Arah kerja versi online:"),
    code([
      "[Peramban / HP kamu]",
      "   ->  https://obrolan-eta.vercel.app  (Vercel)",
      "         |->  PostgreSQL (Neon)   : data pendaftaran, skrining, percakapan",
      "         `->  LLM API (GLM)       : jawaban obrolan",
    ]),
    h2("2.1 Perbedaan Lokal vs Online"),
    ...dataTable(
      "Perbandingan penggunaan online (hosting) dan lokal",
      ["Aspek", "Online (Vercel)", "Lokal (pengembang)"],
      [
        ["Instalasi", "Tidak perlu", "Perlu (Node.js, .env, prisma push)"],
        ["Siapa yang memakai", "Mahasiswa + petugas UPA BK", "Peneliti/pengembang saja"],
        ["Akses dari HP", "Ya", "Tidak (hanya komputer yang menjalankan)"],
        ["Data yang dipakai", "Basis data produksi riset (Neon)", "Sesuai .env lokal (bisa sama atau basis data terpisah)"],
        ["Dapat dibagikan", "Cukup kirim tautan", "Tidak"],
        ["Pembaruan fitur", "Otomatis setiap git push (deploy Vercel)", "Manual (git pull + npm install)"],
      ],
      [26, 38, 36]
    ),
    h2("2.2 Cara Mengakses"),
    bullet("Buka peramban (laptop atau HP), ketik https://obrolan-eta.vercel.app lalu tekan Enter."),
    bullet("Tunggu halaman muncul (10-30 detik pada bukaan pertama; server serverless perlu bangun)."),
    bullet("Untuk mahasiswa: buka menu di sisi kiri (pada HP lewat ikon menu), lalu mulai dari Pendaftaran Layanan."),
    bullet("Untuk petugas: buka menu Panel Petugas dan masuk dengan akun internal UPA BK."),
    ...figure("19-produksi-live.png", "Aplikasi versi online dibuka di peramban"),
    callout("CATATAN", "Identitas sesi mahasiswa (nama, token obrolan) disimpan di peramban perangkat yang dipakai saat mendaftar. Berganti perangkat atau membersihkan data peramban berarti perlu mengisi Pendaftaran Layanan sekali lagi - riwayat lama tetap dapat dilihat petugas dari sisi layanan.", "note"),
    spacer(80),
    h2("2.3 Batasan Versi Online"),
    ...dataTable(
      "Batasan versi online",
      ["Batasan", "Penjelasan", "Dampak"],
      [
        ["Cold start serverless", "Server berhenti saat tidak ada akses", "Bukaan pertama bisa 10-30 detik"],
        ["Kuota layanan gratis", "Vercel, Neon, dan API model punya kuota", "Cukup untuk uji coba dan layanan berjaga-jaga"],
        ["Sesi per perangkat", "Token obrolan tersimpan di peramban", "Ganti perangkat = daftar ulang"],
        ["Publik bagi pemegang tautan", "Tautan dapat dibuka siapa pun", "Hanya dibagikan kepada civitas terkait; data sensitif hanya tampil di Panel Petugas"],
        ["Hasil skrining tersembunyi", "Mahasiswa tidak melihat skor/kategori", "Pembacaan hasil dilakukan bersama petugas"],
      ],
      [24, 38, 38]
    ),
    h2("2.4 (Untuk Pengelola) Deploy Ulang / Update"),
    body("Bagian ini hanya untuk pemilik repositori, bukan pengguna umum."),
    bullet("Perbarui kode di komputer, uji lokal (BAGIAN 1), lalu git push ke cabang main."),
    bullet("Vercel otomatis membangun dan menyalin versi baru (sekitar 1-3 menit); cek tab Deployments di dasbor Vercel."),
    bullet("Variabel lingkungan produksi diatur di Vercel: Project - Settings - Environment Variables (DATABASE_URL, kunci API model bahasa, dan kredensial internal lainnya)."),
    bullet("Basis data produksi dikelola di konsol Neon: buat/cadangkan proyek, pantau pemakaian."),
    callout("PERINGATAN", "Jangan pernah mengunggah file .env atau kredensial ke repositori. Jangan menuliskan username/password petugas di kode. Kredensial petugas disimpan di tabel Admin pada basis data dan dapat diganti oleh pengelola.", "warn"),
    spacer(80),
  ];
}

module.exports = { bagian1, bagian2 };
