
import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, CloudOff } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const [status, setStatus] = useState<'ONLINE' | 'OFFLINE' | 'RECONNECTED'>('ONLINE');

  useEffect(() => {
    // Initial check
    if (!navigator.onLine) {
      setStatus('OFFLINE');
    }

    const handleOffline = () => setStatus('OFFLINE');
    
    const handleOnline = () => {
      setStatus('RECONNECTED');
      // Hide the "Back Online" message after 3 seconds
      setTimeout(() => {
        setStatus('ONLINE');
      }, 3000);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (status === 'ONLINE') return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up w-full max-w-sm px-4 flex justify-center pointer-events-none">
      {status === 'OFFLINE' ? (
        <div className="bg-slate-900/85 dark:bg-white/90 backdrop-blur-md text-white dark:text-slate-900 px-5 py-3.5 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 dark:border-slate-200 pointer-events-auto transition-all hover:scale-105">
          <div className="p-1.5 bg-red-500 rounded-full flex-shrink-0 animate-pulse">
            <WifiOff className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-none">Mode Offline</span>
            <span className="text-[10px] opacity-80 mt-1 font-medium">Fitur AI tidak tersedia. Data disimpan lokal.</span>
          </div>
        </div>
      ) : (
        <div className="bg-emerald-500/90 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-pop-in pointer-events-auto">
          <Wifi className="w-5 h-5" />
          <span className="text-sm font-bold">Koneksi Kembali Stabil</span>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;
