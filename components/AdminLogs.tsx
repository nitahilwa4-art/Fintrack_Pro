
import React from 'react';
import { SystemLog } from '../types';
import { Shield, Clock, User, Activity } from 'lucide-react';

const AdminLogs: React.FC = () => {
  // Mock Data generator
  const logs: SystemLog[] = Array.from({ length: 15 }).map((_, i) => ({
    id: `log-${i}`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    adminId: 'Super Admin',
    action: i % 3 === 0 ? 'UPDATE_USER' : i % 2 === 0 ? 'DELETE_TRANSACTION' : 'SYSTEM_LOGIN',
    target: i % 3 === 0 ? 'User: John Doe' : i % 2 === 0 ? 'Tx: #12345' : 'Admin Panel',
    details: 'Action performed successfully via Admin Dashboard'
  }));

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30';
    if (action.includes('UPDATE')) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30';
    return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30';
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 dark:bg-slate-900 p-6 rounded-2xl text-white shadow-lg border border-slate-700 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold">System Audit Trail</h3>
        </div>
        <p className="text-slate-400 text-sm">Mencatat semua aktivitas sensitif yang dilakukan di dalam sistem.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                    <th className="px-6 py-4">Waktu</th>
                    <th className="px-6 py-4">Aktor</th>
                    <th className="px-6 py-4">Aksi</th>
                    <th className="px-6 py-4">Target</th>
                    <th className="px-6 py-4">Detail</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs">
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                {new Date(log.timestamp).toLocaleString()}
                            </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-200">
                            <div className="flex items-center gap-2">
                                <User className="w-3 h-3 text-slate-400" />
                                {log.adminId}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${getActionColor(log.action)}`}>
                                {log.action}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-200 font-medium">{log.target}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs truncate max-w-xs">{log.details}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLogs;
