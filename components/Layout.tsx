import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, List, Zap, PieChart, Menu, X, Wallet as WalletIcon, 
  LogOut, ShieldCheck, HandCoins, Target, Gem, CreditCard, ChevronRight, Tags,
  User as UserIcon, Settings, FileDown, Bell, HelpCircle, Check, AlertTriangle, Info, CheckCircle
} from 'lucide-react';
import { AppView, User, Notification } from '../types';
import toast from 'react-hot-toast';

interface LayoutProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  children: ReactNode;
  user: User | null;
  onLogout: () => void;
}

const MOCK_NOTIFICATIONS_HEADER: Notification[] = [
  { id: '1', title: 'Tagihan Listrik', message: 'Tagihan Listrik jatuh tempo besok!', type: 'ALERT', date: new Date().toISOString(), isRead: false },
  { id: '2', title: 'Gaji Masuk', message: 'Gaji bulan Oktober sudah dicatat.', type: 'SUCCESS', date: new Date(Date.now() - 3600000).toISOString(), isRead: false },
  { id: '3', title: 'Peringatan Budget', message: 'Budget "Makan" sisa 10%.', type: 'WARNING', date: new Date(Date.now() - 7200000).toISOString(), isRead: false },
];

const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Notification Logic
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS_HEADER);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('Semua notifikasi ditandai sudah dibaca');
  };

  const handleNotificationClick = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }}
        className={`group flex items-center w-full px-4 py-3 mb-1.5 rounded-2xl transition-all duration-500 ease-out relative overflow-hidden ${
          isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1'
            : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm'
        }`}
      >
        <div className={`mr-3 transition-transform duration-500 ease-out ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />
        </div>
        <span className="font-semibold text-sm tracking-wide">{label}</span>
        {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />}
      </button>
    );
  };

  const getNotifIcon = (type: Notification['type']) => {
    switch (type) {
      case 'WARNING': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'ALERT': return <AlertTriangle className="w-4 h-4 text-red-500" />; // Use AlertTriangle for ALERT too or AlertCircle
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50/50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {isSidebarOpen && (
        <div className="fixed inset-0 modal-overlay z-30 lg:hidden animate-fade-in" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Modern Floating Sidebar with Glassmorphism */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-50/95 dark:bg-slate-900/95 lg:bg-transparent transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:transform-none flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-4 lg:py-6 lg:pl-6">
          <div className="flex-1 glass lg:rounded-[2rem] lg:shadow-2xl flex flex-col overflow-hidden transition-all duration-500">
            
            {/* Logo Area */}
            <div className="flex items-center justify-between p-6 pb-2">
              <div className="flex items-center space-x-3 group cursor-default">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                  <WalletIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white leading-none">FinTrack</h1>
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 tracking-widest uppercase">AI Powered</span>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-8 scrollbar-hide">
              <div className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
                <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Menu Utama</p>
                <div className="space-y-1">
                  <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
                  <NavItem view={AppView.TRANSACTIONS} icon={List} label="Riwayat" />
                  <NavItem view={AppView.SMART_ENTRY} icon={Zap} label="Input AI" />
                  <NavItem view={AppView.INSIGHTS} icon={PieChart} label="Analisis" />
                </div>
              </div>

              <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
                <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Keuangan</p>
                <div className="space-y-1">
                  <NavItem view={AppView.WALLETS} icon={CreditCard} label="Dompet" />
                  <NavItem view={AppView.BUDGETS} icon={Target} label="Anggaran" />
                  <NavItem view={AppView.CATEGORIES} icon={Tags} label="Kategori" />
                  <NavItem view={AppView.DEBTS} icon={HandCoins} label="Hutang" />
                  <NavItem view={AppView.ASSETS} icon={Gem} label="Aset" />
                </div>
              </div>

              <div className="animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
                <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Akun</p>
                <div className="space-y-1">
                  <NavItem view={AppView.PROFILE} icon={UserIcon} label="Profil Saya" />
                  <NavItem view={AppView.SETTINGS} icon={Settings} label="Pengaturan" />
                  <NavItem view={AppView.EXPORT} icon={FileDown} label="Export Data" />
                  <NavItem view={AppView.NOTIFICATIONS} icon={Bell} label="Notifikasi" />
                  <NavItem view={AppView.HELP} icon={HelpCircle} label="Bantuan" />
                </div>
              </div>
              
              {user?.role === 'ADMIN' && (
                <div className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
                  <p className="px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Sistem</p>
                  <NavItem view={AppView.ADMIN_DASHBOARD} icon={ShieldCheck} label="Admin Panel" />
                </div>
              )}
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 mt-auto animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-100 dark:border-slate-700 relative group transition-all duration-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80">
                <div className="flex items-center space-x-3 mb-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden ring-2 ring-white dark:ring-slate-700">
                     {user?.avatar ? (
                       <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                     ) : (
                       user?.name.charAt(0).toUpperCase()
                     )}
                   </div>
                   <div className="overflow-hidden flex-1">
                     <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user?.name}</p>
                     <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                   </div>
                </div>
                <button onClick={onLogout} className="flex items-center justify-center w-full py-2.5 text-xs font-bold text-red-500 bg-white/80 dark:bg-slate-700/80 border border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 rounded-xl transition-all shadow-sm active:scale-95">
                  <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Glassmorphism Header */}
        <header className="h-20 lg:h-24 flex items-center justify-between px-6 lg:px-10 z-20 sticky top-0 glass transition-colors">
          <div className="flex items-center gap-4 lg:gap-0">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 mr-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-xl shadow-sm transition-all active:scale-95"><Menu className="w-6 h-6" /></button>
            
            <div className="flex flex-col animate-fade-in">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight hidden sm:block">
                {currentView === AppView.DASHBOARD && 'Dashboard Ringkasan'}
                {currentView === AppView.TRANSACTIONS && 'Riwayat Transaksi'}
                {currentView === AppView.WALLETS && 'Dompet Saya'}
                {currentView === AppView.BUDGETS && 'Target Anggaran'}
                {currentView === AppView.CATEGORIES && 'Kategori Transaksi'}
                {currentView === AppView.DEBTS && 'Hutang & Tagihan'}
                {currentView === AppView.ASSETS && 'Portofolio Aset'}
                {currentView === AppView.SMART_ENTRY && 'Input Cerdas AI'}
                {currentView === AppView.INSIGHTS && 'Analisis Finansial'}
                {currentView === AppView.PROFILE && 'Profil Saya'}
                {currentView === AppView.SETTINGS && 'Pengaturan Aplikasi'}
                {currentView === AppView.EXPORT && 'Export Laporan'}
                {currentView === AppView.NOTIFICATIONS && 'Notifikasi'}
                {currentView === AppView.HELP && 'Bantuan & FAQ'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 hidden sm:block">
                {currentView === AppView.DASHBOARD && `Selamat datang kembali, ${user?.name.split(' ')[0]}!`}
                {currentView !== AppView.DASHBOARD && 'Kelola keuangan anda dengan lebih baik'}
              </p>
            </div>
          </div>

          {/* Right Side Header: Notifications & Help */}
          <div className="flex items-center gap-3">
            
            {/* Notification Dropdown */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all active:scale-95 relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
                )}
              </button>

              {/* Dropdown Panel */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-4 w-80 sm:w-96 glass-card rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700 overflow-hidden animate-pop-in origin-top-right z-50">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-sm flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white">Notifikasi</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-2 py-1 rounded-lg transition-colors flex items-center"
                      >
                        <Check className="w-3 h-3 mr-1" /> Tandai dibaca
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                        <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-xs">Tidak ada notifikasi baru</p>
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => handleNotificationClick(notif.id)}
                          className={`p-4 border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex gap-3 ${!notif.isRead ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}
                        >
                          <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            notif.type === 'ALERT' || notif.type === 'WARNING' ? 'bg-red-100 text-red-500' :
                            notif.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-500' :
                            'bg-blue-100 text-blue-500'
                          }`}>
                            {getNotifIcon(notif.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-0.5">
                              <p className={`text-sm font-bold ${!notif.isRead ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{notif.title}</p>
                              {!notif.isRead && <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{notif.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1.5">
                              {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 text-center">
                    <button 
                      onClick={() => {
                        setIsNotifOpen(false);
                        setCurrentView(AppView.NOTIFICATIONS);
                      }}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline py-1"
                    >
                      Lihat Semua Notifikasi
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Help Button */}
            <button 
              onClick={() => setCurrentView(AppView.HELP)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all active:scale-95 hidden sm:block"
              title="Bantuan"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:px-10 lg:pb-10 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full animate-fade-in-up">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;