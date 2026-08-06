const BASE = 'http://localhost:9614/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchPlans = () => fetch(`${BASE}/plans`).then(r => r.json());
export const fetchSeries = () => fetch(`${BASE}/series`).then(r => r.json());
export const fetchContents = () => fetch(`${BASE}/contents`).then(r => r.json());
export const fetchUsers = () => fetch(`${BASE}/users`).then(r => r.json());
export const fetchWatchLogs = () => fetch(`${BASE}/watch-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchContentsApi = (genre, status, search) =>
  fetch(`${BASE}/contents/search?genre=${genre}&status=${status}&search=${search}`).then(r => r.json());

export const patchContentPlanApi = (id, requiredPlan) =>
  fetch(`${BASE}/contents/${id}/plan`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requiredPlan }) }).then(r => r.json());

export const patchContentStatusApi = (id, status) =>
  fetch(`${BASE}/contents/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const makeContentPrivateApi = (id) =>
  fetch(`${BASE}/contents/${id}/make-private`, { method: 'POST' }).then(r => r.json());

export const addWatchLogApi = (id) =>
  fetch(`${BASE}/contents/${id}/watch-log`, { method: 'POST' }).then(r => r.json());

export const publishContentUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/contents/${id}/publish-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchContentPartialApi = (id, title, genre, rating) =>
  fetch(`${BASE}/contents/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, genre, rating }) }).then(r => r.json());

export const deleteWatchLogApi = (id) =>
  fetch(`${BASE}/watch-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
