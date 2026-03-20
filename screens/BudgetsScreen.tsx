import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { storage } from '../lib/storage';
import { geminiService } from '../lib/geminiService';
import { Budget, Transaction, defaultCategories } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

const BudgetsScreen: React.FC = () => {
  const { isDark, settings } = useTheme();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [generatingSuggestions, setGeneratingSuggestions] = useState(false);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const budgetsData = await storage.getBudgets();
    const transactionsData = await storage.getTransactions();
    setBudgets(budgetsData);
    setTransactions(transactionsData);
    setLoading(false);
  };

  const getCurrentMonthBudgets = () => {
    return budgets.filter(b => b.month === currentMonth);
  };

  const getSpentAmount = (category: string) => {
    return transactions
      .filter(t => t.type === 'expense' && t.category === category && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const handleAddBudget = async () => {
    if (!selectedCategory || !budgetAmount) {
      Alert.alert('Error', 'Please select a category and enter an amount');
      return;
    }

    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    // Check if budget already exists for this category and month
    const existingBudget = budgets.find(b => b.category === selectedCategory && b.month === currentMonth);
    if (existingBudget) {
      Alert.alert('Error', 'Budget already exists for this category this month');
      return;
    }

    const newBudget: Budget = {
      id: Date.now().toString(),
      category: selectedCategory,
      amount,
      spent: getSpentAmount(selectedCategory),
      month: currentMonth,
    };

    const updatedBudgets = [...budgets, newBudget];
    setBudgets(updatedBudgets);
    await storage.saveBudgets(updatedBudgets);

    setModalVisible(false);
    setSelectedCategory('');
    setBudgetAmount('');
    Alert.alert('Success', 'Budget added successfully');
  };

  const handleDeleteBudget = (budgetId: string) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedBudgets = budgets.filter(b => b.id !== budgetId);
            setBudgets(updatedBudgets);
            await storage.saveBudgets(updatedBudgets);
          },
        },
      ]
    );
  };

  const generateBudgetSuggestions = async () => {
    setGeneratingSuggestions(true);
    try {
      const suggestions = await geminiService.generateBudgetSuggestions(transactions);
      Alert.alert('Budget Suggestions', suggestions);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate budget suggestions');
    } finally {
      setGeneratingSuggestions(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const cat = defaultCategories.find(c => c.name === category);
    return cat?.color || '#D5DBDB';
  };

  const getBudgetProgress = (budget: Budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    return Math.min(percentage, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return '#4CAF50';
    if (percentage < 90) return '#FF9800';
    return '#F44336';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  const currentMonthBudgets = getCurrentMonthBudgets();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          Monthly Budgets
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#4ECDC4' }]}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* AI Suggestions Button */}
      <View style={styles.suggestionsContainer}>
        <TouchableOpacity
          style={[styles.suggestionsButton, { backgroundColor: '#45B7D1' }]}
          onPress={generateBudgetSuggestions}
          disabled={generatingSuggestions}
        >
          <Ionicons name="bulb" size={20} color="#fff" />
          <Text style={styles.suggestionsButtonText}>
            {generatingSuggestions ? 'Generating...' : 'Get AI Budget Suggestions'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Budgets List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {currentMonthBudgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="wallet-outline" size={64} color={isDark ? '#ccc' : '#666'} />
            <Text style={[styles.emptyText, { color: isDark ? '#ccc' : '#666' }]}>
              No budgets set for this month
            </Text>
            <Text style={[styles.emptySubtext, { color: isDark ? '#999' : '#999' }]}>
              Tap the + button to add your first budget
            </Text>
          </View>
        ) : (
          currentMonthBudgets.map((budget) => {
            const spent = getSpentAmount(budget.category);
            const progress = getBudgetProgress({ ...budget, spent });
            const progressColor = getProgressColor(progress);

            return (
              <View key={budget.id} style={[styles.budgetCard, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
                <View style={styles.budgetHeader}>
                  <View style={styles.categoryInfo}>
                    <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(budget.category) }]}>
                      <Ionicons
                        name={defaultCategories.find(c => c.name === budget.category)?.icon as any || 'ellipsis-horizontal'}
                        size={20}
                        color="#fff"
                      />
                    </View>
                    <View>
                      <Text style={[styles.categoryName, { color: isDark ? '#fff' : '#000' }]}>
                        {budget.category}
                      </Text>
                      <Text style={[styles.budgetPeriod, { color: isDark ? '#ccc' : '#666' }]}>
                        {new Date(currentMonth + '-01').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteBudget(budget.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={16} color="#F44336" />
                  </TouchableOpacity>
                </View>

                <View style={styles.budgetAmounts}>
                  <View style={styles.amountRow}>
                    <Text style={[styles.amountLabel, { color: isDark ? '#ccc' : '#666' }]}>
                      Spent: {settings.currency}{spent.toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.amountLabel, { color: isDark ? '#ccc' : '#666' }]}>
                      Budget: {settings.currency}{budget.amount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.amountRow}>
                    <Text style={[styles.amountLabel, { color: isDark ? '#ccc' : '#666' }]}>
                      Remaining: {settings.currency}{(budget.amount - spent).toLocaleString('en-IN')}
                    </Text>
                    <Text style={[styles.percentage, { color: progressColor }]}>
                      {progress.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${progress}%`,
                        backgroundColor: progressColor,
                      }
                    ]}
                  />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#fff' : '#000' }]}>
                Add Budget
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={isDark ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.categoryScroll}>
              {defaultCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categorySelect,
                    {
                      backgroundColor: selectedCategory === cat.name ? cat.color : 'transparent',
                    }
                  ]}
                  onPress={() => setSelectedCategory(cat.name)}
                >
                  <Ionicons name={cat.icon as any} size={20} color={selectedCategory === cat.name ? '#fff' : cat.color} />
                  <Text style={[
                    styles.categorySelectText,
                    {
                      color: selectedCategory === cat.name ? '#fff' : (isDark ? '#fff' : '#000'),
                    }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput
              style={[styles.budgetInput, { color: isDark ? '#fff' : '#000', backgroundColor: isDark ? '#2e2e2e' : '#f5f5f5' }]}
              placeholder="Budget amount"
              placeholderTextColor={isDark ? '#ccc' : '#666'}
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.saveBudgetButton, { backgroundColor: '#4ECDC4' }]}
              onPress={handleAddBudget}
            >
              <Text style={styles.saveBudgetButtonText}>Save Budget</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
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
  suggestionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  suggestionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  suggestionsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  budgetCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  budgetPeriod: {
    fontSize: 12,
    marginTop: 2,
  },
  deleteButton: {
    padding: 5,
  },
  budgetAmounts: {
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  amountLabel: {
    fontSize: 14,
  },
  percentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryScroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  categorySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 2,
    borderRadius: 8,
  },
  categorySelectText: {
    fontSize: 16,
    marginLeft: 10,
  },
  budgetInput: {
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 20,
  },
  saveBudgetButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveBudgetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BudgetsScreen;