// Konten Buku Panduan Pengguna - Obrolan ETA (UPA BK UTM)
// Data teks untuk scripts/buat_panduan.js

const APP = {
  nama: "Obrolan ETA - Ruang Layanan Konseling UPA BK UTM",
  judul:
    "Pengembangan Chatbot Pendamping Percakapan Berbasis Large Language Model (LLM) Sebagai Media Dukungan Awal pada UPA BK Universitas Trunojoyo Madura",
  peneliti: "Imro Atun Jamilah S.A (NIM 230411100123)",
  pembimbing: "Ika Oktavia Suzanti, S.Kom., M.Cs. (NIDN 0018108803)",
  program: "MBKM Penelitian Semester Gasal TA. 2026/2027",
  url: "https://obrolan-eta.vercel.app",
  versi: "1.0",
  tanggal: "12 November 2026",
};

const DASS_ITEM = {
  stres: [1, 6, 8, 11, 12, 14, 18],
  kecemasan: [2, 4, 7, 9, 15, 19, 20],
  depresi: [3, 5, 10, 13, 16, 17, 21],
};

const TABEL_KATEGORI = {
  header: ["Subskala", "Normal", "Ringan", "Sedang", "Berat", "Sangat Berat"],
  rows: [
    ["Depresi", "0 - 9", "10 - 13", "14 - 20", "21 - 27", "28 ke atas"],
    ["Kecemasan", "0 - 7", "8 - 9", "10 - 14", "15 - 19", "20 ke atas"],
    ["Stres", "0 - 14", "15 - 18", "19 - 25", "26 - 33", "34 ke atas"],
  ],
};

const FAQ = [
  [
    "Apakah saya perlu membuat akun untuk memakai aplikasi?",
    "Tidak. Mahasiswa tidak memiliki akun. Cukup isi Pendaftaran Layanan; setelah itu sistem menyimpan token obrolan di peramban Anda sehingga Anda dapat langsung memakai skrining dan ruang obrolan. Akun hanya dimiliki petugas/admin UPA BK untuk masuk ke Panel Petugas.",
  ],
  [
    "Di mana data saya disimpan? Apakah aman?",
    "Data pendaftaran, jawaban skrining, dan percakapan tersimpan pada basis data PostgreSQL (layanan Neon) yang hanya dapat diakses aplikasi dan petugas UPA BK melalui Panel Petugas. Data ini bersifat sensitif dan ditujukan semata untuk kepentingan layanan dan tindak lanjut.",
  ],
  [
    "Apakah chatbot bisa memberi diagnosis?",
    "Tidak. Chatbot hanya memberi dukungan awal, mendengarkan, dan mengajukan informasi umum. Semua hasil, termasuk kategori skor DASS-21, bukan diagnosis dan tidak menggantikan penilaian konselor atau psikolog.",
  ],
  [
    "Kenapa jawaban chatbot bisa berbeda-beda untuk pertanyaan yang sama?",
    "Chatbot berbasis Large Language Model (LLM) bersifat generatif, sehingga susunan kalimat jawaban dapat berubah setiap kali. Inti pesan tetap dipandu oleh arahan sistem, namun Anda selalu boleh mengajukan ulang pertanyaan dengan kata lain.",
  ],
  [
    "Apa yang terjadi jika saya menuliskan sesuatu yang berbahaya (misalnya ingin mengakhiri hidup)?",
    "Sistem akan segera menampilkan pesan keselamatan yang berisi nomor darurat 112 dan 119 ext. 8 (layanan Sejiwa Kementerian Kesehatan), mendorong Anda menghubungi UPA BK UTM atau orang terdekat, serta menandai percakapan agar petugas meninjaunya segera. Pesan ini dihasilkan otomatis berdasarkan kata kunci, bukan oleh model bahasa.",
  ],
  [
    "Kenapa hasil skrining DASS-21 tidak ditampilkan setelah saya mengirim jawaban?",
    "Sesuai kebijakan layanan, hasil skrining hanya ditinjau oleh petugas UPA BK melalui Panel Petugas. Hal ini untuk menjaga kerahasiaan dan memastikan hasil dibacakan bersama pendamping yang tepat, bukan ditafsirkan sendiri.",
  ],
  [
    "Saya berganti HP atau membersihkan data peramban, lalu tidak bisa lanjut. Kenapa?",
    "Identitas sesi mahasiswa disimpan di peramban perangkat yang dipakai saat mendaftar. Setelah berganti perangkat atau menghapus data peramban, silakan mengisi Pendaftaran Layanan sekali lagi. Petugas akan menghubungkan riwayat Anda dari sisi layanan.",
  ],
  [
    "Apakah petugas bisa membaca percakapan saya?",
    "Ya. Percakapan tersimpan dan dapat ditinjau oleh petugas UPA BK melalui Panel Petugas. Ini sengaja dirancang agar setiap percakapan yang membutuhkan perhatian mendapat tindak lanjut dari manusia, bukan hanya dari chatbot.",
  ],
  [
    "Apakah aplikasi ini berbayar?",
    "Tidak. Aplikasi berjalan di layanan gratis (Vercel untuk hosting, Neon untuk basis data) dan ditujukan untuk kepentingan riset serta layanan UPA BK UTM.",
  ],
  [
    "Bagaimana kalau lupa username atau password petugas?",
    "Hubungi pengelola aplikasi (peneliti/admin UPA BK). Kredensial petugas tidak dipulihkan melalui halaman login; pengaturannya dilakukan di sisi basis data oleh pengelola.",
  ],
  [
    "Kenapa halaman pertama terasa lambat dibuka?",
    "Server hosting berbasis serverless dapat \u201ctidur\u201d ketika tidak ada akses. Bukaan pertama bisa memakan waktu 10-30 detik; setelah itu akses berikutnya lebih cepat.",
  ],
  [
    "Apakah bisa diakses dari HP?",
    "Bisa. Antarmuka menyesuaikan layar kecil: menu layanan muncul sebagai menu samping (drawer) yang dibuka lewat ikon menu di kiri atas.",
  ],
  [
    "Apakah bisa dipakai bersamaan oleh banyak mahasiswa?",
    "Bisa. Setiap mahasiswa memiliki sesi dan percakapan sendiri; petugas melihat semuanya dari satu panel.",
  ],
  [
    "Sudah selesai skrining, boleh langsung obrolan?",
    "Boleh. Setelah skrining terkirim, tombol Mulai Konseling tersedia; Anda juga dapat kapan saja membuka menu Ruang Obrolan Konseling.",
  ],
];

