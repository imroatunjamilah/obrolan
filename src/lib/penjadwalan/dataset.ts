/**
 * Dataset keluhan mahasiswa BERLABEL — DUMMY/SINTETIS.
 * Semua kalimat di bawah adalah contoh buatan (tidak berasal dari data
 * skrining responden mana pun) yang ditulis meniru gaya bahasa keluhan
 * mahasiswa dan tema hasil riset: rindu keluarga, cemas/overthinking,
 * tekanan akademik, keuangan, relasi sosial, tidur, dan kasus darurat.
 *
 * Label prioritas:
 *   DARURAT — indikasi risiko tinggi/kegawatdaruratan psikologis,
 *             harus dilayani ≤ 48 jam.
 *   SEDANG  — gangguan fungsional nyata (belajar/tidur/relasi) perlu
 *             sesi konseling minggu ini.
 *   NORMAL  — kebutuhan pengembangan diri/konsultasi ringan.
 */

export type KelasPrioritas = 'DARURAT' | 'SEDANG' | 'NORMAL';

export interface ContohKeluhan {
  teks: string;
  kelas: KelasPrioritas;
}

const DARURAT: string[] = [
  'Aku merasa tidak berharga dan ingin mengakhiri hidupku',
  'Sering muncul pikiran untuk bunuh diri setiap malam',
  'Aku terpikir menelan pil obat agar semua selesai',
  'Kadang aku berdiri di atap gedung dan terpikir untuk melompat',
  'Aku menyayat lenganiku dengan pisau ketika merasa sangat tertekan',
  'Minggu ini aku tiga kali mengalami serangan panik hebat hingga sesak napas',
  'Aku panik berat sampai jatuh pingsan di ruang kuliah tadi pagi',
  'Sudah lima hari aku tidak bisa tidur sama sekali dan jantungku berdebar kencang',
  'Aku tidak makan tiga hari karena nasi seperti tercekat di tenggorokan',
  'Aku merasa putus asa total dan melihat masa depanku gelap tanpa harapan',
  'Trauma kekerasan di rumah muncul lagi dan aku mengalami kejang saat teringat itu',
  'Aku diganggu terus-menerus oleh seseorang hingga takut keluar kamar',
  'Ayahku marah dan menyerangku dengan benda keras tadi malam',
  'Aku menangis dan berteriak tanpa bisa berhenti sejak diberitahu sahabatku meninggal dunia',
  'Kekasihku meninggal dalam kecelakaan dan aku sampai tidak sadar diri',
  'Aku merasa seperti orang lain yang mengendalikan tubuhku dan sangat menakutkan',
  'Aku kehilangan kendali total, aku merobek semua buku dan memukul pintu hingga tanganku berdarah',
  'Aku takut mati setiap saat dan mengerang sesak hingga tetangga mengetuk pintu',
  'Rasa cemas sangat berat menyerang setiap jam dan aku hampir jatuh dari tangga karena gemetar',
  'Aku berjalan tanpa tujuan di jalan raya tengah malam karena tidak peduli apa pun terjadi',
  'Aku membakar semua barang kenangan karena dorongan yang tidak bisa kubendung',
  'Aku berencana pergi jauh esok hari dan menyerahkan semua surat pentingku pada teman',
  'Aku menulis surat perpisahan untuk keluargaku karena merasa waktu hidupku habis',
  'Setiap malam aku mendengar suara memerintahkan aku mencelakakan diri',
  'Aku tidak makan, tidak tidur, dan terus menangis hingga tubuhku lemas sekali',
  'Aku meminum alkohol berlebihan tiga hari ini dan ingin berhenti tetapi tidak sanggup',
  'Aku terus memukul kepala sendiri ke dinding ketika stres berat datang',
  'Kadang aku memegang gunting dan terpikir menyayat pergelangan tangan',
  'Aku merasa dunia menghancurkanku dan hanya ingin menghilang selamanya',
  'Aku sampai pingsan di kamar mandi karena menahan sesuatu yang mengerikan',
  'Tadi aku melihat temanku menangis histeris dan bicara tidak jelas di koridor',
  'Sepupuku menelepon tengah malam berkata dia ingin mengakhiri hidupnya sekarang',
  'Aku tidak pulang tiga hari dan tidak siapa pun tahu ke mana aku pergi',
  'Aku mengalami sesak berat dan tidak bisa bicara saat dimarahi dosen pembimbing tadi',
  'Aku merasa hendak gila, tidak bisa membedakan mimpi dan kenyataan sejak semalam',
  'Aku merasa diburu bayangan hitam yang menyuruhku melompat dari jembatan',
  'Aku minum obat dewasa tiga tablet sekaligus agar bisa tidur dan hampir overdosis',
  'Aku tidak kuat lagi, semua orang membenciku, dan hidupku hanya beban',
  'Lima hari terakhir aku gagap, gemetar, dan terbangun dengan teriakan setiap dua jam',
  'Aku sampai tidak bisa berdiri saat memikirkan utang ribuan yang dikejar penagih hari ini',
  'Aku merasa dikhianati semua orang dan ingin membalas dengan menyakiti mereka',
  'Aku berdiri di jembatan penyeberangan lama dan terpikir berhenti di tengah jalan',
  'Aku trauma bencana kemarin dan sejak itu menangis terus, tidak bisa makan, tidak bisa tidur',
  'Aku terbangun tengah malam dengan jantung seperti hendak berhenti dan terus mengerang',
  'Aku menyayat tanganku dengan cutter karena merasa sangat tertekan dan ingin menghilang',
  'Aku menyayat diri lagi semalam karena beban yang kutanggung terlalu berat',
  'Aku melukai diriku sendiri setiap kali merasa sangat tertekan dan tidak berdaya',
  'Aku merasa sangat tertekan sampai berpikir untuk menghilang dari semua orang',
  'Aku merasa tertekan berat belakangan dan sering memukul diriku sendiri',
  'Aku takut pada diriku sendiri karena dorongan menyakiti diri makin sering datang',
];

