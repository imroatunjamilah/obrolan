// Konten Laporan KP — Penjadwalan Konseling UPA BK (bagian 1: front matter + BAB I-III)
// Markup inline: *teks* = italic. Placeholder 【...】 untuk data yang harus diisi user.

const META = {
  judul: "Penerapan Klasifikasi Teks Menggunakan TF-IDF dan Algoritma Greedy pada Penjadwalan Konseling UPA BK Universitas Trunodjoyo Madura",
  judulBaris: [
    "Penerapan Klasifikasi Teks Menggunakan TF-IDF dan",
    "Algoritma Greedy pada Penjadwalan Konseling",
    "UPA BK Universitas Trunodjoyo Madura",
  ],
  nama: "Imroatun Jamilah Salsabilah Abdulah",
  nim: "230411100123",
  prodi: "PROGRAM STUDI TEKNIK INFORMATIKA",
  fakultas: "FAKULTAS TEKNIK",
  universitas: "UNIVERSITAS TRUNODJOYO MADURA",
  tahun: "2026",
  pembimbing: "\u3010Nama Dosen Pembimbing\u3011",
  nipPembimbing: "\u3010NIP Dosen Pembimbing\u3011",
  pembimbingLapangan: "\u3010Nama Pembimbing Lapangan UPA BK\u3011",
  tglPengesahan: "\u3010tanggal pengesahan\u3011",
  tglUjian: "\u3010tanggal ujian\u3011",
  tglPengantar: "\u3010tanggal\u3011",
  koordinator: "Dwi Kuswanto, S.Pd., M.T.",
  nipKoordinator: "NIP. 197402212008011006",
  ketuaJurusan: "Husni, S.Kom., M.T.",
  nipKetua: "NIP. 197907222003121006",
};

const ABSTRAK = {
  isi: [
    "Unit Penunjang Akademik (UPA) Layanan Bimbingan Konseling Universitas Trunodjoyo Madura menerima pengajuan sesi konseling yang terus meningkat, sementara penilaian urgensi dan penyusunan jadwal masih dilakukan secara manual sehingga kasus dengan risiko tinggi berpotensi terlambat dilayani. Kegiatan Kerja Praktik ini bertujuan membangun aplikasi web penjadwalan konseling yang menilai urgensi keluhan secara otomatis dan menyusun usulan jadwal secara terkomputasi. Keluhan mahasiswa diolah melalui pra-pemrosesan teks, direpresentasikan menggunakan *Term Frequency-Inverse Document Frequency* (TF-IDF), lalu diklasifikasikan ke dalam tiga kelas urgensi, yaitu DARURAT, SEDANG, dan NORMAL, menggunakan tiga algoritma, yaitu Multinomial Naive Bayes, SVM Linear, dan Logistic Regression. Model dilatih pada 147 contoh keluhan sintetis berlabel dengan pembagian data latih dan data uji 80:20 berstrata. Logistic Regression menghasilkan kinerja terbaik dengan akurasi 86,67% dan F1 makro 86,19%, mengungguli Naive Bayes (F1 makro 85,61%) dan SVM Linear (82,22%). Hasil klasifikasi digunakan sebagai prioritas oleh mesin penjadwalan Greedy yang menghormati kendala slot, kuota konselor per hari, dan tenggat layanan 48 jam untuk kasus DARURAT. Pada simulasi 14 antrean, seluruh permintaan berhasil dijadwalkan tanpa konflik slot dengan waktu tunggu rata-rata 1,0 hari untuk DARURAT, 4,4 hari untuk SEDANG, dan 7,25 hari untuk NORMAL. Aplikasi diimplementasikan menggunakan Next.js dan menyediakan halaman pengajuan konseling, panel petugas, serta evaluasi metode.",
  ],
  kataKunci: "*TF-IDF, Logistic Regression, penjadwalan greedy, bimbingan konseling, kesehatan mental mahasiswa.*",
};

const KATA_PENGANTAR = [
  "Puji syukur ke hadirat Tuhan Yang Maha Esa atas rahmat dan karunia-Nya sehingga penulis dapat menyelesaikan Laporan Kerja Praktik berjudul Penerapan Klasifikasi Teks Menggunakan TF-IDF dan Algoritma Greedy pada Penjadwalan Konseling UPA BK Universitas Trunodjoyo Madura. Laporan ini disusun sebagai bentuk pertanggungjawaban atas pelaksanaan Kerja Praktik, mulai dari analisis kebutuhan, persiapan data, pembangunan model klasifikasi urgensi, perancangan mesin penjadwalan, hingga pengembangan dan pengujian aplikasi web penjadwalan konseling.",
  "Penulis mengucapkan terima kasih kepada orang tua dan keluarga atas doa serta dukungannya, kepada \u3010Nama Dosen Pembimbing\u3011 selaku dosen pembimbing Kerja Praktik, kepada UPA Layanan Bimbingan Konseling Universitas Trunodjoyo Madura selaku mitra Kerja Praktik beserta \u3010Nama Pembimbing Lapangan UPA BK\u3011 selaku pembimbing lapangan, serta seluruh pihak yang telah membantu pelaksanaan kegiatan dan penyusunan laporan ini. Penulis menyadari bahwa laporan ini masih memiliki kekurangan. Oleh karena itu, kritik dan saran yang membangun sangat diharapkan. Semoga laporan ini dapat memberikan manfaat bagi pembaca.",
];

const BAB1 = {
  latar: [
    "Masa perkuliahan membawa sejumlah tekanan baru bagi mahasiswa, mulai dari adaptasi lingkungan yang lebih mandiri, tuntutan akademik, hingga pengelolaan keuangan dan relasi sosial. Tekanan tersebut bila dibiarkan tanpa penanganan yang tepat dapat berkembang menjadi gangguan kesehatan mental seperti kecemasan, stres, maupun depresi. Menyadari pentingnya dukungan tersebut, pemerintah melalui Peraturan Menteri Riset, Teknologi, dan Pendidikan Tinggi Nomor 28 Tahun 2018 tentang Konselor Perguruan Tinggi mengamanatkan terselenggaranya layanan bimbingan dan konseling di perguruan tinggi (Republik Indonesia, 2018). Universitas Trunodjoyo Madura (UTM) menjalankan amanat tersebut melalui Unit Penunjang Akademik (UPA) Layanan Bimbingan Konseling yang selanjutnya disebut UPA BK UTM, yaitu unit yang menyediakan layanan konseling individual dan kelompok bagi mahasiswa.",
    "Kebutuhan layanan konseling di lingkungan UTM terlihat dari survei kesejahteraan psikologis yang dilaksanakan bersama UPA BK UTM. Survei tersebut mengumpulkan 449 respons mahasiswa dan 434 respons dianalisis menggunakan instrumen Depression Anxiety Stress Scales (DASS-21) yang dikembangkan oleh Lovibond dan Lovibond (1995). Hasilnya menunjukkan bahwa 29,5% responden berada pada kategori kecemasan berat hingga sangat berat, sementara tema keluhan yang paling sering muncul adalah rindu keluarga (21,7%) dan kecemasan berlebihan atau overthinking (11,3%). Temuan ini menegaskan bahwa permintaan layanan konseling cukup besar dan terus berlangsung, sehingga keteraturan proses antrean dan penjadwalan menjadi faktor penting dalam kualitas layanan.",
    "Selama ini pengajuan sesi konseling di layanan konseling kampus umumnya dilakukan secara manual. Mahasiswa mengajukan keluhan melalui formulir atau datang langsung ke unit layanan, kemudian petugas menilai tingkat kepentingan serta menentukan jadwal satu per satu. Proses seperti ini memiliki beberapa kelemahan. Pertama, penilaian urgensi bergantung pada persepsi petugas sehingga kurang konsisten antarpetugas. Kedua, kasus yang sebenarnya membutuhkan penanganan cepat, misalnya indikasi kegawatdaruratan psikologis seperti ideasi menyakiti diri, berisiko tercampur dengan antrean biasa dan terlambat dilayani. Ketiga, penyusunan jadwal manual memakan waktu dan rawan bentrok karena petugas harus mengecek ketersediaan slot, kuota konselor, serta preferensi waktu mahasiswa secara berulang.",
    "Keluhan yang diajukan mahasiswa pada dasarnya adalah data teks, sehingga tingkat urgensinya dapat dinilai menggunakan teknik klasifikasi teks dari bidang penambangan data. Term Frequency-Inverse Document Frequency (TF-IDF) merupakan metode pembobotan kata yang sederhana, efisien, dan terbukti efektif untuk teks pendek berbahasa informal. Penerapan pendekatan serupa pada pengaduan pelayanan telah menghasilkan kinerja yang baik. Suherman dan Ismail (2026) mengklasifikasikan 470 pengaduan pelayanan publik menjadi label Tinggi, Sedang, dan Rendah menggunakan TF-IDF, dan Logistic Regression yang mereka uji mencapai akurasi 88,94% dengan Macro-F1 87,13%. Sunarti, Ridwang, dan Hayat (2024) juga menunjukkan bahwa klasifikasi pengaduan pelayanan fakultas menggunakan algoritma Naive Bayes mampu mencapai akurasi 91%. Hasil kedua penelitian tersebut menunjukkan potensi penerapan klasifikasi teks pada keluhan layanan konseling mahasiswa.",
    "Klasifikasi urgensi saja belum cukup menyelesaikan masalah karena hasilnya masih perlu diterjemahkan menjadi jadwal sesi yang konkret. Pada domain layanan konseling, Nuramadanti, Wijaya, Yazid, dan Danianti (2025) membangun sistem informasi bimbingan konseling berbasis web yang memberikan nilai prioritas pada setiap permohonan konseling, sedangkan Fatyana, Irawan, dan Nasution (2024) menerapkan algoritma Shortest Job First untuk mengurangi waktu tunggu antrean bimbingan konseling. Pada domain penjadwalan akademik lainnya, Setiani, Mujianto, Andriani, dan Widoyoningrum (2024) menggunakan algoritma genetika untuk menyusun jadwal bimbingan belajar secara otomatis. Di antara pendekatan yang tersedia, algoritma Greedy dipilih karena sederhana, cepat, dan mudah diaudit: setiap permintaan diurutkan menurut prioritasnya, lalu diberi slot terbaik yang tersedia dengan mematuhi kendala yang ditetapkan (Cormen, Leiserson, Rivest, & Stein, 2022).",
    "Berdasarkan permasalahan tersebut, Kerja Praktik ini mengembangkan aplikasi web penjadwalan konseling untuk UPA BK UTM. Aplikasi menerima pengajuan berupa teks keluhan beserta preferensi hari dan sesi, menilai urgensi secara otomatis menggunakan TF-IDF dan tiga algoritma klasifikasi (Multinomial Naive Bayes, SVM Linear, dan Logistic Regression), kemudian mengusulkan slot jadwal menggunakan mesin penjadwalan Greedy berbasis prioritas dengan kendala ketiadaan bentrok slot, kuota konselor per hari, serta tenggat layanan 48 jam untuk kelas DARURAT. Petugas UPA BK tetap memegang kendali akhir melalui panel pengelolaan untuk menyetujui, menolak, atau menyelesaikan permintaan, dan halaman evaluasi menyajikan metrik model serta metrik jadwal secara transparan.",
    "Melalui kegiatan ini diharapkan proses antrean layanan konseling menjadi lebih cepat, konsisten, dan dapat dipertanggungjawabkan, terutama untuk kasus berisiko tinggi yang harus didahulukan. Kegiatan Kerja Praktik ini sekaligus menjadi sarana penerapan pengetahuan klasifikasi teks, algoritma penjadwalan, dan rekayasa perangkat lunak web pada masalah nyata di lingkungan universitas.",
  ],
  rumusanIntro: "Berdasarkan latar belakang yang telah diuraikan, rumusan masalah dalam proyek ini adalah sebagai berikut:",
  rumusan: [
    "Bagaimana menerapkan tahapan pra-pemrosesan teks (normalisasi, *case folding*, tokenisasi, *stopword removal*, dan pemangkasan sufiks) pada keluhan konseling berbahasa Indonesia?",
    "Bagaimana menerapkan representasi fitur TF-IDF untuk mengubah teks keluhan menjadi vektor numerik yang dapat diproses oleh algoritma klasifikasi?",
    "Bagaimana membangun model klasifikasi urgensi tiga kelas (DARURAT, SEDANG, dan NORMAL) menggunakan algoritma Multinomial Naive Bayes, SVM Linear, dan Logistic Regression?",
    "Bagaimana kinerja ketiga model dalam mengklasifikasikan urgensi keluhan, diukur menggunakan *accuracy*, *precision*, *recall*, F1 makro, dan *confusion matrix*?",
    "Bagaimana merancang mesin penjadwalan Greedy berbasis prioritas klasifikasi dengan kendala ketiadaan bentrok slot, kuota konselor, dan tenggat layanan, serta mengintegrasikannya ke dalam aplikasi web?",
  ],
  tujuanIntro: "Tujuan dari proyek ini adalah:",
  tujuan: [
    "Menerapkan tahapan pra-pemrosesan teks bahasa Indonesia pada keluhan konseling mahasiswa.",
    "Menerapkan TF-IDF sebagai representasi fitur teks pada klasifikasi urgensi keluhan.",
    "Membangun dan membandingkan tiga model klasifikasi urgensi, yaitu Multinomial Naive Bayes, SVM Linear, dan Logistic Regression, untuk menentukan kelas DARURAT, SEDANG, atau NORMAL.",
    "Mengevaluasi kinerja ketiga model menggunakan *accuracy*, *precision*, *recall*, F1 makro, dan *confusion matrix*, lalu memilih model terbaik sebagai model produksi.",
    "Merancang mesin penjadwalan Greedy berbasis prioritas beserta aplikasi web yang mengintegrasikan pengajuan, klasifikasi, penjadwalan, dan evaluasi secara satu kesatuan.",
  ],
  manfaatIntro: "Proyek ini diharapkan memberikan manfaat bagi beberapa pihak, yaitu:",
  manfaat: [
    ["Bagi Penulis: ", "memperoleh pengalaman praktis menerapkan klasifikasi teks berbahasa Indonesia dan algoritma penjadwalan pada masalah nyata, mulai dari pra-pemrosesan data, ekstraksi fitur, pelatihan dan evaluasi model, perancangan mesin penjadwalan, hingga pengembangan aplikasi web dengan kerangka kerja modern. Kegiatan ini juga melatih kemampuan analisis, ketelitian, serta disiplin kerja dalam menyelesaikan proyek perangkat lunak secara end-to-end."],
    ["Bagi UPA BK UTM: ", "memperoleh purwarupa aplikasi penjadwalan konseling yang dapat membantu petugas menilai urgensi antrean secara konsisten, mengusulkan jadwal tanpa bentrok, serta memastikan kasus berisiko tinggi dilayani sesuai tenggat. Seluruh pengelolaan tetap berada di tangan petugas melalui panel pengelolaan, sehingga aplikasi berfungsi sebagai alat bantu dan bukan pengganti keputusan profesional."],
    ["Bagi Akademik: ", "menjadi referensi penerapan TF-IDF dan algoritma klasifikasi (Naive Bayes, SVM Linear, Logistic Regression) yang dikombinasikan dengan penjadwalan Greedy pada domain layanan bimbingan konseling perguruan tinggi, serta contoh integrasi metode penambangan data ke dalam aplikasi web yang dapat diakses publik."],
  ],
  batasanIntro: "Agar pembahasan terarah, proyek ini dibatasi pada hal-hal berikut:",
  batasan: [
    "Data yang digunakan adalah 147 contoh keluhan sintetis (dummy) berlabel yang ditulis meniru tema keluhan mahasiswa hasil survei kesejahteraan psikologis di lingkungan UPA BK UTM. Data layanan konseling asli bersifat rahasia sehingga tidak digunakan; identitas pada data demo juga seluruhnya fiktif.",
    "Fitur masukan model hanyalah teks keluhan yang diketik mahasiswa pada formulir pengajuan, dan label yang diprediksi adalah kelas urgensi (DARURAT, SEDANG, NORMAL).",
    "Klasifikasi dibatasi pada tiga kelas urgensi dengan komposisi dataset DARURAT 50 data, SEDANG 44 data, dan NORMAL 53 data.",
    "Pra-pemrosesan terdiri atas normalisasi kata tidak baku, *case folding*, tokenisasi, *stopword removal* (daftar stopword ringkas yang disusun sendiri), dan pemangkasan sufiks sederhana, tanpa pustaka stemming lengkap.",
    "Ekstraksi fitur menggunakan TF-IDF unigram dengan normalisasi vektor L2. Algoritma klasifikasi yang dibangun adalah Multinomial Naive Bayes, SVM Linear, dan Logistic Regression (softmax).",
    "Pembagian data menggunakan perbandingan 80:20 (data latih dan data uji) dengan teknik berstrata, dan pemilihan model produksi berdasarkan F1 makro tertinggi.",
    "Mesin penjadwalan bekerja pada horizon 10 hari kerja (Senin sampai Jumat), empat sesi per hari (S1, S2, S3, S4), kuota 2-3 konselor per hari, serta tenggat layanan DARURAT 48 jam; permintaan DARURAT boleh melampaui preferensi waktu dengan pencatatan eksplisit.",
    "Aplikasi dikembangkan menggunakan Next.js dengan TypeScript, Prisma sebagai pengakses basis data, serta basis data PostgreSQL pada lingkungan produksi. Aplikasi memuat model klasifikasi yang sudah terlatih di dalam kode dan tidak melatih ulang model saat runtime.",
    "Hasil klasifikasi hanya berfungsi sebagai alat bantu penentuan prioritas antrean dan bukan sebagai diagnosis klinis; keputusan akhir penjadwalan tetap berada pada petugas UPA BK.",
  ],
  sistematikaIntro: "Laporan proyek ini disusun dalam beberapa bab dengan sistematika sebagai berikut:",
  sistematika: [
    ["BAB I PENDAHULUAN", "Bab ini memuat gambaran umum mengenai pelaksanaan proyek yang meliputi latar belakang kegiatan, rumusan masalah, tujuan, manfaat, batasan masalah, serta sistematika penulisan laporan."],
    ["BAB II PROFIL LOKASI KERJA PRAKTIK", "Bab ini menjelaskan profil UPA Layanan Bimbingan Konseling Universitas Trunodjoyo Madura sebagai mitra Kerja Praktik serta deskripsi tugas yang dilaksanakan mahasiswa selama kegiatan berlangsung."],
    ["BAB III DASAR TEORI", "Bab ini menguraikan landasan teori yang mendukung pelaksanaan proyek, mencakup layanan bimbingan dan konseling perguruan tinggi, klasifikasi teks, pra-pemrosesan teks, TF-IDF, algoritma Naive Bayes, SVM Linear, Logistic Regression, metrik evaluasi klasifikasi, serta algoritma Greedy untuk penjadwalan."],
    ["BAB IV METODOLOGI", "Bab ini menjelaskan tahapan pelaksanaan proyek, mulai dari analisis kebutuhan, penyiapan dataset sintetis, pra-pemrosesan teks, ekstraksi fitur, pembangunan model klasifikasi, perancangan mesin penjadwalan Greedy, hingga pengembangan aplikasi dan pengujian, serta jadwal kegiatan."],
    ["BAB V HASIL DAN PEMBAHASAN", "Bab ini menyajikan hasil pengembangan aplikasi beserta tangkapan layarnya, metrik evaluasi ketiga model, hasil penjadwalan Greedy, serta pembahasan keterkaitan hasil dengan permasalahan dan tujuan proyek."],
    ["BAB VI KESIMPULAN DAN SARAN", "Bab ini berisi kesimpulan yang diperoleh berdasarkan hasil pelaksanaan proyek serta saran pengembangan untuk penerapan dan penelitian selanjutnya."],
  ],
};

