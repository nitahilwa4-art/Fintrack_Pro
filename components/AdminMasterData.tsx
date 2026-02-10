
import React, { useState, useEffect } from 'react';
import { Category, INITIAL_CATEGORIES } from '../types';
import { Database, Plus, Trash2, Tag, CreditCard, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminMasterData: React.FC = () => {
  // Load initial data from localStorage or use defaults
  const [defaultCategories, setDefaultCategories] = useState<Omit<Category, 'id' | 'userId'>[]>(() => {
    const saved = localStorage.getItem('system_default_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [banks, setBanks] = useState<string[]>(() => {
    const saved = localStorage.getItem('system_banks');
    return saved ? JSON.parse(saved) : ['BCA', 'Mandiri', 'BNI', 'BRI', 'CIMB Niaga', 'Jago', 'GoPay', 'OVO', 'Dana'];
  });
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('EXPENSE');
  const [newBankName, setNewBankName] = useState('');

  // Delete states
  const [deleteCategoryName, setDeleteCategoryName] = useState<string | null>(null);
  const [deleteBankName, setDeleteBankName] = useState<string | null>(null);

  // Persist changes
  useEffect(() => {
    localStorage.setItem('system_default_categories', JSON.stringify(defaultCategories));
  }, [defaultCategories]);

  useEffect(() => {
    localStorage.setItem('system_banks', JSON.stringify(banks));
  }, [banks]);

  const handleAddCategory = () => {
    if (!newCatName) return;
    setDefaultCategories(prev => [...prev, { name: newCatName, type: newCatType as any, isDefault: true }]);
    toast.success('Kategori default berhasil ditambahkan');
    setNewCatName('');
  };

  const confirmDeleteCategory = () => {
    if(deleteCategoryName) {
        setDefaultCategories(prev => prev.filter(c => c.name !== deleteCategoryName));
        toast.success('Kategori dihapus');
        setDeleteCategoryName(null);
    }
  };

  const handleAddBank = () => {
    if (!newBankName) return;
    setBanks(prev => [...prev, newBankName]);
    toast.success('Bank/E-Wallet berhasil ditambahkan ke daftar master');
    setNewBankName('');
  };

  const confirmDeleteBank = () => {
    if(deleteBankName) {
        setBanks(prev => prev.filter(b => b !== deleteBankName));
        toast.success('Bank dihapus');
        setDeleteBankName(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
      
      {/* Category Master */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[500px] transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg"><Tag className="w-5 h-5" /></div>
            <h3 className="font-bold text-slate-800 dark:text-white">Master Kategori Default</h3>
          </div>
        </div>
        
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <input 
            value={newCatName} 
            onChange={(e) => setNewCatName(e.target.value)} 
            placeholder="Nama Kategori Baru" 
            className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm outline-none focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <select 
            value={newCatType} 
            onChange={(e) => setNewCatType(e.target.value)} 
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm outline-none text-slate-900 dark:text-white cursor-pointer"
          >
            <option value="EXPENSE">Pengeluaran</option>
            <option value="INCOME">Pemasukan</option>
          </select>
          <button onClick={handleAddCategory} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          <table className="w-full text-sm">
            <thead className="text-xs text-slate-400 uppercase font-bold bg-slate-50 dark:bg-slate-800 sticky top-0">
                <tr>
                    <th className="px-4 py-2 text-left">Nama</th>
                    <th className="px-4 py-2 text-left">Tipe</th>
                    <th className="px-4 py-2 text-center">Aksi</th>
                </tr>
            </thead>
            <tbody>
                {defaultCategories.map((c, idx) => (
                    <tr key={idx} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-200">{c.name}</td>
                        <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.type === 'INCOME' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>{c.type}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                            <button 
                                type="button" 
                                onClick={(e) => { e.stopPropagation(); setDeleteCategoryName(c.name); }} 
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Master */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[500px] transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><CreditCard className="w-5 h-5" /></div>
            <h3 className="font-bold text-slate-800 dark:text-white">Master Bank & E-Wallet</h3>
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <input 
            value={newBankName} 
            onChange={(e) => setNewBankName(e.target.value)} 
            placeholder="Nama Bank / E-Wallet Baru" 
            className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl text-sm outline-none focus:border-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button onClick={handleAddBank} className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
            <div className="flex flex-col gap-1">
                {banks.map((bank, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                        <span className="font-medium text-slate-700 dark:text-slate-200 ml-2">{bank}</span>
                        <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); setDeleteBankName(bank); }} 
                            className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      </div>

      {/* Delete Confirmation Modal for Categories */}
      {deleteCategoryName && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setDeleteCategoryName(null)}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-pop-in border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Hapus Kategori?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 px-4">
              Apakah Anda yakin ingin menghapus kategori "{deleteCategoryName}" dari daftar default?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteCategoryName(null)} 
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDeleteCategory} 
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal for Banks */}
      {deleteBankName && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setDeleteBankName(null)}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-pop-in border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Hapus Bank?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 px-4">
              Apakah Anda yakin ingin menghapus "{deleteBankName}" dari daftar master?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteBankName(null)} 
                className="flex-1 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={confirmDeleteBank} 
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminMasterData;
