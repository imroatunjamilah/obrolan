// Konten Laporan KP — bagian 2: BAB IV-VI, daftar pustaka, lampiran, daftar gambar/tabel
// Markup inline: *teks* = italic.

const BAB4 = {
  intro: [
    "Pelaksanaan Kerja Praktik dilakukan dengan menerapkan pengetahuan yang diperoleh selama perkuliahan untuk menyelesaikan permasalahan antrean dan penjadwalan konseling pada layanan bimbingan konseling kampus. Permasalahan yang menjadi dasar pengembangan adalah belum adanya mekanisme otomatis untuk menilai urgensi keluhan mahasiswa serta menyusun usulan jadwal yang mematuhi kendala konselor, sehingga kasus berisiko tinggi berpotensi terlambat dilayani dan penyusunan jadwal manual memakan waktu.",
    "Berdasarkan permasalahan tersebut, proyek ini menerapkan klasifikasi teks menggunakan TF-IDF dengan tiga algoritma, yaitu Multinomial Naive Bayes, SVM Linear, dan Logistic Regression, untuk menilai urgensi keluhan ke dalam kelas DARURAT, SEDANG, dan NORMAL. Hasil klasifikasi kemudian dijadikan prioritas oleh mesin penjadwalan Greedy yang menghasilkan usulan slot dengan kendala ketiadaan bentrok slot, kuota konselor per hari, dan tenggat layanan 48 jam untuk kasus DARURAT. Seluruh metode diintegrasikan ke dalam aplikasi web sehingga alur pengajuan, klasifikasi, penjadwalan, dan evaluasi berjalan dalam satu sistem.",
  ],
  tahapanIntro: "Tahapan kegiatan merupakan rangkaian proses yang dilakukan untuk menyelesaikan permasalahan selama pelaksanaan Kerja Praktik. Tahapan dimulai dari analisis permasalahan dan kebutuhan sistem, persiapan data, pra-pemrosesan teks, ekstraksi fitur TF-IDF, pembangunan model klasifikasi, perancangan mesin penjadwalan Greedy, hingga pengembangan aplikasi dan pengujian. Adapun tahapan kegiatan yang dilakukan adalah sebagai berikut:",
  tahapan: [
    ["Analisis Permasalahan dan Kebutuhan Sistem", "Tahap pertama dilakukan dengan mengidentifikasi permasalahan antrean dan penjadwalan konseling pada layanan kampus. Kebutuhan sistem ditetapkan mencakup tiga hal, yaitu penilaian urgensi yang konsisten atas teks keluhan, aturan penjadwalan yang mengutamakan kasus berisiko tinggi dengan tenggat layanan 48 jam, serta kendali penuh petugas atas keputusan akhir. Berdasarkan kebutuhan tersebut ditentukan pula arsitektur sistem: aplikasi web dengan tiga halaman utama (pengajuan, panel petugas, evaluasi metode) beserta layanan API untuk klasifikasi, penjadwalan, dan evaluasi."],
    ["Persiapan dan Pengolahan Data", "Data layanan konseling asli bersifat rahasia sehingga pengembangan menggunakan dataset keluhan sintetis (dummy) berlabel sebanyak 147 contoh yang ditulis meniru tema keluhan mahasiswa hasil survei kesejahteraan psikologis di lingkungan UPA BK UTM, seperti rindu keluarga, kecemasan berlebihan, kesulitan tidur, tekanan tugas, gangguan relasi sosial, hingga indikasi menyakiti diri. Dataset terdiri atas DARURAT 50 data (34,0%), SEDANG 44 data (29,9%), dan NORMAL 53 data (36,1%). Pembagian data latih dan data uji dilakukan dengan perbandingan 80:20 secara berstrata sehingga diperoleh 117 data latih dan 30 data uji dengan komposisi kelas yang terjaga. Selain dataset klasifikasi, disiapkan pula data demo berisi 18 permintaan konseling fiktif dan 4 konselor dummy dengan kuota 2-3 sesi per hari untuk menguji mesin penjadwalan."],
    ["Pra-pemrosesan Data Teks", "Setiap teks keluhan melewati lima langkah pra-pemrosesan, yaitu normalisasi kata tidak baku menggunakan kamus ringkas, *case folding* menjadi huruf kecil, tokenisasi berbasis karakter alfanumerik, penghapusan *stopword* bahasa Indonesia, dan pemangkasan sufiks sederhana untuk memperdekat bentuk kata. Hasil tahapan ini berupa urutan kata bersih yang menjadi masukan ekstraksi fitur. Rangkaian yang sama juga diterapkan saat pengajuan baru diproses agar pelatihan dan prediksi konsisten."],
    ["Ekstraksi Fitur Menggunakan TF-IDF", "Teks bersih diubah menjadi vektor numerik menggunakan TF-IDF unigram dengan normalisasi vektor L2. Kamus kosakata dibangun dari data latih; kata yang jarang muncul memberikan bobot tinggi ketika menandai urgensi, sedangkan kata yang muncul di hampir semua keluhan mendapatkan bobot rendah. Matriks bobot hasil ekstraksi menjadi masukan pelatihan ketiga model klasifikasi, dan *vectorizer* yang sama digunakan pada saat prediksi pengajuan baru."],
    ["Implementasi Model Klasifikasi", "Tiga model dilatih pada 117 data latih, yaitu Multinomial Naive Bayes, SVM Linear dengan strategi *one-versus-rest*, dan Logistic Regression dengan fungsi softmax. Ketiganya dievaluasi pada 30 data uji berstrata menggunakan *accuracy*, *precision* makro, *recall* makro, F1 makro, dan *confusion matrix*. Model dengan F1 makro tertinggi ditetapkan sebagai model produksi yang melayani klasifikasi pengajuan nyata, sedangkan dua model lainnya tetap dijalankan untuk menyajikan perbandingan prediksi yang transparan pada setiap pengajuan."],
    ["Perancangan Mesin Penjadwalan Greedy", "Mesin penjadwalan bekerja pada horizon 10 hari kerja (Senin-Jumat) dengan empat sesi per hari, yaitu S1 (08.00-09.30), S2 (09.30-11.00), S3 (13.00-14.30), dan S4 (14.30-16.00). Antrean diurutkan menurut prioritas klasifikasi (DARURAT, SEDANG, NORMAL) lalu waktu pengajuan lebih dulu. Untuk setiap permintaan, algoritma memilih slot terbaik yang tersedia dengan kendala ketiadaan bentrok slot (konselor, tanggal, sesi), kuota konselor per hari, serta preferensi hari dan sesi mahasiswa. Permintaan DARURAT didahulukan dengan tenggat 48 jam dan diperbolehkan melampaui preferensi waktu dengan pencatatan eksplisit; permintaan SEDANG diusahakan pada minggu berjalan dengan pencarian slot alternatif; permintaan NORMAL hanya mengikuti preferensi. Setiap keputusan ditulis pada jejak keputusan (*decision trace*) sehingga usulan jadwal dapat diaudit, dan metrik hasil dihitung mencakup jumlah terjadwal, konflik slot, pelanggaran preferensi, waktu tunggu per prioritas, serta beban per konselor."],
    ["Pengembangan Aplikasi Web dan Pengujian", "Seluruh komponen diintegrasikan ke dalam aplikasi web yang dibangun menggunakan Next.js dengan TypeScript, Prisma sebagai pengakses basis data, dan PostgreSQL pada lingkungan produksi. Aplikasi menyediakan halaman pengajuan konseling dengan hasil klasifikasi langsung, panel petugas untuk menyetujui, menolak, atau menyelesaikan permintaan beserta penjadwalan otomatis, papan jadwal konselor, dan halaman evaluasi metode. Pengujian mencakup uji fungsional alur pengajuan sampai penjadwalan, uji validasi bentrok dan kuota, serta evaluasi kuantitatif menggunakan metrik klasifikasi dan metrik penjadwalan yang diuraikan pada Bab V."],
  ],
  jadwalIntro: "Pelaksanaan Kerja Praktik dilakukan sesuai dengan periode yang telah ditentukan. Jadwal kegiatan disusun berdasarkan tahapan penyelesaian proyek, mulai dari analisis permasalahan, penyiapan data dan metode, implementasi klasifikasi dan penjadwalan, pengembangan aplikasi, hingga pengujian dan penyusunan laporan. Pembagian jadwal bertujuan agar setiap tahapan kegiatan dapat dilaksanakan secara terarah dan sesuai dengan target waktu yang telah ditentukan.",
  jadwalTabel: {
    caption: "Tabel 4. 1. Jadwal Kegiatan",
    header: ["No.", "Jenis Kegiatan", "Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"],
    widths: [8, 42, 12.5, 12.5, 12.5, 12.5],
    rows: [
      ["1.", "Orientasi KP dan analisis permasalahan serta kebutuhan sistem", "X", "", "", ""],
      ["2.", "Studi literatur dan perancangan metode klasifikasi serta penjadwalan", "X", "X", "", ""],
      ["3.", "Penyiapan dataset keluhan sintetis berlabel", "X", "X", "", ""],
      ["4.", "Pra-pemrosesan data teks (preprocessing)", "", "X", "", ""],
      ["5.", "Implementasi ekstraksi fitur TF-IDF dan pelatihan model klasifikasi", "", "X", "X", ""],
      ["6.", "Perancangan dan implementasi mesin penjadwalan Greedy", "", "", "X", ""],
      ["7.", "Pengembangan aplikasi web dan integrasi API", "", "", "X", ""],
      ["8.", "Pengujian, evaluasi metrik, dan perbaikan sistem", "", "", "X", "X"],
      ["9.", "Penyusunan laporan akhir", "", "", "", "X"],
    ],
  },
};

