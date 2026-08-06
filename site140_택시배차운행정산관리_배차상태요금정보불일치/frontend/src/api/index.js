const BASE = 'http://localhost:9639/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchDrivers = () => fetch(`${BASE}/drivers`).then(r => r.json());
export const fetchVehicles = () => fetch(`${BASE}/vehicles`).then(r => r.json());
export const fetchCalls = () => fetch(`${BASE}/calls`).then(r => r.json());
export const fetchRideLogs = () => fetch(`${BASE}/ride-logs`).then(r => r.json());
export const fetchSettlements = () => fetch(`${BASE}/settlements`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchCallsApi = (region, status, search) =>
  fetch(`${BASE}/calls/search?region=${encodeURIComponent(region)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchCallFeeApi = (id, actualFeeWon) =>
  fetch(`${BASE}/calls/${id}/fee`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actualFeeWon }) }).then(r => r.json());

export const patchCallStatusApi = (id, status) =>
  fetch(`${BASE}/calls/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelCallApi = (id) =>
  fetch(`${BASE}/calls/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeRideApi = (id) =>
  fetch(`${BASE}/calls/${id}/complete-ride`, { method: 'POST' }).then(r => r.json());

export const confirmSettlementUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/settlements/${id}/confirm-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchDriverPartialApi = (id, driverName, carNo, phone) =>
  fetch(`${BASE}/drivers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ driverName, carNo, phone }) }).then(r => r.json());

export const deleteRideLogApi = (id) =>
  fetch(`${BASE}/ride-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
