import React from 'react';
import { User, Transaction } from '../types';
import { getUsers, deleteUser } from '../services/authService';
import { Users, Trash2, DollarSign, Activity } from 'lucide-react';

interface AdminDashboardProps {
  allTransactions: Transaction[];
  onRefresh: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allTransactions, onRefresh }) => {
  const users = getUsers();
  
  const totalSystemBalance = allTransactions.reduce((acc, t) => {
    return t.type === 'INCOME' ? acc + t.amount : acc - t.amount;
  }, 0);

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Apakah anda yakin ingin menghapus user ini?')) {
      deleteUser(userId);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
      
      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-xl mr-4">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Total User</p>
            <h3 className="text-2xl font-bold text-slate-800">{users.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-xl mr-4">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Total Transaksi</p>
            <h3 className="text-2xl font-bold text-slate-800">{allTransactions.length}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center">
          <div className="p-4 bg-green-100 text-green-600 rounded-xl mr-4">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-500 text-sm">Volume Sistem</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalSystemBalance)}
            </h3>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">Manajemen Pengguna</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Bergabung</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.role !== 'ADMIN' && (
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;