import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, SummaryStats, Wallet, Budget, TransactionType, Debt, Category } from '../types';
import { TrendingUp, TrendingDown, Wallet as WalletIcon, Calendar, AlertCircle, Plus, Sparkles, PieChart as PieChartIcon, BarChart3, Receipt, History, Clock, ArrowRight, ArrowRightLeft, Filter } from 'lucide-react';
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
  categories: Category[];
  onAddTransaction: (t: Omit<Transaction, 'userId'>) => void;
  onNavigateToSmartEntry: () => void;
  activeDateRange: { start: string; end: string };
}

const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  stats, 
  wallets, 
  budgets,
  debts,
  categories,
  onAddTransaction,
  onNavigateToSmartEntry,
  activeDateRange
}) => {
  // Helper to get local date string YYYY-MM-DD
  const getLocalDateString = (date: Date = new Date()) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().split('T')[0];
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Transaction Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [category, setCategory] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');
  const [toWalletId, setToWalletId] = useState(wallets[1]?.id || ''); 
  const [date, setDate] = useState(getLocalDateString());

  // Set default category when type changes
  useEffect(() => {
    const availableCategories = categories.filter(c => c.type === type);
    if (availableCategories.length > 0) {
      setCategory(availableCategories[0].name);
    } else {
      setCategory('');
    }
  }, [type, categories]);

  // --- TREND CHART STATE ---
  type FilterType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'CUSTOM';
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('DAILY');
  // trendMode determines how data is grouped (aggregated)
  const [trendMode, setTrendMode] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY'); 
  const [trendStartDate, setTrendStartDate] = useState(activeDateRange.start);
  const [trendEndDate, setTrendEndDate] = useState(activeDateRange.end);
  const [trendCategory, setTrendCategory] = useState<string>('ALL');

  // Initialize trend dates based on default view and activeDateRange updates
  useEffect(() => {
    if (activeFilter === 'DAILY') {
      setTrendStartDate(activeDateRange.start);
      setTrendEndDate(activeDateRange.end);
      setTrendMode('DAILY');
    }
  }, [activeDateRange, activeFilter]);

  // --- PIE CHART STATE ---
  const [pieStartDate, setPieStartDate] = useState(activeDateRange.start);
  const [pieEndDate, setPieEndDate] = useState(activeDateRange.end);

  useEffect(() => {
    setPieStartDate(activeDateRange.start);
    setPieEndDate(activeDateRange.end);
  }, [activeDateRange]);

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  const formatShortIDR = (val: number) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'M';
    if (val >= 1000000) return (val / 1000000).toFixed(1) + 'jt';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'rb';
    return val.toString();
  };

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  // --- CHART DATA CALCULATION ---

  const trendData = useMemo(() => {
    const start = new Date(trendStartDate);
    const end = new Date(trendEndDate);
    const data = [];

    // Helper to filter transactions in a specific date range [s, e]
    const sumInRange = (s: Date, e: Date) => {
      const sStr = getLocalDateString(s);
      const eStr = getLocalDateString(e);
      
      const inRange = transactions.filter(t => {
        const dateMatch = t.date >= sStr && t.date <= eStr;
        const categoryMatch = trendCategory === 'ALL' || t.category === trendCategory;
        return dateMatch && categoryMatch;
      });

      return {
        income: inRange.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0),
        expense: inRange.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0)
      };
    };

    if (trendMode === 'DAILY') {
      // Loop daily
      for (let d = new Date(start.getTime()); d.getTime() <= end.getTime(); d.setDate(d.getDate() + 1)) {
        const dayKey = getLocalDateString(d);
        const dayLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        
        const sums = sumInRange(d, d);
        data.push({ name: dayLabel, fullDate: dayKey, Pemasukan: sums.income, Pengeluaran: sums.expense });
      }
    } 
    else if (trendMode === 'WEEKLY') {
      // Align start to the nearest Monday or just use chunks of 7 days
      let current = new Date(start.getTime());
      // Let's do calendar weeks logic:
      const day = current.getDay(); 
      const diff = current.getDate() - day + (day === 0 ? -6 : 1); 
      current.setDate(diff); // Set to Monday

      while (current.getTime() <= end.getTime()) {
        const weekStart = new Date(current.getTime());
        const weekEnd = new Date(current.getTime());
        weekEnd.setDate(weekEnd.getDate() + 6);

        // Only add if there is some overlap with the selected range
        if (weekEnd.getTime() >= start.getTime()) {
           const label = `${weekStart.getDate()} ${weekStart.toLocaleDateString('id-ID', { month: 'short' })}`;
           const sums = sumInRange(weekStart, weekEnd);
           data.push({ name: label, Pemasukan: sums.income, Pengeluaran: sums.expense });
        }
        
        current.setDate(current.getDate() + 7);
      }
    }
    else if (trendMode === 'MONTHLY') {
      // Align to 1st of month
      let current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endDateObj = new Date(end.getTime());

      while (current.getTime() <= endDateObj.getTime()) {
         const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
         const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);

         // Check overlap
         if (monthEnd.getTime() >= start.getTime()) {
            const label = current.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
            const sums = sumInRange(monthStart, monthEnd);
            data.push({ name: label, Pemasukan: sums.income, Pengeluaran: sums.expense });
         }
         current.setMonth(current.getMonth() + 1);
      }
    }

    return data;
  }, [transactions, trendStartDate, trendEndDate, trendMode, trendCategory]);

  // 2. Category Data
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
      .sort((a, b) => Number(b.value) - Number(a.value));
  }, [transactions, pieStartDate, pieEndDate]);

  const PIE_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#64748b'];

  // --- NEW FEATURES CALCULATIONS ---

  const cycleStats = useMemo(() => {
    const filtered = transactions.filter(t => t.date >= activeDateRange.start && t.date <= activeDateRange.end);
    return {
      income: filtered.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
      expense: filtered.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
    };
  }, [transactions, activeDateRange]);

  const topBudgets = useMemo(() => {
    return budgets
      .map(b => {
        const spent = transactions
          .filter(t => 
            t.type === 'EXPENSE' && 
            t.category === b.category && 
            t.date >= activeDateRange.start && 
            t.date <= activeDateRange.end
          )
          .reduce((acc: number, t) => acc + t.amount, 0);
        const limit = Number(b.limit);
        const percent = limit > 0 ? (spent / limit) * 100 : 0;
        return { ...b, spent, percent };
      })
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 3);
  }, [budgets, transactions, activeDateRange]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateB = new Date(b.date).getTime();
        const dateA = new Date(a.date).getTime();
        return Number(dateB) - Number(dateA);
      })
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
        return due.getTime() >= today.getTime() && due.getTime() <= nextWeek.getTime();
      })
      .sort((a, b) => {
        const dateA = new Date(a.dueDate).getTime();
        const dateB = new Date(b.dueDate).getTime();
        return Number(dateA) - Number(dateB);
      });
  }, [debts]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    const end = new Date();
    let start = new Date();

    if (filter === 'DAILY') {
      // Default: Current Month
      start = new Date(end.getFullYear(), end.getMonth(), 1); 
      setTrendMode('DAILY');
    } else if (filter === 'WEEKLY') {
      // Default: Last 3 Months
      start.setMonth(end.getMonth() - 3);
      setTrendMode('WEEKLY');
    } else if (filter === 'MONTHLY') {
      // Default: This Year
      start = new Date(end.getFullYear(), 0, 1);
      setTrendMode('MONTHLY');
    } else if (filter === 'YEARLY') {
      // Default: Last 5 Years
      start.setFullYear(end.getFullYear() - 5);
      start.setMonth(0, 1);
      setTrendMode('MONTHLY'); // Use Monthly bars for Yearly view, or could be 'YEARLY' if we added that mode
    } else if (filter === 'CUSTOM') {
      // Keep current dates, default to daily unless range is huge
      setTrendMode('DAILY');
      // Don't change dates
      return;
    }

    setTrendStartDate(getLocalDateString(start));
    setTrendEndDate(getLocalDateString(end));
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    if (field === 'start') setTrendStartDate(value);
    else setTrendEndDate(value);
    
    setActiveFilter('CUSTOM');
    // Intelligent granularity switch? For now stick to Daily for custom precision
    setTrendMode('DAILY');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletId) { alert('Pilih dompet terlebih dahulu!'); return; }
    if (type === 'TRANSFER' && walletId === toWalletId) {
      alert('Dompet tujuan tidak boleh sama dengan dompet asal!');
      return;
    }

    onAddTransaction({ 
      id: uuidv4(), 
      date, 
      description, 
      amount: parseFloat(amount), 
      type, 
      category, 
      walletId,
      toWalletId: type === 'TRANSFER' ? toWalletId : undefined
    });
    setIsAddModalOpen(false);
    setDescription(''); setAmount(''); setDate(getLocalDateString());
  };

  const getProgressColor = (percent: number) => {
    if (percent < 50) return 'bg-emerald-500';
    if (percent < 80) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const currentTypeCategories = useMemo(() => {
    return categories.filter(c => c.type === type);
  }, [categories, type]);

  return (
    <div className="space-y-8">
      {/* Quick Action Bar (Floating Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2">
             <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Financial Overview</h2>
           </div>
           <p className="text-slate-500 font-medium">
             Pantau kondisi keuangan Anda secara real-time.
           </p>
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

        {/* Income Card - Emerald/Teal Gradient */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2rem] shadow-lg shadow-emerald-500/20 relative overflow-hidden group transition-transform hover:scale-[1.02]">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
             <TrendingUp className="w-24 h-24 text-white" />
          </div>

          <div className="flex items-start justify-between mb-4 relative z-10">
             <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl text-white">
               <TrendingUp className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold bg-white/20 backdrop-blur-sm text-emerald-50 px-2 py-1 rounded-lg">Periode Ini</span>
          </div>
          <div className="relative z-10">
            <p className="text-emerald-50 font-medium text-sm">Pemasukan</p>
            <h3 className="text-3xl font-bold text-white mt-1">{formatIDR(cycleStats.income)}</h3>
          </div>
        </div>

        {/* Expense Card - Rose/Orange Gradient */}
        <div className="bg-gradient-to-br from-rose-500 to-orange-600 p-8 rounded-[2rem] shadow-lg shadow-rose-500/20 relative overflow-hidden group transition-transform hover:scale-[1.02]">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 p-4 opacity-10 transform translate-x-4 -translate-y-4">
             <TrendingDown className="w-24 h-24 text-white" />
          </div>

          <div className="flex items-start justify-between mb-4 relative z-10">
             <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl text-white">
               <TrendingDown className="w-6 h-6" />
             </div>
             <span className="text-xs font-bold bg-white/20 backdrop-blur-sm text-rose-50 px-2 py-1 rounded-lg">Periode Ini</span>
          </div>
          <div className="relative z-10">
            <p className="text-rose-50 font-medium text-sm">Pengeluaran</p>
            <h3 className="text-3xl font-bold text-white mt-1">{formatIDR(cycleStats.expense)}</h3>
          </div>
        </div>
      </div>

      {/* Main Charts Section - Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
          <div className="flex flex-col justify-between mb-6 gap-4">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">Analisis Tren</h4>
                    <p className="text-xs text-slate-500 font-medium">Pemasukan vs Pengeluaran</p>
                  </div>
               </div>

               {/* Filters */}
               <div className="flex flex-wrap gap-2 items-center">
                 {/* Category Dropdown */}
                 <div className="relative">
                   <select 
                      value={trendCategory} 
                      onChange={(e) => setTrendCategory(e.target.value)} 
                      className="appearance-none pl-3 pr-8 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer max-w-[140px]"
                   >
                     <option value="ALL">Semua Kategori</option>
                     {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                   </select>
                   <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                 </div>

                 {/* Period Toggles */}
                 <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-hide">
                   {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM'] as const).map(filter => (
                     <button
                       key={filter}
                       onClick={() => handleFilterChange(filter)}
                       className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                         activeFilter === filter 
                         ? 'bg-white text-indigo-600 shadow-sm' 
                         : 'text-slate-500 hover:text-slate-700'
                       }`}
                     >
                       {filter === 'DAILY' ? 'Harian' : filter === 'WEEKLY' ? 'Mingguan' : filter === 'MONTHLY' ? 'Bulanan' : filter === 'YEARLY' ? 'Tahunan' : 'Custom'}
                     </button>
                   ))}
                 </div>
               </div>
            </div>
            
            {/* Date Range Inputs */}
            <div className="flex items-center gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit">
               <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Range:</span>
               <input type="date" value={trendStartDate} onChange={(e) => handleDateChange('start', e.target.value)} className="bg-transparent font-medium text-slate-900 focus:outline-none" />
               <span className="text-slate-300">-</span>
               <input type="date" value={trendEndDate} onChange={(e) => handleDateChange('end', e.target.value)} className="bg-transparent font-medium text-slate-900 focus:outline-none" />
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
                             <div className={`w-2 h-2 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-400' : t.type === 'TRANSFER' ? 'bg-blue-400' : 'bg-red-400'}`}></div>
                             <div className="flex flex-col">
                                <span className="text-sm font-bold text-slate-700 truncate max-w-[120px] group-hover:text-indigo-700 transition-colors">{t.description}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{t.date} • {t.category}</span>
                             </div>
                          </div>
                          <span className={`text-sm font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : t.type === 'TRANSFER' ? 'text-blue-600' : 'text-slate-800'}`}>
                             {t.type === 'INCOME' ? '+' : t.type === 'TRANSFER' ? '→' : '-'} {formatShortIDR(t.amount)}
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
                <button type="button" onClick={() => { setType('INCOME'); }} className={`flex-1 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>MASUK</button>
                <button type="button" onClick={() => { setType('EXPENSE'); }} className={`flex-1 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>KELUAR</button>
                <button type="button" onClick={() => { setType('TRANSFER'); }} className={`flex-1 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${type === 'TRANSFER' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>TRANSFER</button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">
                  {type === 'TRANSFER' ? 'Dari Dompet' : 'Dompet'}
                </label>
                <select value={walletId} onChange={(e) => setWalletId(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer font-medium text-slate-900">
                  {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({formatIDR(w.balance)})</option>)}
                </select>
              </div>

              {type === 'TRANSFER' && (
                <div className="relative animate-in slide-in-from-top-2">
                  <div className="absolute left-1/2 -top-3 transform -translate-x-1/2 bg-white p-1 rounded-full border border-slate-100 text-slate-400 z-10">
                    <ArrowDownUp className="w-4 h-4" />
                  </div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Ke Dompet</label>
                  <select value={toWalletId} onChange={(e) => setToWalletId(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer font-medium text-slate-900">
                    {wallets.filter(w => w.id !== walletId).map(w => <option key={w.id} value={w.id}>{w.name} ({formatIDR(w.balance)})</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Jumlah</label>
                  <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold text-slate-900 bg-slate-50" placeholder="0" />
                </div>
                <div>
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Kategori</label>
                   <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none font-medium text-slate-900">
                     {currentTypeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                   </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Deskripsi</label>
                <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-900 bg-slate-50" placeholder="Cth: Beli Kopi / Transfer Tabungan" />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Tanggal</label>
                <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-medium text-slate-900 bg-slate-50" />
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

// Quick Fix helper component for arrow icon since lucide might change exports
const ArrowDownUp = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
);

export default Dashboard;