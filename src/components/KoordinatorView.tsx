import React, { useState, useEffect } from 'react';
import {
  MataPelajaranKurikulum,
  BankSoalButir,
  PaketUjian,
  GeneratePaketPayload,
  KodeVarianPaket,
  NaskahCetakData,
} from '../types';
import { apiService } from '../services/api';
import { fallbackStore } from '../data/fallbackStore';
import { MathRenderer } from './MathRenderer';
import { PrintExamModal } from './PrintExamModal';
import { TpManagementModal } from './TpManagementModal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Lock,
  Printer,
  Sparkles,
  Layers,
  FileCheck,
  RefreshCw,
  AlertCircle,
  Eye,
  Sliders,
  Target,
} from 'lucide-react';

interface KoordinatorViewProps {
  onRefreshData?: () => void;
}

export const KoordinatorView: React.FC<KoordinatorViewProps> = () => {
  const [activeTab, setActiveTab] = useState<'VALIDASI' | 'GENERATOR' | 'PAKET_LIST'>('VALIDASI');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Data State with immediate fallback initialization (works offline / GitHub Pages)
  const [mapelList, setMapelList] = useState<MataPelajaranKurikulum[]>(() => fallbackStore.getMapel());
  const [soalList, setSoalList] = useState<BankSoalButir[]>(() => fallbackStore.getBankSoal());
  const [paketList, setPaketList] = useState<any[]>(() => fallbackStore.getPaketList());
  const [selectedMapelId, setSelectedMapelId] = useState<string>(() => fallbackStore.getMapel()[0]?.id || '');
  const [filterJenjang, setFilterJenjang] = useState<string>('ALL');

  // Validation State
  const [validationFilter, setValidationFilter] = useState<string>('MENUNGGU_VALIDASI');
  const [revisionNotes, setRevisionNotes] = useState<Record<string, string>>({});
  const [activeRevisionId, setActiveRevisionId] = useState<string | null>(null);

  // Generator State (BL-EXAM-004)
  const [generatorForm, setGeneratorForm] = useState<GeneratePaketPayload>(() => {
    const firstMapelId = fallbackStore.getMapel()[0]?.id || '';
    return {
      mapel_id: firstMapelId,
      kode_ujian: 'ASAS-IPAS-2026-SD4',
      judul_ujian: 'Asesmen Sumatif Akhir Semester IPAS Fase B Kelas 4 SD',
      durasi_menit: 75,
      total_soal_pg: 3,
      total_soal_esai: 1,
      target_l1: 1,
      target_l2: 2,
      target_l3: 1,
      acak_nomor_soal: true,
      acak_opsi_jawaban: true,
    };
  });

  // TP Management Modal State
  const [isTpModalOpen, setIsTpModalOpen] = useState(false);
  const [selectedMapelForTp, setSelectedMapelForTp] = useState<string | undefined>(undefined);

  // Print Modal State
  const [printData, setPrintData] = useState<NaskahCetakData | null>(null);
  const [currentPrintPaketId, setCurrentPrintPaketId] = useState<string | null>(null);

  // Detail Paket Modal
  const [detailPaketModal, setDetailPaketModal] = useState<any | null>(null);
  const [detailVariantTab, setDetailVariantTab] = useState<'A' | 'B' | 'CADANGAN'>('A');

  const loadData = async (isManual = false) => {
    try {
      setLoading(true);
      if (isManual) setErrorMsg(null);
      const [mapels, pakets] = await Promise.all([
        apiService.getMapel(),
        apiService.getPaketList(),
      ]);
      setMapelList(mapels);
      setPaketList(pakets);

      if (mapels.length > 0 && !selectedMapelId) {
        setSelectedMapelId(mapels[0].id);
        setGeneratorForm((prev) => ({ ...prev, mapel_id: mapels[0].id }));
      }

      await loadQuestions(selectedMapelId || (mapels[0]?.id ?? ''), filterJenjang, isManual);
    } catch (err: any) {
      console.warn('Background sync on initial load:', err);
      if (isManual) {
        setErrorMsg(err.message || 'Gagal memuat data kurikulum');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (mId?: string, jenjang?: string, isManual = false) => {
    try {
      const activeJenjang = jenjang !== undefined ? jenjang : filterJenjang;
      const items = await apiService.getBankSoal({
        mapel_id: mId || selectedMapelId,
        status_validasi: validationFilter === 'ALL' ? undefined : validationFilter,
        jenjang_sekolah: activeJenjang === 'ALL' ? undefined : activeJenjang,
      });
      setSoalList(items);
    } catch (err: any) {
      console.warn('Gagal memuat butir soal:', err);
      if (isManual) {
        setErrorMsg(err.message || 'Gagal memuat butir soal');
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedMapelId) {
      loadQuestions(selectedMapelId, filterJenjang);
    }
  }, [selectedMapelId, validationFilter, filterJenjang]);

  // Handle Validation Action
  const handleValidate = async (id: string, status: 'TERVALIDASI' | 'PERLU_REVISI') => {
    try {
      setLoading(true);
      const note = revisionNotes[id] || '';
      await apiService.validateBankSoalItem(id, status, note, 'Dr. H. Mulyadi, M.Pd.');
      setSuccessMsg(
        status === 'TERVALIDASI'
          ? 'Butir soal berhasil divalidasi dan tersetujui untuk paket naskah resmi!'
          : 'Catatan revisi telah diteruskan kepada guru penulis.'
      );
      setActiveRevisionId(null);
      await loadQuestions();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memvalidasi butir soal');
    } finally {
      setLoading(false);
    }
  };

  // Handle Generate Balanced Package (BL-EXAM-004)
  const handleGeneratePaket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await apiService.generatePaket(generatorForm);
      setSuccessMsg(res.message);
      setActiveTab('PAKET_LIST');
      const updatedPakets = await apiService.getPaketList();
      setPaketList(updatedPakets);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal generate paket ujian');
    } finally {
      setLoading(false);
    }
  };

  // Handle Freeze Package (BL-EXAM-002)
  const handleFreezePaket = async (id: string) => {
    if (
      !window.confirm(
        'PERINGATAN BL-EXAM-002 (Exam Paper Freeze):\nApakah Anda yakin ingin mengunci paket naskah ujian ini secara permanen? Setelah dikunci, butir soal dan paket tidak dapat diubah atau dihapus untuk menjaga kerahasiaan & integritas ujian.'
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const res = await apiService.freezePaket(id);
      setSuccessMsg(res.message);
      const updated = await apiService.getPaketList();
      setPaketList(updated);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mengunci paket');
    } finally {
      setLoading(false);
    }
  };

  // Open Print Modal
  const handleOpenPrint = async (paketId: string, varian: KodeVarianPaket = 'A') => {
    try {
      setLoading(true);
      const data = await apiService.getPdfNaskah(paketId, varian);
      setCurrentPrintPaketId(paketId);
      setPrintData(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyiapkan naskah cetak');
    } finally {
      setLoading(false);
    }
  };

  // Switch Variant inside Print Modal
  const handleChangePrintVariant = async (varian: KodeVarianPaket) => {
    if (currentPrintPaketId) {
      try {
        const data = await apiService.getPdfNaskah(currentPrintPaketId, varian);
        setPrintData(data);
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal beralih varian naskah');
      }
    }
  };

  // View Package Items detail
  const handleViewDetail = async (id: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      setDetailVariantTab('A');
      const detail = await apiService.getPaketDetail(id);
      if (detail) {
        setDetailPaketModal(detail);
      } else {
        const fbDetail = fallbackStore.getPaketDetail(id);
        setDetailPaketModal(fbDetail);
      }
    } catch (err: any) {
      console.warn('Error loading paket detail from API, using fallback store:', err);
      try {
        const fbDetail = fallbackStore.getPaketDetail(id);
        setDetailPaketModal(fbDetail);
      } catch {
        setErrorMsg(err.message || 'Gagal memuat rincian paket');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Alert Notifications */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-900 rounded-xl font-bold cursor-pointer transition text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Muat Ulang</span>
            </button>
            <button onClick={() => setErrorMsg(null)} className="text-red-600 hover:text-red-800 font-bold ml-1">
              ✕
            </button>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 font-bold ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner & Tab Switcher with Bold Typography */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-700 mb-1">
            Modul Koordinator Kurikulum
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1A1C1E]">
            Validasi Bank Soal & Generator Paket
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Tahun Ajaran 2025/2026 • Kurikulum Nasional & Standar Dinas Pendidikan
          </p>
        </div>

        {/* Tab Navigation Pill Group */}
        <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs text-xs">
          <button
            onClick={() => setActiveTab('VALIDASI')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'VALIDASI'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Review & Validasi</span>
          </button>
          <button
            onClick={() => setActiveTab('GENERATOR')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'GENERATOR'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Generator Seimbang</span>
          </button>
          <button
            onClick={() => setActiveTab('PAKET_LIST')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all ${
              activeTab === 'PAKET_LIST'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Daftar Paket ({paketList.length})</span>
          </button>

          <button
            onClick={() => {
              setSelectedMapelForTp(selectedMapelId);
              setIsTpModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-xs cursor-pointer ml-1"
          >
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Kelola TP Mapel SD (Fase A-C)</span>
          </button>
        </div>
      </div>

      {/* Metric Cards adhering to Bold Typography */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Total Butir Soal
          </p>
          <p className="text-4xl font-black mt-2 tracking-tight text-[#1A1C1E]">
            {soalList.length > 0 ? soalList.length : 12}
          </p>
          <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
            <span className="bg-emerald-50 px-2.5 py-1 rounded-lg">+4 Terverifikasi</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Paket Naskah
          </p>
          <p className="text-4xl font-black mt-2 tracking-tight text-[#1A1C1E]">
            {paketList.length}
          </p>
          <div className="mt-4 flex items-center text-indigo-600 text-xs font-bold">
            <span className="bg-indigo-50 px-2.5 py-1 rounded-lg">Varian A, B, Cadangan</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Paket Terkunci
          </p>
          <p className="text-4xl font-black mt-2 tracking-tight text-indigo-700">
            {paketList.filter((p: any) => p.status_paket === 'TERKUNCI').length}
          </p>
          <div className="mt-4 flex items-center text-slate-500 text-xs font-bold">
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">BL-EXAM-002 Freeze</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Menunggu Validasi
          </p>
          <p className="text-4xl font-black mt-2 tracking-tight text-amber-600">
            {soalList.filter((s: any) => s.status_validasi === 'MENUNGGU_VALIDASI').length}
          </p>
          <div className="mt-4 flex items-center text-amber-600 text-xs font-bold">
            <span className="bg-amber-50 px-2.5 py-1 rounded-lg">Perlu Otorisasi</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. REVIEW & VALIDASI SOAL TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'VALIDASI' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center flex-wrap gap-2.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Jenjang:</label>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                {[
                  { id: 'ALL', label: 'Semua' },
                  { id: 'SD', label: 'SD' },
                  { id: 'SMP', label: 'SMP' },
                  { id: 'SMA', label: 'SMA' },
                ].map((j) => (
                  <button
                    key={j.id}
                    onClick={() => {
                      setFilterJenjang(j.id);
                      // If current selectedMapel does not match new jenjang, pick first matching
                      const matching = j.id === 'ALL' ? mapelList : mapelList.filter((m) => m.jenjang_sekolah === j.id);
                      if (matching.length > 0 && !matching.some((m) => m.id === selectedMapelId)) {
                        setSelectedMapelId(matching[0].id);
                      }
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition ${
                      filterJenjang === j.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {j.label}
                  </button>
                ))}
              </div>

              <label className="font-semibold text-slate-700 dark:text-slate-300 ml-2">Mata Pelajaran:</label>
              <select
                value={selectedMapelId}
                onChange={(e) => setSelectedMapelId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-indigo-500"
              >
                {(() => {
                  const filtered = filterJenjang === 'ALL'
                    ? mapelList
                    : mapelList.filter((m) => m.jenjang_sekolah === filterJenjang);
                  const displayList = filtered.length > 0 ? filtered : mapelList;
                  return displayList.map((m) => (
                    <option key={m.id} value={m.id}>
                      [{m.jenjang_sekolah || 'UMUM'} - Kls {m.tingkat_kelas}] {m.nama_mapel}
                    </option>
                  ));
                })()}
              </select>

              <label className="font-semibold text-slate-700 dark:text-slate-300 ml-2">Status:</label>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                {[
                  { id: 'MENUNGGU_VALIDASI', label: 'Menunggu Review' },
                  { id: 'TERVALIDASI', label: 'Tervalidasi' },
                  { id: 'PERLU_REVISI', label: 'Perlu Revisi' },
                  { id: 'ALL', label: 'Semua Status' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setValidationFilter(s.id)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                      validationFilter === s.id
                        ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => loadQuestions()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>

          {/* Question Review Cards */}
          {soalList.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-700">
              <FileCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Tidak ada butir soal pada kriteria filter ini
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Silakan ubah filter status, jenjang sekolah, atau beralih ke mata pelajaran lain.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {soalList.map((soal, idx) => (
                <div
                  key={soal.id}
                  className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-xs border border-slate-200 dark:border-slate-700 transition"
                >
                  {/* Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3 mb-3 text-xs">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        Soal #{idx + 1}
                      </span>
                      {soal.jenjang_sekolah && (
                        <span
                          className={`font-black text-[10px] px-2 py-0.5 rounded uppercase tracking-wider ${
                            soal.jenjang_sekolah === 'SD'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : soal.jenjang_sekolah === 'SMP'
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                          }`}
                        >
                          {soal.jenjang_sekolah} {soal.tingkat_kelas ? `• Kls ${soal.tingkat_kelas}` : ''}
                        </span>
                      )}
                      <span className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-mono text-[11px]">
                        ID: {soal.id}
                      </span>
                      <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {soal.jenis_soal.replace('_', ' ')}
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          soal.level_kognitif === 'L1'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                            : soal.level_kognitif === 'L2'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                        }`}
                      >
                        Level {soal.level_kognitif} (
                        {soal.level_kognitif === 'L1'
                          ? 'Pengetahuan'
                          : soal.level_kognitif === 'L2'
                          ? 'Aplikasi'
                          : 'Penalaran HOTS'}
                        )
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-[11px]">
                        Bobot: <strong className="text-slate-800 dark:text-slate-200">{soal.bobot_nilai} Poin</strong>
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[11px] uppercase ${
                          soal.status_validasi === 'TERVALIDASI'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                            : soal.status_validasi === 'PERLU_REVISI'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {soal.status_validasi.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Tujuan Pembelajaran (TP) & Lingkup Materi Box */}
                  {(soal.kode_tp || soal.tujuan_pembelajaran) && (
                    <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900 mb-3 text-xs space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {soal.kode_tp && (
                          <span className="bg-indigo-600 text-white font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                            {soal.kode_tp}
                          </span>
                        )}
                        <span className="font-bold text-indigo-950 dark:text-indigo-200">
                          {soal.tujuan_pembelajaran}
                        </span>
                      </div>
                      {soal.lingkup_materi && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Lingkup Materi: </span>
                          <span>{soal.lingkup_materi}</span>
                        </div>
                      )}
                      {soal.indikator_soal && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 italic">
                          <span className="font-semibold text-slate-700 dark:text-slate-300 not-italic">Indikator Soal: </span>
                          <span>{soal.indikator_soal}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Capaian Pembelajaran & Penulis */}
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">CP / Elemen: </span>
                      <span>{soal.capaian_pembelajaran || 'Belum diisi'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Penulis: </span>
                      <strong className="text-slate-700 dark:text-slate-300">{soal.nama_penulis}</strong>
                    </div>
                  </div>

                  {/* Stimulus if exists */}
                  {soal.stimulus_konten && (
                    <div className="bg-slate-50 dark:bg-slate-900/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mb-3 text-xs leading-relaxed">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Stimulus Wacana / Narasi Konteks:
                      </span>
                      <MathRenderer content={soal.stimulus_konten} />
                    </div>
                  )}

                  {/* Pertanyaan KaTeX */}
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 leading-relaxed">
                    <MathRenderer content={soal.pertanyaan_teks} />
                  </div>

                  {/* Opsi Jawaban Preview */}
                  {soal.opsi_jawaban_json && soal.opsi_jawaban_json.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-xs">
                      {soal.opsi_jawaban_json.map((opt) => {
                        const isCorrect =
                          typeof soal.kunci_jawaban_terenkripsi === 'string'
                            ? soal.kunci_jawaban_terenkripsi === opt.id
                            : Array.isArray(soal.kunci_jawaban_terenkripsi)
                            ? soal.kunci_jawaban_terenkripsi.includes(opt.id)
                            : false;

                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                              isCorrect
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-medium'
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300'
                            }`}
                          >
                            <span className="font-bold w-4">{opt.label}.</span>
                            <div className="flex-1">
                              <MathRenderer content={opt.teks} />
                            </div>
                            {isCorrect && (
                              <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-bold">
                                Kunci
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Rubrik Penilaian Esai if exists */}
                  {soal.rubrik_penilaian_esai && (
                    <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900 mb-4 text-xs">
                      <span className="font-bold text-indigo-900 dark:text-indigo-300 block mb-1">
                        Rubrik Penilaian & Kunci Esai:
                      </span>
                      <MathRenderer content={soal.rubrik_penilaian_esai} />
                    </div>
                  )}

                  {/* Active Revision Notes Input */}
                  {activeRevisionId === soal.id && (
                    <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-300 dark:border-amber-800 mb-3 text-xs space-y-2">
                      <label className="font-bold text-amber-900 dark:text-amber-300">
                        Catatan Feedback Revisi untuk Guru:
                      </label>
                      <textarea
                        rows={2}
                        value={revisionNotes[soal.id] || ''}
                        onChange={(e) =>
                          setRevisionNotes({ ...revisionNotes, [soal.id]: e.target.value })
                        }
                        placeholder="Contoh: Perbaiki rumus KaTeX pada stimulus baris kedua dan sesuaikan opsi jawaban C."
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-amber-300 rounded text-xs focus:ring-1 focus:ring-amber-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveRevisionId(null)}
                          className="px-2.5 py-1 text-slate-600 hover:text-slate-800 font-medium"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => handleValidate(soal.id, 'PERLU_REVISI')}
                          className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold"
                        >
                          Kirim Catatan Revisi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700 text-xs">
                    <div className="text-slate-500 text-[11px]">
                      Terakhir diperbarui: {new Date(soal.updated_at).toLocaleDateString('id-ID')}
                    </div>

                    <div className="flex items-center gap-2">
                      {soal.status_validasi !== 'TERVALIDASI' && (
                        <button
                          onClick={() => handleValidate(soal.id, 'TERVALIDASI')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Validasi & Setujui</span>
                        </button>
                      )}

                      {activeRevisionId !== soal.id && (
                        <button
                          onClick={() => setActiveRevisionId(soal.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium shadow-xs transition"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Minta Revisi</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. GENERATOR PAKET SEIMBANG (BL-EXAM-004) TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'GENERATOR' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Generator Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xs border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Penyusunan Paket Ujian Seimbang (BL-EXAM-004)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              Algoritma secara otomatis menyusun varian <strong>Paket A</strong>, <strong>Paket B</strong>, dan <strong>Cadangan</strong> dengan kesetaraan bobot dan sebaran tingkat kognitif (L1, L2, L3) agar tidak ada varian yang secara statistik lebih sulit.
            </p>

            <form onSubmit={handleGeneratePaket} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mata Pelajaran:
                  </label>
                  <select
                    value={generatorForm.mapel_id}
                    onChange={(e) =>
                      setGeneratorForm({ ...generatorForm, mapel_id: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
                    required
                  >
                    {mapelList.map((m) => (
                      <option key={m.id} value={m.id}>
                        [{m.jenjang_sekolah || 'UMUM'} - Kls {m.tingkat_kelas}] {m.nama_mapel}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kode Naskah Resmi:
                  </label>
                  <input
                    type="text"
                    value={generatorForm.kode_ujian}
                    onChange={(e) =>
                      setGeneratorForm({ ...generatorForm, kode_ujian: e.target.value })
                    }
                    placeholder="e.g. ASAT-MAT-2026-X"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Asesmen / Ujian:
                </label>
                <input
                  type="text"
                  value={generatorForm.judul_ujian}
                  onChange={(e) =>
                    setGeneratorForm({ ...generatorForm, judul_ujian: e.target.value })
                  }
                  placeholder="e.g. Asesmen Sumatif Akhir Tahun Matematika Fase E"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Alokasi Durasi (Menit):
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={generatorForm.durasi_menit}
                    onChange={(e) =>
                      setGeneratorForm({
                        ...generatorForm,
                        durasi_menit: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Soal PG & AKM:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={generatorForm.total_soal_pg}
                    onChange={(e) =>
                      setGeneratorForm({
                        ...generatorForm,
                        total_soal_pg: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Total Soal Esai:
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={generatorForm.total_soal_esai}
                    onChange={(e) =>
                      setGeneratorForm({
                        ...generatorForm,
                        total_soal_esai: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              {/* Cognitive Distribution Slider/Inputs */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-800 dark:text-slate-200 block mb-2">
                  Target Distribusi Level Kognitif Kisi-Kisi:
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 block mb-1">
                      L1 (Pengetahuan/Pemahaman)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={generatorForm.target_l1}
                      onChange={(e) =>
                        setGeneratorForm({
                          ...generatorForm,
                          target_l1: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block mb-1">
                      L2 (Aplikasi Standar)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={generatorForm.target_l2}
                      onChange={(e) =>
                        setGeneratorForm({
                          ...generatorForm,
                          target_l2: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 block mb-1">
                      L3 (Penalaran / HOTS)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={generatorForm.target_l3}
                      onChange={(e) =>
                        setGeneratorForm({
                          ...generatorForm,
                          target_l3: Number(e.target.value),
                        })
                      }
                      className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Anti-Cheat Shuffling Options */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generatorForm.acak_nomor_soal}
                    onChange={(e) =>
                      setGeneratorForm({
                        ...generatorForm,
                        acak_nomor_soal: e.target.checked,
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Acak Nomor Urut Soal Antar Varian
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generatorForm.acak_opsi_jawaban}
                    onChange={(e) =>
                      setGeneratorForm({
                        ...generatorForm,
                        acak_opsi_jawaban: e.target.checked,
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Acak Posisi Opsi Jawaban (A, B, C, D)
                  </span>
                </label>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Susun & Generate Paket Seimbang Otomatis</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Col: Info & Architecture Card */}
          <div className="space-y-4 text-xs">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Standar Mutu Ujian Sekolah</span>
              </h4>
              <ul className="space-y-2 text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>
                    <strong>BL-EXAM-004:</strong> Setiap paket (A, B, Cadangan) memiliki proporsi bobot dan level kognitif identik.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>
                    Hanya butir soal berstatus <strong>TERVALIDASI</strong> yang dapat diikutsertakan.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>
                    Naskah langsung siap didistribusikan ke CBT maupun dicetak dalam format 2-kolom formal.
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200">
              <span className="font-bold block mb-1">Status Kesiapan Soal Terpilih:</span>
              <p className="text-[11px] leading-relaxed">
                Tersedia {soalList.filter((s) => s.status_validasi === 'TERVALIDASI').length} butir soal tervalidasi siap pakai untuk mapel ini.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. DAFTAR PAKET NASKAH & FREEZE TAB */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'PAKET_LIST' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paketList.map((pkt) => {
              const isFrozen = pkt.status_paket === 'TERKUNCI';

              return (
                <div
                  key={pkt.id}
                  className={`bg-white dark:bg-slate-800 rounded-xl p-5 shadow-xs border transition flex flex-col justify-between ${
                    isFrozen
                      ? 'border-indigo-300 dark:border-indigo-800 ring-1 ring-indigo-400/30'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Header Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                        {pkt.kode_ujian}
                      </span>
                      <span
                        className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                          isFrozen
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {isFrozen && <Lock className="w-3 h-3" />}
                        <span>{isFrozen ? 'Terkunci Resmi' : 'Draft Terbuka'}</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug mb-2">
                      {pkt.judul_ujian}
                    </h4>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-4">
                      <div>
                        Mapel: <strong>{pkt.nama_mapel}</strong>
                      </div>
                      <div>
                        Alokasi Waktu: <strong>{pkt.durasi_menit} Menit</strong>
                      </div>
                      <div>
                        Bentuk: <strong>{pkt.total_soal_pg} PG & {pkt.total_soal_esai} Esai</strong>
                      </div>
                      <div>
                        Varian: <strong>Paket A, B, Cadangan</strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleOpenPrint(pkt.id, 'A')}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak 2-Kolom</span>
                    </button>

                    <button
                      onClick={() => handleViewDetail(pkt.id)}
                      className="p-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs"
                      title="Lihat Rincian Butir Soal"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {!isFrozen && (
                      <button
                        onClick={() => handleFreezePaket(pkt.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition"
                        title="BL-EXAM-002: Kunci naskah ujian resmi secara permanen"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Kunci (Freeze)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PRINT MODAL PREVIEW */}
      {/* ------------------------------------------------------------- */}
      {printData && (
        <PrintExamModal
          data={printData}
          onClose={() => setPrintData(null)}
          onSelectVarian={handleChangePrintVariant}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* DETAIL PAKET MODAL */}
      {/* ------------------------------------------------------------- */}
      {detailPaketModal && (() => {
        const pkt = detailPaketModal.paket || (detailPaketModal.kode_ujian ? detailPaketModal : null);
        const mapel = detailPaketModal.mapel || (pkt ? mapelList.find((m) => m.id === pkt.mapel_id) : null);
        const varianObj = detailPaketModal.varian || {
          A: detailPaketModal.items_varian_a || [],
          B: detailPaketModal.items_varian_b || [],
          CADANGAN: detailPaketModal.items_varian_cadangan || [],
        };
        const currentItems: any[] = varianObj[detailVariantTab] || varianObj.A || [];

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700">
              {/* Modal Header */}
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-lg font-mono font-black text-xs bg-indigo-600 text-white">
                      {pkt?.kode_ujian || 'PAKET-UJIAN'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {mapel?.nama_mapel || 'Mata Pelajaran'} • {mapel?.tingkat_kelas || ''}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase ${
                      pkt?.status_paket === 'TERKUNCI' 
                        ? 'bg-red-100 text-red-800 border border-red-200' 
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {pkt?.status_paket === 'TERKUNCI' ? '🔒 TERKUNCI (FREEZE)' : '📝 DRAFT RESMI'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {pkt?.judul_ujian || 'Rincian Butir Soal Naskah Ujian'}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
                    <span>Alokasi: <strong>{pkt?.durasi_menit || 60} Menit</strong></span>
                    <span>•</span>
                    <span>Bentuk: <strong>{pkt?.total_soal_pg || 0} PG & {pkt?.total_soal_esai || 0} Esai</strong></span>
                    <span>•</span>
                    <span>Target: <strong>L1: {pkt?.target_l1 || 0} | L2: {pkt?.target_l2 || 0} | L3: {pkt?.target_l3 || 0}</strong></span>
                  </div>
                </div>
                <button
                  onClick={() => setDetailPaketModal(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                  title="Tutup"
                >
                  ✕
                </button>
              </div>

              {/* Variant Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                {(['A', 'B', 'CADANGAN'] as const).map((vKey) => {
                  const count = varianObj[vKey]?.length || 0;
                  const isActive = detailVariantTab === vKey;
                  return (
                    <button
                      key={vKey}
                      onClick={() => setDetailVariantTab(vKey)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span>Varian {vKey === 'CADANGAN' ? 'Cadangan' : vKey}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                        isActive ? 'bg-indigo-800 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                      }`}>
                        {count} Butir
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                {currentItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Belum ada butir soal yang diatur pada varian ini.
                  </div>
                ) : (
                  currentItems.map((item: any, idx: number) => {
                    const butir = item.butir_soal || (item.pertanyaan_teks ? item : null);
                    const noUrut = item.nomor_urut || idx + 1;
                    const opsi = butir?.opsi_jawaban_json || [];

                    return (
                      <div
                        key={item.id || idx}
                        className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2.5"
                      >
                        {/* Header of Question */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-700 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold min-w-[28px] text-indigo-600 text-sm">
                              #{noUrut}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold rounded text-[11px]">
                              {butir?.jenis_soal ? butir.jenis_soal.replace('_', ' ') : 'PILIHAN GANDA'}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold rounded text-[11px]">
                              Level {butir?.level_kognitif || 'L1'}
                            </span>
                            <span className="text-slate-500 font-semibold text-[11px]">
                              Bobot: <strong>{butir?.bobot_nilai || 10} Poin</strong>
                            </span>
                          </div>

                          {butir?.kode_tp && (
                            <div className="flex items-center gap-1.5 bg-indigo-100/70 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded text-[11px] font-medium">
                              <Target className="w-3 h-3 text-indigo-600" />
                              <span className="font-mono font-bold">{butir.kode_tp}</span>
                              {butir.lingkup_materi && <span>• {butir.lingkup_materi}</span>}
                            </div>
                          )}
                        </div>

                        {/* Stimulus if exists */}
                        {butir?.stimulus_konten && (
                          <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed text-[11px]">
                            <span className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">
                              Stimulus Konteks:
                            </span>
                            <MathRenderer content={butir.stimulus_konten} />
                          </div>
                        )}

                        {/* Question Text */}
                        <div className="text-slate-900 dark:text-slate-100 font-medium text-xs leading-relaxed">
                          <MathRenderer content={butir?.pertanyaan_teks || 'Teks pertanyaan belum tersedia'} />
                        </div>

                        {/* Options List for Multiple Choice */}
                        {opsi.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            {opsi.map((opt: any) => {
                              const isKey =
                                typeof butir?.kunci_jawaban_terenkripsi === 'string'
                                  ? butir.kunci_jawaban_terenkripsi === opt.id
                                  : Array.isArray(butir?.kunci_jawaban_terenkripsi)
                                  ? butir.kunci_jawaban_terenkripsi.includes(opt.id)
                                  : false;

                              return (
                                <div
                                  key={opt.id}
                                  className={`p-2 rounded-lg flex items-start gap-2 border transition ${
                                    isKey
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 font-medium text-emerald-900 dark:text-emerald-200'
                                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                                    isKey ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {opt.id}
                                  </span>
                                  <div className="flex-1 text-xs">
                                    <MathRenderer content={opt.teks} />
                                  </div>
                                  {isKey && (
                                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/60 rounded">
                                      ✓ Kunci Jawaban
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Essay Rubric */}
                        {butir?.jenis_soal === 'ESAI_URAIAN' && butir?.rubrik_penilaian && (
                          <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg border border-amber-200 text-amber-900 dark:text-amber-200 text-[11px]">
                            <strong>Pedoman Penskoran:</strong> {butir.rubrik_penilaian}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    const pktId = pkt?.id;
                    setDetailPaketModal(null);
                    if (pktId) handleOpenPrint(pktId, detailVariantTab);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak 2-Kolom (Varian {detailVariantTab})</span>
                </button>

                <button
                  onClick={() => setDetailPaketModal(null)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      {/* TP Management Modal for SD (Fase A-C) */}
      <TpManagementModal
        isOpen={isTpModalOpen}
        onClose={() => setIsTpModalOpen(false)}
        initialMapelId={selectedMapelForTp}
        onTpUpdated={async () => {
          await loadData();
        }}
      />
    </div>
  );
};
