import React, { useState } from 'react';
import { Debt } from '../types';
import { HandCoins, Plus, Trash2, CheckCircle2, Receipt, CalendarClock, Edit2, AlertTriangle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Add Form
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<'DEBT' | 'RECEIVABLE' | 'BILL'>('BILL');

  // Edit Form
  const [editItem, setEditItem] = useState<{ d: Debt, amountStr: string } | null>(null);

  // Helper
  const handleAmountChange = (val: string, setter: (v: string) => void) => {
    const rawValue = val.replace(/\D/g, '');
    if (!rawValue) { setter(''); return; }
    setter(parseInt(rawValue).toLocaleString('id-ID'));
  };

  const parseAmount = (val: string) => parseFloat(val.replace(/\./g, '')) || 0;

  const totalDebt = debts.filter(d => d.type === 'DEBT' && !d.isPaid).reduce((acc, d) => acc + d.amount, 0);
  const totalReceivable = debts.filter(d => d.type === 'RECEIVABLE' && !d.isPaid).reduce((acc, d) => acc + d.amount, 0);
  const totalBills = debts.filter(d => d.type === 'BILL' && !d.isPaid).reduce((acc, d) => acc + d.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ id: uuidv4(), userId: '', person, amount: parseAmount(amount), description, dueDate, type, isPaid: false });
    toast.success('Catatan berhasil ditambahkan');
    setPerson(''); setAmount(''); setDueDate(''); setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      onEdit({ ...editItem.d, amount: parseAmount(editItem.amountStr) });
      toast.success('Perubahan berhasil disimpan');
      setIsEditOpen(false);
      setEditItem(null);
    }
  };

  const confirmDelete = () => {
    if (deleteId) {
      onDelete(deleteId);
      toast.success('Item berhasil dihapus');
      setDeleteId(null);
    }
  };

  const handleTogglePaid = (id: string) => {
      onTogglePaid(id);
      toast.success('Status pembayaran diperbarui');
  }

  const openEditModal = (d: Debt) => {
    setEditItem({ d: { ...d }, amountStr: d.amount.toLocaleString('id-ID') });
    setIsEditOpen(true);
  };

  const getCardIcon = (dType: string) => {
    if (dType === 'BILL') return <Receipt className="w-6 h-6" />;
    if (dType === 'DEBT') return <HandCoins className="w-6 h-6" />;
    return <HandCoins className="w-6 h-6 transform rotate-180" />;
  }

  const getCardStyle = (dType: string) => {
    if (dType === 'BILL') return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
    if (dType === 'DEBT') return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
  }

  const getTypeLabel = (dType: string) => {
    if (dType === 'BILL') return 'Tagihan Rutin';
    if (dType === 'DEBT') return 'Hutang Ke';
    return 'Piutang Dari';
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-orange-50 dark:bg-slate-900 border border-orange-100 dark:border-slate-800 p-6 rounded-2xl animate-pop-in" style={{ animationDelay: '0ms' }}>
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400"><Receipt className="w-4 h-4" /></div>
             <p className="text-orange-500 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest">Total Tagihan</p>
           </div>
           <h3 className="text-2xl font-bold text-orange-700 dark:text-orange-400">Rp {totalBills.toLocaleString('id-ID')}</h3>
        </div>
        <div className="bg-red-50 dark:bg-slate-900 border border-red-100 dark:border-slate-800 p-6 rounded-2xl animate-pop-in" style={{ animationDelay: '100ms' }}>
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400"><HandCoins className="w-4 h-4" /></div>
             <p className="text-red-500 dark:text-red-400 text-[10px] font-bold uppercase tracking-widest">Hutang (Saya Berhutang)</p>
           </div>
           <h3 className="text-2xl font-bold text-red-700 dark:text-red-400">Rp {totalDebt.toLocaleString('id-ID')}</h3>
        </div>
        <div className="bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 p-6 rounded-2xl animate-pop-in" style={{ animationDelay: '200ms' }}>
           <div className="flex items-center gap-3 mb-2">
             <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400"><HandCoins className="w-4 h-4 transform rotate-180" /></div>
             <p className="text-emerald-500 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest">Piutang (Orang Berhutang)</p>
           </div>
           <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">Rp {totalReceivable.toLocaleString('id-ID')}</h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
           <h3 className="text-lg font-bold text-slate-800 dark:text-white">Daftar Tagihan & Pinjaman</h3>
           <p className="text-sm text-slate-500 dark:text-slate-400">Kelola tagihan bulanan dan catatan hutang piutang.</p>
        </div>
        <button onClick={() => { setType('BILL'); setIsAddOpen(true); }} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95">
          <Plus className="w-4 h-4 mr-2" /> Tambah Baru
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {debts.map((d, idx) => (
          <div 
            key={d.id} 
            onClick={() => openEditModal(d)}
            className={`p-5 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm relative group flex items-start space-x-4 animate-fade-in-up hover:shadow-md transition-all dark:border-slate-800 cursor-pointer ${d.isPaid ? 'opacity-50 grayscale' : ''}`} 
            style={{ animationDelay: `${idx * 50}ms` }}
          >
             <div className={`p-3 rounded-xl ${getCardStyle(d.type)}`}>
                {getCardIcon(d.type)}
             </div>
             <div className="flex-1">
                <div className="flex justify-between items-start">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{getTypeLabel(d.type)}</p>
                   <div className="flex space-x-1">
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleTogglePaid(d.id); }} 
                        title={d.isPaid ? "Tandai Belum Lunas" : "Tandai Lunas"}
                        className={`p-1.5 rounded-lg transition-all hover:scale-110 ${d.isPaid ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openEditModal(d); }} 
                        className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all hover:scale-110"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setDeleteId(d.id); }} 
                        className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
                <h4 className="text-base font-bold text-slate-800 dark:text-white">{d.person}</h4>
                <p className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mt-1">Rp {d.amount.toLocaleString('id-ID')}</p>
                <div className="flex items-center justify-between mt-3">
                   <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate max-w-[150px]">{d.description}</p>
                   <div className="flex items-center text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg">
                     <CalendarClock className="w-3 h-3 mr-1" />
                     {d.dueDate}
                   </div>
                </div>
             </div>
          </div>
        ))}
        {debts.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse">
            <Receipt className="w-10 h-10 mb-2 opacity-20" />
            <p>Belum ada data tagihan atau hutang.</p>
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
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Hapus Catatan?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 px-4">
              Apakah Anda yakin ingin menghapus data tagihan/hutang ini?
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

      {/* Add/Edit Modals (Existing code remains, just showing structure for context) */}
      {isAddOpen && (
        <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setIsAddOpen(false)}></div>
          <div className="relative w-full max-w-md glass-card rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-pop-in">
            {/* ... Content ... */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-10"></div>
            <div className="p-5 pb-0 shrink-0">
               <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center">Tambah Catatan Baru</h3>
            </div>
            
            <div className="p-5 pt-4 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                  <button type="button" onClick={() => setType('BILL')} className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 ${type === 'BILL' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>TAGIHAN</button>
                  <button type="button" onClick={() => setType('DEBT')} className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 ${type === 'DEBT' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>HUTANG</button>
                  <button type="button" onClick={() => setType('RECEIVABLE')} className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 ${type === 'RECEIVABLE' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>PIUTANG</button>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">
                    {type === 'BILL' ? 'Nama Layanan (Cth: Listrik, Netflix)' : 'Nama Orang'}
                  </label>
                  <input type="text" required value={person} onChange={(e) => setPerson(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder={type === 'BILL' ? "PLN" : "John Doe"} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Jumlah (Rp)</label>
                    <input type="text" required value={amount} onChange={(e) => handleAmountChange(e.target.value, setAmount)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Jatuh Tempo</label>
                    <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Keterangan Tambahan</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" placeholder={type === 'BILL' ? "Tagihan bulan ini" : "Pinjaman mendesak"} />
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
               <h3 className="text-lg font-bold text-slate-800 dark:text-white text-center">Edit Catatan</h3>
            </div>
            
            <div className="p-5 pt-4 overflow-y-auto">
              <form onSubmit={handleEditSubmit} className="space-y-3">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
                  <button type="button" onClick={() => setEditItem({...editItem, d: {...editItem.d, type: 'BILL'}})} className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 ${editItem.d.type === 'BILL' ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>TAGIHAN</button>
                  <button type="button" onClick={() => setEditItem({...editItem, d: {...editItem.d, type: 'DEBT'}})} className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 ${editItem.d.type === 'DEBT' ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>HUTANG</button>
                  <button type="button" onClick={() => setEditItem({...editItem, d: {...editItem.d, type: 'RECEIVABLE'}})} className={`flex-1 py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all hover:scale-105 active:scale-95 ${editItem.d.type === 'RECEIVABLE' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>PIUTANG</button>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">
                    {editItem.d.type === 'BILL' ? 'Nama Layanan' : 'Nama Orang'}
                  </label>
                  <input type="text" required value={editItem.d.person} onChange={(e) => setEditItem({...editItem, d: {...editItem.d, person: e.target.value}})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Jumlah (Rp)</label>
                    <input type="text" required value={editItem.amountStr} onChange={(e) => handleAmountChange(e.target.value, (val) => setEditItem({...editItem, amountStr: val}))} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Jatuh Tempo</label>
                    <input type="date" required value={editItem.d.dueDate} onChange={(e) => setEditItem({...editItem, d: {...editItem.d, dueDate: e.target.value}})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 ml-1">Keterangan Tambahan</label>
                  <input type="text" value={editItem.d.description} onChange={(e) => setEditItem({...editItem, d: {...editItem.d, description: e.target.value}})} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900/50" />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors active:scale-95">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors active:scale-95">Simpan Perubahan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtManager;