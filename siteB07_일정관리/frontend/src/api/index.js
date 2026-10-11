export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:9721';

async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error((json && json.error && json.error.message) || '요청을 처리하지 못했습니다.');
    err.status = res.status;
    err.code = json && json.error && json.error.code;
    throw err;
  }
  return json;
}

const qs = (o) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, v); });
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  health: () => request('/health'),
  categories: () => request('/categories'),
  calendar: (view, date, extra = {}) => request(`/events/calendar${qs({ view, date, ...extra })}`),
  events: (params) => request(`/events${qs(params)}`),
  search: (params) => request(`/events/search${qs(params)}`),
  statistics: (date) => request(`/events/statistics${qs({ date })}`),
  event: (id) => request(`/events/${id}`),
  createEvent: (body) => request('/events', { method: 'POST', body }),
  updateEvent: (id, body) => request(`/events/${id}`, { method: 'PATCH', body }),
  deleteEvent: (id, scope) => request(`/events/${id}${qs({ scope })}`, { method: 'DELETE' }),
  recurring: () => request('/recurring-events'),
  updateRecurring: (id, body) => request(`/recurring-events/${id}`, { method: 'PATCH', body }),
  tasks: (status) => request(`/tasks${qs({ status })}`),
  createTask: (body) => request('/tasks', { method: 'POST', body }),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PATCH', body }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
  notes: (eventId) => request(`/events/${eventId}/notes`),
  createNote: (eventId, body) => request(`/events/${eventId}/notes`, { method: 'POST', body: { body } }),
  updateNote: (id, body) => request(`/notes/${id}`, { method: 'PATCH', body: { body } }),
  notifications: () => request('/notifications?limit=40'),
  markNotification: (id, read) => request(`/notifications/${id}/read`, { method: 'PATCH', body: { read } }),
  activity: (limit = 30) => request(`/activity?limit=${limit}`),
  reset: () => request('/test/reset', { method: 'POST' }),
};

// 행동 로그 (콘솔 객체로 확인)
export function logAction(type, detail = '') {
  try {
    const list = (window.__dayNestActions = window.__dayNestActions || []);
    list.push({ at: Date.now(), type, detail });
    if (list.length > 300) list.shift();
  } catch (e) { /* ignore */ }
}
