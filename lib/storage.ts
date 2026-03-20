import AsyncStorage from '@react-native-async-storage/async-storage';

import { Transaction, Budget, AppSettings } from './types';

const TRANSACTIONS_KEY = '@transactions';
const BUDGETS_KEY = '@budgets';
const SETTINGS_KEY = '@settings';

export const storage = {
  async getTransactions(): Promise<Transaction[]> {
    try {
      const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  },

  async saveTransactions(transactions: Transaction[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error('Error saving transactions:', error);
    }
  },

  async getBudgets(): Promise<Budget[]> {
    try {
      const data = await AsyncStorage.getItem(BUDGETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading budgets:', error);
      return [];
    }
  },

  async saveBudgets(budgets: Budget[]): Promise<void> {
    try {
      await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    } catch (error) {
      console.error('Error saving budgets:', error);
    }
  },

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : { currency: '₹', darkMode: 'auto' };
    } catch (error) {
      console.error('Error loading settings:', error);
      return { currency: '₹', darkMode: 'auto' };
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },
};