const ISTILAH = [
  ["LLM (Large Language Model)", "Model bahasa besar; mesin yang menghasilkan jawaban percakapan. Aplikasi ini memakai model GLM melalui layanan API."],
  ["Chatbot", "Program percakapan otomatis; di sini berperan sebagai pendamping dukungan awal sebelum bertemu konselor."],
  ["DASS-21", "Depression Anxiety Stress Scales, 21 item; instrumen skrining singkat untuk mengukur gejala depresi, kecemasan, dan stres selama seminggu terakhir."],
  ["Subskala", "Kelompok item dalam DASS-21: depresi (7 item), kecemasan (7 item), dan stres (7 item)."],
  ["Skor subskala", "Jumlah jawaban 7 item dikali 2, sehingga rentangnya 0-42."],
  ["Cut-off", "Ambang skor untuk menentukan kategori Normal, Ringan, Sedang, Berat, atau Sangat Berat (Lovibond & Lovibond, 1995)."],
  ["Skrining", "Pemeriksaan awal, bukan diagnosis; bertujuan menyaring siapa yang perlu perhatian lebih."],
  ["Tindak lanjut", "Proses petugas menindaklanjuti hasil pendaftaran, skrining, atau percakapan (diproses, dijadwalkan, hingga selesai)."],
  ["Eskalasi krisis", "Penandaan otomatis saat pesan berpotensi krisis, sehingga percakapan segera ditinjau petugas."],
  ["Chat token", "Kunci akses kecil yang diberikan setelah pendaftaran; menghubungkan percakapan Anda dengan data pendaftaran."],
  ["Next.js", "Framework web yang dipakai aplikasi ini."],
  ["Prisma", "Pustaka akses basis data yang dipakai aplikasi untuk membaca/menulis data."],
  ["PostgreSQL / Neon", "Jenis basis data dan layanan penyimpanannya (serverless)."],
  ["Vercel", "Layanan hosting tempat aplikasi versi online berjalan."],
  ["Serverless cold start", "Kondisi server baru \u201cbangun\u201d setelah tidak ada akses; membuat bukaan pertama lebih lambat."],
  ["Prototipe riset", "Versi aplikasi untuk keperluan penelitian dan uji coba, belum untuk layanan produksi penuh."],
];

