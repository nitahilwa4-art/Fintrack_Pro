import React, { useState } from 'react';
import { Category, TransactionType } from '../types';
import { Tag, Plus, Trash2, Edit2, Lock, ArrowRightLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

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
    setName(''); 
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

  const openEditModal = (c: Category) => {
    setEditItem(c);
    setIsEditOpen(true);
  };

  const getTabColor = (tab: TransactionType) => {
    if (tab === 'INCOME') return 'bg-emerald-100 text-emerald-700';
    if (tab === 'EXPENSE') return 'bg-red-100 text-red-700';
    return 'bg-blue-100 text-blue-700';
  }

  const getTabIcon = (tab: TransactionType) => {
    if (tab === 'INCOME') return <TrendingUp className="w-4 h-4 mr-2" />;
    if (tab === 'EXPENSE') return <TrendingDown className="w-4 h-4 mr-2" />;
    return <ArrowRightLeft className="w-4 h-4 mr-2" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Manajemen Kategori</h2>
          <p className="text-sm text-slate-500">Sesuaikan kategori transaksi agar lebih personal.</p>
        </div>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Kategori Baru
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl w-full md:w-fit">
        {(['EXPENSE', 'INCOME', 'TRANSFER'] as const).map(type => (
           <button
             key={type}
             onClick={() => setActiveTab(type)}
             className={`flex-1 md:flex-none flex items-center justify-center px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${activeTab === type ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
           >
             {getTabIcon(type)}
             {type === 'EXPENSE' ? 'PENGELUARAN' : type === 'INCOME' ? 'PEMASUKAN' : 'TRANSFER'}
           </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-3">
               <div className={`p-2 rounded-lg ${getTabColor(c.type)}`}>
                 <Tag className="w-4 h-4" />
               </div>
               <div>
                  <h4 className="font-bold text-slate-800">{c.name}</h4>
                  {c.isDefault && <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-medium">Default</span>}
               </div>
            </div>
            
            <div className="flex items-center gap-1">
               {c.isDefault ? (
                  <div className="p-2 text-slate-300" title="Kategori default tidak dapat diubah">
                    <Lock className="w-4 h-4" />
                  </div>
               ) : (
                 <>
                   <button onClick={() => openEditModal(c)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                     <Edit2 className="w-4 h-4" />
                   </button>
                   <button onClick={() => onDelete(c.id)} className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                     <Trash2 className="w-4 h-4" />
                   </button>
                 </>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Tambah Kategori {activeTab === 'INCOME' ? 'Pemasukan' : activeTab === 'EXPENSE' ? 'Pengeluaran' : 'Transfer'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Kategori</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Contoh: Freelance, Hobi, Sedekah" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Edit Kategori</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Kategori</label>
                <input type="text" required value={editItem.name} onChange={(e) => setEditItem({...editItem, name: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;