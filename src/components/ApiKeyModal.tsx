import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  ExternalLink,
  Loader2,
  AlertCircle,
  Zap,
  Globe,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import {
  AI_PROVIDERS_METADATA,
  getActiveAIConfig,
  saveActiveAIConfig,
  testUniversalAIConnection,
  type AIProvider,
} from '../utils/aiEngine';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (key: string) => void;
  onNotify: (msg: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSave,
  onNotify,
}) => {
  const [provider, setProvider] = useState<AIProvider>('free_pollinations');
  const [inputKey, setInputKey] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const active = getActiveAIConfig();
      setProvider(active.provider || 'free_pollinations');
      setInputKey(active.apiKey || apiKey);
      setTestResult(null);
    }
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const currentProviderMeta = AI_PROVIDERS_METADATA[provider] || AI_PROVIDERS_METADATA.free_pollinations;

  const handleSave = () => {
    saveActiveAIConfig({
      provider,
      apiKey: currentProviderMeta.requiresKey ? inputKey.trim() : '',
    });
    onSave(currentProviderMeta.requiresKey ? inputKey.trim() : 'FREE_AI_MODE');
    onNotify(`Pengaturan AI disimpan: ${currentProviderMeta.name}`);
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      await testUniversalAIConnection({
        provider,
        apiKey: inputKey.trim(),
      });
      setTestResult({
        success: true,
        message: `Koneksi berhasil! Layanan ${currentProviderMeta.name} siap digunakan.`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Gagal menguji koneksi AI. Periksa koneksi internet atau kunci Anda.',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    setInputKey('');
    saveActiveAIConfig({ provider: 'free_pollinations', apiKey: '' });
    setProvider('free_pollinations');
    setTestResult(null);
    onSave('FREE_AI_MODE');
    onNotify('Pengaturan direset ke Mode AI Gratis (Tanpa API Key).');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pilihan Mesin AI (DeepSeek & Gratis)</h3>
              <p className="text-xs text-slate-500">Pilih penyedia AI untuk Modul Ajar, Bank Soal, dan AI Asisten</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Pilihan Provider Radio Cards */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Pilih Layanan Kecerdasan Buatan (AI):
            </label>

            <div className="space-y-2.5">
              {/* 1. Mode Gratis */}
              <button
                type="button"
                onClick={() => {
                  setProvider('free_pollinations');
                  setTestResult(null);
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  provider === 'free_pollinations'
                    ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${provider === 'free_pollinations' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Mode AI Gratis (Tanpa API Key)</span>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Direkomendasikan &bull; 100% Gratis
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Langsung siap pakai tanpa perlu mendaftar atau kartu kredit. Menggunakan model cerdas <strong>DeepSeek</strong> secara otomatis.
                  </p>
                </div>
              </button>

              {/* 2. DeepSeek AI Resmi */}
              <button
                type="button"
                onClick={() => {
                  setProvider('deepseek');
                  setTestResult(null);
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  provider === 'deepseek'
                    ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${provider === 'deepseek' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Flame className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">DeepSeek AI Resmi (API Key)</span>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                      DeepSeek V3 / R1
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Menggunakan API Key akun DeepSeek pribadi dari <em>platform.deepseek.com</em>. Sangat murah, penalaran tinggi, dan stabil.
                  </p>
                </div>
              </button>

              {/* 3. Groq Cloud */}
              <button
                type="button"
                onClick={() => {
                  setProvider('groq');
                  setTestResult(null);
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  provider === 'groq'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${provider === 'groq' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Groq Cloud (Super Cepat)</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      Free Tier Instan
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Kecepatan luar biasa dengan LPU inference gratis dari Groq (DeepSeek R1 Distill / Llama 3.3).
                  </p>
                </div>
              </button>

              {/* 4. Google Gemini */}
              <button
                type="button"
                onClick={() => {
                  setProvider('gemini');
                  setTestResult(null);
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                  provider === 'gemini'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${provider === 'gemini' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Google Gemini (Opsi Tambahan)</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Gemini Flash
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Gunakan API Key Google AI Studio jika Anda sudah memiliki kuncinya.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Kolom Input API Key (hanya jika provider memerlukan kunci) */}
          {currentProviderMeta.requiresKey ? (
            <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800">
                Masukkan API Key {currentProviderMeta.badge}:
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setTestResult(null);
                  }}
                  placeholder={currentProviderMeta.keyPlaceholder}
                  className="w-full pr-10 pl-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showKey ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {currentProviderMeta.keyHelpUrl && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Dapatkan API Key di sini:</span>
                  <a
                    href={currentProviderMeta.keyHelpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>Buka Situs Resmi</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Tidak Memerlukan Kunci Apapun!</strong>
                <span className="text-emerald-800 leading-relaxed">
                  Pada Mode AI Gratis, modul ajar, bank soal, dan percakapan AI langsung aktif tanpa konfigurasi tambahan.
                </span>
              </div>
            </div>
          )}

          {/* Alert Hasil Uji */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || (currentProviderMeta.requiresKey && !inputKey.trim())}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition cursor-pointer disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-indigo-600" />}
              <span>{testing ? 'Menguji Respon AI...' : 'Uji Respon Mesin AI'}</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-rose-600 hover:underline cursor-pointer text-xs"
            >
              Reset ke Mode Gratis
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow cursor-pointer transition"
          >
            Terapkan & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
