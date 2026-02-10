import React, { useState } from 'react';
import { Wallet, WalletType } from '../types';
import { CreditCard, Plus, Trash2, Smartphone, Landmark, Banknote, Edit2, AlertTriangle, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface WalletManagerProps {
  wallets: Wallet[];
  onAdd: (w: Wallet) => void;
  onDelete: (id: string) => void;
  onEdit: (w: Wallet) => void;
}

const WalletManager: React.FC<WalletManagerProps> = ({ wallets, onAdd, onDelete, onEdit }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Add Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('CASH');
  const [initialBalance, setInitialBalance] = useState('');

  // Edit Form State
  const [editItem, setEditItem] = useState<{ id: string, name: string, type: WalletType, balance: string } | null>(null);

  // Formatting helpers
  const handleAmountChange = (val: string, setter: (v: string) => void) => {
    const rawValue = val.replace(/\D/g, '');
    if (!rawValue) { setter(''); return; }
    setter(parseInt(rawValue).toLocaleString('id-ID'));
  };

  const parseAmount = (val: string) => parseFloat(val.replace(/\./g, '')) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: uuidv4(), userId: '', name, type, balance: parseAmount(initialBalance) });
    toast.success('Dompet berhasil dibuat');
    setName(''); setInitialBalance(''); setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      onEdit({ 
        id: editItem.id, 
        userId: '', 
        name: editItem.name, 
        type: editItem.type, 
        balance: parseAmount(editItem.balance) 
      });
      toast.success('Dompet berhasil diperbarui');
      setIsEditOpen(false);
      setEditItem(null);
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      toast.success('Dompet berhasil dihapus');
      setDeleteId(null);
    }
  };

  const openEditModal = (w: Wallet) => {
    setEditItem({
      ...w,
      balance: w.balance.toLocaleString('id-ID')
    });
    setIsEditOpen(true);
  };

  const getGradient = (type: WalletType) => {
    switch(type) {
      case 'BANK': return 'bg-gradient-to-br from-blue-600 to-blue-800';
      case 'E-WALLET': return 'bg-gradient-to-br from-purple-600 to-indigo-800';
      default: return 'bg-gradient-to-br from-emerald-600 to-teal-800';
    }
  };

  const getCardPattern = (type: WalletType) => {
     if(type === 'BANK') return <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-20 translate-x-10 pointer-events-none transition-transform duration-700 group-hover:translate-x-12 group-hover:scale-110" />;
     if(type === 'E-WALLET') return <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-80" />;
     return <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none mix-blend-overlay" />;
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
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Dompet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Kelola sumber dana anda dengan tampilan modern.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Dompet Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {wallets.map((w, idx) => (
          <div 
            key={w.id} 
            onClick={() => openEditModal(w)}
            className={`relative rounded-[1.5rem] shadow-xl overflow-hidden text-white transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:-translate-y-1 h-56 flex flex-col justify-between p-6 ${getGradient(w.type)} group cursor-pointer animate-pop-in`}
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            {getCardPattern(w.type)}
            
            <div className="relative z-10 flex justify-between items-start">
               <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                  {getIcon(w.type)}
                  <span className="text-xs font-bold tracking-widest uppercase">{w.type}</span>
               </div>
               <div className="flex items-center space-x-1">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openEditModal(w); }} 
                    className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/20 transition-all hover:scale-110"
                  >
                      <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setDeleteId(w.id); }} 
                    className="text-white/70 hover:text-white p-1 rounded-full hover:bg-white/20 transition-all hover:scale-110"
                  >
                      <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>

            <div className="relative z-10">
               <div className="w-10 h-8 rounded-md bg-gradient-to-br from-yellow-200 to-yellow-500 mb-4 opacity-80 flex items-center justify-center border border-yellow-600/30 shadow-sm group-hover:shadow-md transition-shadow">
                 <div className="w-full h-[1px] bg-yellow-600/40"></div>
               </div>
               
               <p className="text-3xl font-mono font-bold tracking-tight mb-1 drop-shadow-md group-hover:scale-105 transition-transform origin-left duration-500">
                 Rp {w.balance.toLocaleString('id-ID')}
               </p>
               <p className="text-sm font-medium text-white/80 tracking-wide font-mono">
                 **** **** {w.id.substring(0, 4)}
               </p>
            </div>

            <div className="relative z-10 flex justify-between items-end">
               <div>
                 <p className="text-[10px] uppercase text-white/60 font-bold tracking-widest mb-0.5">Card Holder</p>
                 <p className="font-bold tracking-wide text-sm">{w.name.toUpperCase()}</p>
               </div>
               <div className="w-8 h-8 opacity-80 group-hover:scale-110 transition-transform duration-500">
                  <div className="flex -space-x-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/80 backdrop-blur-sm shadow-sm"></div>
                    <div className="w-6 h-6 rounded-full bg-orange-400/80 backdrop-blur-sm shadow-sm"></div>
                  </div>
               </div>
            </div>
          </div>
        ))}
        
        <button onClick={() => setIsAddOpen(true)} className="h-56 rounded-[1.5rem] border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group hover:scale-[1.02] active:scale-95 animate-pop-in" style={{ animationDelay: `${wallets.length * 100}ms` }}>
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-md transition-all group-hover:scale-110 duration-300">
              <Plus className="w-8 h-8" />
            </div>
            <span className="font-bold text-sm">Tambah Dompet</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setDeleteId(null)}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-pop-in border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Hapus Dompet?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 px-4">
              Dompet ini akan dihapus permanen. Transaksi yang terkait mungkin akan terpengaruh.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteId(null)} 
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDelete} 
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modals (Unchanged content but kept structure) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setIsAddOpen(false)}></div>
          <div className="relative w-full max-w-md glass-card rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10"></div>
            <div className="p-5 pb-0 shrink-0">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center">Buat Dompet Baru</h3>
            </div>
            <div className="p-5 pt-4 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Nama Dompet</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="Cth: BCA Utama, GoPay" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Tipe</label>
                    <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 outline-none cursor-pointer font-medium text-slate-900 dark:text-white">
                      <option value="CASH">Tunai</option>
                      <option value="BANK">Bank</option>
                      <option value="E-WALLET">E-Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Saldo Awal</label>
                    <input type="text" required value={initialBalance} onChange={(e) => handleAmountChange(e.target.value, setInitialBalance)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="0" />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors active:scale-95">Buat Dompet</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && editItem && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative w-full max-w-md glass-card rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10"></div>
            <div className="p-5 pb-0 shrink-0">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center">Edit Dompet</h3>
            </div>
            <div className="p-5 pt-4 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Nama Dompet</label>
                  <input type="text" required value={editItem.name} onChange={(e) => setEditItem({...editItem, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Tipe</label>
                    <select value={editItem.type} onChange={(e) => setEditItem({...editItem, type: e.target.value as any})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 outline-none cursor-pointer font-medium text-slate-900 dark:text-white">
                      <option value="CASH">Tunai</option>
                      <option value="BANK">Bank</option>
                      <option value="E-WALLET">E-Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Saldo (Adjustment)</label>
                    <input type="text" required value={editItem.balance} onChange={(e) => handleAmountChange(e.target.value, (val) => setEditItem({...editItem, balance: val}))} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors active:scale-95">Simpan Perubahan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManager;