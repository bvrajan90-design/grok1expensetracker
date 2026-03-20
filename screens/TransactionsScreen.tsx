import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { storage } from '../lib/storage';
import { Transaction } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

const TransactionsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { isDark, settings } = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    const data = await storage.getTransactions();
    const sortedData = data.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setTransactions(sortedData);
    setFilteredTransactions(sortedData);
    setLoading(false);
  };

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, filterType]);

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const deleteTransaction = (id: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedTransactions = transactions.filter(t => t.id !== id);
            setTransactions(updatedTransactions);
            await storage.saveTransactions(updatedTransactions);
          },
        },
      ]
    );
  };

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TouchableOpacity
      style={[styles.transactionItem, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}
      onPress={() => {
        // Could navigate to edit screen
        Alert.alert('Transaction Details', `${item.description}\n${item.category}\n${settings.currency}${item.amount}`);
      }}
    >
      <View style={styles.transactionLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: getCategoryColor(item.category) }]}>
          <Ionicons name={getCategoryIcon(item.category) as any} size={20} color="#fff" />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionDescription, { color: isDark ? '#fff' : '#000' }]}>
            {item.description}
          </Text>
          <Text style={[styles.transactionCategory, { color: isDark ? '#ccc' : '#666' }]}>
            {item.category} • {new Date(item.date).toLocaleDateString('en-IN')}
          </Text>
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[
          styles.transactionAmount,
          {
            color: item.type === 'income' ? '#4CAF50' : '#F44336',
          }
        ]}>
          {item.type === 'income' ? '+' : '-'}{settings.currency}{item.amount.toLocaleString('en-IN')}
        </Text>
        <TouchableOpacity
          onPress={() => deleteTransaction(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={16} color="#F44336" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getCategoryColor = (category: string) => {
    const categoryColors: { [key: string]: string } = {
      Food: '#FF6B6B',
      Transport: '#4ECDC4',
      Entertainment: '#45B7D1',
      Utilities: '#FFA07A',
      Healthcare: '#98D8C8',
      Education: '#F7DC6F',
      Shopping: '#BB8FCE',
      Salary: '#85C1E9',
      Freelance: '#F8C471',
      Investment: '#82E0AA',
    };
    return categoryColors[category] || '#D5DBDB';
  };

  const getCategoryIcon = (category: string) => {
    const categoryIcons: { [key: string]: string } = {
      Food: 'restaurant',
      Transport: 'car',
      Entertainment: 'game-controller',
      Utilities: 'bulb',
      Healthcare: 'medical',
      Education: 'school',
      Shopping: 'bag',
      Salary: 'cash',
      Freelance: 'briefcase',
      Investment: 'trending-up',
    };
    return categoryIcons[category] || 'ellipsis-horizontal';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
        <Text style={[styles.loadingText, { color: isDark ? '#fff' : '#000' }]}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          Transactions
        </Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#4ECDC4' }]}
          onPress={() => navigation.navigate('AddTransaction')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
          <Ionicons name="search" size={20} color={isDark ? '#ccc' : '#666'} />
          <TextInput
            style={[styles.searchInput, { color: isDark ? '#fff' : '#000' }]}
            placeholder="Search transactions..."
            placeholderTextColor={isDark ? '#ccc' : '#666'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(['all', 'income', 'expense'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              {
                backgroundColor: filterType === type ? '#4ECDC4' : (isDark ? '#1e1e1e' : '#fff'),
              }
            ]}
            onPress={() => setFilterType(type)}
          >
            <Text style={[
              styles.filterButtonText,
              {
                color: filterType === type ? '#fff' : (isDark ? '#fff' : '#000'),
              }
            ]}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transactions List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransactionItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={isDark ? '#ccc' : '#666'} />
            <Text style={[styles.emptyText, { color: isDark ? '#ccc' : '#666' }]}>
              No transactions found
            </Text>
          </View>
        }
        contentContainerStyle={filteredTransactions.length === 0 ? styles.emptyList : undefined}
      />
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  transactionLeft: {
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
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  deleteButton: {
    padding: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 10,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default TransactionsScreen;