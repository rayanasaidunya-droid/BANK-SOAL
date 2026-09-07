import {
  MataPelajaranKurikulum,
  TujuanPembelajaranInfo,
  BankSoalButir,
  PaketUjian,
  SesiUjianSiswaCBT,
  ActivityAuditLog,
  ProctorTokenInfo,
  GeneratePaketPayload,
  KodeVarianPaket,
  NaskahCetakData,
} from '../types';

const BASE_URL = '/api/v1';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    const error: any = new Error(json.message || 'Request failed');
    error.code = json.code;
    error.status = res.status;
    error.raw = json;
    throw error;
  }
  return json;
}

export const apiService = {
  // Mapel & Kurikulum TP Management
  async getMapel(filters?: { jenjang_sekolah?: string; tingkat_kelas?: string }): Promise<MataPelajaranKurikulum[]> {
    const params = new URLSearchParams();
    if (filters?.jenjang_sekolah) params.set('jenjang_sekolah', filters.jenjang_sekolah);
    if (filters?.tingkat_kelas) params.set('tingkat_kelas', filters.tingkat_kelas);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchJson<{ data: MataPelajaranKurikulum[] }>(`${BASE_URL}/mapel${query}`);
    return res.data;
  },

  async getMapelDetail(id: string): Promise<MataPelajaranKurikulum> {
    const res = await fetchJson<{ data: MataPelajaranKurikulum }>(`${BASE_URL}/mapel/${id}`);
    return res.data;
  },

  async updateMapelTp(id: string, daftar_tp: TujuanPembelajaranInfo[]): Promise<{ message: string; data: MataPelajaranKurikulum }> {
    return fetchJson(`${BASE_URL}/mapel/${id}/tp`, {
      method: 'PUT',
      body: JSON.stringify({ daftar_tp }),
    });
  },

  async addOrUpdateTp(id: string, tp: TujuanPembelajaranInfo): Promise<{ message: string; data: MataPelajaranKurikulum }> {
    return fetchJson(`${BASE_URL}/mapel/${id}/tp`, {
      method: 'POST',
      body: JSON.stringify(tp),
    });
  },

  async deleteTp(id: string, kode_tp: string): Promise<{ message: string; data: MataPelajaranKurikulum }> {
    return fetchJson(`${BASE_URL}/mapel/${id}/tp/${encodeURIComponent(kode_tp)}`, {
      method: 'DELETE',
    });
  },

  // Bank Soal
  async getBankSoal(filters?: {
    mapel_id?: string;
    jenjang_sekolah?: string;
    tingkat_kelas?: string;
    kode_tp?: string;
    jenis_soal?: string;
    level_kognitif?: string;
    status_validasi?: string;
    search?: string;
  }): Promise<BankSoalButir[]> {
    const params = new URLSearchParams();
    if (filters?.mapel_id) params.set('mapel_id', filters.mapel_id);
    if (filters?.jenjang_sekolah) params.set('jenjang_sekolah', filters.jenjang_sekolah);
    if (filters?.tingkat_kelas) params.set('tingkat_kelas', filters.tingkat_kelas);
    if (filters?.kode_tp) params.set('kode_tp', filters.kode_tp);
    if (filters?.jenis_soal) params.set('jenis_soal', filters.jenis_soal);
    if (filters?.level_kognitif) params.set('level_kognitif', filters.level_kognitif);
    if (filters?.status_validasi) params.set('status_validasi', filters.status_validasi);
    if (filters?.search) params.set('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetchJson<{ data: BankSoalButir[] }>(`${BASE_URL}/bank-soal/items${query}`);
    return res.data;
  },

  async saveBankSoalItem(item: Partial<BankSoalButir>): Promise<{ message: string; data: BankSoalButir }> {
    return fetchJson(`${BASE_URL}/bank-soal/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  async validateBankSoalItem(
    id: string,
    status: 'TERVALIDASI' | 'PERLU_REVISI' | 'DRAFT',
    catatan_revisi?: string,
    validator_nama?: string
  ): Promise<{ message: string; data: BankSoalButir }> {
    return fetchJson(`${BASE_URL}/bank-soal/items/${id}/validate`, {
      method: 'POST',
      body: JSON.stringify({ status, catatan_revisi, validator_nama }),
    });
  },

  // Generator & Paket Ujian
  async generatePaket(payload: GeneratePaketPayload): Promise<{ message: string; data: PaketUjian }> {
    return fetchJson(`${BASE_URL}/paket-ujian/generate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getPaketList(): Promise<(PaketUjian & { nama_mapel: string; kode_mapel: string; total_items_count: number })[]> {
    const res = await fetchJson<{ data: any[] }>(`${BASE_URL}/paket-ujian`);
    return res.data;
  },

  async getPaketDetail(id: string): Promise<{
    paket: PaketUjian;
    mapel: MataPelajaranKurikulum;
    varian: {
      A: any[];
      B: any[];
      CADANGAN: any[];
    };
  }> {
    const res = await fetchJson<{ data: any }>(`${BASE_URL}/paket-ujian/${id}`);
    return res.data;
  },

  async freezePaket(id: string): Promise<{ message: string; data: PaketUjian }> {
    return fetchJson(`${BASE_URL}/paket-ujian/${id}/freeze`, {
      method: 'POST',
    });
  },

  async getPdfNaskah(id: string, varian: KodeVarianPaket = 'A'): Promise<NaskahCetakData> {
    const res = await fetchJson<{ data: NaskahCetakData }>(`${BASE_URL}/paket-ujian/${id}/pdf-naskah?varian=${varian}`);
    return res.data;
  },

  // Proctor
  async releaseToken(payload: { paket_ujian_id: string; ruang_lab?: string; masa_berlaku_jam?: number }): Promise<{ message: string; data: ProctorTokenInfo }> {
    return fetchJson(`${BASE_URL}/cbt/proktor/release-token`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getActiveToken(): Promise<ProctorTokenInfo | null> {
    const res = await fetchJson<{ data: ProctorTokenInfo | null }>(`${BASE_URL}/cbt/proktor/token`);
    return res.data;
  },

  async getProctorSessions(): Promise<any[]> {
    const res = await fetchJson<{ data: any[] }>(`${BASE_URL}/cbt/proktor/sessions`);
    return res.data;
  },

  async proctorAction(
    sesiId: string,
    action: 'reset-login' | 'unlock-violation' | 'force-submit' | 'extend-time',
    options?: { proktor_nama?: string; note?: string; menit?: number }
  ): Promise<{ message: string; data: SesiUjianSiswaCBT }> {
    return fetchJson(`${BASE_URL}/cbt/proktor/sessions/${sesiId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, ...options }),
    });
  },

  // CBT Student
  async loginCbt(nomor_peserta: string, token_ujian: string): Promise<{
    message: string;
    data: {
      sesi_id: string;
      nama_siswa: string;
      nomor_peserta: string;
      kelas: string;
      kode_varian_paket: KodeVarianPaket;
      sisa_detik: number;
      status_pengerjaan: string;
      judul_ujian: string;
      durasi_menit: number;
    };
  }> {
    return fetchJson(`${BASE_URL}/cbt/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ nomor_peserta, token_ujian }),
    });
  },

  async getCbtSoal(sesiId: string): Promise<{
    sesi: any;
    paket: { judul_ujian: string; durasi_menit: number; kode_varian: string; total_soal: number };
    daftar_soal: any[];
  }> {
    const res = await fetchJson<{ data: any }>(`${BASE_URL}/cbt/sesi/${sesiId}/soal`);
    return res.data;
  },

  async autosaveCbt(
    sesiId: string,
    payload: {
      jawaban_siswa?: any;
      sisa_detik?: number;
      pelanggaran?: { jenis: string; detail: string };
    }
  ): Promise<{
    success: boolean;
    saved_at?: string;
    status: string;
    jumlah_pelanggaran: number;
    locked?: boolean;
    warning?: boolean;
    message?: string;
  }> {
    return fetchJson(`${BASE_URL}/cbt/sesi/${sesiId}/autosave`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async submitFinalCbt(sesiId: string): Promise<{
    message: string;
    data: {
      nomor_peserta: string;
      nama_siswa: string;
      waktu_selesai: string;
      status: string;
      skor_otomatis_pg: number;
    };
  }> {
    return fetchJson(`${BASE_URL}/cbt/sesi/${sesiId}/submit`, {
      method: 'POST',
    });
  },

  // Audit
  async getAuditLogs(): Promise<ActivityAuditLog[]> {
    const res = await fetchJson<{ data: ActivityAuditLog[] }>(`${BASE_URL}/audit-logs`);
    return res.data;
  },

  async resetSeed(): Promise<{ message: string }> {
    return fetchJson(`${BASE_URL}/seed/reset`, { method: 'POST' });
  },
};