const BAB2 = {
  profil1: [
    "Unit Penunjang Akademik (UPA) Layanan Bimbingan Konseling Universitas Trunodjoyo Madura, yang selanjutnya disebut UPA BK UTM, merupakan unit penunjang akademik yang bertugas menyediakan layanan bimbingan dan konseling bagi mahasiswa. Layanan yang disediakan mencakup konseling individual dan kelompok untuk persoalan pribadi-sosial, akademik, dan karier, kegiatan pencegahan berupa sosialisasi kesehatan mental, serta penguatan kapasitas mahasiswa melalui pelatihan *peer counseling*. Unit ini bekerja sama dengan para konselor berlatar psikologi yang melayani mahasiswa dari seluruh fakultas.",
    "Selain melayani pengajuan konseling secara langsung, UPA BK UTM juga aktif menjalankan kegiatan yang mendukung kesejahteraan mahasiswa, antara lain survei kesejahteraan psikologis menggunakan instrumen DASS-21, kampanye kesadaran kesehatan mental, dan pelatihan konselor sebaya. Kegiatan tersebut menghasilkan berbagai data dan pemahaman mengenai tema keluhan yang paling sering dialami mahasiswa, antara lain rindu keluarga, kecemasan berlebihan, kesulitan tidur, tekanan tugas akademik, hingga indikasi kegawatdaruratan psikologis yang membutuhkan penanganan segera.",
    "Dalam pelaksanaan Kerja Praktik, UPA BK UTM berperan sebagai mitra pengembangan aplikasi penjadwalan konseling. Karena catatan layanan konseling asli bersifat rahasia dan dilindungi untuk menjaga privasi mahasiswa, seluruh proses pengembangan menggunakan dataset sintetis (dummy) yang tema keluhannya ditulis meniru pola keluhan nyata hasil survei, sementara identitas pada data demo seluruhnya fiktif. Pendekatan ini memungkinkan pengembangan dan pengujian metode dilakukan dengan aman tanpa menyentuh data sensitif, dan aplikasi siap diadaptasi ke data asli apabila UPA BK menetapkan kebijakan penggunaannya.",
  ],
  jobdescIntro: "Selama pelaksanaan Kerja Praktik, mahasiswa melaksanakan kegiatan pengembangan sistem penjadwalan konseling menggunakan klasifikasi teks TF-IDF dan algoritma Greedy. Kegiatan berfokus pada pengolahan data keluhan, penerapan metode klasifikasi untuk menentukan urgensi, serta perancangan mesin penjadwalan yang menghasilkan usulan jadwal sesi. Adapun pekerjaan yang dilakukan selama pengembangan sistem meliputi beberapa tahapan berikut:",
  jobdesc: [
    ["Analisis Kebutuhan Sistem", "Melakukan identifikasi permasalahan antrean dan penjadwalan konseling pada layanan kampus, meliputi kebutuhan penilaian urgensi, kendala jadwal konselor, serta kebutuhan petugas dalam mengelola permintaan. Hasil analisis menjadi dasar perancangan fitur aplikasi dan aturan penjadwalan."],
    ["Persiapan dan Pengelolaan Data", "Menyusun dataset keluhan sintetis berlabel sebanyak 147 contoh yang tema keluhannya meniru hasil survei kesejahteraan psikologis, dibagi ke dalam tiga kelas urgensi (DARURAT 50 data, SEDANG 44 data, NORMAL 53 data), serta menyiapkan data demo konselor dan permintaan pengajuan untuk aplikasi."],
    ["Pra-pemrosesan Data Teks", "Membangun rangkaian pra-pemrosesan teks bahasa Indonesia yang meliputi normalisasi kata tidak baku, *case folding*, tokenisasi, penghapusan *stopword*, dan pemangkasan sufiks, agar teks keluhan memiliki format yang seragam sebelum diekstraksi menjadi fitur."],
    ["Implementasi Ekstraksi Fitur TF-IDF", "Menerapkan Term Frequency-Inverse Document Frequency (TF-IDF) untuk mengubah teks keluhan menjadi vektor numerik berbobot dengan normalisasi L2, sehingga kata-kata yang paling menandai tingkat urgensi memperoleh bobot lebih besar."],
    ["Implementasi Klasifikasi Tiga Model", "Mengembangkan tiga model klasifikasi, yaitu Multinomial Naive Bayes, SVM Linear (one-versus-rest), dan Logistic Regression (softmax), yang masing-masing dilatih pada data latih berstrata, kemudian membandingkan kinerjanya untuk memilih model produksi."],
    ["Perancangan Mesin Penjadwalan Greedy", "Merancang algoritma Greedy berbasis prioritas yang mengurutkan permintaan dari DARURAT, SEDANG, lalu NORMAL, mengusulkan slot pada horizon 10 hari kerja dengan kendala ketiadaan bentrok slot, kuota konselor per hari, tenggat 48 jam untuk DARURAT, serta pencatatan pelanggaran preferensi."],
    ["Pengembangan Aplikasi Web", "Mengintegrasikan seluruh komponen ke dalam aplikasi web Next.js dengan TypeScript dan Prisma, meliputi halaman pengajuan konseling, panel petugas untuk persetujuan dan penjadwalan, papan jadwal konselor, serta halaman evaluasi metode yang menyajikan metrik model dan simulasi penjadwalan."],
    ["Pengujian dan Evaluasi Sistem", "Melakukan pengujian fungsional terhadap alur pengajuan sampai penjadwalan, pengujian validasi bentrok dan kuota, serta evaluasi kuantitatif menggunakan metrik klasifikasi dan metrik penjadwalan untuk memastikan sistem bekerja sesuai perancangan."],
  ],
  jobdescPenutup: "Melalui kegiatan tersebut, mahasiswa memperoleh pengalaman dalam pengolahan data teks, penerapan ekstraksi fitur TF-IDF, pembangunan dan evaluasi model klasifikasi, perancangan algoritma penjadwalan, serta pengembangan aplikasi web yang mengintegrasikan semuanya menjadi sistem yang dapat digunakan.",
};

const BAB3 = {
  s31: [
    "Layanan bimbingan dan konseling di perguruan tinggi merupakan bagian dari penunjang akademik yang membantu mahasiswa mengatasi hambatan pribadi, sosial, belajar, dan karier. Amanat penyelenggaraannya diatur dalam Peraturan Menteri Riset, Teknologi, dan Pendidikan Tinggi Nomor 28 Tahun 2018 tentang Konselor Perguruan Tinggi, yang mewajibkan perguruan tinggi menyediakan layanan konseling bagi mahasiswa (Republik Indonesia, 2018). Layanan ini dilaksanakan oleh konselor profesional melalui sesi konseling yang dijadwalkan secara berkelanjutan.",
    "Pada praktiknya, layanan konseling menghadapi tantangan operasional berupa antrean permintaan yang datang tidak teratur dengan tingkat kepentingan yang beragam. Tidak semua permintaan memiliki urgensi yang sama: permintaan pengembangan diri dapat menunggu beberapa hari, sedangkan indikasi kegawatdaruratan psikologis harus segera ditangani. Kondisi ini menuntut mekanisme penilaian urgensi yang konsisten serta aturan penjadwalan yang menjamin permintaan paling penting dilayani paling cepat, sekaligus menjaga keseimbangan beban konselor.",
  ],
  s32: [
    "Klasifikasi teks adalah tugas *supervised learning* yang memetakan suatu dokumen teks ke salah satu kategori yang telah ditentukan. Pada tahap pembelajaran, algoritma membangun model dari data latih yang labelnya diketahui; pada tahap penerapan, model memprediksi kategori data baru (Hastie, Tibshirani, & Friedman, 2009). Kualitas model bergantung pada representasi fitur teks, kualitas dan keberagaman data latih, serta kesesuaian algoritma dengan karakteristik data.",
    "Pada proyek ini, dokumen yang diklasifikasikan adalah teks keluhan konseling mahasiswa, dan kategori yang diprediksi adalah tiga kelas urgensi, yaitu DARURAT untuk indikasi kegawatdaruratan psikologis, SEDANG untuk gangguan fungsional yang perlu sesi pada minggu berjalan, dan NORMAL untuk kebutuhan pengembangan diri atau konsultasi ringan. Karena teks keluhan umumnya pendek, informal, dan mengandung kata tidak baku, pra-pemrosesan yang tepat menjadi penentu kualitas representasi fitur.",
  ],
  s33: [
    "Pra-pemrosesan (*preprocessing*) merupakan tahap membersihkan dan menyeragamkan data teks sebelum ekstraksi fitur, yang bertujuan menghapus unsur yang tidak diperlukan dan menurunkan variasi penulisan sehingga proses klasifikasi lebih efektif (Manning, Raghavan, & Schütze, 2008). Tahapan umum pra-pemrosesan teks meliputi *case folding* untuk menyeragamkan huruf menjadi huruf kecil, tokenisasi untuk memecah teks menjadi satuan kata, penghapusan *stopword* untuk membuang kata fungsi yang tidak membawa makna urgensi, serta normalisasi dan penyesuaian bentuk kata.",
    "Pada proyek ini digunakan lima langkah pra-pemrosesan, yaitu normalisasi kata tidak baku menggunakan kamus ringkas (misalnya penggabungan kata yang terpisah-spasi atau penggantian varian penulisan), *case folding*, tokenisasi berbasis karakter alfanumerik, *stopword removal* menggunakan daftar stopword bahasa Indonesia yang disusun ringkas, serta pemangkasan sufiks sederhana (misalnya imbuhan umum seperti -nya, -kan, -an) untuk memperdekat variasi bentuk kata tanpa pustaka stemming lengkap. Pendekatan ringan ini dipilih agar seluruh pipeline dapat berjalan cepat di dalam aplikasi web tanpa dependensi berat.",
  ],
  s34: [
    "TF-IDF (*Term Frequency-Inverse Document Frequency*) merupakan metode pembobotan kata yang mengukur kepentingan suatu kata terhadap suatu dokumen dalam koleksi dokumen (Manning et al., 2008). Bobot ini menggabungkan dua komponen. Komponen pertama adalah frekuensi kata (*term frequency*, TF) yang menghitung seberapa sering kata t muncul pada dokumen d. Komponen kedua adalah frekuensi dokumen terbalik (*inverse document frequency*, IDF) yang menurunkan bobot kata yang muncul di hampir semua dokumen karena tidak bersifat pembeda. Nilai TF dan IDF dinyatakan pada Persamaan (1) dan Persamaan (2), sedangkan bobot TF-IDF dihitung pada Persamaan (3).",
  ],
  s35: [
    "Naive Bayes merupakan algoritma klasifikasi probabilistik yang membangun klasifikator berdasarkan teorema Bayes dengan asumsi sederhana (*naive*) bahwa fitur saling bebas secara kondisional terhadap kelas. Untuk dokumen d dan kelas c, model memilih kelas dengan probabilitas posterior terbesar sebagaimana Persamaan (4). Multinomial Naive Bayes memodelkan kemunculan kata menggunakan distribusi multinomial sehingga cocok untuk representasi frekuensi atau bobot kata pada teks (Hastie et al., 2009). Algoritma ini cepat dilatih, stabil pada data kecil, dan banyak digunakan untuk klasifikasi teks berbahasa Indonesia, termasuk pengaduan pelayanan yang mencapai akurasi 91% (Sunarti et al., 2024).",
  ],
  s36: [
    "Support Vector Machine (SVM) Linear mencari bidang pemisah (hiperbidang) yang memaksimalkan jarak (*margin*) antar kelas pada ruang fitur. Untuk masalah lebih dari dua kelas, pendekatan *one-versus-rest* (OvR) membangun satu klasifier biner per kelas, yang memprediksi berdasarkan nilai fungsi keputusan f(x) = w\u1D40x + b sebagaimana Persamaan (5) (Hastie et al., 2009). SVM dikenal baik pada ruang fitur berdimensi tinggi seperti TF-IDF karena relatif kebal terhadap overfitting pada data latih.",
    "Logistic Regression memodelkan probabilitas kelas menggunakan fungsi softmax untuk klasifikasi multikelas sebagaimana Persamaan (6). Model dilatih dengan meminimalkan *cross-entropy* sehingga menghasilkan probabilitas kalibrasi yang baik per kelas. Pada klasifikasi pengaduan pelayanan publik, Logistic Regression dengan fitur TF-IDF mencapai akurasi 88,94% dan Macro-F1 87,13%, menjadi model terbaik dibandingkan Naive Bayes, SVM, dan Random Forest (Suherman & Ismail, 2026). Karakter inilah yang menjadi salah satu dasar pengujian ketiga algoritma pada data keluhan konseling dalam proyek ini.",
  ],
  s37: [
    "Kinerja model klasifikasi dievaluasi menggunakan *confusion matrix* beserta metrik turunannya. *Accuracy* mengukur proporsi prediksi yang benar secara keseluruhan sebagaimana Persamaan (7). *Precision* per kelas mengukur ketepatan prediksi pada kelas tersebut sebagaimana Persamaan (8), *recall* per kelas mengukur cakupan kemampuan model menemukan seluruh contoh kelas sebagaimana Persamaan (9), dan F1-score merupakan rerata harmonik keduanya sebagaimana Persamaan (10).",
    "Karena dataset tidak selalu seimbang antarkelas, evaluasi utama menggunakan rata-rata makro (*macro average*), yaitu rata-rata metrik per kelas tanpa pembobotan jumlah data, sehingga kelas minoritas memiliki pengaruh yang setara. *Confusion matrix* juga digunakan untuk mengidentifikasi pola salah klasifikasi antarkelas, misalnya kasus SEDANG yang terprediksi DARURAT, yang pada domain layanan konseling memiliki konsekuensi operasional yang berbeda.",
  ],
  s38: [
    "Algoritma Greedy menyelesaikan masalah optimasi dengan membuat pilihan lokal terbaik pada setiap langkah dengan harapan mendekati solusi optimal global (Cormen et al., 2022). Pada masalah penjadwalan, pendekatan Greedy banyak digunakan karena sederhana dan cepat: antrean diurutkan menurut kriteria tertentu, lalu setiap item diberi sumber daya (slot) terbaik yang tersedia tanpa mengubah keputusan sebelumnya.",
    "Pada domain layanan konseling, algoritma berbasis prioritas telah diterapkan, antara lain sistem informasi bimbingan konseling yang memberi nilai prioritas pada setiap permohonan konseling (Nuramadanti et al., 2025) dan penjadwalan bimbingan konseling menggunakan algoritma Shortest Job First untuk menurunkan waktu tunggu (Fatyana et al., 2024). Pada domain lain, algoritma genetika juga digunakan untuk penjadwalan bimbingan belajar (Setiani et al., 2024), namun kompleksitasnya lebih tinggi. Pada proyek ini, Greedy dipilih dengan urutan prioritas hasil klasifikasi (DARURAT, SEDANG, NORMAL) dan pemecah seri berdasarkan waktu pengajuan lebih dulu (*first come first served*), dengan kendala slot, kuota, dan tenggat yang dijelaskan pada Bab IV.",
  ],
};

module.exports = { META, ABSTRAK, KATA_PENGANTAR, BAB1, BAB2, BAB3 };