const BAB5 = {
  hasilIntro: "Berdasarkan hasil pengembangan, solusi yang diusulkan telah diwujudkan dalam bentuk aplikasi web penjadwalan konseling yang menyediakan halaman pengajuan, panel petugas, dan evaluasi metode. Aplikasi diakses secara daring pada alamat https://obrolan-eta.vercel.app/?modul=penjadwalan dengan data demo dummy. Pembahasan berikut menjelaskan hasil setiap bagian aplikasi beserta metrik yang menyertainya.",
  halaman1: "Halaman pengajuan merupakan halaman awal yang ditampilkan ketika mahasiswa membuka modul penjadwalan. Halaman ini memuat formulir pengajuan sesi konseling yang terdiri atas kolom nama lengkap, NIM, program studi, kontak, teks keluhan yang dialami, serta pemilihan preferensi hari (Senin sampai Jumat) dan sesi (S1 sampai S4) yang boleh dikosongkan. Di bagian atas formulir terdapat contoh keluhan singkat yang dapat dipakai sebagai acuan penulisan. Setelah formulir dikirim melalui tombol Kirim Pengajuan, sistem langsung menilai urgensi keluhan tanpa menunggu proses manual, kemudian menampilkan hasilnya pada halaman yang sama.",
  g51: "Gambar 5. 1. Halaman pengajuan sesi konseling.",
  halaman2: "Hasil klasifikasi urgensi ditampilkan segera setelah pengajuan dikirim. Sebagai contoh, keluhan \u201CAku sering terbangun dini hari karena cemas soal tugas menumpuk dan sulit tidur nyenyak lagi\u201D yang diajukan dengan preferensi Selasa dan sesi S2 menghasilkan prediksi SEDANG dengan tingkat keyakinan 84,9% dari model Logistic Regression, disertai distribusi skor ketiga kelas yaitu DARURAT 10,6%, SEDANG 84,9%, dan NORMAL 4,5%. Sistem juga menampilkan kata kunci penunjang hasil pra-pemrosesan (sulit, sering, cemas, tugas, nyenyak) agar penilaian dapat ditelusuri, serta perbandingan prediksi ketiga model yang pada contoh tersebut sepakat menempatkan keluhan pada kelas SEDANG. Dengan penyajian seperti ini, mahasiswa dan petugas dapat melihat dasar penilaian urgensi, bukan hanya label akhirnya.",
  g52: "Gambar 5. 2. Hasil klasifikasi urgensi pada pengajuan baru.",
  halaman3: "Panel petugas merupakan halaman kerja petugas UPA BK untuk mengelola seluruh permintaan. Bagian atas halaman menampilkan ringkasan antrean (jumlah menunggu beserta kasus darurat, terjadwal, selesai, dan usia antrean tertua) beserta tombol Jalankan Penjadwalan untuk memproses seluruh antrean sekaligus dan tombol Simulasi Tanpa Menyimpan untuk mencoba aturan jadwal tanpa mengubah data. Daftar permintaan memuat identitas, keluhan, hasil klasifikasi beserta keyakinannya, preferensi, dan status; setiap baris menyediakan aksi mengjadwalkan, menolak, atau menyelesaikan permintaan. Bagian bawah halaman menampilkan papan jadwal konselor per hari kerja sehingga pemakaian slot sesi terlihat jelas. Sistem memvalidasi setiap penjadwalan manual: permintaan yang menabrak slot terisi atau melampaui kuota konselor ditolak oleh API dengan pesan kesalahan, sehingga jadwal yang tersimpan bebas bentrok.",
  g53: "Gambar 5. 3. Panel petugas dengan antrean permintaan dan papan jadwal.",
  halaman4: "Pengujian mesin penjadwalan Greedy dilakukan pada antrean demo yang berisi 14 permintaan menunggu dengan komposisi DARURAT 5 permintaan, SEDANG 5 permintaan, dan NORMAL 4 permintaan, ditambah tiga booking awal yang sudah terisi pada hari kerja pertama. Seluruh 14 permintaan berhasil dijadwalkan pada horizon 10 hari kerja tanpa konflik slot dan tanpa pelanggaran preferensi. Seluruh permintaan DARURAT diperoleh slot pada hari kerja pertama sehingga waktu tunggu rata-rata dan maksimumnya sama, yaitu 1,0 hari, dan kelima kasus terlayani dalam tenggat 48 jam. Permintaan SEDANG menunggu rata-rata 4,4 hari dengan maksimum 8 hari, sedangkan permintaan NORMAL mengikuti preferensinya dengan tunggu rata-rata 7,25 hari dan maksimum 10 hari. Beban konselor terbagi merata antara 2 sampai 5 sesi. Rincian metrik disajikan pada Tabel 5. 4.",
  g54: "Tabel 5. 1. Komposisi dataset keluhan sintetis.",
  g55: "Tabel 5. 2. Perbandingan kinerja tiga model klasifikasi pada data uji.",
  halaman5: "Halaman evaluasi metode menyajikan seluruh metrik sistem secara transparan. Bagian pipeline menampilkan enam langkah metodologi dari pra-pemrosesan hingga evaluasi penjadwalan; bagian dataset menampilkan komposisi 147 contoh sintetis beserta deskripsi setiap kelas; bagian model menampilkan tabel perbandingan akurasi, presisi makro, recall makro, dan F1 makro ketiga algoritma beserta matriks kebingungan masing-masing; dan bagian simulasi menampilkan metrik penjadwalan antrean berjalan. Halaman ini juga menyediakan uji klasifikasi cepat untuk mencoba teks keluhan apa pun tanpa menyimpan pengajuan. Model terbaik pada evaluasi adalah Logistic Regression (Softmax) sehingga ditetapkan sebagai model produksi. Rincian angka disajikan pada Tabel 5. 1 sampai Tabel 5. 3.",
  g56: "Gambar 5. 4. Halaman evaluasi metode: metrik model klasifikasi.",
  g57: "Gambar 5. 5. Halaman evaluasi metode: matriks kebingungan dan simulasi penjadwalan.",
  g58: "Tabel 5. 3. Matriks kebingungan Logistic Regression pada data uji.",
  g59: "Tabel 5. 4. Metrik hasil penjadwalan Greedy per prioritas.",
  tabelKomposisi: {
    caption: "Tabel 5. 1. Komposisi dataset keluhan sintetis",
    header: ["Kelas Urgensi", "Deskripsi Singkat", "Jumlah", "Proporsi"],
    widths: [20, 56, 11, 13],
    rows: [
      ["DARURAT", "Indikasi kegawatdaruratan psikologis, didahulukan maksimal 48 jam", "50", "34,0%"],
      ["SEDANG", "Gangguan fungsional nyata, perlu sesi pada minggu berjalan", "44", "29,9%"],
      ["NORMAL", "Kebutuhan pengembangan diri dan konsultasi ringan", "53", "36,1%"],
      ["Total", "", "147", "100%"],
    ],
  },
  tabelModel: {
    caption: "Tabel 5. 2. Perbandingan kinerja tiga model klasifikasi pada data uji",
    header: ["Model", "Akurasi", "Presisi Makro", "Recall Makro", "F1 Makro"],
    widths: [36, 16, 16, 16, 16],
    rows: [
      ["Naive Bayes (Multinomial)", "86,67%", "86,90%", "85,56%", "85,61%"],
      ["SVM Linear (OvR)", "83,33%", "88,89%", "82,15%", "82,22%"],
      ["Logistic Regression (Softmax) - terbaik", "86,67%", "90,48%", "85,86%", "86,19%"],
    ],
  },
  tabelMatriks: {
    caption: "Tabel 5. 3. Matriks kebingungan Logistic Regression pada data uji",
    header: ["Aktual \\ Prediksi", "DARURAT", "SEDANG", "NORMAL"],
    widths: [34, 22, 22, 22],
    rows: [
      ["DARURAT", "10", "0", "0"],
      ["SEDANG", "3", "6", "0"],
      ["NORMAL", "1", "0", "10"],
    ],
  },
  tabelJadwalMetrik: {
    caption: "Tabel 5. 4. Metrik hasil penjadwalan Greedy per prioritas (waktu tunggu dalam hari)",
    header: ["Prioritas", "Permintaan", "Terjadwal", "Tunggu Rata-rata", "Tunggu Maksimum", "Dalam Tenggat"],
    widths: [16, 15, 15, 18, 18, 18],
    rows: [
      ["DARURAT", "5", "5", "1,0", "1", "5 dari 5"],
      ["SEDANG", "5", "5", "4,4", "8", "5 dari 5"],
      ["NORMAL", "4", "4", "7,25", "10", "4 dari 4"],
      ["Total", "14", "14", "-", "-", "-"],
    ],
  },
  pembahasanIntro: "Berdasarkan hasil pengembangan aplikasi, solusi yang diusulkan telah diwujudkan dalam bentuk aplikasi web yang mengintegrasikan pra-pemrosesan teks, ekstraksi fitur TF-IDF, klasifikasi urgensi tiga model, penjadwalan Greedy, dan pengelolaan antrean oleh petugas. Pembahasan berikut menjelaskan keterkaitan hasil pengembangan dengan permasalahan dan tujuan Kerja Praktik.",
  pemb1Judul: "Pembahasan Pengembangan Aplikasi Penjadwalan Konseling",
  pemb1: [
    "Pengembangan aplikasi menghasilkan media yang menyatukan seluruh alur layanan: pengajuan oleh mahasiswa, penilaian urgensi otomatis, usulan jadwal, keputusan petugas, hingga evaluasi metode. Penyajian hasil klasifikasi beserta keyakinan, kata kunci penunjang, dan perbandingan ketiga model membuat penilaian urgensi dapat ditelusuri dan diawasi, bukan sekadar label yang muncul tanpa penjelasan. Desain ini menjawab kebutuhan analisis bahwa aplikasi harus menjadi alat bantu petugas, bukan pengganti keputusan profesional.",
    "Kendali akhir tetap berada di tangan petugas melalui panel pengelolaan yang memvalidasi setiap perubahan jadwal. Validasi bentrok dan kuota pada level API (kode kesalahan 409) menjamin integritas jadwal meskipun terjadi penyuntingan manual, sementara tombol simulasi memungkinkan petugas melihat dampak aturan penjadwalan sebelum benar-benar diterapkan. Dengan demikian aplikasi mendukung kebijakan layanan yang berlaku tanpa mengurangi kehati-hatian proses manual yang sudah ada.",
  ],
  pemb2Judul: "Pembahasan Ekstraksi Fitur dan Klasifikasi Urgensi",
  pemb2: [
    "Pipelime pra-pemrosesan dan TF-IDF berhasil mengangkat kata-kata yang menandai urgensi. Pada contoh pengajuan baru, kata sulit, sering, cemas, tugas, dan nyenyak menjadi kata kunci penunjang prediksi SEDANG. Pola serupa terlihat pada data demo: keluhan berisi indikasi menyakiti diri atau ideasi diberi skor DARURAT yang tinggi, keluhan gangguan tidur dan konsentrasi cenderung SEDANG, sedangkan keluhan pengembangan diri seperti persiapan rencana belajar atau latihan berbicara di depan umum jatuh ke NORMAL. Hal ini menunjukkan bahwa representasi TF-IDF unigram sudah cukup informatif untuk teks keluhan pendek berbahasa Indonesia.",
    "Meskipun demikian, representasi ringan ini memiliki keterbatasan. Pemangkasan sufiks sederhana belum menggantikan stemming lengkap, dan kata yang tidak pernah muncul pada data latih tidak memberikan kontribusi. Keluhan yang ditulis sangat singkat atau dengan ejaan tidak lazim berpotensi menghasilkan prediksi yang kurang tepat, sehingga skor keyakinan yang rendah harus diperlakukan sebagai sinyal bagi petugas untuk meninjau permintaan secara manual.",
  ],
  pemb3Judul: "Pembahasan Evaluasi Model",
  pemb3: [
    "Logistic Regression memperoleh kinerja terbaik dengan akurasi 86,67% dan F1 makro 86,19%, disusul Naive Bayes dengan akurasi sama (86,67%) namun F1 makro sedikit lebih rendah (85,61%), dan SVM Linear dengan akurasi 83,33% (F1 makro 82,22%). Hasil ini sejalan dengan temuan Suherman dan Ismail (2026) pada pengaduan pelayanan publik bahwa Logistic Regression dengan fitur TF-IDF unggul dibandingkan algoritma lain. Recall DARURAT yang mencapai 100% pada ketiga model merupakan hasil yang penting bagi domain layanan konseling karena berarti tidak ada kasus kegawatdaruratan yang terlewat pada data uji.",
    "Analisis matriks kebingungan Logistic Regression menunjukkan kesalahan terpusat pada kelas SEDANG: 3 dari 9 kasus SEDANG terprediksi DARURAT dan 1 dari 11 kasus NORMAL terprediksi DARURAT. Salah klasifikasi ke arah DARURAT berbeda konsekuensinya dibandingkan sebaliknya: kasus SEDANG yang diperlakukan lebih darurat hanya membuat konselor mendahulukan sesi, sedangkan kasus DARURAT yang terlewat dapat berakibat fatal. Karena itu bias model yang condong berhati-hati (lebih banyak memilih DARURAT) masih dapat diterima secara operasional, dengan catatan petugas meninjau kembali permintaan yang terklasifikasi DARURAT.",
    "Kombinasi akurasi 86,67% pada dataset sintetis 147 contoh menunjukkan pendekatan berjalan baik, namun angka ini belum tentu mewakili data layanan asli. Evaluasi juga baru menggunakan satu pembagian latih-uji sehingga hasil dapat dipengaruhi komposisi 30 data uji. Penerapan pada data asli perlu disertai pelatihan ulang dan pengujian berulang, sebagaimana disarankan pada saran pengembangan.",
  ],
  pemb4Judul: "Pembahasan Hasil Penjadwalan Greedy",
  pemb4: [
    "Mesin penjadwalan Greedy berhasil menjadwalkan seluruh 14 permintaan demo tanpa konflik slot dan tanpa pelanggaran preferensi, dengan prioritas yang bekerja sesuai rancangan: kelima kasus DARURAT mendapat slot pada hari kerja pertama (dalam tenggat 48 jam), permintaan SEDANG terlayani dalam minggu berjalan dengan tunggu rata-rata 4,4 hari, dan permintaan NORMAL terlayani sesuai preferensi dengan tunggu rata-rata 7,25 hari. Waktu tunggu yang meningkat dari DARURAT ke NORMAL menunjukkan aturan prioritas berjalan sebagaimana dimaksud, dan beban konselor yang terdistribusi 2-5 sesi menandakan aturan pembagian beban berfungsi.",
    "Jejak keputusan yang menyertai setiap usulan memudahkan audit: setiap penugasan dicatat berikut slot, konselor, tenggat, dan alasan pemilihannya. Pada praktik layanan, fitur ini membantu petugas menjelaskan keputusan kepada mahasiswa maupun pimpinan unit. Keterbatasan pendekatan Greedy juga tercatat: hasil bergantung pada urutan permintaan dan tidak menjamin optimal global seperti yang mungkin dicapai metode metaheuristik, namun untuk skala antrean harian layanan konseling, kecepatan komputasi dan kemudahan audit menjadi keuntungan yang lebih praktis.",
  ],
};

const BAB6 = {
  kesimpulan: [
    "Berdasarkan hasil pelaksanaan Kerja Praktik pada UPA Layanan Bimbingan Konseling Universitas Trunodjoyo Madura, dapat disimpulkan bahwa aplikasi web penjadwalan konseling dengan klasifikasi urgensi otomatis telah berhasil dibangun secara utuh. Keluhan mahasiswa diproses melalui pra-pemrosesan teks (normalisasi, case folding, tokenisasi, stopword removal, dan pemangkasan sufiks), direpresentasikan menggunakan TF-IDF unigram dengan normalisasi L2, lalu diklasifikasikan ke dalam tiga kelas urgensi (DARURAT, SEDANG, NORMAL) menggunakan 147 contoh keluhan sintetis berlabel dengan pembagian data latih dan data uji 80:20 berstrata.",
    "Pada evaluasi data uji, Logistic Regression menghasilkan kinerja terbaik dengan akurasi 86,67%, presisi makro 90,48%, recall makro 85,86%, dan F1 makro 86,19%, mengungguli Multinomial Naive Bayes (akurasi 86,67%; F1 makro 85,61%) dan SVM Linear (akurasi 83,33%; F1 makro 82,22%). Model dengan recall DARURAT 100% ditetapkan sebagai model produksi, dengan analisis kesalahan yang menunjukkan salah klasifikasi terkonsentrasi ke arah kelas DARURAT sehingga lebih aman secara operasional.",
    "Mesin penjadwalan Greedy yang menggunakan prioritas hasil klasifikasi berhasil menjadwalkan seluruh 14 permintaan demo tanpa konflik slot dan tanpa pelanggaran preferensi; permintaan DARURAT seluruhnya terlayani dalam tenggat 48 jam dengan waktu tunggu rata-rata 1,0 hari, permintaan SEDANG menunggu rata-rata 4,4 hari, dan permintaan NORMAL 7,25 hari, dengan beban konselor terdistribusi 2-5 sesi. Seluruh komponen terintegrasi dalam aplikasi web Next.js yang menyediakan halaman pengajuan konseling, panel petugas dengan validasi bentrok dan kuota, papan jadwal, serta halaman evaluasi metode, sehingga proses antrean layanan konseling menjadi lebih cepat, konsisten, dan dapat diaudit.",
  ],
  saranIntro: "Berdasarkan hasil pengembangan sistem, terdapat beberapa saran yang dapat dipertimbangkan untuk pengembangan selanjutnya, yaitu:",
  saran: [
    "Penerapan pada data asli secara bertahap. Aplikasi telah menggunakan data sintetis karena catatan layanan bersifat rahasia. Penetapan kebijakan penggunaan data anonim oleh UPA BK dapat membuka pelatihan ulang model dengan keluhan asli sehingga kinerja lebih mewakili kondisi nyata.",
    "Perbaikan pra-pemrosesan. Pemangkasan sufiks sederhana dapat ditingkatkan menjadi stemming lengkap (misalnya pustaka Sastrawi) dan kamus normalisasi dapat diperluas agar variasi penulisan keluhan lebih terangkat.",
    "Evaluasi yang lebih stabil. Pengujian dapat dilengkapi k-fold cross-validation dan data uji yang lebih besar agar hasil tidak bergantung pada satu komposisi data uji berukuran 30 contoh.",
    "Optimasi model. Hyperparameter ketiga model (misalnya kekuatan regularisasi Logistic Regression dan SVM) dapat dioptimalkan, serta dapat diuji representasi fitur alternatif seperti n-gram atau model bahasa untuk membandingkan kenaikan kinerja.",
    "Integrasi data skrining. Hasil instrumen seperti DASS-21 dapat dijadikan fitur tambahan atau pembanding urgensi sehingga klasifikasi teks dan hasil skrining saling menguatkan dalam penentuan prioritas.",
    "Pengembangan penjadwalan. Aturan Greedy dapat diperluas dengan kendala tambahan seperti spesialisasi konselor, konselor yang sama untuk sesi lanjutan, atau pencarian jadwal berbasis optimasi untuk antrean berukuran besar.",
  ],
};

