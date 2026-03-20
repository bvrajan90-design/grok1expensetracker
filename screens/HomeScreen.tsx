import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { storage } from '../lib/storage';
import { Transaction } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDark, settings } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    let data = await storage.getTransactions();

    // Add sample data if no transactions exist
    if (data.length === 0) {
      const sampleTransactions = [
        {
          id: '1',
          amount: 50000,
          description: 'Monthly Salary',
          category: 'Salary',
          type: 'income' as const,
          date: new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          amount: 1200,
          description: 'Grocery shopping',
          category: 'Food',
          type: 'expense' as const,
          date: new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          amount: 500,
          description: 'Bus fare',
          category: 'Transport',
          type: 'expense' as const,
          date: new Date().toISOString().slice(0, 10),
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          amount: 2500,
          description: 'Movie tickets',
          category: 'Entertainment',
          type: 'expense' as const,
          date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), // Yesterday
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: '5',
          amount: 800,
          description: 'Electricity bill',
          category: 'Utilities',
          type: 'expense' as const,
          date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      await storage.saveTransactions(sampleTransactions);
      data = sampleTransactions;
    }

    setTransactions(data);
    setLoading(false);
  };

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const currentMonthTransactions = transactions.filter(t =>
    t.date.startsWith(currentMonth)
  );

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Prepare chart data for last 7 days
  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);

      const dayTransactions = transactions.filter(t => t.date.startsWith(dateStr));
      const income = dayTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = dayTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({
        date: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        income,
        expense,
      });
    }
    return data;
  };

  const chartData = getLast7DaysData();

  // Category pie chart data
  const getCategoryData = () => {
    const categories: { [key: string]: number } = {};
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    return Object.entries(categories)
      .map(([name, value]) => ({ name, value, color: getCategoryColor(name) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  };

  const getCategoryColor = (category: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];
    const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Healthcare'];
    const index = categories.indexOf(category);
    return colors[index] || colors[0];
  };

  const pieData = getCategoryData();

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            Financial Dashboard
          </Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#4ECDC4' }]}
            onPress={() => navigation.navigate('AddTransaction')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
            <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>Income</Text>
            <Text style={[styles.cardAmount, { color: '#4CAF50' }]}>
              {settings.currency}{totalIncome.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <Ionicons name="trending-down" size={24} color="#F44336" />
            <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>Expenses</Text>
            <Text style={[styles.cardAmount, { color: '#F44336' }]}>
              {settings.currency}{totalExpenses.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={[styles.summaryCard, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <Ionicons name="wallet" size={24} color={balance >= 0 ? '#4CAF50' : '#F44336'} />
            <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#000' }]}>Balance</Text>
            <Text style={[styles.cardAmount, { color: balance >= 0 ? '#4CAF50' : '#F44336' }]}>
              {settings.currency}{balance.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* 7-Day Trend Chart */}
        <View style={[styles.chartContainer, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.chartTitle, { color: isDark ? '#fff' : '#000' }]}>
            7-Day Trend
          </Text>
          <LineChart
            data={{
              labels: chartData.map(d => d.date),
              datasets: [
                {
                  data: chartData.map(d => d.income),
                  color: () => '#4CAF50',
                  strokeWidth: 2,
                },
                {
                  data: chartData.map(d => d.expense),
                  color: () => '#F44336',
                  strokeWidth: 2,
                },
              ],
            }}
            width={width - 40}
            height={220}
            chartConfig={{
              backgroundColor: isDark ? '#1e1e1e' : '#fff',
              backgroundGradientFrom: isDark ? '#1e1e1e' : '#fff',
              backgroundGradientTo: isDark ? '#1e1e1e' : '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(${isDark ? '255, 255, 255' : '0, 0, 0'}, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: isDark ? '#1e1e1e' : '#fff',
              },
            }}
            bezier
            style={styles.chart}
          />
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.legendText, { color: isDark ? '#fff' : '#000' }]}>Income</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
              <Text style={[styles.legendText, { color: isDark ? '#fff' : '#000' }]}>Expense</Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown */}
        {pieData.length > 0 && (
          <View style={[styles.chartContainer, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <Text style={[styles.chartTitle, { color: isDark ? '#fff' : '#000' }]}>
              Top Categories
            </Text>
            <PieChart
              data={pieData}
              width={width - 40}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#4ECDC4' }]}
            onPress={() => navigation.navigate('GeminiInsights')}
          >
            <Ionicons name="bulb" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>AI Insights</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#45B7D1' }]}
            onPress={() => navigation.navigate('Export')}
          >
            <Ionicons name="download" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
        </View>
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
    padding: 20,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  cardTitle: {
    fontSize: 12,
    marginTop: 5,
    opacity: 0.8,
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  chartContainer: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chart: {
    borderRadius: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    marginHorizontal: 5,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default HomeScreen;