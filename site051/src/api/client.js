// API Client for TripLog

const API_BASE = '/api';

export const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('triplog_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('triplog_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('triplog_user');
  }
};

export async function request(endpoint, options = {}) {
  const currentUser = getStoredUser();
  const headers = {
    'Content-Type': 'application/json',
    ...(currentUser ? { 'X-User-Id': currentUser.id.toString() } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const bugHeader = response.headers.get('X-Bug-Triggered');
  const data = await response.json().catch(() => ({}));

  // Intentional bug trigger handler
  if (bugHeader || data._bug) {
    const bugInfo = data._bug || {
      id: bugHeader,
      message: `의도된 시스템 오류 [${bugHeader}]가 발생했습니다.`
    };

    window.dispatchEvent(new CustomEvent('triplog-bug-detected', {
      detail: bugInfo
    }));
  }

  if (!response.ok) {
    throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
  }

  return data;
}

export const api = {
  // Auth & Profile
  getProfile: () => request('/profile'),
  getUsers: () => request('/users'),
  login: (userId) => request('/auth/login', { method: 'POST', body: JSON.stringify({ userId }) }),

  // Travel Logs
  getTravelLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/travel-logs${query ? `?${query}` : ''}`);
  },
  getTravelLog: (id) => request(`/travel-logs/${id}`),
  createTravelLog: (data) => request('/travel-logs', { method: 'POST', body: JSON.stringify(data) }),
  updateTravelLog: (id, data) => request(`/travel-logs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTravelLog: (id) => request(`/travel-logs/${id}`, { method: 'DELETE' }),

  // Comments
  getComments: (logId) => request(`/travel-logs/${logId}/comments`),
  createComment: (logId, data) => request(`/travel-logs/${logId}/comments`, { method: 'POST', body: JSON.stringify(data) }),
  deleteComment: (id) => request(`/comments/${id}`, { method: 'DELETE' }),

  // Likes
  likeTravelLog: (id) => request(`/travel-logs/${id}/like`, { method: 'POST' }),
  unlikeTravelLog: (id) => request(`/travel-logs/${id}/like`, { method: 'DELETE' })
};