const PUSTAKA = [
  "Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2022). *Introduction to algorithms* (4th ed.). MIT Press.",
  "Fatyana, N., Irawan, M. D., & Nasution, A. B. (2024). Sistem penjadwalan bimbingan konseling dengan menerapkan algoritma Shortest Job First. *TIN: Terapan Informatika Nusantara, 4*(10), 669-678. https://doi.org/10.47065/tin.v4i10.5024",
  "Hastie, T., Tibshirani, R., & Friedman, J. H. (2009). *The elements of statistical learning: Data mining, inference, and prediction* (2nd ed.). Springer.",
  "Lovibond, P. F., & Lovibond, S. H. (1995). The structure of negative emotional states: Comparison of the Depression Anxiety Stress Scales (DASS) with the Beck Depression and Anxiety Inventories. *Behaviour Research and Therapy, 33*(3), 335-343. https://doi.org/10.1016/0005-7967(94)00075-U",
  "Manning, C. D., Raghavan, P., & Schütze, H. (2008). *Introduction to information retrieval*. Cambridge University Press.",
  "Nuramadanti, I., Wijaya, D. P., Yazid, A. S., & Danianti, D. (2025). Sistem informasi bimbingan konseling berbasis web (Studi kasus: SMA N 1 Jatilawang). *Jurnal Profesi Insinyur, 6*(2).",
  "Republik Indonesia. (2018). *Peraturan Menteri Riset, Teknologi, dan Pendidikan Tinggi Nomor 28 Tahun 2018 tentang Konselor Perguruan Tinggi*. Kementerian Riset, Teknologi, dan Pendidikan Tinggi.",
  "Setiani, A. Y., Mujianto, A. H., Andriani, A., & Widoyoningrum, S. (2024). Sistem penjadwalan bimbingan belajar berbasis web menggunakan algoritma genetika. *Inovate: Jurnal Ilmiah Inovasi Teknologi Informasi, 9*(1), 234-243. https://doi.org/10.33752/inovate.v9i1.7282",
  "Suherman, S., & Ismail, I. (2026). Klasifikasi prioritas pengaduan pelayanan publik menggunakan natural language processing dan machine learning. *Jurnal Ilmiah Sistem Informasi dan Teknik Informatika (JISTI), 9*(2). https://doi.org/10.57093/jisti.v9i2.430",
  "Sunarti, Ridwang, & Hayat, M. A. M. (2024). Klasifikasi pengaduan pelayanan Fakultas Teknik Universitas Muhammadiyah Makassar menggunakan natural language processing. *Arus Jurnal Sains dan Teknologi (AJST), 2*(2), 572-579. https://doi.org/10.57250/ajst.v2i2.667",
];

const LAMPIRAN = {
  intro: "Lampiran ini mendokumentasikan halaman aplikasi serta layanan API modul penjadwalan konseling sebagai referensi pengelolaan sistem. Aplikasi berjalan pada alamat https://obrolan-eta.vercel.app/?modul=penjadwalan dengan data demo dummy yang identitasnya fiktif.",
  tabelHalaman: {
    caption: "Tabel Lampiran 1. Halaman aplikasi modul penjadwalan konseling",
    header: ["Halaman", "Isi Utama", "Pengguna"],
    widths: [24, 56, 20],
    rows: [
      ["Pengajuan Konseling", "Formulir pengajuan (identitas, keluhan, preferensi), hasil klasifikasi urgensi langsung beserta keyakinan, kata kunci, dan perbandingan tiga model", "Mahasiswa"],
      ["Panel Petugas", "Ringkasan antrean, penjadwalan otomatis Greedy (eksekusi dan simulasi), daftar permintaan dengan aksi jadwalkan/tolak/selesai, validasi bentrok dan kuota, papan jadwal konselor", "Petugas UPA BK"],
      ["Evaluasi Metode", "Pipeline metodologi, komposisi dataset, tabel metrik tiga model, matriks kebingungan, metrik simulasi penjadwalan, uji klasifikasi cepat", "Petugas dan pengelola"],
    ],
  },
  tabelApi: {
    caption: "Tabel Lampiran 2. Layanan API modul penjadwalan konseling",
    header: ["Endpoint", "Metode", "Fungsi"],
    widths: [38, 14, 48],
    rows: [
      ["/api/penjadwalan/permintaan", "GET / POST", "Mengambil daftar permintaan (dengan pemananan data demo) dan membuat pengajuan baru beserta klasifikasi urgensi"],
      ["/api/penjadwalan/permintaan/[id]", "PATCH / DELETE", "Aksi petugas (jadwalkan, tolak, selesai, buka) dengan validasi bentrok dan kuota; menghapus permintaan untuk reset demo"],
      ["/api/penjadwalan/klasifikasi", "POST", "Klasifikasi urgensi teks keluhan bebas untuk uji cepat tanpa menyimpan pengajuan"],
      ["/api/penjadwalan/penjadwalan", "GET / POST", "Simulasi penjadwalan Greedy (dry-run) dan eksekusi penjadwalan antrean pada horizon 10 hari kerja"],
      ["/api/penjadwalan/evaluasi", "GET", "Metrik evaluasi ketiga model, komposisi dataset, dan matriks kebingungan"],
    ],
  },
};

