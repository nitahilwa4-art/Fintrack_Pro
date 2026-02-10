import React, { useState } from 'react';
import { Category, TransactionType } from '../types';
import { Tag, Plus, Trash2, Edit2, Lock, ArrowRightLeft, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface CategoryManagerProps {
  categories: Category[];
  onAdd: (c: Category) => void;
  onDelete: (id: string) => void;
  onEdit: (c: Category) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onAdd, onDelete, onEdit }) => {
  const [activeTab, setActiveTab] = useState<TransactionType>('EXPENSE');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Add Form
  const [name, setName] = useState('');
  
  // Edit Form
  const [editItem, setEditItem] = useState<Category | null>(null);

  const filteredCategories = categories.filter(c => c.type === activeTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ 
      id: uuidv4(), 
      userId: '', // handled by App.tsx
      name, 
      type: activeTab, 
      isDefault: false 
    });
    toast.success('Kategori baru ditambahkan');
    setName(''); 
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      onEdit(editItem);
      toast.success('Kategori diperbarui');
      setIsEditOpen(false);
      setEditItem(null);
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      toast.success('Kategori dihapus');
      setDeleteId(null);
    }
  };

  const openEditModal = (c: Category) => {
    setEditItem(c);
    setIsEditOpen(true);
  };

  const getTabColor = (tab: TransactionType) => {
    if (tab === 'INCOME') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (tab === 'EXPENSE') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
  }

  const getTabIcon = (tab: TransactionType) => {
    if (tab === 'INCOME') return <TrendingUp className="w-4 h-4 mr-2" />;
    if (tab === 'EXPENSE') return <TrendingDown className="w-4 h-4 mr-2" />;
    return <ArrowRightLeft className="w-4 h-4 mr-2" />;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ... (Existing List Code) ... */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Kategori</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sesuaikan kategori transaksi agar lebih personal.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Kategori Baru
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-fit">
        {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map(type => (
           <button
             key={type}
             onClick={() => setActiveTab(type)}
             className={`flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === type ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
           >
             {getTabIcon(type)}
             {type === 'EXPENSE' ? 'PENGELUARAN' : type === 'INCOME' ? 'PEMASUKAN' : 'TRANSFER'}
           </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map(c => (
          <div key={c.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors animate-pop-in">
            <div className="flex items-center gap-3">
               <div className={`p-2 rounded-lg ${getTabColor(c.type)}`}>
                 <Tag className="w-4 h-4" />
               </div>
               <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">{c.name}</h4>
                  {c.isDefault && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium">Default</span>}
               </div>
            </div>
            
            <div className="flex items-center gap-1">
               {c.isDefault ? (
                  <div className="p-2 text-slate-300 dark:text-slate-600" title="Kategori default tidak dapat diubah">
                    <Lock className="w-4 h-4" />
                  </div>
               ) : (
                 <>
                   <button onClick={(e) => { e.stopPropagation(); openEditModal(c); }} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all hover:scale-110">
                     <Edit2 className="w-4 h-4" />
                   </button>
                   <button onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); }} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setDeleteId(null)}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-pop-in border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Hapus Kategori?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 px-4">
              Yakin ingin menghapus kategori ini? Transaksi lama dengan kategori ini tidak akan terhapus.
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

      {/* Add/Edit Modals (Unchanged content) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setIsAddOpen(false)}></div>
          <div className="relative w-full max-w-md glass-card rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in">
            {/* ... Content ... */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10"></div>
            <div className="p-5 pb-0 shrink-0">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center">Tambah Kategori {activeTab === 'INCOME' ? 'Pemasukan' : activeTab === 'EXPENSE' ? 'Pengeluaran' : 'Transfer'}</h3>
            </div>
            <div className="p-5 pt-4 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Nama Kategori</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="Contoh: Freelance, Hobi, Sedekah" />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors active:scale-95">Simpan</button>
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
            {/* ... Content ... */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10"></div>
            <div className="p-5 pb-0 shrink-0">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center">Edit Kategori</h3>
            </div>
            <div className="p-5 pt-4 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Nama Kategori</label>
                  <input type="text" required value={editItem.name} onChange={(e) => setEditItem({...editItem, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors active:scale-95">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;