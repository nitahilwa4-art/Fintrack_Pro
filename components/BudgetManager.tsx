import React, { useState } from 'react';
import { Budget, Category, BudgetFrequency } from '../types';
import { Target, Plus, Trash2, Edit2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
  
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  // Add Form
  const [category, setCategory] = useState(expenseCategories[0]?.name || '');
  const [limit, setLimit] = useState('');
  const [frequency, setFrequency] = useState<BudgetFrequency>('MONTHLY');

  // Edit Form
  const [editItem, setEditItem] = useState<Budget | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ 
      id: uuidv4(), 
      userId: '', 
      category, 
      limit: parseFloat(limit), 
      period: new Date().toISOString().slice(0, 7),
      frequency: frequency 
    });
    setLimit(''); 
    setFrequency('MONTHLY');
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      onEdit(editItem);
      setIsEditOpen(false);
      setEditItem(null);
    }
  };

  const openEditModal = (b: Budget) => {
    setEditItem(b);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Target Anggaran</h2>
          <p className="text-sm text-slate-500">Kendalikan nafsu belanja dengan menetapkan batas.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Pasang Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map(b => (
          <div key={b.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group hover:border-indigo-200 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Target className="w-6 h-6" /></div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{b.frequency ? getFrequencyFullLabel(b.frequency) : 'Bulanan'}</p>
                   <h4 className="text-lg font-bold text-slate-800">{b.category}</h4>
                </div>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEditModal(b)} className="text-slate-300 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => onDelete(b.id)} className="text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100">
               <span className="text-xs font-semibold text-slate-500">Batas:</span>
               <div className="text-right">
                 <span className="text-lg font-bold text-indigo-600">Rp {b.limit.toLocaleString('id-ID')}</span>
                 <span className="text-xs font-medium text-slate-400 ml-1">{getFrequencyLabel(b.frequency || 'MONTHLY')}</span>
               </div>
            </div>
          </div>
        ))}
        {budgets.length === 0 && <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl italic">Anggaran belum diatur. Klik tombol "Pasang Budget" untuk memulai.</div>}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Atur Anggaran Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kategori Pengeluaran</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none cursor-pointer text-slate-900">
                  {expenseCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Limit (Rp)</label>
                  <input type="number" required value={limit} onChange={(e) => setLimit(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 bg-slate-50" placeholder="0" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Periode</label>
                  <select value={frequency} onChange={(e) => setFrequency(e.target.value as BudgetFrequency)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none cursor-pointer text-slate-900">
                    <option value="DAILY">Harian</option>
                    <option value="WEEKLY">Mingguan</option>
                    <option value="MONTHLY">Bulanan</option>
                    <option value="YEARLY">Tahunan</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">Pasang Target</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Edit Anggaran</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kategori Pengeluaran</label>
                <select value={editItem.category} onChange={(e) => setEditItem({...editItem, category: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none cursor-pointer text-slate-900">
                  {expenseCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Limit (Rp)</label>
                  <input type="number" required value={editItem.limit} onChange={(e) => setEditItem({...editItem, limit: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 bg-slate-50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Periode</label>
                  <select value={editItem.frequency} onChange={(e) => setEditItem({...editItem, frequency: e.target.value as BudgetFrequency})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none cursor-pointer text-slate-900">
                    <option value="DAILY">Harian</option>
                    <option value="WEEKLY">Mingguan</option>
                    <option value="MONTHLY">Bulanan</option>
                    <option value="YEARLY">Tahunan</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;