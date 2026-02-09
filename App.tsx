import React, { useState, useEffect } from 'react';
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
import { Transaction, AppView, SummaryStats, User, Wallet, Budget, Debt, Asset } from './types';
import { getCurrentUser, logout } from './services/authService';
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  useEffect(() => {
    const session = getCurrentUser();
    if (session) setUser(session);
  }, []);

  const [allTransactions, setAllTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [wallets, setWallets] = useState<Wallet[]>(() => {
    const saved = localStorage.getItem('wallets');
    if (saved) return JSON.parse(saved);
    return [];
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

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(allTransactions));
    localStorage.setItem('wallets', JSON.stringify(wallets));
    localStorage.setItem('budgets', JSON.stringify(budgets));
    localStorage.setItem('debts', JSON.stringify(debts));
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [allTransactions, wallets, budgets, debts, assets]);

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

  const userTransactions = user ? allTransactions.filter(t => t.userId === user.id) : [];
  const userWallets = user ? wallets.filter(w => w.userId === user.id) : [];
  const userBudgets = user ? budgets.filter(b => b.userId === user.id) : [];
  const userDebts = user ? debts.filter(d => d.userId === user.id) : [];
  const userAssets = user ? assets.filter(a => a.userId === user.id) : [];

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
      const wIdx = updatedWallets.findIndex(w => w.id === t.walletId);
      if (wIdx !== -1) {
        updatedWallets[wIdx].balance += (t.type === 'INCOME' ? t.amount : -t.amount);
      }
    });
    
    setWallets(updatedWallets);
    setAllTransactions(prev => [...transactionsWithUser, ...prev]);
  };

  const handleAddSingleTransaction = (t: Omit<Transaction, 'userId'>) => {
    handleAddTransactions([t]);
  }

  const deleteTransaction = (id: string) => {
    const t = allTransactions.find(tx => tx.id === id);
    if (t) {
      const updatedWallets = [...wallets];
      const wIdx = updatedWallets.findIndex(w => w.id === t.walletId);
      if (wIdx !== -1) {
        // Reverse balance update
        updatedWallets[wIdx].balance -= (t.type === 'INCOME' ? t.amount : -t.amount);
      }
      setWallets(updatedWallets);
    }
    setAllTransactions(prev => prev.filter(t => t.id !== id));
  };

  const renderView = () => {
    if (!user) return <Auth onLogin={setUser} />;
    
    switch (currentView) {
      case AppView.DASHBOARD:
        return (
          <Dashboard 
            transactions={userTransactions} 
            stats={stats} 
            wallets={userWallets} 
            budgets={userBudgets} 
            debts={userDebts}
            onAddTransaction={handleAddSingleTransaction}
            onNavigateToSmartEntry={() => setCurrentView(AppView.SMART_ENTRY)}
          />
        );
      case AppView.TRANSACTIONS:
        return <TransactionList transactions={userTransactions} wallets={userWallets} onDelete={deleteTransaction} />;
      case AppView.WALLETS:
        return <WalletManager wallets={userWallets} onAdd={w => setWallets(prev => [...prev, { ...w, userId: user.id }])} onDelete={id => setWallets(prev => prev.filter(w => w.id !== id))} />;
      case AppView.BUDGETS:
        return <BudgetManager budgets={userBudgets} onAdd={b => setBudgets(prev => [...prev, { ...b, userId: user.id }])} onDelete={id => setBudgets(prev => prev.filter(b => b.id !== id))} />;
      case AppView.DEBTS:
        return <DebtManager debts={userDebts} onAdd={d => setDebts(prev => [...prev, { ...d, userId: user.id }])} onDelete={id => setDebts(prev => prev.filter(d => d.id !== id))} onTogglePaid={id => setDebts(prev => prev.map(d => d.id === id ? { ...d, isPaid: !d.isPaid } : d))} />;
      case AppView.ASSETS:
        return <AssetManager assets={userAssets} onAdd={a => setAssets(prev => [...prev, { ...a, userId: user.id }])} onDelete={id => setAssets(prev => prev.filter(a => a.id !== id))} />;
      case AppView.SMART_ENTRY:
        return <SmartEntry onAddTransactions={handleAddTransactions} onDone={() => setCurrentView(AppView.TRANSACTIONS)} />;
      case AppView.INSIGHTS:
        return <FinancialInsights transactions={userTransactions} />;
      case AppView.ADMIN_DASHBOARD:
        return user.role === 'ADMIN' ? <AdminDashboard allTransactions={allTransactions} onRefresh={() => {}} /> : <div className="text-red-500">Access Denied</div>;
      default:
        return (
          <Dashboard 
            transactions={userTransactions} 
            stats={stats} 
            wallets={userWallets} 
            budgets={userBudgets}
            debts={userDebts}
            onAddTransaction={handleAddSingleTransaction}
            onNavigateToSmartEntry={() => setCurrentView(AppView.SMART_ENTRY)}
          />
        );
    }
  };

  return (
    <Layout currentView={currentView} setCurrentView={setCurrentView} user={user} onLogout={() => { logout(); setUser(null); }}>
      {renderView()}
    </Layout>
  );
};

export default App;