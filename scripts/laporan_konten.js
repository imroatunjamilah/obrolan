/**
 * Konten Laporan Kerja Praktik — Modul Penjadwalan Konseling UPA BK UTM.
 * Semua angka hasil pengujian berasal dari pipeline modul yang dijalankan
 * secara deterministik (scripts/metrik_laporan.ts) dan API evaluasi live.
 */

const JUDUL = 'Penerapan TF-IDF dan Algoritma Greedy pada Aplikasi Penjadwalan Konseling UPA BK Universitas Trunojoyo Madura';
const JUDUL_KAPS = 'PENERAPAN TF-IDF DAN ALGORITMA GREEDY PADA APLIKASI PENJADWALAN KONSELING UPA BK UNIVERSITAS TRUNOJOYO MADURA';
const JUDUL_BARIS = [
  'Penerapan TF-IDF dan Algoritma Greedy',
  'pada Aplikasi Penjadwalan Konseling',
  'UPA BK Universitas Trunojoyo Madura',
];
const JUDUL_KAPS_BARIS = [
  'PENERAPAN TF-IDF DAN',
  'ALGORITMA GREEDY PADA APLIKASI',
  'PENJADWALAN KONSELING UPA BK',
  'UNIVERSITAS TRUNOJOYO MADURA',
];

const ABSTRAK = 'Layanan konseling di perguruan tinggi menerima keluhan mahasiswa dengan urgensi yang bervariasi, sementara penjadwalan sesi masih dilakukan secara manual. Kerja Praktik ini membangun aplikasi penjadwalan konseling bagi UPA Bimbingan dan Konseling Universitas Trunojoyo Madura yang mengintegrasikan klasifikasi urgensi dan penjadwalan prioritas. Keluhan mahasiswa diproses melalui prapemrosesan teks dan representasi fitur TF-IDF, kemudian diklasifikasikan oleh tiga model (Naive Bayes, SVM linear, dan Logistic Regression) ke dalam prioritas DARURAT, SEDANG, atau NORMAL. Pada 147 data keluhan sintetis dengan pembagian 80:20 berstrata, Logistic Regression menjadi model terbaik dengan akurasi 86,67%, F1 makro 86,19%, dan recall 100% pada kelas DARURAT. Hasil klasifikasi menjadi masukan algoritma Greedy yang menetapkan slot konseling; pada simulasi 14 permintaan, seluruh permintaan terjadwal tanpa konflik slot dan seluruh kasus DARURAT terpenuhi dalam tenggat 48 jam. Aplikasi web siap digunakan sebagai alat bantu petugas UPA BK.';
const KATA_KUNCI = 'Kata kunci: TF-IDF, klasifikasi urgensi, Logistic Regression, algoritma Greedy, penjadwalan konseling.';

const KATA_PENGANTAR_1 = 'Puji syukur penulis panjatkan ke hadirat Tuhan Yang Maha Esa sehingga penulis dapat menyelesaikan Laporan Kerja Praktik berjudul Penerapan TF-IDF dan Algoritma Greedy pada Aplikasi Penjadwalan Konseling UPA BK Universitas Trunojoyo Madura. Laporan ini menjadi bentuk pertanggungjawaban pelaksanaan Kerja Praktik pada UPA BK Universitas Trunojoyo Madura, mulai dari analisis kebutuhan layanan hingga pengembangan dan pengujian aplikasi web.';
const KATA_PENGANTAR_2 = 'Penulis mengucapkan terima kasih kepada orang tua dan keluarga atas dukungannya, Ibu Ika Oktavia Suzanti, S.Kom., M.Cs. selaku dosen pembimbing, serta Ibu Hera Wahyuni selaku Kepala UPA Bimbingan dan Konseling beserta seluruh pihak yang membantu kegiatan ini. Kritik dan saran yang membangun sangat diharapkan, dan semoga laporan ini bermanfaat bagi pembaca.';

// ---------------------------------------------------------------- BAB I
const BAB1 = {
  judul: ['PENDAHULUAN'],
  latar: [
    'Kesehatan mental mahasiswa menjadi perhatian penting perguruan tinggi karena masa studi menuntut kemampuan adaptasi terhadap beban akademik, relasi sosial yang baru, dan kemandirian hidup di lingkungan kampus. Berbagai tekanan tersebut dapat memunculkan kecemasan, stres, hingga persoalan yang lebih berat apabila tidak mendapat penanganan dini. Unit Penunjang Akademik (UPA) Bimbingan dan Konseling Universitas Trunojoyo Madura hadir sebagai unit layanan yang menyediakan ruang konseling dan pendampingan bagi mahasiswa dengan prinsip memberikan ruang aman agar mahasiswa dapat didengar tanpa dihakimi (Universitas Trunojoyo Madura, 2026).',
    'Kebutuhan layanan tersebut terlihat dari hasil survei kesehatan mental yang dilaksanakan tim riset bersama UPA BK menggunakan instrumen Depression Anxiety Stress Scales-21 (DASS-21) (Lovibond & Lovibond, 1995). Dari 449 respons mahasiswa yang terkumpul, 434 respons dianalisis dan menunjukkan bahwa 128 responden atau 29,5% berada pada kategori kecemasan Berat hingga Sangat Berat. Rata-rata skor kecemasan sebesar 11,89 lebih tinggi dibandingkan rata-rata skor depresi maupun stres pada populasi yang sama. Keluhan yang paling sering disebutkan antara lain rasa rindu keluarga (21,7%) dan kecemasan berlebih atau overthinking (11,3%), sedangkan mayoritas responden (60,8%) masih berada pada kategori stres Normal. Angka tersebut menegaskan bahwa permintaan layanan konseling di lingkungan kampus cukup tinggi dan terdiri atas campuran kasus ringan, sedang, hingga berat.',
    'Pada praktik yang berjalan, pengajuan konseling masih dilakukan secara manual dan penjadwalan sesi umumnya mengikuti urutan kedatangan permintaan. Akibatnya, keluhan yang menyerupai gawatdaruratan psikologis dapat tertunda penanganannya hanya karena masuk lebih lambat, sementara petugas harus membaca setiap keluhan satu per satu untuk menilai tingkat urgensinya. Penilaian manual bersifat subjektif, memakan waktu, dan rentan tidak konsisten ketika volume pengajuan meningkat, mengingat jumlah konselor serta slot sesi yang tersedia sangat terbatas.',
    'Klasifikasi teks otomatis merupakan pendekatan yang telah terbukti membantu penanganan pengaduan layanan. Suherman dan Ismail (2026) mengklasifikasikan prioritas pengaduan pelayanan publik menggunakan TF-IDF dengan beberapa algoritma pembelajaran mesin dan menemukan bahwa Logistic Regression memberikan hasil terbaik berupa accuracy 88,94% dan macro-F1 87,13%. Sunarti et al. (2024) mengklasifikasikan pengaduan pelayanan di lingkungan fakultas menggunakan Naive Bayes dan memperoleh akurasi 91%. Meskipun demikian, kinerja model dapat berbeda antardataset; Muhammad et al. (2026) mencatat Naive Bayes pada data pengaduan masyarakat yang tidak seimbang hanya mencapai akurasi 86,76% dengan presisi 58% sebelum dilakukan penanganan ketidakseimbangan data. Temuan tersebut menunjukkan perlunya membandingkan lebih dari satu algoritma ketika data layanan konseling memiliki kelas yang tidak seimbang.',
    'Pada sisi penjadwalan, sejumlah penelitian telah menerapkan algoritma optimasi. Fatyana et al. (2024) menerapkan algoritma Shortest Job First pada penjadwalan bimbingan konseling untuk memperpendek waktu tunggu, sementara Setiani et al. (2024) menggunakan Algoritma Genetika pada penjadwalan bimbingan belajar berbasis web. Wijaya et al. (2026) menunjukkan bahwa algoritma Greedy dengan mekanisme prioritas berjenjang mampu memilih kandidat terbaik pada setiap langkah penugasan secara cepat dan mudah dijelaskan. Akan tetapi, sistem informasi bimbingan konseling yang ada, seperti sistem pencatatan berbasis web (Nuramadanti et al., 2025) maupun sistem reservasi konseling dengan chatbot (Vanessa & Avianto, 2026), umumnya berhenti pada pencatatan dan reservasi jadwal tanpa mengintegrasikan klasifikasi urgensi keluhan. Aplikasi komersial layanan konseling seperti Riliv (2026) berfokus pada layanan berbayar bagi pengguna umum sehingga kurang sesuai dengan alur, kebijakan, dan kendali petugas pada layanan unit konseling kampus.',
    'Berdasarkan permasalahan tersebut, Kerja Praktik ini mengembangkan aplikasi penjadwalan konseling untuk UPA BK yang menggabungkan dua komponen utama. Komponen pertama adalah klasifikasi urgensi otomatis berbasis TF-IDF dengan tiga model klasifikasi, yaitu Naive Bayes, SVM linear, dan Logistic Regression, yang menetapkan prioritas DARURAT, SEDANG, atau NORMAL atas setiap keluhan. Komponen kedua adalah penjadwalan sesi konseling menggunakan algoritma Greedy berbasis prioritas: kasus DARURAT didahulukan dalam tenggat 48 jam meskipun harus melewati preferensi waktu mahasiswa, kasus SEDANG diupayakan pada minggu berjalan, dan kasus NORMAL mengikuti preferensi hari serta sesi sepanjang kuota konselor tidak terlampaui. Seluruh komponen diimplementasikan menjadi aplikasi web sehingga mahasiswa dapat mengajukan konseling secara daring dan petugas UPA BK dapat menetapkan jadwal melalui panel yang menyertai usulan sistem.',
  ],
  rumusanIntro: 'Berdasarkan latar belakang yang telah diuraikan, rumusan masalah dalam Kerja Praktik ini adalah sebagai berikut:',
  rumusan: [
    'Bagaimana menerapkan prapemrosesan teks berbahasa Indonesia dan representasi fitur TF-IDF pada teks keluhan konseling mahasiswa?',
    'Bagaimana membangun tiga model klasifikasi urgensi (Naive Bayes, SVM linear, dan Logistic Regression) dengan kelas DARURAT, SEDANG, dan NORMAL, serta memilih model terbaik berdasarkan akurasi, presisi, recall, dan F1 makro?',
    'Bagaimana merancang algoritma Greedy berbasis prioritas untuk menetapkan slot konseling tanpa bentrok slot, tanpa melebihi kuota konselor, dan mematuhi tenggat 48 jam untuk kasus DARURAT?',
    'Bagaimana mengukur kinerja keseluruhan sistem, baik pada sisi klasifikasi maupun sisi penjadwalan, menggunakan metrik evaluasi yang sesuai?',
    'Bagaimana mengimplementasikan model dan algoritma yang dikembangkan ke dalam aplikasi web yang dapat digunakan mahasiswa dan petugas UPA BK?',
  ],
  tujuanIntro: 'Tujuan dari Kerja Praktik ini adalah:',
  tujuan: [
    'Menerapkan tahapan prapemrosesan teks berbahasa Indonesia dan representasi fitur TF-IDF pada teks keluhan konseling mahasiswa.',
    'Membangun model Naive Bayes, SVM linear, dan Logistic Regression untuk mengklasifikasikan urgensi keluhan ke dalam kelas DARURAT, SEDANG, dan NORMAL, kemudian memilih model terbaik berdasarkan akurasi, presisi, recall, dan F1 makro.',
    'Merancang dan mengimplementasikan algoritma Greedy berbasis prioritas yang menetapkan slot konseling tanpa bentrok slot, tanpa melebihi kuota konselor, dan mematuhi tenggat 48 jam untuk kasus DARURAT.',
    'Mengevaluasi kinerja klasifikasi menggunakan akurasi, presisi, recall, F1 makro, dan matriks kebingungan, serta mengevaluasi hasil penjadwalan menggunakan tingkat terjadwal, kepatuhan tenggat, waktu tunggu, dan beban konselor.',
    'Mengimplementasikan hasil penelitian ke dalam aplikasi web yang memuat alur pengajuan mahasiswa, hasil klasifikasi, usulan jadwal, dan panel penetapan jadwal bagi petugas UPA BK.',
  ],
  manfaatIntro: 'Manfaat yang diharapkan dari Kerja Praktik ini adalah:',
  manfaat: [
    ['Bagi Penulis:', ' Memperoleh pengalaman praktis menerapkan klasifikasi teks berbahasa Indonesia dan algoritma penjadwalan pada kasus nyata layanan kampus, mulai dari penyusunan data, pembangunan model, penjadwalan berbasis prioritas, hingga implementasi aplikasi web. Kegiatan ini juga meningkatkan kemampuan analitis dan keterampilan pengembangan perangkat lunak secara end-to-end.'],
    ['Bagi UPA Bimbingan dan Konseling:', ' Memiliki alat bantu digital yang menyaring urgensi keluhan secara instan dan menyusulkan jadwal konseling tanpa bentrok slot maupun pelanggaran kuota. Petugas tetap memegang kendali keputusan akhir, tetapi proses penilaian urgensi dan penyusunan jadwal menjadi lebih cepat, konsisten, dan terdokumentasi, khususnya untuk kasus yang memerlukan penanganan segera.'],
    ['Bagi Akademik:', ' Menjadi referensi penerapan TF-IDF dan algoritma Greedy pada domain layanan bimbingan konseling perguruan tinggi, serta contoh integrasi klasifikasi urgensi dengan penjadwalan prioritas dalam satu aplikasi yang dapat dikembangkan lebih lanjut oleh peneliti atau mahasiswa lain.'],
  ],
  batasanIntro: 'Agar pembahasan terarah, Kerja Praktik ini dibatasi pada hal-hal berikut:',
  batasan: [
    'Data yang digunakan adalah dataset keluhan sintetis (dummy) berlabel sebanyak 147 data yang ditulis meniru tema keluhan mahasiswa berdasarkan hasil survei DASS-21, tanpa memuat data skrining maupun identitas mahasiswa yang sebenarnya.',
    'Fitur masukan model adalah teks keluhan yang diketik mahasiswa pada formulir pengajuan, sedangkan label yang diprediksi adalah kelas urgensi.',
    'Klasifikasi dibatasi pada tiga kelas, yaitu DARURAT (50 data), SEDANG (44 data), dan NORMAL (53 data).',
    'Prapemrosesan terdiri atas normalisasi kata tidak baku, case folding, tokenisasi, stopword removal dengan daftar stopword Indonesia, dan pemangkasan sufiks sederhana; stemming penuh tidak digunakan agar pipeline tetap ringan dan deterministik.',
    'Ekstraksi fitur menggunakan TF-IDF ternormalisasi L2. Algoritma yang dibangun adalah Naive Bayes Multinomial, SVM linear One-vs-Rest, dan Logistic Regression softmax; model terbaik dipilih berdasarkan F1 makro dan digunakan untuk prediksi pengajuan baru.',
    'Pembagian data menggunakan rasio 80:20 secara stratified, menghasilkan 117 data latih dan 30 data uji, tanpa cross-validation tambahan.',
    'Penjadwalan Greedy bekerja pada horizon 10 hari kerja dengan lima hari layanan per minggu (Senin–Jumat), empat sesi per hari (S1–S4), dan empat konselor dummy dengan kuota harian 3, 3, 2, dan 3 sesi sehingga kapasitas total 110 slot. Kasus DARURAT dikenai tenggat 48 jam dan boleh melewati preferensi waktu dengan pencatatan.',
    'Aplikasi dikembangkan sebagai aplikasi web dengan Next.js, TypeScript, Tailwind CSS, dan Prisma (SQLite pada pengembangan, PostgreSQL pada produksi). Hasil klasifikasi bersifat alat bantu petugas dan bukan diagnosis klinis; penetapan jadwal final tetap pada petugas UPA BK.',
  ],
  sistematika: [
    ['BAB I PENDAHULUAN', ' Memuat latar belakang kegiatan, rumusan masalah, tujuan, manfaat, batasan masalah, serta sistematika penulisan laporan.'],
    ['BAB II PROFIL LOKASI KERJA PRAKTIK', ' Menjelaskan profil UPA Bimbingan dan Konseling Universitas Trunojoyo Madura beserta deskripsi pekerjaan yang dilaksanakan mahasiswa selama Kerja Praktik.'],
    ['BAB III DASAR TEORI', ' Menguraikan landasan teori layanan bimbingan dan konseling, klasifikasi teks, prapemrosesan, TF-IDF, Naive Bayes, SVM, Logistic Regression, algoritma Greedy, serta metrik evaluasi.'],
    ['BAB IV METODOLOGI', ' Menjelaskan tahapan pelaksanaan Kerja Praktik mulai dari analisis kebutuhan, penyusunan dataset, prapemrosesan, ekstraksi fitur, pembangunan model, perancangan penjadwalan, implementasi aplikasi, serta jadwal kegiatan.'],
    ['BAB V HASIL DAN PEMBAHASAN', ' Menyajikan tampilan dan fungsi aplikasi yang dibangun, hasil evaluasi ketiga model, hasil penjadwalan Greedy, serta pembahasan keterkaitan hasil dengan tujuan Kerja Praktik.'],
    ['BAB VI KESIMPULAN DAN SARAN', ' Berisi kesimpulan atas hasil pelaksanaan Kerja Praktik dan saran pengembangan lebih lanjut.'],
  ],
};

// ---------------------------------------------------------------- BAB II
const BAB2 = {
  judul: ['PROFIL LOKASI KERJA PRAKTIK'],
  profil1: [
    'Unit Penunjang Akademik (UPA) Bimbingan dan Konseling Universitas Trunojoyo Madura, selanjutnya disebut UPA BK, merupakan unit penunjang akademik yang bertugas menyelenggarakan layanan bimbingan dan konseling bagi mahasiswa. Unit ini dipimpin oleh Kepala UPA BK dan bekerja sama dengan dosen, tenaga kependidikan, serta tenaga layanan kesehatan di lingkungan kampus. Selama pelaksanaan Kerja Praktik, UPA BK berperan sebagai lokasi Kerja Praktik sekaligus pengguna utama aplikasi yang dikembangkan.',
    'Fungsi utama UPA BK adalah menyediakan layanan konseling dan pendampingan bagi mahasiswa agar dapat menata kehidupan secara lebih sehat dan terarah. Kepala UPA BK, Hera Wahyuni, menyatakan bahwa banyak mahasiswa datang dengan luka yang tidak terlihat sehingga membutuhkan ruang aman untuk didengar tanpa dihakimi, dan bahwa konseling hadir memberi makna agar hidup lebih tertata dan maju (Universitas Trunojoyo Madura, 2026). Prinsip tersebut menjadi arah layanan unit, yaitu membangun budaya kampus yang peduli kesehatan mental dan memperkuat ekosistem pendidikan yang humanis.',
    'Selama tahun 2026, UPA BK aktif menggelar kegiatan penguatan layanan. Kegiatan tersebut antara lain berupa Workshop Peningkatan Kemampuan Konseling Dasar bagi dosen, tenaga kependidikan, dan tenaga layanan kesehatan pada April 2026, sosialisasi layanan konseling di asrama mahasiswa, serta kampanye kesadaran bahaya perundungan terhadap diri sendiri atau self-injury yang menjangkau mahasiswa di seluruh program studi. Kegiatan-kegiatan ini menunjukkan bahwa UPA BK tidak hanya melayani konseling individual, tetapi juga membangun kesadaran kesehatan mental secara kampus luas.',
    'Dalam mendukung perencanaan layanan, tim riset bersama UPA BK melaksanakan survei kesehatan mental mahasiswa menggunakan instrumen DASS-21 yang mengumpulkan 449 respons. Hasil survei menunjukkan 29,5% responden berada pada kategori kecemasan Berat hingga Sangat Berat dengan keluhan dominan berupa rindu keluarga dan kecemasan berlebih. Temuan tersebut menjadi dasar pengembangan modul penjadwalan konseling pada Kerja Praktik ini, yaitu memastikan keluhan dengan indikasi berat dapat ditangani lebih cepat daripada keluhan ringan.',
    'Selama Kerja Praktik berlangsung, seluruh kegiatan pengembangan aplikasi dilakukan secara berkelanjutan dengan arahan dosen pembimbing dan koordinasi dengan UPA BK. Aplikasi yang dihasilkan dirancang mengikuti alur layanan UPA BK: mahasiswa mengajukan konseling dengan menuliskan keluhannya, sistem mengklasifikasikan urgensi dan menyusulkan slot jadwal, kemudian petugas menetapkan jadwal final melalui panel petugas.',
  ],
  jdIntro: 'Selama pelaksanaan Kerja Praktik, mahasiswa melaksanakan kegiatan pengembangan sistem penjadwalan konseling menggunakan klasifikasi urgensi berbasis TF-IDF dan algoritma Greedy. Kegiatan ini berfokus pada pengolahan teks keluhan, pembangunan model klasifikasi, serta implementasi aplikasi web yang menunjang alur layanan UPA BK. Adapun pekerjaan yang dilakukan meliputi beberapa tahapan berikut:',
  jd: [
    ['Analisis Kebutuhan Layanan', ' Mengidentifikasi alur pengajuan konseling yang berjalan di UPA BK, kendala penilaian urgensi manual, serta kebutuhan petugas terhadap alat bantu digital. Tahap ini menghasilkan spesifikasi kelas urgensi (DARURAT, SEDANG, NORMAL), aturan tenggat penanganan, dan kebutuhan slot sesi konseling.'],
    ['Penyusunan Dataset Keluhan Sintetis', ' Menyusun dataset keluhan sintetis berlabel sebanyak 147 data yang ditulis meniru tema keluhan mahasiswa hasil survei, tanpa menggunakan data asli mahasiswa. Dataset diatur agar distribusi kelas memperlihatkan ketidakseimbangan yang serupa dengan kondisi nyata.'],
    ['Prapemrosesan Teks', ' Menerapkan normalisasi kata tidak baku, case folding, tokenisasi, penghapusan stopword, dan pemangkasan sufiks sederhana pada teks keluhan agar data bersih dan siap diubah menjadi fitur numerik.'],
    ['Implementasi Ekstraksi Fitur TF-IDF', ' Membangun perhitungan bobot Term Frequency-Inverse Document Frequency dengan normalisasi L2 sehingga setiap keluhan direpresentasikan sebagai vektor fitur yang dapat diproses model klasifikasi.'],
    ['Pembangunan dan Pelatihan Model Klasifikasi', ' Mengimplementasikan tiga algoritma klasifikasi, yaitu Naive Bayes Multinomial, SVM linear One-vs-Rest, dan Logistic Regression softmax, kemudian melatihnya pada data latih dan mengujinya pada data uji yang terpisah.'],
    ['Evaluasi dan Pemilihan Model Terbaik', ' Menghitung akurasi, presisi makro, recall makro, F1 makro, metrik per kelas, dan matriks kebingungan untuk setiap model, kemudian memilih model dengan F1 makro terbaik sebagai model produksi.'],
    ['Perancangan Penjadwalan Greedy', ' Merancang algoritma Greedy berbasis prioritas dengan aturan tenggat 48 jam untuk kasus DARURAT, penghormatan preferensi waktu untuk kasus ringan, pencegahan bentrok slot, pembatasan kuota harian konselor, pencatatan jejak keputusan, dan perhitungan metrik penjadwalan.'],
    ['Implementasi Aplikasi Web dan Pengujian', ' Membangun aplikasi web dengan Next.js, TypeScript, Tailwind CSS, dan Prisma, memuat halaman pengajuan, panel petugas, dan halaman evaluasi metode, kemudian menguji seluruh alur secara fungsional dan menerapkan aplikasi ke lingkungan produksi.'],
  ],
  jdClosing: 'Melalui kegiatan tersebut, mahasiswa memperoleh pengalaman pengolahan teks berbahasa Indonesia, pembangunan model klasifikasi, perancangan penjadwalan berbasis prioritas, serta pengembangan dan penerapan aplikasi web untuk kebutuhan nyata unit layanan kampus.',
};

// ---------------------------------------------------------------- BAB III
const BAB3 = {
  judul: ['DASAR TEORI'],
  bagian: [
    ['1. Layanan Bimbingan dan Konseling di Perguruan Tinggi', [
      'Bimbingan dan konseling perguruan tinggi merupakan layanan bantu yang diberikan unit khusus kepada mahasiswa untuk mengembangkan potensi diri dan mengatasi persoalan pribadi, sosial, belajar, maupun karier. Layanan konseling individual dilakukan melalui percakapan terstruktur antara konselor dan mahasiswa (klien) dengan jadwal yang diatur sesuai ketersediaan konselor. Pada unit konseling kampus, jumlah konselor dan slot sesi biasanya jauh lebih kecil dibandingkan jumlah mahasiswa yang dilayani, sehingga mekanisme prioritas diperlukan agar kasus dengan risiko tinggi ditangani lebih dahulu.',
      'Kondisi psikologis mahasiswa dapat diukur menggunakan instrumen baku, salah satunya Depression Anxiety Stress Scales (DASS). DASS-21 merupakan versi ringkas dengan 21 item yang mengukur tiga dimensi, yaitu depresi, kecemasan, dan stres, dengan rentang skor pada setiap dimensi dan ambang kategori normal hingga sangat berat (Lovibond & Lovibond, 1995). Instrumen ini digunakan pada survei yang menjadi konteks Kerja Praktik ini untuk memperkirakan kebutuhan layanan konseling di kampus.',
    ]],
    ['2. Klasifikasi Teks', [
      'Klasifikasi merupakan proses pada data mining yang bertujuan menemukan hubungan antar atribut dan menentukan label kelas dari sampel yang akan diklasifikasikan (Ajijah & Kurniawan, 2023). Klasifikasi teks menerapkan proses tersebut pada data dokumen: algoritma membangun model dari data latih yang labelnya telah diketahui, kemudian model memprediksi label pada data baru. Pada kasus layanan konseling, teks keluhan menjadi masukan dan label yang diprediksi adalah tingkat urgensi penanganan.',
      'Pembelajaran mesin terawasi untuk klasifikasi teks memerlukan dua tahap utama, yaitu pembelajaran (learning) pada fase pelatihan dan pengujian (classification) pada fase prediksi. Kualitas hasil sangat dipengaruhi oleh kualitas data latih, keseimbangan kelas, serta kesesuaian representasi fitur dengan algoritma yang digunakan (Hastie et al., 2009).',
    ]],
    ['3. Prapemrosesan Teks', [
      'Prapemrosesan (preprocessing) merupakan teknik penting dalam analisis klasifikasi teks untuk membersihkan data dari unsur yang tidak dibutuhkan sehingga mempercepat proses klasifikasi (Candra & Nanda Rozana, 2020). Tahapan umum meliputi case folding untuk menyamakan huruf menjadi huruf kecil, tokenisasi untuk memisahkan teks menjadi satuan kata, penghapusan stopword yang kurang bermakna, serta stemming untuk mengubah kata ke bentuk dasarnya.',
      'Pada Kerja Praktik ini digunakan lima tahap yang disesuaikan dengan kebutuhan pipeline: normalisasi kata tidak baku dan singkatan umum, case folding, tokenisasi, stopword removal dengan daftar kata fungsi Indonesia, serta pemangkasan sufiks sederhana (misalnya imbuhan -nya, -an, -kan pada kasus tertentu). Stemming penuh tidak diterapkan agar proses tetap ringan, deterministik, dan mudah dijelaskan pada aplikasi web.',
    ]],
    ['4. TF-IDF', [
      'Term Frequency-Inverse Document Frequency (TF-IDF) merupakan metode pembobotan kata yang mengukur tingkat kepentingan sebuah kata terhadap dokumen dalam koleksi dokumen (Rikky et al., 2024). Komponen Term Frequency (TF) menghitung frekuensi kemunculan kata pada suatu dokumen, sedangkan komponen Inverse Document Frequency (IDF) menurunkan bobot kata yang muncul di hampir semua dokumen. Bobot akhir diperoleh dari perkalian kedua komponen tersebut.',
      'Hasil ekstraksi TF-IDF berupa vektor numerik berdimensi sejumlah kosakata unik. Vektor umumnya jarang (sparse) karena setiap teks hanya memuat sebagian kecil kosakata. Pada pipeline Kerja Praktik ini, vektor TF-IDF dinormalisasi L2 agar panjang vektor setiap dokumen seragam sehingga perbandingan antarkeluhan lebih stabil.',
    ]],
    ['5. Naive Bayes', [
      'Naive Bayes adalah pengklasifikasi probabilistik yang bekerja berdasarkan teorema Bayes dengan asumsi independensi antar fitur. Untuk data teks berbobot, digunakan varian Multinomial Naive Bayes yang menghitung peluang kelas dari penjumlahan bobot term pada masing-masing kelas. Algoritma ini sederhana, cepat, dan sering digunakan pada klasifikasi pengaduan serta sentimen; Sunarti et al. (2024) memperoleh akurasi 91% pada klasifikasi pengaduan pelayanan fakultas.',
      'Keterbatasan Naive Bayes terletak pada asumsi independensi yang jarang terpenuhi serta sensitivitas terhadap ketidakseimbangan kelas. Muhammad et al. (2026) mencatat akurasi dan presisi Naive Bayes menurun pada data pengaduan yang tidak seimbang sebelum dilakukan penanganan khusus, sehingga hasilnya perlu dibandingkan dengan algoritma lain pada setiap dataset.',
    ]],
    ['6. Support Vector Machine', [
      'Support Vector Machine (SVM) merupakan algoritma pembelajaran terawasi yang mencari hyperplane dengan margin maksimum sebagai pemisah antarkelas (Cortes & Vapnik, 1995). Titik data terdekat dengan hyperplane disebut support vector. Untuk klasifikasi banyak kelas, SVM diterapkan dalam skema One-vs-Rest (OvR) yang membangun satu pengklasifikasi biner per kelas; hasil prediksi dipilih dari kelas dengan skor tertinggi.',
      'SVM linear bekerja baik pada data berdimensi tinggi seperti vektor TF-IDF karena ruang fitur yang jarang dan luas. Keluaran skor pada setiap pengklasifikasi biner dapat diperhalus menjadi nilai yang menyerupai peluang melalui normalisasi sehingga sistem dapat menampilkan tingkat keyakinan kepada pengguna.',
    ]],
    ['7. Logistic Regression', [
      'Logistic Regression merupakan model probabilistik yang memodelkan peluang suatu kelas sebagai fungsi logistik dari kombinasi linear fitur (Hastie et al., 2009). Untuk klasifikasi lebih dari dua kelas digunakan bentuk multinomial (softmax) yang menghitung peluang setiap kelas melalui fungsi softmax atas skor linear, kemudian kelas dengan peluang tertinggi dipilih sebagai prediksi.',
      'Model dilatih dengan memaksimalkan likelihood melalui penurunan gradien pada data latih. Logistic Regression dikenal stabil pada data teks berdimensi tinggi, memberikan peluang kalibratif yang mudah ditampilkan kepada pengguna, dan parameternya mudah diatur untuk mengurangi overfitting melalui regularisasi.',
    ]],
    ['8. Algoritma Greedy', [
      'Algoritma Greedy menyelesaikan persoalan optimasi dengan memilih pilihan yang tampak terbaik pada setiap langkah tanpa mempertimbangkan ulang keputusan sebelumnya (Cormen et al., 2009). Pendekatan ini cepat, mudah diimplementasikan, dan mudah dijelaskan karena setiap keputusan dapat dicatat sebagai jejak, meskipun tidak menjamin solusi optimal global. Greedy banyak digunakan pada penjadwalan, seperti penjadwalan praktikum dan penjadwalan asisten laboratorium berbasis kompetensi dengan prioritas berjenjang (Wijaya et al., 2026).',
      'Pada Kerja Praktik ini, Greedy mengurutkan permintaan berdasarkan prioritas (DARURAT lebih dahulu, kemudian SEDANG, lalu NORMAL) dan waktu pengajuan. Setiap permintaan dicocokkan dengan slot terbaik yang tersedia sesuai aturan tenggat, preferensi waktu, anti-bentrok slot, dan kuota konselor harian. Jika slot terbaik tidak tersedia, dilakukan pencarian alternatif dengan pencatatan pelanggaran preferensi.',
    ]],
    ['9. Metrik Evaluasi Klasifikasi dan Penjadwalan', [
      'Kinerja klasifikasi diukur menggunakan confusion matrix yang membandingkan kelas aktual dan kelas prediksi. Dari matriks tersebut dihitung accuracy (proporsi prediksi benar keseluruhan), precision (ketepatan prediksi per kelas), recall (cakupan kelas aktual yang benar diprediksi), dan F1-score sebagai rata-rata harmonik precision dan recall. Pada data tidak seimbang, nilai makro (rata-rata antarkelas) lebih mencerminkan kinerja daripada akurasi global karena setiap kelas diberi bobot sama.',
      'Kinerja penjadwalan diukur menggunakan metrik operasional, yaitu tingkat permintaan terjadwal, jumlah konflik slot yang harus nol, jumlah pelanggaran preferensi, kepatuhan tenggat penanganan (khususnya 48 jam untuk kasus DARURAT), rata-rata dan maksimum waktu tunggu per prioritas, serta distribusi beban antarkonselor. Gabungan metrik klasifikasi dan penjadwalan memberi gambaran utuh mengenai kesiapan sistem sebagai alat bantu petugas.',
    ]],
  ],
};

module.exports = { JUDUL, JUDUL_KAPS, JUDUL_BARIS, JUDUL_KAPS_BARIS, ABSTRAK, KATA_KUNCI, KATA_PENGANTAR_1, KATA_PENGANTAR_2, BAB1, BAB2, BAB3 };
