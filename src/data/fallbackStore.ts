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

  saveBatchBankSoalItems(items: Array<Partial<BankSoalButir>>): BankSoalButir[] {
    const list = getStorage<BankSoalButir[]>(STORAGE_KEYS.SOAL, INITIAL_BUTIR_SOAL_LIST);
    const now = new Date().toISOString();
    const savedList: BankSoalButir[] = [];

    for (let i = 0; i < items.length; i++) {
      const payload = items[i];
      const newItem: BankSoalButir = {
        id: payload.id || `soal-ai-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        mapel_id: payload.mapel_id || 'mapel-ipas-sd-4',
        jenjang_sekolah: payload.jenjang_sekolah || 'SD',
        tingkat_kelas: payload.tingkat_kelas || 'Kelas 4 SD',
        jenis_soal: payload.jenis_soal || 'PILIHAN_GANDA',
        level_kognitif: payload.level_kognitif || 'L2',
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
        bobot_nilai: payload.bobot_nilai || (payload.jenis_soal === 'ESAI_URAIAN' ? 8 : 2),
        rubrik_penilaian_esai: payload.rubrik_penilaian_esai,
        status_validasi: 'TERVALIDASI',
        penulis_guru_id: payload.penulis_guru_id || 'guru-ai',
        nama_penulis: payload.nama_penulis || 'AI Generator & Guru Penulis',
        created_at: now,
        updated_at: now,
      };
      list.unshift(newItem);
      savedList.push(newItem);
    }

    setStorage(STORAGE_KEYS.SOAL, list);
    return savedList;
  },

  generateSoalAi(params: any): { source: string; items: any[] } {
    const count = Math.min(Math.max(params.jumlah_soal || 3, 1), 5);
    const jenjang = params.jenjang_sekolah || 'SD';
    const materi = params.lingkup_materi || 'Materi Inti Kurikulum Merdeka';
    const items: any[] = [];

    for (let i = 0; i < count; i++) {
      const jenis = params.jenis_soal === 'CAMPURAN' 
        ? (i % 2 === 0 ? 'PILIHAN_GANDA' : (i === 1 ? 'PG_KOMPLEKS' : 'ESAI_URAIAN'))
        : params.jenis_soal || 'PILIHAN_GANDA';
      const level = params.level_kognitif === 'CAMPURAN'
        ? (i === 0 ? 'L1' : (i === 1 ? 'L2' : 'L3'))
        : params.level_kognitif || 'L2';

      let options = [
        { id: 'opt-1', label: 'A', teks: `Pilihan jawaban pertama berkaitan dengan ${materi}` },
        { id: 'opt-2', label: 'B', teks: `Pilihan jawaban kedua yang paling tepat dan analitis sesuai kaidah ${materi}` },
        { id: 'opt-3', label: 'C', teks: `Pilihan jawaban ketiga sebagai distraktor logis` },
        { id: 'opt-4', label: 'D', teks: `Pilihan jawaban keempat` },
      ];
      if (jenjang !== 'SD') {
        options.push({ id: 'opt-5', label: 'E', teks: `Pilihan alternatif kelima` });
      }

      if (jenis === 'ESAI_URAIAN' || jenis === 'ISIAN_SINGKAT') {
        options = [];
      }

      const isComplex = jenis === 'PG_KOMPLEKS';
      const answerKey = isComplex ? ['opt-1', 'opt-2'] : (jenis === 'ESAI_URAIAN' ? 'Penjelasan konsep secara analitis.' : 'opt-2');

      items.push({
        id: `ai-item-${Date.now()}-${i + 1}`,
        pertanyaan_teks: jenis === 'ESAI_URAIAN'
          ? `Jelaskan secara komprehensif faktor-faktor yang mempengaruhi keberhasilan proses ${materi}, serta uraikan implikasinya dalam kehidupan sehari-hari!`
          : `Berdasarkan kajian kontekstual mengenai ${materi}, manakah kesimpulan yang paling tepat dalam menganalisis fenomena tersebut?`,
        stimulus_konten: `Dalam pembelajaran ${params.nama_mapel} (${jenjang}), materi mengenai "${materi}" memegang peranan krusial untuk melatih daya nalar kritis siswa melalui pengamatan fenomena autentik di lingkungan sekitar.`,
        jenis_soal: jenis,
        level_kognitif: level,
        capaian_pembelajaran: params.capaian_pembelajaran || `Menguasai konsep dan penerapan ${materi}.`,
        tujuan_pembelajaran: params.tujuan_pembelajaran || `Menganalisis dan mengevaluasi kasus berbasis ${materi}.`,
        kode_tp: params.kode_tp || `TP-${String(i + 1).padStart(2, '0')}`,
        lingkup_materi: materi,
        indikator_soal: `Disajikan stimulus kontekstual, peserta didik mampu menyelesaikan persoalan terkait ${materi}.`,
        opsi_jawaban_json: options,
        kunci_jawaban_terenkripsi: answerKey,
        bobot_nilai: jenis === 'ESAI_URAIAN' ? 8 : (isComplex ? 4 : 2),
        rubrik_penilaian_esai: jenis === 'ESAI_URAIAN' ? 'Skor 8: Jawaban terstruktur, argumentasi ilmiah tepat, disertai contoh konkret.' : undefined,
        pembahasan: `Kunci jawaban didasarkan pada konsep esensial ${materi} di mana opsi terbukti paling relevan secara analitis.`,
      });
    }

    return {
      source: 'CURRICULUM_CLIENT_FALLBACK',
      items,
    };
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

  getPaketDetail(id: string): {
    paket: PaketUjian;
    mapel: MataPelajaranKurikulum;
    varian: {
      A: any[];
      B: any[];
      CADANGAN: any[];
    };
  } {
    const pakets = this.getPaketList();
    const pkt = pakets.find((p) => p.id === id) || pakets[0] || INITIAL_PAKET_LIST[0];
    const mapels = this.getMapel();
    const mapel = mapels.find((m) => m.id === pkt.mapel_id) || mapels[0];
    
    let soals = this.getBankSoal({ mapel_id: pkt.mapel_id });
    if (!soals || soals.length === 0) {
      soals = this.getBankSoal();
    }
    if (!soals || soals.length === 0) {
      soals = INITIAL_BUTIR_SOAL_LIST;
    }

    const pgSoals = soals.filter((s) => s.jenis_soal !== 'ESAI_URAIAN');
    const esaiSoals = soals.filter((s) => s.jenis_soal === 'ESAI_URAIAN');

    const numPg = pkt.total_soal_pg || Math.max(1, pgSoals.length);
    const numEsai = pkt.total_soal_esai || (esaiSoals.length > 0 ? 1 : 0);

    const selectedPg = pgSoals.length > 0 ? pgSoals.slice(0, numPg) : soals.slice(0, 2);
    const selectedEsai = esaiSoals.slice(0, numEsai);
    const baseItems = [...selectedPg, ...selectedEsai];

    const variantA = baseItems.map((b, idx) => ({
      id: `item-${pkt.id}-a-${idx + 1}`,
      paket_ujian_id: pkt.id,
      kode_varian_paket: 'A' as const,
      nomor_urut: idx + 1,
      butir_soal_id: b.id,
      butir_soal: b,
    }));

    const bPg = selectedPg.length > 1
      ? [...selectedPg.slice(Math.floor(selectedPg.length / 2)), ...selectedPg.slice(0, Math.floor(selectedPg.length / 2))]
      : [...selectedPg];
    const bItems = [...bPg, ...selectedEsai];
    const variantB = bItems.map((b, idx) => ({
      id: `item-${pkt.id}-b-${idx + 1}`,
      paket_ujian_id: pkt.id,
      kode_varian_paket: 'B' as const,
      nomor_urut: idx + 1,
      butir_soal_id: b.id,
      butir_soal: b,
    }));

    const variantCadangan = baseItems.map((b, idx) => ({
      id: `item-${pkt.id}-cad-${idx + 1}`,
      paket_ujian_id: pkt.id,
      kode_varian_paket: 'CADANGAN' as const,
      nomor_urut: idx + 1,
      butir_soal_id: b.id,
      butir_soal: b,
    }));

    return {
      paket: pkt,
      mapel: mapel || {
        id: pkt.mapel_id,
        nama_mapel: 'Mata Pelajaran',
        kode_mapel: 'MAPEL-01',
        jenjang_sekolah: 'SD',
        tingkat_kelas: 'Kelas 4',
        fase_kurikulum: 'Fase B',
        daftar_tp: [],
      },
      varian: {
        A: variantA,
        B: variantB,
        CADANGAN: variantCadangan,
      },
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
      nama_siswa: sesi.nama_siswa,
      nomor_peserta: sesi.nomor_peserta,
      kelas: sesi.kelas,
      kode_varian_paket: sesi.kode_varian_paket,
      sisa_detik: sesi.sisa_detik,
      status_pengerjaan: sesi.status_pengerjaan,
      judul_ujian: paket.judul_ujian,
      durasi_menit: paket.durasi_menit,
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
    };
  },

  getCbtSoal(sesiId: string): any {
    const sesiList = getStorage<SesiUjianSiswaCBT[]>(STORAGE_KEYS.SESI, INITIAL_SESSIONS);
    let sesi = sesiList.find((s) => s.id === sesiId);
    if (!sesi) {
      sesi = sesiList[0] || {
        id: sesiId,
        paket_ujian_id: 'pkt-ipas-sd-4',
        kode_varian_paket: 'A' as const,
        siswa_id: 'siswa-01',
        nomor_peserta: 'SD-04-001',
        nama_siswa: 'Peserta Ujian SD',
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
      };
    }

    const pakets = this.getPaketList();
    const paket = pakets.find((p) => p.id === sesi.paket_ujian_id) || pakets[0] || {
      judul_ujian: 'Asesmen Sumatif Akhir Semester - IPAS Kelas 4 SD',
      durasi_menit: 60,
    };

    let soals = this.getBankSoal({ mapel_id: paket.mapel_id });
    if (!soals || soals.length === 0) {
      soals = this.getBankSoal({ jenjang_sekolah: 'SD' });
    }
    if (!soals || soals.length === 0) {
      soals = INITIAL_BUTIR_SOAL_LIST;
    }

    const items = soals.slice(0, 5).map((s, idx) => ({
      id: s.id,
      nomor_soal: idx + 1,
      nomor_urut: idx + 1,
      jenis_soal: s.jenis_soal,
      level_kognitif: s.level_kognitif,
      capaian_pembelajaran: s.capaian_pembelajaran,
      stimulus_konten: s.stimulus_konten,
      stimulus_gambar_url: s.stimulus_gambar_url,
      pertanyaan_teks: s.pertanyaan_teks,
      opsi_jawaban_json: (s.opsi_jawaban_json || []).map((opt) => ({
        id: opt.id,
        label: opt.label,
        teks: opt.teks,
      })),
      bobot_nilai: s.bobot_nilai,
      ragu_ragu: false,
      jawaban_tersimpan: null,
    }));

    const safeJawabanSiswa = sesi.jawaban_siswa_json || {};

    return {
      sesi: {
        id: sesi.id,
        nomor_peserta: sesi.nomor_peserta,
        nama_siswa: sesi.nama_siswa,
        kelas: sesi.kelas,
        sisa_detik: sesi.sisa_detik,
        jawaban_siswa: safeJawabanSiswa,
        status_pengerjaan: sesi.status_pengerjaan,
        jumlah_pelanggaran_tab: sesi.jumlah_pelanggaran_tab || 0,
      },
      paket: {
        judul_ujian: paket.judul_ujian,
        durasi_menit: paket.durasi_menit,
        kode_varian: sesi.kode_varian_paket || 'A',
        total_soal: items.length,
      },
      daftar_soal: items,
      // Flat fields for backward compatibility
      sesi_id: sesi.id,
      nomor_peserta: sesi.nomor_peserta,
      nama_siswa: sesi.nama_siswa,
      judul_ujian: paket.judul_ujian,
      durasi_menit: paket.durasi_menit,
      sisa_detik: sesi.sisa_detik,
      kode_varian_paket: sesi.kode_varian_paket || 'A',
      jawaban_siswa: safeJawabanSiswa,
      status_pengerjaan: sesi.status_pengerjaan,
      jumlah_pelanggaran_tab: sesi.jumlah_pelanggaran_tab || 0,
    };
  },

  autosaveCbt(sesiId: string, payload: any): any {
    const sesiList = getStorage<SesiUjianSiswaCBT[]>(STORAGE_KEYS.SESI, INITIAL_SESSIONS);
    const idx = sesiList.findIndex((s) => s.id === sesiId);
    let violations = 0;
    if (idx !== -1) {
      if (payload.jawaban_siswa && typeof payload.jawaban_siswa === 'object') {
        sesiList[idx].jawaban_siswa_json = {
          ...(sesiList[idx].jawaban_siswa_json || {}),
          ...payload.jawaban_siswa,
        };
      }
      if (typeof payload.sisa_detik === 'number') {
        sesiList[idx].sisa_detik = payload.sisa_detik;
      }
      if (payload.pelanggaran) {
        sesiList[idx].jumlah_pelanggaran_tab = (sesiList[idx].jumlah_pelanggaran_tab || 0) + 1;
        sesiList[idx].riwayat_pelanggaran = [
          ...(sesiList[idx].riwayat_pelanggaran || []),
          {
            timestamp: new Date().toISOString(),
            jenis: payload.pelanggaran.jenis,
            detail: payload.pelanggaran.detail,
          },
        ];
        if (sesiList[idx].jumlah_pelanggaran_tab >= 3) {
          sesiList[idx].status_pengerjaan = 'TERKUNCI_PELANGGARAN';
        }
      }
      violations = sesiList[idx].jumlah_pelanggaran_tab || 0;
      setStorage(STORAGE_KEYS.SESI, sesiList);
    }
    return {
      success: true,
      jumlah_pelanggaran: violations,
      locked: violations >= 3,
      timestamp: new Date().toISOString(),
    };
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
