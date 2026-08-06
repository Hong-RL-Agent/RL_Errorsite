const BASE = 'http://localhost:9627/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchStudios = () => fetch(`${BASE}/studios`).then(r => r.json());
export const fetchGears = () => fetch(`${BASE}/gears`).then(r => r.json());
export const fetchReservations = () => fetch(`${BASE}/reservations`).then(r => r.json());
export const fetchRentalLogs = () => fetch(`${BASE}/rental-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchGearsApi = (category, status, search) =>
  fetch(`${BASE}/gears/search?category=${category}&status=${status}&search=${search}`).then(r => r.json());

export const patchGearTimeApi = (id, startTime, endTime) =>
  fetch(`${BASE}/gears/${id}/time`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startTime, endTime }) }).then(r => r.json());

export const patchGearStatusApi = (id, status) =>
  fetch(`${BASE}/gears/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelReservationApi = (id) =>
  fetch(`${BASE}/gears/${id}/cancel-reservation`, { method: 'POST' }).then(r => r.json());

export const completeReturnApi = (id) =>
  fetch(`${BASE}/gears/${id}/complete-return`, { method: 'POST' }).then(r => r.json());

export const disposeGearUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/gears/${id}/dispose-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchGearPartialApi = (id, gearName, location, inspectionDate) =>
  fetch(`${BASE}/gears/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gearName, location, inspectionDate }) }).then(r => r.json());

export const deleteRentalLogApi = (id) =>
  fetch(`${BASE}/rental-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
