const BASE = 'http://localhost:9642/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchStores = () => fetch(`${BASE}/stores`).then(r => r.json());
export const fetchProducts = () => fetch(`${BASE}/products`).then(r => r.json());
export const fetchDiscountLogs = () => fetch(`${BASE}/discount-logs`).then(r => r.json());
export const fetchDisposalLogs = () => fetch(`${BASE}/disposal-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchProductsApi = (storeName, status, search) =>
  fetch(`${BASE}/products/search?storeName=${encodeURIComponent(storeName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchProductDiscountRateApi = (id, discountRatePercent) =>
  fetch(`${BASE}/products/${id}/discount`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ discountRatePercent }) }).then(r => r.json());

export const patchProductStatusApi = (id, status) =>
  fetch(`${BASE}/products/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelDisposalApi = (id) =>
  fetch(`${BASE}/products/${id}/cancel-disposal`, { method: 'POST' }).then(r => r.json());

export const completeSoldOutApi = (id) =>
  fetch(`${BASE}/products/${id}/complete-soldout`, { method: 'POST' }).then(r => r.json());

export const confirmDisposalUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/products/${id}/confirm-disposal-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchProductPartialApi = (id, productName, storageTemp, expiryDate) =>
  fetch(`${BASE}/products/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productName, storageTemp, expiryDate }) }).then(r => r.json());

export const deleteDisposalLogApi = (id) =>
  fetch(`${BASE}/disposal-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
