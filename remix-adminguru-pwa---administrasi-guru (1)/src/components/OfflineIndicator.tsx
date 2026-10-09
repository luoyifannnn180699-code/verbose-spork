import React, { useEffect, useState } from 'react';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 4000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (showReconnected) {
    return (
      <aside aria-label="Status Koneksi" className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xl">
        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
        <span>Koneksi Pulih — Mode sinkronisasi siap</span>
      </aside>
    );
  }

  if (isOnline) return null;

  return (
    <aside aria-label="Status Koneksi" className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-600 px-3.5 py-2.5 text-xs font-semibold text-white shadow-2xl">
      <WifiOff className="w-4 h-4 animate-pulse text-amber-200" />
      <div>
        <p className="leading-tight">Mode Offline Aktif</p>
        <p className="text-[10px] text-amber-100 font-normal">Data tetap tersimpan aman di IndexedDB perangkat Anda</p>
      </div>
      <Database className="w-4 h-4 ml-1 text-emerald-200" />
    </aside>
  );
};
