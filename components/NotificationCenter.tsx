import React, { useState } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { Notification } from '../types';
import toast from 'react-hot-toast';

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', title: 'Budget Terlampaui', message: 'Anda telah menggunakan 90% dari budget Makanan bulan ini.', type: 'WARNING', date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), isRead: false },
  { id: '2', title: 'Tagihan Jatuh Tempo', message: 'Tagihan Listrik sebesar Rp 500.000 jatuh tempo besok.', type: 'ALERT', date: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), isRead: false },
  { id: '3', title: 'Gaji Masuk', message: 'Transaksi masuk terdeteksi: Rp 15.000.000.', type: 'SUCCESS', date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), isRead: true },
  { id: '4', title: 'Fitur Baru', message: 'Coba fitur AI Smart Entry untuk pencatatan lebih cepat!', type: 'INFO', date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), isRead: true },
];

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('Semua notifikasi ditandai sudah dibaca');
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Notifikasi dihapus');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'ALERT': return <Clock className="w-5 h-5 text-red-500" />;
      case 'SUCCESS': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'WARNING': return 'bg-amber-50 dark:bg-amber-900/20';
      case 'ALERT': return 'bg-red-50 dark:bg-red-900/20';
      case 'SUCCESS': return 'bg-emerald-50 dark:bg-emerald-900/20';
      default: return 'bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Baru saja';
    if (minutes < 60) return `${minutes}m yang lalu`;
    if (hours < 24) return `${hours}j yang lalu`;
    return `${days}h yang lalu`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Pusat Notifikasi
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Anda memiliki <span className="font-bold text-indigo-600 dark:text-indigo-400">{unreadCount}</span> notifikasi baru.
          </p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          disabled={unreadCount === 0}
          className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Check className="w-3 h-3 mr-1.5" /> Tandai Semua Dibaca
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => setFilter('ALL')}
            className={`flex-1 py-4 text-sm font-bold transition-colors relative ${filter === 'ALL' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Semua
            {filter === 'ALL' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setFilter('UNREAD')}
            className={`flex-1 py-4 text-sm font-bold transition-colors relative ${filter === 'UNREAD' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Belum Dibaca
            {filter === 'UNREAD' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"></div>}
          </button>
        </div>

        {/* List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 opacity-50" />
              </div>
              <p className="font-medium">Tidak ada notifikasi saat ini.</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-5 flex items-start gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 group ${!notification.isRead ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className={`p-3 rounded-xl flex-shrink-0 ${getBgColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold truncate ${!notification.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                      {notification.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                      {getTimeAgo(notification.date)}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed ${!notification.isRead ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                    {notification.message}
                  </p>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.isRead && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                      title="Tandai dibaca"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;