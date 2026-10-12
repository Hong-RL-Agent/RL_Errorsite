const API_BASE = '/api';

export const api = {
  // Test reset
  resetDatabase: async () => {
    const res = await fetch(`${API_BASE}/test/reset`, { method: 'POST' });
    return res.json();
  },

  // Catalog
  getCatalog: async () => {
    const res = await fetch(`${API_BASE}/catalog`);
    return res.json();
  },

  // Subscriptions
  getSubscriptions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/subscriptions${query ? `?${query}` : ''}`);
    return res.json();
  },

  subscribe: async (payload) => {
    const res = await fetch(`${API_BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  updatePlan: async (id, payload) => {
    const res = await fetch(`${API_BASE}/subscriptions/${id}/plan`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  updateAutoRenew: async (id, autoRenew) => {
    const res = await fetch(`${API_BASE}/subscriptions/${id}/auto-renew`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auto_renew: autoRenew })
    });
    return res.json();
  },

  cancelSubscription: async (id) => {
    const res = await fetch(`${API_BASE}/subscriptions/${id}/cancel`, {
      method: 'POST'
    });
    return res.json();
  },

  // Billing history
  getBillings: async () => {
    const res = await fetch(`${API_BASE}/billings`);
    return res.json();
  },

  deleteBilling: async (id) => {
    const res = await fetch(`${API_BASE}/billings/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`);
    return res.json();
  },

  markNotificationAsRead: async (id) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH'
    });
    return res.json();
  },

  // Analytics
  getAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics`);
    return res.json();
  }
};
