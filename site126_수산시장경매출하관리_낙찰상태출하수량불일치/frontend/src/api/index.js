const BASE = 'http://localhost:9625/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchWholesalers = () => fetch(`${BASE}/wholesalers`).then(r => r.json());
export const fetchItems = () => fetch(`${BASE}/items`).then(r => r.json());
export const fetchAuctions = () => fetch(`${BASE}/auctions`).then(r => r.json());
export const fetchShipmentLogs = () => fetch(`${BASE}/shipment-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchAuctionsApi = (origin, status, search) =>
  fetch(`${BASE}/auctions/search?origin=${origin}&status=${status}&search=${search}`).then(r => r.json());

export const patchAuctionQuantityApi = (id, quantityKg) =>
  fetch(`${BASE}/auctions/${id}/quantity`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantityKg }) }).then(r => r.json());

export const patchAuctionStatusApi = (id, status) =>
  fetch(`${BASE}/auctions/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelAuctionApi = (id) =>
  fetch(`${BASE}/auctions/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const confirmShipmentApi = (id) =>
  fetch(`${BASE}/auctions/${id}/confirm-shipment`, { method: 'POST' }).then(r => r.json());

export const confirmWinUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/auctions/${id}/confirm-win-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchItemPartialApi = (id, itemName, origin, tempStorage) =>
  fetch(`${BASE}/items/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemName, origin, tempStorage }) }).then(r => r.json());

export const deleteShipmentLogApi = (id) =>
  fetch(`${BASE}/shipment-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
