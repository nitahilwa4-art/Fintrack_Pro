import React, { useState, useRef } from 'react';
import { User, UserPreferences, FinancialProfile, FinancialGoal } from '../types';
import { Moon, Sun, Bell, DollarSign, ChevronRight, Globe, Shield, Database, Upload, Download, AlertTriangle, Users, Briefcase, Target, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface SettingsProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser }) => {
  // Default preferences if not set
  const [prefs, setPrefs] = useState<UserPreferences>(user.preferences || {
    theme: 'light',
    currency: 'IDR',
    notifications: true
  });

  // Financial Profile State
  const [finProfile, setFinProfile] = useState<FinancialProfile>(user.financialProfile || {
    maritalStatus: 'SINGLE',
    dependents: 0,
    occupation: 'PRIVATE',
    goals: []
  });

  // Goal Form State
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalDate, setNewGoalDate] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleTheme = () => {
    const newTheme = prefs.theme === 'light' ? 'dark' : 'light';
    updatePreferences({ ...prefs, theme: newTheme });
    toast.success(`Tema diubah ke ${newTheme === 'dark' ? 'Gelap' : 'Terang'}`);
  };

  const handleToggleNotifications = () => {
    updatePreferences({ ...prefs, notifications: !prefs.notifications });
    toast.success(`Notifikasi ${!prefs.notifications ? 'diaktifkan' : 'dinonaktifkan'}`);
  };

  const handleChangeCurrency = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value as any;
    updatePreferences({ ...prefs, currency: newCurrency });
    toast.success(`Mata uang diubah ke ${newCurrency}`);
  };

  const updatePreferences = (newPrefs: UserPreferences) => {
    setPrefs(newPrefs);
    onUpdateUser({ ...user, preferences: newPrefs });
  };

  // --- FINANCIAL PROFILE LOGIC ---

  const updateFinProfile = (newProfile: FinancialProfile) => {
    setFinProfile(newProfile);
    onUpdateUser({ ...user, financialProfile: newProfile });
  };

  const handleAddGoal = () => {
    if (!newGoalName || !newGoalAmount || !newGoalDate) {
      toast.error('Mohon lengkapi data target');
      return;
    }
    const amount = parseFloat(newGoalAmount.replace(/\./g, '')) || 0;
    const newGoal: FinancialGoal = {
      id: uuidv4(),
      name: newGoalName,
      amount: amount,
      deadline: newGoalDate
    };
    const updatedGoals = [...finProfile.goals, newGoal];
    updateFinProfile({ ...finProfile, goals: updatedGoals });
    toast.success('Target finansial ditambahkan');
    setNewGoalName(''); setNewGoalAmount(''); setNewGoalDate('');
  };

  const handleDeleteGoal = (id: string) => {
    const updatedGoals = finProfile.goals.filter(g => g.id !== id);
    updateFinProfile({ ...finProfile, goals: updatedGoals });
    toast.success('Target dihapus');
  };

  const handleAmountChange = (val: string) => {
    const rawValue = val.replace(/\D/g, '');
    if (!rawValue) { setNewGoalAmount(''); return; }
    setNewGoalAmount(parseInt(rawValue).toLocaleString('id-ID'));
  };

  // --- BACKUP & RESTORE LOGIC ---

  const handleBackup = () => {
    const dataToBackup = {
      transactions: localStorage.getItem('transactions'),
      wallets: localStorage.getItem('wallets'),
      categories: localStorage.getItem('categories'),
      budgets: localStorage.getItem('budgets'),
      debts: localStorage.getItem('debts'),
      assets: localStorage.getItem('assets'),
      version: '1.0',
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FinTrack_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Data berhasil di-backup!');
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (!json.transactions || !json.wallets) {
          throw new Error("File backup tidak valid.");
        }

        if (window.confirm("PERINGATAN: Restore akan menimpa data saat ini. Lanjutkan?")) {
          if(json.transactions) localStorage.setItem('transactions', json.transactions);
          if(json.wallets) localStorage.setItem('wallets', json.wallets);
          if(json.categories) localStorage.setItem('categories', json.categories);
          if(json.budgets) localStorage.setItem('budgets', json.budgets);
          if(json.debts) localStorage.setItem('debts', json.debts);
          if(json.assets) localStorage.setItem('assets', json.assets);
          
          toast.success('Data berhasil dipulihkan! Halaman akan dimuat ulang.');
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch (error) {
        console.error(error);
        toast.error('Gagal membaca file backup.');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Pengaturan</h2>
        <p className="text-slate-500 dark:text-slate-400">Sesuaikan aplikasi dan profil finansial Anda.</p>
      </div>

      {/* --- NEW FINANCIAL PROFILE SECTION --- */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Profil Finansial AI</h3>
              <p className="text-indigo-100 text-sm opacity-90">Lengkapi data ini agar AI dapat memberikan saran yang presisi.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Family Profile */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4 text-indigo-100">
                <Users className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Profil Keluarga</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-indigo-200 mb-1">Status Pernikahan</label>
                  <select 
                    value={finProfile.maritalStatus}
                    onChange={(e) => updateFinProfile({ ...finProfile, maritalStatus: e.target.value as any })}
                    className="w-full bg-slate-900/30 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:bg-slate-900/50"
                  >
                    <option value="SINGLE">Lajang (Single)</option>
                    <option value="MARRIED">Menikah (Married)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-indigo-200 mb-1">Jumlah Tanggungan (Anak/Ortu)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={finProfile.dependents}
                    onChange={(e) => updateFinProfile({ ...finProfile, dependents: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900/30 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:bg-slate-900/50"
                  />
                </div>
              </div>
            </div>

            {/* Occupation */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4 text-indigo-100">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">Pekerjaan & Risiko</span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-indigo-200 mb-1">Jenis Pekerjaan</label>
                  <select 
                    value={finProfile.occupation}
                    onChange={(e) => updateFinProfile({ ...finProfile, occupation: e.target.value as any })}
                    className="w-full bg-slate-900/30 border border-white/20 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:bg-slate-900/50"
                  >
                    <option value="STABLE">PNS / BUMN (Pendapatan Stabil)</option>
                    <option value="PRIVATE">Karyawan Swasta (Menengah)</option>
                    <option value="FREELANCE">Freelancer / Pengusaha (Fluktuatif)</option>
                  </select>
                </div>
                <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
                  <p className="text-xs text-indigo-100 leading-relaxed">
                    AI akan menggunakan data ini untuk menghitung <strong>Dana Darurat</strong> ideal Anda. 
                    {finProfile.occupation === 'FREELANCE' ? ' (Saran: 12x Pengeluaran)' : ' (Saran: 3-6x Pengeluaran)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Goals */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-indigo-100">
                <Target className="w-5 h-5" />
                <div>
                  <span className="text-sm font-bold uppercase tracking-wider block">Target Finansial (Mimpi Anda)</span>
                  <span className="text-[10px] opacity-70">AI akan menghitung gap tabungan bulanan.</span>
                </div>
              </div>
            </div>

            {/* Goal List */}
            <div className="space-y-3 mb-6">
              {finProfile.goals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between p-3 bg-slate-900/20 rounded-xl border border-white/10 hover:bg-slate-900/40 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{goal.name}</p>
                      <p className="text-xs text-indigo-200">
                        Target: Rp {goal.amount.toLocaleString('id-ID')} <span className="mx-1">•</span> {goal.deadline}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 text-white/50 hover:text-red-400 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {finProfile.goals.length === 0 && (
                <div className="text-center py-6 text-white/40 text-sm italic">Belum ada target. Tambahkan mimpi Anda sekarang!</div>
              )}
            </div>

            {/* Add Goal Form */}
            <div className="flex flex-col md:flex-row gap-3 items-end bg-slate-900/30 p-4 rounded-xl border border-white/5">
              <div className="w-full md:flex-1">
                <label className="text-[10px] text-indigo-300 block mb-1">Nama Target (Cth: Rumah)</label>
                <input 
                  type="text" 
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-400 outline-none"
                  placeholder="Beli Rumah"
                />
              </div>
              <div className="w-full md:w-32">
                <label className="text-[10px] text-indigo-300 block mb-1">Nominal (Rp)</label>
                <input 
                  type="text" 
                  value={newGoalAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-400 outline-none"
                  placeholder="500.000.000"
                />
              </div>
              <div className="w-full md:w-auto">
                <label className="text-[10px] text-indigo-300 block mb-1">Tenggat Waktu</label>
                <input 
                  type="date" 
                  value={newGoalDate}
                  onChange={(e) => setNewGoalDate(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-indigo-400 outline-none"
                />
              </div>
              <button 
                onClick={handleAddGoal}
                className="w-full md:w-auto px-4 py-2 bg-white text-indigo-700 font-bold rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center text-sm shadow-lg"
              >
                <Plus className="w-4 h-4 mr-1" /> Tambah
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">Preferensi Umum</h3>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {/* Theme Toggle */}
          <div className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${prefs.theme === 'dark' ? 'bg-indigo-100 text-indigo-600' : 'bg-amber-100 text-amber-600'}`}>
                {prefs.theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Mode Tampilan</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Sesuaikan tema aplikasi (Terang/Gelap)</p>
              </div>
            </div>
            <button 
              onClick={handleToggleTheme}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${prefs.theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${prefs.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Currency */}
          <div className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-green-100 text-green-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Mata Uang Utama</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Mata uang default untuk laporan</p>
              </div>
            </div>
            <div className="relative">
              <select 
                value={prefs.currency}
                onChange={handleChangeCurrency}
                className="appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-2 pl-4 pr-8 rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="IDR">IDR (Rp)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-rose-100 text-rose-600">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Notifikasi</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Terima pengingat tagihan & budget</p>
              </div>
            </div>
            <button 
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${prefs.notifications ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${prefs.notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management (Backup/Restore) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">Manajemen Data</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-sm mb-4">
             <Database className="w-5 h-5 mt-0.5 flex-shrink-0" />
             <p>Data tersimpan di browser ini (Local Storage). Lakukan backup secara berkala agar data tidak hilang jika cache dibersihkan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={handleBackup}
              className="flex items-center justify-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"
            >
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Backup Data</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Unduh data ke file JSON</p>
              </div>
            </button>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group text-left"
            >
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg mr-4 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Restore Data</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Upload file JSON backup</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".json" 
                onChange={handleRestore}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Account Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm uppercase tracking-wide">Keamanan & Privasi</h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Keamanan Akun</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">2FA dan riwayat login</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
          </button>
          
          <button className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group">
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Bahasa</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bahasa Indonesia (Default)</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500" />
          </button>
        </div>
      </div>

      <div className="text-center pt-4">
        <p className="text-xs text-slate-400">FinTrack AI v1.2.0 with Financial Goals</p>
      </div>
    </div>
  );
};

export default Settings;