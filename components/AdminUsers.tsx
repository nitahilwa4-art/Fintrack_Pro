
import React, { useState } from 'react';
import { User, Transaction, Wallet } from '../types';
import { getUsers, updateUserInStorage, deleteUser, getCurrentUser } from '../services/authService';
import { Search, Edit2, Trash2, Shield, Ban, CheckCircle, RefreshCcw, Eye, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminUsersProps {
  onRefresh: () => void;
  allTransactions: Transaction[];
}

const AdminUsers: React.FC<AdminUsersProps> = ({ onRefresh, allTransactions }) => {
  const [users, setUsers] = useState<User[]>(getUsers());
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const refreshList = () => {
    setUsers(getUsers());
    onRefresh();
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      updateUserInStorage(editingUser);
      toast.success(`User ${editingUser.name} berhasil diperbarui`);
      setEditingUser(null);
      refreshList();
    }
  };

  const handleToggleStatus = (user: User) => {
    const currentUser = getCurrentUser();
    if (user.id === currentUser?.id) {
        toast.error("Anda tidak dapat mengubah status akun sendiri.");
        return;
    }

    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    const confirmMsg = newStatus === 'SUSPENDED' 
      ? `Yakin ingin membekukan (suspend) user ${user.name}?` 
      : `Aktifkan kembali user ${user.name}?`;
    
    if (window.confirm(confirmMsg)) {
      updateUserInStorage({ ...user, status: newStatus });
      toast.success(`Status user diubah menjadi ${newStatus}`);
      refreshList();
    }
  };

  const handleResetPassword = (user: User) => {
    if (window.confirm(`Reset password user ${user.name} menjadi "password123"?`)) {
      updateUserInStorage({ ...user, password: 'password123' });
      toast.success('Password berhasil direset');
    }
  };

  const handleDeleteClick = (id: string) => {
    const currentUser = getCurrentUser();
    if (id === currentUser?.id) {
        toast.error("Anda tidak dapat menghapus akun sendiri saat login.");
        return;
    }
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteUser(deleteId);
      toast.success('User dihapus permanen');
      refreshList();
      setDeleteId(null);
    }
  };

  const getUserStats = (userId: string) => {
    const userTx = allTransactions.filter(t => t.userId === userId);
    const income = userTx.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
    const expense = userTx.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);
    const wallets = JSON.parse(localStorage.getItem('wallets') || '[]') as Wallet[];
    const balance = wallets.filter(w => w.userId === userId).reduce((acc, w) => acc + w.balance, 0);
    
    return { txCount: userTx.length, income, expense, balance };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Cari user berdasarkan nama atau email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
          />
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Total User: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{users.length}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Role & Status</th>
                <th className="px-6 py-4">Terakhir Login</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${user.status === 'SUSPENDED' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                        {user.status || 'ACTIVE'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => setViewingUser(user)} title="Detail" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setEditingUser(user)} title="Edit" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                      
                      {user.role !== 'ADMIN' && (
                        <>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleResetPassword(user); }} title="Reset Password" className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors"><RefreshCcw className="w-4 h-4" /></button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleToggleStatus(user); }} title={user.status === 'SUSPENDED' ? 'Aktifkan' : 'Suspend'} className={`p-2 rounded-lg transition-colors ${user.status === 'SUSPENDED' ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'}`}>
                            {user.status === 'SUSPENDED' ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteClick(user.id); }} title="Hapus Permanen" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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
            <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">Hapus User?</h3>
            <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-6 px-4">
              PERINGATAN: Tindakan ini akan menghapus user beserta seluruh datanya secara permanen.
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

      {/* Edit Modal (Unchanged) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">Edit User</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Nama</label>
                <input type="text" value={editingUser.name} onChange={e => setEditingUser({...editingUser, name: e.target.value})} className="w-full mt-1 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" required />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Email</label>
                <input type="email" value={editingUser.email} onChange={e => setEditingUser({...editingUser, email: e.target.value})} className="w-full mt-1 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors" required />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Role</label>
                <select value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as any})} className="w-full mt-1 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-colors cursor-pointer">
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-2 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal (Unchanged) */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-xl">{viewingUser.name}</h3>
                <button onClick={() => setViewingUser(null)} className="text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-indigo-100 text-sm mt-1">{viewingUser.email}</p>
              <div className="mt-4 flex gap-2">
                <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold backdrop-blur-md">{viewingUser.role}</span>
                <span className="px-2 py-1 bg-white/20 rounded text-xs font-bold backdrop-blur-md">{viewingUser.status || 'ACTIVE'}</span>
              </div>
            </div>
            
            <div className="p-6">
              <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Statistik Finansial</h4>
              {(() => {
                const stats = getUserStats(viewingUser.id);
                return (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Total Transaksi</p>
                      <p className="font-bold text-slate-800 dark:text-white text-lg">{stats.txCount}</p>
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Saldo Saat Ini</p>
                      <p className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">Rp {stats.balance.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <p className="text-xs text-green-600 dark:text-green-400">Total Pemasukan</p>
                      <p className="font-bold text-green-700 dark:text-green-400">Rp {stats.income.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <p className="text-xs text-red-600 dark:text-red-400">Total Pengeluaran</p>
                      <p className="font-bold text-red-700 dark:text-red-400">Rp {stats.expense.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                );
              })()}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                Member sejak: {new Date(viewingUser.createdAt).toLocaleDateString('id-ID')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
