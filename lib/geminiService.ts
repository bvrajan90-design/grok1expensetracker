import { GoogleGenerativeAI } from '@google/generative-ai';
import { Transaction } from './types';

// You'll need to get your API key from Google AI Studio
// For production, store this securely (e.g., in environment variables)
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'your-api-key-here';

const genAI = new GoogleGenerativeAI(API_KEY);

export const geminiService = {
  async getFinancialInsights(transactions: Transaction[]): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Analyze the following financial transactions and provide insights in Indian Rupees (₹). Focus on spending patterns, savings opportunities, and financial advice:

${transactions.map(t =>
  `${t.type === 'income' ? 'Income' : 'Expense'}: ₹${t.amount} - ${t.category} - ${t.description} - ${new Date(t.date).toLocaleDateString()}`
).join('\n')}

Please provide:
1. Total income and expenses summary
2. Top spending categories
3. Savings recommendations
4. Any unusual spending patterns
5. Financial goals suggestions based on current data`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return 'Unable to generate insights at the moment. Please check your API key configuration.';
    }
  },

  async categorizeTransaction(description: string): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Categorize this financial transaction description into one of these categories: Food, Transport, Entertainment, Utilities, Healthcare, Education, Shopping, Salary, Freelance, Investment, Other.

Description: "${description}"

Return only the category name, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini categorization error:', error);
      return 'Other';
    }
  },

  async generateBudgetSuggestions(transactions: Transaction[]): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const expenses = transactions.filter(t => t.type === 'expense');
      const prompt = `Based on these expense transactions, suggest monthly budget allocations for each category in Indian Rupees:

${expenses.map(t => `${t.category}: ₹${t.amount} - ${t.description}`).join('\n')}

Provide realistic budget suggestions for each category based on the spending patterns. Format as:
Category: ₹Amount
Category: ₹Amount
etc.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini budget suggestion error:', error);
      return 'Unable to generate budget suggestions at the moment.';
    }
  },
};