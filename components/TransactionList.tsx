import React, { useState } from 'react';
import { Transaction, TransactionType, CATEGORIES, Wallet } from '../types';
import { Search, Filter, Trash2, ArrowDownUp, Download, Wallet as WalletIcon, Calendar, X } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  wallets: Wallet[];
  onDelete: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, wallets, onDelete }) => {
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredTransactions = transactions
    .filter(t => filterType === 'ALL' || t.type === filterType)
    .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(t => {
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const exportCSV = () => {
    const headers = ['Tanggal', 'Deskripsi', 'Tipe', 'Kategori', 'Jumlah', 'Dompet'];
    const rows = filteredTransactions.map(t => [
      t.date, t.description, t.type, t.category, t.amount, wallets.find(w => w.id === t.walletId)?.name || 'Unknown'
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `fintrack_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      <div className="p-4 border-b border-slate-100 space-y-4 bg-white sticky top-0 z-10">
        
        {/* Row 1: Search & Export */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari transaksi..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <button onClick={exportCSV} className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-100 border border-emerald-100 transition-colors">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
        </div>

        {/* Row 2: Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Type Filter */}
          <div className="relative w-full md:w-48">
             <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
             <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
             >
               <option value="ALL">Semua Tipe</option>
               <option value="INCOME">Pemasukan</option>
               <option value="EXPENSE">Pengeluaran</option>
             </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex items-center gap-2 w-full md:flex-1">
            <div className="relative flex-1">
               <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
               <input 
                 type="date" 
                 className="w-full pl-9 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
                 value={startDate}
                 onChange={(e) => setStartDate(e.target.value)}
                 placeholder="Dari Tanggal"
               />
            </div>
            <span className="text-slate-400 text-sm font-medium">s/d</span>
            <div className="relative flex-1">
               <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
               <input 
                 type="date" 
                 className="w-full pl-9 pr-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-600"
                 value={endDate}
                 onChange={(e) => setEndDate(e.target.value)}
                 placeholder="Sampai Tanggal"
               />
            </div>
            {(startDate || endDate) && (
              <button 
                onClick={clearDateFilter}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Reset Tanggal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 sticky top-0">
            <tr>
              <th className="px-6 py-4">Info</th>
              <th className="px-6 py-4">Kategori & Dompet</th>
              <th className="px-6 py-4 text-right">Jumlah</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center">
                    <ArrowDownUp className="w-12 h-12 mb-2 opacity-20" />
                    <p>Tidak ada transaksi ditemukan</p>
                    {(startDate || endDate) && <p className="text-xs mt-2 text-slate-300">Coba atur ulang filter tanggal</p>}
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 group transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{t.description}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">{t.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold uppercase">{t.category}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 flex items-center">
                        <WalletIcon className="w-3 h-3 mr-1" /> {wallets.find(w => w.id === t.walletId)?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => onDelete(t.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
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

export default TransactionList;