/**
 * Konten Laporan KP — bagian 2: BAB IV, BAB V, BAB VI, Daftar Pustaka, data tabel.
 */

const BAB4 = {
  judul: ['METODOLOGI'],
  intro: [
    'Pelaksanaan Kerja Praktik dilakukan dengan menerapkan pengetahuan yang diperoleh selama perkuliahan untuk menyelesaikan permasalahan pada layanan konseling UPA Bimbingan dan Konseling (UPA BK) Universitas Trunojoyo Madura. Permasalahan yang menjadi dasar pengembangan adalah belum adanya mekanisme penilaian urgensi otomatis atas keluhan mahasiswa sehingga penjadwalan sesi konseling bergantung pada urutan kedatangan permintaan dan kemampuan petugas membaca setiap pengajuan secara manual.',
    'Berdasarkan permasalahan tersebut, dikembangkan aplikasi penjadwalan konseling dengan dua komponen utama. Komponen klasifikasi menggunakan prapemrosesan teks dan TF-IDF untuk mengubah keluhan menjadi vektor fitur, kemudian tiga algoritma klasifikasi (Naive Bayes, SVM linear, dan Logistic Regression) dibandingkan untuk menetapkan prioritas DARURAT, SEDANG, atau NORMAL. Komponen penjadwalan menggunakan algoritma Greedy berbasis prioritas untuk menetapkan slot sesi pada kalender layanan tanpa bentrok slot dan tanpa melebihi kuota konselor. Kedua komponen diimplementasikan dalam satu aplikasi web yang menunjang alur kerja petugas UPA BK.',
  ],
  tahapanIntro: 'Tahapan kegiatan merupakan rangkaian proses yang dilakukan untuk menyelesaikan permasalahan selama pelaksanaan Kerja Praktik. Tahapan dimulai dari analisis kebutuhan layanan, penyusunan dataset sintetis, prapemrosesan teks, ekstraksi fitur TF-IDF, pembangunan dan evaluasi model, perancangan penjadwalan Greedy, hingga implementasi aplikasi web. Adapun tahapan kegiatan yang dilakukan adalah sebagai berikut:',
  tahapan: [
    ['Analisis Permasalahan dan Kebutuhan Layanan', 'Tahap pertama dilakukan dengan mengidentifikasi alur layanan konseling yang berjalan di UPA BK serta kendala penilaian urgensi dan penjadwalan manual. Berdasarkan identifikasi tersebut ditetapkan kebutuhan sistem, yaitu tiga kelas urgensi (DARURAT, SEDANG, NORMAL), tenggat penanganan 48 jam untuk kasus DARURAT, kalender layanan lima hari kerja dengan empat sesi per hari, serta kebutuhan panel petugas untuk menetapkan jadwal final.'],
    ['Penyusunan Dataset Keluhan Sintetis', 'Dataset yang digunakan adalah data sintetis (dummy) sebanyak 147 keluhan berlabel yang ditulis meniru tema keluhan mahasiswa berdasarkan hasil survei DASS-21, tanpa memuat data mahasiswa yang sebenarnya. Komposisi kelas diatur serupa dengan kondisi nyata, yaitu DARURAT 50 data, SEDANG 44 data, dan NORMAL 53 data, sehingga ketidakseimbangan kelas ringan turut teruji pada model.'],
    ['Prapemrosesan Data Teks', 'Setiap keluhan melalui lima tahap prapemrosesan: normalisasi kata tidak baku dan singkatan umum, case folding, tokenisasi, stopword removal menggunakan daftar stopword bahasa Indonesia, serta pemangkasan sufiks sederhana. Hasil prapemrosesan berupa rangkaian kata dasar yang konsisten dan siap dibobot.'],
    ['Ekstraksi Fitur Menggunakan TF-IDF', 'Teks bersih diubah menjadi vektor TF-IDF dengan normalisasi L2. Kosakata dibangun dari seluruh data latih sehingga transformasi data uji dan pengajuan baru menggunakan kosakata yang sama. Hasil ekstraksi berupa matriks fitur jarang (sparse) yang menjadi masukan ketiga model klasifikasi.'],
    ['Pembangunan Model Klasifikasi', 'Tiga algoritma diimplementasikan dan dilatih pada data latih: Naive Bayes Multinomial, SVM linear dengan skema One-vs-Rest, dan Logistic Regression softmax. Setiap model mempelajari hubungan antara bobot TF-IDF dan label urgensi, kemudian menghasilkan skor peluang untuk ketiga kelas yang ditampilkan sebagai tingkat keyakinan kepada pengguna.'],
    ['Pengujian dan Evaluasi Model', 'Model diuji pada 30 data uji (20% data) yang terpisah dari proses pelatihan. Evaluasi menggunakan accuracy, precision, recall, dan F1-score makro, metrik per kelas, serta confusion matrix. Model dengan F1 makro terbaik ditetapkan sebagai model produksi untuk klasifikasi pengajuan baru.'],
    ['Perancangan Penjadwalan Greedy', 'Algoritma Greedy mengurutkan permintaan menurut prioritas dan waktu pengajuan, kemudian memilih slot terbaik untuk setiap permintaan pada horizon 10 hari kerja. Aturan yang diterapkan meliputi tenggat 48 jam untuk DARURAT (boleh melewati preferensi dengan pencatatan), penghormatan preferensi hari dan sesi untuk SEDANG dan NORMAL, pencegahan bentrok slot antarpermintaan, pembatasan kuota harian konselor, serta penyeimbangan beban ketika terdapat beberapa slot yang setara. Jejak keputusan dicatat untuk setiap penugasan.'],
    ['Implementasi Aplikasi Web dan Pengujian', 'Aplikasi dibangun dengan Next.js (App Router), TypeScript, Tailwind CSS, dan Prisma dengan basis data SQLite pada lingkungan pengembangan serta PostgreSQL pada lingkungan produksi. Halaman yang dibangun mencakup formulir pengajuan dengan klasifikasi instan, panel petugas untuk aksi penjadwalan dan penolakan, serta halaman evaluasi metode. Pengujian dilakukan terhadap seluruh alur fungsional, validasi bentrok dan kuota, serta penerapan (deployment) ke layanan hosting.'],
  ],
  jadwalIntro: 'Pelaksanaan Kerja Praktik dilakukan sesuai periode yang telah ditentukan. Jadwal kegiatan disusun berdasarkan tahapan penyelesaian proyek, mulai dari analisis kebutuhan, penyusunan data dan model, perancangan penjadwalan, implementasi aplikasi, hingga penyusunan laporan. Pembagian jadwal bertujuan agar setiap tahapan kegiatan dilaksanakan secara terarah dan sesuai target waktu.',
  jadwalTabel: {
    judul: 'Tabel 4.1 Jadwal Kegiatan',
    header: ['No.', 'Jenis Kegiatan', 'Mg 1', 'Mg 2', 'Mg 3', 'Mg 4'],
    lebar: [8, 52, 10, 10, 10, 10],
    baris: [
      ['1.', 'Orientasi pada UPA BK dan analisis kebutuhan layanan', 'X', '', '', ''],
      ['2.', 'Studi literatur metode klasifikasi teks dan penjadwalan', 'X', 'X', '', ''],
      ['3.', 'Penyusunan dataset keluhan sintetis berlabel', '', 'X', '', ''],
      ['4.', 'Implementasi prapemrosesan teks', '', 'X', '', ''],
      ['5.', 'Implementasi ekstraksi fitur TF-IDF', '', 'X', 'X', ''],
      ['6.', 'Pelatihan tiga model klasifikasi (NB, SVM, Logistic Regression)', '', '', 'X', ''],
      ['7.', 'Evaluasi model dan pemilihan model terbaik', '', '', 'X', ''],
      ['8.', 'Perancangan dan implementasi penjadwalan Greedy', '', '', 'X', ''],
      ['9.', 'Implementasi aplikasi web dan pengujian fungsional', '', '', 'X', 'X'],
      ['10.', 'Analisis hasil dan penyusunan laporan', '', '', '', 'X'],
    ],
  },
};

const BAB5 = {
  judul: ['HASIL DAN PEMBAHASAN'],
  hasilIntro: 'Berdasarkan hasil pengembangan, solusi yang diusulkan telah diwujudkan dalam bentuk aplikasi web yang mengintegrasikan pengajuan konseling, klasifikasi urgensi instan, panel petugas, penjadwalan Greedy, dan halaman evaluasi metode. Subbab berikut menyajikan tampilan dan fungsi setiap bagian aplikasi beserta hasil pengujian.',
  hasil: [
    ['1. Halaman Pengajuan Konseling', [
      'Halaman pengajuan merupakan halaman awal yang digunakan mahasiswa untuk mengajukan sesi konseling. Halaman memuat formulir dengan isian nama lengkap, NIM, program studi, nomor kontak, dan keluhan yang dialami, disertai pilihan preferensi hari (Senin–Jumat) dan sesi (S1–S4) yang bersifat opsional. Formulir juga menyediakan tombol contoh keluhan agar mahasiswa mendapat gambaran cara mengisi kolom keluhan.',
      'Setelah formulir dikirim, sistem menjalankan klasifikasi instan terhadap teks keluhan dan menampilkan hasilnya pada panel di sebelah kanan, sedangkan data pengajuan masuk ke panel petugas dengan status menunggu. Petugas UPA BK kemudian dapat menetapkan jadwal final melalui menu Panel Petugas sebagaimana disebutkan pada keterangan usulan jadwal.',
    ], '5_1_pengajuan.png', 'Halaman pengajuan konseling'],
    ['2. Hasil Klasifikasi Urgensi dan Usulan Jadwal', [
      'Hasil klasifikasi instan menampilkan label urgensi dengan tingkat keyakinan (confidence) model produksi. Sebagai contoh, keluhan "aku tidak tahan lagi, setiap malam aku berpikir untuk mengakhiri hidup" diklasifikasikan sebagai DARURAT dengan keyakinan 84,1% menggunakan Logistic Regression. Panel juga menampilkan skor peluang ketiga kelas secara berurutan, kata kunci yang paling memengaruhi prediksi (misalnya "hidup", "mengakhiri", "berpikir"), serta perbandingan prediksi ketiga model untuk keluhan yang sama.',
      'Panel hasil juga menyajikan usulan jadwal (Greedy) berupa hari, tanggal, sesi, konselor, dan estimasi waktu tunggu. Pada contoh tersebut, kasus DARURAT yang diajukan Senin mendapatkan usulan slot Selasa pukul 08.00–09.30 dengan estimasi tunggu dua hari, masih dalam tenggat 48 jam. Usulan bersifat awal; jadwal final ditetapkan petugas melalui panel.',
    ], '5_2_hasil_klasifikasi.png', 'Hasil klasifikasi urgensi dan usulan jadwal (Greedy)'],
    ['3. Halaman Panel Petugas', [
      'Panel petugas merupakan ruang kerja petugas UPA BK untuk mengelola seluruh permintaan. Panel menampilkan daftar permintaan beserta label urgensi hasil klasifikasi, tingkat keyakinan, status penanganan, dan tombol aksi. Untuk setiap permintaan berstatus menunggu, petugas dapat menjadwalkan sesuai usulan sistem, mengubah slot bila diperlukan, atau menolak permintaan yang di luar lingkup layanan dengan catatan.',
      'Sistem melakukan validasi otomatis pada setiap aksi: slot yang telah terisi tidak dapat dipakai ganda dan kuota harian konselor tidak boleh terlampaui, sehingga kesalahan penetapan ditolak dengan pesan kesalahan yang jelas. Panel juga memuat riwayat penugasan yang telah ditetapkan beserta konselor yang melayani, seperti ditunjukkan pada tampilan bagian bawah panel.',
    ], '5_3_panel_petugas.png', 'Halaman panel petugas (daftar permintaan dan aksi)'],
    ['4. Hasil Penjadwalan Greedy', [
      'Pengujian penjadwalan menggunakan 14 permintaan simulasi berstatus menunggu yang dijadwalkan pada horizon 10 hari kerja dengan empat konselor dummy (kuota harian 3, 3, 2, dan 3 sesi). Seluruh permintaan berhasil dijadwalkan, tanpa satu pun konflik slot dan tanpa pelanggaran preferensi. Kelima kasus DARURAT terjadwal dalam tenggat 48 jam dengan rata-rata waktu tunggu 0,6 hari (maksimum 1 hari), sementara kasus SEDANG menunggu rata-rata 4 hari dan kasus NORMAL 6,5 hari sesuai urutan prioritas.',
      'Distribusi beban antarkonselor terpantau melalui metrik beban: konselor menerima 2 sampai 6 penugasan dari total 14 slot terpakai pada kapasitas 110 slot yang tersedia. Jejak keputusan mencatat urutan penugasan beserta alasan pemilihan slot, misalnya "DARURAT → Senin S1, tenggat 2026-11-17", sehingga proses penyusunan jadwal dapat ditelusuri kembali.',
    ], '5_4_panel_jadwal.png', 'Panel petugas pada bagian riwayat penugasan jadwal'],
    ['5. Halaman Evaluasi Metode', [
      'Halaman evaluasi metode menyajikan metodologi secara transparan dalam enam langkah pipeline, komposisi dataset sintetis, perbandingan ketiga model, matriks kebingungan model terbaik, serta metrik penjadwalan simulasi. Halaman ini juga menyediakan fitur uji klasifikasi cepat untuk mencoba teks keluhan baru tanpa menyimpannya ke basis data.',
      'Pada halaman ini terlihat dataset 147 keluhan dengan komposisi DARURAT 50 data (34,0%), SEDANG 44 data (29,9%), dan NORMAL 53 data (36,1%), dibagi menjadi 117 data latih dan 30 data uji secara berstrata. Perbandingan model menampilkan accuracy, presisi makro, recall makro, dan F1 makro setiap algoritma beserta matriks kebingungan Logistic Regression sebagai model terpilih.',
    ], '5_5_evaluasi_metode.png', 'Halaman evaluasi metode (pipeline dan dataset)'],
    ['6. Perbandingan Model dan Matriks Kebingungan', [
      'Bagian bawah halaman evaluasi menampilkan tabel perbandingan model dan matriks kebingungan secara detail, termasuk dukungan (jumlah data uji) per kelas. Bagian ini memudahkan pembaca memverifikasi angka evaluasi yang sama dengan yang disajikan pada pembahasan berikut, sekaligus menjadi dokumentasi pengujian yang dapat ditampilkan kembali kapan saja tanpa menjalankan ulang pelatihan.',
    ], '5_6_evaluasi_model.png', 'Halaman evaluasi metode (perbandingan model dan matriks kebingungan)'],
  ],
  tabel53: {
    judul: 'Tabel 5.3 Komposisi Dataset Keluhan Sintetis',
    header: ['Kelas', 'Jumlah Data', 'Proporsi', 'Keterangan'],
    lebar: [19, 17, 19, 45],
    baris: [
      ['DARURAT', '50', '34,0%', 'Indikasi gawatdaruratan psikologis; didahulukan dalam 48 jam'],
      ['SEDANG', '44', '29,9%', 'Gangguan fungsional nyata; diupayakan pada minggu berjalan'],
      ['NORMAL', '53', '36,1%', 'Pengembangan diri dan konsultasi ringan; mengikuti preferensi'],
      ['Total', '147', '100%', 'Dibagi 117 data latih dan 30 data uji secara stratified'],
    ],
  },
  tabel54: {
    judul: 'Tabel 5.4 Hasil Evaluasi Ketiga Model pada Data Uji (30 Data)',
    header: ['Model', 'Accuracy', 'Presisi (makro)', 'Recall (makro)', 'F1 (makro)'],
    lebar: [27, 20, 18, 18, 17],
    baris: [
      ['Naive Bayes Multinomial', '86,67%', '86,90%', '85,56%', '85,61%'],
      ['SVM Linear OvR', '83,33%', '88,89%', '82,15%', '82,22%'],
      ['Logistic Regression Softmax', '86,67%', '90,48%', '85,86%', '86,19%'],
    ],
  },
  tabel55: {
    judul: 'Tabel 5.5 Matriks Kebingungan Logistic Regression pada Data Uji',
    header: ['Aktual \\ Prediksi', 'DARURAT', 'SEDANG', 'NORMAL'],
    lebar: [34, 22, 22, 22],
    baris: [
      ['DARURAT (10)', '10', '0', '0'],
      ['SEDANG (9)', '3', '6', '0'],
      ['NORMAL (11)', '1', '0', '10'],
    ],
  },
  tabel51: {
    judul: 'Tabel 5.1 Metrik Penjadwalan Greedy pada Simulasi 14 Permintaan',
    header: ['Prioritas', 'Ajuan', 'Tunggu Rata-rata', 'Tunggu Maks', 'Tepat Tenggat'],
    lebar: [23, 14, 26, 17, 20],
    baris: [
      ['DARURAT', '5', '0,6 hari', '1 hari', '5 dari 5'],
      ['SEDANG', '5', '4,0 hari', '7 hari', '5 dari 5'],
      ['NORMAL', '4', '6,5 hari', '9 hari', '4 dari 4'],
      ['Total', '14', '3,6 hari', '9 hari', '14 dari 14'],
    ],
  },
  tabel52: {
    judul: 'Tabel 5.2 Distribusi Beban Konselor pada Hasil Penjadwalan',
    header: ['Konselor (dummy)', 'Kuota Harian', 'Penugasan Mingguan'],
    lebar: [40, 26, 34],
    baris: [
      ['Rina Hartati, M.Psi.', '3 sesi', '6'],
      ['Ahmad Fauzi, M.Psi.', '3 sesi', '4'],
      ['Dewi Lestari, M.Psi.', '2 sesi', '2'],
      ['Yoga Prasetyo, M.Psi.', '3 sesi', '2'],
    ],
  },
  pembahasan: [
    ['1. Pembahasan Pengembangan Aplikasi', [
      'Aplikasi yang dikembangkan mengintegrasikan seluruh alur layanan dalam satu tempat: pengajuan mahasiswa, klasifikasi urgensi instan, usulan jadwal Greedy, panel petugas, dan evaluasi metode. Penyajian per bagian membuat proses layanan mudah ditelusuri; petugas dapat melihat dasar klasifikasi (kata kunci dan perbandingan model) sebelum menetapkan keputusan, dan mahasiswa menerima umpan balik urgensi segera setelah mengirim pengajuan.',
      'Validasi otomatis pada panel petugas menjaga keutuhan jadwal. Percobaan menetapkan dua permintaan pada slot yang sama ditolak sistem dengan kode kesalahan 409, demikian pula penetapan yang melebihi kuota harian konselor. Mekanisme ini meniru kontrol yang sebelumnya dilakukan petugas secara manual sehingga risiko bentrok jadwal berkurang tanpa menambah beban kerja.',
    ]],
    ['2. Pembahasan Hasil Evaluasi Model', [
      'Ketiga model menunjukkan kinerja yang seimbang pada data uji, dengan accuracy Naive Bayes dan Logistic Regression sama-sama 86,67% dan SVM linear 83,33%. Logistic Regression terpilih sebagai model produksi karena memperoleh F1 makro terbaik (86,19%) dengan presisi makro 90,48%. Perbedaan kinerja antaralgoritma pada dataset ini tidak ekstrem, namun pilihan berbasis F1 makro lebih aman pada data tidak seimbang karena setiap kelas dianggap sama penting.',
      'Dari sisi keselamatan layanan, recall Logistic Regression pada kelas DARURAT mencapai 100%: seluruh 10 kasus DARURAT pada data uji terdeteksi. Kesalahan yang terjadi adalah false alarm, yaitu 3 kasus SEDANG dan 1 kasus NORMAL yang diprediksi DARURAT, sehingga presisi DARURAT menjadi 71,43%. False alarm pada konteks ini relatif aman karena akan diizinkan oleh verifikasi petugas, sedangkan kasus berat yang terlewat jauh lebih berisiko. Hal ini sejalan dengan temuan Suherman dan Ismail (2026) bahwa keluaran model dimaksudkan sebagai alat bantu verifikasi petugas, bukan keputusan otomatis.',
      'Kesalahan utama terletak pada recall kelas SEDANG (66,67%) karena tiga kasus SEDANG ikut terprediksi DARURAT. Kemiripan kata pada keluhan transisi antara "gangguan fungsional" dan "indikasi berat" menjadi penyebab utama. Kinerja NORMAL paling kuat (presisi dan recall 100% dan 90,91%) karena kosakata keluhan pengembangan diri cukup khas, misalnya kata "tips", "rencana", dan "magang".',
      'Dibandingkan penelitian terdahulu, akurasi 86,67% pada data sintetis ini berada di bawah akurasi 91% Naive Bayes pada data pengaduan fakultas (Sunarti et al., 2024) dan 88,94% Logistic Regression pada pengaduan publik (Suherman & Ismail, 2026), namun lebih stabil daripada kasus data tidak seimbang yang membutuhkan penanganan tambahan (Muhammad et al., 2026). Perbedaan jumlah data, bahasa, dan gaya penulisan keluhan menyebabkan angka tidak dapat dibandingkan langsung; yang penting adalah prosedur evaluasi yang sama untuk ketiga model pada data yang sama.',
    ]],
    ['3. Pembahasan Hasil Penjadwalan Greedy', [
      'Algoritma Greedy berhasil menetapkan seluruh 14 permintaan simulasi tanpa konflik slot dan tanpa pelanggaran preferensi. Urutan prioritas bekerja sesuai rancangan: kasus DARURAT menunggu rata-rata 0,6 hari dengan maksimum 1 hari sehingga seluruhnya memenuhi tenggat 48 jam, sedangkan kasus SEDANG dan NORMAL menerima tunggu lebih panjang (rata-rata 4,0 dan 6,5 hari) karena slot diprioritaskan untuk kasus berat. Pola ini menunjukkan trade-off yang disengaja antara kecepatan penanganan kasus berat dan kenyamanan kasus ringan.',
      'Distribusi beban konselor relatif merata dengan rentang 2 hingga 6 penugasan dari kapasitas 110 slot. Ketika terdapat beberapa slot setara, algoritma memilih konselor dengan beban lebih rendah sehingga beban tidak menumpuk pada satu konselor. Jejak keputusan yang mencatat slot, konselor, tenggat, dan alasan pemilihan memudahkan petugas mengaudit jadwal, sekaligus menjadi dokumentasi bila terdapat keluhan mengenai urutan layanan.',
      'Dibandingkan pendekatan penjadwalan lain, Greedy dipilih karena cepat, deterministik, dan mudah dijelaskan kepada petugas tanpa perangkat optimasi tambahan, sebagaimana diterapkan pada penjadwalan asisten laboratorium dengan prioritas berjenjang (Wijaya et al., 2026). Pendekatan metaheuristik seperti Algoritma Genetika (Setiani et al., 2024) dapat menghasilkan jadwal yang lebih optimal pada skala besar, tetapi memerlukan waktu komputasi dan pengaturan parameter yang lebih kompleks; pendekatan SJF (Fatyana et al., 2024) memperpendek waktu tunggu namun tidak mempertimbangkan urgensi kasus berat. Untuk kebutuhan UPA BK saat ini, Greedy berbasis prioritas memberikan keseimbangan yang sesuai antara kualitas jadwal, kejelasan aturan, dan kendali petugas.',
    ]],
    ['4. Pembahasan Keterbatasan', [
      'Beberapa keterbatasan perlu dicatat agar hasil tidak digeneralisasi berlebihan. Pertama, dataset yang digunakan sintetis sebanyak 147 data sehingga model belum diuji pada keluhan mahasiswa yang sebenarnya; penggunaan data asli memerlukan persetujuan dan pengelolaan privasi yang ketat. Kedua, prapemrosesan tidak menggunakan stemming penuh sehingga variasi morfologi kata masih memengaruhi kosakata. Ketiga, penjadwalan menggunakan konselor dan kuota dummy; aturan layanan riil seperti spesialisasi konselor belum menjadi kendala pencarian slot.',
      'Keempat, hasil klasifikasi tetap memerlukan verifikasi petugas, terutama karena presisi kelas DARURAT 71,43% sehingga terdapat false alarm yang harus diseleksi manusia. Kelima, algoritma Greedy tidak menjamin solusi optimal global; pada volume pengajuan yang jauh lebih besar, evaluasi ulang terhadap metrik tunggu dan beban tetap diperlukan. Keterbatasan-keterbatasan ini menjadi dasar saran pengembangan pada bab berikutnya.',
    ]],
  ],
};

