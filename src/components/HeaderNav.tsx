import React from 'react';
import { UserRole } from '../types';
import {
  ShieldCheck,
  BookOpen,
  GraduationCap,
  Users,
  RotateCcw,
  History,
  FileText,
  School,
  Target,
} from 'lucide-react';

interface HeaderNavProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenAuditLogs: () => void;
  onResetSeed: () => void;
  onOpenTpManager?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentRole,
  onSelectRole,
  onOpenAuditLogs,
  onResetSeed,
  onOpenTpManager,
}) => {
  const roles: Array<{ id: UserRole; label: string; icon: React.ReactNode; desc: string }> = [
    {
      id: 'KOORDINATOR_KURIKULUM',
      label: 'Koordinator Kurikulum',
      icon: <ShieldCheck className="w-4 h-4" />,
      desc: 'Validasi Soal, Generator Kisi-kisi & Cetak Dinas',
    },
    {
      id: 'GURU_PENULIS',
      label: 'Guru Penulis',
      icon: <BookOpen className="w-4 h-4" />,
      desc: 'Input Soal Multitipe & KaTeX Formula',
    },
    {
      id: 'PROKTOR_PENGAWAS',
      label: 'Proktor & Pengawas',
      icon: <Users className="w-4 h-4" />,
      desc: 'Rilis Token Dinamis & Live Monitoring Siswa',
    },
    {
      id: 'SISWA_CBT',
      label: 'Siswa Peserta CBT',
      icon: <GraduationCap className="w-4 h-4" />,
      desc: 'Asesmen Bebas Distraksi & Anti-Cheat',
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3.5 gap-3">
          {/* Brand & Identity */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 font-black text-xl">
                <School className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-black tracking-tighter text-indigo-700">
                    EDULOCK
                  </span>
                  <span className="text-[10px] uppercase tracking-widest font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                    CBT & Bank Soal
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mt-0.5">
                  Sistem Asesmen Terpadu & Kurikulum Nasional
                </p>
              </div>
            </div>

            {/* Quick Actions for Mobile */}
            <div className="flex items-center gap-1.5 md:hidden">
              {onOpenTpManager && (
                <button
                  onClick={onOpenTpManager}
                  title="Kelola TP SD"
                  className="p-2 text-indigo-700 hover:text-indigo-900 bg-indigo-50 rounded-xl border border-indigo-200 font-bold"
                >
                  <Target className="w-4 h-4 text-indigo-600" />
                </button>
              )}
              <button
                onClick={onOpenAuditLogs}
                title="Log Audit Aktivitas"
                className="p-2 text-slate-600 hover:text-indigo-600 bg-slate-50 rounded-xl border border-slate-200 font-bold"
              >
                <History className="w-4 h-4" />
              </button>
              <button
                onClick={onResetSeed}
                title="Reset Data Awal"
                className="p-2 text-slate-600 hover:text-amber-600 bg-slate-50 rounded-xl border border-slate-200 font-bold"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Role Navigation Bar */}
          <div className="w-full md:w-auto flex items-center justify-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {roles.map((r) => {
              const active = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRole(r.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80'
                  }`}
                >
                  {r.icon}
                  <span>{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Utilities */}
          <div className="hidden md:flex items-center gap-2">
            {onOpenTpManager && (
              <button
                onClick={onOpenTpManager}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition shadow-2xs"
                title="Kelola Tujuan Pembelajaran (TP) Khusus SD Kelas 1-6"
              >
                <Target className="w-3.5 h-3.5 text-indigo-600" />
                <span>Kelola TP SD (1-6)</span>
              </button>
            )}
            <button
              onClick={onOpenAuditLogs}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl transition"
            >
              <History className="w-3.5 h-3.5 text-indigo-600" />
              <span>Log Audit</span>
            </button>
            <button
              onClick={onResetSeed}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-amber-700 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-xl transition"
              title="Reset data bank soal & sesi simulasi ke data awal"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
