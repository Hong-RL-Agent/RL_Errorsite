// API Client for TableNote

const API_BASE = '/api';

export const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('tablenote_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('tablenote_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('tablenote_user');
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
      message: `의도된 시스템 오류 [${bugHeader}]가 감지되었습니다.`
    };

    window.dispatchEvent(new CustomEvent('tablenote-bug-detected', {
      detail: bugInfo
    }));
  }

  if (!response.ok) {
    throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
  }

  return data;
}

export const api = {
  // Profile & Auth
  getProfile: () => request('/profile'),
  getUsers: () => request('/users'),
  login: (userId) => request('/auth/login', { method: 'POST', body: JSON.stringify({ userId }) }),

  // Recipes
  getRecipes: (params = {}) => {
    // Note: For SEC-430, we intentionally allow query with raw search if passed
    const query = new URLSearchParams(params).toString();
    return request(`/recipes${query ? `?${query}` : ''}`);
  },
  getRecipe: (id) => request(`/recipes/${id}`),
  createRecipe: (data) => request('/recipes', { method: 'POST', body: JSON.stringify(data) }),
  updateRecipe: (id, data, isAutosave = false) => request(`/recipes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...data, ...(isAutosave ? { _autosave: true } : {}) }),
    headers: isAutosave ? { 'X-Autosave': 'true' } : {}
  }),
  deleteRecipe: (id) => request(`/recipes/${id}`, { method: 'DELETE' }),

  // Favorites
  getFavorites: () => request('/favorites'),
  addFavorite: (recipeId) => request(`/favorites/${recipeId}`, { method: 'POST' }),
  removeFavorite: (recipeId) => request(`/favorites/${recipeId}`, { method: 'DELETE' }),

  // Meal Plans
  getMealPlans: () => request('/meal-plans'),
  addMealPlan: (data) => request('/meal-plans', { method: 'POST', body: JSON.stringify(data) }),
  updateMealPlan: (id, data) => request(`/meal-plans/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMealPlan: (id) => request(`/meal-plans/${id}`, { method: 'DELETE' }),

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
