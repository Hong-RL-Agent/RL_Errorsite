// BookNest API Client
const API_BASE = '/api';

export function notifyBugDetected(bugInfo) {
  const event = new CustomEvent('booknest-bug-detected', { detail: bugInfo });
  window.dispatchEvent(event);
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const bugHeader = res.headers.get('X-Bug-Triggered');
  if (bugHeader) {
    const bugInfoStr = res.headers.get('X-Bug-Info');
    let parsedInfo = null;
    try {
      if (bugInfoStr) parsedInfo = JSON.parse(decodeURIComponent(bugInfoStr));
    } catch (e) {}

    notifyBugDetected(parsedInfo || {
      id: bugHeader,
      endpoint: url,
      method: options.method || 'GET'
    });
  }

  if (!res.ok) {
    let errData = {};
    try {
      errData = await res.json();
    } catch (e) {}
    throw new Error(errData.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  if (data && data._bug) {
    notifyBugDetected(data._bug);
  }

  return data;
}

export const api = {
  getHealth: () => request('/health'),
  getCategories: () => request('/categories'),
  getBooks: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) query.append(k, v);
    });
    const qs = query.toString();
    return request(`/books${qs ? `?${qs}` : ''}`);
  },
  getBookById: (id) => request(`/books/${id}`),
  getBookReviews: (bookId) => request(`/books/${bookId}/reviews`),
  createBookReview: (bookId, reviewData) => request(`/books/${bookId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(reviewData)
  }),
  getLoans: () => request('/loans'),
  createLoan: (bookId) => request('/loans', {
    method: 'POST',
    body: JSON.stringify({ bookId })
  }),
  getLoanById: (id) => request(`/loans/${id}`),
  extendLoan: (id) => request(`/loans/${id}/extend`, {
    method: 'POST'
  }),
  returnLoan: (id) => request(`/loans/${id}/return`, {
    method: 'POST'
  }),
  getEbookPage: (id, page) => request(`/ebooks/${id}/pages/${page}`),
  getWishlist: () => request('/wishlist'),
  addToWishlist: (bookId) => request(`/wishlist/${bookId}`, {
    method: 'POST'
  }),
  removeFromWishlist: (bookId) => request(`/wishlist/${bookId}`, {
    method: 'DELETE'
  }),
  getProfile: () => request('/profile')
};