const TROUBLE = [
  ["'npm' is not recognized", "Node.js belum terpasang atau belum masuk PATH", "Pasang ulang installer Node LTS, centang Add to PATH, lalu buka ulang terminal"],
  ["npm install lambat atau gagal", "Koneksi / proxy kampus", "Coba jaringan lain, matikan VPN, ulangi npm install"],
  ["EADDRINUSE :3000 / port already in use", "Ada proses lain di port 3000", "Jalankan npm run dev -- -p 3001, lalu buka localhost:3001"],
  ["Error P1001 (can't reach database)", "DATABASE_URL salah atau proyek Neon tidur", "Periksa .env, salin ulang connection string dari Neon, jalankan ulang"],
  ["Prisma Client did not initialize", "Belum menjalankan prisma generate/push", "Jalankan npx prisma generate lalu npx prisma db push"],
  ["Halaman 500 saat menyimpan data", "Tabel belum dibuat di basis data", "Jalankan npx prisma db push (lihat 1.5 langkah 4)"],
  ["Obrolan tidak membalas / error chat", "Kunci API LLM belum diisi di .env", "Isi variabel kunci LLM sesuai .env.example, lalu restart npm run dev"],
  ["Login petugas selalu gagal", "Akun admin belum ada di basis data lokal", "Pastikan tabel admin terisi (seed) atau buat akun admin di basis data"],
  ["Tampilan berantakan setelah edit kode", "Cache build lama", "Hentikan server (Ctrl+C), hapus folder .next, jalankan ulang npm run dev"],
  ["Halaman putih kosong", "Server belum siap", "Tunggu 10-30 detik lalu muat ulang (F5)"],
];

const TREE = `obrolan/  (kode aplikasi, tanpa data)
|
|-- package.json            daftar dependensi + perintah npm
|-- next.config.ts          pengaturan Next.js
|-- vercel.json             pengaturan deploy Vercel
|-- .env.example            contoh variabel lingkungan (WAJIB disalin jadi .env)
|-- prisma/
|   '-- schema.prisma       skema tabel: Admin, Registration, Screening, Conversation, Message
|-- src/
|   |-- app/
|   |   |-- page.tsx        satu halaman utama + 4 modul
|   |   |-- layout.tsx      judul & metadata
|   |   '-- api/            API: registrasi, skrining, obrolan, admin
|   |-- components/
|   |   |-- chat/           ruang obrolan + sidebar + status
|   |   |-- screening/      alur skrining DASS-21
|   |   |-- registration/   form pendaftaran layanan
|   |   |-- admin/          login petugas + dashboard
|   |   '-- ui/             komponen dasar antarmuka
|   '-- lib/
|       |-- dass21.ts       item, skoring, dan kategori DASS-21
|       |-- crisis.ts       lapisan keselamatan (kata kunci krisis & handoff)
|       |-- llm.ts          panggilan model GLM
|       |-- auth.ts         sesi login petugas
|       '-- layanan.ts      opsi form layanan (jenis, hari, waktu, status)
'-- README.md               dokumentasi singkat`;

const KOMPONEN = [
  ["src/app/page.tsx", "Halaman utama; memuat 4 modul: Ruang Obrolan Konseling, Skrining DASS-21, Pendaftaran Layanan, dan Panel Petugas"],
  ["src/app/api/", "Antarmuka server: pendaftaran, pengiriman skrining, pesan obrolan, statistik dan data petugas"],
  ["src/components/screening/", "Alur skrining: pemeriksaan sesi, intro, 21 item, progres, dan halaman terkirim"],
  ["src/components/registration/", "Form pendaftaran beserta validasi dan halaman sukses"],
  ["src/components/chat/", "Daftar percakapan, jendela obrolan, pesan chatbot, penanda status"],
  ["src/components/admin/", "Form login petugas dan dashboard (statistik, daftar, detail, tindak lanjut)"],
  ["src/lib/dass21.ts", "Daftar 21 item, penghitungan skor subskala, dan kategori cut-off"],
  ["src/lib/crisis.ts", "Lapisan keselamatan: deteksi kata kunci krisis, pesan keselamatan, permintaan konselor"],
  ["src/lib/llm.ts", "Penghubung ke model GLM (Large Language Model) untuk jawaban percakapan"],
  ["prisma/schema.prisma", "Struktur tabel basis data yang dipakai aplikasi"],
  [".env.example", "Daftar variabel yang wajib disiapkan sebelum menjalankan secara lokal"],
];

module.exports = { APP, DASS_ITEM, TABEL_KATEGORI, FAQ, ISTILAH, TROUBLE, TREE, KOMPONEN };
