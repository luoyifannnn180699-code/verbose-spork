import React from 'react';
import {
  BookOpen,
  Calendar,
  Layers,
  FileSpreadsheet,
  Settings,
  GraduationCap,
  Sparkles,
  Database,
  Languages,
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import type { TeacherProfile } from '../db';

type AppTab =
  | 'modul_ajar'
  | 'bank_soal'
  | 'prota_prosem'
  | 'backup_restore'
  | 'ai_asisten'
  | 'kamus_hsk';

interface NavbarProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenSettings: () => void;
  onOpenApiKeyModal: () => void;
  onOpenKnowledgeBase?: () => void;
  hasApiKey: boolean;
  profile?: TeacherProfile;
  stats: {
    totalModul: number;
    totalSoal: number;
    totalProtaProsem: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  profile,
  stats,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-700 to-blue-600 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5">
                  Portal Administrasi Guru
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md">
                    PWA Offline
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate max-w-[280px]">
                {profile?.satuanPendidikan || 'SMP Negeri 1 Merdeka Belajar'} &bull; {profile?.namaGuru || 'Guru'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <PWAInstallButton />
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              title="Pengaturan Profil Guru"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Profil Guru</span>
            </button>
          </div>
        </div>

        <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar border-t border-slate-100 sm:border-t-0">
          <button
            onClick={() => setActiveTab('modul_ajar')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === 'modul_ajar' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>1. Modul Ajar</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'modul_ajar' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {stats.totalModul}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('bank_soal')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === 'bank_soal' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Bank Soal</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'bank_soal' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {stats.totalSoal}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('prota_prosem')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === 'prota_prosem' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>3. Prota & Prosem</span>
            <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${activeTab === 'prota_prosem' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {stats.totalProtaProsem}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('backup_restore')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === 'backup_restore' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>4. Backup</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_asisten')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === 'ai_asisten'
                ? 'bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 text-white shadow-sm'
                : 'text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>5. AI Asisten</span>
          </button>

          <button
            onClick={() => setActiveTab('kamus_hsk')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
              activeTab === 'kamus_hsk'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>6. Kamus HSK</span>
            <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md ${activeTab === 'kamus_hsk' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-800'}`}>
              1-9
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};