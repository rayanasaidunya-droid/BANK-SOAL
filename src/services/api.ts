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
import { fallbackStore } from '../data/fallbackStore';

const BASE_URL = '/api/v1';

const isStaticDeployment =
  typeof window !== 'undefined' &&
  (window.location.hostname.endsWith('github.io') ||
    window.location.protocol === 'file:' ||
    window.location.hostname === 'pages.dev');

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson<T>(url: string, options?: RequestInit, maxRetries = 1): Promise<T> {
  if (isStaticDeployment) {
    throw new Error('Running in static deployment mode (e.g. GitHub Pages)');
  }

  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const rawText = await res.text();

      if (!res.ok) {
        if ((res.status === 404 || (res.status >= 502 && res.status <= 504)) && attempt < maxRetries) {
          await sleep(300 * (attempt + 1));
          continue;
        }

        let errorMessage = `Permintaan gagal (${res.status})`;
        try {
          const errObj = JSON.parse(rawText);
          if (errObj && typeof errObj.message === 'string') {
            errorMessage = errObj.message;
          }
        } catch {
          errorMessage = 'Server sedang memproses data...';
        }

        const error: any = new Error(errorMessage);
        error.status = res.status;
        throw error;
      }

      let json: any;
      try {
        json = JSON.parse(rawText);
      } catch {
        if (attempt < maxRetries) {
          await sleep(300 * (attempt + 1));
          continue;
        }
        throw new Error('Gagal memuat data dari server');
      }

      if (json && json.success === false) {
        throw new Error(json.message || 'Operasi gagal');
      }

      return json as T;
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries && (!err.status || err.status >= 500)) {
        await sleep(300 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }

  throw lastError || new Error('Gagal terhubung ke layanan server.');
}

export const apiService = {
  // Mapel & Kurikulum TP Management
  async getMapel(filters?: { jenjang_sekolah?: string; tingkat_kelas?: string }): Promise<MataPelajaranKurikulum[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.jenjang_sekolah) params.set('jenjang_sekolah', filters.jenjang_sekolah);
      if (filters?.tingkat_kelas) params.set('tingkat_kelas', filters.tingkat_kelas);
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await fetchJson<{ data: MataPelajaranKurikulum[] }>(`${BASE_URL}/mapel${query}`);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return fallbackStore.getMapel(filters);
    } catch (err) {
      console.warn('Using client fallback data for getMapel:', err);
      return fallbackStore.getMapel(filters);
    }
  },

  async getMapelDetail(id: string): Promise<MataPelajaranKurikulum> {
    try {
      const res = await fetchJson<{ data: MataPelajaranKurikulum }>(`${BASE_URL}/mapel/${id}`);
      if (res && res.data) return res.data;
      return fallbackStore.getMapelDetail(id);
    } catch (err) {
      console.warn('Using client fallback for getMapelDetail:', err);
      return fallbackStore.getMapelDetail(id);
    }
  },

  async updateMapelTp(id: string, daftar_tp: TujuanPembelajaranInfo[]): Promise<{ message: string; data: MataPelajaranKurikulum }> {
    try {
      return await fetchJson(`${BASE_URL}/mapel/${id}/tp`, {
        method: 'PUT',
        body: JSON.stringify({ daftar_tp }),
      });
    } catch (err) {
      console.warn('Using client fallback for updateMapelTp:', err);
      const updated = fallbackStore.updateMapelTp(id, daftar_tp);
      return { message: 'Berhasil memperbarui Tujuan Pembelajaran (Mode Lokal)', data: updated };
    }
  },

  async addOrUpdateTp(id: string, tp: TujuanPembelajaranInfo): Promise<{ message: string; data: MataPelajaranKurikulum }> {
    try {
      return await fetchJson(`${BASE_URL}/mapel/${id}/tp`, {
        method: 'POST',
        body: JSON.stringify(tp),
      });
    } catch (err) {
      console.warn('Using client fallback for addOrUpdateTp:', err);
      const updated = fallbackStore.addOrUpdateTp(id, tp);
      return { message: 'Berhasil menyimpan Tujuan Pembelajaran (Mode Lokal)', data: updated };
    }
  },

  async deleteTp(id: string, kode_tp: string): Promise<{ message: string; data: MataPelajaranKurikulum }> {
    try {
      return await fetchJson(`${BASE_URL}/mapel/${id}/tp/${encodeURIComponent(kode_tp)}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('Using client fallback for deleteTp:', err);
      const updated = fallbackStore.deleteTp(id, kode_tp);
      return { message: 'Berhasil menghapus Tujuan Pembelajaran (Mode Lokal)', data: updated };
    }
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
    try {
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
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return fallbackStore.getBankSoal(filters);
    } catch (err) {
      console.warn('Using client fallback for getBankSoal:', err);
      return fallbackStore.getBankSoal(filters);
    }
  },

  async saveBankSoalItem(item: Partial<BankSoalButir>): Promise<{ message: string; data: BankSoalButir }> {
    try {
      return await fetchJson(`${BASE_URL}/bank-soal/items`, {
        method: 'POST',
        body: JSON.stringify(item),
      });
    } catch (err) {
      console.warn('Using client fallback for saveBankSoalItem:', err);
      const saved = fallbackStore.saveBankSoalItem(item);
      return { message: 'Butir soal berhasil disimpan (Mode Lokal)', data: saved };
    }
  },

  async validateBankSoalItem(
    id: string,
    status: 'TERVALIDASI' | 'PERLU_REVISI' | 'DRAFT',
    catatan_revisi?: string,
    validator_nama?: string
  ): Promise<{ message: string; data: BankSoalButir }> {
    try {
      return await fetchJson(`${BASE_URL}/bank-soal/items/${id}/validate`, {
        method: 'POST',
        body: JSON.stringify({ status, catatan_revisi, validator_nama }),
      });
    } catch (err) {
      console.warn('Using client fallback for validateBankSoalItem:', err);
      const item = fallbackStore.validateBankSoalItem(id, status, catatan_revisi, validator_nama);
      return { message: 'Status butir soal diperbarui', data: item };
    }
  },

  // Generator & Paket Ujian
  async generatePaket(payload: GeneratePaketPayload): Promise<{ message: string; data: PaketUjian }> {
    try {
      return await fetchJson(`${BASE_URL}/paket-ujian/generate`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Using client fallback for generatePaket:', err);
      const paket = fallbackStore.generatePaket(payload);
      return { message: 'Paket ujian berhasil di-generate secara seimbang', data: paket };
    }
  },

  async getPaketList(): Promise<(PaketUjian & { nama_mapel: string; kode_mapel: string; total_items_count: number })[]> {
    try {
      const res = await fetchJson<{ data: any[] }>(`${BASE_URL}/paket-ujian`);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        return res.data;
      }
      return fallbackStore.getPaketList() as any;
    } catch (err) {
      console.warn('Using client fallback for getPaketList:', err);
      return fallbackStore.getPaketList() as any;
    }
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
    try {
      const res = await fetchJson<{ data: any }>(`${BASE_URL}/paket-ujian/${id}`);
      if (res && res.data) return res.data;
      return fallbackStore.getPaketDetail(id);
    } catch (err) {
      console.warn('Using client fallback for getPaketDetail:', err);
      return fallbackStore.getPaketDetail(id);
    }
  },

  async freezePaket(id: string): Promise<{ message: string; data: PaketUjian }> {
    try {
      return await fetchJson(`${BASE_URL}/paket-ujian/${id}/freeze`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('Using client fallback for freezePaket:', err);
      const frozen = fallbackStore.freezePaket(id);
      return { message: 'Paket ujian berhasil dikunci', data: frozen };
    }
  },

  async getPdfNaskah(id: string, varian: KodeVarianPaket = 'A'): Promise<NaskahCetakData> {
    try {
      const res = await fetchJson<{ data: NaskahCetakData }>(`${BASE_URL}/paket-ujian/${id}/pdf-naskah?varian=${varian}`);
      if (res && res.data) return res.data;
      return fallbackStore.getPdfNaskah(id, varian);
    } catch (err) {
      console.warn('Using client fallback for getPdfNaskah:', err);
      return fallbackStore.getPdfNaskah(id, varian);
    }
  },

  // Proctor
  async releaseToken(payload: { paket_ujian_id: string; ruang_lab?: string; masa_berlaku_jam?: number }): Promise<{ message: string; data: ProctorTokenInfo }> {
    try {
      return await fetchJson(`${BASE_URL}/cbt/proktor/release-token`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Using client fallback for releaseToken:', err);
      const token = fallbackStore.releaseToken({
        paket_ujian_id: payload.paket_ujian_id,
        ruang_lab: payload.ruang_lab,
        durasi_jam: payload.masa_berlaku_jam,
      });
      return { message: 'Token pengawas berhasil dirilis', data: token };
    }
  },

  async getActiveToken(): Promise<ProctorTokenInfo | null> {
    try {
      const res = await fetchJson<{ data: ProctorTokenInfo | null }>(`${BASE_URL}/cbt/proktor/token`);
      if (res && res.data) return res.data;
      return fallbackStore.getActiveToken();
    } catch (err) {
      console.warn('Using client fallback for getActiveToken:', err);
      return fallbackStore.getActiveToken();
    }
  },

  async getProctorSessions(): Promise<any[]> {
    try {
      const res = await fetchJson<{ data: any[] }>(`${BASE_URL}/cbt/proktor/sessions`);
      if (res && Array.isArray(res.data)) return res.data;
      return fallbackStore.getProctorSessions();
    } catch (err) {
      console.warn('Using client fallback for getProctorSessions:', err);
      return fallbackStore.getProctorSessions();
    }
  },

  async proctorAction(
    sesiId: string,
    action: 'reset-login' | 'unlock-violation' | 'force-submit' | 'extend-time',
    options?: { proktor_nama?: string; note?: string; menit?: number }
  ): Promise<{ message: string; data: SesiUjianSiswaCBT }> {
    try {
      return await fetchJson(`${BASE_URL}/cbt/proktor/sessions/${sesiId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, ...options }),
      });
    } catch (err) {
      console.warn('Using client fallback for proctorAction:', err);
      const res = fallbackStore.proctorAction(sesiId, action.toUpperCase().replace('-', '_'), options);
      return { message: 'Aksi proktor berhasil dieksekusi', data: res };
    }
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
      siswa?: {
        id?: string;
        nomor_peserta?: string;
        nama_siswa?: string;
        kelas?: string;
      };
      ujian?: {
        judul_ujian?: string;
        kode_ujian?: string;
        kode_varian?: string;
        durasi_menit?: number;
      };
    };
  }> {
    try {
      return await fetchJson(`${BASE_URL}/cbt/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ nomor_peserta, token_ujian }),
      });
    } catch (err) {
      console.warn('Using client fallback for loginCbt:', err);
      const data = fallbackStore.loginCbt(nomor_peserta, token_ujian);
      return { message: 'Login berhasil', data };
    }
  },

  async getCbtSoal(sesiId: string): Promise<{
    sesi: any;
    paket: { judul_ujian: string; durasi_menit: number; kode_varian: string; total_soal: number };
    daftar_soal: any[];
    jawaban_siswa?: any;
    jumlah_pelanggaran_tab?: number;
    status_pengerjaan?: string;
  }> {
    try {
      const res = await fetchJson<{ data: any }>(`${BASE_URL}/cbt/sesi/${sesiId}/soal`);
      if (res && res.data) {
        const d = res.data;
        if (!d.sesi) {
          d.sesi = {
            id: d.sesi_id || sesiId,
            nomor_peserta: d.nomor_peserta || '',
            nama_siswa: d.nama_siswa || '',
            kelas: d.kelas || '',
            sisa_detik: d.sisa_detik || 3600,
            jawaban_siswa: d.jawaban_siswa || {},
            status_pengerjaan: d.status_pengerjaan || 'SEDANG_MENGERJAKAN',
            jumlah_pelanggaran_tab: d.jumlah_pelanggaran_tab || 0,
          };
        } else if (!d.sesi.jawaban_siswa) {
          d.sesi.jawaban_siswa = d.jawaban_siswa || {};
        }
        return d;
      }
      return fallbackStore.getCbtSoal(sesiId);
    } catch (err) {
      console.warn('Using client fallback for getCbtSoal:', err);
      return fallbackStore.getCbtSoal(sesiId);
    }
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
    try {
      return await fetchJson(`${BASE_URL}/cbt/sesi/${sesiId}/autosave`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('Using client fallback for autosaveCbt:', err);
      return fallbackStore.autosaveCbt(sesiId, payload);
    }
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
    try {
      return await fetchJson(`${BASE_URL}/cbt/sesi/${sesiId}/submit`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn('Using client fallback for submitFinalCbt:', err);
      return fallbackStore.submitFinalCbt(sesiId);
    }
  },

  // Audit
  async getAuditLogs(): Promise<ActivityAuditLog[]> {
    try {
      const res = await fetchJson<{ data: ActivityAuditLog[] }>(`${BASE_URL}/audit-logs`);
      if (res && Array.isArray(res.data)) return res.data;
      return fallbackStore.getAuditLogs();
    } catch (err) {
      console.warn('Using client fallback for getAuditLogs:', err);
      return fallbackStore.getAuditLogs();
    }
  },

  async resetSeed(): Promise<{ message: string }> {
    try {
      return await fetchJson(`${BASE_URL}/seed/reset`, { method: 'POST' });
    } catch (err) {
      console.warn('Using client fallback for resetSeed:', err);
      fallbackStore.resetSeed();
      return { message: 'Database lokal berhasil di-reset ke data bawaan' };
    }
  },
};
