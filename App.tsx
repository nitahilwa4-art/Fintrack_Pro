import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import SmartEntry from './components/SmartEntry';
import FinancialInsights from './components/FinancialInsights';
import Auth from './components/Auth';
import AdminDashboard from './components/AdminDashboard';
import WalletManager from './components/WalletManager';
import BudgetManager from './components/BudgetManager';
import DebtManager from './components/DebtManager';
import AssetManager from './components/AssetManager';
import CategoryManager from './components/CategoryManager';
import Profile from './components/Profile';
import Settings from './components/Settings';
import ExportPage from './components/ExportPage';
import ErrorPage from './components/ErrorPage';
import NotificationCenter from './components/NotificationCenter';
import HelpCenter from './components/HelpCenter';
import Maintenance from './components/Maintenance';
import OfflineIndicator from './components/OfflineIndicator';
import { Transaction, AppView, SummaryStats, User, Wallet, Budget, Debt, Asset, Category, INITIAL_CATEGORIES, BudgetCycle } from './types';
import { getCurrentUser, logout } from './services/authService';
import { v4 as uuidv4 } from 'uuid';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false); // Toggle this to test Maintenance page
  
  useEffect(() => {
    const session = getCurrentUser();
    if (session) setUser(session);
  }, []);

  // --- Dark Mode Effect ---
  useEffect(() => {
    if (user?.preferences?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.preferences?.theme]);

  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('wallets');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Initialize categories: Load saved custom categories or set defaults if empty
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('categories');
    if (saved) {
      return JSON.parse(saved);
    }
    // Generate initial defaults with IDs
    return INITIAL_CATEGORIES.map(c => ({
      ...c,
      id: uuidv4(),
      userId: 'system'
    }));
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('debts');
    return saved ? JSON.parse(saved) : [];
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    const saved = localStorage.getItem('assets');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgetCycle, setBudgetCycle] = useState<BudgetCycle>({ type: 'MONTHLY' });

  // Helper to format date as YYYY-MM-DD in LOCAL time (prevent UTC shift)
  const formatLocalDate = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().split('T')[0];
  };

  // Calculate active date range based on budget cycle
  const activeDateRange = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (budgetCycle.type === 'MONTHLY') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (budgetCycle.type === 'WEEKLY') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
      start = new Date(now.setDate(diff));
      end = new Date(start);
      end.setDate(start.getDate() + 6);
    } else if (budgetCycle.type === 'CUSTOM' && budgetCycle.startDay) {
       if (now.getDate() >= budgetCycle.startDay) {
          start = new Date(now.getFullYear(), now.getMonth(), budgetCycle.startDay);
          // End date is next month startDay - 1
          end = new Date(now.getFullYear(), now.getMonth() + 1, budgetCycle.startDay);
          end.setDate(end.getDate() - 1); 
       } else {
          start = new Date(now.getFullYear(), now.getMonth() - 1, budgetCycle.startDay);
          end = new Date(now.getFullYear(), now.getMonth(), budgetCycle.startDay);
          end.setDate(end.getDate() - 1);
       }
    }
    
    return { start: formatLocalDate(start), end: formatLocalDate(end) };
  }, [budgetCycle]);

  useEffect(() => {
    if(user) {
      localStorage.setItem('transactions', JSON.stringify(allTransactions));
      localStorage.setItem('wallets', JSON.stringify(wallets));
      localStorage.setItem('categories', JSON.stringify(categories));
      localStorage.setItem('budgets', JSON.stringify(budgets));
      localStorage.setItem('debts', JSON.stringify(debts));
      localStorage.setItem('assets', JSON.stringify(assets));
    }
  }, [allTransactions, wallets, categories, budgets, debts, assets, user]);

  // Initial Wallet for new users
  useEffect(() => {
    if (user && wallets.filter(w => w.userId === user.id).length === 0) {
      const defaultWallets: Wallet[] = [
        { id: uuidv4(), userId: user.id, name: 'Tunai', type: 'CASH', balance: 0 },
        { id: uuidv4(), userId: user.id, name: 'Bank BCA', type: 'BANK', balance: 0 }
      ];
      setWallets(prev => [...prev, ...defaultWallets]);
    }
  }, [user]);

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    // Update in local storage key 'fintrack_session'
    localStorage.setItem('fintrack_session', JSON.stringify(updatedUser));
    // Also update in the 'fintrack_users' array
    const users = JSON.parse(localStorage.getItem('fintrack_users') || '[]');
    const updatedUsers = users.map((u: User) => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('fintrack_users', JSON.stringify(updatedUsers));
  };

  const userTransactions = user ? allTransactions.filter(t => t.userId === user.id) : [];
  const userWallets = user ? wallets.filter(w => w.userId === user.id) : [];
  const userBudgets = user ? budgets.filter(b => b.userId === user.id) : [];
  const userDebts = user ? debts.filter(d => d.userId === user.id) : [];
  const userAssets = user ? assets.filter(a => a.userId === user.id) : [];
  const userCategories = user ? categories.filter(c => c.isDefault || c.userId === user.id) : [];

  const stats: SummaryStats = {
    totalIncome: userTransactions.filter(t => t.type === 'INCOME').reduce((acc, curr) => acc + curr.amount, 0),
    totalExpense: userTransactions.filter(t => t.type === 'EXPENSE').reduce((acc, curr) => acc + curr.amount, 0),
    get balance() { return userWallets.reduce((acc, w) => acc + w.balance, 0); }
  };

  const handleAddTransactions = (newTransactions: Omit<Transaction, 'userId'>[]) => {
    if (!user) return;
    const transactionsWithUser = newTransactions.map(t => ({ ...t, userId: user.id })) as Transaction[];
    
    // Update wallet balances
    const updatedWallets = [...wallets];
    transactionsWithUser.forEach(t => {
      // Source Wallet Logic
      const sourceIdx = updatedWallets.findIndex(w => w.id === t.walletId);
      if (sourceIdx !== -1) {
        if (t.type === 'INCOME') {
          updatedWallets[sourceIdx].balance += t.amount;
        } else {
          updatedWallets[sourceIdx].balance -= t.amount;
        }
      }

      // Destination Wallet Logic (For Transfers)
      if (t.type === 'TRANSFER' && t.toWalletId) {
        const destIdx = updatedWallets.findIndex(w => w.id === t.toWalletId);
        if (destIdx !== -1) {
          updatedWallets[destIdx].balance += t.amount;
        }
      }
    });
    
    setWallets(updatedWallets);
    setAllTransactions(prev => [...transactionsWithUser, ...prev]);
  };

  const handleAddSingleTransaction = (t: Omit<Transaction, 'userId'>) => {
    handleAddTransactions([t]);
  }

  const handleEditTransaction = (updatedT: Transaction) => {
    const oldT = allTransactions.find(t => t.id === updatedT.id);
    if (!oldT) return;

    const updatedWallets = [...wallets];
    
    // 1. Revert Old Transaction Effect
    const oldSourceIdx = updatedWallets.findIndex(w => w.id === oldT.walletId);
    if (oldSourceIdx !== -1) {
      if (oldT.type === 'INCOME') {
        updatedWallets[oldSourceIdx].balance -= oldT.amount;
      } else {
        updatedWallets[oldSourceIdx].balance += oldT.amount;
      }
    }

    if (oldT.type === 'TRANSFER' && oldT.toWalletId) {
      const oldDestIdx = updatedWallets.findIndex(w => w.id === oldT.toWalletId);
      if (oldDestIdx !== -1) {
        updatedWallets[oldDestIdx].balance -= oldT.amount;
      }
    }

    // 2. Apply New Transaction Effect
    const newSourceIdx = updatedWallets.findIndex(w => w.id === updatedT.walletId);
    if (newSourceIdx !== -1) {
      if (updatedT.type === 'INCOME') {
        updatedWallets[newSourceIdx].balance += updatedT.amount;
      } else {
        updatedWallets[newSourceIdx].balance -= updatedT.amount;
      }
    }

    if (updatedT.type === 'TRANSFER' && updatedT.toWalletId) {
      const newDestIdx = updatedWallets.findIndex(w => w.id === updatedT.toWalletId);
      if (newDestIdx !== -1) {
        updatedWallets[newDestIdx].balance += updatedT.amount;
      }
    }

    setWallets(updatedWallets);
    setAllTransactions(prev => prev.map(t => t.id === updatedT.id ? updatedT : t));
  };

  const deleteTransaction = (id: string) => {
    const t = allTransactions.find(tx => tx.id === id);
    if (t) {
      const updatedWallets = [...wallets];
      
      const sourceIdx = updatedWallets.findIndex(w => w.id === t.walletId);
      if (sourceIdx !== -1) {
        if (t.type === 'INCOME') {
          updatedWallets[sourceIdx].balance -= t.amount;
        } else {
          updatedWallets[sourceIdx].balance += t.amount;
        }
      }

      if (t.type === 'TRANSFER' && t.toWalletId) {
        const destIdx = updatedWallets.findIndex(w => w.id === t.toWalletId);
        if (destIdx !== -1) {
          updatedWallets[destIdx].balance -= t.amount;
        }
      }

      setWallets(updatedWallets);
    }
    setAllTransactions(prev => prev.filter(t => t.id !== id));
  };

  if (isMaintenanceMode) {
    return (
        <Maintenance onGoBack={() => setIsMaintenanceMode(false)} />
    );
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: "'Plus Jakarta Sans', sans-serif", borderRadius: '12px' } }} />
      <OfflineIndicator />
      
      {!user ? (
        <Auth onLogin={setUser} />
      ) : (
        <Layout currentView={currentView} setCurrentView={setCurrentView} user={user} onLogout={() => { logout(); setUser(null); }}>
          {(() => {
            switch (currentView) {
              case AppView.DASHBOARD:
                return (
                  <Dashboard 
                    transactions={userTransactions} 
                    stats={stats} 
                    wallets={userWallets} 
                    budgets={userBudgets} 
                    debts={userDebts}
                    categories={userCategories}
                    onAddTransaction={handleAddSingleTransaction}
                    onNavigateToSmartEntry={() => setCurrentView(AppView.SMART_ENTRY)}
                    activeDateRange={activeDateRange}
                  />
                );
              case AppView.TRANSACTIONS:
                return (
                  <TransactionList 
                    transactions={userTransactions} 
                    wallets={userWallets} 
                    categories={userCategories}
                    onDelete={deleteTransaction} 
                    onEdit={handleEditTransaction}
                  />
                );
              case AppView.WALLETS:
                return (
                  <WalletManager 
                    wallets={userWallets} 
                    onAdd={w => setWallets(prev => [...prev, { ...w, userId: user.id }])} 
                    onDelete={id => setWallets(prev => prev.filter(w => w.id !== id))}
                    onEdit={(updatedW) => setWallets(prev => prev.map(w => w.id === updatedW.id ? updatedW : w))}
                  />
                );
              case AppView.CATEGORIES:
                return (
                  <CategoryManager 
                     categories={userCategories}
                     onAdd={c => setCategories(prev => [...prev, { ...c, userId: user.id }])}
                     onDelete={id => setCategories(prev => prev.filter(c => c.id !== id))}
                     onEdit={updatedC => setCategories(prev => prev.map(c => c.id === updatedC.id ? updatedC : c))}
                  />
                );
              case AppView.BUDGETS:
                return (
                  <BudgetManager 
                    budgets={userBudgets} 
                    categories={userCategories}
                    onAdd={b => setBudgets(prev => [...prev, { ...b, userId: user.id }])} 
                    onDelete={id => setBudgets(prev => prev.filter(b => b.id !== id))}
                    onEdit={(updatedB) => setBudgets(prev => prev.map(b => b.id === updatedB.id ? updatedB : b))}
                  />
                );
              case AppView.DEBTS:
                return (
                  <DebtManager 
                    debts={userDebts} 
                    onAdd={d => setDebts(prev => [...prev, { ...d, userId: user.id }])} 
                    onDelete={id => setDebts(prev => prev.filter(d => d.id !== id))} 
                    onTogglePaid={id => setDebts(prev => prev.map(d => d.id === id ? { ...d, isPaid: !d.isPaid } : d))}
                    onEdit={(updatedD) => setDebts(prev => prev.map(d => d.id === updatedD.id ? updatedD : d))}
                  />
                );
              case AppView.ASSETS:
                return (
                  <AssetManager 
                    assets={userAssets} 
                    onAdd={a => setAssets(prev => [...prev, { ...a, userId: user.id }])} 
                    onDelete={id => setAssets(prev => prev.filter(a => a.id !== id))}
                    onEdit={(updatedA) => setAssets(prev => prev.map(a => a.id === updatedA.id ? updatedA : a))}
                  />
                );
              case AppView.SMART_ENTRY:
                return <SmartEntry onAddTransactions={handleAddTransactions} onDone={() => setCurrentView(AppView.TRANSACTIONS)} />;
              case AppView.INSIGHTS:
                return <FinancialInsights transactions={userTransactions} user={user} />;
              case AppView.PROFILE:
                return <Profile user={user} onUpdateUser={updateUser} />;
              case AppView.SETTINGS:
                return <Settings user={user} onUpdateUser={updateUser} />;
              case AppView.EXPORT:
                return <ExportPage transactions={userTransactions} wallets={userWallets} />;
              case AppView.NOTIFICATIONS:
                return <NotificationCenter />;
              case AppView.HELP:
                return <HelpCenter />;
              case AppView.ADMIN_DASHBOARD:
                return user.role === 'ADMIN' 
                  ? <AdminDashboard allTransactions={allTransactions} onRefresh={() => {}} /> 
                  : <ErrorPage code="403" onHome={() => setCurrentView(AppView.DASHBOARD)} />;
              default:
                return <ErrorPage code="404" onHome={() => setCurrentView(AppView.DASHBOARD)} />;
            }
          })()}
        </Layout>
      )}
    </>
  );
};

export default App;