const BAB6 = {
  judul: ['KESIMPULAN DAN SARAN'],
  kesimpulan: [
    'Berdasarkan hasil pelaksanaan Kerja Praktik pada UPA Bimbingan dan Konseling Universitas Trunojoyo Madura, dapat disimpulkan bahwa aplikasi penjadwalan konseling dengan klasifikasi urgensi otomatis telah berhasil dibangun dan diuji. Teks keluhan diproses melalui prapemrosesan bahasa Indonesia (normalisasi, case folding, tokenisasi, stopword removal, dan pemangkasan sufiks) kemudian direpresentasikan dengan TF-IDF ternormalisasi L2. Pada dataset sintetis 147 keluhan dengan komposisi DARURAT 50 data, SEDANG 44 data, dan NORMAL 53 data yang dibagi 117 data latih dan 30 data uji secara stratified, ketiga model yang dibangun menunjukkan kinerja yang kompeten.',
    'Logistic Regression menjadi model terbaik dengan accuracy 86,67%, presisi makro 90,48%, recall makro 85,86%, dan F1 makro 86,19%, mengungguli Naive Bayes (F1 makro 85,61%) dan SVM linear (F1 makro 82,22%). Recall Logistic Regression pada kelas DARURAT mencapai 100% sehingga seluruh kasus berat pada data uji terdeteksi, meskipun presisinya 71,43% akibat beberapa false alarm yang dapat difilter petugas. Hasil ini menunjukkan bahwa kombinasi TF-IDF dan Logistic Regression layak digunakan sebagai alat bantu penilaian urgensi pada layanan konseling kampus.',
    'Algoritma Greedy berbasis prioritas berhasil menetapkan seluruh 14 permintaan simulasi tanpa konflik slot dan tanpa pelanggaran preferensi pada horizon 10 hari kerja. Kelima kasus DARURAT terjadwal dalam tenggat 48 jam dengan rata-rata tunggu 0,6 hari, kasus SEDANG menunggu rata-rata 4,0 hari, dan kasus NORMAL 6,5 hari. Aplikasi web yang mengintegrasikan pengajuan, klasifikasi instan, panel petugas dengan validasi bentrok dan kuota, serta halaman evaluasi metode telah diterapkan ke lingkungan produksi dan siap digunakan sebagai alat bantu petugas UPA BK dalam menetapkan jadwal konseling.',
  ],
  saranIntro: 'Berdasarkan hasil pengembangan dan pengujian, terdapat beberapa saran yang dapat dipertimbangkan untuk pengembangan selanjutnya, yaitu:',
  saran: [
    'Penggunaan data keluhan asli secara bertahap dengan persetujuan mahasiswa dan pengelolaan privasi yang ketat, sehingga model dilatih ulang pada distribusi keluhan yang sesungguhnya dan kinerjanya dapat diukur langsung pada layanan riil.',
    'Penambahan jumlah dan keseimbangan dataset, khususnya kelas SEDANG yang recall-nya paling rendah (66,67%), serta eksplorasi representasi fitur lanjutan seperti stemming penuh, word embeddings, atau model bahasa untuk meningkatkan pembedaan kelas.',
    'Optimasi penjadwalan dengan mempertimbangkan spesialisasi konselor dan preferensi gender pada pencarian slot, serta perbandingan Greedy dengan pendekatan metaheuristik seperti Algoritma Genetika pada volume permintaan yang lebih besar.',
    'Integrasi modul penjadwalan dengan komponen lain pada ekosistem layanan, misalnya skrining DASS-21 pada formulir pengajuan dan chatbot pendamping percakapan, agar informasi urgensi semakin lengkap sebelum penjadwalan.',
    'Penambahan fitur operasional pada aplikasi, seperti notifikasi pengingat jadwal, reschedule mandiri oleh mahasiswa dengan validasi sistem, dan ekspor laporan statistik layanan bulanan bagi pimpinan unit.',
    'Evaluasi penerimaan pengguna melalui pengukuran usability (misalnya System Usability Scale) terhadap mahasiswa dan petugas UPA BK sebelum penerapan penuh, dilanjutkan pemantauan metrik layanan seperti waktu penanganan kasus DARURAT.',
  ],
};

