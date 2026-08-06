const BASE = 'http://localhost:9623/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchBarns = () => fetch(`${BASE}/barns`).then(r => r.json());
export const fetchFeeds = () => fetch(`${BASE}/feeds`).then(r => r.json());
export const fetchLivestocks = () => fetch(`${BASE}/livestocks`).then(r => r.json());
export const fetchShipments = () => fetch(`${BASE}/shipments`).then(r => r.json());
export const fetchFeedLogs = () => fetch(`${BASE}/feed-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchLivestocksApi = (barnId, healthStatus, search) =>
  fetch(`${BASE}/livestocks/search?barnId=${barnId}&healthStatus=${healthStatus}&search=${search}`).then(r => r.json());

export const patchLivestockFeedApi = (id, feedStockKg) =>
  fetch(`${BASE}/livestocks/${id}/feed`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feedStockKg }) }).then(r => r.json());

export const patchLivestockStatusApi = (id, status) =>
  fetch(`${BASE}/livestocks/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelShipmentApi = (id) =>
  fetch(`${BASE}/livestocks/${id}/cancel-shipment`, { method: 'POST' }).then(r => r.json());

export const addHealthRecordApi = (id) =>
  fetch(`${BASE}/livestocks/${id}/add-health`, { method: 'POST' }).then(r => r.json());

export const confirmShipmentUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/livestocks/${id}/confirm-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchLivestockPartialApi = (id, weightKg, healthStatus, barnId) =>
  fetch(`${BASE}/livestocks/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weightKg, healthStatus, barnId }) }).then(r => r.json());

export const deleteFeedLogApi = (id) =>
  fetch(`${BASE}/feed-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
