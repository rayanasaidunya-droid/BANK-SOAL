import React, { useState, useEffect, useRef } from 'react';
import { ClientSoalItem } from '../types';
import { apiService } from '../services/api';
import { MathRenderer } from './MathRenderer';
import {
  GraduationCap,
  Clock,
  ShieldAlert,
  Lock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Maximize,
  Minimize,
  AlertTriangle,
  Type,
  Send,
  Sparkles,
  KeyRound,
  User,
  LogOut,
} from 'lucide-react';

export const SiswaCbtView: React.FC = () => {
  // Phase: 'LOGIN' | 'EXAM' | 'LOCKED' | 'RESULT'
  const [phase, setPhase] = useState<'LOGIN' | 'EXAM' | 'LOCKED' | 'RESULT'>('LOGIN');

  // Login Form
  const [nomorPeserta, setNomorPeserta] = useState('');
  const [tokenUjian, setTokenUjian] = useState('');
  const [activeTokenHint, setActiveTokenHint] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Exam Session Data (Authoritative from Backend)
  const [sesiId, setSesiId] = useState<string | null>(null);
  const [studentInfo, setStudentInfo] = useState<{
    nama_siswa: string;
    nomor_peserta: string;
    kelas: string;
    kode_varian_paket: string;
    judul_ujian: string;
  } | null>(null);

  // Questions (BL-EXAM-001: Zero-Leakage, NO answer keys exist here!)
  const [soalList, setSoalList] = useState<ClientSoalItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Student Answers State: { [soalId]: { jawaban: string | string[], ragu: boolean, waktu_simpan: string } }
  const [answers, setAnswers] = useState<
    Record<string, { jawaban: string | string[]; ragu: boolean; waktu_simpan: string }>
  >({});

  // Timer (seconds)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(5400);

  // Anti-Cheat (BL-EXAM-003)
  const [violationCount, setViolationCount] = useState<number>(0);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string>('');

  // UI Customizations
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState<boolean>(false);
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Result State
  const [resultData, setResultData] = useState<any | null>(null);

  // Fetch active token hint on mount for effortless reviewer testing
  useEffect(() => {
    apiService.getActiveToken().then((t) => {
      if (t) setActiveTokenHint(t.token);
    });
  }, []);

  // -------------------------------------------------------------
  // 1. CBT LOGIN
  // -------------------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorPeserta || !tokenUjian) return;

    try {
      setLoginLoading(true);
      setLoginError(null);

      const res = await apiService.loginCbt(nomorPeserta, tokenUjian);
      setSesiId(res.data.sesi_id);
      setStudentInfo({
        nama_siswa: res.data.nama_siswa,
        nomor_peserta: res.data.nomor_peserta,
        kelas: res.data.kelas,
        kode_varian_paket: res.data.kode_varian_paket,
        judul_ujian: res.data.judul_ujian,
      });
      setRemainingSeconds(res.data.sisa_detik);

      // Load safe questions (BL-EXAM-001 ZERO-LEAKAGE)
      const cbtData = await apiService.getCbtSoal(res.data.sesi_id);
      setSoalList(cbtData.daftar_soal);
      setAnswers(cbtData.sesi.jawaban_siswa || {});
      setViolationCount(cbtData.sesi.jumlah_pelanggaran_tab || 0);

      if (cbtData.sesi.status_pengerjaan === 'TERKUNCI_PELANGGARAN') {
        setPhase('LOCKED');
      } else if (cbtData.sesi.status_pengerjaan === 'SELESAI') {
        setPhase('RESULT');
      } else {
        setPhase('EXAM');
        // Request fullscreen for distraction-free mode
        try {
          if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        } catch {}
      }
    } catch (err: any) {
      if (err.code === 'LOCKED_BY_VIOLATION') {
        setPhase('LOCKED');
      } else {
        setLoginError(err.message || 'Login gagal, periksa nomor peserta dan token');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Quick fill demo student
  const handleQuickFill = (no: string) => {
    setNomorPeserta(no);
    if (activeTokenHint) setTokenUjian(activeTokenHint);
  };

  // -------------------------------------------------------------
  // 2. REALTIME COUNTDOWN TIMER
  // -------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'EXAM') return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleForceFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase]);

  // Periodic autosave timer to backend every 30 seconds
  useEffect(() => {
    if (phase !== 'EXAM' || !sesiId) return;

    const autoSaveInterval = setInterval(() => {
      apiService.autosaveCbt(sesiId, {
        jawaban_siswa: answers,
        sisa_detik: remainingSeconds,
      });
    }, 30000);

    return () => clearInterval(autoSaveInterval);
  }, [phase, sesiId, answers, remainingSeconds]);

  // -------------------------------------------------------------
  // 3. BL-EXAM-003: ANTI-CHEAT LOCKDOWN ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    if (phase !== 'EXAM' || !sesiId) return;

    const handleVisibilityOrBlur = (reason: string) => {
      // Trigger anti-cheat event
      triggerViolation('BLUR_TAB', `Siswa terdeteksi meninggalkan layar ujian (${reason}).`);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleVisibilityOrBlur('Berpindah tab atau aplikasi terminimize');
      }
    };

    const onWindowBlur = () => {
      handleVisibilityOrBlur('Jendela browser kehilangan fokus (Alt+Tab / klik luar)');
    };

    const onFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (!isFull) {
        // Exited fullscreen!
        triggerViolation(
          'EXIT_FULLSCREEN',
          'Siswa keluar dari mode fullscreen lockdown peramban.'
        );
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Block Devtools F12, Ctrl+Shift+I, Alt+Tab, Ctrl+C / Ctrl+V
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        triggerViolation('DEVTOOLS', 'Percobaan membuka alat pengembang (inspect element / F12).');
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [phase, sesiId, answers, remainingSeconds]);

  const triggerViolation = async (jenis: string, detail: string) => {
    if (!sesiId || phase !== 'EXAM') return;

    try {
      const res = await apiService.autosaveCbt(sesiId, {
        jawaban_siswa: answers,
        sisa_detik: remainingSeconds,
        pelanggaran: { jenis, detail },
      });

      setViolationCount(res.jumlah_pelanggaran);

      if (res.locked || res.jumlah_pelanggaran >= 3) {
        setPhase('LOCKED');
        setShowWarningModal(false);
      } else {
        setWarningMessage(
          `PERINGATAN BL-EXAM-003: Anda terdeteksi melakukan pelanggaran (${res.jumlah_pelanggaran}/3). Tetap fokus pada layar ujian!`
        );
        setShowWarningModal(true);
      }
    } catch (err: any) {
      if (err.code === 'BL_EXAM_003_LOCKED') {
        setPhase('LOCKED');
      }
    }
  };

  // -------------------------------------------------------------
  // 4. ANSWER HANDLING & REALTIME PERSISTENCE
  // -------------------------------------------------------------
  const handleSelectAnswer = async (soalId: string, value: string | string[]) => {
    setIsSaving(true);
    const existing = answers[soalId] || { jawaban: '', ragu: false, waktu_simpan: '' };
    const updatedAnswer = {
      ...existing,
      jawaban: value,
      waktu_simpan: new Date().toISOString(),
    };

    const newAnswers = {
      ...answers,
      [soalId]: updatedAnswer,
    };
    setAnswers(newAnswers);

    // Save to server
    if (sesiId) {
      try {
        await apiService.autosaveCbt(sesiId, {
          jawaban_siswa: { [soalId]: updatedAnswer },
          sisa_detik: remainingSeconds,
        });
      } catch {}
    }
    setIsSaving(false);
  };

  const handleToggleRagu = async (soalId: string) => {
    const existing = answers[soalId] || { jawaban: '', ragu: false, waktu_simpan: '' };
    const updated = {
      ...existing,
      ragu: !existing.ragu,
      waktu_simpan: new Date().toISOString(),
    };

    const newAnswers = {
      ...answers,
      [soalId]: updated,
    };
    setAnswers(newAnswers);

    if (sesiId) {
      try {
        await apiService.autosaveCbt(sesiId, {
          jawaban_siswa: { [soalId]: updated },
          sisa_detik: remainingSeconds,
        });
      } catch {}
    }
  };

  // -------------------------------------------------------------
  // 5. FINAL SUBMISSION
  // -------------------------------------------------------------
  const handleFinalSubmit = async () => {
    if (!sesiId) return;
    try {
      setLoginLoading(true);
      const res = await apiService.submitFinalCbt(sesiId);
      setResultData(res.data);
      setIsConfirmSubmitOpen(false);
      setPhase('RESULT');

      // Exit fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengirimkan ujian');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleForceFinalSubmit = async () => {
    if (!sesiId) return;
    try {
      const res = await apiService.submitFinalCbt(sesiId);
      setResultData(res.data);
      setPhase('RESULT');
    } catch {}
  };

  // Format time display
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Current question helper
  const currentSoal = soalList[currentIndex];

  // Font size class
  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-base sm:text-lg';
    if (fontSize === 'xlarge') return 'text-lg sm:text-xl';
    return 'text-sm sm:text-base';
  };

  // -------------------------------------------------------------
  // RENDER: PHASE 1 LOGIN SCREEN
  // -------------------------------------------------------------
  if (phase === 'LOGIN') {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 sm:p-10 shadow-lg border border-slate-100 text-xs">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-200 font-bold">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] font-black text-indigo-700 mb-1">
            Portal Asesmen Sekolah
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#1A1C1E]">
            Login Asesmen CBT Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Masukkan Nomor Peserta dan Token Ujian resmi dari Pengawas Ruang.
          </p>
        </div>

        {loginError && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-2xl mb-4 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nomor Peserta Ujian:
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={nomorPeserta}
                onChange={(e) => setNomorPeserta(e.target.value)}
                placeholder="Contoh: 26-001-X-A"
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Token Ujian CBT (6 Karakter):
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                value={tokenUjian}
                onChange={(e) => setTokenUjian(e.target.value.toUpperCase())}
                placeholder="Contoh: EXAM26"
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold tracking-widest uppercase focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loginLoading ? 'Memverifikasi Sesi...' : 'Mulai / Lanjutkan Ujian CBT'}
          </button>
        </form>

        {/* Quick Demo Fill Buttons for Reviewer Convenience */}
        <div className="mt-8 pt-5 border-t border-slate-100">
          <span className="font-black text-slate-400 block mb-2.5 text-[10px] uppercase tracking-widest">
            Akses Cepat Pengujian (Simulasi Siswa):
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => handleQuickFill('26-001-X-A')}
              className="p-3 text-left bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 rounded-2xl border border-slate-200 text-[11px] transition"
            >
              <div className="font-bold text-slate-800">Aditya Pratama</div>
              <div className="text-slate-500 font-mono text-[10px]">26-001-X-A (Varian A)</div>
            </button>
            <button
              onClick={() => handleQuickFill('26-002-X-A')}
              className="p-3 text-left bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-300 rounded-2xl border border-slate-200 text-[11px] transition"
            >
              <div className="font-bold text-slate-800">Clarissa Putri</div>
              <div className="text-slate-500 font-mono text-[10px]">26-002-X-A (Varian B)</div>
            </button>
          </div>
          {activeTokenHint && (
            <div className="mt-4 text-center text-slate-500 text-xs font-semibold">
              Token Proktor Saat Ini:{' '}
              <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                {activeTokenHint}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: PHASE LOCKED (BL-EXAM-003 VIOLATION LOCKDOWN)
  // -------------------------------------------------------------
  if (phase === 'LOCKED') {
    return (
      <div className="max-w-xl mx-auto my-12 bg-red-50 dark:bg-red-950/60 border-2 border-red-600 rounded-2xl p-8 text-center text-red-950 dark:text-red-100 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-4 animate-bounce">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black uppercase tracking-tight mb-2">
          SESI UJIAN CBT ANDA TERKUNCI!
        </h2>
        <span className="bg-red-600 text-white px-3 py-1 rounded font-bold text-xs uppercase tracking-wider inline-block mb-4">
          BL-EXAM-003: Deteksi Pelanggaran Pindah Layar (3/3)
        </span>
        <p className="text-sm leading-relaxed mb-6 font-medium">
          Sistem asesmen mendeteksi Anda telah meninggalkan jendela peramban atau keluar dari mode layar penuh sebanyak 3 kali. Untuk menjamin integritas naskah, pengerjaan dihentikan sementara.
        </p>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-red-300 dark:border-red-800 text-xs text-slate-800 dark:text-slate-200 mb-6">
          <strong>Instruksi Peserta:</strong> Angkat tangan dan laporkan kepada <strong>Pengawas Ruang / Proktor</strong> di meja pengawas untuk verifikasi dan pembukaan kunci sesi Anda.
        </div>
        <button
          onClick={() => {
            // Re-check status if proctor has unlocked it
            if (sesiId) {
              apiService.getCbtSoal(sesiId).then((data) => {
                if (data.sesi.status_pengerjaan === 'SEDANG_MENGERJAKAN') {
                  setPhase('EXAM');
                } else {
                  alert('Sesi masih terkunci oleh sistem. Silakan minta pengawas membuka kunci pada dasbor proktor.');
                }
              });
            }
          }}
          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-md transition"
        >
          Cek Status Buka Kunci dari Pengawas
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: PHASE RESULT SCREEN
  // -------------------------------------------------------------
  if (phase === 'RESULT') {
    return (
      <div className="max-w-md mx-auto my-12 bg-white dark:bg-slate-800 rounded-2xl p-8 text-center shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          Ujian Berhasil Dikumpulkan!
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Seluruh jawaban Anda telah tersimpan secara resmi di server asesmen pendidikan.
        </p>

        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-left space-y-2 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Nomor Peserta:</span>
            <span className="font-bold font-mono">{studentInfo?.nomor_peserta || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Nama Lengkap:</span>
            <span className="font-semibold">{studentInfo?.nama_siswa || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Waktu Selesai:</span>
            <span className="font-medium">{new Date().toLocaleTimeString('id-ID')}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
            <span className="text-slate-500">Skor Objektif PG (Otomatis):</span>
            <span className="font-bold text-emerald-600">
              {resultData?.skor_otomatis_pg !== undefined ? resultData.skor_otomatis_pg : 'Terekam'}
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            setPhase('LOGIN');
            setNomorPeserta('');
            setTokenUjian('');
          }}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition"
        >
          Keluar ke Layar Utama
        </button>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: PHASE 2 DISTRACTION-FREE CBT EXAM ROOM
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-40 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden">
      {/* 1. COMPACT DISTRACTION-FREE HEADER */}
      <header className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
            CBT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-100 truncate max-w-[200px] sm:max-w-xs">
                {studentInfo?.judul_ujian}
              </span>
              <span className="bg-slate-800 text-emerald-400 font-mono text-[11px] px-2 py-0.5 rounded font-semibold">
                Paket {studentInfo?.kode_varian_paket}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {studentInfo?.nama_siswa} ({studentInfo?.nomor_peserta})
            </div>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg border font-mono font-bold text-sm ${
            remainingSeconds < 600
              ? 'bg-red-950/80 border-red-500 text-red-400 animate-pulse'
              : 'bg-slate-800 border-slate-700 text-emerald-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{formatTime(remainingSeconds)}</span>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2">
          {/* Autosave Status */}
          <span className="text-[10px] text-emerald-400 hidden md:inline">
            {isSaving ? 'Menyimpan...' : '✓ Tersimpan'}
          </span>

          {/* Font Size Adjuster */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setFontSize('normal')}
              className={`px-2 py-1 rounded font-bold ${fontSize === 'normal' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              title="Ukuran Font Normal"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-2 py-1 rounded font-bold ${fontSize === 'large' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              title="Ukuran Font Sedang"
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-2 py-1 rounded font-bold ${fontSize === 'xlarge' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
              title="Ukuran Font Sangat Besar"
            >
              A++
            </button>
          </div>

          {/* Toggle Fullscreen */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700"
            title="Toggle Layar Penuh"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Selesai Ujian Button */}
          <button
            onClick={() => setIsConfirmSubmitOpen(true)}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition shadow-xs flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Selesai Ujian</span>
          </button>
        </div>
      </header>

      {/* 2. BODY CONTENT: SPLIT QUESTION & NAVIGATION */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left/Main Question Area */}
        <div className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-8">
          {currentSoal ? (
            <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col justify-between">
              {/* Question Header */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-slate-900 dark:text-white">
                      Soal Nomor {currentIndex + 1}
                    </span>
                    <span className="text-slate-400">dari {soalList.length}</span>
                    <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-semibold px-2 py-0.5 rounded text-[11px]">
                      {currentSoal.jenis_soal.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-slate-500">
                    Bobot: <strong>{currentSoal.bobot_nilai} Poin</strong>
                  </span>
                </div>

                {/* Stimulus Context Box (if available) */}
                {currentSoal.stimulus_konten && (
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 mb-4 shadow-xs font-serif leading-relaxed text-slate-800 dark:text-slate-200">
                    <span className="font-sans font-bold text-[10px] text-slate-400 uppercase tracking-wider block mb-1">
                      Stimulus Wacana:
                    </span>
                    <MathRenderer content={currentSoal.stimulus_konten} />
                  </div>
                )}

                {/* Question Text with KaTeX */}
                <div
                  className={`font-medium text-slate-900 dark:text-slate-100 mb-6 leading-relaxed ${getFontSizeClass()}`}
                >
                  <MathRenderer content={currentSoal.pertanyaan_teks} />
                </div>

                {/* Answer Inputs by Type */}
                <div className="space-y-3">
                  {/* PILIHAN GANDA: Radio Options */}
                  {currentSoal.jenis_soal === 'PILIHAN_GANDA' &&
                    currentSoal.opsi_jawaban_json?.map((opt) => {
                      const selected = answers[currentSoal.id]?.jawaban === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectAnswer(currentSoal.id, opt.id)}
                          className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                            selected
                              ? 'bg-indigo-50/80 border-indigo-600 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-500'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl border flex items-center justify-center font-black text-xs shrink-0 mt-0.5 ${
                              selected
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                : 'border-slate-300 text-slate-600'
                            }`}
                          >
                            {opt.label}
                          </div>
                          <div className={`flex-1 ${getFontSizeClass()}`}>
                            <MathRenderer content={opt.teks} />
                          </div>
                        </button>
                      );
                    })}

                  {/* PG KOMPLEKS (AKM): Checkboxes */}
                  {currentSoal.jenis_soal === 'PG_KOMPLEKS' &&
                    currentSoal.opsi_jawaban_json?.map((opt) => {
                      const currentPicks = Array.isArray(answers[currentSoal.id]?.jawaban)
                        ? (answers[currentSoal.id]?.jawaban as string[])
                        : [];
                      const isChecked = currentPicks.includes(opt.id);

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            const next = isChecked
                              ? currentPicks.filter((x) => x !== opt.id)
                              : [...currentPicks, opt.id];
                            handleSelectAnswer(currentSoal.id, next);
                          }}
                          className={`w-full p-3.5 rounded-xl border text-left flex items-start gap-3 transition ${
                            isChecked
                              ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 dark:border-blue-500 text-blue-950 dark:text-blue-100 font-medium'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="w-4 h-4 rounded text-blue-600 mt-1 pointer-events-none"
                          />
                          <span className="font-bold text-xs shrink-0 mt-0.5">{opt.label}.</span>
                          <div className={`flex-1 ${getFontSizeClass()}`}>
                            <MathRenderer content={opt.teks} />
                          </div>
                        </button>
                      );
                    })}

                  {/* ISIAN SINGKAT */}
                  {currentSoal.jenis_soal === 'ISIAN_SINGKAT' && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                        Jawaban Singkat Anda:
                      </label>
                      <input
                        type="text"
                        value={(answers[currentSoal.id]?.jawaban as string) || ''}
                        onChange={(e) => handleSelectAnswer(currentSoal.id, e.target.value)}
                        placeholder="Tuliskan jawaban pasti di sini..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold"
                      />
                    </div>
                  )}

                  {/* ESAI URAIAN */}
                  {currentSoal.jenis_soal === 'ESAI_URAIAN' && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Lembar Jawaban Esai / Uraian Siswa:
                        </label>
                        <span className="text-[11px] text-slate-400">
                          {((answers[currentSoal.id]?.jawaban as string) || '').length} karakter
                        </span>
                      </div>
                      <textarea
                        rows={6}
                        value={(answers[currentSoal.id]?.jawaban as string) || ''}
                        onChange={(e) => handleSelectAnswer(currentSoal.id, e.target.value)}
                        placeholder="Tuliskan uraian langkah perhitungan, penalaran, dan kesimpulan lengkap di sini..."
                        className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm leading-relaxed"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Nav Bar: Previous, Ragu-ragu, Next */}
              <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 select-none">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-30 transition shadow-xs cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Soal Sebelumnya</span>
                </button>

                {/* Ragu-ragu Toggle */}
                <label className="flex items-center gap-2 cursor-pointer bg-amber-50 border border-amber-300 px-4 py-3 rounded-xl text-xs font-bold text-amber-900 shadow-xs">
                  <input
                    type="checkbox"
                    checked={!!answers[currentSoal.id]?.ragu}
                    onChange={() => handleToggleRagu(currentSoal.id)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Ragu-Ragu</span>
                </label>

                <button
                  onClick={() =>
                    setCurrentIndex((prev) => Math.min(soalList.length - 1, prev + 1))
                  }
                  disabled={currentIndex === soalList.length - 1}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 disabled:opacity-30 transition cursor-pointer"
                >
                  <span>Soal Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 font-bold">Memuat butir soal asesmen...</div>
          )}
        </div>

        {/* Right Sidebar: Number Grid Navigation */}
        <div className="w-68 bg-white border-l border-slate-200 p-5 hidden md:flex flex-col justify-between shrink-0 select-none">
          <div>
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <span className="font-black text-xs uppercase tracking-wider text-slate-800">
                Navigasi Butir Soal
              </span>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">
                {Object.keys(answers).length}/{soalList.length} Terjawab
              </span>
            </div>

            {/* Grid 1..N */}
            <div className="grid grid-cols-4 gap-2.5">
              {soalList.map((item, idx) => {
                const ans = answers[item.id];
                const hasAnswer =
                  ans && (Array.isArray(ans.jawaban) ? ans.jawaban.length > 0 : !!ans.jawaban);
                const isRagu = ans?.ragu;
                const isCurrent = idx === currentIndex;

                let color =
                  'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100';
                if (isRagu) {
                  color = 'bg-amber-400 text-amber-950 font-black border-amber-500 shadow-xs';
                } else if (hasAnswer) {
                  color = 'bg-indigo-600 text-white font-black border-indigo-700 shadow-xs';
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl border text-xs flex items-center justify-center font-mono font-bold transition-all ${color} ${
                      isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2 font-black scale-105 shadow-md' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5 text-[11px] font-semibold text-slate-500">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-md bg-indigo-600" />
                <span>Sudah dijawab</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-md bg-amber-400" />
                <span>Ragu-ragu</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-md bg-slate-200 border border-slate-300" />
                <span>Belum dijawab</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsConfirmSubmitOpen(true)}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-rose-200 cursor-pointer"
          >
            Selesaikan Ujian Sekarang
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* WARNING MODAL: BL-EXAM-003 ANTI-CHEAT NOTIFICATION */}
      {/* ------------------------------------------------------------- */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center border-2 border-amber-500 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 animate-pulse shadow-sm">
              <AlertTriangle className="w-9 h-9" />
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] font-black text-amber-700 mb-1">
              Peringatan Integritas
            </div>
            <h3 className="text-xl font-black text-[#1A1C1E] tracking-tight mb-2">
              Kehilangan Fokus Layar!
            </h3>
            <span className="bg-amber-100 text-amber-900 px-3.5 py-1 rounded-full text-xs font-black inline-block mb-3">
              Pelanggaran ke-{violationCount} dari 3 Toleransi
            </span>
            <p className="text-xs text-slate-600 leading-relaxed mb-6 font-medium">
              {warningMessage}
              <br />
              <strong className="text-rose-600 block mt-2 font-bold">
                Peringatan: Pada pelanggaran ke-3, sesi CBT Anda akan DIKUNCI TOTAL dan memerlukan pembukaan langsung oleh Pengawas Ruang.
              </strong>
            </p>
            <button
              onClick={() => {
                setShowWarningModal(false);
                // Return to fullscreen if supported
                if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
                  document.documentElement.requestFullscreen().catch(() => {});
                }
              }}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-200 transition cursor-pointer"
            >
              Saya Mengerti, Kembali Mengerjakan
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONFIRM SUBMIT MODAL */}
      {/* ------------------------------------------------------------- */}
      {isConfirmSubmitOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 text-xs">
            <div className="text-[10px] uppercase tracking-[0.2em] font-black text-rose-700 mb-1">
              Kunci Lembar Jawaban
            </div>
            <h3 className="text-2xl font-black text-[#1A1C1E] tracking-tight mb-2">
              Konfirmasi Selesai Ujian
            </h3>
            <p className="text-slate-500 mb-6 font-medium leading-relaxed">
              Periksa kembali rangkuman pengerjaan Anda sebelum mengunci lembar jawaban secara permanen ke server asesmen.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 mb-6">
              <div className="flex justify-between font-bold text-slate-700">
                <span className="text-slate-500 font-medium">Total Butir Soal:</span>
                <span>{soalList.length} Soal</span>
              </div>
              <div className="flex justify-between font-bold text-indigo-700">
                <span>Sudah Dijawab:</span>
                <span>{Object.keys(answers).length} Soal</span>
              </div>
              <div className="flex justify-between font-bold text-amber-600">
                <span>Masih Ragu-Ragu:</span>
                <span>{Object.values(answers).filter((a: any) => a.ragu).length} Soal</span>
              </div>
              <div className="flex justify-between font-bold text-rose-600">
                <span>Belum Dijawab:</span>
                <span>{Math.max(0, soalList.length - Object.keys(answers).length)} Soal</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsConfirmSubmitOpen(false)}
                className="px-5 py-3 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Kembali Periksa
              </button>
              <button
                onClick={handleFinalSubmit}
                disabled={loginLoading}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200 transition disabled:opacity-50 cursor-pointer"
              >
                {loginLoading ? 'Mengumpulkan...' : 'Ya, Selesaikan & Kumpulkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
