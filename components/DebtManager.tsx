import React, { useState } from 'react';
import { Debt } from '../types';
import { HandCoins, Plus, Trash2, CheckCircle2, Receipt, CalendarClock, Edit2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface DebtManagerProps {
  debts: Debt[];
  onAdd: (d: Debt) => void;
  onDelete: (id: string) => void;
  onTogglePaid: (id: string) => void;
  onEdit: (d: Debt) => void;
}

const DebtManager: React.FC<DebtManagerProps> = ({ debts, onAdd, onDelete, onTogglePaid, onEdit }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Add Form
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<'DEBT' | 'RECEIVABLE' | 'BILL'>('BILL');

  // Edit Form
  const [editItem, setEditItem] = useState<Debt | null>(null);

  const totalDebt = debts.filter(d => d.type === 'DEBT' && !d.isPaid).reduce((acc, d) => acc + d.amount, 0);
  const totalReceivable = debts.filter(d => d.type === 'RECEIVABLE' && !d.isPaid).reduce((acc, d) => acc + d.amount, 0);
  const totalBills = debts.filter(d => d.type === 'BILL' && !d.isPaid).reduce((acc, d) => acc + d.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: uuidv4(), userId: '', person, amount: parseFloat(amount), description, dueDate, type, isPaid: false });
    setPerson(''); setAmount(''); setDueDate(''); setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      onEdit(editItem);
      setIsEditOpen(false);
      setEditItem(null);
    }
  };

  const openEditModal = (d: Debt) => {
    setEditItem(d);
    setIsEditOpen(true);
  };

  const getCardIcon = (dType: string) => {
    if (dType === 'BILL') return <Receipt className="w-6 h-6" />;
    if (dType === 'DEBT') return <HandCoins className="w-6 h-6" />;
    return <HandCoins className="w-6 h-6 transform rotate-180" />;
  }

  const getCardStyle = (dType: string) => {
    if (dType === 'BILL') return 'bg-orange-100 text-orange-600';
    if (dType === 'DEBT') return 'bg-red-100 text-red-600';
    return 'bg-emerald-100 text-emerald-600';
  }

  const getTypeLabel = (dType: string) => {
    if (dType === 'BILL') return 'Tagihan Rutin';
    if (dType === 'DEBT') return 'Hutang Ke';
    return 'Piutang Dari';
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-2xl">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><Receipt className="w-4 h-4" /></div>
             <p className="text-orange-500 text-[10px] font-bold uppercase tracking-widest">Total Tagihan</p>
           </div>
           <h3 className="text-2xl font-bold text-orange-700">Rp {totalBills.toLocaleString('id-ID')}</h3>
        </div>
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-red-100 rounded-lg text-red-600"><HandCoins className="w-4 h-4" /></div>
             <p className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Hutang (Saya Berhutang)</p>
           </div>
           <h3 className="text-2xl font-bold text-red-700">Rp {totalDebt.toLocaleString('id-ID')}</h3>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl">
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><HandCoins className="w-4 h-4 transform rotate-180" /></div>
             <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Piutang (Orang Berhutang)</p>
           </div>
           <h3 className="text-2xl font-bold text-emerald-700">Rp {totalReceivable.toLocaleString('id-ID')}</h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
           <h3 className="text-lg font-bold text-slate-800">Daftar Tagihan & Pinjaman</h3>
           <p className="text-sm text-slate-500">Kelola tagihan bulanan dan catatan hutang piutang.</p>
        </div>
        <button onClick={() => { setType('BILL'); setIsAddOpen(true); }} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Tambah Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {debts.map(d => (
          <div key={d.id} className={`p-5 rounded-2xl border bg-white shadow-sm relative group flex items-start space-x-4 ${d.isPaid ? 'opacity-50 grayscale' : ''}`}>
             <div className={`p-3 rounded-xl ${getCardStyle(d.type)}`}>
                {getCardIcon(d.type)}
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-start">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{getTypeLabel(d.type)}</p>
                   <div className="flex space-x-1">
                      <button 
                        onClick={() => onTogglePaid(d.id)} 
                        title={d.isPaid ? "Tandai Belum Lunas" : "Tandai Lunas"}
                        className={`p-1.5 rounded-lg transition-all ${d.isPaid ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEditModal(d)} className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => onDelete(d.id)} className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                   </div>
                </div>
                <h4 className="text-base font-bold text-slate-800">{d.person}</h4>
                <p className="text-lg font-bold text-indigo-700 mt-1">Rp {d.amount.toLocaleString('id-ID')}</p>
                <div className="flex items-center justify-between mt-3">
                   <p className="text-xs text-slate-500 italic truncate max-w-[150px]">{d.description}</p>
                   <div className="flex items-center text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                     <CalendarClock className="w-3 h-3 mr-1" />
                     {d.dueDate}
                   </div>
                </div>
             </div>
          </div>
        ))}
        {debts.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <Receipt className="w-10 h-10 mb-2 opacity-20" />
            <p>Belum ada data tagihan atau hutang.</p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Tambah Catatan Baru</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button type="button" onClick={() => setType('BILL')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${type === 'BILL' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>TAGIHAN</button>
                <button type="button" onClick={() => setType('DEBT')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${type === 'DEBT' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}>HUTANG</button>
                <button type="button" onClick={() => setType('RECEIVABLE')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${type === 'RECEIVABLE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>PIUTANG</button>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {type === 'BILL' ? 'Nama Layanan (Cth: Listrik, Netflix)' : 'Nama Orang'}
                </label>
                <input type="text" required value={person} onChange={(e) => setPerson(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder={type === 'BILL' ? "PLN" : "John Doe"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Jumlah (Rp)</label>
                  <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder="0" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Jatuh Tempo</label>
                  <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Keterangan Tambahan</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" placeholder={type === 'BILL' ? "Tagihan bulan ini" : "Pinjaman mendesak"} />
              </div>
              <div className="flex space-x-3 pt-6">
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
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Edit Catatan</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button type="button" onClick={() => setEditItem({...editItem, type: 'BILL'})} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${editItem.type === 'BILL' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>TAGIHAN</button>
                <button type="button" onClick={() => setEditItem({...editItem, type: 'DEBT'})} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${editItem.type === 'DEBT' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}>HUTANG</button>
                <button type="button" onClick={() => setEditItem({...editItem, type: 'RECEIVABLE'})} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${editItem.type === 'RECEIVABLE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>PIUTANG</button>
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  {editItem.type === 'BILL' ? 'Nama Layanan' : 'Nama Orang'}
                </label>
                <input type="text" required value={editItem.person} onChange={(e) => setEditItem({...editItem, person: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Jumlah (Rp)</label>
                  <input type="number" required value={editItem.amount} onChange={(e) => setEditItem({...editItem, amount: parseFloat(e.target.value) || 0})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Jatuh Tempo</label>
                  <input type="date" required value={editItem.dueDate} onChange={(e) => setEditItem({...editItem, dueDate: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Keterangan Tambahan</label>
                <input type="text" value={editItem.description} onChange={(e) => setEditItem({...editItem, description: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtManager;