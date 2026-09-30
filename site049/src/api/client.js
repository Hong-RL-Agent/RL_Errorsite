// API Client for NeighborHands

const API_BASE = '/api';

export const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('neighborhands_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('neighborhands_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('neighborhands_user');
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

  // Detect intentional bug trigger from header or response payload
  if (bugHeader || data._bug) {
    const bugInfo = data._bug || {
      id: bugHeader,
      message: `의도된 시스템 오류 [${bugHeader}]가 발생했습니다.`
    };
    
    // Dispatch global custom event for the user popup
    window.dispatchEvent(new CustomEvent('neighborhands-bug-detected', {
      detail: bugInfo
    }));
  }

  if (!response.ok) {
    throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
  }

  return data;
}

export const api = {
  // Auth
  getMe: () => request('/auth/me'),
  getUsers: () => request('/auth/users'),
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  // Activities
  getActivities: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/activities${query ? `?${query}` : ''}`);
  },
  getActivity: (id) => request(`/activities/${id}`),
  createActivity: (data) => request('/activities', { method: 'POST', body: JSON.stringify(data) }),
  updateActivity: (id, data) => request(`/activities/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Enrollments
  getEnrollments: () => request('/enrollments'),
  joinActivity: (id) => request(`/activities/${id}/join`, { method: 'POST' }),
  cancelEnrollment: (id) => request(`/enrollments/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  // Community
  getPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/posts${query ? `?${query}` : ''}`);
  },
  getPost: (id) => request(`/posts/${id}`),
  createPost: (data) => request('/posts', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id, data) => request(`/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  likePost: (id) => request(`/posts/${id}/like`, { method: 'POST' }),

  // Comments
  getComments: (postId) => request(`/posts/${postId}/comments`),
  createComment: (postId, data) => request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(data) })
};
