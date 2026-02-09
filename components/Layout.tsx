import React, { ReactNode } from 'react';
import { 
  LayoutDashboard, List, Zap, PieChart, Menu, X, Wallet as WalletIcon, 
  LogOut, ShieldCheck, HandCoins, Target, Gem, CreditCard, ChevronRight 
} from 'lucide-react';
import { AppView, User } from '../types';

interface LayoutProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  children: ReactNode;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setCurrentView, children, user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: AppView; icon: any; label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => {
          setCurrentView(view);
          setIsSidebarOpen(false);
        }}
        className={`group flex items-center w-full px-4 py-3 mb-1.5 rounded-2xl transition-all duration-300 relative overflow-hidden ${
          isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1'
            : 'text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm'
        }`}
      >
        <div className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
        </div>
        <span className="font-semibold text-sm tracking-wide">{label}</span>
        {isActive && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />}
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50/50 overflow-hidden text-slate-900">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Modern Floating Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-slate-50/50 lg:bg-transparent transform transition-transform duration-300 lg:transform-none flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-4 lg:py-6 lg:pl-6">
          <div className="flex-1 bg-white lg:rounded-[2rem] lg:shadow-xl lg:shadow-slate-200/50 border border-white/50 flex flex-col overflow-hidden">
            
            {/* Logo Area */}
            <div className="flex items-center justify-between p-6 pb-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <WalletIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-800 leading-none">FinTrack</h1>
                  <span className="text-[10px] font-bold text-indigo-500 tracking-widest uppercase">AI Powered</span>
                </div>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:bg-slate-50 p-2 rounded-xl"><X className="w-5 h-5" /></button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-8 scrollbar-hide">
              <div>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Menu Utama</p>
                <div className="space-y-1">
                  <NavItem view={AppView.DASHBOARD} icon={LayoutDashboard} label="Dashboard" />
                  <NavItem view={AppView.TRANSACTIONS} icon={List} label="Riwayat" />
                  <NavItem view={AppView.SMART_ENTRY} icon={Zap} label="Input AI" />
                  <NavItem view={AppView.INSIGHTS} icon={PieChart} label="Analisis" />
                </div>
              </div>

              <div>
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Keuangan</p>
                <div className="space-y-1">
                  <NavItem view={AppView.WALLETS} icon={CreditCard} label="Dompet" />
                  <NavItem view={AppView.BUDGETS} icon={Target} label="Anggaran" />
                  <NavItem view={AppView.DEBTS} icon={HandCoins} label="Hutang" />
                  <NavItem view={AppView.ASSETS} icon={Gem} label="Aset" />
                </div>
              </div>
              
              {user?.role === 'ADMIN' && (
                <div>
                  <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Sistem</p>
                  <NavItem view={AppView.ADMIN_DASHBOARD} icon={ShieldCheck} label="Admin Panel" />
                </div>
              )}
            </nav>

            {/* User Profile Footer */}
            <div className="p-4 mt-auto">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 relative group">
                <div className="flex items-center space-x-3 mb-3">
                   <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
                     {user?.name.charAt(0).toUpperCase()}
                   </div>
                   <div className="overflow-hidden flex-1">
                     <p className="text-sm font-bold text-slate-800 truncate">{user?.name}</p>
                     <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
                   </div>
                </div>
                <button onClick={onLogout} className="flex items-center justify-center w-full py-2.5 text-xs font-bold text-red-500 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm">
                  <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Glassmorphism Header */}
        <header className="h-20 lg:h-24 flex items-center justify-between px-6 lg:px-10 z-20 sticky top-0 bg-slate-50/80 backdrop-blur-md">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 mr-4 text-slate-600 hover:bg-white rounded-xl shadow-sm"><Menu className="w-6 h-6" /></button>
            
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                {currentView === AppView.DASHBOARD && 'Dashboard Ringkasan'}
                {currentView === AppView.TRANSACTIONS && 'Riwayat Transaksi'}
                {currentView === AppView.WALLETS && 'Dompet Saya'}
                {currentView === AppView.BUDGETS && 'Target Anggaran'}
                {currentView === AppView.DEBTS && 'Hutang & Tagihan'}
                {currentView === AppView.ASSETS && 'Portofolio Aset'}
                {currentView === AppView.SMART_ENTRY && 'Input Cerdas AI'}
                {currentView === AppView.INSIGHTS && 'Analisis Finansial'}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {currentView === AppView.DASHBOARD && `Selamat datang kembali, ${user?.name.split(' ')[0]}!`}
                {currentView === AppView.SMART_ENTRY && 'Catat transaksi semudah chatting'}
                {currentView !== AppView.DASHBOARD && currentView !== AppView.SMART_ENTRY && 'Kelola keuangan anda dengan lebih baik'}
              </p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:px-10 lg:pb-10 scroll-smooth">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;