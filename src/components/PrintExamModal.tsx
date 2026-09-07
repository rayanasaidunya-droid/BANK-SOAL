import React, { useState } from 'react';
import { NaskahCetakData, KodeVarianPaket } from '../types';
import { MathRenderer } from './MathRenderer';
import { Printer, X, FileText, CheckCircle2, Award, BookOpen, Layers, School } from 'lucide-react';

interface PrintExamModalProps {
  data: NaskahCetakData;
  onClose: () => void;
  onSelectVarian: (varian: KodeVarianPaket) => void;
}

export const PrintExamModal: React.FC<PrintExamModalProps> = ({
  data,
  onClose,
  onSelectVarian,
}) => {
  const [viewMode, setViewMode] = useState<'NASKAH_SISWA' | 'KUNCI_RUBRIK' | 'KARTU_KISI'>('NASKAH_SISWA');

  const handlePrint = () => {
    window.print();
  };

  const { paket, mapel, varian, kop_sekolah, petunjuk_umum, soal_pg, soal_esai } = data;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm overflow-y-auto flex justify-center p-2 sm:p-4">
      {/* Modal Container */}
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl max-w-5xl w-full my-auto flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 print:max-w-none print:w-full print:m-0 print:border-none print:shadow-none print:rounded-none">
        {/* Modal Toolbar (hidden in print) */}
        <div className="print:hidden bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-600 text-white">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Generator Naskah Cetak 2-Kolom Standar Dinas Pendidikan
              </h2>
              <p className="text-xs text-slate-400">
                {paket.kode_ujian} • {mapel.nama_mapel} ({mapel.tingkat_kelas})
              </p>
            </div>
          </div>

          {/* Varian Selector & View Tabs */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
              <span className="px-2 text-slate-400 font-medium">Varian:</span>
              {(['A', 'B', 'CADANGAN'] as KodeVarianPaket[]).map((v) => (
                <button
                  key={v}
                  onClick={() => onSelectVarian(v)}
                  className={`px-2.5 py-1 rounded font-semibold transition ${
                    varian === v
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Paket {v}
                </button>
              ))}
            </div>

            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
              <button
                onClick={() => setViewMode('NASKAH_SISWA')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  viewMode === 'NASKAH_SISWA'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Naskah Siswa
              </button>
              <button
                onClick={() => setViewMode('KUNCI_RUBRIK')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  viewMode === 'KUNCI_RUBRIK'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Kunci & Rubrik
              </button>
              <button
                onClick={() => setViewMode('KARTU_KISI')}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  viewMode === 'KARTU_KISI'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Kisi-kisi & CP
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Cetak PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Tutup Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content Scroll Area */}
        <div className="overflow-y-auto p-6 sm:p-10 flex-1 bg-slate-50 font-serif print:bg-white print:p-0 print:overflow-visible text-slate-900">
          <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0">
            {/* KOP RESMI DINAS PENDIDIKAN & SEKOLAH */}
            <div className="border-b-4 border-double border-slate-900 pb-3 mb-5 text-center relative">
              {/* Logo Dinas Left Emblem */}
              <div className="absolute left-0 top-1 w-16 h-16 hidden sm:flex items-center justify-center border-2 border-slate-900 rounded-full p-2">
                <School className="w-10 h-10 text-slate-900" />
              </div>

              <div className="mx-auto sm:px-20 font-sans">
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-700">
                  {kop_sekolah.dinas}
                </h4>
                <h4 className="text-xs uppercase font-semibold tracking-wide text-slate-600">
                  {kop_sekolah.provinsi}
                </h4>
                <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase my-0.5">
                  {kop_sekolah.nama_sekolah}
                </h2>
                <p className="text-[11px] text-slate-600 leading-tight">
                  {kop_sekolah.alamat}
                </p>
                <div className="flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-800 mt-1 uppercase">
                  <span>{kop_sekolah.akreditasi}</span>
                  <span>•</span>
                  <span>{kop_sekolah.tahun_ajaran}</span>
                </div>
              </div>
            </div>

            {/* JUDUL NASKAH & VARIANT BADGE */}
            <div className="text-center font-sans mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                {paket.judul_ujian}
              </h3>
              <div className="inline-block bg-slate-900 text-white font-bold text-xs uppercase px-3 py-0.5 rounded mt-1">
                PAKET {varian} {paket.status_paket === 'TERKUNCI' && '• RESMI TERKUNCI'}
              </div>
            </div>

            {/* TABEL IDENTITAS PELAKSANAAN UJIAN */}
            <div className="border border-slate-800 rounded mb-5 text-xs font-sans">
              <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-y md:divide-y-0 divide-slate-300">
                <div className="p-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Jenjang & Kelas</span>
                  <span className="font-semibold text-slate-900">
                    <span className="bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded text-[10px] font-bold mr-1">
                      {mapel.jenjang_sekolah || 'SEKOLAH'}
                    </span>
                    {mapel.tingkat_kelas}
                  </span>
                </div>
                <div className="p-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Mata Pelajaran</span>
                  <span className="font-semibold text-slate-900">{mapel.nama_mapel}</span>
                </div>
                <div className="p-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Fase Kurikulum</span>
                  <span className="font-semibold text-slate-900">{mapel.fase_kurikulum}</span>
                </div>
                <div className="p-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Alokasi Waktu</span>
                  <span className="font-semibold text-slate-900">{paket.durasi_menit} Menit</span>
                </div>
                <div className="p-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Bentuk Naskah</span>
                  <span className="font-semibold text-slate-900">
                    {soal_pg.length} PG & {soal_esai.length} Esai
                  </span>
                </div>
              </div>
            </div>

            {/* 1. VIEW MODE: NASKAH SISWA */}
            {viewMode === 'NASKAH_SISWA' && (
              <>
                {/* PETUNJUK UMUM */}
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200 mb-6 text-xs font-sans">
                  <h5 className="font-bold text-slate-800 uppercase tracking-wide mb-1 text-[11px]">
                    PETUNJUK UMUM PENGERJAAN:
                  </h5>
                  <ol className="list-decimal list-inside space-y-0.5 text-slate-700 leading-normal">
                    {petunjuk_umum.map((p, idx) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ol>
                </div>

                {/* BAGIAN I: PILIHAN GANDA (2-KOLOM FORMAL) */}
                <div className="mb-8">
                  <div className="border-b-2 border-slate-900 pb-1 mb-4 flex items-center justify-between font-sans">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                      BAGIAN I: SOAL PILIHAN GANDA & AKM (Pilihlah Jawaban yang Paling Tepat)
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-600">
                      {soal_pg.length} Butir Soal
                    </span>
                  </div>

                  {/* 2-Column CSS Layout */}
                  <div className="columns-1 md:columns-2 gap-8 text-[13px] leading-relaxed break-inside-avoid">
                    {soal_pg.map((item) => (
                      <div
                        key={item.id}
                        className="break-inside-avoid mb-6 border-b border-slate-200 pb-4 last:border-b-0"
                      >
                        {/* Stimulus Context Box if present */}
                        {item.butir_soal.stimulus_konten && (
                          <div className="bg-slate-50 p-2.5 rounded border border-slate-200 mb-2 text-xs italic font-serif leading-snug">
                            <span className="font-sans font-bold not-italic text-[10px] text-slate-500 uppercase block mb-0.5">
                              Stimulus Bacaan / Konteks:
                            </span>
                            <MathRenderer content={item.butir_soal.stimulus_konten} />
                          </div>
                        )}

                        {/* Stimulus Diagram Image if present */}
                        {item.butir_soal.stimulus_gambar_url && (
                          <div className="my-2 text-center">
                            <img
                              src={item.butir_soal.stimulus_gambar_url}
                              alt="Diagram stimulus"
                              className="max-h-36 mx-auto rounded border border-slate-300"
                            />
                          </div>
                        )}

                        {/* Pertanyaan */}
                        <div className="flex items-start gap-1.5 font-medium text-slate-900">
                          <span className="font-bold min-w-[20px]">{item.nomor_urut}.</span>
                          <div className="flex-1">
                            <MathRenderer content={item.butir_soal.pertanyaan_teks} />
                          </div>
                        </div>

                        {/* Opsi Jawaban */}
                        {item.butir_soal.opsi_jawaban_json && item.butir_soal.opsi_jawaban_json.length > 0 && (
                          <div className="mt-2.5 ml-5 space-y-1.5 font-sans text-xs">
                            {item.butir_soal.opsi_jawaban_json.map((opt) => (
                              <div key={opt.id} className="flex items-start gap-2">
                                <span className="font-bold text-slate-900 w-4">{opt.label}.</span>
                                <div className="flex-1 text-slate-800">
                                  <MathRenderer content={opt.teks} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* BAGIAN II: SOAL ESAI / URAIAN */}
                {soal_esai.length > 0 && (
                  <div className="mt-6 pt-4 border-t-2 border-slate-900">
                    <div className="border-b border-slate-300 pb-1 mb-4 flex items-center justify-between font-sans">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        BAGIAN II: SOAL ESAI & URAIAN HOTS (Jawablah dengan Lengkap dan Rinci)
                      </h4>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {soal_esai.length} Butir Soal
                      </span>
                    </div>

                    <div className="space-y-6 text-[13px] leading-relaxed">
                      {soal_esai.map((item) => (
                        <div key={item.id} className="break-inside-avoid">
                          {item.butir_soal.stimulus_konten && (
                            <div className="bg-slate-50 p-3 rounded border border-slate-200 mb-2 text-xs italic font-serif leading-snug">
                              <span className="font-sans font-bold not-italic text-[10px] text-slate-500 uppercase block mb-0.5">
                                Stimulus Pemantik:
                              </span>
                              <MathRenderer content={item.butir_soal.stimulus_konten} />
                            </div>
                          )}

                          <div className="flex items-start gap-2 font-medium text-slate-900">
                            <span className="font-bold min-w-[20px]">{item.nomor_urut}.</span>
                            <div className="flex-1">
                              <MathRenderer content={item.butir_soal.pertanyaan_teks} />
                            </div>
                          </div>

                          {/* Empty lines for student written answer in paper mode */}
                          <div className="mt-4 border-2 border-dashed border-slate-200 rounded p-6 bg-slate-50/50 print:bg-white text-center text-xs text-slate-400 font-sans">
                            (Ruang Lembar Jawaban Uraian Siswa)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 2. VIEW MODE: KUNCI JAWABAN & RUBRIK PENILAIAN */}
            {viewMode === 'KUNCI_RUBRIK' && (
              <div className="font-sans">
                <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded mb-4 text-xs">
                  <strong>DOKUMEN RAHASIA PANITIA:</strong> Lembar Kunci Jawaban Resmi & Rubrik Penilaian untuk Korektor Ujian Paket {varian}.
                </div>

                {/* Kunci Jawaban PG */}
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                  Kunci Jawaban Pilihan Ganda & AKM
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 text-xs">
                  {soal_pg.map((item) => {
                    const rawKey = item.butir_soal.kunci_jawaban_terenkripsi;
                    let displayKey = '-';
                    if (typeof rawKey === 'string') {
                      const matchedOpt = item.butir_soal.opsi_jawaban_json.find((o) => o.id === rawKey);
                      displayKey = matchedOpt ? `${matchedOpt.label} (${matchedOpt.teks})` : rawKey;
                    } else if (Array.isArray(rawKey)) {
                      displayKey = rawKey
                        .map((k) => item.butir_soal.opsi_jawaban_json.find((o) => o.id === k)?.label || k)
                        .join(', ');
                    }

                    return (
                      <div key={item.id} className="p-2.5 rounded bg-slate-50 border border-slate-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-800">No. {item.nomor_urut}</span>
                          <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono">
                            {item.butir_soal.level_kognitif} • {item.butir_soal.bobot_nilai} Poin
                          </span>
                        </div>
                        <div className="font-bold text-emerald-700">
                          <MathRenderer content={displayKey} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rubrik Penilaian Esai */}
                {soal_esai.length > 0 && (
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                      Pedoman Penskoran & Rubrik Penilaian Esai
                    </h4>
                    <div className="space-y-4 text-xs">
                      {soal_esai.map((item) => (
                        <div key={item.id} className="p-3.5 rounded bg-slate-50 border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-800">Soal No. {item.nomor_urut} (Uraian)</span>
                            <span className="font-semibold text-emerald-700">Bobot Maksimal: {item.butir_soal.bobot_nilai} Poin</span>
                          </div>
                          <div className="mb-2 text-slate-700">
                            <strong>Pertanyaan:</strong> {item.butir_soal.pertanyaan_teks}
                          </div>
                          <div className="bg-white p-2.5 rounded border border-slate-200 text-slate-800">
                            <strong className="block text-emerald-800 mb-1">Rubrik / Kriteria Penilaian:</strong>
                            <MathRenderer content={item.butir_soal.rubrik_penilaian_esai || item.butir_soal.kunci_jawaban_terenkripsi as string} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. VIEW MODE: KARTU SOAL & KISI-KISI */}
            {viewMode === 'KARTU_KISI' && (
              <div className="font-sans text-xs">
                <h4 className="font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3">
                  Matriks Distribusi Kisi-Kisi & Analisis Tujuan Pembelajaran (TP) Berbasis Kurikulum Merdeka
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-slate-300 text-[11px]">
                    <thead className="bg-slate-100 text-slate-800 font-bold">
                      <tr>
                        <th className="border border-slate-300 p-2 text-center w-10">No.</th>
                        <th className="border border-slate-300 p-2 text-left w-24">Kode TP</th>
                        <th className="border border-slate-300 p-2 text-left">Tujuan Pembelajaran (TP) & Lingkup Materi</th>
                        <th className="border border-slate-300 p-2 text-left">Indikator Soal</th>
                        <th className="border border-slate-300 p-2 text-center w-20">Bentuk</th>
                        <th className="border border-slate-300 p-2 text-center w-16">Level</th>
                        <th className="border border-slate-300 p-2 text-center w-14">Bobot</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...soal_pg, ...soal_esai].map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="border border-slate-300 p-2 text-center font-bold">{item.nomor_urut}</td>
                          <td className="border border-slate-300 p-2 font-mono font-bold text-indigo-700">
                            {item.butir_soal.kode_tp || '-'}
                          </td>
                          <td className="border border-slate-300 p-2">
                            <div className="font-medium text-slate-900">
                              {item.butir_soal.tujuan_pembelajaran || item.butir_soal.capaian_pembelajaran || '-'}
                            </div>
                            {item.butir_soal.lingkup_materi && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Lingkup Materi: <span className="font-semibold text-slate-700">{item.butir_soal.lingkup_materi}</span>
                              </div>
                            )}
                          </td>
                          <td className="border border-slate-300 p-2 text-slate-700 italic">
                            {item.butir_soal.indikator_soal || '-'}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-medium">
                            {item.butir_soal.jenis_soal.replace('_', ' ')}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold text-indigo-700">
                            {item.butir_soal.level_kognitif}
                          </td>
                          <td className="border border-slate-300 p-2 text-center font-bold">
                            {item.butir_soal.bobot_nilai}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LEMBAR PENGESAHAN PANITIA UJIAN (FOOTER) */}
            <div className="mt-12 pt-6 border-t border-slate-300 font-sans text-xs text-center grid grid-cols-2 gap-8 break-inside-avoid">
              <div>
                <p className="text-slate-500 mb-12">Mengetahui,<br />Kepala Sekolah</p>
                <p className="font-bold text-slate-900 uppercase underline">Dr. Hj. Nurhidayati, M.Pd.</p>
                <p className="text-[11px] text-slate-600">NIP. 19740512 199903 2 004</p>
              </div>
              <div>
                <p className="text-slate-500 mb-12">Ketua Panitia Ujian /<br />Koordinator Kurikulum</p>
                <p className="font-bold text-slate-900 uppercase underline">Dr. H. Mulyadi, M.Pd.</p>
                <p className="text-[11px] text-slate-600">NIP. 19800315 200501 1 008</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
