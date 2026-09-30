// API Client for SpaceMate

const API_BASE = '/api';

export function notifyBugDetected(bugInfo) {
  if (!bugInfo) return;
  const event = new CustomEvent('spacemate-bug-detected', {
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
    
    // Check if X-Bug-Triggered header or X-Bug-Info exists
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
      // Text / Blob response (e.g. CSV)
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
  getBranches: () => fetchApi('/branches'),
  getRooms: (params = {}, headers = {}) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        query.append(k, params[k]);
      }
    });
    const qs = query.toString();
    return fetchApi(`/rooms${qs ? '?' + qs : ''}`, { headers });
  },
  getRoomById: (id) => fetchApi(`/rooms/${id}`),
  getRoomAvailability: (id, date, params = {}, headers = {}) => {
    const query = new URLSearchParams({ date, ...(params || {}) });
    return fetchApi(`/rooms/${id}/availability?${query.toString()}`, { headers });
  },
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/bookings${query ? '?' + query : ''}`);
  },
  getBookingById: (id) => fetchApi(`/bookings/${id}`),
  createBooking: (bookingData) => fetchApi('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData)
  }),
  updateBookingMemo: (id, memo, headers = {}) => fetchApi(`/bookings/${id}/memo`, {
    method: 'PATCH',
    body: JSON.stringify({ memo }),
    headers
  }),
  cancelBooking: (id) => fetchApi(`/bookings/${id}`, { method: 'DELETE' }),
  getFavorites: () => fetchApi('/favorites'),
  addFavorite: (roomId) => fetchApi('/favorites', {
    method: 'POST',
    body: JSON.stringify({ roomId })
  }),
  removeFavorite: (roomId) => fetchApi(`/favorites/${roomId}`, { method: 'DELETE' }),
  getNotices: () => fetchApi('/notices'),
  getNoticeById: (id) => fetchApi(`/notices/${id}`)
};
