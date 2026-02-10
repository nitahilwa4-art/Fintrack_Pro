import React from 'react';
import { Settings, RefreshCw, ArrowLeft, Clock } from 'lucide-react';

interface MaintenanceProps {
  onGoBack?: () => void;
  estimatedTime?: string;
}

const Maintenance: React.FC<MaintenanceProps> = ({ onGoBack, estimatedTime = "30 Menit" }) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-lg w-full">
        {/* Animated Icon */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 bg-indigo-100 dark:bg-slate-800 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Settings className="w-16 h-16 text-indigo-600 dark:text-indigo-400 animate-[spin_4s_linear_infinite]" />
          </div>
          <div className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-700 rounded-full shadow-lg">
            <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4 tracking-tight">
          Sedang Dalam Perbaikan
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-lg mb-8 leading-relaxed">
          Sistem kami sedang menjalani pemeliharaan terjadwal untuk meningkatkan performa. Kami akan segera kembali!
        </p>

        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-8 inline-block shadow-sm">
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
            <Clock className="w-5 h-5 text-indigo-500" />
            <span className="font-semibold">Estimasi Selesai:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-lg">
              {estimatedTime}
            </span>
          </div>
        </div>

        {onGoBack && (
          <div className="flex justify-center">
            <button 
              onClick={onGoBack}
              className="flex items-center px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:scale-105 transition-transform shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Kembali ke Dashboard
            </button>
          </div>
        )}
        
        <p className="mt-12 text-xs text-slate-400">
          Kode Pemeliharaan: <span className="font-mono">SYS_MAINT_V2</span>
        </p>
      </div>
    </div>
  );
};

export default Maintenance;