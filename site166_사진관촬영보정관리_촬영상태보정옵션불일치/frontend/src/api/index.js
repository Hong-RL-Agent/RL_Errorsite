const BASE = 'http://localhost:9665/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchCustomers = () => fetch(`${BASE}/customers`).then(r => r.json());
export const fetchProducts = () => fetch(`${BASE}/products`).then(r => r.json());
export const fetchReservations = () => fetch(`${BASE}/reservations`).then(r => r.json());
export const fetchRetouchTasks = () => fetch(`${BASE}/retouch-tasks`).then(r => r.json());
export const fetchDispatchLogs = () => fetch(`${BASE}/dispatch-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchReservationsApi = (productCategory, status, search) =>
  fetch(`${BASE}/reservations/search?productCategory=${encodeURIComponent(productCategory)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchRetouchOptionApi = (id, retouchOption) =>
  fetch(`${BASE}/reservations/${id}/retouch-option`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ retouchOption }) }).then(r => r.json());

export const patchReservationStatusApi = (id, status) =>
  fetch(`${BASE}/reservations/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelReservationApi = (id) =>
  fetch(`${BASE}/reservations/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeDispatchApi = (id) =>
  fetch(`${BASE}/reservations/${id}/complete-dispatch`, { method: 'POST' }).then(r => r.json());

export const completeDispatchUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/reservations/${id}/dispatch-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchCustomerPartialApi = (id, customerName, phone, shootConcept) =>
  fetch(`${BASE}/customers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName, phone, shootConcept }) }).then(r => r.json());

export const deleteDispatchLogApi = (id) =>
  fetch(`${BASE}/dispatch-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
