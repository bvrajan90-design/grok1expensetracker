import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { storage } from '../lib/storage';
import { csvExport } from '../lib/csvExport';
import { Transaction } from '../lib/types';
import Ionicons from '@expo/vector-icons/Ionicons';

const ExportScreen: React.FC = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  React.useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const data = await storage.getTransactions();
    setTransactions(data);
  };

  const handleExport = async () => {
    if (transactions.length === 0) {
      Alert.alert('No Data', 'No transactions found to export.');
      return;
    }

    setExporting(true);
    try {
      await csvExport.exportTransactionsToCSV(transactions, startDate || undefined, endDate || undefined);
      Alert.alert('Success', 'Transactions exported successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to export transactions. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const getFilteredCount = () => {
    if (!startDate && !endDate) return transactions.length;

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const startCheck = !startDate || transactionDate >= startDate;
      const endCheck = !endDate || transactionDate <= endDate;
      return startCheck && endCheck;
    }).length;
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
          Export Data
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Export Info */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
          <Ionicons name="information-circle" size={24} color="#4ECDC4" />
          <Text style={[styles.infoTitle, { color: isDark ? '#fff' : '#000' }]}>
            Export Transactions
          </Text>
          <Text style={[styles.infoText, { color: isDark ? '#ccc' : '#666' }]}>
            Export your transaction data as a CSV file. You can optionally filter by date range.
          </Text>
        </View>

        {/* Statistics */}
        <View style={[styles.statsCard, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.statsTitle, { color: isDark ? '#fff' : '#000' }]}>
            Export Summary
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4ECDC4' }]}>
                {transactions.length}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#ccc' : '#666' }]}>
                Total Transactions
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#4CAF50' }]}>
                {getFilteredCount()}
              </Text>
              <Text style={[styles.statLabel, { color: isDark ? '#ccc' : '#666' }]}>
                To Export
              </Text>
            </View>
          </View>
        </View>

        {/* Date Range Selection */}
        <View style={[styles.dateCard, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Date Range (Optional)
          </Text>

          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: isDark ? '#2e2e2e' : '#f5f5f5' }]}
            onPress={() => setShowStartPicker(true)}
          >
            <Ionicons name="calendar" size={20} color={isDark ? '#ccc' : '#666'} />
            <View style={styles.dateInfo}>
              <Text style={[styles.dateLabel, { color: isDark ? '#ccc' : '#666' }]}>
                From
              </Text>
              <Text style={[styles.dateValue, { color: isDark ? '#fff' : '#000' }]}>
                {formatDate(startDate)}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: isDark ? '#2e2e2e' : '#f5f5f5' }]}
            onPress={() => setShowEndPicker(true)}
          >
            <Ionicons name="calendar" size={20} color={isDark ? '#ccc' : '#666'} />
            <View style={styles.dateInfo}>
              <Text style={[styles.dateLabel, { color: isDark ? '#ccc' : '#666' }]}>
                To
              </Text>
              <Text style={[styles.dateValue, { color: isDark ? '#fff' : '#000' }]}>
                {formatDate(endDate)}
              </Text>
            </View>
          </TouchableOpacity>

          {(startDate || endDate) && (
            <TouchableOpacity
              style={[styles.clearButton, { backgroundColor: '#F44336' }]}
              onPress={clearFilters}
            >
              <Ionicons name="close" size={16} color="#fff" />
              <Text style={styles.clearButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartPicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndPicker(false);
              if (selectedDate) {
                setEndDate(selectedDate);
              }
            }}
          />
        )}

        {/* Export Button */}
        <TouchableOpacity
          style={[
            styles.exportButton,
            {
              backgroundColor: exporting || transactions.length === 0 ? '#ccc' : '#4ECDC4',
            }
          ]}
          onPress={handleExport}
          disabled={exporting || transactions.length === 0}
        >
          {exporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="download" size={24} color="#fff" />
          )}
          <Text style={styles.exportButtonText}>
            {exporting ? 'Exporting...' : 'Export to CSV'}
          </Text>
        </TouchableOpacity>

        {/* File Format Info */}
        <View style={[styles.formatCard, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
          <Ionicons name="document" size={24} color="#FFA07A" />
          <Text style={[styles.formatTitle, { color: isDark ? '#fff' : '#000' }]}>
            CSV File Format
          </Text>
          <Text style={[styles.formatText, { color: isDark ? '#ccc' : '#666' }]}>
            The exported file will include: Date, Type, Category, Description, Amount (₹), and Created At columns.
          </Text>
          <View style={styles.formatFeatures}>
            <View style={styles.formatFeature}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              <Text style={[styles.formatFeatureText, { color: isDark ? '#ccc' : '#666' }]}>
                Compatible with Excel & Google Sheets
              </Text>
            </View>
            <View style={styles.formatFeature}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              <Text style={[styles.formatFeatureText, { color: isDark ? '#ccc' : '#666' }]}>
                Includes all transaction details
              </Text>
            </View>
            <View style={styles.formatFeature}>
              <Ionicons name="checkmark-circle" size={14} color="#4CAF50" />
              <Text style={[styles.formatFeatureText, { color: isDark ? '#ccc' : '#666' }]}>
                Date range filtering supported
              </Text>
            </View>
          </View>
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
  infoCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsCard: {
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 5,
  },
  dateCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  dateInfo: {
    marginLeft: 10,
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  exportButton: {
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
  exportButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  formatCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  formatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },
  formatText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  formatFeatures: {
    marginTop: 10,
  },
  formatFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  formatFeatureText: {
    fontSize: 14,
    marginLeft: 8,
  },
});

export default ExportScreen;