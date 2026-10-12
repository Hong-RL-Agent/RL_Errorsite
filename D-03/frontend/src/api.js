const API_BASE = '/api';

export const api = {
  resetData: async () => {
    const res = await fetch(`${API_BASE}/test/reset`, { method: 'POST' });
    return res.json();
  },

  getExercises: async () => {
    const res = await fetch(`${API_BASE}/exercises`);
    return res.json();
  },

  getGoals: async () => {
    const res = await fetch(`${API_BASE}/goals`);
    return res.json();
  },

  toggleGoalCheck: async (id) => {
    const res = await fetch(`${API_BASE}/goals/${id}/check`, {
      method: 'PATCH'
    });
    return res.json();
  },

  getWorkouts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/workouts${query ? `?${query}` : ''}`);
    return res.json();
  },

  createWorkout: async (payload) => {
    const res = await fetch(`${API_BASE}/workouts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  toggleWorkoutComplete: async (id) => {
    const res = await fetch(`${API_BASE}/workouts/${id}/complete`, {
      method: 'PATCH'
    });
    return res.json();
  },

  updateWorkout: async (id, payload) => {
    const res = await fetch(`${API_BASE}/workouts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  deleteWorkout: async (id) => {
    const res = await fetch(`${API_BASE}/workouts/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  getWeeklyStats: async () => {
    const res = await fetch(`${API_BASE}/stats/weekly`);
    return res.json();
  }
};
