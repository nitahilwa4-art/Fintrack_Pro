import React, { useState, useMemo } from 'react';
import { Transaction, SummaryStats, Wallet, Budget, TransactionType, CATEGORIES, Debt } from '../types';
import { TrendingUp, TrendingDown, Wallet as WalletIcon, Calendar, AlertCircle, Plus, Sparkles, PieChart as PieChartIcon, BarChart3, Receipt, History, Clock, ArrowRight } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  PieChart, Pie, Legend 
} from 'recharts';
import { v4 as uuidv4 } from 'uuid';

interface DashboardProps {
  transactions: Transaction[];
  stats: SummaryStats;
  wallets: Wallet[];
  budgets: Budget[];
  debts: Debt[];
  onAddTransaction: (t: Omit<Transaction, 'userId'>) => void;
  onNavigateToSmartEntry: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  stats, 
  wallets, 
  budgets,
  debts,
  onAddTransaction,
  onNavigateToSmartEntry
}) => {
  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to get local month string YYYY-MM
  const getLocalMonthString = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState(CATEGORIES.EXPENSE[0]);
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [date, setDate] = useState(getLocalDateString());

  // --- TREND CHART STATE ---
  const [trendStartDate, setTrendStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Default to start of current month
    return getLocalDateString(d);
  });
  const [trendEndDate, setTrendEndDate] = useState(getLocalDateString());

  // --- PIE CHART STATE ---
  const [pieStartDate, setPieStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1); // Start of current month
    return getLocalDateString(d);
  });
  const [pieEndDate, setPieEndDate] = useState(getLocalDateString());

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  const formatShortIDR = (val: number) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'M';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'jt';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'rb';
    return val.toString();
  };

  // --- CHART DATA PREPARATION ---

  // 1. Trend Data (Bar Chart) - Flexible Daily/Monthly View
  const trendData = useMemo(() => {
    const start = new Date(trendStartDate);
    const end = new Date(trendEndDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // If range is <= 31 days, show Daily view. Otherwise, show Monthly view.
    const isDailyView = daysDiff <= 31;
    const data = [];

    if (isDailyView) {
      // Generate Daily Data
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayKey = getLocalDateString(d);
        const dayLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

        const income = transactions
          .filter(t => t.type === 'INCOME' && t.date === dayKey)
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
          .filter(t => t.type === 'EXPENSE' && t.date === dayKey)
          .reduce((sum, t) => sum + t.amount, 0);

        data.push({ name: dayLabel, fullDate: dayKey, Pemasukan: income, Pengeluaran: expense });
      }
    } else {
      // Generate Monthly Data
      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= endMonth) {
        const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = current.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });

        const income = transactions
          .filter(t => t.type === 'INCOME' && t.date.startsWith(monthKey))
          .reduce((sum, t) => sum + t.amount, 0);

        const expense = transactions
          .filter(t => t.type === 'EXPENSE' && t.date.startsWith(monthKey))
          .reduce((sum, t) => sum + t.amount, 0);

        data.push({ name: monthLabel, fullDate: monthKey, Pemasukan: income, Pengeluaran: expense });
        
        current.setMonth(current.getMonth() + 1);
      }
    }
    return data;
  }, [transactions, trendStartDate, trendEndDate]);

  // 2. Category Data (Pie Chart)
  const categoryData = useMemo(() => {
    const expenseMap = transactions
      .filter(t => {
        if (t.type !== 'EXPENSE') return false;
        if (t.date < pieStartDate) return false;
        if (t.date > pieEndDate) return false;
        return true;
      })
      .reduce((acc: Record<string, number>, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(expenseMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, pieStartDate, pieEndDate]);

  const PIE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'];

  // --- NEW FEATURES CALCULATIONS ---

  const topBudgets = useMemo(() => {
    const currentMonthKey = getLocalMonthString();
    return budgets
      .map(b => {
        const spent = transactions
          .filter(t => t.type === 'EXPENSE' && t.category === b.category && t.date.startsWith(currentMonthKey))
          .reduce((acc, t) => acc + t.amount, 0);
        const limit = Number(b.limit);
        const percent = limit > 0 ? (spent / limit) * 100 : 0;
        return { ...b, spent, percent };
      })
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3);
  }, [budgets, transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const upcomingBills = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return debts
      .filter(d => {
        if ((d.type !== 'DEBT' && d.type !== 'BILL') || d.isPaid) return false;
        const due = new Date(d.dueDate);
        return due >= today && due <= nextWeek;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [debts]);

  const setTrendPreset = (type: 'THIS_MONTH' | 'LAST_30' | 'THIS_YEAR') => {
    const end = new Date();
    let start = new Date();
    
    if (type === 'THIS_MONTH') {
      start.setDate(1);
    } else if (type === 'LAST_30') {
      start.setDate(end.getDate() - 30);
    } else if (type === 'THIS_YEAR') {
      start = new Date(end.getFullYear(), 0, 1);
    }

    setTrendStartDate(getLocalDateString(start));
    setTrendEndDate(getLocalDateString(end));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId) { alert('Pilih dompet terlebih dahulu!'); return; }
    onAddTransaction({ 
      id: uuidv4(), 
      date, 
      description, 
      amount: parseFloat(amount), 
      type, 
      category, 
      walletId 
    });
    setIsAddModalOpen(false);
    setDescription(''); setAmount(''); setDate(getLocalDateString());
  };

  const thisMonthStats = useMemo(() => {
    const currentMonthKey = getLocalMonthString();
    const monthlyTrans = transactions.filter(t => t.date.startsWith(currentMonthKey));
    return {
      income: monthlyTrans.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
      expense: monthlyTrans.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
    };
  }, [transactions]);

  const getProgressColor = (percent: number) => {
    if (percent < 50) return 'bg-emerald-500';
    if (percent < 80) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-8">
      {/* Quick Action Bar (Floating Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Financial Overview</h2>
           <p className="text-slate-500 font-medium">Pantau kesehatan finansialmu hari ini.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onNavigateToSmartEntry}
            className="flex items-center px-5 py-3 bg-white text-indigo-600 rounded-2xl text-sm font-bold hover:bg-indigo-50 transition-all border border-indigo-100 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 mr-2 text-indigo-500" /> 
            AI Input
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4 mr-2" /> 
            Transaksi Baru
          </button>
        </div>
      </div>

      {/* Hero Stats Section - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card with Gradient */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-8 rounded-[2rem] shadow-xl shadow-indigo-500/20 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 transform group-hover:scale-110 transition-transform duration-700">
             <WalletIcon className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-100 font-medium mb-2 tracking-wide flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 animate-pulse"></span>
              Total Saldo Aktif
            </p>
            <h3 className="text-4xl font-extrabold tracking-tight mb-6">{formatIDR(stats.balance)}</h3>
            <div className="flex gap-2">
               {wallets.slice(0, 3).map(w => (
                 <div key={w.id} className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-lg text-xs font-medium border border-white/10">
                   {w.name}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative group hover:border-emerald-200 transition-colors">
          <div className="flex items-start justify-between mb-4">
             <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
               <TrendingUp className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-lg">Bulan Ini</span>
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Pemasukan</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{formatIDR(thisMonthStats.income)}</h3>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative group hover:border-red-200 transition-colors">
          <div className="flex items-start justify-between mb-4">
             <div className="p-3 bg-red-50 rounded-2xl text-red-600 group-hover:scale-110 transition-transform">
               <TrendingDown className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold bg-slate-50 text-slate-400 px-2 py-1 rounded-lg">Bulan Ini</span>
          </div>
          <div>
            <p className="text-slate-500 font-medium text-sm">Pengeluaran</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">{formatIDR(thisMonthStats.expense)}</h3>
          </div>
        </div>
      </div>

      {/* Main Charts Section - Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">Analisis Tren</h4>
                <p className="text-xs text-slate-500 font-medium">Pemasukan vs Pengeluaran</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-1.5 rounded-xl border border-slate-100">
               {(['THIS_MONTH', 'LAST_30', 'THIS_YEAR'] as const).map(preset => (
                 <button 
                  key={preset}
                  onClick={() => setTrendPreset(preset)} 
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                 >
                   {preset === 'THIS_MONTH' ? 'Bulan Ini' : preset === 'LAST_30' ? '30 Hari' : 'Tahun Ini'}
                 </button>
               ))}
               <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block"></div>
               <input type="date" value={trendStartDate} onChange={(e) => setTrendStartDate(e.target.value)} className="bg-transparent text-xs font-medium text-slate-600 focus:outline-none" />
               <span className="text-slate-300">-</span>
               <input type="date" value={trendEndDate} onChange={(e) => setTrendEndDate(e.target.value)} className="bg-transparent text-xs font-medium text-slate-600 focus:outline-none" />
            </div>
          </div>
          
          <div className="flex-1 w-full min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} 
                  dy={10} 
                  interval={trendData.length > 10 ? 'preserveStartEnd' : 0} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} 
                  tickFormatter={formatShortIDR}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                  formatter={(value: number) => formatIDR(value)}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} iconType="circle" />
                <Bar dataKey="Pemasukan" fill="url(#colorIncome)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Pengeluaran" fill="url(#colorExpense)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-pink-50 text-pink-600 rounded-xl">
                <PieChartIcon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Distribusi</h4>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold bg-slate-50 px-2 py-1 rounded-lg text-slate-500">
               <Calendar className="w-3 h-3" />
               Custom
            </div>
          </div>
          
          <div className="flex justify-center gap-2 mb-4">
             <input type="date" value={pieStartDate} onChange={(e) => setPieStartDate(e.target.value)} className="bg-slate-50 border-none rounded-lg text-[10px] text-slate-500 px-2 py-1" />
             <input type="date" value={pieEndDate} onChange={(e) => setPieEndDate(e.target.value)} className="bg-slate-50 border-none rounded-lg text-[10px] text-slate-500 px-2 py-1" />
          </div>

          <div className="flex-1 min-h-[300px] relative">
             {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                      cornerRadius={6}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip 
                       formatter={(value: number) => formatIDR(value)}
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend 
                      layout="horizontal" 
                      verticalAlign="bottom" 
                      align="center"
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', paddingTop: '20px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                 <PieChartIcon className="w-16 h-16 mb-2 opacity-20" />
                 <p className="text-sm font-medium">Belum ada data</p>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Widgets Section - 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Budget Watch */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Budget Watch</h4>
           </div>
           
           <div className="space-y-5 flex-1">
              {topBudgets.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-300 py-8">
                    <p className="text-sm">Belum ada budget yang diatur</p>
                 </div>
              ) : (
                 topBudgets.map(b => (
                   <div key={b.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                         <div>
                            <span className="font-bold text-slate-700 block">{b.category}</span>
                            <span className="text-[10px] text-slate-400 font-medium">Sisa: {formatShortIDR(b.limit - b.spent)}</span>
                         </div>
                         <span className={`font-bold text-sm ${b.percent > 90 ? 'text-red-500' : 'text-slate-500'}`}>
                           {b.percent.toFixed(0)}%
                         </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                         <div 
                           className={`h-2.5 rounded-full transition-all duration-700 ease-out ${getProgressColor(b.percent)}`} 
                           style={{ width: `${Math.min(b.percent, 100)}%` }}
                         />
                      </div>
                   </div>
                 ))
              )}
           </div>
           <button className="w-full mt-4 py-2 text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-xl transition-colors">Lihat Semua Budget</button>
        </div>

        {/* Upcoming Bills */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                <Receipt className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg">Tagihan <span className="text-red-500 text-sm font-normal ml-1">(7 Hari)</span></h4>
           </div>
           
           <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-1 scrollbar-hide">
              {upcomingBills.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-slate-300 py-8">
                    <Clock className="w-10 h-10 mb-2 opacity-20" />
                    <p className="text-sm">Aman! Tidak ada tagihan dekat.</p>
                 </div>
              ) : (
                 upcomingBills.map(bill => (
                    <div key={bill.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-red-100 transition-colors group">
                       <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border border-slate-100 ${bill.type === 'BILL' ? 'bg-white text-orange-500' : 'bg-white text-red-500'}`}>
                             {bill.type === 'BILL' ? <Receipt className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div>
                             <p className="text-sm font-bold text-slate-700 truncate max-w-[100px] group-hover:text-indigo-600 transition-colors">{bill.person}</p>
                             <p className="text-[10px] text-slate-400 font-medium">Due: {bill.dueDate}</p>
                          </div>
                       </div>
                       <p className="text-sm font-bold text-slate-800">{formatShortIDR(bill.amount)}</p>
                    </div>
                 ))
              )}
           </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <History className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-lg">Terakhir</h4>
              </div>
              <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"><ArrowRight className="w-4 h-4" /></button>
           </div>

           <div className="space-y-0 flex-1">
              {recentTransactions.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-slate-300 py-8">
                    <p className="text-sm">Belum ada transaksi</p>
                 </div>
              ) : (
                 <div className="flex flex-col gap-1">
                    {recentTransactions.map(t => (
                       <div key={t.id} className="p-3 flex justify-between items-center hover:bg-slate-50 transition-all rounded-2xl group cursor-pointer">
                          <div className="flex items-center gap-3">
                             <div className={`w-2 h-2 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700 truncate max-w-[120px] group-hover:text-indigo-700 transition-colors">{t.description}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{t.date} • {t.category}</span>
                             </div>
                          </div>
                          <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-800'}`}>
                             {t.type === 'INCOME' ? '+' : '-'} {formatShortIDR(t.amount)}
                          </span>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Modern Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-white/50">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Tambah Transaksi</h3>
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div className="flex p-1.5 bg-slate-100 rounded-2xl">
                <button type="button" onClick={() => { setType('INCOME'); setCategory(CATEGORIES.INCOME[0]); }} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>PEMASUKAN</button>
                <button type="button" onClick={() => { setType('EXPENSE'); setCategory(CATEGORIES.EXPENSE[0]); }} className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>PENGELUARAN</button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Dompet</label>
                <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer font-medium text-slate-700">
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({formatIDR(w.balance)})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Jumlah</label>
                  <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold text-slate-700" placeholder="0" />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Kategori</label>
                   <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none font-medium text-slate-700">
                     {(type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE).map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Deskripsi</label>
                <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-700" placeholder="Cth: Beli Kopi" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Tanggal</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-700" />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors">Batal</button>
                <button type="submit" className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;