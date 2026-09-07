import { MataPelajaranKurikulum } from '../src/types';

export const INITIAL_MAPEL_LIST: MataPelajaranKurikulum[] = [
  // =========================================================================
  // FASE A: KELAS 1 DAN KELAS 2 SD
  // (Catatan Kurikulum Merdeka: Pada Fase A, muatan IPA & IPS diintegrasikan
  //  ke dalam Bahasa Indonesia dan Pendidikan Pancasila; belum ada mata pelajaran IPAS)
  // =========================================================================

  // --- KELAS 1 (FASE A) ---
  {
    id: 'mapel-sd-bin-1',
    kode_mapel: 'BIN-SD-1-FA',
    nama_mapel: 'Bahasa Indonesia SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 1',
    fase_kurikulum: 'Fase A (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 1.1',
        deskripsi: 'Mengenal dan melafalkan bunyi huruf vokal dan konsonan serta merangkai suku kata (ba-bi-bu-be-bo) menjadi kata bermakna.',
        lingkup_materi: 'Bunyi Huruf & Suku Kata',
        indikator_asesmen: 'Disajikan gambar benda sehari-hari, peserta didik dapat melengkapi suku kata awal kata benda tersebut dengan tepat.',
      },
      {
        kode_tp: 'TP 1.2',
        deskripsi: 'Mengidentifikasi informasi penting dari teks narasi pendek yang dibacakan guru tentang kegiatan keluarga dan diri sendiri.',
        lingkup_materi: 'Menyimak Cerita Pendek',
        indikator_asesmen: 'Disajikan teks bacaan cerita bergambar, peserta didik dapat menjawab pertanyaan tokoh dan tempat kejadian cerita.',
      },
      {
        kode_tp: 'TP 1.3',
        deskripsi: 'Menyampaikan ungkapan terima kasih, tolong, dan maaf secara santun dalam interaksi sehari-hari di rumah dan di sekolah.',
        lingkup_materi: 'Kata Ajaib & Kesantunan Berbahasa',
        indikator_asesmen: 'Peserta didik dapat menentukan ungkapan tolong atau terima kasih yang sesuai dengan situasi percakapan.',
      },
    ],
  },
  {
    id: 'mapel-sd-mat-1',
    kode_mapel: 'MAT-SD-1-FA',
    nama_mapel: 'Matematika SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 1',
    fase_kurikulum: 'Fase A (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 1.1',
        deskripsi: 'Membilang, membaca, dan menuliskan lambang bilangan cacah sampai dengan 20 secara urut dan mengelompokkan benda konkret.',
        lingkup_materi: 'Bilangan Cacah 1 sampai 20',
        indikator_asesmen: 'Disajikan sekumpulan gambar benda konkret, peserta didik dapat menentukan banyak benda dengan lambang bilangan yang sesuai.',
      },
      {
        kode_tp: 'TP 1.2',
        deskripsi: 'Melakukan operasi penjumlahan dan pengurangan bilangan cacah sampai dengan 10 menggunakan benda konkret atau garis bilangan.',
        lingkup_materi: 'Penjumlahan & Pengurangan Dasar',
        indikator_asesmen: 'Peserta didik dapat menyelesaikan soal cerita sederhana penjumlahan dua bilangan cacah hasil maksimal 10.',
      },
      {
        kode_tp: 'TP 1.3',
        deskripsi: 'Mengenal dan membedakan bentuk bangun datar sederhana (segitiga, segi empat, lingkaran) dari benda-benda di sekitar kelas.',
        lingkup_materi: 'Bentuk Bangun Datar Sederhana',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi benda yang permukaannya berbentuk lingkaran atau segi empat.',
      },
    ],
  },
  {
    id: 'mapel-sd-ppkn-1',
    kode_mapel: 'PPKN-SD-1-FA',
    nama_mapel: 'Pendidikan Pancasila SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 1',
    fase_kurikulum: 'Fase A (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 1.1',
        deskripsi: 'Mengenal simbol dan bunyi 5 sila Pancasila serta Garuda Pancasila sebagai lambang negara Republik Indonesia.',
        lingkup_materi: 'Simbol Sila-Sila Pancasila',
        indikator_asesmen: 'Peserta didik dapat mencocokkan gambar simbol bintang, rantai, pohon beringin dengan sila Pancasila yang tepat.',
      },
      {
        kode_tp: 'TP 1.2',
        deskripsi: 'Mengidentifikasi aturan-aturan sederhana yang berlaku di rumah (merapikan tempat tidur, membantu orang tua) dan di sekolah.',
        lingkup_materi: 'Aturan di Rumah dan di Sekolah',
        indikator_asesmen: 'Peserta didik dapat membedakan contoh perilaku tertib dan tidak tertib saat belajar di kelas.',
      },
    ],
  },
  {
    id: 'mapel-sd-seni-1',
    kode_mapel: 'SENI-SD-1-FA',
    nama_mapel: 'Seni Rupa & Prakarya SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 1',
    fase_kurikulum: 'Fase A (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 1.1',
        deskripsi: 'Mengenal unsur rupa dasar berupa aneka garis (lurus, lengkung, zig-zag) dan warna primer (merah, kuning, biru).',
        lingkup_materi: 'Garis dan Warna Dasar',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi warna primer dan jenis garis pada karya gambar.',
      },
    ],
  },
  {
    id: 'mapel-sd-pjok-1',
    kode_mapel: 'PJOK-SD-1-FA',
    nama_mapel: 'PJOK SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 1',
    fase_kurikulum: 'Fase A (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 1.1',
        deskripsi: 'Mempraktikkan gerak dasar lokomotor (berjalan, berlari, melompat) dan non-lokomotor (memutar, menekuk) dengan benar.',
        lingkup_materi: 'Pola Gerak Dasar Lokomotor',
        indikator_asesmen: 'Peserta didik dapat membedakan gerak berpindah tempat (lokomotor) dan tidak berpindah tempat.',
      },
    ],
  },
  {
    id: 'mapel-sd-bing-1',
    kode_mapel: 'BIG-SD-1-FA',
    nama_mapel: 'Bahasa Inggris SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 1',
    fase_kurikulum: 'Fase A (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 1.1',
        deskripsi: 'Merespons salam dan sapaan sederhana (Hello, Good Morning, How are you) serta memperkenalkan nama diri dalam bahasa Inggris.',
        lingkup_materi: 'Greetings & Introductions',
        indikator_asesmen: 'Peserta didik dapat merespons salam sapaan pagi dan petang dengan pilihan kata yang tepat.',
      },
    ],
  },

  // --- KELAS 2 (FASE A) ---
  {
    id: 'mapel-sd-bin-2',
    kode_mapel: 'BIN-SD-2-FA',
    nama_mapel: 'Bahasa Indonesia SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 2',
    fase_kurikulum: 'Fase A (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 2.1',
        deskripsi: 'Membaca lancar teks naratif 3-4 kalimat dan menemukan informasi rinci terkait perasaan dan pengalaman tokoh.',
        lingkup_materi: 'Membaca Lancar & Kosakata Perasaan',
        indikator_asesmen: 'Peserta didik dapat menyimpulkan suasana perasaan tokoh dalam cerita yang dibaca.',
      },
      {
        kode_tp: 'TP 2.2',
        deskripsi: 'Menulis kalimat sederhana dengan penggunaan huruf kapital di awal kalimat serta tanda titik (.) dan tanda tanya (?) yang tepat.',
        lingkup_materi: 'Huruf Kapital & Tanda Baca Dasar',
        indikator_asesmen: 'Disajikan kalimat tanpa tanda baca, peserta didik dapat memperbaiki penulisan huruf kapital dan tanda bacanya.',
      },
      {
        kode_tp: 'TP 2.3',
        deskripsi: 'Membedakan fakta dan fiksi sederhana dari fabel atau cerita binatang fiktif bertema tolong-menolong.',
        lingkup_materi: 'Fabel & Nilai Budi Pekerti',
        indikator_asesmen: 'Peserta didik dapat menentukan pesan moral yang terkandung dalam fabel yang disajikan.',
      },
    ],
  },
  {
    id: 'mapel-sd-mat-2',
    kode_mapel: 'MAT-SD-2-FA',
    nama_mapel: 'Matematika SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 2',
    fase_kurikulum: 'Fase A (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 2.1',
        deskripsi: 'Membaca, menuliskan, dan menentukan nilai tempat (ratusan, puluhan, satuan) pada bilangan cacah sampai 100.',
        lingkup_materi: 'Nilai Tempat Bilangan Cacah',
        indikator_asesmen: 'Peserta didik dapat menentukan nilai tempat angka tertentu pada bilangan ratusan (misal: angka 7 pada 174).',
      },
      {
        kode_tp: 'TP 2.2',
        deskripsi: 'Menyelesaikan operasi penjumlahan dan pengurangan bilangan cacah sampai 100 dengan teknik menyimpan dan meminjam.',
        lingkup_materi: 'Penjumlahan & Pengurangan Menyimpan',
        indikator_asesmen: 'Peserta didik dapat menghitung hasil operasi bersusun pendek penjumlahan dua bilangan puluhan.',
      },
      {
        kode_tp: 'TP 2.3',
        deskripsi: 'Memahami konsep perkalian sebagai penjumlahan berulang dan pembagian sebagai pengurangan berulang.',
        lingkup_materi: 'Konsep Perkalian & Pembagian Dasar',
        indikator_asesmen: 'Disajikan kelompok benda yang sama banyak, peserta didik dapat menuliskan bentuk kalimat matematika perkaliannya.',
      },
      {
        kode_tp: 'TP 2.4',
        deskripsi: 'Mengukur panjang benda dengan satuan baku (centimeter / cm dan meter / m) menggunakan penggaris dan meteran.',
        lingkup_materi: 'Pengukuran Panjang Baku',
        indikator_asesmen: 'Peserta didik dapat membaca hasil pengukuran panjang pensil pada skala penggaris.',
      },
    ],
  },
  {
    id: 'mapel-sd-ppkn-2',
    kode_mapel: 'PPKN-SD-2-FA',
    nama_mapel: 'Pendidikan Pancasila SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 2',
    fase_kurikulum: 'Fase A (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 2.1',
        deskripsi: 'Menjelaskan hubungan simbol-simbol sila Pancasila dengan lambang negara Garuda Pancasila dan perilaku sehari-hari.',
        lingkup_materi: 'Penerapan Sila Pancasila di Sekolah',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi perilaku rukun antar teman sebagai cerminan sila kedua dan ketiga Pancasila.',
      },
      {
        kode_tp: 'TP 2.2',
        deskripsi: 'Mengenal keberagaman karakteristik individu (jenis kelamin, hobi, agama) di lingkungan sekolah dan cara menghormatinya.',
        lingkup_materi: 'Keberagaman Individu di Sekolah',
        indikator_asesmen: 'Peserta didik dapat menentukan sikap toleransi terhadap teman yang berbeda suku atau agama.',
      },
    ],
  },
  {
    id: 'mapel-sd-seni-2',
    kode_mapel: 'SENI-SD-2-FA',
    nama_mapel: 'Seni Rupa & Prakarya SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 2',
    fase_kurikulum: 'Fase A (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 2.1',
        deskripsi: 'Membuat karya kolase dan pola bentuk berulang menggunakan bahan alam (daun kering, ranting, biji-bijian).',
        lingkup_materi: 'Karya Kolase & Bahan Alam',
        indikator_asesmen: 'Peserta didik dapat mengelompokkan bahan alam dan bahan buatan untuk pembuatan karya kolase.',
      },
    ],
  },
  {
    id: 'mapel-sd-pjok-2',
    kode_mapel: 'PJOK-SD-2-FA',
    nama_mapel: 'PJOK SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 2',
    fase_kurikulum: 'Fase A (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 2.1',
        deskripsi: 'Mempraktikkan gerak dasar manipulatif (melempar, menangkap, menendang bola) dengan koordinasi mata dan tangan yang baik.',
        lingkup_materi: 'Pola Gerak Dasar Manipulatif',
        indikator_asesmen: 'Peserta didik dapat menentukan teknik melempar bola lambung dan bola mendatar.',
      },
    ],
  },

  // =========================================================================
  // FASE B: KELAS 3 DAN KELAS 4 SD
  // (Mata pelajaran IPAS dimulai secara resmi pada Fase B)
  // =========================================================================

  // --- KELAS 3 (FASE B) ---
  {
    id: 'mapel-sd-ipas-3',
    kode_mapel: 'IPAS-SD-3-FB',
    nama_mapel: 'IPAS (Ilmu Pengetahuan Alam & Sosial) SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 3',
    fase_kurikulum: 'Fase B (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 3.1',
        deskripsi: 'Menganalisis siklus hidup dan metamorfosis makhluk hidup (kupu-kupu, katak, nyamuk, ayam) serta upaya pelestariannya.',
        lingkup_materi: 'Siklus Hidup Hewan & Metamorfosis',
        indikator_asesmen: 'Disajikan bagan metamorfosis serangga, peserta didik dapat mengurutkan fase tahapan metamorfosis sempurna dengan benar.',
      },
      {
        kode_tp: 'TP 3.2',
        deskripsi: 'Mengidentifikasi sumber-sumber energi di lingkungan sekitar dan perubahan bentuk energi dalam kehidupan sehari-hari.',
        lingkup_materi: 'Energi & Perubahannya',
        indikator_asesmen: 'Peserta didik dapat menentukan perubahan bentuk energi yang terjadi pada alat elektronik rumah tangga (misal: setrika, kipas angin).',
      },
      {
        kode_tp: 'TP 3.3',
        deskripsi: 'Menjelaskan denah dan lingkungan tempat tinggal (RT, RW, Desa/Kelurahan) serta bentang alam setempat.',
        lingkup_materi: 'Denah Lingkungan & Kenampakan Alam',
        indikator_asesmen: 'Disajikan gambar denah sederhana dengan arah mata angin, peserta didik dapat menentukan letak suatu bangunan.',
      },
    ],
  },
  {
    id: 'mapel-sd-mat-3',
    kode_mapel: 'MAT-SD-3-FB',
    nama_mapel: 'Matematika SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 3',
    fase_kurikulum: 'Fase B (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 3.1',
        deskripsi: 'Membaca, menulis, dan membandingkan bilangan cacah sampai dengan 1.000 serta menentukan nilai tempatnya.',
        lingkup_materi: 'Bilangan Cacah sampai 1.000',
        indikator_asesmen: 'Peserta didik dapat mengurutkan sekelompok bilangan cacah ribuan dari nilai terkecil ke terbesar.',
      },
      {
        kode_tp: 'TP 3.2',
        deskripsi: 'Melakukan operasi perkalian dan pembagian bilangan cacah sampai 100 dengan berbagai strategi penyelesaian masalah.',
        lingkup_materi: 'Operasi Perkalian & Pembagian',
        indikator_asesmen: 'Peserta didik dapat menyelesaikan soal cerita kontekstual pembagian bilangan cacah.',
      },
      {
        kode_tp: 'TP 3.3',
        deskripsi: 'Mengenal pecahan sederhana (1/2, 1/3, 1/4) menggunakan gambar berbayang atau benda konkret yang dipotong.',
        lingkup_materi: 'Pecahan Sederhana',
        indikator_asesmen: 'Peserta didik dapat menentukan nilai pecahan dari bagian gambar yang diarsir.',
      },
      {
        kode_tp: 'TP 3.4',
        deskripsi: 'Menentukan hubungan antarsatuan waktu baku (jam, menit, detik) dan membaca tanda waktu pada jam analog.',
        lingkup_materi: 'Pengukuran Waktu Baku',
        indikator_asesmen: 'Disajikan posisi jarum jam analog, peserta didik dapat membaca waktu kegiatan dengan tepat.',
      },
    ],
  },
  {
    id: 'mapel-sd-bin-3',
    kode_mapel: 'BIN-SD-3-FB',
    nama_mapel: 'Bahasa Indonesia SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 3',
    fase_kurikulum: 'Fase B (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 3.1',
        deskripsi: 'Menemukan ide pokok dan informasi tersurat dari teks bacaan tentang pelestarian hewan dan tumbuhan langka.',
        lingkup_materi: 'Ide Pokok Teks Informasi',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi ide pokok pada paragraf yang disajikan.',
      },
      {
        kode_tp: 'TP 3.2',
        deskripsi: 'Menyusun kalimat efektif menggunakan kata tanya (apa, di mana, kapan, siapa, mengapa, bagaimana) untuk wawancara sederhana.',
        lingkup_materi: 'Kalimat Tanya ADiKSiMBa',
        indikator_asesmen: 'Peserta didik dapat memilih kata tanya yang sesuai untuk melengkapi kalimat wawancara.',
      },
    ],
  },
  {
    id: 'mapel-sd-ppkn-3',
    kode_mapel: 'PPKN-SD-3-FB',
    nama_mapel: 'Pendidikan Pancasila SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 3',
    fase_kurikulum: 'Fase B (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 3.1',
        deskripsi: 'Mengidentifikasi makna semboyan Bhinneka Tunggal Ika dalam keragaman suku, bahasa daerah, dan budaya di Indonesia.',
        lingkup_materi: 'Bhinneka Tunggal Ika',
        indikator_asesmen: 'Peserta didik dapat memberikan contoh sikap menghormati teman yang berasal dari suku daerah berbeda.',
      },
      {
        kode_tp: 'TP 3.2',
        deskripsi: 'Menjelaskan hak dan kewajiban peserta didik sebagai anggota keluarga dan warga sekolah dalam menjaga kebersihan lingkungan.',
        lingkup_materi: 'Hak dan Kewajiban Siswa',
        indikator_asesmen: 'Peserta didik dapat membedakan mana yang merupakan hak dan mana yang merupakan kewajiban di sekolah.',
      },
    ],
  },

  // --- KELAS 4 (FASE B) ---
  {
    id: 'mapel-sd-mat-4',
    kode_mapel: 'MAT-SD-4-FB',
    nama_mapel: 'Matematika SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 4',
    fase_kurikulum: 'Fase B (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 4.1',
        deskripsi: 'Menentukan kelipatan persekutuan terkecil (KPK) dan faktor persekutuan terbesar (FPB) dari dua bilangan cacah dalam konteks kehidupan sehari-hari.',
        lingkup_materi: 'Bilangan Cacah & Teori Bilangan (KPK FPB)',
        indikator_asesmen: 'Disajikan permasalahan kontekstual jadwal berkala, peserta didik dapat menentukan waktu pertemuan menggunakan konsep KPK.',
      },
      {
        kode_tp: 'TP 4.2',
        deskripsi: 'Mengubah dan membandingkan berbagai bentuk pecahan biasa, pecahan campuran, desimal, dan persentase.',
        lingkup_materi: 'Pecahan & Desimal',
        indikator_asesmen: 'Peserta didik dapat mengubah pecahan biasa menjadi bentuk desimal dan persentase yang senilai.',
      },
      {
        kode_tp: 'TP 4.3',
        deskripsi: 'Menghitung keliling dan luas bangun datar (persegi, persegi panjang, segitiga) menggunakan satuan baku.',
        lingkup_materi: 'Geometri & Pengukuran (Keliling Luas)',
        indikator_asesmen: 'Peserta didik dapat menghitung luas persegi panjang jika diketahui panjang dan lebarnya dalam satuan baku.',
      },
      {
        kode_tp: 'TP 4.4',
        deskripsi: 'Menyajikan dan menginterpretasikan data sederhana menggunakan diagram batang dan tabel frekuensi.',
        lingkup_materi: 'Analisis Data & Diagram Batang',
        indikator_asesmen: 'Disajikan diagram batang hasil panen, peserta didik dapat membaca selisih data tertinggi dan terendah.',
      },
    ],
  },
  {
    id: 'mapel-sd-ipas-4',
    kode_mapel: 'IPAS-SD-4-FB',
    nama_mapel: 'IPAS (Ilmu Pengetahuan Alam & Sosial) SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 4',
    fase_kurikulum: 'Fase B (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 4.1',
        deskripsi: 'Mengidentifikasi bagian-bagian tubuh tumbuhan (akar, batang, daun, bunga) dan memahami proses fotosintesis.',
        lingkup_materi: 'Bagian Tubuh Tumbuhan & Fotosintesis',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi zat yang diperlukan tumbuhan hijau untuk proses fotosintesis.',
      },
      {
        kode_tp: 'TP 4.2',
        deskripsi: 'Menganalisis wujud zat (padat, cair, gas) dan perubahan wujud zat dalam kehidupan sehari-hari (mencair, membeku, menguap, mengembun, menyublim).',
        lingkup_materi: 'Materi & Perubahan Wujud Zat',
        indikator_asesmen: 'Peserta didik dapat menentukan contoh perubahan wujud zat yang memerlukan atau melepaskan kalor.',
      },
      {
        kode_tp: 'TP 4.3',
        deskripsi: 'Mengenal kearifan lokal, keragaman budaya, dan bentang alam di daerah tempat tinggal peserta didik.',
        lingkup_materi: 'Kearifan Lokal & Keragaman Budaya',
        indikator_asesmen: 'Peserta didik dapat menganalisis peran kearifan lokal dalam menjaga kelestarian alam nusantara.',
      },
      {
        kode_tp: 'TP 4.4',
        deskripsi: 'Mendeskripsikan ragam gaya (otot, gesek, magnet, pegas, gravitasi) dan pengaruhnya terhadap gerak dan bentuk benda.',
        lingkup_materi: 'Gaya & Pengaruhnya terhadap Benda',
        indikator_asesmen: 'Peserta didik dapat menganalisis pengaruh gaya gesek dalam kegiatan olahraga atau berkendara.',
      },
    ],
  },
  {
    id: 'mapel-sd-bin-4',
    kode_mapel: 'BIN-SD-4-FB',
    nama_mapel: 'Bahasa Indonesia SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 4',
    fase_kurikulum: 'Fase B (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 4.1',
        deskripsi: 'Menemukan gagasan pokok dan gagasan pendukung dalam teks paragraf naratif dan informatif.',
        lingkup_materi: 'Ide Pokok & Gagasan Pendukung',
        indikator_asesmen: 'Peserta didik dapat membedakan kalimat utama dan kalimat penjelas dalam paragraf deduktif.',
      },
      {
        kode_tp: 'TP 4.2',
        deskripsi: 'Mengidentifikasi pembentukan kata berimbuhan awalan me- dan membedakan kalimat transitif serta intransitif.',
        lingkup_materi: 'Tata Bahasa, Imbuhan & Kalimat Transitif',
        indikator_asesmen: 'Peserta didik dapat menentukan kalimat yang memiliki objek penderita (kalimat transitif).',
      },
      {
        kode_tp: 'TP 4.3',
        deskripsi: 'Menyusun teks laporan wawancara sederhana dengan penggunaan kosakata baku dan tanda baca yang tepat.',
        lingkup_materi: 'Teks Laporan Wawancara',
        indikator_asesmen: 'Peserta didik dapat melengkapi bagian pembuka teks laporan hasil wawancara.',
      },
    ],
  },
  {
    id: 'mapel-sd-ppkn-4',
    kode_mapel: 'PPKN-SD-4-FB',
    nama_mapel: 'Pendidikan Pancasila SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 4',
    fase_kurikulum: 'Fase B (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 4.1',
        deskripsi: 'Mengidentifikasi makna sila-sila Pancasila dan penerapannya dalam kehidupan sehari-hari di rumah, sekolah, dan masyarakat.',
        lingkup_materi: 'Pancasila dalam Keseharian',
        indikator_asesmen: 'Peserta didik dapat menganalisis contoh musyawarah mufakat sebagai pengamalan sila keempat.',
      },
      {
        kode_tp: 'TP 4.2',
        deskripsi: 'Membedakan hak dan kewajiban sebagai anggota keluarga, warga sekolah, dan warga masyarakat dalam musyawarah.',
        lingkup_materi: 'Hak dan Kewajiban Berdemokrasi',
        indikator_asesmen: 'Peserta didik dapat menentukan kewajiban peserta dalam menerima hasil keputusan bersama.',
      },
    ],
  },
  {
    id: 'mapel-sd-bing-4',
    kode_mapel: 'BIG-SD-4-FB',
    nama_mapel: 'Bahasa Inggris SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 4',
    fase_kurikulum: 'Fase B (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 4.1',
        deskripsi: 'Mengekspresikan aktivitas sehari-hari yang sedang dilakukan (Present Continuous Tense) menggunakan gambar konteks.',
        lingkup_materi: 'Activities & Present Continuous Tense',
        indikator_asesmen: 'Peserta didik dapat melengkapi kalimat kegiatan sedang berlangsung dengan kata kerja berakhiran -ing.',
      },
    ],
  },
  {
    id: 'mapel-sd-pjok-4',
    kode_mapel: 'PJOK-SD-4-FB',
    nama_mapel: 'PJOK SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 4',
    fase_kurikulum: 'Fase B (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 4.1',
        deskripsi: 'Mempraktikkan variasi pola gerak dasar lokomotor, non-lokomotor, dan manipulatif pada permainan bola kasti dan rounders.',
        lingkup_materi: 'Permainan Bola Kecil (Kasti)',
        indikator_asesmen: 'Peserta didik dapat menentukan posisi dan cara memukul bola kasti mendatar dan melambung.',
      },
    ],
  },
  {
    id: 'mapel-sd-seni-4',
    kode_mapel: 'SENI-SD-4-FB',
    nama_mapel: 'Seni Rupa & Budaya SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 4',
    fase_kurikulum: 'Fase B (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 4.1',
        deskripsi: 'Mengenal dan membuat motif ragam hias dekoratif geometris dan flora dari kebudayaan daerah Indonesia.',
        lingkup_materi: 'Ragam Hias Dekoratif Daerah',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi ciri motif ragam hias tradisional nusantara.',
      },
    ],
  },

  // =========================================================================
  // FASE C: KELAS 5 DAN KELAS 6 SD
  // =========================================================================

  // --- KELAS 5 (FASE C) ---
  {
    id: 'mapel-sd-mat-5',
    kode_mapel: 'MAT-SD-5-FC',
    nama_mapel: 'Matematika SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 5',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 5.1',
        deskripsi: 'Menyelesaikan operasi hitung penjumlahan dan pengurangan pecahan dengan penyebut berbeda serta perkalian pecahan.',
        lingkup_materi: 'Operasi Pecahan Campuran & Desimal',
        indikator_asesmen: 'Peserta didik dapat menghitung hasil penjumlahan pecahan berpenyebut tidak sama dalam bentuk paling sederhana.',
      },
      {
        kode_tp: 'TP 5.2',
        deskripsi: 'Menentukan skala dan rasio perbandingan pada denah dan peta geografis untuk menghitung jarak sebenarnya.',
        lingkup_materi: 'Perbandingan & Skala Peta',
        indikator_asesmen: 'Disajikan skala peta dan jarak pada peta, peserta didik dapat menentukan jarak sebenarnya dalam kilometer.',
      },
      {
        kode_tp: 'TP 5.3',
        deskripsi: 'Menghitung volume kubus dan balok serta memahami jaring-jaring bangun ruang sederhana.',
        lingkup_materi: 'Bangun Ruang & Volume Kubus Balok',
        indikator_asesmen: 'Peserta didik dapat menentukan volume balok air dengan ukuran panjang, lebar, dan tinggi yang diberikan.',
      },
    ],
  },
  {
    id: 'mapel-sd-ipas-5',
    kode_mapel: 'IPAS-SD-5-FC',
    nama_mapel: 'IPAS (Ilmu Pengetahuan Alam & Sosial) SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 5',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 5.1',
        deskripsi: 'Menganalisis hubungan antar makhluk hidup pada rantai makanan dan jaring-jaring makanan dalam ekosistem alam.',
        lingkup_materi: 'Ekosistem & Rantai Makanan',
        indikator_asesmen: 'Disajikan bagan jaring-jaring makanan sawah, peserta didik dapat memprediksi dampak jika populasi salah satu komponen punah.',
      },
      {
        kode_tp: 'TP 5.2',
        deskripsi: 'Menganalisis cara perpindahan kalor secara konduksi, konveksi, dan radiasi serta pemanfaatannya dalam teknologi sederhana.',
        lingkup_materi: 'Energi Panas & Perpindahan Kalor',
        indikator_asesmen: 'Peserta didik dapat membedakan contoh peristiwa konduksi, konveksi, dan radiasi pada kehidupan sehari-hari.',
      },
      {
        kode_tp: 'TP 5.3',
        deskripsi: 'Menjelaskan sistem organ pernapasan dan pencernaan manusia serta cara memelihara kesehatannya.',
        lingkup_materi: 'Sistem Organ Tubuh Manusia',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi fungsi organ lambung dan usus halus pada proses pencernaan mekanik dan kimiawi.',
      },
      {
        kode_tp: 'TP 5.4',
        deskripsi: 'Menganalisis peristiwa kedatangan bangsa-bangsa Eropa dan perjuangan pahlawan nasional mempertahankan kemerdekaan RI.',
        lingkup_materi: 'Sejarah Perjuangan Bangsa',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi faktor pemicu kedatangan bangsa Eropa dan perlawanan tokoh daerah.',
      },
    ],
  },
  {
    id: 'mapel-sd-bin-5',
    kode_mapel: 'BIN-SD-5-FC',
    nama_mapel: 'Bahasa Indonesia SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 5',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 5.1',
        deskripsi: 'Membedakan fakta dan opini dalam teks eksplanasi ilmiah dan artikel surat kabar bertema lingkungan hidup.',
        lingkup_materi: 'Teks Eksplanasi, Fakta & Opini',
        indikator_asesmen: 'Disajikan kutipan artikel berita, peserta didik dapat membedakan kalimat berisi fakta teruji dan opini subjektif.',
      },
      {
        kode_tp: 'TP 5.2',
        deskripsi: 'Menulis teks narasi fiksi atau pengalaman pribadi dengan memperhatikan unsur intrinsik (tokoh, latar, alur, amanat).',
        lingkup_materi: 'Menulis Narasi & Unsur Intrinsik',
        indikator_asesmen: 'Peserta didik dapat menganalisis watak tokoh cerita berdasarkan dialog dan tindakan tokoh.',
      },
    ],
  },
  {
    id: 'mapel-sd-ppkn-5',
    kode_mapel: 'PPKN-SD-5-FC',
    nama_mapel: 'Pendidikan Pancasila SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 5',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 5.1',
        deskripsi: 'Menganalisis pelaksanaan nilai-nilai Pancasila dalam membangun kerukunan hidup bermasyarakat multikultural.',
        lingkup_materi: 'Pancasila & Kerukunan Hidup Berbangsa',
        indikator_asesmen: 'Peserta didik dapat menganalisis sikap gotong royong sebagai pengamalan nilai luhur Pancasila.',
      },
      {
        kode_tp: 'TP 5.2',
        deskripsi: 'Menelaah bentuk norma, aturan, dan sanksi yang berlaku dalam tata tertib masyarakat serta lembaga pemerintahan daerah.',
        lingkup_materi: 'Norma dan Ketaatan Hukum',
        indikator_asesmen: 'Peserta didik dapat membedakan norma kesusilaan, norma kesopanan, norma agama, dan norma hukum.',
      },
    ],
  },
  {
    id: 'mapel-sd-bing-5',
    kode_mapel: 'BIG-SD-5-FC',
    nama_mapel: 'Bahasa Inggris SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 5',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 5.1',
        deskripsi: 'Menggunakan ungkapan kegiatan sehari-hari (daily routines) dengan Simple Present Tense yang tepat.',
        lingkup_materi: 'Daily Activities & Simple Present',
        indikator_asesmen: 'Peserta didik dapat melengkapi kalimat kebiasaan harian dengan bentuk kata kerja ketiga tunggal (verb + s/es).',
      },
      {
        kode_tp: 'TP 5.2',
        deskripsi: 'Mendeskripsikan harga barang dan transaksi berbelanja (shopping & prices) dalam bahasa Inggris sederhana.',
        lingkup_materi: 'Shopping, Numbers & Prices',
        indikator_asesmen: 'Peserta didik dapat menjawab pertanyaan total belanja berdasarkan daftar menu dan harga.',
      },
    ],
  },
  {
    id: 'mapel-sd-pabp-5',
    kode_mapel: 'PABP-SD-5-FC',
    nama_mapel: 'Pendidikan Agama & Budi Pekerti SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 5',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 5.1',
        deskripsi: 'Meneladani sifat-sifat mulia nabi dan rasul serta mengamalkan akhlak terpuji (jujur, amanah, pemaaf) terhadap sesama manusia.',
        lingkup_materi: 'Akhlak Mulia & Keteladanan Rasul',
        indikator_asesmen: 'Peserta didik dapat menganalisis contoh perilaku amanah dalam melaksanakan tugas piket sekolah.',
      },
    ],
  },
  {
    id: 'mapel-sd-pjok-5',
    kode_mapel: 'PJOK-SD-5-FC',
    nama_mapel: 'PJOK SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 5',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 5.1',
        deskripsi: 'Mempraktikkan variasi dan kombinasi pola gerak dasar lokomotor, non-lokomotor, dan manipulatif permainan bola besar (sepak bola, voli, basket).',
        lingkup_materi: 'Permainan Bola Besar',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi teknik mengoper bola (passing) bawah pada permainan bola voli.',
      },
    ],
  },
  {
    id: 'mapel-sd-seni-5',
    kode_mapel: 'SENI-SD-5-FC',
    nama_mapel: 'Seni Rupa & Budaya SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 5',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 5.1',
        deskripsi: 'Mengenal prinsip ritme, proporsi, dan perspektif dalam karya seni rupa dua dimensi dan ragam hias nusantara.',
        lingkup_materi: 'Ragam Hias & Perspektif Seni Rupa',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi unsur proporsi dan keseimbangan pada gambar perspektif.',
      },
    ],
  },

  // --- KELAS 6 (FASE C) ---
  {
    id: 'mapel-sd-mat-6',
    kode_mapel: 'MAT-SD-6-FC',
    nama_mapel: 'Matematika SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 6',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 6.1',
        deskripsi: 'Menjelaskan bilangan bulat negatif serta menyelesaikan operasi penjumlahan dan pengurangannya dalam garis bilangan kontekstual (suhu, kedalaman laut).',
        lingkup_materi: 'Bilangan Bulat Negatif & Garis Bilangan',
        indikator_asesmen: 'Peserta didik dapat menyelesaikan soal cerita perubahan suhu beku di daerah kutub menggunakan bilangan bulat.',
      },
      {
        kode_tp: 'TP 6.2',
        deskripsi: 'Menghitung keliling dan luas lingkaran menggunakan nilai pendekatan pi (22/7 atau 3,14) dalam konteks benda nyata.',
        lingkup_materi: 'Lingkaran (Keliling, Luas, & Bagiannya)',
        indikator_asesmen: 'Peserta didik dapat menghitung luas lingkaran jika diketahui panjang jari-jari atau diameternya.',
      },
      {
        kode_tp: 'TP 6.3',
        deskripsi: 'Menentukan luas permukaan dan volume bangun ruang gabungan (kubus, balok, tabung, kerucut).',
        lingkup_materi: 'Bangun Ruang Gabungan & Volume Tabung',
        indikator_asesmen: 'Peserta didik dapat menghitung volume tabung penampungan air jika diketahui jari-jari alas dan tingginya.',
      },
      {
        kode_tp: 'TP 6.4',
        deskripsi: 'Menganalisis ukuran pemusatan data tunggal (mean, median, modus) dari kumpulan data hasil asesmen atau berat badan.',
        lingkup_materi: 'Statistika Data (Mean, Median, Modus)',
        indikator_asesmen: 'Peserta didik dapat menghitung nilai rata-rata (mean) dari tabel frekuensi nilai asesmen siswa.',
      },
    ],
  },
  {
    id: 'mapel-sd-ipas-6',
    kode_mapel: 'IPAS-SD-6-FC',
    nama_mapel: 'IPAS (Ilmu Pengetahuan Alam & Sosial) SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 6',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 6.1',
        deskripsi: 'Menganalisis sistem tata surya, karakteristik planet-planet, serta dampak rotasi dan revolusi bumi bagi kehidupan.',
        lingkup_materi: 'Tata Surya & Gerak Rotasi Revolusi Bumi',
        indikator_asesmen: 'Peserta didik dapat menjelaskan peristiwa pergantian musim dan perbedaan zona waktu akibat gerak bumi.',
      },
      {
        kode_tp: 'TP 6.2',
        deskripsi: 'Mengidentifikasi komponen listrik (baterai, sakelar, kabel, lampu) serta membedakan rangkaian listrik seri dan paralel.',
        lingkup_materi: 'Kelistrikan & Rangkaian Seri Paralel',
        indikator_asesmen: 'Peserta didik dapat menganalisis nyala lampu dan konsekuensi jika salah satu lampu padam pada rangkaian paralel.',
      },
      {
        kode_tp: 'TP 6.3',
        deskripsi: 'Menganalisis posisi dan peran Indonesia dalam kerja sama ekonomi, politik, dan sosial budaya di tingkat kawasan ASEAN.',
        lingkup_materi: 'Peran Indonesia dalam ASEAN',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi peran Indonesia dalam deklarasi kawasan bebas senjata nuklir di ASEAN.',
      },
      {
        kode_tp: 'TP 6.4',
        deskripsi: 'Menganalisis bentuk adaptasi hewan dan tumbuhan (morfologi, fisiologi, tingkah laku) untuk bertahan hidup di habitatnya.',
        lingkup_materi: 'Adaptasi Makhluk Hidup & Pelestarian Alam',
        indikator_asesmen: 'Peserta didik dapat menentukan bentuk adaptasi tumbuhan gurun (kaktus) dalam mengurangi penguapan air.',
      },
    ],
  },
  {
    id: 'mapel-sd-bin-6',
    kode_mapel: 'BIN-SD-6-FC',
    nama_mapel: 'Bahasa Indonesia SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 6',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 6.1',
        deskripsi: 'Menganalisis struktur teks pidato persuasif (salam pembuka, pendahuluan, inti, penutup) dan menyusun kerangka pidato bertema perpisahan atau kepemimpinan.',
        lingkup_materi: 'Teks Pidato Persuasif',
        indikator_asesmen: 'Peserta didik dapat menentukan bagian ajakan persuasif pada teks pidato yang disajikan.',
      },
      {
        kode_tp: 'TP 6.2',
        deskripsi: 'Mengisi teks formulir (pendaftaran, wesel pos, kartu anggota perpustakaan, lembar jawaban asesmen) dengan data diri yang valid.',
        lingkup_materi: 'Teks Formulir & Petunjuk Pengisian',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi data yang harus diisikan pada formulir pendaftaran kegiatan sekolah.',
      },
    ],
  },
  {
    id: 'mapel-sd-ppkn-6',
    kode_mapel: 'PPKN-SD-6-FC',
    nama_mapel: 'Pendidikan Pancasila SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 6',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 6.1',
        deskripsi: 'Meneladani nilai-nilai juang para tokoh perumus Pancasila (BPUPKI dan PPKI) serta proklamasi kemerdekaan 17 Agustus 1945.',
        lingkup_materi: 'Nilai Juang Perumus Pancasila & Proklamasi',
        indikator_asesmen: 'Peserta didik dapat menganalisis sikap berjiwa besar para pendiri bangsa dalam mencapai mufakat piagam Jakarta.',
      },
      {
        kode_tp: 'TP 6.2',
        deskripsi: 'Mempertahankan persatuan dan kesatuan bangsa dalam wadah Negara Kesatuan Republik Indonesia (NKRI).',
        lingkup_materi: 'Menjaga Keutuhan NKRI & Wawasan Nusantara',
        indikator_asesmen: 'Peserta didik dapat mengidentifikasi perilaku yang dapat memupuk persatuan di tengah kemajemukan bangsa.',
      },
    ],
  },
  {
    id: 'mapel-sd-bing-6',
    kode_mapel: 'BIG-SD-6-FC',
    nama_mapel: 'Bahasa Inggris SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 6',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 6.1',
        deskripsi: 'Menceritakan peristiwa masa lalu (Past Simple Tense) menggunakan kata kerja lampau reguler dan ireguler (visited, went, saw).',
        lingkup_materi: 'Past Activities & Simple Past Tense',
        indikator_asesmen: 'Peserta didik dapat memilih bentuk kata kerja lampau yang tepat untuk melengkapi kalimat tentang liburan.',
      },
    ],
  },
  {
    id: 'mapel-sd-pjok-6',
    kode_mapel: 'PJOK-SD-6-FC',
    nama_mapel: 'PJOK SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 6',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 6.1',
        deskripsi: 'Mempraktikkan variasi dan kombinasi gerak dasar atletik (lari jarak pendek, lompat jauh, tolak peluru sederhana) dengan percaya diri.',
        lingkup_materi: 'Nomor Atletik (Lari, Lompat, Lempar)',
        indikator_asesmen: 'Peserta didik dapat menentukan teknik start jongkok pada lari jarak pendek.',
      },
    ],
  },
  {
    id: 'mapel-sd-seni-6',
    kode_mapel: 'SENI-SD-6-FC',
    nama_mapel: 'Seni Rupa & Budaya SD',
    jenjang_sekolah: 'SD',
    tingkat_kelas: 'Kelas 6',
    fase_kurikulum: 'Fase C (Kurikulum Merdeka)',
    daftar_tp: [
      {
        kode_tp: 'TP 6.1',
        deskripsi: 'Merancang dan membuat karya seni patung 3 dimensi dari bahan lunak (plastisin, tanah liat) atau teknik cetak sederhana.',
        lingkup_materi: 'Seni Patung 3 Dimensi & Cetak Saring',
        indikator_asesmen: 'Peserta didik dapat membedakan teknik pahat, teknik butsir, dan teknik cetak dalam pembuatan karya patung.',
      },
    ],
  },
];
