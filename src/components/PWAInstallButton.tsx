import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as installed PWA, do not display install button
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-medium border border-emerald-500/20">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span>Aplikasi Terpasang (PWA)</span>
      </div>
    );
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white shadow hover:bg-blue-700 transition cursor-pointer"
        title="Instal aplikasi ke layar utama agar bisa dibuka tanpa kuota internet"
      >
        <Download className="w-4 h-4" />
        <span>Instal PWA Offline</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Pasang di iPhone / iPad</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-slate-900">Pasang di iPhone / iPad</h3>
              <p className="mt-3 text-sm text-slate-600 space-y-2">
                1. Buka halaman ini di <strong>Safari</strong>.<br />
                2. Ketuk ikon <strong>Bagikan (Share)</strong> di bagian bawah layar.<br />
                3. Gulir ke bawah lalu pilih <strong>Tambah ke Layar Utama (Add to Home Screen)</strong>.<br />
                4. Aplikasi siap digunakan secara offline kapan saja!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Standalone indicator for testing or desktop browsers
  return null;
};
