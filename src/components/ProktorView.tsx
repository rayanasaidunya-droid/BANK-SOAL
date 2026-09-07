import React, { useState, useEffect } from 'react';
import { ProctorTokenInfo, SesiUjianSiswaCBT } from '../types';
import { apiService } from '../services/api';
import {
  Users,
  KeyRound,
  RefreshCw,
  Clock,
  ShieldAlert,
  Unlock,
  RotateCcw,
  CheckCircle,
  Copy,
  AlertTriangle,
  Monitor,
  PlusCircle,
  Check,
  Eye,
} from 'lucide-react';

export const ProktorView: React.FC = () => {
  const [tokenInfo, setTokenInfo] = useState<ProctorTokenInfo | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [selectedViolationSesi, setSelectedViolationSesi] = useState<any | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Token Form Modal
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [ruangLab, setRuangLab] = useState('Lab Komputer 01 (Lantai 2)');
  const [durasiJam, setDurasiJam] = useState(2);

  const loadProctorData = async () => {
    try {
      setLoading(true);
      const [tok, sess] = await Promise.all([
        apiService.getActiveToken(),
        apiService.getProctorSessions(),
      ]);
      setTokenInfo(tok);
      setSessions(sess);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Gagal memuat data proktor' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProctorData();
    // Auto polling every 8 seconds for live invigilator monitoring
    const interval = setInterval(loadProctorData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyToken = () => {
    if (tokenInfo?.token) {
      navigator.clipboard.writeText(tokenInfo.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2500);
    }
  };

  const handleReleaseNewToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await apiService.releaseToken({
        paket_ujian_id: 'pkt-mat-2026',
        ruang_lab: ruangLab,
        masa_berlaku_jam: durasiJam,
      });
      setTokenInfo(res.data);
      setFeedbackMsg({ type: 'success', text: res.message });
      setIsReleaseModalOpen(false);
      await loadProctorData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Gagal menerbitkan token' });
    } finally {
      setLoading(false);
    }
  };

  const handleProctorAction = async (
    sesiId: string,
    action: 'reset-login' | 'unlock-violation' | 'force-submit' | 'extend-time'
  ) => {
    try {
      setLoading(true);
      const res = await apiService.proctorAction(sesiId, action, {
        proktor_nama: 'Indra Hermawan, S.Kom. (Proktor Lab 01)',
        menit: 15,
      });
      setFeedbackMsg({ type: 'success', text: res.message });
      await loadProctorData();
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Aksi gagal dijalankan' });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Metrics
  const totalStudents = sessions.length;
  const workingCount = sessions.filter((s) => s.status_pengerjaan === 'SEDANG_MENGERJAKAN').length;
  const lockedCount = sessions.filter((s) => s.status_pengerjaan === 'TERKUNCI_PELANGGARAN').length;
  const finishedCount = sessions.filter((s) => s.status_pengerjaan === 'SELESAI').length;

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold shadow-xs ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Header Banner with Bold Typography */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-700 mb-1">
            Ruang Pengawasan CBT • {tokenInfo?.ruang_lab || 'Lab Komputer 01'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1A1C1E]">
            Dasbor Pengawas & Proktor Asesmen
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Monitoring Integritas CBT, Deteksi Switch-Tab (BL-EXAM-003) & Manajemen Token Dinamis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadProctorData()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Segarkan Status</span>
          </button>

          <button
            onClick={() => setIsReleaseModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>Rilis Token Baru</span>
          </button>
        </div>
      </div>

      {/* Dynamic Token Card & Live KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Token Card */}
        <div className="md:col-span-2 bg-[#1A1C1E] text-white rounded-3xl p-6 shadow-md border border-slate-800 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] text-indigo-300 font-black block">
                Token Aktif Ruang Ujian (6 Karakter Dinamis)
              </span>
              <p className="text-sm font-bold text-slate-200 mt-1">{tokenInfo?.judul_ujian || 'Asesmen CBT Sekolah'}</p>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-xl">
              Aktif
            </span>
          </div>

          <div className="my-5 flex items-center justify-between">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-emerald-400">
                {tokenInfo?.token || '------'}
              </span>
              <button
                onClick={handleCopyToken}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition backdrop-blur-sm"
                title="Salin token ke papan klip"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-400 pt-4 border-t border-white/10">
            <span>Ruang: <strong className="text-white font-bold">{tokenInfo?.ruang_lab || 'Lab Komputer'}</strong></span>
            <span>
              Berlaku s.d:{' '}
              <strong className="text-emerald-300 font-bold">
                {tokenInfo?.berlaku_sampai
                  ? new Date(tokenInfo.berlaku_sampai).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-'}
              </strong>
            </span>
          </div>
        </div>

        {/* KPI Counter: Sedang Mengerjakan */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-widest">
            <span>Sedang Aktif</span>
            <Monitor className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="my-2">
            <p className="text-4xl font-black mt-2 tracking-tight text-[#1A1C1E]">{workingCount}</p>
            <span className="text-xs text-slate-500 font-semibold">dari {totalStudents} peserta ujian</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all"
              style={{ width: `${totalStudents ? (workingCount / totalStudents) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* KPI Counter: Terkunci Pelanggaran (BL-EXAM-003) */}
        <div className="bg-white p-6 rounded-3xl border border-red-100 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-red-600 text-xs font-bold uppercase tracking-widest">
            <span>Terkunci Switch-Tab</span>
            <ShieldAlert className="w-4 h-4 text-red-600" />
          </div>
          <div className="my-2">
            <p className="text-4xl font-black mt-2 tracking-tight text-red-600">{lockedCount}</p>
            <span className="text-xs text-red-700 font-bold">memerlukan reset proktor</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            {lockedCount > 0
              ? 'Siswa terdeteksi switch tab / keluar layar 3x (BL-EXAM-003)'
              : 'Seluruh peserta tertib dalam aplikasi ujian'}
          </p>
        </div>
      </div>

      {/* Live Student Roster Table */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-lg text-[#1A1C1E]">
              Daftar Peserta di Ruang Ujian ({sessions.length})
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Sinkronisasi Otomatis Tiap 8 Detik
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">No. Peserta</th>
                <th className="px-5 py-3.5">Nama Siswa & Kelas</th>
                <th className="px-5 py-3.5 text-center">Varian</th>
                <th className="px-5 py-3.5">Status Pengerjaan</th>
                <th className="px-5 py-3.5">Progres Jawaban</th>
                <th className="px-5 py-3.5">Sisa Waktu</th>
                <th className="px-5 py-3.5 text-center">Pelanggaran</th>
                <th className="px-5 py-3.5 text-right">Aksi Pengawas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {sessions.map((s) => {
                const isLocked = s.status_pengerjaan === 'TERKUNCI_PELANGGARAN';
                const isDone = s.status_pengerjaan === 'SELESAI';
                const isWorking = s.status_pengerjaan === 'SEDANG_MENGERJAKAN';

                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-750 transition ${
                      isLocked ? 'bg-red-50/50 dark:bg-red-950/20' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {s.nomor_peserta}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {s.nama_siswa}
                      </div>
                      <div className="text-[11px] text-slate-500">{s.kelas} • IP: {s.ip_address || '-'}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-400">
                        Paket {s.kode_varian_paket}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          isLocked
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : isDone
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isWorking
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isLocked && <ShieldAlert className="w-3 h-3" />}
                        {isDone && <CheckCircle className="w-3 h-3" />}
                        {s.status_pengerjaan.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${s.persentase || 0}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {s.progres_jawab}/{s.total_soal}
                        </span>
                        {s.jumlah_ragu > 0 && (
                          <span className="text-[10px] text-amber-600 font-bold" title="Ragu-ragu">
                            ({s.jumlah_ragu} ragu)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {isDone ? '-' : formatTime(s.sisa_detik)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.jumlah_pelanggaran_tab > 0 ? (
                        <button
                          onClick={() => setSelectedViolationSesi(s)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[11px] bg-red-100 text-red-700 hover:bg-red-200 transition"
                          title="Klik untuk melihat riwayat log pelanggaran"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>{s.jumlah_pelanggaran_tab}x</span>
                        </button>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {isLocked && (
                          <button
                            onClick={() => handleProctorAction(s.id, 'unlock-violation')}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-xs transition"
                            title="Buka blokir sesi siswa agar dapat melanjutkan ujian"
                          >
                            <Unlock className="w-3 h-3" />
                            <span>Buka Kunci</span>
                          </button>
                        )}

                        {!isDone && (
                          <>
                            <button
                              onClick={() => handleProctorAction(s.id, 'reset-login')}
                              className="px-2 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded text-[11px] font-medium"
                              title="Reset login jika PC siswa mati / ganti perangkat"
                            >
                              Reset PC
                            </button>
                            <button
                              onClick={() => handleProctorAction(s.id, 'extend-time')}
                              className="px-2 py-1 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded text-[11px] font-medium"
                              title="Tambah waktu +15 menit"
                            >
                              +15m
                            </button>
                            <button
                              onClick={() => handleProctorAction(s.id, 'force-submit')}
                              className="px-2 py-1 bg-slate-800 hover:bg-red-600 text-white rounded text-[11px] font-medium transition"
                              title="Paksa pengumpulan ujian siswa"
                            >
                              Paksa Selesai
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RELEASE NEW TOKEN MODAL */}
      {/* ------------------------------------------------------------- */}
      {isReleaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 text-xs">
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              <span>Rilis Token Ujian CBT Baru</span>
            </h3>
            <p className="text-slate-500 mb-4">
              Menerbitkan token 6 huruf dinamis untuk mengizinkan login peserta di ruang lab yang ditugaskan.
            </p>

            <form onSubmit={handleReleaseNewToken} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Ruang / Laboratorium:
                </label>
                <input
                  type="text"
                  value={ruangLab}
                  onChange={(e) => setRuangLab(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Masa Berlaku Token:
                </label>
                <select
                  value={durasiJam}
                  onChange={(e) => setDurasiJam(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-medium"
                >
                  <option value={1}>1 Jam</option>
                  <option value={2}>2 Jam (Standar Sesi)</option>
                  <option value={3}>3 Jam</option>
                  <option value={4}>4 Jam</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsReleaseModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg font-semibold text-slate-700 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition"
                >
                  Terbitkan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIOLATION LOG MODAL (BL-EXAM-003) */}
      {/* ------------------------------------------------------------- */}
      {selectedViolationSesi && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5 text-red-600">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Log Pelanggaran Anti-Cheat (BL-EXAM-003)</span>
                </h3>
                <p className="text-slate-500 text-[11px]">
                  {selectedViolationSesi.nama_siswa} ({selectedViolationSesi.nomor_peserta})
                </p>
              </div>
              <button
                onClick={() => setSelectedViolationSesi(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 my-4 max-h-60 overflow-y-auto">
              {selectedViolationSesi.riwayat_pelanggaran?.length > 0 ? (
                selectedViolationSesi.riwayat_pelanggaran.map((v: any, i: number) => (
                  <div
                    key={i}
                    className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg"
                  >
                    <div className="flex justify-between items-center text-[10px] text-red-700 dark:text-red-300 font-bold mb-1">
                      <span>Pelanggaran #{i + 1} • {v.jenis}</span>
                      <span>{new Date(v.timestamp).toLocaleTimeString('id-ID')}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                      {v.detail}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">Tidak ada riwayat detail tercatat.</p>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  handleProctorAction(selectedViolationSesi.id, 'unlock-violation');
                  setSelectedViolationSesi(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
              >
                Buka Kunci Pelanggaran
              </button>
              <button
                onClick={() => setSelectedViolationSesi(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
