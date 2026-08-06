const BASE = 'http://localhost:9619/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchStations = () => fetch(`${BASE}/stations`).then(r => r.json());
export const fetchChargers = () => fetch(`${BASE}/chargers`).then(r => r.json());
export const fetchReservations = () => fetch(`${BASE}/reservations`).then(r => r.json());
export const fetchChargeLogs = () => fetch(`${BASE}/charge-logs`).then(r => r.json());
export const fetchBreakdownReports = () => fetch(`${BASE}/breakdown-reports`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchChargersApi = (stationId, status, search) =>
  fetch(`${BASE}/chargers/search?stationId=${stationId}&status=${status}&search=${search}`).then(r => r.json());

export const patchReservationChargerApi = (id, chargerId) =>
  fetch(`${BASE}/reservations/${id}/charger`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chargerId }) }).then(r => r.json());

export const patchReservationTimeApi = (id, startTime, endTime) =>
  fetch(`${BASE}/reservations/${id}/time`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startTime, endTime }) }).then(r => r.json());

export const cancelReservationApi = (id) =>
  fetch(`${BASE}/reservations/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const startChargingApi = (id) =>
  fetch(`${BASE}/reservations/${id}/start-charging`, { method: 'POST' }).then(r => r.json());

export const disableChargerUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/chargers/${id}/disable-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchChargerPartialApi = (id, locationFloor, maxKw, inspectMemo) =>
  fetch(`${BASE}/chargers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locationFloor, maxKw, inspectMemo }) }).then(r => r.json());

export const deleteChargeLogApi = (id) =>
  fetch(`${BASE}/charge-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