const PUSTAKA = [
  'Ajijah, N., & Kurniawan, A. (2023). Klasifikasi text mining terhadap analisa isu kegiatan tenaga lapangan menggunakan algoritma K-Nearest Neighbor (KNN). J-SAKTI (Jurnal Sains Komputer & Informatika), 7(1).',
  'Candra, R. M., & Nanda Rozana, A. (2020). Klasifikasi komentar bullying pada Instagram menggunakan metode K-Nearest Neighbor. IT Journal Research and Development, 5(1). https://doi.org/10.25299/itjrd.2020.vol5(1).4962',
  'Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009). Introduction to algorithms (3rd ed.). MIT Press.',
  'Cortes, C., & Vapnik, V. (1995). Support-vector networks. Machine Learning, 20(3), 273-297. https://doi.org/10.1007/BF00994018',
  'Fatyana, N., Irawan, M. D., & Nasution, A. B. (2024). Sistem penjadwalan bimbingan konseling dengan menerapkan algoritma Shortest Job First. TIN: Terapan Informatika Nusantara, 4(10), 669-678. https://doi.org/10.47065/tin.v4i10.5024',
  'Hastie, T., Tibshirani, R., & Friedman, J. H. (2009). The elements of statistical learning: Data mining, inference, and prediction (2nd ed.). Springer.',
  'Lovibond, S. H., & Lovibond, P. F. (1995). The structure of negative emotional states: Comparison of the Depression Anxiety Stress Scales (DASS) with the Beck Depression and Anxiety Inventories. Behaviour Research and Therapy, 33(3), 335-343. https://doi.org/10.1016/0005-7967(94)00075-U',
  'Muhammad, F. P., Maimunah, & Nugroho, S. (2026). Optimasi penanganan ketidakseimbangan data pada klasifikasi pengaduan masyarakat menggunakan metode Naive Bayes. Teknokompak, 20(2). https://doi.org/10.33365/jtk.v20i2.939',
  'Nuramadanti, I., Wijaya, D. P., Yazid, A. S., & Danianti, D. (2025). Sistem informasi bimbingan konseling berbasis web (Studi kasus: SMA N 1 Jatilawang). Jurnal Profesi Insinyur Universitas Lampung, 6(2), 469. https://doi.org/10.23960/jpi.v6n2.315',
  'Rikky, R., Graciela, M., & Irsyad, H. (2024). Klasifikasi opini masyarakat terhadap naturalisasi pemain sepak bola menggunakan KNN dan SMOTE. Applied Information Technology and Computer Science (AICOMS), 3(1). https://doi.org/10.58466/aicoms.v3i1.1547',
  'Riliv. (2026). Riliv: Konseling online & kesehatan mental [Aplikasi seluler]. Diakses 16 November 2026, dari https://riliv.co',
  'Setiani, A. Y., Mujianto, A. H., Andriani, A., & Widoyoningrum, S. (2024). Sistem penjadwalan bimbingan belajar berbasis web menggunakan algoritma genetika. Inovate: Jurnal Ilmiah Inovasi Teknologi Informasi, 9(1), 234-243. https://doi.org/10.33752/inovate.v9i1.7282',
  'Sunarti, Ridwang, & Hayat, M. A. M. (2024). Klasifikasi pengaduan pelayanan Fakultas Teknik Universitas Muhammadiyah Makassar menggunakan natural language processing. ARUS Jurnal Sains dan Teknologi, 2(2).',
  'Suherman, & Ismail. (2026). Klasifikasi prioritas pengaduan pelayanan publik menggunakan natural language processing dan machine learning. Jurnal Ilmiah Sistem Informasi dan Teknik Informatika (JISTI), 9(2), 207-216. https://doi.org/10.57093/jisti.v9i2.430',
  'Universitas Trunojoyo Madura. (2026, 28 April). UPA Bimbingan dan Konseling UTM gelar workshop konseling dasar untuk dosen, tendik, dan tenaga layanan kesehatan. Diakses 16 November 2026, dari https://www2.trunojoyo.ac.id',
  'Vanessa, S. D., & Avianto, D. (2026). Sistem penjadwalan bimbingan konseling dan akademik berbasis web dan mobile dengan .NET MAUI. JATI (Jurnal Mahasiswa Teknik Informatika), 10(2). https://doi.org/10.36040/jati.v10i2.18268',
  'Wijaya, M. R., Azima, M. F., & Laila, S. N. (2026). Penerapan algoritma Greedy pada sistem penjadwalan cerdas asisten laboratorium berbasis kompetensi. Jurnal Tecnoscienza, 10(2), 253-266.',
];

