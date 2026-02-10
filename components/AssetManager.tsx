import React, { useState } from 'react';
import { Asset } from '../types';
import { Gem, Plus, Trash2, TrendingUp, Edit2, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

interface AssetManagerProps {
  assets: Asset[];
  onAdd: (a: Asset) => void;
  onDelete: (id: string) => void;
  onEdit: (a: Asset) => void;
}

const AssetManager: React.FC<AssetManagerProps> = ({ assets, onAdd, onDelete, onEdit }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Add Form
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<Asset['type']>('GOLD');

  // Edit Form
  const [editItem, setEditItem] = useState<{ a: Asset, valueStr: string } | null>(null);

  // Helper
  const handleAmountChange = (val: string, setter: (v: string) => void) => {
    const rawValue = val.replace(/\D/g, '');
    if (!rawValue) { setter(''); return; }
    setter(parseInt(rawValue).toLocaleString('id-ID'));
  };

  const parseAmount = (val: string) => parseFloat(val.replace(/\./g, '')) || 0;

  const totalAssets = assets.reduce((acc, a) => acc + a.value, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: uuidv4(), userId: '', name, value: parseAmount(value), type });
    toast.success('Aset berhasil ditambahkan');
    setName(''); setValue(''); setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      onEdit({ ...editItem.a, value: parseAmount(editItem.valueStr) });
      toast.success('Aset berhasil diperbarui');
      setIsEditOpen(false);
      setEditItem(null);
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      toast.success('Aset dihapus');
      setDeleteId(null);
    }
  };

  const openEditModal = (a: Asset) => {
    setEditItem({ a: { ...a }, valueStr: a.value.toLocaleString('id-ID') });
    setIsEditOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <TrendingUp className="absolute right-[-20px] bottom-[-20px] w-64 h-64 opacity-10 group-hover:scale-110 transition-transform duration-700" />
        <p className="text-indigo-100 font-medium mb-1 opacity-80 uppercase tracking-widest text-xs">Nilai Portofolio Aset</p>
        <h2 className="text-4xl font-bold animate-fade-in-up">Rp {totalAssets.toLocaleString('id-ID')}</h2>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Daftar Aset & Investasi</h3>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Tambah Aset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((a, idx) => (
          <div key={a.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative group hover:border-indigo-200 dark:hover:border-indigo-800 transition-all hover:shadow-lg animate-pop-in" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl"><Gem className="w-6 h-6" /></div>
              <div className="flex space-x-1">
                <button onClick={(e) => { e.stopPropagation(); openEditModal(a); }} className="text-slate-300 hover:text-indigo-600 p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all hover:scale-110"><Edit2 className="w-4 h-4" /></button>
                <button onClick={(e) => { e.stopPropagation(); setDeleteId(a.id); }} className="text-slate-300 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{a.type}</p>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">{a.name}</h4>
            <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">Rp {a.value.toLocaleString('id-ID')}</p>
          </div>
        ))}
        {assets.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse">
            Belum ada aset terdaftar. Mulai catat investasi Anda hari ini!
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setDeleteId(null)}></div>
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl animate-pop-in border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 mb-4 mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Hapus Aset?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 px-4">
              Apakah Anda yakin ingin menghapus data aset ini dari portofolio?
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
               <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center">Tambah Aset Baru</h3>
            </div>
            <div className="p-5 pt-4 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Nama Aset</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="Emas Antam 10g" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Nilai Saat Ini (Rp)</label>
                    <input type="text" required value={value} onChange={(e) => handleAmountChange(e.target.value, setValue)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Tipe Aset</label>
                    <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 outline-none cursor-pointer font-medium text-slate-900 dark:text-white">
                      <option value="GOLD">Emas</option>
                      <option value="STOCK">Saham/Reksadana</option>
                      <option value="CRYPTO">Crypto</option>
                      <option value="PROPERTY">Properti</option>
                      <option value="OTHER">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-transform">Simpan Aset</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Unchanged content) */}
      {isEditOpen && editItem && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setIsEditOpen(false)}></div>
          <div className="relative w-full max-w-md glass-card rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in">
            {/* ... Content ... */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10"></div>
            <div className="p-5 pb-0 shrink-0">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center">Edit Aset</h3>
            </div>
            <div className="p-5 pt-4 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Nama Aset</label>
                  <input type="text" required value={editItem.a.name} onChange={(e) => setEditItem({...editItem, a: {...editItem.a, name: e.target.value}})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Nilai Saat Ini (Rp)</label>
                    <input type="text" required value={editItem.valueStr} onChange={(e) => handleAmountChange(e.target.value, (val) => setEditItem({...editItem, valueStr: val}))} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Tipe Aset</label>
                    <select value={editItem.a.type} onChange={(e) => setEditItem({...editItem, a: {...editItem.a, type: e.target.value as any}})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm bg-slate-50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-800 outline-none cursor-pointer font-medium text-slate-900 dark:text-white">
                      <option value="GOLD">Emas</option>
                      <option value="STOCK">Saham/Reksadana</option>
                      <option value="CRYPTO">Crypto</option>
                      <option value="PROPERTY">Properti</option>
                      <option value="OTHER">Lainnya</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 transition-transform">Simpan Perubahan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManager;