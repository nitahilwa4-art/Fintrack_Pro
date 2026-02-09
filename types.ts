
export type TransactionType = 'INCOME' | 'EXPENSE' | 'TRANSFER';

export type UserRole = 'ADMIN' | 'USER';

export type WalletType = 'CASH' | 'BANK' | 'E-WALLET';

export interface Wallet {
  id: string;
  userId: string;
  name: string;
  type: WalletType;
  balance: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string; // "system" for default, uuid for user custom
  name: string;
  type: TransactionType;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  walletId: string; // Source Wallet
  toWalletId?: string; // Destination Wallet (For Transfers)
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export interface Debt {
  id: string;
  userId: string;
  type: 'DEBT' | 'RECEIVABLE' | 'BILL'; 
  person: string; 
  amount: number;
  description: string;
  dueDate: string;
  isPaid: boolean;
}

export type BudgetFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  period: string; 
  frequency: BudgetFrequency;
}

export interface Asset {
  id: string;
  userId: string;
  name: string;
  value: number;
  type: 'GOLD' | 'STOCK' | 'CRYPTO' | 'PROPERTY' | 'OTHER';
}

export interface SummaryStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface BudgetCycle {
  type: 'MONTHLY' | 'WEEKLY' | 'CUSTOM';
  startDay?: number;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  SMART_ENTRY = 'SMART_ENTRY',
  INSIGHTS = 'INSIGHTS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  WALLETS = 'WALLETS',
  CATEGORIES = 'CATEGORIES',
  DEBTS = 'DEBTS',
  BUDGETS = 'BUDGETS',
  ASSETS = 'ASSETS'
}

// Helper to generate defaults
export const INITIAL_CATEGORIES: Omit<Category, 'id' | 'userId'>[] = [
  // Income
  { name: 'Gaji', type: 'INCOME', isDefault: true },
  { name: 'Bonus', type: 'INCOME', isDefault: true },
  { name: 'Investasi', type: 'INCOME', isDefault: true },
  { name: 'Lainnya', type: 'INCOME', isDefault: true },
  // Expense
  { name: 'Makanan', type: 'EXPENSE', isDefault: true },
  { name: 'Transportasi', type: 'EXPENSE', isDefault: true },
  { name: 'Belanja', type: 'EXPENSE', isDefault: true },
  { name: 'Tagihan', type: 'EXPENSE', isDefault: true },
  { name: 'Hiburan', type: 'EXPENSE', isDefault: true },
  { name: 'Kesehatan', type: 'EXPENSE', isDefault: true },
  { name: 'Pendidikan', type: 'EXPENSE', isDefault: true },
  { name: 'Lainnya', type: 'EXPENSE', isDefault: true },
  // Transfer
  { name: 'Transfer Antar Dompet', type: 'TRANSFER', isDefault: true },
  { name: 'Top Up E-Wallet', type: 'TRANSFER', isDefault: true },
  { name: 'Tarik Tunai', type: 'TRANSFER', isDefault: true },
  { name: 'Lainnya', type: 'TRANSFER', isDefault: true }
];
