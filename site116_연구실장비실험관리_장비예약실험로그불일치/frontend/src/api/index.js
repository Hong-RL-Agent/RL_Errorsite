const BASE = 'http://localhost:9615/api';

export const fetchResearchers = () => fetch(`${BASE}/researchers`).then(r => r.json());
export const fetchEquipments = () => fetch(`${BASE}/equipments`).then(r => r.json());
export const fetchReservations = () => fetch(`${BASE}/reservations`).then(r => r.json());
export const fetchExpLogs = () => fetch(`${BASE}/exp-logs`).then(r => r.json());
export const fetchMaintenanceRequests = () => fetch(`${BASE}/maintenance-requests`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchEquipmentsApi = (category, status, search) =>
  fetch(`${BASE}/equipments/search?category=${category}&status=${status}&search=${search}`).then(r => r.json());

export const patchReservationTimeApi = (id, startTime, endTime) =>
  fetch(`${BASE}/reservations/${id}/time`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startTime, endTime }) }).then(r => r.json());

export const addExpLogApi = (logData) =>
  fetch(`${BASE}/exp-logs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logData) }).then(r => r.json());

export const cancelReservationApi = (id) =>
  fetch(`${BASE}/reservations/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeEquipmentUseApi = (id) =>
  fetch(`${BASE}/reservations/${id}/complete-use`, { method: 'POST' }).then(r => r.json());

export const disableEquipmentUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/equipments/${id}/disable-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-researcher-role': role } }).then(r => r.json());

export const patchEquipmentPartialApi = (id, name, location, inspectCycleDays) =>
  fetch(`${BASE}/equipments/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, location, inspectCycleDays }) }).then(r => r.json());

export const deleteExpLogApi = (id) =>
  fetch(`${BASE}/exp-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
