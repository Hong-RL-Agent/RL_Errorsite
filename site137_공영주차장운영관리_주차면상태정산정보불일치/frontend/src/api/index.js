const BASE = 'http://localhost:9636/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchParkingLots = () => fetch(`${BASE}/parking-lots`).then(r => r.json());
export const fetchParkingSpaces = () => fetch(`${BASE}/parking-spaces`).then(r => r.json());
export const fetchParkingRecords = () => fetch(`${BASE}/parking-records`).then(r => r.json());
export const fetchSettlements = () => fetch(`${BASE}/settlements`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchRecordsApi = (lotId, status, search) =>
  fetch(`${BASE}/parking-records/search?lotId=${lotId}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchRecordFeeApi = (id, feeWon) =>
  fetch(`${BASE}/parking-records/${id}/fee`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ feeWon }) }).then(r => r.json());

export const patchSpaceStatusApi = (id, status) =>
  fetch(`${BASE}/parking-spaces/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelExitApi = (id) =>
  fetch(`${BASE}/parking-records/${id}/cancel-exit`, { method: 'POST' }).then(r => r.json());

export const completeSettlementApi = (id) =>
  fetch(`${BASE}/parking-records/${id}/complete-settlement`, { method: 'POST' }).then(r => r.json());

export const cancelSettlementUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/settlements/${id}/cancel-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchVehiclePartialApi = (id, carNo, carType, phone) =>
  fetch(`${BASE}/parking-records/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ carNo, carType, phone }) }).then(r => r.json());

export const deleteSettlementApi = (id) =>
  fetch(`${BASE}/settlements/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
