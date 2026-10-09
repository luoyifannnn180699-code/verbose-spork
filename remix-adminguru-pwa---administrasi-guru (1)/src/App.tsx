import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialDataIfEmpty, type TeacherProfile } from './db';
import { Navbar } from './components/Navbar';
import { ModulAjarView } from './components/ModulAjar/ModulAjarView';
import { BankSoalView } from './components/BankSoal/BankSoalView';
import { ProtaProsemView } from './components/ProtaProsem/ProtaProsemView';
import { BackupRestoreView } from './components/BackupRestore/BackupRestoreView';
import { AIAssistantView } from './components/AIAssistant/AIAssistantView';
import { FloatingAIAssistant } from './components/AIAssistant/FloatingAIAssistant';
import { SettingsModal } from './components/SettingsModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { KnowledgeBaseModal } from './components/KnowledgeBase/KnowledgeBaseModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NotificationToast } from './components/NotificationToast';
import { getActiveAIConfig } from './utils/aiEngine';

export default function App() {
  const [activeTab, setActiveTab] = useState<'modul_ajar' | 'bank_soal' | 'prota_prosem' | 'backup_restore' | 'ai_asisten'>('modul_ajar');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active AI Provider state
  const [aiConfig, setAiConfig] = useState(() => getActiveAIConfig());
  const [apiKey, setApiKey] = useState<string>(() => {
    return getActiveAIConfig().apiKey || '';
  });

  const handleSaveApiKey = (key: string) => {
    const updated = getActiveAIConfig();
    setAiConfig(updated);
    setApiKey(updated.apiKey || '');
  };

  const refreshAiConfig = () => {
    const updated = getActiveAIConfig();
    setAiConfig(updated);
    setApiKey(updated.apiKey || '');
  };

  // Inisialisasi seed contoh data Kurikulum Merdeka jika kosong
  useEffect(() => {
    seedInitialDataIfEmpty().catch(console.error);
  }, []);

  // Live queries dari Dexie IndexedDB
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

  const isAIReady = aiConfig.provider === 'free_pollinations' || Boolean(apiKey && apiKey.trim());

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar & 4 Main Navigation Tabs */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenKnowledgeBase={() => setIsKnowledgeBaseOpen(true)}
        hasApiKey={isAIReady}
        profile={activeProfile}
        stats={{
          totalModul,
          totalSoal,
          totalProtaProsem,
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab 1: Modul Ajar / Lesson Plan */}
        {activeTab === 'modul_ajar' && (
          <ModulAjarView
            onNotify={showNotification}
            profile={activeProfile}
            apiKey={apiKey}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        )}

        {/* Tab 2: Bank Soal */}
        {activeTab === 'bank_soal' && (
          <BankSoalView
            onNotify={showNotification}
            profile={activeProfile}
            apiKey={apiKey}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
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
          <BackupRestoreView
            onNotify={showNotification}
          />
        )}

        {/* Tab 5: AI Asisten Guru */}
        {activeTab === 'ai_asisten' && (
          <AIAssistantView
            onNotify={showNotification}
            profile={activeProfile}
            apiKey={apiKey}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}
      </main>

      {/* Footer Info */}
      <footer className="border-t border-slate-200 bg-white/70 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Portal Administrasi Guru &copy; {new Date().getFullYear()} &bull; Aplikasi Berbasis Dexie.js (IndexedDB) 100% Offline-First.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Kurikulum Merdeka</span>
            <span>&bull;</span>
            <span>DeepSeek & AI Gratis</span>
            <span>&bull;</span>
            <span>GuruPintar AI Asisten</span>
            <span>&bull;</span>
            <span>Ekspor Word (.docx)</span>
            <span>&bull;</span>
            <span>PWA Offline</span>
          </div>
        </div>
      </footer>

      {/* Floating Interactive AI Assistant (Always accessible) */}
      <FloatingAIAssistant
        apiKey={apiKey}
        profile={activeProfile}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenFullAssistantTab={() => setActiveTab('ai_asisten')}
        onNotify={showNotification}
      />

      {/* Floating Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Notification Toast */}
      <NotificationToast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* Teacher Profile / Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={showNotification}
      />

      {/* Gemini API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
        onNotify={showNotification}
      />

      {/* Pusat Referensi & Ajari AI Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeBaseOpen}
        onClose={() => setIsKnowledgeBaseOpen(false)}
        onNotify={showNotification}
        defaultMataPelajaran={activeProfile?.mataPelajaranUtama || 'Bahasa Mandarin'}
      />
    </div>
  );
}