const LAMPIRAN = {
  cvJudul: 'Lampiran 1. Curriculum Vitae Penulis.',
  cv: {
    pribadiJudul: 'Data Pribadi',
    pribadi: [
      ['Nama', 'Imro Atun Jamilah S.A'],
      ['NIM', '230411100123'],
      ['Tempat/ Tgl. lahir', '【tempat dan tanggal lahir】'],
      ['Jenis kelamin', '【jenis kelamin】'],
      ['Alamat', '【alamat domisili】'],
      ['Email', '【email aktif】'],
      ['Agama', '【agama】'],
      ['Kewarganegaraan', 'Indonesia'],
    ],
    pendidikanJudul: 'Pendidikan',
    pendidikanHeader: ['Jenjang', 'Institusi', 'Periode'],
    pendidikan: [
      ['SD sederajat', '【nama institusi】', '【periode】'],
      ['SLTP sederajat', '【nama institusi】', '【periode】'],
      ['SLTA sederajat', '【nama institusi】', '【periode】'],
      ['S1', 'Universitas Trunojoyo Madura - Teknik Informatika', '2023 - sekarang'],
    ],
    keahlianJudul: 'Keahlian',
    keahlian: [
      'Bahasa pemrograman (TypeScript/JavaScript, Python)',
      'Framework web (Next.js/React, Tailwind CSS)',
      'Basis data (MySQL, PostgreSQL) dan Prisma ORM',
      'Dasar pembelajaran mesin (TF-IDF, klasifikasi teks)',
      'Microsoft Office (Word, Excel, PowerPoint)',
      'Desain UI/UX (Figma)',
    ],
    organisasiJudul: 'Pengalaman Organisasi',
    organisasiHeader: ['Organisasi', 'Periode'],
    organisasi: [
      ['【nama organisasi】', '【periode】'],
      ['【nama organisasi】', '【periode】'],
    ],
  },
};

module.exports = { BAB4, BAB5, BAB6, PUSTAKA, LAMPIRAN };
