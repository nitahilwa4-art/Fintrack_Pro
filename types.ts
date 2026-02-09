
export type TransactionType = 'INCOME' | 'EXPENSE';

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

export interface Transaction {
  id: string;
  userId: string;
  walletId: string; // New: linked to a specific wallet
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
}

export interface Debt {
  id: string;
  userId: string;
  type: 'DEBT' | 'RECEIVABLE' | 'BILL'; // Added BILL type
  person: string; // Used for Person Name OR Service Name (e.g., "PLN", "Netflix")
  amount: number;
  description: string;
  dueDate: string;
  isPaid: boolean;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  period: string; // e.g., '2025-05'
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

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  SMART_ENTRY = 'SMART_ENTRY',
  INSIGHTS = 'INSIGHTS',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  WALLETS = 'WALLETS',
  DEBTS = 'DEBTS',
  BUDGETS = 'BUDGETS',
  ASSETS = 'ASSETS'
}

export const CATEGORIES = {
  INCOME: ['Gaji', 'Bonus', 'Investasi', 'Lainnya'],
  EXPENSE: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Pendidikan', 'Lainnya']
};