const SEDANG: string[] = [
  'Sudah dua minggu aku sulit tidur karena terus overthinking soal nilai dan tugas',
  'Aku cemas berlebihan setiap sebelum ujian sampai perutku sakit dan tidak bisa belajar',
  'Aku sering menangis sendirian di kamar karena merasa sendirian di kota baru ini',
  'Aku rindu rumah sampai sulit fokus kuliah dan sering terdiam di tengah kelas',
  'Orang tua kami terus bertengkar di telepon dan aku jadi gelisah sepanjang hari',
  'Aku dan sahabat kamar bertengkar hebat dan sekarang suasananya nyaman sekali berat',
  'Uang kuliahku telat dibayar dan aku khawatir berlebihan sampai tidak bisa tidur nyenyak',
  'Aku baru putus dari pacar dua minggu lalu dan motivasi belajarku hilang',
  'Aku lelah terus-menerus, sulit bangun pagi, dan tugas menumpuk belum selesai',
  'Aku merasa kosong dan tidak bersemangat melakukan apa pun sejak dua minggu',
  'Nilai ujianku turun drastis dan aku mulai takut ditinggal di kelas, terus gelisah',
  'Aku takut bicara di depan kelas sampai gemetar dan memilih bolos presentasi',
  'Aku khawatir berlebihan tentang masa depan kerja sampai tidak bisa fokus',
  'Aku sering terbangun jam tiga pagi dan kepala terus memikirkan skripsi macet',
  'Aku merasa tertekan karena beban organisasi dan nilai harus tetap bagus',
  'Aku sulit mengatur waktu antara kerja paruh waktu dan kuliah sehingga hampir terlambat ujian',
  'Aku cemas setiap menerima notifikasi tugas baru dan sering menunda sampai malam',
  'Aku merasa sepi walaupun banyak teman karena sulit membuka diri',
  'Aku marah mudah belakangan ini dan beberapa teman mulai jauhi aku',
  'Aku merasa bodoh setiap membandingkan diri dengan teman yang selalu dapat beasiswa',
  'Aku gelisah setiap kali menelepon orang tua karena suasana rumah tidak kondusif',
  'Aku takut gagal di ujian akhir minggu ini sampai tidak tidur nyaman dua malam',
  'Aku menangis setiap selesai kuliah karena merasa tidak berguna',
  'Aku bingung memilih jalur karier dan cemasnya mengganggu tidurku',
  'Aku merasa tertinggal dari teman-teman yang sudah punya prestasi dan itu menyiksa',
  'Aku kesulitan beradaptasi di kampus baru dan sering memilih makan sendirian',
  'Aku cemas berat soal kesehatan ibuku yang sering pusing, sulit konsentrasi belajar',
  'Aku merasa tertekan karena cicilan laptop menghantui setiap bulan',
  'Aku tidak nyaman dengan lingkungan kos dan sering tidak bisa tidur karena bising',
  'Aku sering bingung jadwal dan lupa tugas sehingga terus merasa gagal',
  'Aku takut bertanya di kelas sehingga tugas tertahan dan nilai menurun',
  'Aku merasa cemburu berlebihan pada kekasih dan hubungan kami sering bergolak',
  'Aku sulit berkata tidak pada permintaan teman sampai tugas sendiri terbengkalai',
  'Aku merasa lelah emosional setelah menjadi tempat curhat semua teman',
  'Aku khawatir berlebihan dengan berita buruk di media sosial sampai gelisah setiap hari',
  'Aku merasa tertekan karena harus membantu ekonomi keluarga sambil kuliah',
  'Aku takut kehilangan beasiswa karena ipk mulai menurun di semester ini',
  'Aku sulit tidur karena terus memikirkan kesalahan kecil yang kulakukan minggu lalu',
  'Aku merasa tidak nyaman setiap berada di keramaian dan memilih isolasi',
  'Aku sering panik ringan saat presentasi dan tanganku gemetar memegang slide',
  'Aku merasa tertekan menjelang sidang skripsi minggu depan dan sulit tidur nyenyak',
  'Aku merasa dihakimi teman karena pilihan jurusanku dan itu mengganggu hari-hariku',
  'Aku sulit berkonsentrasi belajar sejak orang tua sakit dan sering menangis diam-diam',
  'Aku merasa tidak berdaya mengatur keuangan bulanan sehingga selalu cemas tanggal tua',
];

