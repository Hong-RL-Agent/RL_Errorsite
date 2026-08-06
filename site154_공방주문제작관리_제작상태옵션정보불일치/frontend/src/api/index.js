const BASE = 'http://localhost:9653/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchArtisans = () => fetch(`${BASE}/artisans`).then(r => r.json());
export const fetchCustomers = () => fetch(`${BASE}/customers`).then(r => r.json());
export const fetchOptions = () => fetch(`${BASE}/options`).then(r => r.json());
export const fetchOrders = () => fetch(`${BASE}/orders`).then(r => r.json());
export const fetchCraftLogs = () => fetch(`${BASE}/craft-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchOrdersApi = (optionType, status, search) =>
  fetch(`${BASE}/orders/search?optionType=${encodeURIComponent(optionType)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchOrderOptionColorApi = (id, optionColor) =>
  fetch(`${BASE}/orders/${id}/option-color`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ optionColor }) }).then(r => r.json());

export const patchOrderStatusApi = (id, status) =>
  fetch(`${BASE}/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelOrderApi = (id) =>
  fetch(`${BASE}/orders/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const shipOrderApi = (id) =>
  fetch(`${BASE}/orders/${id}/ship`, { method: 'POST' }).then(r => r.json());

export const shipOrderUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/orders/${id}/ship-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchCustomerPartialApi = (id, customerName, phone, deliveryNote, optionColor) =>
  fetch(`${BASE}/customers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName, phone, deliveryNote, optionColor }) }).then(r => r.json());

export const deleteCraftLogApi = (id) =>
  fetch(`${BASE}/craft-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
