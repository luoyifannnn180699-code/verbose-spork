import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialDataIfEmpty, type TeacherProfile } from './db';
import { Navbar } from './components/Navbar';
import { ModulAjarView } from './components/ModulAjar/ModulAjarView';
import { BankSoalView } from './components/BankSoal/BankSoalView';
import { ProtaProsemView } from './components/ProtaProsem/ProtaProsemView';
import { BackupRestoreView } from './components/BackupRestore/BackupRestoreView';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NotificationToast } from './components/NotificationToast';
import { KamusHskView } from './components/KamusHsk/KamusHskView';

type AppTab =
  | 'modul_ajar'
  | 'bank_soal'
  | 'prota_prosem'
  | 'backup_restore'
  | 'kamus_hsk';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('modul_ajar');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Seed data awal Kurikulum Merdeka
  useEffect(() => {
    seedInitialDataIfEmpty().catch(console.error);
  }, []);

  // Live queries Dexie
  const totalModul = useLiveQuery(() => db.modul_ajar.count(), []) ?? 0;
  const totalSoal = useLiveQuery(() => db.bank_soal.count(), []) ?? 0;
  const totalProtaProsem = useLiveQuery(() => db.prota_prosem.count(), []) ?? 0;
  const profiles = useLiveQuery(() => db.profil_guru.toArray(), []) ?? [];
  const activeProfile: TeacherProfile | undefined = profiles[0];

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        profile={activeProfile}
        stats={{
          totalModul,
          totalSoal,
          totalProtaProsem,
        }}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Modul Ajar */}
        {activeTab === 'modul_ajar' && (
          <ModulAjarView
            onNotify={showNotification}
            profile={activeProfile}
            apiKey=""
            onOpenApiKeyModal={() => {}}
          />
        )}

        {/* Tab 2: Bank Soal */}
        {activeTab === 'bank_soal' && (
          <BankSoalView
            onNotify={showNotification}
            profile={activeProfile}
            apiKey=""
            onOpenApiKeyModal={() => {}}
          />
        )}

        {/* Tab 3: Prota & Prosem */}
        {activeTab === 'prota_prosem' && (
          <ProtaProsemView
            onNotify={showNotification}
            profile={activeProfile}
          />
        )}

        {/* Tab 4: Backup & Restore */}
        {activeTab === 'backup_restore' && (
          <BackupRestoreView onNotify={showNotification} />
        )}

        {/* Tab 5: Kamus HSK */}
        {activeTab === 'kamus_hsk' && <KamusHskView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/70 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Portal Administrasi Guru &copy; {new Date().getFullYear()} &bull;
            Aplikasi Berbasis Dexie.js (IndexedDB) 100% Offline-First.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Kurikulum Merdeka</span>
            <span>&bull;</span>
            <span>Ekspor Word (.docx)</span>
            <span>&bull;</span>
            <span>Kamus HSK 1-9</span>
            <span>&bull;</span>
            <span>PWA Offline</span>
          </div>
        </div>
      </footer>

      {/* Floating Indicators */}
      <OfflineIndicator />

      {/* Notification Toast */}
      <NotificationToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* Teacher Profile Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={showNotification}
      />
    </div>
  );
}