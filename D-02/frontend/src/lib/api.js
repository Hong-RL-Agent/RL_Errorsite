const API_BASE = '/api';

export const api = {
  // Test Reset
  resetData: async () => {
    const res = await fetch(`${API_BASE}/test/reset`, { method: 'POST' });
    return res.json();
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },

  // Accounts
  getAccounts: async () => {
    const res = await fetch(`${API_BASE}/accounts`);
    return res.json();
  },

  // Budgets
  getBudgets: async () => {
    const res = await fetch(`${API_BASE}/budgets`);
    return res.json();
  },

  updateBudget: async (id, payload) => {
    const res = await fetch(`${API_BASE}/budgets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Transactions
  getTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/transactions${query ? `?${query}` : ''}`);
    return res.json();
  },

  createTransaction: async (payload) => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  updateTransaction: async (id, payload) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  deleteTransaction: async (id) => {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Monthly stats
  getMonthlyStats: async (yearMonth = '2026-10') => {
    const res = await fetch(`${API_BASE}/stats/monthly?year_month=${yearMonth}`);
    return res.json();
  }
};
