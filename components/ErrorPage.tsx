
import React from 'react';
import { FileQuestion, ShieldBan, ArrowLeft, Home, AlertTriangle } from 'lucide-react';

interface ErrorPageProps {
  code: '404' | '403' | '500';
  title?: string;
  message?: string;
  onBack?: () => void;
  onHome?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ code, title, message, onBack, onHome }) => {
  
  const config = {
    '404': {
      icon: FileQuestion,
      defaultTitle: 'Halaman Tidak Ditemukan',
      defaultMessage: 'Ups! Sepertinya Anda tersesat. Halaman yang Anda cari tidak ada atau telah dipindahkan.',
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      bgClass: 'bg-indigo-50 dark:bg-indigo-900/20',
      gradient: 'from-indigo-600 to-purple-600',
      shadow: 'shadow-indigo-500/30'
    },
    '403': {
      icon: ShieldBan,
      defaultTitle: 'Akses Ditolak',
      defaultMessage: 'Maaf, Anda tidak memiliki izin untuk mengakses halaman ini. Hubungi administrator jika Anda merasa ini kesalahan.',
      colorClass: 'text-red-600 dark:text-red-400',
      bgClass: 'bg-red-50 dark:bg-red-900/20',
      gradient: 'from-red-600 to-orange-600',
      shadow: 'shadow-red-500/30'
    },
    '500': {
      icon: AlertTriangle,
      defaultTitle: 'Terjadi Kesalahan',
      defaultMessage: 'Sistem mengalami masalah yang tidak terduga. Silakan coba lagi beberapa saat lagi.',
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgClass: 'bg-amber-50 dark:bg-amber-900/20',
      gradient: 'from-amber-600 to-yellow-600',
      shadow: 'shadow-amber-500/30'
    }
  }[code];

  const Icon = config.icon;

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br ${config.gradient} rounded-full blur-[128px] opacity-20 pointer-events-none`}></div>

      <div className="relative glass-card max-w-lg w-full p-8 md:p-12 rounded-[2.5rem] text-center shadow-2xl animate-pop-in border border-white/50 dark:border-slate-700/50">
        
        {/* Animated Icon Container */}
        <div className="mb-8 relative inline-block group">
          <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500`}></div>
          <div className={`relative w-24 h-24 rounded-full ${config.bgClass} flex items-center justify-center mx-auto transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
            <Icon className={`w-12 h-12 ${config.colorClass}`} />
          </div>
          
          {/* Floating Code Badge */}
          <div className="absolute -top-2 -right-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <span className={`text-sm font-bold ${config.colorClass}`}>{code}</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            {title || config.defaultTitle}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
            {message || config.defaultMessage}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {onBack && (
            <button 
              onClick={onBack}
              className="flex items-center justify-center px-6 py-3.5 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </button>
          )}
          
          {onHome && (
            <button 
              onClick={onHome}
              className={`flex items-center justify-center px-6 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r ${config.gradient} hover:shadow-lg ${config.shadow} transition-all hover:scale-105 active:scale-95`}
            >
              <Home className="w-4 h-4 mr-2" />
              Ke Dashboard
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ErrorPage;
