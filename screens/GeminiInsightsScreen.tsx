import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { storage } from '../lib/storage';
import { geminiService } from '../lib/geminiService';
import { Transaction } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

const GeminiInsightsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const data = await storage.getTransactions();
    setTransactions(data);
  };

  const generateInsights = async () => {
    if (transactions.length === 0) {
      setError('No transactions found. Add some transactions to get insights.');
      return;
    }

    setLoading(true);
    setError('');
    setInsights('');

    try {
      const result = await geminiService.getFinancialInsights(transactions);
      setInsights(result);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      setError('Failed to generate insights. Please check your internet connection and API key.');
    } finally {
      setLoading(false);
    }
  };

  const getQuickStats = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const topCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as { [key: string]: number });

    const topCategoryName = Object.entries(topCategory)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

    return {
      totalTransactions: transactions.length,
      totalIncome,
      totalExpenses,
      balance,
      topCategory: topCategoryName,
    };
  };

  const stats = getQuickStats();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          AI Insights
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Quick Stats */}
        <View style={[styles.statsContainer, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.statsTitle, { color: isDark ? '#fff' : '#000' }]}>
            Quick Overview
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Ionicons name="document-text" size={24} color="#4ECDC4" />
              <Text style={[styles.statValue, { color: isDark ? '#fff' : '#000' }]}>
                {stats.totalTransactions}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#ccc' : '#666' }]}>
                Transactions
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trending-up" size={24} color="#4CAF50" />
              <Text style={[styles.statValue, { color: isDark ? '#fff' : '#000' }]}>
                ₹{stats.totalIncome.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#ccc' : '#666' }]}>
                Total Income
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trending-down" size={24} color="#F44336" />
              <Text style={[styles.statValue, { color: isDark ? '#fff' : '#000' }]}>
                ₹{stats.totalExpenses.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#ccc' : '#666' }]}>
                Total Expenses
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="wallet" size={24} color={stats.balance >= 0 ? '#4CAF50' : '#F44336'} />
              <Text style={[styles.statValue, { color: isDark ? '#fff' : '#000' }]}>
                ₹{stats.balance.toLocaleString('en-IN')}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#ccc' : '#666' }]}>
                Net Balance
              </Text>
            </View>
          </View>
          <View style={styles.topCategory}>
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={[styles.topCategoryText, { color: isDark ? '#fff' : '#000' }]}>
              Top spending category: <Text style={{ color: '#FFD700', fontWeight: 'bold' }}>{stats.topCategory}</Text>
            </Text>
          </View>
        </View>

        {/* Generate Insights Button */}
        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: loading ? '#ccc' : '#4ECDC4' }]}
          onPress={generateInsights}
          disabled={loading || transactions.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="bulb" size={24} color="#fff" />
          )}
          <Text style={styles.generateButtonText}>
            {loading ? 'Generating Insights...' : 'Generate AI Insights'}
          </Text>
        </TouchableOpacity>

        {/* Error Message */}
        {error ? (
          <View style={[styles.errorContainer, { backgroundColor: isDark ? '#2e1e1e' : '#ffebee' }]}>
            <Ionicons name="alert-circle" size={24} color="#F44336" />
            <Text style={[styles.errorText, { color: isDark ? '#ffab91' : '#c62828' }]}>
              {error}
            </Text>
          </View>
        ) : null}

        {/* AI Insights */}
        {insights ? (
          <View style={[styles.insightsContainer, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <View style={styles.insightsHeader}>
              <Ionicons name="bulb" size={24} color="#4ECDC4" />
              <Text style={[styles.insightsTitle, { color: isDark ? '#fff' : '#000' }]}>
                AI-Powered Insights
              </Text>
            </View>
            <Text style={[styles.insightsText, { color: isDark ? '#ccc' : '#333' }]}>
              {insights}
            </Text>
            <TouchableOpacity
              style={[styles.regenerateButton, { backgroundColor: '#45B7D1' }]}
              onPress={generateInsights}
            >
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.regenerateButtonText}>Regenerate</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Info Section */}
        {!insights && !loading && (
          <View style={[styles.infoContainer, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <Ionicons name="information-circle" size={48} color={isDark ? '#4ECDC4' : '#4ECDC4'} />
            <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#000' }]}>
              Get Smart Financial Insights
            </Text>
            <Text style={[styles.infoText, { color: isDark ? '#ccc' : '#666' }]}>
              Our AI analyzes your spending patterns and provides personalized recommendations to help you save money and achieve your financial goals.
            </Text>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={[styles.featureText, { color: isDark ? '#ccc' : '#666' }]}>
                  Spending pattern analysis
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={[styles.featureText, { color: isDark ? '#ccc' : '#666' }]}>
                  Savings opportunities
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={[styles.featureText, { color: isDark ? '#ccc' : '#666' }]}>
                  Budget recommendations
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={[styles.featureText, { color: isDark ? '#ccc' : '#666' }]}>
                  Financial goal suggestions
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  topCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  topCategoryText: {
    fontSize: 14,
    marginLeft: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
  insightsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  insightsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  regenerateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  regenerateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
  infoContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresList: {
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 10,
  },
});

export default GeminiInsightsScreen;