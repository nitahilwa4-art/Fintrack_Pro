
import React, { useState } from 'react';
import { Transaction } from '../types';
import { Users, DollarSign, Activity, Shield, Database, LayoutList, FileText } from 'lucide-react';
import { getUsers } from '../services/authService';
import AdminUsers from './AdminUsers';
import AdminTransactions from './AdminTransactions';
import AdminMasterData from './AdminMasterData';
import AdminLogs from './AdminLogs';

interface AdminDashboardProps {
  allTransactions: Transaction[];
  onRefresh: () => void;
}

type AdminTab = 'OVERVIEW' | 'USERS' | 'TRANSACTIONS' | 'MASTER' | 'LOGS';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ allTransactions, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const users = getUsers();
  
  const totalSystemBalance = allTransactions.reduce((acc, t) => {
    return t.type === 'INCOME' ? acc + t.amount : acc - t.amount;
  }, 0);

  const TabButton = ({ id, label, icon: Icon }: { id: AdminTab, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center px-4 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${
        activeTab === id 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Admin Control Panel</h2>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 w-full md:w-auto transition-colors">
          <TabButton id="OVERVIEW" label="Overview" icon={Activity} />
          <TabButton id="USERS" label="Users" icon={Users} />
          <TabButton id="TRANSACTIONS" label="Monitoring" icon={LayoutList} />
          <TabButton id="MASTER" label="Master Data" icon={Database} />
          <TabButton id="LOGS" label="System Logs" icon={Shield} />
        </div>
      </div>
      
      {/* Dynamic Content */}
      <div className="animate-fade-in-up">
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* System Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center group hover:shadow-md transition-all">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <Users className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Total User</p>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{users.length}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center group hover:shadow-md transition-all">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Total Transaksi</p>
                  <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{allTransactions.length}</h3>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center group hover:shadow-md transition-all">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wide">Volume Sistem</p>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(totalSystemBalance)}
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-black rounded-2xl p-8 text-white relative overflow-hidden">
                  <Activity className="absolute right-0 bottom-0 w-48 h-48 opacity-5" />
                  <h3 className="text-xl font-bold mb-4">System Health</h3>
                  <div className="space-y-4 relative z-10">
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400">Server Status</span>
                        <span className="text-emerald-400 font-bold flex items-center"><div className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></div> Online</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400">Database Load</span>
                        <span className="font-bold">Normal (12ms)</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-slate-400">AI API Status</span>
                        <span className="font-bold text-emerald-400">Connected</span>
                     </div>
                  </div>
               </div>
               
               <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Aktivitas Terakhir</h3>
                  <div className="space-y-3">
                     {/* Mini Logs */}
                     {[1,2,3].map(i => (
                       <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm transition-colors">
                          <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                          <div>
                             <p className="font-bold text-slate-700 dark:text-slate-200">User Login Activity</p>
                             <p className="text-slate-500 dark:text-slate-400 text-xs">User #ID-{1000+i} logged in successfully.</p>
                          </div>
                          <span className="ml-auto text-xs text-slate-400">{i}m ago</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'USERS' && <AdminUsers onRefresh={onRefresh} allTransactions={allTransactions} />}
        
        {activeTab === 'TRANSACTIONS' && <AdminTransactions allTransactions={allTransactions} />}
        
        {activeTab === 'MASTER' && <AdminMasterData />}
        
        {activeTab === 'LOGS' && <AdminLogs />}
      </div>
    </div>
  );
};

export default AdminDashboard;
