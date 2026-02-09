import React, { useState } from 'react';
import { Budget, CATEGORIES } from '../types';
import { Target, Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface BudgetManagerProps {
  budgets: Budget[];
  onAdd: (b: Budget) => void;
  onDelete: (id: string) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, onAdd, onDelete }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORIES.EXPENSE[0]);
  const [limit, setLimit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: uuidv4(), userId: '', category, limit: parseFloat(limit), period: new Date().toISOString().slice(0, 7) });
    setLimit(''); setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Target Anggaran</h2>
          <p className="text-sm text-slate-500">Kendalikan nafsu belanja dengan menetapkan batas.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100">
          <Plus className="w-4 h-4 mr-2" /> Pasang Budget
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map(b => (
          <div key={b.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Target className="w-6 h-6" /></div>
              <button onClick={() => onDelete(b.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Batas Maksimal</p>
            <h4 className="text-lg font-bold text-slate-800">{b.category}</h4>
            <p className="text-xl font-bold text-indigo-600 mt-1">Rp {b.limit.toLocaleString('id-ID')}</p>
          </div>
        ))}
        {budgets.length === 0 && <div className="col-span-full py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl italic">Anggaran belum diatur. Klik tombol "Pasang Budget" untuk memulai.</div>}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Atur Anggaran Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Kategori Pengeluaran</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50">
                  {CATEGORIES.EXPENSE.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Limit Bulanan (Rp)</label>
                <input type="number" required value={limit} onChange={(e) => setLimit(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="0" />
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100">Pasang Target</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManager;