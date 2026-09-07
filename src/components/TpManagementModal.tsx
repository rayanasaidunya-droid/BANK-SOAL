import React, { useState, useEffect } from 'react';
import { MataPelajaranKurikulum, TujuanPembelajaranInfo } from '../types';
import { apiService } from '../services/api';
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  GraduationCap,
  Save,
  X,
  Target,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface TpManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMapelId?: string;
  onTpUpdated?: () => void;
}

export const TpManagementModal: React.FC<TpManagementModalProps> = ({
  isOpen,
  onClose,
  initialMapelId,
  onTpUpdated,
}) => {
  const [mapelList, setMapelList] = useState<MataPelajaranKurikulum[]>([]);
  const [selectedMapelId, setSelectedMapelId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters for Mapel
  const [filterFase, setFilterFase] = useState<string>('ALL');
  const [filterKelas, setFilterKelas] = useState<string>('ALL');
  const [searchMapel, setSearchMapel] = useState<string>('');

  // Editing single TP state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingKodeTp, setEditingKodeTp] = useState<string | null>(null);
  const [tpForm, setTpForm] = useState<TujuanPembelajaranInfo>({
    kode_tp: '',
    deskripsi: '',
    lingkup_materi: '',
    indikator_asesmen: '',
  });

  const loadMapels = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const data = await apiService.getMapel();
      // Filter specifically SD subjects
      const sdMapels = data.filter((m) => m.jenjang_sekolah === 'SD');
      setMapelList(sdMapels.length > 0 ? sdMapels : data);

      if (initialMapelId) {
        setSelectedMapelId(initialMapelId);
      } else if (sdMapels.length > 0 && !selectedMapelId) {
        setSelectedMapelId(sdMapels[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memuat daftar mata pelajaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMapels();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialMapelId) {
      setSelectedMapelId(initialMapelId);
    }
  }, [initialMapelId]);

  if (!isOpen) return null;

  const currentMapel = mapelList.find((m) => m.id === selectedMapelId) || mapelList[0];

  // Filtered mapel list
  const filteredMapels = mapelList.filter((m) => {
    const matchSearch =
      m.nama_mapel.toLowerCase().includes(searchMapel.toLowerCase()) ||
      m.tingkat_kelas.toLowerCase().includes(searchMapel.toLowerCase()) ||
      m.kode_mapel.toLowerCase().includes(searchMapel.toLowerCase());

    const matchFase =
      filterFase === 'ALL' ||
      (filterFase === 'FASE_A' && m.fase_kurikulum.includes('Fase A')) ||
      (filterFase === 'FASE_B' && m.fase_kurikulum.includes('Fase B')) ||
      (filterFase === 'FASE_C' && m.fase_kurikulum.includes('Fase C'));

    const matchKelas = filterKelas === 'ALL' || m.tingkat_kelas === filterKelas;

    return matchSearch && matchFase && matchKelas;
  });

  const handleOpenAddTp = () => {
    setEditingKodeTp(null);
    const nextNum = (currentMapel?.daftar_tp?.length || 0) + 1;
    const kelasNumber = currentMapel?.tingkat_kelas?.replace('Kelas ', '') || '1';
    setTpForm({
      kode_tp: `TP ${kelasNumber}.${nextNum}`,
      deskripsi: '',
      lingkup_materi: '',
      indikator_asesmen: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEditTp = (tp: TujuanPembelajaranInfo) => {
    setEditingKodeTp(tp.kode_tp);
    setTpForm({
      kode_tp: tp.kode_tp,
      deskripsi: tp.deskripsi,
      lingkup_materi: tp.lingkup_materi,
      indikator_asesmen: tp.indikator_asesmen || '',
    });
    setIsFormOpen(true);
  };

  const handleSaveTp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMapel) return;

    if (!tpForm.kode_tp.trim() || !tpForm.deskripsi.trim() || !tpForm.lingkup_materi.trim()) {
      setErrorMsg('Kode TP, Lingkup Materi, dan Deskripsi wajib diisi.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);

      let updatedList: TujuanPembelajaranInfo[] = [...(currentMapel.daftar_tp || [])];
      if (editingKodeTp) {
        // Update existing TP
        updatedList = updatedList.map((tp) =>
          tp.kode_tp === editingKodeTp ? { ...tpForm } : tp
        );
      } else {
        // Check if kode_tp already exists
        const exists = updatedList.some((tp) => tp.kode_tp.toLowerCase() === tpForm.kode_tp.toLowerCase());
        if (exists) {
          setErrorMsg(`Kode TP "${tpForm.kode_tp}" sudah ada pada mata pelajaran ini.`);
          setSaving(false);
          return;
        }
        updatedList.push({ ...tpForm });
      }

      const res = await apiService.updateMapelTp(currentMapel.id, updatedList);
      
      // Update local state
      setMapelList((prev) =>
        prev.map((m) => (m.id === currentMapel.id ? res.data : m))
      );

      setSuccessMsg(
        editingKodeTp
          ? `Tujuan Pembelajaran ${tpForm.kode_tp} berhasil diperbarui!`
          : `Tujuan Pembelajaran baru ${tpForm.kode_tp} berhasil ditambahkan ke ${currentMapel.nama_mapel}!`
      );
      setIsFormOpen(false);
      onTpUpdated?.();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan Tujuan Pembelajaran.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTp = async (kode_tp: string) => {
    if (!currentMapel) return;
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus ${kode_tp} dari mata pelajaran ${currentMapel.nama_mapel}?`
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      const res = await apiService.deleteTp(currentMapel.id, kode_tp);
      setMapelList((prev) =>
        prev.map((m) => (m.id === currentMapel.id ? res.data : m))
      );
      setSuccessMsg(`Tujuan Pembelajaran ${kode_tp} berhasil dihapus.`);
      onTpUpdated?.();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghapus Tujuan Pembelajaran.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-xs">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-200 border border-white/20">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Kelola Tujuan Pembelajaran (TP) Mapel SD
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Kurikulum Merdeka
                </span>
              </div>
              <p className="text-[11px] text-indigo-200 font-medium">
                Pilihan Jenjang Khusus SD (Kelas 1 - 6) Sesuai Fase A, Fase B, dan Fase C
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 text-rose-800 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700">✕</button>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-emerald-800 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">✕</button>
          </div>
        )}

        {/* Modal Body: Left Mapel List & Right TP Manager */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-0">
          {/* LEFT COLUMN: Mapel Selector (4 cols) */}
          <div className="lg:col-span-4 border-r border-slate-200 bg-slate-50/70 p-4 flex flex-col min-h-0 overflow-y-auto">
            {/* Filter Controls */}
            <div className="space-y-2.5 mb-4 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari mata pelajaran..."
                  value={searchMapel}
                  onChange={(e) => setSearchMapel(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-hidden"
                />
              </div>

              {/* Fase Filter Pills */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setFilterFase('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                    filterFase === 'ALL'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Semua Fase
                </button>
                <button
                  onClick={() => setFilterFase('FASE_A')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                    filterFase === 'FASE_A'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Fase A (Kls 1-2)
                </button>
                <button
                  onClick={() => setFilterFase('FASE_B')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                    filterFase === 'FASE_B'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Fase B (Kls 3-4)
                </button>
                <button
                  onClick={() => setFilterFase('FASE_C')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                    filterFase === 'FASE_C'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Fase C (Kls 5-6)
                </button>
              </div>

              {/* Kelas Filter Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Tingkat Kelas:</span>
                <select
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  className="w-full p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
                >
                  <option value="ALL">Semua Tingkat SD (1-6)</option>
                  <option value="Kelas 1">Kelas 1 SD (Fase A)</option>
                  <option value="Kelas 2">Kelas 2 SD (Fase A)</option>
                  <option value="Kelas 3">Kelas 3 SD (Fase B)</option>
                  <option value="Kelas 4">Kelas 4 SD (Fase B)</option>
                  <option value="Kelas 5">Kelas 5 SD (Fase C)</option>
                  <option value="Kelas 6">Kelas 6 SD (Fase C)</option>
                </select>
              </div>
            </div>

            {/* List of Mapel Cards */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filteredMapels.length === 0 ? (
                <div className="p-6 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-bold">Tidak ada mata pelajaran ditemukan</p>
                  <p className="text-[10px] mt-1">Coba sesuaikan filter fase atau kata kunci.</p>
                </div>
              ) : (
                filteredMapels.map((m) => {
                  const isSelected = m.id === selectedMapelId;
                  const tpCount = m.daftar_tp?.length || 0;
                  const isFaseA = m.fase_kurikulum.includes('Fase A');
                  const isFaseB = m.fase_kurikulum.includes('Fase B');
                  const isFaseC = m.fase_kurikulum.includes('Fase C');

                  return (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedMapelId(m.id);
                        setIsFormOpen(false);
                      }}
                      className={`p-3 rounded-2xl border transition text-left cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`font-black text-xs leading-snug ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {m.nama_mapel}
                        </span>
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-md shrink-0 uppercase ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : isFaseA
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : isFaseB
                              ? 'bg-sky-100 text-sky-800 border border-sky-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {m.tingkat_kelas}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] mt-2">
                        <span className={isSelected ? 'text-indigo-200' : 'text-slate-500'}>
                          {m.fase_kurikulum.split(' ')[0]} {m.fase_kurikulum.split(' ')[1]}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tpCount} TP Tersedia
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: TP Management for Selected Mapel (8 cols) */}
          <div className="lg:col-span-8 p-6 flex flex-col min-h-0 overflow-y-auto bg-white">
            {currentMapel ? (
              <div className="space-y-6">
                {/* Active Subject Banner */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">
                        {currentMapel.kode_mapel}
                      </span>
                      <span className="bg-white text-indigo-800 px-2 py-0.5 rounded-md text-[10px] font-bold border border-indigo-200">
                        {currentMapel.tingkat_kelas}
                      </span>
                      <span className="text-indigo-900 font-bold text-[11px]">
                        {currentMapel.fase_kurikulum}
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {currentMapel.nama_mapel}
                    </h3>
                  </div>

                  <button
                    onClick={handleOpenAddTp}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs hover:shadow transition cursor-pointer text-xs shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah TP Baru</span>
                  </button>
                </div>

                {/* Form to Add / Edit TP */}
                {isFormOpen && (
                  <div className="p-5 rounded-2xl bg-slate-50 border-2 border-indigo-300 shadow-sm animate-in fade-in duration-150">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2">
                        <Edit3 className="w-4 h-4 text-indigo-600" />
                        <h4 className="font-black text-xs uppercase tracking-wider text-indigo-950">
                          {editingKodeTp
                            ? `Edit Tujuan Pembelajaran (${editingKodeTp})`
                            : `Tambah Tujuan Pembelajaran Baru (${currentMapel.nama_mapel})`}
                        </h4>
                      </div>
                      <button
                        onClick={() => setIsFormOpen(false)}
                        className="text-slate-400 hover:text-slate-600 font-bold p-1 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleSaveTp} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-700 mb-1">
                            Kode TP: <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={tpForm.kode_tp}
                            onChange={(e) => setTpForm({ ...tpForm, kode_tp: e.target.value })}
                            placeholder="Contoh: TP 4.1"
                            disabled={!!editingKodeTp}
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-hidden disabled:bg-slate-100"
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-slate-700 mb-1">
                            Lingkup Materi / Topik: <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={tpForm.lingkup_materi}
                            onChange={(e) => setTpForm({ ...tpForm, lingkup_materi: e.target.value })}
                            placeholder="Contoh: Perubahan Bentuk Energi & Sumber Daya Alam"
                            className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Deskripsi Tujuan Pembelajaran (TP): <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={tpForm.deskripsi}
                          onChange={(e) => setTpForm({ ...tpForm, deskripsi: e.target.value })}
                          placeholder="Deskripsi kompetensi yang diharapkan dicapai peserta didik..."
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden leading-relaxed"
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">
                          Indikator Asesmen / Soal: <span className="text-slate-400 font-normal">(Rujukan kisi-kisi penulisan butir soal)</span>
                        </label>
                        <textarea
                          rows={2}
                          value={tpForm.indikator_asesmen}
                          onChange={(e) => setTpForm({ ...tpForm, indikator_asesmen: e.target.value })}
                          placeholder="Contoh: Disajikan diagram rantai makanan, peserta didik dapat menentukan peran konsumen tingkat I dengan tepat."
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end items-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsFormOpen(false)}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{saving ? 'Menyimpan...' : 'Simpan Tujuan Pembelajaran'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* List of Tujuan Pembelajaran (TP) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 text-indigo-600" />
                      Daftar Tujuan Pembelajaran ({currentMapel.daftar_tp?.length || 0})
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      Setiap TP langsung menjadi opsi acuan saat menulis butir soal
                    </span>
                  </div>

                  {(!currentMapel.daftar_tp || currentMapel.daftar_tp.length === 0) ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Target className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-bold text-slate-700">Belum ada Tujuan Pembelajaran untuk mata pelajaran ini</p>
                      <p className="text-slate-500 text-[11px] mt-1 mb-4">
                        Klik tombol di bawah untuk menambahkan TP baru sesuai kurikulum satuan pendidikan.
                      </p>
                      <button
                        onClick={handleOpenAddTp}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Tambah TP Pertama</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentMapel.daftar_tp.map((tp, idx) => (
                        <div
                          key={tp.kode_tp}
                          className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 transition shadow-xs space-y-2 group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg font-mono font-bold text-xs">
                                {tp.kode_tp}
                              </span>
                              <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg font-bold text-xs border border-slate-200">
                                Lingkup Materi: {tp.lingkup_materi}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenEditTp(tp)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                                title="Edit TP"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteTp(tp.kode_tp)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Hapus TP"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-slate-800 text-xs font-medium leading-relaxed">
                            {tp.deskripsi}
                          </p>

                          {tp.indikator_asesmen && (
                            <div className="pt-2 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500">
                              <span className="font-bold text-indigo-900 shrink-0">Indikator Asesmen:</span>
                              <span className="italic leading-relaxed">{tp.indikator_asesmen}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400">
                <p>Pilih mata pelajaran di sisi kiri untuk mengelola Tujuan Pembelajaran.</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Semua perubahan TP langsung tersinkronisasi ke Bank Soal dan Generator Kisi-Kisi CBT.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition cursor-pointer text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
