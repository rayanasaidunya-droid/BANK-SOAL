export type JenisSoal = 'PILIHAN_GANDA' | 'PG_KOMPLEKS' | 'ISIAN_SINGKAT' | 'ESAI_URAIAN';
export type LevelKognitif = 'L1' | 'L2' | 'L3'; // L1: Pemahaman, L2: Aplikasi, L3: Penalaran / HOTS
export type StatusValidasi = 'DRAFT' | 'MENUNGGU_VALIDASI' | 'TERVALIDASI' | 'PERLU_REVISI';
export type StatusPaket = 'DRAFT' | 'TERKUNCI';
export type KodeVarianPaket = 'A' | 'B' | 'CADANGAN';
export type StatusPengerjaanSiswa = 'BELUM_MULAI' | 'SEDANG_MENGERJAKAN' | 'TERKUNCI_PELANGGARAN' | 'SELESAI';

export type UserRole = 'KOORDINATOR_KURIKULUM' | 'GURU_PENULIS' | 'PROKTOR_PENGAWAS' | 'SISWA_CBT';

export type JenjangSekolah = 'SD' | 'SMP' | 'SMA';

export interface TujuanPembelajaranInfo {
  kode_tp: string;
  deskripsi: string;
  lingkup_materi: string;
  indikator_asesmen?: string;
}

export interface MataPelajaranKurikulum {
  id: string;
  kode_mapel: string;
  nama_mapel: string;
  jenjang_sekolah: JenjangSekolah;
  tingkat_kelas: string;
  fase_kurikulum: string;
  daftar_tp?: TujuanPembelajaranInfo[];
}

export interface OpsiJawaban {
  id: string;
  label: string; // 'A', 'B', 'C', 'D', 'E'
  teks: string;
}

export interface BankSoalButir {
  id: string;
  mapel_id: string;
  jenjang_sekolah?: JenjangSekolah;
  tingkat_kelas?: string;
  fase_kurikulum?: string;
  jenis_soal: JenisSoal;
  level_kognitif: LevelKognitif;
  kode_tp?: string;
  tujuan_pembelajaran?: string;
  lingkup_materi?: string;
  indikator_soal?: string;
  capaian_pembelajaran: string;
  stimulus_konten: string; // wacana / tabel / teks kontekstual
  stimulus_gambar_url?: string;
  pertanyaan_teks: string; // teks pertanyaan (mendukung KaTeX)
  opsi_jawaban_json: OpsiJawaban[];
  kunci_jawaban_terenkripsi: string | string[]; // Zero-Leakage: disembunyikan dari siswa
  bobot_nilai: number;
  rubrik_penilaian_esai?: string;
  status_validasi: StatusValidasi;
  catatan_revisi?: string;
  penulis_guru_id: string;
  nama_penulis: string;
  created_at: string;
  updated_at: string;
}

export interface PaketUjian {
  id: string;
  kode_ujian: string;
  judul_ujian: string;
  mapel_id: string;
  durasi_menit: number;
  total_soal_pg: number;
  total_soal_esai: number;
  acak_nomor_soal: boolean;
  acak_opsi_jawaban: boolean;
  status_paket: StatusPaket; // BL-EXAM-002: Freeze
  tanggal_kunci?: string;
  target_l1: number;
  target_l2: number;
  target_l3: number;
  varian_tersedia: KodeVarianPaket[];
  created_at: string;
}

export interface PaketUjianSoalItem {
  id: string;
  paket_ujian_id: string;
  butir_soal_id: string;
  kode_varian_paket: KodeVarianPaket;
  nomor_urut: number;
  butir_soal?: BankSoalButir;
}

export interface CatatanPelanggaran {
  timestamp: string;
  jenis: 'BLUR_TAB' | 'EXIT_FULLSCREEN' | 'DEVTOOLS' | 'SHORTCUT_ATTEMPT' | 'OFFLINE';
  detail: string;
}

export interface SesiUjianSiswaCBT {
  id: string;
  paket_ujian_id: string;
  kode_varian_paket: KodeVarianPaket;
  siswa_id: string;
  nomor_peserta: string;
  nama_siswa: string;
  kelas: string;
  waktu_mulai: string;
  waktu_selesai?: string;
  sisa_detik: number;
  // Format jawaban: id_butir -> { jawaban: string | string[], ragu: boolean, waktu_simpan: string }
  jawaban_siswa_json: Record<string, {
    jawaban: string | string[];
    ragu: boolean;
    waktu_simpan: string;
  }>;
  skor_otomatis_pg: number | null;
  skor_esai_manual: number | null;
  total_skor_akhir: number | null;
  jumlah_pelanggaran_tab: number;
  status_pengerjaan: StatusPengerjaanSiswa;
  riwayat_pelanggaran: CatatanPelanggaran[];
  terakhir_aktif: string;
  ip_address?: string;
}

export interface ActivityAuditLog {
  id: string;
  user_id: string;
  user_nama: string;
  role: string;
  action: string;
  entity_name: string;
  entity_id: string;
  timestamp: string;
  detail: string;
}

export interface ProctorTokenInfo {
  token: string;
  paket_ujian_id: string;
  kode_ujian: string;
  judul_ujian: string;
  dibuat_pada: string;
  berlaku_sampai: string;
  is_active: boolean;
  ruang_lab: string;
}

// Client-safe version of BankSoalButir without answers (Zero-Leakage)
export interface ClientSoalItem {
  id: string;
  nomor_urut: number;
  jenis_soal: JenisSoal;
  level_kognitif: LevelKognitif;
  kode_tp?: string;
  tujuan_pembelajaran?: string;
  lingkup_materi?: string;
  capaian_pembelajaran: string;
  stimulus_konten: string;
  stimulus_gambar_url?: string;
  pertanyaan_teks: string;
  opsi_jawaban_json: OpsiJawaban[];
  bobot_nilai: number;
  // notice: NO kunci_jawaban_terenkripsi, NO rubrik_penilaian_esai
}

export interface GeneratePaketPayload {
  mapel_id: string;
  jenjang_sekolah?: JenjangSekolah;
  tingkat_kelas?: string;
  kode_ujian: string;
  judul_ujian: string;
  durasi_menit: number;
  total_soal_pg: number;
  total_soal_esai: number;
  target_l1: number;
  target_l2: number;
  target_l3: number;
  acak_nomor_soal: boolean;
  acak_opsi_jawaban: boolean;
}

export interface NaskahCetakData {
  paket: PaketUjian;
  mapel: MataPelajaranKurikulum;
  varian: KodeVarianPaket;
  kop_sekolah: {
    dinas: string;
    provinsi: string;
    nama_sekolah: string;
    alamat: string;
    akreditasi: string;
    tahun_ajaran: string;
  };
  petunjuk_umum: string[];
  soal_pg: Array<PaketUjianSoalItem & { butir_soal: BankSoalButir }>;
  soal_esai: Array<PaketUjianSoalItem & { butir_soal: BankSoalButir }>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  aktor_id: string;
  aktor_nama: string;
  aktor_role: string;
  aksi: string;
  detail: string;
}
