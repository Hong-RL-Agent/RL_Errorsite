const BASE = 'http://localhost:9635/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchDonors = () => fetch(`${BASE}/donors`).then(r => r.json());
export const fetchDistributors = () => fetch(`${BASE}/distributors`).then(r => r.json());
export const fetchBooks = () => fetch(`${BASE}/books`).then(r => r.json());
export const fetchClassifyLogs = () => fetch(`${BASE}/classify-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchBooksApi = (category, status, search) =>
  fetch(`${BASE}/books/search?category=${encodeURIComponent(category)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchBookDistributorApi = (id, distributorName) =>
  fetch(`${BASE}/books/${id}/distributor`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ distributorName }) }).then(r => r.json());

export const patchBookStatusApi = (id, status) =>
  fetch(`${BASE}/books/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelBookApi = (id) =>
  fetch(`${BASE}/books/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeDistributionApi = (id) =>
  fetch(`${BASE}/books/${id}/complete-distribution`, { method: 'POST' }).then(r => r.json());

export const completeDistributionUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/books/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchBookPartialApi = (id, title, author, conditionGrade) =>
  fetch(`${BASE}/books/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, author, conditionGrade }) }).then(r => r.json());

export const deleteClassifyLogApi = (id) =>
  fetch(`${BASE}/classify-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
