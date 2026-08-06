const BASE = 'http://localhost:9633/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchFlowers = () => fetch(`${BASE}/flowers`).then(r => r.json());
export const fetchBuyers = () => fetch(`${BASE}/buyers`).then(r => r.json());
export const fetchAuctions = () => fetch(`${BASE}/auctions`).then(r => r.json());
export const fetchWinningBids = () => fetch(`${BASE}/winning-bids`).then(r => r.json());
export const fetchDeliveryOrders = () => fetch(`${BASE}/delivery-orders`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchAuctionsApi = (flowerName, status, search) =>
  fetch(`${BASE}/auctions/search?flowerName=${encodeURIComponent(flowerName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchAuctionDeliveryQtyApi = (id, deliveryQty) =>
  fetch(`${BASE}/auctions/${id}/delivery-qty`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ deliveryQty }) }).then(r => r.json());

export const patchAuctionStatusApi = (id, status) =>
  fetch(`${BASE}/auctions/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelAuctionApi = (id) =>
  fetch(`${BASE}/auctions/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const dispatchDeliveryApi = (id) =>
  fetch(`${BASE}/auctions/${id}/dispatch`, { method: 'POST' }).then(r => r.json());

export const confirmAuctionUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/auctions/${id}/confirm-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchFlowerPartialApi = (id, flowerName, grade, tempSetting) =>
  fetch(`${BASE}/flowers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ flowerName, grade, tempSetting }) }).then(r => r.json());

export const deleteDeliveryOrderApi = (id) =>
  fetch(`${BASE}/delivery-orders/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
