import React, { useState } from 'react';
import { Transaction, TransactionType, Category, Wallet } from '../types';
import { Search, Filter, Trash2, ArrowDownUp, Download, Wallet as WalletIcon, Calendar, X, Edit2, ArrowRightLeft } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  onDelete: (id: string) => void;
  onEdit: (t: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, wallets, categories, onDelete, onEdit }) => {
  const [filterType, setFilterType] = useState<TransactionType | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Transaction | null>(null);

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
    const headers = ['Tanggal', 'Deskripsi', 'Tipe', 'Kategori', 'Jumlah', 'Dompet Asal', 'Dompet Tujuan'];
    const rows = filteredTransactions.map(t => [
      t.date, 
      `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
      t.type, 
      t.category, 
      t.amount, 
      wallets.find(w => w.id === t.walletId)?.name || 'Unknown',
      t.toWalletId ? (wallets.find(w => w.id === t.toWalletId)?.name || 'Unknown') : '-'
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

  const openEditModal = (t: Transaction) => {
    setEditItem(t);
    setIsEditOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      if (editItem.type === 'TRANSFER' && editItem.walletId === editItem.toWalletId) {
        alert('Dompet tujuan tidak boleh sama dengan dompet asal!');
        return;
      }
      onEdit(editItem);
      setIsEditOpen(false);
      setEditItem(null);
    }
  };

  const getCategories = (type: TransactionType) => {
    return categories.filter(c => c.type === type);
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-140px)]">
        <div className="p-4 border-b border-slate-100 space-y-4 bg-white sticky top-0 z-10">
          
          {/* Row 1: Search & Export */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400" 
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
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-900"
              >
                <option value="ALL">Semua Tipe</option>
                <option value="INCOME">Pemasukan</option>
                <option value="EXPENSE">Pengeluaran</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-2 w-full md:flex-1">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input 
                  type="date" 
                  className="w-full pl-9 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
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
                  className="w-full pl-9 pr-2 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
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
                          <WalletIcon className="w-3 h-3 mr-1" /> 
                          {wallets.find(w => w.id === t.walletId)?.name || 'Unknown'}
                          {t.type === 'TRANSFER' && (
                            <>
                              <ArrowRightLeft className="w-3 h-3 mx-1" />
                              {wallets.find(w => w.id === t.toWalletId)?.name || 'Unknown'}
                            </>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-emerald-600' : t.type === 'TRANSFER' ? 'text-blue-600' : 'text-red-600'}`}>
                      {t.type === 'INCOME' ? '+' : t.type === 'TRANSFER' ? '→' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openEditModal(t)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDelete(t.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Hapus">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditOpen && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/50">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Edit Transaksi</h3>
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                <button type="button" onClick={() => setEditItem({ ...editItem, type: 'INCOME', category: getCategories('INCOME')[0]?.name || '', toWalletId: undefined })} className={`flex-1 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${editItem.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>MASUK</button>
                <button type="button" onClick={() => setEditItem({ ...editItem, type: 'EXPENSE', category: getCategories('EXPENSE')[0]?.name || '', toWalletId: undefined })} className={`flex-1 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${editItem.type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>KELUAR</button>
                <button type="button" onClick={() => setEditItem({ ...editItem, type: 'TRANSFER', category: getCategories('TRANSFER')[0]?.name || '', toWalletId: wallets.find(w => w.id !== editItem.walletId)?.id })} className={`flex-1 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${editItem.type === 'TRANSFER' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>TRANSFER</button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">
                  {editItem.type === 'TRANSFER' ? 'Dari Dompet' : 'Dompet'}
                </label>
                <select value={editItem.walletId} onChange={(e) => setEditItem({ ...editItem, walletId: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer font-medium text-slate-900">
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(w.balance)})</option>)}
                </select>
              </div>

              {editItem.type === 'TRANSFER' && (
                <div className="relative animate-in slide-in-from-top-2">
                   <div className="absolute left-1/2 -top-3 transform -translate-x-1/2 bg-white p-1 rounded-full border border-slate-100 text-slate-400 z-10">
                    <ArrowDownUp className="w-4 h-4" />
                  </div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Ke Dompet</label>
                  <select value={editItem.toWalletId || ''} onChange={(e) => setEditItem({ ...editItem, toWalletId: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer font-medium text-slate-900">
                    {wallets.filter(w => w.id !== editItem.walletId).map(w => <option key={w.id} value={w.id}>{w.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(w.balance)})</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Jumlah</label>
                  <input type="number" required value={editItem.amount} onChange={(e) => setEditItem({ ...editItem, amount: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold text-slate-900 bg-slate-50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Kategori</label>
                  <select value={editItem.category} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none font-medium text-slate-900">
                    {getCategories(editItem.type).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Deskripsi</label>
                <input type="text" required value={editItem.description} onChange={(e) => setEditItem({ ...editItem, description: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-900 bg-slate-50" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Tanggal</label>
                <input type="date" required value={editItem.date} onChange={(e) => setEditItem({ ...editItem, date: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-900 bg-slate-50" />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionList;