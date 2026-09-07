import React, { useState, useEffect } from 'react';
import {
  MataPelajaranKurikulum,
  BankSoalButir,
  JenisSoal,
  LevelKognitif,
  OpsiJawaban,
  JenjangSekolah,
} from '../types';
import { apiService } from '../services/api';
import { fallbackStore } from '../data/fallbackStore';
import { MathRenderer } from './MathRenderer';
import { TpManagementModal } from './TpManagementModal';
import {
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator,
  Image as ImageIcon,
  Save,
  Eye,
  GraduationCap,
  Target,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const GuruPenulisView: React.FC = () => {
  const [mapelList, setMapelList] = useState<MataPelajaranKurikulum[]>(() => fallbackStore.getMapel());
  const [items, setItems] = useState<BankSoalButir[]>(() => fallbackStore.getBankSoal());
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterJenjang, setFilterJenjang] = useState<string>('');
  const [filterMapel, setFilterMapel] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterLevel, setFilterLevel] = useState('');

  // Editor Modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // TP Management Modal State
  const [isTpModalOpen, setIsTpModalOpen] = useState(false);
  const [selectedMapelForTp, setSelectedMapelForTp] = useState<string | undefined>(undefined);

  // Form State with Jenjang and TP support
  const [formData, setFormData] = useState<{
    mapel_id: string;
    jenjang_sekolah: JenjangSekolah;
    tingkat_kelas: string;
    kode_tp: string;
    tujuan_pembelajaran: string;
    lingkup_materi: string;
    indikator_soal: string;
    jenis_soal: JenisSoal;
    level_kognitif: LevelKognitif;
    capaian_pembelajaran: string;
    stimulus_konten: string;
    stimulus_gambar_url: string;
    pertanyaan_teks: string;
    opsi_jawaban_json: OpsiJawaban[];
    kunci_jawaban_terenkripsi: string | string[];
    bobot_nilai: number;
    rubrik_penilaian_esai: string;
    penulis_guru_id: string;
    nama_penulis: string;
  }>(() => {
    const mapels = fallbackStore.getMapel();
    const defaultMapel = mapels.find((m) => m.jenjang_sekolah === 'SD') || mapels[0];
    const firstTp = defaultMapel?.daftar_tp?.[0];
    return {
      mapel_id: defaultMapel?.id || 'mapel-sd-ipa-4',
      jenjang_sekolah: (defaultMapel?.jenjang_sekolah || 'SD') as JenjangSekolah,
      tingkat_kelas: defaultMapel?.tingkat_kelas || 'Kelas 4',
      kode_tp: firstTp?.kode_tp || '',
      tujuan_pembelajaran: firstTp?.deskripsi || '',
      lingkup_materi: firstTp?.lingkup_materi || '',
      indikator_soal: firstTp?.indikator_asesmen || '',
      jenis_soal: 'PILIHAN_GANDA',
      level_kognitif: 'L2',
      capaian_pembelajaran: firstTp?.deskripsi || '',
      stimulus_konten: '',
      stimulus_gambar_url: '',
      pertanyaan_teks: '',
      opsi_jawaban_json: [
        { id: 'opt-1', label: 'A', teks: '' },
        { id: 'opt-2', label: 'B', teks: '' },
        { id: 'opt-3', label: 'C', teks: '' },
        { id: 'opt-4', label: 'D', teks: '' },
        { id: 'opt-5', label: 'E', teks: '' },
      ],
      kunci_jawaban_terenkripsi: 'opt-1',
      bobot_nilai: 2.5,
      rubrik_penilaian_esai: '',
      penulis_guru_id: 'guru-1',
      nama_penulis: 'Dra. Sri Wahyuni, M.Pd.',
    };
  });

  const loadData = async (isManual = false) => {
    try {
      setLoading(true);
      if (isManual) setErrorMsg(null);
      const [mapels, bankSoal] = await Promise.all([
        apiService.getMapel(),
        apiService.getBankSoal({
          search: search || undefined,
          jenjang_sekolah: filterJenjang || undefined,
          mapel_id: filterMapel || undefined,
          jenis_soal: filterJenis || undefined,
          level_kognitif: filterLevel || undefined,
        }),
      ]);
      setMapelList(mapels);
      setItems(bankSoal);

      if (mapels.length > 0 && !formData.mapel_id) {
        setFormData((prev) => ({
          ...prev,
          mapel_id: mapels[0].id,
          jenjang_sekolah: mapels[0].jenjang_sekolah || 'SD',
          tingkat_kelas: mapels[0].tingkat_kelas || 'Kelas 4',
        }));
      }
    } catch (err: any) {
      console.warn('Background sync on load:', err);
      if (isManual) {
        setErrorMsg(err.message || 'Gagal memuat bank soal');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterJenjang, filterMapel, filterJenis, filterLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setEditingId(null);
    const initialMapel = (filterJenjang ? mapelList.find(m => m.jenjang_sekolah === filterJenjang) : null) || mapelList[0];
    const initialTp = initialMapel?.daftar_tp?.[0];
    const jenjang = initialMapel?.jenjang_sekolah || 'SD';

    setFormData({
      mapel_id: initialMapel?.id || '',
      jenjang_sekolah: jenjang,
      tingkat_kelas: initialMapel?.tingkat_kelas || (jenjang === 'SD' ? 'Kelas 4' : jenjang === 'SMP' ? 'Kelas 8' : 'Kelas 10'),
      kode_tp: initialTp?.kode_tp || '',
      tujuan_pembelajaran: initialTp?.deskripsi || '',
      lingkup_materi: initialTp?.lingkup_materi || '',
      indikator_soal: initialTp ? `Disajikan stimulus, peserta didik mampu menyelesaikan persoalan terkait ${initialTp.lingkup_materi.toLowerCase()}` : '',
      jenis_soal: 'PILIHAN_GANDA',
      level_kognitif: 'L2',
      capaian_pembelajaran: initialTp?.deskripsi || '',
      stimulus_konten: '',
      stimulus_gambar_url: '',
      pertanyaan_teks: '',
      opsi_jawaban_json: jenjang === 'SD'
        ? [
            { id: 'opt-1', label: 'A', teks: '' },
            { id: 'opt-2', label: 'B', teks: '' },
            { id: 'opt-3', label: 'C', teks: '' },
            { id: 'opt-4', label: 'D', teks: '' },
          ]
        : [
            { id: 'opt-1', label: 'A', teks: '' },
            { id: 'opt-2', label: 'B', teks: '' },
            { id: 'opt-3', label: 'C', teks: '' },
            { id: 'opt-4', label: 'D', teks: '' },
            { id: 'opt-5', label: 'E', teks: '' },
          ],
      kunci_jawaban_terenkripsi: 'opt-1',
      bobot_nilai: 2.5,
      rubrik_penilaian_esai: '',
      penulis_guru_id: 'guru-1',
      nama_penulis: 'Dra. Sri Wahyuni, M.Pd.',
    });
    setIsEditorOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (item: BankSoalButir) => {
    setEditingId(item.id);
    const relatedMapel = mapelList.find(m => m.id === item.mapel_id);
    const resolvedJenjang = item.jenjang_sekolah || relatedMapel?.jenjang_sekolah || 'SD';
    const resolvedKelas = item.tingkat_kelas || relatedMapel?.tingkat_kelas || 'Kelas 4';

    setFormData({
      mapel_id: item.mapel_id,
      jenjang_sekolah: resolvedJenjang,
      tingkat_kelas: resolvedKelas,
      kode_tp: item.kode_tp || '',
      tujuan_pembelajaran: item.tujuan_pembelajaran || '',
      lingkup_materi: item.lingkup_materi || '',
      indikator_soal: item.indikator_soal || '',
      jenis_soal: item.jenis_soal,
      level_kognitif: item.level_kognitif,
      capaian_pembelajaran: item.capaian_pembelajaran || '',
      stimulus_konten: item.stimulus_konten || '',
      stimulus_gambar_url: item.stimulus_gambar_url || '',
      pertanyaan_teks: item.pertanyaan_teks,
      opsi_jawaban_json: item.opsi_jawaban_json?.length
        ? item.opsi_jawaban_json
        : [
            { id: 'opt-1', label: 'A', teks: '' },
            { id: 'opt-2', label: 'B', teks: '' },
            { id: 'opt-3', label: 'C', teks: '' },
            { id: 'opt-4', label: 'D', teks: '' },
          ],
      kunci_jawaban_terenkripsi: item.kunci_jawaban_terenkripsi,
      bobot_nilai: item.bobot_nilai,
      rubrik_penilaian_esai: item.rubrik_penilaian_esai || '',
      penulis_guru_id: item.penulis_guru_id,
      nama_penulis: item.nama_penulis,
    });
    setIsEditorOpen(true);
  };

  // Insert LaTeX Helper
  const insertLatexTemplate = (snippet: string) => {
    setFormData((prev) => ({
      ...prev,
      pertanyaan_teks: prev.pertanyaan_teks + ' ' + snippet + ' ',
    }));
  };

  // Save Item
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErrorMsg(null);

      const payload = {
        id: editingId || undefined,
        ...formData,
      };

      const res = await apiService.saveBankSoalItem(payload);
      setSuccessMsg(res.message);
      setIsEditorOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan butir soal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Alert Banners */}
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
            <button onClick={() => setErrorMsg(null)} className="text-red-600 font-bold ml-1 cursor-pointer">
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
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 font-bold ml-3">
            ✕
          </button>
        </div>
      )}

      {/* Header & Create Button with Bold Typography */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-700 mb-1">
            Ruang Kerja Guru Penulis
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1A1C1E]">
            Bank Soal & Editor Rumus KaTeX
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Penyusunan Butir Soal Multitipe, Stimulus Narasi, dan Rubrik Penilaian HOTS
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              setSelectedMapelForTp(undefined);
              setIsTpModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Target className="w-4 h-4 text-indigo-600" />
            <span>Kelola TP Mapel (SD 1-6)</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tulis Butir Soal Baru</span>
          </button>
        </div>
      </div>

      {/* Metric Cards adhering to Bold Typography */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Total Soal Penulis
          </p>
          <p className="text-4xl font-black mt-2 tracking-tight text-[#1A1C1E]">
            {items.length}
          </p>
          <div className="mt-4 flex items-center text-indigo-600 text-xs font-bold">
            <span className="bg-indigo-50 px-2.5 py-1 rounded-lg">Koleksi Bank Soal</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Tervalidasi
          </p>
          <p className="text-4xl font-black mt-2 tracking-tight text-emerald-600">
            {items.filter((i) => i.status_validasi === 'TERVALIDASI').length}
          </p>
          <div className="mt-4 flex items-center text-emerald-600 text-xs font-bold">
            <span className="bg-emerald-50 px-2.5 py-1 rounded-lg">Siap Masuk Paket</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Perlu Revisi
          </p>
          <p className="text-4xl font-black mt-2 tracking-tight text-amber-600">
            {items.filter((i) => i.status_validasi === 'PERLU_REVISI').length}
          </p>
          <div className="mt-4 flex items-center text-amber-600 text-xs font-bold">
            <span className="bg-amber-50 px-2.5 py-1 rounded-lg">Ada Catatan Koordinator</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Level HOTS (L3)
          </p>
          <p className="text-4xl font-black mt-2 tracking-tight text-purple-700">
            {items.filter((i) => i.level_kognitif === 'L3').length}
          </p>
          <div className="mt-4 flex items-center text-purple-600 text-xs font-bold">
            <span className="bg-purple-50 px-2.5 py-1 rounded-lg">Standar AKM / Penalaran</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-5 rounded-3xl shadow-xs border border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari butir soal, TP, materi, indikator..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition cursor-pointer"
          >
            Cari
          </button>
        </form>

        <div className="flex items-center flex-wrap gap-2.5 font-bold">
          {/* Jenjang Filter */}
          <select
            value={filterJenjang}
            onChange={(e) => {
              setFilterJenjang(e.target.value);
              setFilterMapel(''); // Reset mapel filter when changing jenjang
            }}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
          >
            <option value="">Semua Jenjang (SD, SMP, SMA)</option>
            <option value="SD">Jenjang SD (Sekolah Dasar)</option>
            <option value="SMP">Jenjang SMP (Sekolah Menengah Pertama)</option>
            <option value="SMA">Jenjang SMA (Sekolah Menengah Atas)</option>
          </select>

          {/* Mapel Filter - filtered by Jenjang if selected */}
          <select
            value={filterMapel}
            onChange={(e) => setFilterMapel(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="">Semua Mata Pelajaran</option>
            {mapelList
              .filter((m) => !filterJenjang || m.jenjang_sekolah === filterJenjang)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.jenjang_sekolah || 'UMUM'} - {m.tingkat_kelas}] {m.nama_mapel}
                </option>
              ))}
          </select>

          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="">Semua Tipe Soal</option>
            <option value="PILIHAN_GANDA">Pilihan Ganda</option>
            <option value="PG_KOMPLEKS">PG Kompleks (AKM)</option>
            <option value="ISIAN_SINGKAT">Isian Singkat</option>
            <option value="ESAI_URAIAN">Esai / Uraian</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
          >
            <option value="">Semua Level</option>
            <option value="L1">L1 (Pengetahuan)</option>
            <option value="L2">L2 (Aplikasi)</option>
            <option value="L3">L3 (Penalaran HOTS)</option>
          </select>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-base font-black text-slate-800">
              Belum ada butir soal ditemukan
            </h4>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Klik tombol "+ Tulis Butir Soal Baru" di atas untuk menambahkan naskah soal berdasarkan Tujuan Pembelajaran (TP).
            </p>
          </div>
        ) : (
          items.map((item, idx) => {
            const jenjang = item.jenjang_sekolah || 'SD';
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 hover:border-slate-300 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-700 pb-3 mb-3 text-xs">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      Soal #{idx + 1}
                    </span>
                    {/* Jenjang Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-lg font-black text-[11px] tracking-wider uppercase ${
                        jenjang === 'SD'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : jenjang === 'SMP'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                      }`}
                    >
                      {jenjang}
                    </span>
                    {/* Kelas Badge */}
                    {item.tingkat_kelas && (
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {item.tingkat_kelas}
                      </span>
                    )}
                    {/* Mapel Name */}
                    {item.mapel_nama && (
                      <span className="bg-slate-50 text-slate-600 font-bold px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {item.mapel_nama}
                      </span>
                    )}
                    <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded text-[11px]">
                      {item.jenis_soal.replace('_', ' ')}
                    </span>
                    <span className="bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 font-semibold px-2 py-0.5 rounded text-[11px]">
                      Level {item.level_kognitif}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Bobot: <strong>{item.bobot_nilai} Poin</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded font-bold text-[11px] uppercase ${
                        item.status_validasi === 'TERVALIDASI'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : item.status_validasi === 'PERLU_REVISI'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.status_validasi.replace('_', ' ')}
                    </span>

                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="flex items-center gap-1 px-2.5 py-1 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 rounded font-medium transition cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>

                {/* Revision note from coordinator if any */}
                {item.catatan_revisi && (
                  <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-300 dark:border-amber-800 mb-3 text-xs text-amber-900 dark:text-amber-200">
                    <strong>Catatan Tim Kurikulum:</strong> {item.catatan_revisi}
                  </div>
                )}

                {/* Tujuan Pembelajaran (TP) & Lingkup Materi Card */}
                {(item.kode_tp || item.tujuan_pembelajaran || item.lingkup_materi) && (
                  <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 mb-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 flex-wrap text-indigo-900 font-bold">
                      <Target className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>Tujuan Pembelajaran (TP):</span>
                      {item.kode_tp && (
                        <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-[11px] font-mono">
                          {item.kode_tp}
                        </span>
                      )}
                      {item.lingkup_materi && (
                        <span className="bg-white text-indigo-800 px-2 py-0.5 rounded-md text-[11px] border border-indigo-200 font-semibold">
                          Materi: {item.lingkup_materi}
                        </span>
                      )}
                    </div>
                    {item.tujuan_pembelajaran && (
                      <p className="text-slate-700 font-medium pl-6 leading-relaxed">
                        {item.tujuan_pembelajaran}
                      </p>
                    )}
                    {item.indikator_soal && (
                      <p className="text-slate-500 text-[11px] pl-6 italic">
                        <strong>Indikator:</strong> {item.indikator_soal}
                      </p>
                    )}
                  </div>
                )}

                {/* Stimulus */}
                {item.stimulus_konten && (
                  <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 mb-2.5 text-xs text-slate-700 dark:text-slate-300 italic font-serif">
                    <span className="font-sans font-bold not-italic text-[10px] text-slate-500 uppercase block mb-1">
                      Stimulus Wacana:
                    </span>
                    <MathRenderer content={item.stimulus_konten} />
                  </div>
                )}

                {/* Question Text */}
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
                  <MathRenderer content={item.pertanyaan_teks} />
                </div>

                {/* Options */}
                {item.opsi_jawaban_json && item.opsi_jawaban_json.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {item.opsi_jawaban_json.map((opt) => {
                      const isKey =
                        typeof item.kunci_jawaban_terenkripsi === 'string'
                          ? item.kunci_jawaban_terenkripsi === opt.id
                          : Array.isArray(item.kunci_jawaban_terenkripsi)
                          ? item.kunci_jawaban_terenkripsi.includes(opt.id)
                          : false;

                      return (
                        <div
                          key={opt.id}
                          className={`p-2 rounded border flex items-center justify-between ${
                            isKey
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 font-semibold'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold">{opt.label}.</span>
                            <MathRenderer content={opt.teks} />
                          </div>
                          {isKey && (
                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                              Kunci
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* EDITOR MODAL / DRAWER */}
      {/* ------------------------------------------------------------- */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-4xl w-full p-6 max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 text-xs">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    Kurikulum Merdeka Asesmen
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 font-semibold text-xs">
                    Berbasis Tujuan Pembelajaran (TP)
                  </span>
                </div>
                <h3 className="font-black text-xl text-slate-900 dark:text-white">
                  {editingId ? 'Edit Butir Soal & Metadata TP' : 'Tulis Butir Soal Baru Berdasarkan TP'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* SECTION 1: Jenjang Sekolah & Mata Pelajaran */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    1. Jenjang Sekolah & Mata Pelajaran
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Jenjang Selector */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Jenjang Sekolah:
                    </label>
                    <select
                      value={formData.jenjang_sekolah}
                      onChange={(e) => {
                        const newJenjang = e.target.value as JenjangSekolah;
                        const matchingMapels = mapelList.filter((m) => m.jenjang_sekolah === newJenjang);
                        const firstMapel = matchingMapels[0] || mapelList[0];
                        const firstTp = firstMapel?.daftar_tp?.[0];
                        const defaultKelas = newJenjang === 'SD' ? 'Kelas 4' : newJenjang === 'SMP' ? 'Kelas 8' : 'Kelas 10';

                        setFormData((prev) => ({
                          ...prev,
                          jenjang_sekolah: newJenjang,
                          mapel_id: firstMapel?.id || '',
                          tingkat_kelas: firstMapel?.tingkat_kelas || defaultKelas,
                          kode_tp: firstTp?.kode_tp || '',
                          tujuan_pembelajaran: firstTp?.deskripsi || '',
                          lingkup_materi: firstTp?.lingkup_materi || '',
                          indikator_soal: firstTp ? `Disajikan stimulus, peserta didik mampu menyelesaikan persoalan terkait ${firstTp.lingkup_materi.toLowerCase()}` : '',
                          capaian_pembelajaran: firstTp?.deskripsi || '',
                        }));
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-indigo-900"
                    >
                      <option value="SD">SD (Sekolah Dasar)</option>
                      <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
                      <option value="SMA">SMA (Sekolah Menengah Atas)</option>
                    </select>
                  </div>

                  {/* Mata Pelajaran Selector - filtered by chosen jenjang */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mata Pelajaran ({formData.jenjang_sekolah}):
                    </label>
                    <select
                      value={formData.mapel_id}
                      onChange={(e) => {
                        const mId = e.target.value;
                        const selMapel = mapelList.find((m) => m.id === mId);
                        const firstTp = selMapel?.daftar_tp?.[0];
                        setFormData((prev) => ({
                          ...prev,
                          mapel_id: mId,
                          tingkat_kelas: selMapel?.tingkat_kelas || prev.tingkat_kelas,
                          kode_tp: firstTp?.kode_tp || prev.kode_tp,
                          tujuan_pembelajaran: firstTp?.deskripsi || prev.tujuan_pembelajaran,
                          lingkup_materi: firstTp?.lingkup_materi || prev.lingkup_materi,
                          indikator_soal: firstTp ? `Disajikan stimulus, peserta didik mampu menyelesaikan persoalan terkait ${firstTp.lingkup_materi.toLowerCase()}` : prev.indikator_soal,
                          capaian_pembelajaran: firstTp?.deskripsi || prev.capaian_pembelajaran,
                        }));
                      }}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                      required
                    >
                      {(() => {
                        const matching = mapelList.filter((m) => m.jenjang_sekolah === formData.jenjang_sekolah);
                        const listToRender = matching.length > 0 ? matching : mapelList;
                        return listToRender.map((m) => (
                          <option key={m.id} value={m.id}>
                            [{m.jenjang_sekolah}] {m.nama_mapel} ({m.tingkat_kelas})
                          </option>
                        ));
                      })()}
                    </select>
                  </div>

                  {/* Tingkat Kelas */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tingkat Kelas:
                    </label>
                    <select
                      value={formData.tingkat_kelas}
                      onChange={(e) => setFormData({ ...formData, tingkat_kelas: e.target.value })}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold"
                    >
                      {formData.jenjang_sekolah === 'SD' && (
                        <>
                          <option value="Kelas 1">Kelas 1 SD (Fase A)</option>
                          <option value="Kelas 2">Kelas 2 SD (Fase A)</option>
                          <option value="Kelas 3">Kelas 3 SD (Fase B)</option>
                          <option value="Kelas 4">Kelas 4 SD (Fase B)</option>
                          <option value="Kelas 5">Kelas 5 SD (Fase C)</option>
                          <option value="Kelas 6">Kelas 6 SD (Fase C)</option>
                        </>
                      )}
                      {formData.jenjang_sekolah === 'SMP' && (
                        <>
                          <option value="Kelas 7">Kelas 7 SMP (Fase D)</option>
                          <option value="Kelas 8">Kelas 8 SMP (Fase D)</option>
                          <option value="Kelas 9">Kelas 9 SMP (Fase D)</option>
                        </>
                      )}
                      {formData.jenjang_sekolah === 'SMA' && (
                        <>
                          <option value="Kelas 10">Kelas 10 SMA (Fase E)</option>
                          <option value="Kelas 11">Kelas 11 SMA (Fase F)</option>
                          <option value="Kelas 12">Kelas 12 SMA (Fase F)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Tujuan Pembelajaran (TP) Kurikulum Merdeka */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-black text-indigo-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-600" />
                    2. Pemetaan Tujuan Pembelajaran (TP) & Indikator Soal
                  </span>
                  <span className="text-[11px] text-indigo-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-Fill Kurikulum
                  </span>
                </div>

                {/* Quick Picker from defined TPs */}
                {(() => {
                  const activeMapel = mapelList.find((m) => m.id === formData.mapel_id);
                  const tpList = activeMapel?.daftar_tp || [];

                  return (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-indigo-900 text-[11px]">
                          Pilih Tujuan Pembelajaran Standar (Katalog Kurikulum):
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMapelForTp(formData.mapel_id);
                            setIsTpModalOpen(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] underline flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Kelola / Edit TP Mapel Ini</span>
                        </button>
                      </div>

                      {tpList.length === 0 ? (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                          <span className="text-[11px] text-amber-800 font-medium">
                            Belum ada Tujuan Pembelajaran untuk {activeMapel?.nama_mapel || 'mapel ini'}.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMapelForTp(formData.mapel_id);
                              setIsTpModalOpen(true);
                            }}
                            className="text-[11px] font-bold text-indigo-700 underline cursor-pointer"
                          >
                            + Tambah TP Sekarang
                          </button>
                        </div>
                      ) : (
                        <select
                          onChange={(e) => {
                            const chosenTp = tpList.find((tp) => tp.kode_tp === e.target.value);
                            if (chosenTp) {
                              setFormData((prev) => ({
                                ...prev,
                                kode_tp: chosenTp.kode_tp,
                                tujuan_pembelajaran: chosenTp.deskripsi,
                                lingkup_materi: chosenTp.lingkup_materi,
                                capaian_pembelajaran: chosenTp.deskripsi,
                                indikator_soal: chosenTp.indikator_asesmen || `Disajikan stimulus, peserta didik mampu menyelesaikan persoalan terkait ${chosenTp.lingkup_materi.toLowerCase()}`,
                              }));
                            }
                          }}
                          value={formData.kode_tp || ''}
                          className="w-full p-2 bg-white border border-indigo-300 rounded-xl text-xs font-semibold text-slate-800"
                        >
                          <option value="">-- Pilih dari Daftar TP {activeMapel?.nama_mapel} --</option>
                          {tpList.map((tp) => (
                            <option key={tp.kode_tp} value={tp.kode_tp}>
                              [{tp.kode_tp}] {tp.lingkup_materi}: {tp.deskripsi}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Kode TP:
                    </label>
                    <input
                      type="text"
                      value={formData.kode_tp}
                      onChange={(e) => setFormData({ ...formData, kode_tp: e.target.value })}
                      placeholder="e.g. TP 4.1"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Lingkup Materi / Topik:
                    </label>
                    <input
                      type="text"
                      value={formData.lingkup_materi}
                      onChange={(e) => setFormData({ ...formData, lingkup_materi: e.target.value })}
                      placeholder="e.g. Bilangan Cacah, Ekosistem, Bangun Ruang"
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Deskripsi Tujuan Pembelajaran (TP):
                  </label>
                  <textarea
                    rows={2}
                    value={formData.tujuan_pembelajaran}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tujuan_pembelajaran: e.target.value,
                        capaian_pembelajaran: e.target.value,
                      })
                    }
                    placeholder="Deskripsi kemampuan yang diukur sesuai dokumen ATP/TP..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Indikator Ketercapaian Soal (Indikator Asesmen):
                  </label>
                  <input
                    type="text"
                    value={formData.indikator_soal}
                    onChange={(e) => setFormData({ ...formData, indikator_soal: e.target.value })}
                    placeholder="e.g. Disajikan konteks masalah sehari-hari, siswa dapat menentukan..."
                    className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* SECTION 3: Tipe Soal, Level Kognitif & Bobot */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Jenis Soal:
                  </label>
                  <select
                    value={formData.jenis_soal}
                    onChange={(e) =>
                      setFormData({ ...formData, jenis_soal: e.target.value as JenisSoal })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="PILIHAN_GANDA">Pilihan Ganda (Tunggal)</option>
                    <option value="PG_KOMPLEKS">Pilihan Ganda Kompleks (AKM)</option>
                    <option value="ISIAN_SINGKAT">Isian Singkat</option>
                    <option value="ESAI_URAIAN">Esai / Uraian HOTS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Level Kognitif:
                  </label>
                  <select
                    value={formData.level_kognitif}
                    onChange={(e) =>
                      setFormData({ ...formData, level_kognitif: e.target.value as LevelKognitif })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  >
                    <option value="L1">Level 1 (Pengetahuan & Pemahaman)</option>
                    <option value="L2">Level 2 (Aplikasi & Komputasi)</option>
                    <option value="L3">Level 3 (Penalaran / HOTS)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Bobot Skor Nilai:
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="20"
                    value={formData.bobot_nilai}
                    onChange={(e) =>
                      setFormData({ ...formData, bobot_nilai: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
              </div>

              {/* Stimulus Konten */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Stimulus Konteks / Wacana Bacaan (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={formData.stimulus_konten}
                  onChange={(e) =>
                    setFormData({ ...formData, stimulus_konten: e.target.value })
                  }
                  placeholder="Ketik narasi kasus, tabel data, atau wacana (dapat menyisipkan rumus $formula$)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-serif"
                />
              </div>

              {/* KaTeX Math Toolbar Helper */}
              <div className="p-3 bg-slate-100 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-bold text-slate-800 text-[11px]">
                    Sisipkan Rumus KaTeX Cepat (LaTeX Math Toolbar):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {[
                    { label: 'Pecahan \\frac{a}{b}', code: '$\\frac{a}{b}$' },
                    { label: 'Akar \\sqrt{x}', code: '$\\sqrt{x}$' },
                    { label: 'Pangkat x^2', code: '$x^2$' },
                    { label: 'Subskrip x_1', code: '$x_1$' },
                    { label: 'Plus-Minus \\pm', code: '$\\pm$' },
                    { label: 'Limit \\lim', code: '$\\lim_{x \\to 0}$' },
                    { label: 'Integral \\int', code: '$\\int_a^b f(x)dx$' },
                    { label: 'Matriks 2x2', code: '$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$' },
                    { label: 'Simbol \\alpha, \\theta, \\pi', code: '$\\alpha, \\theta, \\pi$' },
                  ].map((btn, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => insertLatexTemplate(btn.code)}
                      className="px-2.5 py-1 bg-white hover:bg-indigo-50 text-slate-700 rounded-lg border border-slate-300 font-mono transition cursor-pointer"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pertanyaan Teks with Live KaTeX Preview */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Kalimat Pertanyaan / Pokok Soal (Stem):
                </label>
                <textarea
                  rows={3}
                  value={formData.pertanyaan_teks}
                  onChange={(e) =>
                    setFormData({ ...formData, pertanyaan_teks: e.target.value })
                  }
                  placeholder="Ketik pokok butir soal (gunakan $rumus$ untuk KaTeX)..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  required
                />

                {/* Live Preview box */}
                {formData.pertanyaan_teks && (
                  <div className="mt-2 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-700 font-bold mb-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live KaTeX Preview:</span>
                    </div>
                    <div className="text-slate-800 font-medium">
                      <MathRenderer content={formData.pertanyaan_teks} />
                    </div>
                  </div>
                )}
              </div>

              {/* Options Editor for PG & PG Kompleks */}
              {(formData.jenis_soal === 'PILIHAN_GANDA' || formData.jenis_soal === 'PG_KOMPLEKS') && (
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">
                      Opsi Jawaban & Kunci:
                    </label>
                    <span className="text-[11px] text-slate-500">
                      {formData.jenis_soal === 'PILIHAN_GANDA'
                        ? 'Pilih 1 radio button sebagai kunci jawaban benar'
                        : 'Centang checkbox untuk multiple answer (AKM)'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {formData.opsi_jawaban_json.map((opt, oIdx) => {
                      const isChecked =
                        formData.jenis_soal === 'PILIHAN_GANDA'
                          ? formData.kunci_jawaban_terenkripsi === opt.id
                          : Array.isArray(formData.kunci_jawaban_terenkripsi) &&
                            formData.kunci_jawaban_terenkripsi.includes(opt.id);

                      return (
                        <div key={opt.id} className="flex items-center gap-2">
                          <input
                            type={formData.jenis_soal === 'PILIHAN_GANDA' ? 'radio' : 'checkbox'}
                            name="kunci_editor"
                            checked={isChecked}
                            onChange={() => {
                              if (formData.jenis_soal === 'PILIHAN_GANDA') {
                                setFormData({ ...formData, kunci_jawaban_terenkripsi: opt.id });
                              } else {
                                const current = Array.isArray(formData.kunci_jawaban_terenkripsi)
                                  ? [...formData.kunci_jawaban_terenkripsi]
                                  : [];
                                if (current.includes(opt.id)) {
                                  setFormData({
                                    ...formData,
                                    kunci_jawaban_terenkripsi: current.filter((k) => k !== opt.id),
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    kunci_jawaban_terenkripsi: [...current, opt.id],
                                  });
                                }
                              }
                            }}
                            className="cursor-pointer"
                          />
                          <span className="font-bold w-5 text-center">{opt.label}.</span>
                          <input
                            type="text"
                            value={opt.teks}
                            onChange={(e) => {
                              const newOpts = [...formData.opsi_jawaban_json];
                              newOpts[oIdx] = { ...newOpts[oIdx], teks: e.target.value };
                              setFormData({ ...formData, opsi_jawaban_json: newOpts });
                            }}
                            placeholder={`Teks pilihan ${opt.label}...`}
                            className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                            required
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Isian Singkat Answer Key */}
              {formData.jenis_soal === 'ISIAN_SINGKAT' && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block font-bold text-slate-700 mb-1">
                    Kunci Jawaban Tepat (Isian Singkat):
                  </label>
                  <input
                    type="text"
                    value={typeof formData.kunci_jawaban_terenkripsi === 'string' ? formData.kunci_jawaban_terenkripsi : ''}
                    onChange={(e) =>
                      setFormData({ ...formData, kunci_jawaban_terenkripsi: e.target.value })
                    }
                    placeholder="e.g. 24 cm, Fotosintesis, dsb..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
              )}

              {/* Rubrik Penilaian Esai */}
              {formData.jenis_soal === 'ESAI_URAIAN' && (
                <div className="pt-2 border-t border-slate-200">
                  <label className="block font-bold text-slate-700 mb-1">
                    Pedoman Penskoran & Rubrik Esai:
                  </label>
                  <textarea
                    rows={3}
                    value={formData.rubrik_penilaian_esai}
                    onChange={(e) =>
                      setFormData({ ...formData, rubrik_penilaian_esai: e.target.value })
                    }
                    placeholder="Jelaskan kriteria skor per langkah pengerjaan..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? 'Menyimpan...' : 'Simpan Butir Soal ke Bank'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* TP Management Modal */}
      <TpManagementModal
        isOpen={isTpModalOpen}
        onClose={() => setIsTpModalOpen(false)}
        initialMapelId={selectedMapelForTp}
        onTpUpdated={async () => {
          const mapels = await apiService.getMapel();
          setMapelList(mapels);
        }}
      />
    </div>
  );
};
