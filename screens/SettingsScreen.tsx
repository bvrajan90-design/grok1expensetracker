import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { storage } from '../lib/storage';
import Ionicons from '@expo/vector-icons/Ionicons';

const SettingsScreen: React.FC = () => {
  const { isDark, settings, toggleDarkMode, setAutoMode } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all transactions and budgets. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await storage.saveTransactions([]);
              await storage.saveBudgets([]);
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    // This would navigate to the export screen
    Alert.alert('Export Data', 'Navigate to Export screen to export your data');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#121212' : '#f5f5f5' }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>
            Settings
          </Text>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Appearance
          </Text>

          <View style={[styles.settingItem, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="moon" size={24} color={isDark ? '#4ECDC4' : '#666'} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Dark Mode
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  {settings.darkMode === 'auto' ? 'Follow system' : settings.darkMode ? 'On' : 'Off'}
                </Text>
              </View>
            </View>
            <Switch
              value={settings.darkMode === true}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#767577', true: '#4ECDC4' }}
              thumbColor={settings.darkMode === true ? '#fff' : '#f4f3f4'}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark ? '#1e1e1e' : '#fff',
                opacity: settings.darkMode === 'auto' ? 0.6 : 1,
              }
            ]}
            onPress={setAutoMode}
            disabled={settings.darkMode === 'auto'}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="phone-portrait" size={24} color={isDark ? '#45B7D1' : '#666'} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Auto Dark Mode
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Follow system appearance
                </Text>
              </View>
            </View>
            <View style={styles.radioContainer}>
              <View style={[
                styles.radio,
                {
                  backgroundColor: settings.darkMode === 'auto' ? '#4ECDC4' : 'transparent',
                  borderColor: '#4ECDC4',
                }
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Currency Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Currency
          </Text>

          <View style={[styles.settingItem, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="cash" size={24} color={isDark ? '#FFA07A' : '#666'} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Currency Symbol
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  {settings.currency} (Indian Rupee)
                </Text>
              </View>
            </View>
            <Text style={[styles.currencyDisplay, { color: isDark ? '#4ECDC4' : '#4ECDC4' }]}>
              {settings.currency}
            </Text>
          </View>
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            Data Management
          </Text>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}
            onPress={handleExportData}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="download" size={24} color={isDark ? '#98D8C8' : '#666'} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Export Data
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Export transactions to CSV
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={isDark ? '#ccc' : '#666'} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}
            onPress={handleClearData}
            disabled={loading}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="trash" size={24} color="#F44336" />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: '#F44336' }]}>
                  Clear All Data
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Delete all transactions and budgets
                </Text>
              </View>
            </View>
            {loading && <Ionicons name="reload" size={20} color="#F44336" />}
          </TouchableOpacity>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#000' }]}>
            About
          </Text>

          <View style={[styles.settingItem, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle" size={24} color={isDark ? '#F7DC6F' : '#666'} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Version
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  1.0.0
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.settingItem, { backgroundColor: isDark ? '#1e1e1e' : '#fff' }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="bulb" size={24} color={isDark ? '#BB8FCE' : '#666'} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: isDark ? '#fff' : '#000' }]}>
                  Powered by AI
                </Text>
                <Text style={[styles.settingSubtitle, { color: isDark ? '#ccc' : '#666' }]}>
                  Google Gemini Intelligence
                </Text>
              </View>
            </View>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDark ? '#999' : '#999' }]}>
            Income & Expense Tracker
          </Text>
          <Text style={[styles.footerText, { color: isDark ? '#666' : '#666' }]}>
            Built with React Native & Expo
          </Text>
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
    paddingTop: 10,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 15,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  radioContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radio: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  currencyDisplay: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default SettingsScreen;