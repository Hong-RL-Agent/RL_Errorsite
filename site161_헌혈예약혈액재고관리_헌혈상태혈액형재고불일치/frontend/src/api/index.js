const BASE = 'http://localhost:9660/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchCenters = () => fetch(`${BASE}/centers`).then(r => r.json());
export const fetchDonors = () => fetch(`${BASE}/donors`).then(r => r.json());
export const fetchReservations = () => fetch(`${BASE}/reservations`).then(r => r.json());
export const fetchQuestionnaires = () => fetch(`${BASE}/questionnaires`).then(r => r.json());
export const fetchBloodLogs = () => fetch(`${BASE}/blood-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchReservationsApi = (centerName, status, search) =>
  fetch(`${BASE}/reservations/search?centerName=${encodeURIComponent(centerName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchBloodStockUnitsApi = (id, bloodStockUnits) =>
  fetch(`${BASE}/reservations/${id}/blood-stock`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bloodStockUnits }) }).then(r => r.json());

export const patchReservationStatusApi = (id, status) =>
  fetch(`${BASE}/reservations/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelReservationApi = (id) =>
  fetch(`${BASE}/reservations/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const updateBloodStockLogApi = (id) =>
  fetch(`${BASE}/reservations/${id}/update-stock-log`, { method: 'POST' }).then(r => r.json());

export const completeDonationUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/reservations/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchDonorPartialApi = (id, donorName, phone, bloodType) =>
  fetch(`${BASE}/donors/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ donorName, phone, bloodType }) }).then(r => r.json());

export const deleteBloodLogApi = (id) =>
  fetch(`${BASE}/blood-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
