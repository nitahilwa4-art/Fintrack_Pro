
import React, { useState } from 'react';
import { Transaction, User } from '../types';
import { getUsers } from '../services/authService';
import { Filter, Flag, ArrowDownUp, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminTransactionsProps {
  allTransactions: Transaction[];
}

const AdminTransactions: React.FC<AdminTransactionsProps> = ({ allTransactions }) => {
  const users = getUsers();
  const [filter, setFilter] = useState<'ALL' | 'HIGH_VALUE' | 'FLAGGED'>('ALL');
  const [search, setSearch] = useState('');

  // Helper to map userId to Name
  const getUserName = (userId: string) => {
    const u = users.find(u => u.id === userId);
    return u ? u.name : 'Unknown User';
  };

  const filteredData = allTransactions
    .filter(t => {
      const userName = getUserName(t.userId).toLowerCase();
      return t.description.toLowerCase().includes(search.toLowerCase()) || userName.includes(search.toLowerCase());
    })
    .filter(t => {
      if (filter === 'HIGH_VALUE') return t.amount > 100000000; // > 100 Juta
      if (filter === 'FLAGGED') return t.isFlagged;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 50); // Live feed limit

  const handleFlag = (t: Transaction) => {
    toast.success(`Transaksi ${t.description} ditandai untuk ditinjau`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
          <ArrowDownUp className="w-5 h-5 mr-2 text-indigo-500" />
          Live Monitoring (50 Terbaru)
        </h3>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Cari user/transaksi..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
             />
          </div>
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-colors cursor-pointer"
          >
            <option value="ALL">Semua Transaksi</option>
            <option value="HIGH_VALUE">Nominal Besar (>100jt)</option>
            <option value="FLAGGED">Perlu Ditinjau</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Detail</th>
              <th className="px-6 py-4 text-right">Jumlah</th>
              <th className="px-6 py-4 text-center">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredData.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-slate-400">Tidak ada transaksi yang cocok.</td></tr>
            ) : (
                filteredData.map(t => (
                <tr key={t.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${t.amount > 100000000 ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                    <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-white text-sm">{getUserName(t.userId)}</p>
                    <p className="text-xs text-slate-400 font-mono">{t.userId.substring(0,8)}</p>
                    </td>
                    <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="font-medium text-slate-700 dark:text-slate-200 text-sm">{t.description}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t.date} • <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] uppercase font-bold">{t.type}</span> • {t.category}
                        </span>
                    </div>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-sm ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => handleFlag(t)}
                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                        title="Tandai Transaksi"
                    >
                        <Flag className="w-4 h-4" />
                    </button>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactions;
