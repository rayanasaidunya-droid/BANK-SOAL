import {
  MataPelajaranKurikulum,
  BankSoalButir,
  PaketUjian,
  PaketUjianSoalItem,
  SesiUjianSiswaCBT,
  ActivityAuditLog,
  ProctorTokenInfo,
  ClientSoalItem,
  NaskahCetakData,
  KodeVarianPaket,
} from '../src/types';
import { INITIAL_MAPEL_LIST } from './curriculumData';
import { INITIAL_BUTIR_SOAL_LIST } from './curriculumQuestions';

// In-memory Database with initial rich academic dataset
class ExamDatabase {
  public mapelList: MataPelajaranKurikulum[] = [];
  public butirSoalList: BankSoalButir[] = [];
  public paketList: PaketUjian[] = [];
  public paketItemsList: PaketUjianSoalItem[] = [];
  public sesiList: SesiUjianSiswaCBT[] = [];
  public proctorTokens: ProctorTokenInfo[] = [];
  public auditLogs: ActivityAuditLog[] = [];

  constructor() {
    this.seedInitialData();
  }

  public logActivity(user_id: string, user_nama: string, role: string, action: string, entity_name: string, entity_id: string, detail: string) {
    const log: ActivityAuditLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      user_id,
      user_nama,
      role,
      action,
      entity_name,
      entity_id,
      timestamp: new Date().toISOString(),
      detail,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  public seedInitialData() {
    this.mapelList = [...INITIAL_MAPEL_LIST];
    this.butirSoalList = [...INITIAL_BUTIR_SOAL_LIST];

    // Seed initial Official Exam Packages (Paket Ujian) Khusus SD
    const sdPaketId1 = 'pkt-ipas-sd-4';
    const sdPaketId2 = 'pkt-mat-sd-4';
    const sdPaketId3 = 'pkt-bin-sd-1';
    const sdPaketId4 = 'pkt-mat-sd-6';

    this.paketList = [
      {
        id: sdPaketId1,
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
        id: sdPaketId2,
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
        id: sdPaketId3,
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
        id: sdPaketId4,
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

    // Seed items for SD IPAS Paket
    const sdQuestions = ['soal-sd-003', 'soal-sd-004', 'soal-sd-005'];
    sdQuestions.forEach((qid, idx) => {
      this.paketItemsList.push({
        id: `item-sd-ipas-a-${idx + 1}`,
        paket_ujian_id: sdPaketId1,
        butir_soal_id: qid,
        kode_varian_paket: 'A',
        nomor_urut: idx + 1,
      });
      const bIndex = (idx + 1) % sdQuestions.length;
      this.paketItemsList.push({
        id: `item-sd-ipas-b-${idx + 1}`,
        paket_ujian_id: sdPaketId1,
        butir_soal_id: sdQuestions[bIndex],
        kode_varian_paket: 'B',
        nomor_urut: idx + 1,
      });
      this.paketItemsList.push({
        id: `item-sd-ipas-c-${idx + 1}`,
        paket_ujian_id: sdPaketId1,
        butir_soal_id: qid,
        kode_varian_paket: 'CADANGAN',
        nomor_urut: idx + 1,
      });
    });

    // Seed items for SD MAT 4 Paket
    const sdMatQuestions = ['soal-sd-001', 'soal-sd-002'];
    sdMatQuestions.forEach((qid, idx) => {
      this.paketItemsList.push({
        id: `item-sd-mat4-a-${idx + 1}`,
        paket_ujian_id: sdPaketId2,
        butir_soal_id: qid,
        kode_varian_paket: 'A',
        nomor_urut: idx + 1,
      });
      this.paketItemsList.push({
        id: `item-sd-mat4-b-${idx + 1}`,
        paket_ujian_id: sdPaketId2,
        butir_soal_id: qid,
        kode_varian_paket: 'B',
        nomor_urut: idx + 1,
      });
      this.paketItemsList.push({
        id: `item-sd-mat4-c-${idx + 1}`,
        paket_ujian_id: sdPaketId2,
        butir_soal_id: qid,
        kode_varian_paket: 'CADANGAN',
        nomor_urut: idx + 1,
      });
    });

    // Seed items for SD BIN 1 Paket
    this.paketItemsList.push({
      id: 'item-sd-bin1-a-1',
      paket_ujian_id: sdPaketId3,
      butir_soal_id: 'soal-sd-007',
      kode_varian_paket: 'A',
      nomor_urut: 1,
    });
    this.paketItemsList.push({
      id: 'item-sd-bin1-b-1',
      paket_ujian_id: sdPaketId3,
      butir_soal_id: 'soal-sd-007',
      kode_varian_paket: 'B',
      nomor_urut: 1,
    });

    // Seed items for SD MAT 6 Paket
    this.paketItemsList.push({
      id: 'item-sd-mat6-a-1',
      paket_ujian_id: sdPaketId4,
      butir_soal_id: 'soal-sd-009',
      kode_varian_paket: 'A',
      nomor_urut: 1,
    });
    this.paketItemsList.push({
      id: 'item-sd-mat6-b-1',
      paket_ujian_id: sdPaketId4,
      butir_soal_id: 'soal-sd-009',
      kode_varian_paket: 'B',
      nomor_urut: 1,
    });

    // Seed Proctor Active Tokens for SD levels
    this.proctorTokens = [
      {
        token: 'SD42026',
        paket_ujian_id: sdPaketId1,
        kode_ujian: 'ASAS-IPAS-SD-4',
        judul_ujian: 'Asesmen Sumatif Akhir Semester - IPAS Fase B (Kelas 4 SD)',
        dibuat_pada: new Date().toISOString(),
        berlaku_sampai: new Date(Date.now() + 7200000).toISOString(),
        is_active: true,
        ruang_lab: 'Ruang Kelas 4 SD (Lab Tablet)',
      },
      {
        token: 'MAT426',
        paket_ujian_id: sdPaketId2,
        kode_ujian: 'ASAS-MAT-SD-4',
        judul_ujian: 'Asesmen Sumatif Akhir Semester - Matematika Fase B (Kelas 4 SD)',
        dibuat_pada: new Date().toISOString(),
        berlaku_sampai: new Date(Date.now() + 7200000).toISOString(),
        is_active: true,
        ruang_lab: 'Ruang Kelas 4 SD',
      },
      {
        token: 'BIN126',
        paket_ujian_id: sdPaketId3,
        kode_ujian: 'ASAS-BIN-SD-1',
        judul_ujian: 'Asesmen Sumatif Akhir Semester - Bahasa Indonesia Fase A (Kelas 1 SD)',
        dibuat_pada: new Date().toISOString(),
        berlaku_sampai: new Date(Date.now() + 7200000).toISOString(),
        is_active: true,
        ruang_lab: 'Ruang Kelas 1 SD',
      },
      {
        token: 'MAT626',
        paket_ujian_id: sdPaketId4,
        kode_ujian: 'ASAT-MAT-SD-6',
        judul_ujian: 'Asesmen Sumatif Akhir Jenjang - Matematika Fase C (Kelas 6 SD)',
        dibuat_pada: new Date().toISOString(),
        berlaku_sampai: new Date(Date.now() + 7200000).toISOString(),
        is_active: true,
        ruang_lab: 'Lab Komputer SD',
      },
    ];

    // Seed Student Sessions for Realistic Proctor Live Monitoring & Testing (SD)
    this.sesiList = [
      {
        id: 'sesi-001',
        paket_ujian_id: sdPaketId1,
        kode_varian_paket: 'A',
        siswa_id: 'siswa-01',
        nomor_peserta: 'SD-04-001',
        nama_siswa: 'Aditya Pratama (Kelas 4)',
        kelas: 'Kelas 4 SD',
        waktu_mulai: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
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
        paket_ujian_id: sdPaketId1,
        kode_varian_paket: 'B',
        siswa_id: 'siswa-02',
        nomor_peserta: 'SD-04-002',
        nama_siswa: 'Clarissa Maharani (Kelas 4)',
        kelas: 'Kelas 4 SD',
        waktu_mulai: new Date(Date.now() - 2400000).toISOString(),
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
            timestamp: new Date(Date.now() - 600000).toISOString(),
            jenis: 'BLUR_TAB',
            detail: 'Pindah jendela peramban (alt-tab / minimize browser). Peringatan ke-1.',
          },
        ],
        terakhir_aktif: new Date().toISOString(),
        ip_address: '192.168.10.18',
      },
      {
        id: 'sesi-003',
        paket_ujian_id: sdPaketId1,
        kode_varian_paket: 'A',
        siswa_id: 'siswa-03',
        nomor_peserta: 'SD-04-003',
        nama_siswa: 'Fauzan Zikri (Kelas 4)',
        kelas: 'Kelas 4 SD',
        waktu_mulai: new Date(Date.now() - 3000000).toISOString(),
        sisa_detik: 600,
        jawaban_siswa_json: {
          'soal-sd-003': { jawaban: 'opt-2', ragu: false, waktu_simpan: new Date().toISOString() },
        },
        skor_otomatis_pg: null,
        skor_esai_manual: null,
        total_skor_akhir: null,
        jumlah_pelanggaran_tab: 3,
        status_pengerjaan: 'TERKUNCI_PELANGGARAN',
        riwayat_pelanggaran: [
          {
            timestamp: new Date(Date.now() - 1500000).toISOString(),
            jenis: 'BLUR_TAB',
            detail: 'Fokus aplikasi terlepas (switch tab). Peringatan ke-1.',
          },
          {
            timestamp: new Date(Date.now() - 900000).toISOString(),
            jenis: 'SHORTCUT_ATTEMPT',
            detail: 'Membuka shortcut browser. Peringatan ke-2.',
          },
          {
            timestamp: new Date(Date.now() - 300000).toISOString(),
            jenis: 'EXIT_FULLSCREEN',
            detail: 'Keluar dari mode lockdown layar penuh. Peringatan ke-3 (Sesi Dikunci Otomatis).',
          },
        ],
        terakhir_aktif: new Date(Date.now() - 300000).toISOString(),
        ip_address: '192.168.10.19',
      },
      {
        id: 'sesi-004',
        paket_ujian_id: sdPaketId1,
        kode_varian_paket: 'B',
        siswa_id: 'siswa-04',
        nomor_peserta: 'SD-04-004',
        nama_siswa: 'Nabila Zahra (Kelas 4)',
        kelas: 'Kelas 4 SD',
        waktu_mulai: new Date(Date.now() - 4500000).toISOString(),
        waktu_selesai: new Date(Date.now() - 300000).toISOString(),
        sisa_detik: 0,
        jawaban_siswa_json: {
          'soal-sd-003': { jawaban: 'opt-2', ragu: false, waktu_simpan: new Date().toISOString() },
          'soal-sd-004': { jawaban: ['opt-1', 'opt-2', 'opt-3'], ragu: false, waktu_simpan: new Date().toISOString() },
          'soal-sd-005': { jawaban: 'Populasi katak meningkat karena ular sawah dibasmi.', ragu: false, waktu_simpan: new Date().toISOString() },
        },
        skor_otomatis_pg: 5.5,
        skor_esai_manual: 8.0,
        total_skor_akhir: 13.5,
        jumlah_pelanggaran_tab: 0,
        status_pengerjaan: 'SELESAI',
        riwayat_pelanggaran: [],
        terakhir_aktif: new Date(Date.now() - 300000).toISOString(),
        ip_address: '192.168.10.20',
      },
      {
        id: 'sesi-005',
        paket_ujian_id: sdPaketId2,
        kode_varian_paket: 'A',
        siswa_id: 'siswa-05',
        nomor_peserta: 'SD-04-005',
        nama_siswa: 'Raihan Budi (Kelas 4)',
        kelas: 'Kelas 4 SD',
        waktu_mulai: '',
        sisa_detik: 4200,
        jawaban_siswa_json: {},
        skor_otomatis_pg: null,
        skor_esai_manual: null,
        total_skor_akhir: null,
        jumlah_pelanggaran_tab: 0,
        status_pengerjaan: 'BELUM_MULAI',
        riwayat_pelanggaran: [],
        terakhir_aktif: '',
        ip_address: '192.168.10.22',
      },
    ];

    // Seed initial audit trail
    this.auditLogs = [
      {
        id: 'log-1',
        user_id: 'admin-1',
        user_nama: 'Dr. H. Mulyadi, M.Pd.',
        role: 'KOORDINATOR_KURIKULUM',
        action: 'CREATE_EXAM_PACKAGE',
        entity_name: 'paket_ujian',
        entity_id: sdPaketId1,
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        detail: 'Menyusun rancangan paket asesmen ASAS-IPAS-SD-4 (Fase B SD) dengan distribusi kisi-kisi berbasis TP.',
      },
      {
        id: 'log-2',
        user_id: 'guru-sd-2',
        user_nama: 'Agus Salim, M.Pd.',
        role: 'GURU_PENULIS',
        action: 'SUBMIT_QUESTION_ITEM',
        entity_name: 'bank_soal_butir',
        entity_id: 'soal-sd-004',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        detail: 'Mengunggah butir soal PG Kompleks HOTS stimulus perubahan wujud zat berdasarkan TP 4.2.',
      },
      {
        id: 'log-3',
        user_id: 'admin-1',
        user_nama: 'Dr. H. Mulyadi, M.Pd.',
        role: 'KOORDINATOR_KURIKULUM',
        action: 'VALIDATE_QUESTION_ITEM',
        entity_name: 'bank_soal_butir',
        entity_id: 'soal-sd-004',
        timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
        detail: 'Memvalidasi kelayakan butir soal nomor soal-sd-004 dengan status TERVALIDASI sesuai Capaian TP.',
      },
      {
        id: 'log-4',
        user_id: 'proktor-1',
        user_nama: 'Indra Hermawan, S.Kom.',
        role: 'PROKTOR_PENGAWAS',
        action: 'RELEASE_TOKEN',
        entity_name: 'proctor_token',
        entity_id: 'SD42026',
        timestamp: new Date().toISOString(),
        detail: 'Menerbitkan token ujian CBT SD aktif [SD42026] untuk ruang Kelas 4 SD.',
      },
    ];
  }
}

export const db = new ExamDatabase();