const DAFTAR_GAMBAR = [
  { t: "Gambar 5. 1. Halaman pengajuan sesi konseling", p: "26" },
  { t: "Gambar 5. 2. Hasil klasifikasi urgensi pada pengajuan baru", p: "26" },
  { t: "Gambar 5. 3. Panel petugas dengan antrean permintaan dan papan jadwal", p: "27" },
  { t: "Gambar 5. 4. Halaman evaluasi metode: metrik model klasifikasi", p: "28" },
  { t: "Gambar 5. 5. Halaman evaluasi metode: matriks kebingungan dan simulasi penjadwalan", p: "29" },
];

const DAFTAR_TABEL = [
  { t: "Tabel 4. 1. Jadwal Kegiatan", p: "23" },
  { t: "Tabel 5. 1. Komposisi dataset keluhan sintetis", p: "28" },
  { t: "Tabel 5. 2. Perbandingan kinerja tiga model klasifikasi pada data uji", p: "29" },
  { t: "Tabel 5. 3. Matriks kebingungan Logistic Regression pada data uji", p: "29" },
  { t: "Tabel 5. 4. Metrik hasil penjadwalan Greedy per prioritas", p: "28" },
];

const DAFTAR_LAMPIRAN = [
  { t: "Lampiran 1. Dokumentasi halaman dan layanan API aplikasi", p: "31" },
];

module.exports = { BAB4, BAB5, BAB6, PUSTAKA, LAMPIRAN, DAFTAR_GAMBAR, DAFTAR_TABEL, DAFTAR_LAMPIRAN };
