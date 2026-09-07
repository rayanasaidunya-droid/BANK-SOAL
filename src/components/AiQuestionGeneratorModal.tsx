import React, { useState, useEffect } from 'react';
import {
  MataPelajaranKurikulum,
  JenjangSekolah,
  JenisSoal,
  LevelKognitif,
  BankSoalButir,
  OpsiJawaban,
} from '../types';
import { apiService } from '../services/api';
import { fallbackStore } from '../data/fallbackStore';
import { MathRenderer } from './MathRenderer';
import {
  Sparkles,
  X,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronDown,
  ChevronUp,
  Save,
  RefreshCw,
  Edit3,
  Lightbulb,
  FileCheck,
  Zap,
  Target,
  GraduationCap,
  Calculator,
} from 'lucide-react';

interface AiQuestionGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSoalSaved?: (savedCount: number) => void;
  initialJenjang?: JenjangSekolah;
  initialMapelId?: string;
}

export const AiQuestionGeneratorModal: React.FC<AiQuestionGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSoalSaved,
  initialJenjang = 'SD',
  initialMapelId,
}) => {
  const [mapelList, setMapelList] = useState<MataPelajaranKurikulum[]>([]);
  const [jenjang, setJenjang] = useState<JenjangSekolah>(initialJenjang);
  const [tingkatKelas, setTingkatKelas] = useState<string>('Kelas 4 SD');
  const [selectedMapelId, setSelectedMapelId] = useState<string>(initialMapelId || '');
  const [namaMapelCustom, setNamaMapelCustom] = useState<string>('');
  const [lingkupMateri, setLingkupMateri] = useState<string>('Fotosintesis dan Rantai Makanan');
  const [tujuanPembelajaran, setTujuanPembelajaran] = useState<string>('');
  const [capaianPembelajaran, setCapaianPembelajaran] = useState<string>('');
  const [kodeTp, setKodeTp] = useState<string>('TP-01');

  // Generator Config
  const [jenisSoal, setJenisSoal] = useState<'PILIHAN_GANDA' | 'PG_KOMPLEKS' | 'ISIAN_SINGKAT' | 'ESAI_URAIAN' | 'CAMPURAN'>('CAMPURAN');
  const [levelKognitif, setLevelKognitif] = useState<'L1' | 'L2' | 'L3' | 'CAMPURAN'>('CAMPURAN');
  const [jumlahSoal, setJumlahSoal] = useState<number>(3);
  const [sertakanStimulus, setSertakanStimulus] = useState<boolean>(true);
  const [sertakanRumusKatex, setSertakanRumusKatex] = useState<boolean>(false);
  const [tingkatKesulitan, setTingkatKesulitan] = useState<'MUDAH' | 'SEDANG' | 'SULIT' | 'HOTS'>('SEDANG');
  const [catatanKhusus, setCatatanKhusus] = useState<string>('');

  // Results & UI State
  const [generating, setGenerating] = useState<boolean>(false);
  const [savingBatch, setSavingBatch] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);
  const [generationMeta, setGenerationMeta] = useState<{ source?: string; model?: string } | null>(null);
  const [expandedPembahasan, setExpandedPembahasan] = useState<Record<number, boolean>>({});
  const [savedItemIds, setSavedItemIds] = useState<Record<string, boolean>>({});
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Load Mapel List
  useEffect(() => {
    const loadMapel = async () => {
      try {
        const list = await apiService.getMapel();
        setMapelList(list);
      } catch {
        setMapelList(fallbackStore.getMapel());
      }
    };
    loadMapel();
  }, []);

  // Update filtered mapels when jenjang changes
  useEffect(() => {
    const available = mapelList.filter((m) => m.jenjang_sekolah === jenjang);
    if (available.length > 0) {
      const match = available.find((m) => m.id === selectedMapelId) || available[0];
      setSelectedMapelId(match.id);
      setNamaMapelCustom(match.nama_mapel);
      setTingkatKelas(match.tingkat_kelas || (jenjang === 'SD' ? 'Kelas 4 SD' : jenjang === 'SMP' ? 'Kelas 7 SMP' : 'Kelas 10 SMA'));
      
      // If mapel has TP, pick the first one
      if (match.daftar_tp && match.daftar_tp.length > 0) {
        const firstTp = match.daftar_tp[0];
        setKodeTp(firstTp.kode_tp);
        setLingkupMateri(firstTp.lingkup_materi);
        setTujuanPembelajaran(firstTp.deskripsi);
      }
    }
  }, [jenjang, mapelList]);

  // When selected mapel changes, update defaults
  const handleMapelChange = (mapelId: string) => {
    setSelectedMapelId(mapelId);
    const mapel = mapelList.find((m) => m.id === mapelId);
    if (mapel) {
      setNamaMapelCustom(mapel.nama_mapel);
      setTingkatKelas(mapel.tingkat_kelas);
      if (mapel.daftar_tp && mapel.daftar_tp.length > 0) {
        const firstTp = mapel.daftar_tp[0];
        setKodeTp(firstTp.kode_tp);
        setLingkupMateri(firstTp.lingkup_materi);
        setTujuanPembelajaran(firstTp.deskripsi);
      }
      // If mapel is exact / math, auto-check KaTeX
      const isExact = mapel.nama_mapel.toLowerCase().includes('matematika') || mapel.nama_mapel.toLowerCase().includes('fisika');
      setSertakanRumusKatex(isExact);
    }
  };

  // Quick preset topic click
  const handleSelectTpPreset = (tp: { kode_tp: string; deskripsi: string; lingkup_materi: string }) => {
    setKodeTp(tp.kode_tp);
    setLingkupMateri(tp.lingkup_materi);
    setTujuanPembelajaran(tp.deskripsi);
  };

  // Generate Action
  const handleGenerate = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setGenerating(true);

    const activeMapel = mapelList.find((m) => m.id === selectedMapelId);
    const namaMapel = activeMapel ? activeMapel.nama_mapel : namaMapelCustom || 'Mata Pelajaran Umum';

    try {
      const res = await apiService.generateSoalAi({
        jenjang_sekolah: jenjang,
        tingkat_kelas: tingkatKelas,
        mapel_id: selectedMapelId || undefined,
        nama_mapel: namaMapel,
        lingkup_materi: lingkupMateri,
        capaian_pembelajaran: capaianPembelajaran || `Memahami dan menguasai konsep esensial ${lingkupMateri}`,
        tujuan_pembelajaran: tujuanPembelajaran || `Peserta didik mampu menganalisis permasalahan terkait ${lingkupMateri}`,
        kode_tp: kodeTp,
        jenis_soal: jenisSoal,
        level_kognitif: levelKognitif,
        jumlah_soal: jumlahSoal,
        sertakan_stimulus: sertakanStimulus,
        sertakan_rumus_katex: sertakanRumusKatex,
        tingkat_kesulitan: tingkatKesulitan,
        catatan_khusus: catatanKhusus || undefined,
      });

      if (res.data && Array.isArray(res.data.items)) {
        setGeneratedItems(res.data.items);
        setGenerationMeta({ source: res.data.source, model: res.data.model });
        setSavedItemIds({});
        setSuccessMsg(`Berhasil menghasilkan ${res.data.items.length} butir soal berkualitas tinggi berbasis ${res.data.source === 'GEMINI_AI' ? 'Gemini AI 3.8 Flash' : 'Standar Kurikulum Nasional'}. Silakan tinjau sebelum disimpan!`);
      } else {
        throw new Error('Format data hasil generasi tidak valid');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menghasilkan butir soal otomatis. Silakan periksa input atau coba lagi.');
    } finally {
      setGenerating(false);
    }
  };

  // Save Single Item to Bank Soal
  const handleSaveSingleItem = async (item: any, idx: number) => {
    try {
      const activeMapel = mapelList.find((m) => m.id === selectedMapelId);
      const payload: Partial<BankSoalButir> = {
        mapel_id: selectedMapelId || activeMapel?.id || 'mapel-ipas-sd-4',
        jenjang_sekolah: jenjang,
        tingkat_kelas: tingkatKelas,
        kode_tp: item.kode_tp || kodeTp,
        tujuan_pembelajaran: item.tujuan_pembelajaran || tujuanPembelajaran,
        lingkup_materi: item.lingkup_materi || lingkupMateri,
        indikator_soal: item.indikator_soal,
        jenis_soal: item.jenis_soal,
        level_kognitif: item.level_kognitif,
        capaian_pembelajaran: item.capaian_pembelajaran || capaianPembelajaran,
        stimulus_konten: item.stimulus_konten,
        stimulus_gambar_url: item.stimulus_gambar_url,
        pertanyaan_teks: item.pertanyaan_teks,
        opsi_jawaban_json: item.opsi_jawaban_json || [],
        kunci_jawaban_terenkripsi: item.kunci_jawaban_terenkripsi,
        bobot_nilai: item.bobot_nilai,
        rubrik_penilaian_esai: item.rubrik_penilaian_esai,
        status_validasi: 'TERVALIDASI',
        penulis_guru_id: 'guru-ai',
        nama_penulis: 'AI Generator & Guru Penulis',
      };

      await apiService.saveBankSoalItem(payload);
      setSavedItemIds((prev) => ({ ...prev, [item.id || idx]: true }));
      setSuccessMsg(`Soal nomor ${idx + 1} berhasil disimpan ke Bank Soal!`);
      if (onSoalSaved) onSoalSaved(1);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan butir soal.');
    }
  };

  // Save All Items (Batch)
  const handleSaveAllItems = async () => {
    if (generatedItems.length === 0) return;
    try {
      setSavingBatch(true);
      setErrorMsg(null);
      const activeMapel = mapelList.find((m) => m.id === selectedMapelId);

      const itemsToSave = generatedItems.map((item) => ({
        mapel_id: selectedMapelId || activeMapel?.id || 'mapel-ipas-sd-4',
        jenjang_sekolah: jenjang,
        tingkat_kelas: tingkatKelas,
        kode_tp: item.kode_tp || kodeTp,
        tujuan_pembelajaran: item.tujuan_pembelajaran || tujuanPembelajaran,
        lingkup_materi: item.lingkup_materi || lingkupMateri,
        indikator_soal: item.indikator_soal,
        jenis_soal: item.jenis_soal,
        level_kognitif: item.level_kognitif,
        capaian_pembelajaran: item.capaian_pembelajaran || capaianPembelajaran,
        stimulus_konten: item.stimulus_konten,
        stimulus_gambar_url: item.stimulus_gambar_url,
        pertanyaan_teks: item.pertanyaan_teks,
        opsi_jawaban_json: item.opsi_jawaban_json || [],
        kunci_jawaban_terenkripsi: item.kunci_jawaban_terenkripsi,
        bobot_nilai: item.bobot_nilai,
        rubrik_penilaian_esai: item.rubrik_penilaian_esai,
        status_validasi: 'TERVALIDASI' as const,
        penulis_guru_id: 'guru-ai',
        nama_penulis: 'AI Generator & Guru Penulis',
      }));

      const res = await apiService.saveBatchBankSoalItems({
        items: itemsToSave,
        mapel_id: selectedMapelId,
        jenjang_sekolah: jenjang,
        tingkat_kelas: tingkatKelas,
      });

      const allSaved: Record<string, boolean> = {};
      generatedItems.forEach((it, idx) => {
        allSaved[it.id || idx] = true;
      });
      setSavedItemIds(allSaved);

      setSuccessMsg(res.message || `Semua ${generatedItems.length} butir soal berhasil ditambahkan ke Bank Soal!`);
      if (onSoalSaved) onSoalSaved(generatedItems.length);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal menyimpan seluruh butir soal.');
    } finally {
      setSavingBatch(false);
    }
  };

  const togglePembahasan = (idx: number) => {
    setExpandedPembahasan((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (!isOpen) return null;

  const currentMapelObj = mapelList.find((m) => m.id === selectedMapelId);
  const currentDaftarTp = currentMapelObj?.daftar_tp || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-linear-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white px-6 py-5 flex items-center justify-between border-b border-indigo-700/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Generator Soal Otomatis Berbasis AI
                </h2>
                <span className="text-[10px] uppercase tracking-widest font-black text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Gemini Flash 3.8 & AKM Ready
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5">
                Susun butir soal multitipe kontekstual, stimulus wacana HOTS, kunci terenkripsi, dan rubrik asesmen instan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notifications */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700 cursor-pointer">
                ✕
              </button>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 cursor-pointer">
                ✕
              </button>
            </div>
          )}

          {/* Section 1: Parameter Konfigurasi AI */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-600" />
                Parameter Kurikulum & Sasaran Asesmen
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                Langkah 1: Tentukan Target Materi & Tipe Soal
              </span>
            </div>

            {/* Row 1: Jenjang, Kelas, Mapel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Jenjang */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jenjang Satuan Pendidikan
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['SD', 'SMP', 'SMA'] as JenjangSekolah[]).map((j) => (
                    <button
                      key={j}
                      type="button"
                      onClick={() => setJenjang(j)}
                      className={`py-2 px-3 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                        jenjang === j
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {j}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tingkat Kelas */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tingkat / Fase Kelas
                </label>
                <select
                  value={tingkatKelas}
                  onChange={(e) => setTingkatKelas(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {jenjang === 'SD' ? (
                    <>
                      <option value="Kelas 1 SD">Kelas 1 SD (Fase A)</option>
                      <option value="Kelas 2 SD">Kelas 2 SD (Fase A)</option>
                      <option value="Kelas 3 SD">Kelas 3 SD (Fase B)</option>
                      <option value="Kelas 4 SD">Kelas 4 SD (Fase B)</option>
                      <option value="Kelas 5 SD">Kelas 5 SD (Fase C)</option>
                      <option value="Kelas 6 SD">Kelas 6 SD (Fase C)</option>
                    </>
                  ) : jenjang === 'SMP' ? (
                    <>
                      <option value="Kelas 7 SMP">Kelas 7 SMP (Fase D)</option>
                      <option value="Kelas 8 SMP">Kelas 8 SMP (Fase D)</option>
                      <option value="Kelas 9 SMP">Kelas 9 SMP (Fase D)</option>
                    </>
                  ) : (
                    <>
                      <option value="Kelas 10 SMA">Kelas 10 SMA (Fase E)</option>
                      <option value="Kelas 11 SMA">Kelas 11 SMA (Fase F)</option>
                      <option value="Kelas 12 SMA">Kelas 12 SMA (Fase F)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Mata Pelajaran */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mata Pelajaran
                </label>
                <select
                  value={selectedMapelId}
                  onChange={(e) => handleMapelChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  {mapelList
                    .filter((m) => m.jenjang_sekolah === jenjang)
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama_mapel} ({m.kode_mapel})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Quick TP Presets (if available) */}
            {currentDaftarTp.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-600">
                    Preset Tujuan Pembelajaran (TP) Terdaftar:
                  </span>
                  <span className="text-[10px] text-indigo-600 font-bold">
                    Klik untuk isi otomatis topik & CP
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentDaftarTp.map((tp) => {
                    const isSelected = kodeTp === tp.kode_tp;
                    return (
                      <button
                        key={tp.kode_tp}
                        type="button"
                        onClick={() => handleSelectTpPreset(tp)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition-all text-left flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded font-black">
                          {tp.kode_tp}
                        </span>
                        <span className="truncate max-w-[220px]">{tp.lingkup_materi}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Row 2: Lingkup Materi & Tujuan Pembelajaran */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lingkup Materi / Topik Khusus
                </label>
                <input
                  type="text"
                  value={lingkupMateri}
                  onChange={(e) => setLingkupMateri(e.target.value)}
                  placeholder="Contoh: Ekosistem, Fotosintesis, Pecahan Campuran, Perubahan Wujud Zat..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tujuan Pembelajaran (TP) / Indikator
                </label>
                <input
                  type="text"
                  value={tujuanPembelajaran}
                  onChange={(e) => setTujuanPembelajaran(e.target.value)}
                  placeholder="Contoh: Peserta didik mampu menganalisis peran produsen dan konsumen..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Row 3: Jenis Soal, Level Kognitif, Jumlah Soal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Format / Jenis Soal
                </label>
                <select
                  value={jenisSoal}
                  onChange={(e) => setJenisSoal(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CAMPURAN">Campuran (PG, Kompleks, Esai)</option>
                  <option value="PILIHAN_GANDA">Pilihan Ganda (Tunggal)</option>
                  <option value="PG_KOMPLEKS">Pilihan Ganda Kompleks (Multi-Opsi)</option>
                  <option value="ISIAN_SINGKAT">Isian Singkat / Numerasi</option>
                  <option value="ESAI_URAIAN">Esai / Uraian HOTS (dengan Rubrik)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Level Kognitif
                </label>
                <select
                  value={levelKognitif}
                  onChange={(e) => setLevelKognitif(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="CAMPURAN">Campuran (L1, L2, L3 HOTS)</option>
                  <option value="L1">Level 1 - Pemahaman & Mengingat (C1-C2)</option>
                  <option value="L2">Level 2 - Aplikasi & Penerapan (C3)</option>
                  <option value="L3">Level 3 - Penalaran & HOTS (C4-C6)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Jumlah Butir Soal
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 5].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={() => setJumlahSoal(cnt)}
                      className={`py-2 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                        jumlahSoal === cnt
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cnt} Soal
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 4: Advanced Options & Checkboxes */}
            <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sertakanStimulus}
                    onChange={(e) => setSertakanStimulus(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span>Sertakan Stimulus Wacana / Studi Kasus</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sertakanRumusKatex}
                    onChange={(e) => setSertakanRumusKatex(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                    Format Rumus KaTeX ($...$)
                  </span>
                </label>
              </div>

              {/* Action Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating || !lingkupMateri.trim()}
                className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Gemini AI Sedang Menulis Soal...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Generate Soal Otomatis ({jumlahSoal} Butir)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Review Hasil Generasi AI */}
          {generatedItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    Hasil Generasi Soal ({generatedItems.length} Butir)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Engine:{' '}
                    <span className="font-bold text-indigo-700">
                      {generationMeta?.source === 'GEMINI_AI'
                        ? 'Google Gemini 3.8 Flash (Server-Side SDK)'
                        : 'Engine Kurikulum Nasional (Terstandarisasi)'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={generating}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                    <span>Generate Ulang</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAllItems}
                    disabled={savingBatch || generatedItems.every((it, idx) => savedItemIds[it.id || idx])}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer"
                  >
                    {savingBatch ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Simpan Semua ke Bank Soal</span>
                  </button>
                </div>
              </div>

              {/* List of Generated Cards */}
              <div className="space-y-4">
                {generatedItems.map((item, idx) => {
                  const isSaved = savedItemIds[item.id || idx];
                  const isPembahasanOpen = expandedPembahasan[idx] ?? false;

                  return (
                    <div
                      key={item.id || idx}
                      className={`p-5 rounded-2xl border transition-all ${
                        isSaved
                          ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                      }`}
                    >
                      {/* Card Header Badges */}
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                            {idx + 1}
                          </span>

                          <span className="text-[10px] uppercase tracking-wider font-black px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {item.jenis_soal === 'PILIHAN_GANDA'
                              ? 'Pilihan Ganda'
                              : item.jenis_soal === 'PG_KOMPLEKS'
                              ? 'PG Kompleks'
                              : item.jenis_soal === 'ISIAN_SINGKAT'
                              ? 'Isian Singkat'
                              : 'Esai / Uraian'}
                          </span>

                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                              item.level_kognitif === 'L3'
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : item.level_kognitif === 'L2'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            Level {item.level_kognitif} {item.level_kognitif === 'L3' ? '(HOTS)' : ''}
                          </span>

                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Bobot: {item.bobot_nilai} Poin
                          </span>

                          {item.kode_tp && (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded-md">
                              TP: {item.kode_tp}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isSaved ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Tersimpan di Bank Soal</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSaveSingleItem(item, idx)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Simpan Butir Ini</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Stimulus Konten */}
                      {item.stimulus_konten && (
                        <div className="mb-3.5 p-3.5 rounded-xl bg-slate-50 border-l-4 border-indigo-500 text-xs text-slate-700 leading-relaxed">
                          <span className="font-black text-indigo-900 block mb-1 text-[11px] uppercase tracking-wider">
                            Wacana / Stimulus Kontekstual:
                          </span>
                          <MathRenderer content={item.stimulus_konten} />
                        </div>
                      )}

                      {/* Pertanyaan Teks */}
                      <div className="mb-3 text-sm font-bold text-slate-900 leading-relaxed">
                        <MathRenderer content={item.pertanyaan_teks} />
                      </div>

                      {/* Opsi Jawaban (for PG / PG Kompleks) */}
                      {Array.isArray(item.opsi_jawaban_json) && item.opsi_jawaban_json.length > 0 && (
                        <div className="space-y-1.5 mb-3.5">
                          {item.opsi_jawaban_json.map((opt: OpsiJawaban) => {
                            const isKey = Array.isArray(item.kunci_jawaban_terenkripsi)
                              ? item.kunci_jawaban_terenkripsi.includes(opt.id)
                              : item.kunci_jawaban_terenkripsi === opt.id;

                            return (
                              <div
                                key={opt.id}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs transition-all ${
                                  isKey
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                                    isKey
                                      ? 'bg-emerald-600 text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {opt.label}
                                </span>
                                <div className="flex-1 pt-0.5">
                                  <MathRenderer content={opt.teks} />
                                </div>
                                {isKey && (
                                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md self-center shrink-0">
                                    Kunci Jawaban
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Answer Key preview for Esai / Isian Singkat */}
                      {(item.jenis_soal === 'ESAI_URAIAN' || item.jenis_soal === 'ISIAN_SINGKAT') && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3 text-xs">
                          <span className="font-black text-amber-900 block mb-1">
                            Intisari Kunci / Jawaban Benar:
                          </span>
                          <span className="text-amber-800">
                            {typeof item.kunci_jawaban_terenkripsi === 'string'
                              ? item.kunci_jawaban_terenkripsi
                              : JSON.stringify(item.kunci_jawaban_terenkripsi)}
                          </span>
                        </div>
                      )}

                      {/* Accordion Pembahasan & Rubrik */}
                      {(item.pembahasan || item.rubrik_penilaian_esai) && (
                        <div className="pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => togglePembahasan(idx)}
                            className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                          >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>
                              {isPembahasanOpen ? 'Sembunyikan Pembahasan & Rubrik' : 'Lihat Pembahasan & Rubrik Penskoran'}
                            </span>
                            {isPembahasanOpen ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {isPembahasanOpen && (
                            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                              {item.pembahasan && (
                                <div>
                                  <span className="font-bold text-slate-900 block mb-0.5">
                                    Pembahasan Edukatif:
                                  </span>
                                  <MathRenderer content={item.pembahasan} />
                                </div>
                              )}
                              {item.rubrik_penilaian_esai && (
                                <div>
                                  <span className="font-bold text-slate-900 block mb-0.5">
                                    Rubrik Penskoran Analitis:
                                  </span>
                                  <p className="whitespace-pre-line text-slate-600">
                                    {item.rubrik_penilaian_esai}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>
              Soal otomatis terstandarisasi Taksonomi Bloom Terkini, AKM, dan Zero-Leakage Engine.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
