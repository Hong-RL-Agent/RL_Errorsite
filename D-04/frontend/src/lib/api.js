const API_BASE = '/api';

export const api = {
  resetData: async () => {
    const res = await fetch(`${API_BASE}/test/reset`, { method: 'POST' });
    return res.json();
  },

  getBooks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/books${query ? `?${query}` : ''}`);
    return res.json();
  },

  getBook: async (id) => {
    const res = await fetch(`${API_BASE}/books/${id}`);
    return res.json();
  },

  createBook: async (payload) => {
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  updateBook: async (id, payload) => {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  deleteBook: async (id) => {
    const res = await fetch(`${API_BASE}/books/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  getUsers: async () => {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },

  getLoans: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/loans${query ? `?${query}` : ''}`);
    return res.json();
  },

  borrowBook: async (payload) => {
    const res = await fetch(`${API_BASE}/loans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  returnBook: async (loanId) => {
    const res = await fetch(`${API_BASE}/loans/${loanId}/return`, {
      method: 'PATCH'
    });
    return res.json();
  },

  getStats: async () => {
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  }
};
