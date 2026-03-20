export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string; // ISO date string
  createdAt: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
  spent: number;
  month: string; // YYYY-MM
}

export interface AppSettings {
  currency: string;
  darkMode: boolean | 'auto';
}

export type TransactionType = 'income' | 'expense';

export interface Category {
  name: string;
  icon: string;
  color: string;
}

export const defaultCategories: Category[] = [
  { name: 'Food', icon: 'restaurant', color: '#FF6B6B' },
  { name: 'Transport', icon: 'car', color: '#4ECDC4' },
  { name: 'Entertainment', icon: 'game-controller', color: '#45B7D1' },
  { name: 'Utilities', icon: 'bulb', color: '#FFA07A' },
  { name: 'Healthcare', icon: 'medical', color: '#98D8C8' },
  { name: 'Education', icon: 'school', color: '#F7DC6F' },
  { name: 'Shopping', icon: 'bag', color: '#BB8FCE' },
  { name: 'Salary', icon: 'cash', color: '#85C1E9' },
  { name: 'Freelance', icon: 'briefcase', color: '#F8C471' },
  { name: 'Investment', icon: 'trending-up', color: '#82E0AA' },
  { name: 'Other', icon: 'ellipsis-horizontal', color: '#D5DBDB' },
];