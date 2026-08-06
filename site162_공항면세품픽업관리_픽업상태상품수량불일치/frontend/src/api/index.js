const BASE = 'http://localhost:9661/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchCounters = () => fetch(`${BASE}/counters`).then(r => r.json());
export const fetchPassengers = () => fetch(`${BASE}/passengers`).then(r => r.json());
export const fetchOrders = () => fetch(`${BASE}/orders`).then(r => r.json());
export const fetchProducts = () => fetch(`${BASE}/products`).then(r => r.json());
export const fetchPickupLogs = () => fetch(`${BASE}/pickup-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchOrdersApi = (counterName, status, search) =>
  fetch(`${BASE}/orders/search?counterName=${encodeURIComponent(counterName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchItemQuantityApi = (id, itemQuantity) =>
  fetch(`${BASE}/orders/${id}/quantity`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemQuantity }) }).then(r => r.json());

export const patchOrderStatusApi = (id, status) =>
  fetch(`${BASE}/orders/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelOrderApi = (id) =>
  fetch(`${BASE}/orders/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completePickupApi = (id) =>
  fetch(`${BASE}/orders/${id}/complete-pickup`, { method: 'POST' }).then(r => r.json());

export const completePickupUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/orders/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchPassengerPartialApi = (id, passengerName, flightNo, passportEnglishName) =>
  fetch(`${BASE}/passengers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passengerName, flightNo, passportEnglishName }) }).then(r => r.json());

export const deletePickupLogApi = (id) =>
  fetch(`${BASE}/pickup-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
