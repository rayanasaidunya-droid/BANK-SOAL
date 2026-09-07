import React, { useState } from 'react';
import { UserRole } from './types';
import { HeaderNav } from './components/HeaderNav';
import { KoordinatorView } from './components/KoordinatorView';
import { GuruPenulisView } from './components/GuruPenulisView';
import { ProktorView } from './components/ProktorView';
import { SiswaCbtView } from './components/SiswaCbtView';
import { AuditLogsModal } from './components/AuditLogsModal';
import { TpManagementModal } from './components/TpManagementModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { apiService } from './services/api';
import { Shield, Lock, EyeOff, Layers, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('KOORDINATOR_KURIKULUM');
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isTpModalOpen, setIsTpModalOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleResetSeed = async () => {
    if (
      !window.confirm(
        'Apakah Anda yakin ingin mereset seluruh data Bank Soal, Paket Ujian, dan Sesi CBT ke data awal simulasi?'
      )
    ) {
      return;
    }

    try {
      const res = await apiService.resetSeed();
      setResetMessage(res.message);
      setRefreshKey((prev) => prev + 1);
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Gagal mereset data');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F9] text-[#1A1C1E] flex flex-col font-sans antialiased selection:bg-indigo-600 selection:text-white">
      {/* Top Navigation & Role Selector */}
      <HeaderNav
        currentRole={currentRole}
        onSelectRole={(r) => setCurrentRole(r)}
        onOpenAuditLogs={() => setIsAuditOpen(true)}
        onResetSeed={handleResetSeed}
        onOpenTpManager={() => setIsTpModalOpen(true)}
      />

      {/* Seed Reset Notification Banner */}
      {resetMessage && (
        <div className="bg-indigo-600 text-white px-4 py-2.5 text-center text-xs font-bold shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span className="tracking-wide">{resetMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary>
          {currentRole === 'KOORDINATOR_KURIKULUM' && (
            <KoordinatorView key={refreshKey} />
          )}
          {currentRole === 'GURU_PENULIS' && (
            <GuruPenulisView key={refreshKey} />
          )}
          {currentRole === 'PROKTOR_PENGAWAS' && (
            <ProktorView key={refreshKey} />
          )}
          {currentRole === 'SISWA_CBT' && (
            <SiswaCbtView key={refreshKey} />
          )}
        </ErrorBoundary>
      </main>

      {/* Architectural Standard & Security Badges Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F5F7F9] border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-slate-900 block text-xs uppercase tracking-wider">
                  BL-EXAM-001: Zero-Leakage
                </span>
                <span className="text-[11px] leading-relaxed text-slate-500 mt-1 block">
                  Kunci jawaban terenkripsi di server; stripped total sebelum dikirim ke peramban siswa.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F5F7F9] border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-slate-900 block text-xs uppercase tracking-wider">
                  BL-EXAM-002: Exam Freeze
                </span>
                <span className="text-[11px] leading-relaxed text-slate-500 mt-1 block">
                  Paket berstatus TERKUNCI bersifat immutable demi kerahasiaan & integritas naskah dinas.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F5F7F9] border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-700 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-slate-900 block text-xs uppercase tracking-wider">
                  BL-EXAM-003: Anti-Cheat
                </span>
                <span className="text-[11px] leading-relaxed text-slate-500 mt-1 block">
                  Deteksi switch-tab, alt-tab, dan loss-of-focus; lockdown otomatis pada 3 pelanggaran.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#F5F7F9] border border-slate-200/80 shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-slate-900 block text-xs uppercase tracking-wider">
                  BL-EXAM-004: Paket Seimbang
                </span>
                <span className="text-[11px] leading-relaxed text-slate-500 mt-1 block">
                  Distribusi kesetaraan bobot dan level kognitif L1/L2/L3 merata untuk Paket A, B, & Cadangan.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-6 text-[10px] uppercase font-bold tracking-widest text-slate-400">
            <div>
              EDULOCK • Platform Bank Soal & Generator Ujian Sekolah Terpadu (CBT & Naskah Cetak)
            </div>
            <div className="flex items-center space-x-6">
              <span>Server Status: Online</span>
              <span>Enkripsi: AES-256</span>
              <span>Versi 4.2.0-STABLE</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Audit Logs Modal */}
      <AuditLogsModal isOpen={isAuditOpen} onClose={() => setIsAuditOpen(false)} />

      {/* Global TP Management Modal */}
      <TpManagementModal
        isOpen={isTpModalOpen}
        onClose={() => setIsTpModalOpen(false)}
        onTpUpdated={() => {
          setRefreshKey((prev) => prev + 1);
        }}
      />
    </div>
  );
}
