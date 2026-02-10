import React, { useState } from 'react';
import { Budget, Category, BudgetFrequency } from '../types';
import { Target, Plus, Trash2, Edit2, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface BudgetManagerProps {
  budgets: Budget[];
  categories: Category[];
  onAdd: (b: Budget) => void;
  onDelete: (id: string) => void;
  onEdit: (b: Budget) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, categories, onAdd, onDelete, onEdit }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  // Add Form
  const [category, setCategory] = useState(expenseCategories[0]?.name || '');
  const [limit, setLimit] = useState('');
  const [frequency, setFrequency] = useState<BudgetFrequency>('MONTHLY');

  // Edit Form
  const [editItem, setEditItem] = useState<{ b: Budget, limitStr: string } | null>(null);

  // Helper
  const handleAmountChange = (val: string, setter: (v: string) => void) => {
    const rawValue = val.replace(/\D/g, '');
    if (!rawValue) { setter(''); return; }
    setter(parseInt(rawValue).toLocaleString('id-ID'));
  };

  const parseAmount = (val: string) => parseFloat(val.replace(/\./g, '')) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ 
      id: uuidv4(), 
      userId: '', 
      category, 
      limit: parseAmount(limit), 
      period: new Date().toISOString().slice(0, 7),
      frequency: frequency 
    });
    setLimit(''); 
    setFrequency('MONTHLY');
    toast.success('Budget berhasil dipasang');
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      onEdit({ ...editItem.b, limit: parseAmount(editItem.limitStr) });
      toast.success('Budget berhasil diperbarui');
      setIsEditOpen(false);
      setEditItem(null);
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      toast.success('Budget dihapus');
      setDeleteId(null);
    }
  };

  const openEditModal = (b: Budget) => {
    setEditItem({ b: { ...b }, limitStr: b.limit.toLocaleString('id-ID') });
    setIsEditOpen(true);
  };

  const getFrequencyLabel = (freq: BudgetFrequency) => {
    switch (freq) {
      case 'DAILY': return '/ Hari';
      case 'WEEKLY': return '/ Minggu';
      case 'MONTHLY': return '/ Bulan';
      case 'YEARLY': return '/ Tahun';
      default: return '/ Bulan';
    }
  };

  const getFrequencyFullLabel = (freq: BudgetFrequency) => {
    switch (freq) {
      case 'DAILY': return 'Harian';
      case 'WEEKLY': return 'Mingguan';
      case 'MONTHLY': return 'Bulanan';
      case 'YEARLY': return 'Tahunan';
      default: return 'Bulanan';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Target Anggaran</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Kendalikan nafsu belanja dengan menetapkan batas.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Pasang Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((b, idx) => (
          <div 
            key={b.id} 
            onClick={() => openEditModal(b)}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:shadow-lg animate-pop-in cursor-pointer" 
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl"><Target className="w-6 h-6" /></div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{b.frequency ? getFrequencyFullLabel(b.frequency) : 'Bulanan'}</p>
                   <h4 className="text-lg font-bold text-slate-800 dark:text-white">{b.category}</h4>
                </div>
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); openEditModal(b); }} 
                  className="text-slate-300 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all hover:scale-110"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setDeleteId(b.id); }} 
                  className="text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 flex items-center justify-between border border-slate-100 dark:border-slate-700 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10 transition-colors">
               <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Batas:</span>
               <div className="text-right">
                 <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">Rp {b.limit.toLocaleString('id-ID')}</span>
                 <span className="text-xs font-medium text-slate-400 ml-1">{getFrequencyLabel(b.frequency || 'MONTHLY')}</span>
               </div>
            </div>
          </div>
        ))}
        {budgets.length === 0 && <div className="col-span-full py-16 text-center text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl italic animate-pulse">Anggaran belum diatur. Klik tombol "Pasang Budget" untuk memulai.</div>}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setDeleteId(null)}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-pop-in border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Hapus Budget?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 px-4">
              Apakah Anda yakin ingin menghapus pengaturan budget ini?
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

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setIsAddOpen(false)}></div>
          <div className="relative w-full max-w-md glass-card rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10"></div>
            <div className="p-5 pb-0 shrink-0">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center">Atur Anggaran Baru</h3>
            </div>
            <div className="p-5 pt-4 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Form fields remain unchanged */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Kategori Pengeluaran</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer font-medium text-slate-900 dark:text-white">
                    {expenseCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Limit (Rp)</label>
                    <input type="text" required value={limit} onChange={(e) => handleAmountChange(e.target.value, setLimit)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Periode</label>
                    <select value={frequency} onChange={(e) => setFrequency(e.target.value as BudgetFrequency)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 outline-none cursor-pointer font-medium text-slate-900 dark:text-white">
                      <option value="DAILY">Harian</option>
                      <option value="WEEKLY">Mingguan</option>
                      <option value="MONTHLY">Bulanan</option>
                      <option value="YEARLY">Tahunan</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors active:scale-95">Pasang Target</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Reuse existing) */}
      {isEditOpen && editItem && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative w-full max-w-md glass-card rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10"></div>
            <div className="p-5 pb-0 shrink-0">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center">Edit Anggaran</h3>
            </div>
            <div className="p-5 pt-4 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Kategori Pengeluaran</label>
                  <select value={editItem.b.category} onChange={(e) => setEditItem({ ...editItem, b: { ...editItem.b, category: e.target.value } })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 outline-none cursor-pointer font-medium text-slate-900 dark:text-white">
                    {expenseCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Limit (Rp)</label>
                    <input type="text" required value={editItem.limitStr} onChange={(e) => handleAmountChange(e.target.value, (val) => setEditItem({ ...editItem, limitStr: val }))} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Periode</label>
                    <select value={editItem.b.frequency} onChange={(e) => setEditItem({ ...editItem, b: { ...editItem.b, frequency: e.target.value as BudgetFrequency } })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 outline-none cursor-pointer font-medium text-slate-900 dark:text-white">
                      <option value="DAILY">Harian</option>
                      <option value="WEEKLY">Mingguan</option>
                      <option value="MONTHLY">Bulanan</option>
                      <option value="YEARLY">Tahunan</option>
                    </select>
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

export default BudgetManager;