const NORMAL: string[] = [
  'Aku ingin konsultasi cara mengatur jadwal belajar agar lebih efektif',
  'Tolong bantu aku menyusun rencana belajar semester ini',
  'Aku ingin menanyakan tips mengatur waktu antara organisasi dan kuliah',
  'Aku mau diskusi tentang pilihan konsentrasi yang cocok untukku',
  'Saya ingin meningkatkan kebiasaan bangun pagi dan berolahraga teratur',
  'Aku ingin konsultasi soal rencana magang tahun depan',
  'Boleh minta saran cara belajar yang cocok untuk gaya belajar visual',
  'Aku ingin tahu cara membuat catatan kuliah yang rapi dan mudah diingat',
  'Saya ingin berdiskusi tentang beasiswa yang bisa saya ajukan',
  'Aku ingin meningkatkan kemampuan berbicara di depan umum',
  'Aku rindu keluarga di kampung dan ingin tips menahan rindu',
  'Aku ingin tahu cara menjaga pola makan sehat di kos',
  'Saya mau konsultasi tentang rencana mengikuti lomba penelitian',
  'Aku ingin berdiskusi soal manajemen keuangan sederhana untuk mahasiswa',
  'Saya ingin tahu teknik belajar cepat menjelang ujian',
  'Aku mau tanya cara membuat portofolio untuk melamar kerja',
  'Aku ingin konsultasi tentang pilihan organisasi yang sesuai minatku',
  'Saya mau berdiskusi soal etika berkomunikasi dengan dosen',
  'Aku ingin tahu cara membiasakan diri rajin membaca buku',
  'Aku mau tanya rekomendasi aplikasi pengingat jadwal kuliah',
  'Saya ingin meningkatkan keterampilan menulis ilmiah',
  'Aku ingin berdiskusi soal cara membangun relasi profesional',
  'Aku mau konsultasi tentang persiapan tes seleksi asisten laboratorium',
  'Saya ingin tahu cara menata kamar kos agar nyaman untuk belajar',
  'Aku ingin menanyakan teknik manajemen waktu pomodoro',
  'Aku mau berdiskusi soal rencana mengikuti pertukaran pelajar',
  'Saya ingin konsultasi cara memilih buku referensi kuliah',
  'Aku ingin tahu tips menjaga konsentrasi saat belajar di perpustakaan',
  'Aku mau tanya cara menyusun cv yang menarik untuk magang',
  'Saya ingin berdiskusi tentang cara efektif kerja kelompok',
  'Aku ingin konsultasi tentang pengelolaan energi agar tidak cepat lelah belajar',
  'Aku mau tanya cara membuat jadwal tidur yang teratur',
  'Saya ingin tahu langkah awal menyiapkan skripsi semester depan',
  'Aku ingin berdiskusi soal cara menjaga motivasi belajar jangka panjang',
  'Aku mau konsultasi tentang keseimbangan antara kuliah dan hobi',
  'Saya ingin tahu cara mencatat target mingguan agar disiplin',
  'Aku ingin menanyakan teknik presentasi yang santai namun meyakinkan',
  'Aku mau berdiskusi soal cara memperluas pergaulan di kampus',
  'Saya ingin konsultasi tentang persiapan mengikuti seminar kepemimpinan',
  'Aku ingin tahu cara mengorganisir file tugas supaya rapi',
  'Aku mau tanya rekomendasi kegiatan positif di akhir pekan',
  'Saya ingin meningkatkan kemampuan bahasa Inggris untuk keperluan karier',
  'Aku ingin berdiskusi soal cara menghargai waktu bersama keluarga saat pulang',
  'Aku mau konsultasi tentang rencana belajar mandiri di rumah',
  'Saya ingin tahu cara mengatur ritme belajar saat ramadan nanti',
  'Aku ingin menanyakan cara membuat kebiasaan menulis jurnal harian',
  'Aku mau berdiskusi soal memilih asrama atau kos di semester depan',
  'Saya ingin konsultasi teknik mengatur jeda istirahat saat mengerjakan tugas',
  'Aku ingin tahu cara menyiapkan diri mengikuti program kewirausahaan kampus',
  'Aku mau tanya tips menjaga semangat kuliah di semester akhir',
  'Saya ingin berdiskusi soal strategi menghadapi wawancara beasiswa',
  'Aku ingin konsultasi tentang cara menata prioritas antar mata kuliah',
  'Aku rindu masakan ibu dan ingin tahu resep masak sederhana di kos',
];

// Perbaiki satu entri yang mengandung tanda kutip salah (dijaga kompiler).
const NORMAL_BERSIH = NORMAL.map((t) => t.replace('"', ''));

export const DATASET: ContohKeluhan[] = [
  ...DARURAT.map((teks) => ({ teks, kelas: 'DARURAT' as KelasPrioritas })),
  ...SEDANG.map((teks) => ({ teks, kelas: 'SEDANG' as KelasPrioritas })),
  ...NORMAL_BERSIH.map((teks) => ({ teks, kelas: 'NORMAL' as KelasPrioritas })),
];

export const LABEL_KELAS: KelasPrioritas[] = ['DARURAT', 'SEDANG', 'NORMAL'];

export const DESKRIPSI_KELAS: Record<KelasPrioritas, string> = {
  DARURAT:
    'Indikasi kegawatdaruratan psikologis (risiko melukai diri/pendam orang lain, gangguan berat). Didahulukan ≤ 48 jam.',
  SEDANG:
    'Gangguan fungsional nyata (tidur, konsentrasi, relasi, akademik) yang perlu sesi konseling minggu berjalan.',
  NORMAL:
    'Kebutuhan pengembangan diri dan konsultasi ringan; dijadwalkan mengikuti preferensi dan kapasitas.',
};
