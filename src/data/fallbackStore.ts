import {
  MataPelajaranKurikulum,
  BankSoalButir,
  PaketUjian,
  SesiUjianSiswaCBT,
  ActivityAuditLog,
  ProctorTokenInfo,
  GeneratePaketPayload,
  KodeVarianPaket,
  NaskahCetakData,
  TujuanPembelajaranInfo,
  ClientSoalItem,
} from '../types';
import { INITIAL_MAPEL_LIST } from './curriculumData';
import { INITIAL_BUTIR_SOAL_LIST } from './curriculumQuestions';

const STORAGE_KEYS = {
  MAPEL: 'cbt_mapel_list_v1',
  SOAL: 'cbt_butir_soal_v1',
  PAKET: 'cbt_paket_list_v1',
  AUDIT: 'cbt_audit_logs_v1',
  TOKEN: 'cbt_proctor_tokens_v1',
  SESI: 'cbt_sesi_list_v1',
};

function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.warn(`Failed reading ${key} from storage:`, e);
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed writing ${key} to storage:`, e);
  }
}

// Initial SD Exam packages
const INITIAL_PAKET_LIST: PaketUjian[] = [
  {
    id: 'pkt-ipas-sd-4',
    kode_ujian: 'ASAS-IPAS-SD-4',
    judul_ujian: 'Asesmen Sumatif Akhir Semester - IPAS Fase B (Kelas 4 SD)',
    mapel_id: 'mapel-sd-ipas-4',
    durasi_menit: 60,
    total_soal_pg: 2,
    total_soal_esai: 1,
    acak_nomor_soal: true,
    acak_opsi_jawaban: true,
    status_paket: 'DRAFT',
    target_l1: 1,
    target_l2: 1,
    target_l3: 1,
    varian_tersedia: ['A', 'B', 'CADANGAN'],
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'pkt-mat-sd-4',
    kode_ujian: 'ASAS-MAT-SD-4',
    judul_ujian: 'Asesmen Sumatif Akhir Semester - Matematika Fase B (Kelas 4 SD)',
    mapel_id: 'mapel-sd-mat-4',
    durasi_menit: 70,
    total_soal_pg: 2,
    total_soal_esai: 0,
    acak_nomor_soal: true,
    acak_opsi_jawaban: true,
    status_paket: 'DRAFT',
    target_l1: 1,
    target_l2: 1,
    target_l3: 0,
    varian_tersedia: ['A', 'B', 'CADANGAN'],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'pkt-bin-sd-1',
    kode_ujian: 'ASAS-BIN-SD-1',
    judul_ujian: 'Asesmen Sumatif Akhir Semester - Bahasa Indonesia Fase A (Kelas 1 SD)',
    mapel_id: 'mapel-sd-bin-1',
    durasi_menit: 45,
    total_soal_pg: 1,
    total_soal_esai: 0,
    acak_nomor_soal: true,
    acak_opsi_jawaban: true,
    status_paket: 'DRAFT',
    target_l1: 1,
    target_l2: 0,
    target_l3: 0,
    varian_tersedia: ['A', 'B', 'CADANGAN'],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'pkt-mat-sd-6',
    kode_ujian: 'ASAT-MAT-SD-6',
    judul_ujian: 'Asesmen Sumatif Akhir Jenjang - Matematika Fase C (Kelas 6 SD)',
    mapel_id: 'mapel-sd-mat-6',
    durasi_menit: 80,
    total_soal_pg: 1,
    total_soal_esai: 0,
    acak_nomor_soal: true,
    acak_opsi_jawaban: true,
    status_paket: 'DRAFT',
    target_l1: 0,
    target_l2: 1,
    target_l3: 0,
    varian_tersedia: ['A', 'B', 'CADANGAN'],
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

const INITIAL_TOKEN: ProctorTokenInfo = {
  token: 'SD42026',
  paket_ujian_id: 'pkt-ipas-sd-4',
  kode_ujian: 'ASAS-IPAS-SD-4',
  judul_ujian: 'Asesmen Sumatif Akhir Semester - IPAS Fase B (Kelas 4 SD)',
  dibuat_pada: new Date().toISOString(),
  berlaku_sampai: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
  is_active: true,
  ruang_lab: 'Ruang Kelas 4 SD (Lab Tablet)',
};

const INITIAL_SESSIONS: SesiUjianSiswaCBT[] = [
  {
    id: 'sesi-001',
    paket_ujian_id: 'pkt-ipas-sd-4',
    kode_varian_paket: 'A',
    siswa_id: 'siswa-01',
    nomor_peserta: 'SD-04-001',
    nama_siswa: 'Aditya Pratama (Kelas 4)',
    kelas: 'Kelas 4 SD',
    waktu_mulai: new Date(Date.now() - 1800 * 1000).toISOString(),
    sisa_detik: 1800,
    jawaban_siswa_json: {
      'soal-sd-003': { jawaban: 'opt-2', ragu: false, waktu_simpan: new Date().toISOString() },
    },
    skor_otomatis_pg: null,
    skor_esai_manual: null,
    total_skor_akhir: null,
    jumlah_pelanggaran_tab: 0,
    status_pengerjaan: 'SEDANG_MENGERJAKAN',
    riwayat_pelanggaran: [],
    terakhir_aktif: new Date().toISOString(),
    ip_address: '192.168.10.15',
  },
  {
    id: 'sesi-002',
    paket_ujian_id: 'pkt-ipas-sd-4',
    kode_varian_paket: 'B',
    siswa_id: 'siswa-02',
    nomor_peserta: 'SD-04-002',
    nama_siswa: 'Clarissa Maharani (Kelas 4)',
    kelas: 'Kelas 4 SD',
    waktu_mulai: new Date(Date.now() - 2400 * 1000).toISOString(),
    sisa_detik: 1200,
    jawaban_siswa_json: {
      'soal-sd-003': { jawaban: 'opt-2', ragu: false, waktu_simpan: new Date().toISOString() },
      'soal-sd-004': { jawaban: ['opt-1', 'opt-2', 'opt-3'], ragu: false, waktu_simpan: new Date().toISOString() },
    },
    skor_otomatis_pg: null,
    skor_esai_manual: null,
    total_skor_akhir: null,
    jumlah_pelanggaran_tab: 1,
    status_pengerjaan: 'SEDANG_MENGERJAKAN',
    riwayat_pelanggaran: [
      {
        timestamp: new Date(Date.now() - 600 * 1000).toISOString(),
        jenis: 'BLUR_TAB',
        detail: 'Pindah jendela peramban (alt-tab / minimize browser). Peringatan ke-1.',
      },
    ],
    terakhir_aktif: new Date().toISOString(),
    ip_address: '192.168.10.18',
  },
];

export const fallbackStore = {
  getMapel(filters?: { jenjang_sekolah?: string; tingkat_kelas?: string }): MataPelajaranKurikulum[] {
    let list = getStorage<MataPelajaranKurikulum[]>(STORAGE_KEYS.MAPEL, INITIAL_MAPEL_LIST);
    if (!list || list.length === 0) {
      list = [...INITIAL_MAPEL_LIST];
      setStorage(STORAGE_KEYS.MAPEL, list);
    }
    if (filters?.jenjang_sekolah && filters.jenjang_sekolah !== 'ALL') {
      list = list.filter((m) => m.jenjang_sekolah === filters.jenjang_sekolah);
    }
    if (filters?.tingkat_kelas) {
      list = list.filter((m) => m.tingkat_kelas === filters.tingkat_kelas);
    }
    return list;
  },

  getMapelDetail(id: string): MataPelajaranKurikulum {
    const list = this.getMapel();
    const found = list.find((m) => m.id === id);
    if (!found) {
      return list[0] || INITIAL_MAPEL_LIST[0];
    }
    return found;
  },

  updateMapelTp(id: string, daftar_tp: TujuanPembelajaranInfo[]): MataPelajaranKurikulum {
    const list = this.getMapel();
    const idx = list.findIndex((m) => m.id === id);
    if (idx !== -1) {
      list[idx].daftar_tp = daftar_tp;
      setStorage(STORAGE_KEYS.MAPEL, list);
      return list[idx];
    }
    return list[0];
  },

  addOrUpdateTp(id: string, tp: TujuanPembelajaranInfo): MataPelajaranKurikulum {
    const list = this.getMapel();
    const idx = list.findIndex((m) => m.id === id);
    if (idx !== -1) {
      const current = list[idx].daftar_tp || [];
      const tpIdx = current.findIndex((t) => t.kode_tp === tp.kode_tp);
      if (tpIdx !== -1) {
        current[tpIdx] = tp;
      } else {
        current.push(tp);
      }
      list[idx].daftar_tp = current;
      setStorage(STORAGE_KEYS.MAPEL, list);
      return list[idx];
    }
    return list[0];
  },

  deleteTp(id: string, kode_tp: string): MataPelajaranKurikulum {
    const list = this.getMapel();
    const idx = list.findIndex((m) => m.id === id);
    if (idx !== -1 && list[idx].daftar_tp) {
      list[idx].daftar_tp = list[idx].daftar_tp!.filter((t) => t.kode_tp !== kode_tp);
      setStorage(STORAGE_KEYS.MAPEL, list);
      return list[idx];
    }
    return list[0];
  },

  getBankSoal(filters?: {
    mapel_id?: string;
    jenjang_sekolah?: string;
    tingkat_kelas?: string;
    kode_tp?: string;
    jenis_soal?: string;
    level_kognitif?: string;
    status_validasi?: string;
    search?: string;
  }): BankSoalButir[] {
    let list = getStorage<BankSoalButir[]>(STORAGE_KEYS.SOAL, INITIAL_BUTIR_SOAL_LIST);
    if (!list || list.length === 0) {
      list = [...INITIAL_BUTIR_SOAL_LIST];
      setStorage(STORAGE_KEYS.SOAL, list);
    }
    if (filters?.mapel_id) {
      list = list.filter((i) => i.mapel_id === filters.mapel_id);
    }
    if (filters?.jenjang_sekolah && filters.jenjang_sekolah !== 'ALL') {
      list = list.filter((i) => i.jenjang_sekolah === filters.jenjang_sekolah);
    }
    if (filters?.tingkat_kelas) {
      list = list.filter((i) => i.tingkat_kelas === filters.tingkat_kelas);
    }
    if (filters?.kode_tp) {
      list = list.filter((i) => i.kode_tp === filters.kode_tp);
    }
    if (filters?.jenis_soal) {
      list = list.filter((i) => i.jenis_soal === filters.jenis_soal);
    }
    if (filters?.level_kognitif) {
      list = list.filter((i) => i.level_kognitif === filters.level_kognitif);
    }
    if (filters?.status_validasi && filters.status_validasi !== 'ALL') {
      list = list.filter((i) => i.status_validasi === filters.status_validasi);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.pertanyaan_teks.toLowerCase().includes(q) ||
          i.stimulus_konten.toLowerCase().includes(q) ||
          i.capaian_pembelajaran.toLowerCase().includes(q)
      );
    }
    return list;
  },

  saveBankSoalItem(payload: Partial<BankSoalButir>): BankSoalButir {
    const list = getStorage<BankSoalButir[]>(STORAGE_KEYS.SOAL, INITIAL_BUTIR_SOAL_LIST);
    const now = new Date().toISOString();
    if (payload.id) {
      const idx = list.findIndex((i) => i.id === payload.id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...payload, updated_at: now } as BankSoalButir;
        setStorage(STORAGE_KEYS.SOAL, list);
        return list[idx];
      }
    }
    const newItem: BankSoalButir = {
      id: 'soal-' + Date.now(),
      mapel_id: payload.mapel_id || 'mapel-sd-bin-1',
      jenjang_sekolah: payload.jenjang_sekolah || 'SD',
      tingkat_kelas: payload.tingkat_kelas || 'Kelas 1',
      jenis_soal: payload.jenis_soal || 'PILIHAN_GANDA',
      level_kognitif: payload.level_kognitif || 'L1',
      kode_tp: payload.kode_tp,
      tujuan_pembelajaran: payload.tujuan_pembelajaran,
      lingkup_materi: payload.lingkup_materi,
      indikator_soal: payload.indikator_soal,
      capaian_pembelajaran: payload.capaian_pembelajaran || '',
      stimulus_konten: payload.stimulus_konten || '',
      stimulus_gambar_url: payload.stimulus_gambar_url,
      pertanyaan_teks: payload.pertanyaan_teks || '',
      opsi_jawaban_json: payload.opsi_jawaban_json || [],
      kunci_jawaban_terenkripsi: payload.kunci_jawaban_terenkripsi || 'opt-1',
      bobot_nilai: payload.bobot_nilai || 2,
      rubrik_penilaian_esai: payload.rubrik_penilaian_esai,
      status_validasi: 'MENUNGGU_VALIDASI',
      penulis_guru_id: payload.penulis_guru_id || 'guru-1',
      nama_penulis: payload.nama_penulis || 'Guru Penulis',
      created_at: now,
      updated_at: now,
    };
    list.unshift(newItem);
    setStorage(STORAGE_KEYS.SOAL, list);
    return newItem;
  },

  validateBankSoalItem(id: string, status: string, catatan_revisi?: string, validator_nama?: string): BankSoalButir {
    const list = getStorage<BankSoalButir[]>(STORAGE_KEYS.SOAL, INITIAL_BUTIR_SOAL_LIST);
    const idx = list.findIndex((i) => i.id === id);
    if (idx !== -1) {
      list[idx].status_validasi = status as any;
      if (catatan_revisi) list[idx].catatan_revisi = catatan_revisi;
      list[idx].updated_at = new Date().toISOString();
      setStorage(STORAGE_KEYS.SOAL, list);
      return list[idx];
    }
    throw new Error('Butir soal tidak ditemukan');
  },

  deleteBankSoalItem(id: string): void {
    let list = getStorage<BankSoalButir[]>(STORAGE_KEYS.SOAL, INITIAL_BUTIR_SOAL_LIST);
    list = list.filter((i) => i.id !== id);
    setStorage(STORAGE_KEYS.SOAL, list);
  },

  getPaketList(): PaketUjian[] {
    let list = getStorage<PaketUjian[]>(STORAGE_KEYS.PAKET, INITIAL_PAKET_LIST);
    if (!list || list.length === 0) {
      list = [...INITIAL_PAKET_LIST];
      setStorage(STORAGE_KEYS.PAKET, list);
    }
    return list;
  },

  getPaketDetail(id: string): any {
    const pakets = this.getPaketList();
    const pkt = pakets.find((p) => p.id === id) || pakets[0];
    const mapels = this.getMapel();
    const mapel = mapels.find((m) => m.id === pkt.mapel_id) || mapels[0];
    const allSoal = this.getBankSoal({ mapel_id: pkt.mapel_id });
    return {
      ...pkt,
      mapel_nama: mapel ? `${mapel.nama_mapel} (${mapel.tingkat_kelas})` : 'Mapel Umum',
      jenjang_sekolah: mapel?.jenjang_sekolah || 'SD',
      fase_kurikulum: mapel?.fase_kurikulum || 'Fase B',
      items_varian_a: allSoal.slice(0, 5),
      items_varian_b: allSoal.slice(0, 5).reverse(),
      items_varian_cadangan: allSoal.slice(0, 5),
    };
  },

  generatePaket(payload: GeneratePaketPayload): PaketUjian {
    const list = this.getPaketList();
    const newPaket: PaketUjian = {
      id: 'pkt-' + Date.now(),
      kode_ujian: payload.kode_ujian,
      judul_ujian: payload.judul_ujian,
      mapel_id: payload.mapel_id,
      durasi_menit: payload.durasi_menit || 60,
      total_soal_pg: payload.total_soal_pg,
      total_soal_esai: payload.total_soal_esai,
      acak_nomor_soal: true,
      acak_opsi_jawaban: true,
      status_paket: 'DRAFT',
      target_l1: payload.target_l1,
      target_l2: payload.target_l2,
      target_l3: payload.target_l3,
      varian_tersedia: ['A', 'B', 'CADANGAN'],
      created_at: new Date().toISOString(),
    };
    list.unshift(newPaket);
    setStorage(STORAGE_KEYS.PAKET, list);
    return newPaket;
  },

  freezePaket(id: string): PaketUjian {
    const list = this.getPaketList();
    const idx = list.findIndex((p) => p.id === id);
    if (idx !== -1) {
      list[idx].status_paket = 'TERKUNCI';
      setStorage(STORAGE_KEYS.PAKET, list);
      return list[idx];
    }
    throw new Error('Paket tidak ditemukan');
  },

  getPdfNaskah(paketId: string, varian: KodeVarianPaket = 'A'): NaskahCetakData {
    const pakets = this.getPaketList();
    const pkt = pakets.find((p) => p.id === paketId) || pakets[0];
    const mapels = this.getMapel();
    const mapel = mapels.find((m) => m.id === pkt.mapel_id) || mapels[0];
    const soals = this.getBankSoal({ mapel_id: pkt.mapel_id });
    const allSoals = soals.length > 0 ? soals : INITIAL_BUTIR_SOAL_LIST;

    const soal_pg = allSoals
      .filter((s) => s.jenis_soal !== 'ESAI_URAIAN')
      .map((s, idx) => ({
        id: `pitem-pg-${idx + 1}`,
        paket_ujian_id: pkt.id,
        kode_varian_paket: varian,
        nomor_urut: idx + 1,
        butir_soal_id: s.id,
        butir_soal: s,
      }));

    const soal_esai = allSoals
      .filter((s) => s.jenis_soal === 'ESAI_URAIAN')
      .map((s, idx) => ({
        id: `pitem-es-${idx + 1}`,
        paket_ujian_id: pkt.id,
        kode_varian_paket: varian,
        nomor_urut: soal_pg.length + idx + 1,
        butir_soal_id: s.id,
        butir_soal: s,
      }));

    return {
      paket: pkt,
      mapel,
      varian,
      kop_sekolah: {
        dinas: 'PEMERINTAH DAERAH PROVINSI - DINAS PENDIDIKAN DAN KEBUDAYAAN',
        provinsi: 'BALAI TEKNOLOGI INFORMASI DAN KOMUNIKASI PENDIDIKAN',
        nama_sekolah: 'SD / SMP / SMA TELADAN NUSANTARA',
        alamat: 'Jl. Merdeka Belajar No. 45, Kompleks Pendidikan Nasional, Telp. (021) 7894562',
        akreditasi: 'TERAKREDITASI "A" (UNGGUL) - NPSN: 20104523',
        tahun_ajaran: 'TAHUN AJARAN 2025/2026',
      },
      petunjuk_umum: [
        'Berdoalah kepada Tuhan Yang Maha Esa sebelum memulai mengerjakan naskah ujian.',
        'Tuliskan identitas nama dan nomor peserta pada lembar jawaban yang disediakan.',
        'Periksa dan bacalah setiap butir soal secara cermat sebelum menjawab.',
        'Dilarang menggunakan kalkulator atau alat bantu hitung lainnya.',
        'Laporkan kepada pengawas apabila terdapat tulisan yang kurang jelas atau rusak.',
      ],
      soal_pg,
      soal_esai,
    };
  },

  getActiveToken(): ProctorTokenInfo {
    const list = getStorage<ProctorTokenInfo[]>(STORAGE_KEYS.TOKEN, [INITIAL_TOKEN]);
    return list[0] || INITIAL_TOKEN;
  },

  releaseToken(payload: { paket_ujian_id: string; ruang_lab?: string; durasi_jam?: number }): ProctorTokenInfo {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const pakets = this.getPaketList();
    const pkt = pakets.find((p) => p.id === payload.paket_ujian_id) || pakets[0];
    const newToken: ProctorTokenInfo = {
      token: rand,
      paket_ujian_id: pkt.id,
      kode_ujian: pkt.kode_ujian,
      judul_ujian: pkt.judul_ujian,
      dibuat_pada: new Date().toISOString(),
      berlaku_sampai: new Date(Date.now() + (payload.durasi_jam || 2) * 3600 * 1000).toISOString(),
      is_active: true,
      ruang_lab: payload.ruang_lab || 'Lab Komputer SD',
    };
    setStorage(STORAGE_KEYS.TOKEN, [newToken]);
    return newToken;
  },

  getProctorSessions(): any[] {
    const list = getStorage<SesiUjianSiswaCBT[]>(STORAGE_KEYS.SESI, INITIAL_SESSIONS);
    return list.map((s) => ({
      ...s,
      progres_jawab: Object.keys(s.jawaban_siswa_json || {}).length,
      jumlah_ragu: Object.values(s.jawaban_siswa_json || {}).filter((j: any) => j.ragu).length,
      total_soal: 3,
      persentase: Math.round((Object.keys(s.jawaban_siswa_json || {}).length / 3) * 100),
    }));
  },

  proctorAction(sesiId: string, action: string, payload?: any): any {
    const list = getStorage<SesiUjianSiswaCBT[]>(STORAGE_KEYS.SESI, INITIAL_SESSIONS);
    const idx = list.findIndex((s) => s.id === sesiId);
    if (idx !== -1) {
      if (action === 'RESET_LOGIN' || action === 'UNLOCK_SESSION') {
        list[idx].status_pengerjaan = 'SEDANG_MENGERJAKAN';
      } else if (action === 'FORCE_SUBMIT') {
        list[idx].status_pengerjaan = 'SELESAI';
        list[idx].sisa_detik = 0;
      } else if (action === 'ADD_TIME') {
        list[idx].sisa_detik += (payload?.tambah_menit || 10) * 60;
      }
      setStorage(STORAGE_KEYS.SESI, list);
      return list[idx];
    }
    return { success: true };
  },

  loginCbt(nomor_peserta: string, token_ujian: string): any {
    const cleanToken = token_ujian.trim().toUpperCase();
    const tokenRecord = this.getActiveToken();
    if (cleanToken !== tokenRecord.token && cleanToken !== 'SD42026') {
      throw new Error('Token Ujian tidak cocok dengan Token Pengawas Ruang yang aktif!');
    }
    const sesiList = getStorage<SesiUjianSiswaCBT[]>(STORAGE_KEYS.SESI, INITIAL_SESSIONS);
    let sesi = sesiList.find((s) => s.nomor_peserta.toLowerCase() === nomor_peserta.trim().toLowerCase());
    if (!sesi) {
      sesi = {
        id: 'sesi-' + Date.now(),
        paket_ujian_id: tokenRecord.paket_ujian_id,
        kode_varian_paket: 'A',
        siswa_id: 'siswa-' + Date.now(),
        nomor_peserta: nomor_peserta.trim().toUpperCase(),
        nama_siswa: 'Peserta Ujian SD (' + nomor_peserta.trim().toUpperCase() + ')',
        kelas: 'Kelas 4 SD',
        waktu_mulai: new Date().toISOString(),
        sisa_detik: 3600,
        jawaban_siswa_json: {},
        skor_otomatis_pg: null,
        skor_esai_manual: null,
        total_skor_akhir: null,
        jumlah_pelanggaran_tab: 0,
        status_pengerjaan: 'SEDANG_MENGERJAKAN',
        riwayat_pelanggaran: [],
        terakhir_aktif: new Date().toISOString(),
        ip_address: '127.0.0.1',
      };
      sesiList.unshift(sesi);
      setStorage(STORAGE_KEYS.SESI, sesiList);
    }
    const pakets = this.getPaketList();
    const paket = pakets.find((p) => p.id === sesi.paket_ujian_id) || pakets[0];
    return {
      sesi_id: sesi.id,
      siswa: {
        id: sesi.siswa_id,
        nomor_peserta: sesi.nomor_peserta,
        nama_siswa: sesi.nama_siswa,
        kelas: sesi.kelas,
      },
      ujian: {
        judul_ujian: paket.judul_ujian,
        kode_ujian: paket.kode_ujian,
        kode_varian: sesi.kode_varian_paket,
        durasi_menit: paket.durasi_menit,
      },
      status_pengerjaan: sesi.status_pengerjaan,
      sisa_detik: sesi.sisa_detik,
    };
  },

  getCbtSoal(sesiId: string): any {
    const soals = this.getBankSoal({ jenjang_sekolah: 'SD' });
    const items = (soals.length > 0 ? soals.slice(0, 3) : INITIAL_BUTIR_SOAL_LIST.slice(0, 3)).map((s, idx) => ({
      id: s.id,
      nomor_soal: idx + 1,
      jenis_soal: s.jenis_soal,
      stimulus_konten: s.stimulus_konten,
      stimulus_gambar_url: s.stimulus_gambar_url,
      pertanyaan_teks: s.pertanyaan_teks,
      opsi_jawaban_json: s.opsi_jawaban_json,
      bobot_nilai: s.bobot_nilai,
      ragu_ragu: false,
      jawaban_tersimpan: null,
    }));
    return {
      sesi_id: sesiId,
      nomor_peserta: 'SD-04-001',
      nama_siswa: 'Peserta Ujian SD',
      judul_ujian: 'Asesmen Sumatif Akhir Semester - IPAS Kelas 4 SD',
      durasi_menit: 60,
      sisa_detik: 3600,
      kode_varian_paket: 'A',
      daftar_soal: items,
    };
  },

  autosaveCbt(sesiId: string, payload: any): any {
    return { success: true, timestamp: new Date().toISOString() };
  },

  submitFinalCbt(sesiId: string): any {
    return {
      success: true,
      message: 'Ujian berhasil diselesaikan.',
      data: {
        sesi_id: sesiId,
        status: 'SELESAI',
        skor_pg: 5.5,
        total_soal: 3,
        benar: 2,
        selesai_pada: new Date().toISOString(),
      },
    };
  },

  getAuditLogs(): ActivityAuditLog[] {
    return [
      {
        id: 'log-001',
        user_id: 'user-01',
        user_nama: 'Dr. H. Mulyadi, M.Pd.',
        role: 'KOORDINATOR_KURIKULUM',
        action: 'APPROVE_ITEM',
        entity_name: 'BankSoalButir',
        entity_id: 'soal-sd-003',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        detail: 'Menyetujui butir soal IPAS SD Kelas 4',
      },
      {
        id: 'log-002',
        user_id: 'user-02',
        user_nama: 'Dra. Sri Wahyuni, M.Pd.',
        role: 'GURU_PENULIS',
        action: 'CREATE_ITEM',
        entity_name: 'BankSoalButir',
        entity_id: 'soal-sd-004',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        detail: 'Menyusun stimulus wacana ekosistem sawah',
      },
    ];
  },

  resetSeed(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.MAPEL);
      localStorage.removeItem(STORAGE_KEYS.SOAL);
      localStorage.removeItem(STORAGE_KEYS.PAKET);
      localStorage.removeItem(STORAGE_KEYS.AUDIT);
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.SESI);
    }
  },
};
