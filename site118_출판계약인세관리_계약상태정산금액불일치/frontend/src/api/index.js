const BASE = 'http://localhost:9617/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchAuthors = () => fetch(`${BASE}/authors`).then(r => r.json());
export const fetchBooks = () => fetch(`${BASE}/books`).then(r => r.json());
export const fetchContracts = () => fetch(`${BASE}/contracts`).then(r => r.json());
export const fetchSettlements = () => fetch(`${BASE}/settlements`).then(r => r.json());
export const fetchSalesLogs = () => fetch(`${BASE}/sales-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchBooksApi = (genre, status, search) =>
  fetch(`${BASE}/books/search?genre=${genre}&status=${status}&search=${search}`).then(r => r.json());

export const patchContractRoyaltyApi = (id, royaltyRate) =>
  fetch(`${BASE}/contracts/${id}/royalty`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ royaltyRate }) }).then(r => r.json());

export const patchContractStatusApi = (id, status) =>
  fetch(`${BASE}/contracts/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelContractApi = (id) =>
  fetch(`${BASE}/contracts/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const addSalesCopiesApi = (id, copies = 1000) =>
  fetch(`${BASE}/contracts/${id}/add-sales`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ copies }) }).then(r => r.json());

export const confirmSettlementUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/settlements/${id}/confirm-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchBookPartialApi = (id, title, pubDate, royaltyRate) =>
  fetch(`${BASE}/books/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, pubDate, royaltyRate }) }).then(r => r.json());

export const deleteSalesLogApi = (id) =>
  fetch(`${BASE}/sales-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
