import React, { useState } from 'react';
import { Asset } from '../types';
import { Gem, Plus, Trash2, TrendingUp } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AssetManagerProps {
  assets: Asset[];
  onAdd: (a: Asset) => void;
  onDelete: (id: string) => void;
}

const AssetManager: React.FC<AssetManagerProps> = ({ assets, onAdd, onDelete }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [type, setType] = useState<Asset['type']>('GOLD');

  const totalAssets = assets.reduce((acc, a) => acc + a.value, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: uuidv4(), userId: '', name, value: parseFloat(value), type });
    setName(''); setValue(''); setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <TrendingUp className="absolute right-[-20px] bottom-[-20px] w-64 h-64 opacity-10" />
        <p className="text-indigo-100 font-medium mb-1 opacity-80 uppercase tracking-widest text-xs">Nilai Portofolio Aset</p>
        <h2 className="text-4xl font-bold">Rp {totalAssets.toLocaleString('id-ID')}</h2>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-800">Daftar Aset & Investasi</h3>
        <button onClick={() => setIsAddOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100">
          <Plus className="w-4 h-4 mr-2" /> Tambah Aset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map(a => (
          <div key={a.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Gem className="w-6 h-6" /></div>
              <button onClick={() => onDelete(a.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{a.type}</p>
            <h4 className="text-lg font-bold text-slate-800">{a.name}</h4>
            <p className="text-xl font-bold text-indigo-600 mt-2">Rp {a.value.toLocaleString('id-ID')}</p>
          </div>
        ))}
        {assets.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
            Belum ada aset terdaftar. Mulai catat investasi Anda hari ini!
          </div>
        )}
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Tambah Aset Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nama Aset</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="Emas Antam 10g" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Nilai Saat Ini (Rp)</label>
                  <input type="number" required value={value} onChange={(e) => setValue(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tipe Aset</label>
                  <select value={type} onChange={(e) => setType(e.target.value as any)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50">
                    <option value="GOLD">Emas</option>
                    <option value="STOCK">Saham/Reksadana</option>
                    <option value="CRYPTO">Crypto</option>
                    <option value="PROPERTY">Properti</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsAddOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100">Simpan Aset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManager;