import React, { useState } from 'react';
import { Transaction, TransactionType, Category, Wallet } from '../types';
import { Search, Filter, Trash2, ArrowDownUp, Download, Wallet as WalletIcon, Calendar, X, Edit2, ArrowRightLeft, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<{ t: Transaction, amountStr: string } | null>(null);

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
    toast.success('Laporan berhasil diexport!');
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
  };

  const openEditModal = (t: Transaction) => {
    setEditItem({ t: { ...t }, amountStr: t.amount.toLocaleString('id-ID') });
    setIsEditOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      toast.success('Transaksi dihapus');
      setDeleteId(null);
    }
  };

  const handleEditAmountChange = (val: string) => {
     if(!editItem) return;
     const rawValue = val.replace(/\D/g, '');
     if(!rawValue) {
        setEditItem({ ...editItem, amountStr: '' });
        return;
     }
     setEditItem({ ...editItem, amountStr: parseInt(rawValue).toLocaleString('id-ID') });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      if (editItem.t.type === 'TRANSFER' && editItem.t.walletId === editItem.t.toWalletId) {
        toast.error('Dompet tujuan tidak boleh sama dengan dompet asal!');
        return;
      }
      const parsedAmount = parseFloat(editItem.amountStr.replace(/\./g, '')) || 0;
      onEdit({ ...editItem.t, amount: parsedAmount });
      toast.success('Transaksi berhasil diperbarui');
      setIsEditOpen(false);
      setEditItem(null);
    }
  };

  const getCategories = (type: TransactionType) => {
    return categories.filter(c => c.type === type);
  }

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-140px)] transition-all animate-fade-in-up">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 transition-colors">
          
          {/* Row 1: Search & Export */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:flex-1 group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-indigo-500" />
              <input 
                type="text" 
                placeholder="Cari transaksi..." 
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
            </div>
            <button onClick={exportCSV} className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 transition-all hover:scale-105 active:scale-95">
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
                className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer text-slate-900 dark:text-white hover:border-indigo-300 transition-colors"
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
                  className="w-full pl-9 pr-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white hover:border-indigo-300 transition-colors"
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
                  className="w-full pl-9 pr-2 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white hover:border-indigo-300 transition-colors"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="Sampai Tanggal"
                />
              </div>
              {(startDate || endDate) && (
                <button 
                  onClick={clearDateFilter}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors hover:scale-110"
                  title="Reset Tanggal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-md text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 sticky top-0 transition-colors z-0">
              <tr>
                <th className="px-6 py-4">Info</th>
                <th className="px-6 py-4">Kategori & Dompet</th>
                <th className="px-6 py-4 text-right">Jumlah</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center animate-pop-in">
                      <ArrowDownUp className="w-12 h-12 mb-2 opacity-20" />
                      <p>Tidak ada transaksi ditemukan</p>
                      {(startDate || endDate) && <p className="text-xs mt-2 text-slate-300">Coba atur ulang filter tanggal</p>}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, idx) => (
                  <tr 
                    key={t.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800 group transition-all duration-300 cursor-default animate-fade-in-up"
                    style={{ animationDelay: `${Math.min(idx * 30, 500)}ms`, animationFillMode: 'both' }}
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{t.description}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">{t.date}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold uppercase">{t.category}</span>
                        <span className="text-slate-300 dark:text-slate-600">•</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
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
                    <td className={`px-6 py-4 text-sm font-bold text-right ${t.type === 'INCOME' ? 'text-emerald-600 dark:text-emerald-400' : t.type === 'TRANSFER' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === 'INCOME' ? '+' : t.type === 'TRANSFER' ? '→' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button onClick={(e) => { e.stopPropagation(); openEditModal(t); }} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all hover:scale-110" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteId(t.id); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110" title="Hapus">
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

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setDeleteId(null)}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-pop-in border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Hapus Transaksi?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 px-4">
              Data transaksi akan dihapus permanen dan saldo dompet akan disesuaikan kembali.
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

      {/* Edit Modal */}
      {isEditOpen && editItem && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative w-full max-w-md glass-card rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in">
            {/* ... Content ... */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10"></div>
            <div className="p-5 pb-0 shrink-0">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center">Edit Transaksi</h3>
            </div>
            
            <div className="p-5 pt-4 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                  <button type="button" onClick={() => setEditItem({ ...editItem, t: { ...editItem.t, type: 'INCOME', category: getCategories('INCOME')[0]?.name || '', toWalletId: undefined } })} className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 ${editItem.t.type === 'INCOME' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>MASUK</button>
                  <button type="button" onClick={() => setEditItem({ ...editItem, t: { ...editItem.t, type: 'EXPENSE', category: getCategories('EXPENSE')[0]?.name || '', toWalletId: undefined } })} className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 ${editItem.t.type === 'EXPENSE' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>KELUAR</button>
                  <button type="button" onClick={() => setEditItem({ ...editItem, t: { ...editItem.t, type: 'TRANSFER', category: getCategories('TRANSFER')[0]?.name || '', toWalletId: wallets.find(w => w.id !== editItem.t.walletId)?.id } })} className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 ${editItem.t.type === 'TRANSFER' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>TRANSFER</button>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">
                    {editItem.t.type === 'TRANSFER' ? 'Dari Dompet' : 'Dompet'}
                  </label>
                  <select value={editItem.t.walletId} onChange={(e) => setEditItem({ ...editItem, t: { ...editItem.t, walletId: e.target.value } })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer font-medium text-slate-900 dark:text-white">
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(w.balance)})</option>)}
                  </select>
                </div>

                {editItem.t.type === 'TRANSFER' && (
                  <div className="relative animate-scale-in">
                     <div className="absolute left-1/2 -top-3 transform -translate-x-1/2 bg-white dark:bg-slate-700 p-1.5 rounded-full border border-slate-100 dark:border-slate-600 text-slate-400 z-10 shadow-sm">
                      <ArrowDownUp className="w-4 h-4" />
                    </div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Ke Dompet</label>
                    <select value={editItem.t.toWalletId || ''} onChange={(e) => setEditItem({ ...editItem, t: { ...editItem.t, toWalletId: e.target.value } })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer font-medium text-slate-900 dark:text-white">
                      {wallets.filter(w => w.id !== editItem.t.walletId).map(w => <option key={w.id} value={w.id}>{w.name} ({new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(w.balance)})</option>)}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Jumlah</label>
                    <input type="text" required value={editItem.amountStr} onChange={(e) => handleEditAmountChange(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Kategori</label>
                    <select value={editItem.t.category} onChange={(e) => setEditItem({ ...editItem, t: { ...editItem.t, category: e.target.value } })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none font-medium text-slate-900 dark:text-white">
                      {getCategories(editItem.t.type).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Deskripsi</label>
                  <input type="text" required value={editItem.t.description} onChange={(e) => setEditItem({ ...editItem, t: { ...editItem.t, description: e.target.value } })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Tanggal</label>
                  <input type="date" required value={editItem.t.date} onChange={(e) => setEditItem({ ...editItem, t: { ...editItem.t, date: e.target.value } })} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform hover:-translate-y-0.5 hover:scale-105 active:scale-95">Simpan Perubahan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionList;