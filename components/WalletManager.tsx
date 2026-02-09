import React, { useState } from 'react';
import { Wallet, WalletType } from '../types';
import { CreditCard, Plus, Trash2, Smartphone, Landmark, Banknote, Chip } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface WalletManagerProps {
  wallets: Wallet[];
  onAdd: (w: Wallet) => void;
  onDelete: (id: string) => void;
}

const WalletManager: React.FC<WalletManagerProps> = ({ wallets, onAdd, onDelete }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('CASH');
  const [initialBalance, setInitialBalance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: uuidv4(), userId: '', name, type, balance: parseFloat(initialBalance) || 0 });
    setName(''); setInitialBalance(''); setIsAddOpen(false);
  };

  const getGradient = (type: WalletType) => {
    switch(type) {
      case 'BANK': return 'bg-gradient-to-br from-blue-600 to-blue-800';
      case 'E-WALLET': return 'bg-gradient-to-br from-purple-600 to-indigo-800';
      default: return 'bg-gradient-to-br from-emerald-600 to-teal-800';
    }
  };

  const getCardPattern = (type: WalletType) => {
     if(type === 'BANK') return <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-20 translate-x-10 pointer-events-none" />;
     if(type === 'E-WALLET') return <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />;
     return <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />;
  }

  const getIcon = (type: WalletType) => {
    switch(type) {
      case 'CASH': return <Banknote className="w-5 h-5" />;
      case 'BANK': return <Landmark className="w-5 h-5" />;
      case 'E-WALLET': return <Smartphone className="w-5 h-5" />;
      default: return <CreditCard className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Dompet</h2>
          <p className="text-sm text-slate-500">Kelola sumber dana anda dengan tampilan modern.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:-translate-y-0.5">
          <Plus className="w-4 h-4 mr-2" /> Dompet Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wallets.map(w => (
          <div key={w.id} className={`relative rounded-[1.5rem] shadow-xl overflow-hidden text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl h-56 flex flex-col justify-between p-6 ${getGradient(w.type)} group`}>
            {getCardPattern(w.type)}
            
            {/* Card Header */}
            <div className="relative z-10 flex justify-between items-start">
               <div className="flex items-center gap-2 opacity-80">
                  {getIcon(w.type)}
                  <span className="text-xs font-bold tracking-widest uppercase">{w.type}</span>
               </div>
               <button onClick={() => onDelete(w.id)} className="text-white/50 hover:text-white p-1 rounded-full hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
               </button>
            </div>

            {/* Card Chip & Content */}
            <div className="relative z-10">
               <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 mb-4 opacity-80 flex items-center justify-center border border-yellow-600/30">
                 <div className="w-full h-[1px] bg-yellow-600/40"></div>
               </div>
               
               <p className="text-3xl font-mono font-bold tracking-tight mb-1">
                 Rp {w.balance.toLocaleString('id-ID')}
               </p>
               <p className="text-sm font-medium text-white/80 tracking-wide font-mono">
                 **** **** {w.id.substring(0, 4)}
               </p>
            </div>

            {/* Card Footer */}
            <div className="relative z-10 flex justify-between items-end">
               <div>
                 <p className="text-[10px] uppercase text-white/60 font-bold tracking-widest mb-0.5">Card Holder</p>
                 <p className="font-bold tracking-wide text-sm">{w.name.toUpperCase()}</p>
               </div>
               <div className="w-8 h-8 opacity-80">
                  {/* Fake Mastercard/Visa circles */}
                  <div className="flex -space-x-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/80"></div>
                    <div className="w-6 h-6 rounded-full bg-orange-400/80"></div>
                  </div>
               </div>
            </div>
          </div>
        ))}
        
        {/* Add New Placeholder Card */}
        <button onClick={() => setIsAddOpen(true)} className="h-56 rounded-[1.5rem] border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
            <div className="p-4 bg-slate-100 rounded-full mb-3 group-hover:bg-white group-hover:shadow-md transition-all">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-bold text-sm">Tambah Dompet</span>
        </button>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">Buat Dompet Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Nama Dompet</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-700" placeholder="Cth: BCA Utama, GoPay" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Tipe</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white outline-none cursor-pointer font-medium text-slate-700">
                    <option value="CASH">Tunai</option>
                    <option value="BANK">Bank</option>
                    <option value="E-WALLET">E-Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Saldo Awal</label>
                  <input type="number" required value={initialBalance} onChange={(e) => setInitialBalance(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700" placeholder="0" />
                </div>
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">Buat Dompet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManager;