import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { storage } from '../lib/storage';
import { geminiService } from '../lib/geminiService';
import { Transaction, TransactionType, defaultCategories } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

const AddTransactionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark, settings } = useTheme();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoCategorizing, setAutoCategorizing] = useState(false);

  const handleSave = async () => {
    if (!amount || !description || !category) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const transactions = await storage.getTransactions();
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        amount: numAmount,
        description: description.trim(),
        category,
        type,
        date: date.toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      };

      const updatedTransactions = [newTransaction, ...transactions];
      await storage.saveTransactions(updatedTransactions);

      Alert.alert('Success', 'Transaction added successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCategorize = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description first');
      return;
    }

    setAutoCategorizing(true);
    try {
      const suggestedCategory = await geminiService.categorizeTransaction(description);
      if (suggestedCategory && defaultCategories.find(c => c.name === suggestedCategory)) {
        setCategory(suggestedCategory);
        Alert.alert('Success', `Auto-categorized as: ${suggestedCategory}`);
      } else {
        Alert.alert('Info', 'Could not auto-categorize. Please select manually.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to auto-categorize');
    } finally {
      setAutoCategorizing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            Add Transaction
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Type Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
              Transaction Type
            </Text>
            <View style={styles.typeContainer}>
              {(['income', 'expense'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: type === t ? '#4ECDC4' : (isDark ? '#1e1e1e' : '#fff'),
                    }
                  ]}
                  onPress={() => setType(t)}
                >
                  <Text style={[
                    styles.typeButtonText,
                    {
                      color: type === t ? '#fff' : (isDark ? '#fff' : '#000'),
                    }
                  ]}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
              Amount ({settings.currency})
            </Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#fff' : '#000', backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}
              placeholder="0.00"
              placeholderTextColor={isDark ? '#ccc' : '#666'}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
          </View>

          {/* Description */}
          <View style={styles.section}>
            <View style={styles.descriptionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
                Description
              </Text>
              <TouchableOpacity
                style={[styles.autoCategorizeButton, { backgroundColor: '#45B7D1' }]}
                onPress={handleAutoCategorize}
                disabled={autoCategorizing}
              >
                <Ionicons name="bulb" size={16} color="#fff" />
                <Text style={styles.autoCategorizeText}>
                  {autoCategorizing ? 'Categorizing...' : 'Auto-Categorize'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.textArea, { color: isDark ? '#fff' : '#000', backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}
              placeholder="Enter transaction description..."
              placeholderTextColor={isDark ? '#ccc' : '#666'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {defaultCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.name}
                  style={[
                    styles.categoryButton,
                    {
                      backgroundColor: category === cat.name ? cat.color : (isDark ? '#1e1e1e' : '#fff'),
                      borderColor: cat.color,
                      borderWidth: category === cat.name ? 0 : 1,
                    }
                  ]}
                  onPress={() => setCategory(cat.name)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={category === cat.name ? '#fff' : cat.color}
                  />
                  <Text style={[
                    styles.categoryButtonText,
                    {
                      color: category === cat.name ? '#fff' : (isDark ? '#fff' : '#000'),
                    }
                  ]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
              Date
            </Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar" size={20} color={isDark ? '#ccc' : '#666'} />
              <Text style={[styles.dateText, { color: isDark ? '#fff' : '#000' }]}>
                {date.toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setDate(selectedDate);
                  }
                }}
              />
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: loading ? '#ccc' : '#4ECDC4' }]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save Transaction'}
            </Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  form: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  typeContainer: {
    flexDirection: 'row',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  autoCategorizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  autoCategorizeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  categoryScroll: {
    marginBottom: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  dateText: {
    fontSize: 16,
    marginLeft: 10,
  },
  saveButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddTransactionScreen;