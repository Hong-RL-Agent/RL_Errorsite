// API Client for NearBuy

const API_BASE = '/api';

export function notifyBugDetected(bugInfo) {
  if (!bugInfo) return;
  const event = new CustomEvent('nearbuy-bug-detected', {
    detail: bugInfo
  });
  window.dispatchEvent(event);
}

export async function fetchApi(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    
    // Check headers
    const bugTriggered = res.headers.get('X-Bug-Triggered');
    const bugInfoJson = res.headers.get('X-Bug-Info');

    if (bugInfoJson) {
      try {
        const parsed = JSON.parse(decodeURIComponent(bugInfoJson));
        notifyBugDetected(parsed);
      } catch (e) {
        try {
          const parsed = JSON.parse(bugInfoJson);
          notifyBugDetected(parsed);
        } catch (err) {}
      }
    }

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (data._bug) {
        notifyBugDetected(data._bug);
      } else if (bugTriggered && !data._bug) {
        notifyBugDetected({ id: bugTriggered, endpoint, method: options.method || 'GET' });
      }

      if (!res.ok && !data.success) {
        const error = new Error(data.message || 'API request failed');
        error.data = data;
        error.status = res.status;
        throw error;
      }
      return data;
    } else {
      if (bugTriggered) {
        notifyBugDetected({ id: bugTriggered, endpoint, method: options.method || 'GET' });
      }
      return res;
    }
  } catch (err) {
    if (err.data && err.data._bug) {
      notifyBugDetected(err.data._bug);
    }
    throw err;
  }
}

export const api = {
  getCategories: () => fetchApi('/categories'),
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        query.append(k, params[k]);
      }
    });
    const qs = query.toString();
    return fetchApi(`/products${qs ? '?' + qs : ''}`);
  },
  getProductById: (id) => fetchApi(`/products/${id}`),
  createProduct: (productData, headers = {}) => fetchApi('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
    headers
  }),
  updateProduct: (id, updates) => fetchApi(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  deleteProduct: (id) => fetchApi(`/products/${id}`, { method: 'DELETE' }),
  likeProduct: (id) => fetchApi(`/products/${id}/like`, { method: 'POST' }),
  unlikeProduct: (id) => fetchApi(`/products/${id}/like`, { method: 'DELETE' }),
  getSellerById: (id) => fetchApi(`/sellers/${id}`),
  getChats: () => fetchApi('/chats'),
  getChatById: (id) => fetchApi(`/chats/${id}`),
  sendMessage: (chatId, text) => fetchApi(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text })
  }),
  submitReport: (reportData, headers = {}) => fetchApi('/reports', {
    method: 'POST',
    body: JSON.stringify(reportData),
    headers
  }),
  getProfile: () => fetchApi('/profile'),
  getMyProducts: () => fetchApi('/my-products')
};
