import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Transaction } from './types';

export const csvExport = {
  async exportTransactionsToCSV(
    transactions: Transaction[],
    startDate?: Date,
    endDate?: Date
  ): Promise<void> {
    try {
      // Filter transactions by date range if provided
      let filteredTransactions = transactions;
      if (startDate && endDate) {
        filteredTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      }

      // Sort by date
      filteredTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Create CSV header
      const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (₹)', 'Created At'];

      // Create CSV rows
      const rows = filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString('en-IN'),
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.category,
        `"${t.description.replace(/"/g, '""')}"`, // Escape quotes in description
        t.amount.toString(),
        new Date(t.createdAt).toLocaleString('en-IN'),
      ]);

      // Combine headers and rows
      const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');

      // Create filename with date range
      const startStr = startDate ? startDate.toISOString().split('T')[0] : 'all';
      const endStr = endDate ? endDate.toISOString().split('T')[0] : 'all';
      const filename = `transactions_${startStr}_to_${endStr}.csv`;

      // Save to document directory
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Transactions',
        });
      } else {
        console.log('Sharing not available, file saved to:', fileUri);
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw new Error('Failed to export transactions to CSV');
    }
  },
};