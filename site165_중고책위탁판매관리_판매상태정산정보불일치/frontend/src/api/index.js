const BASE = 'http://localhost:9664/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchConsignors = () => fetch(`${BASE}/consignors`).then(r => r.json());
export const fetchBooks = () => fetch(`${BASE}/books`).then(r => r.json());
export const fetchSales = () => fetch(`${BASE}/sales`).then(r => r.json());
export const fetchSettlements = () => fetch(`${BASE}/settlements`).then(r => r.json());
export const fetchInspectionLogs = () => fetch(`${BASE}/inspection-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchBooksApi = (category, status, search) =>
  fetch(`${BASE}/books/search?category=${encodeURIComponent(category)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchPayoutAmountApi = (id, payoutAmount) =>
  fetch(`${BASE}/books/${id}/payout`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payoutAmount }) }).then(r => r.json());

export const patchBookStatusApi = (id, status) =>
  fetch(`${BASE}/books/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelSaleApi = (id) =>
  fetch(`${BASE}/books/${id}/cancel-sale`, { method: 'POST' }).then(r => r.json());

export const processSettlementCompleteApi = (id) =>
  fetch(`${BASE}/books/${id}/process-settlement`, { method: 'POST' }).then(r => r.json());

export const processSettlementUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/books/${id}/settle-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchBookPartialApi = (id, title, author, priceWon) =>
  fetch(`${BASE}/books/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, author, priceWon }) }).then(r => r.json());

export const deleteInspectionLogApi = (id) =>
  fetch(`${BASE}/inspection-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
