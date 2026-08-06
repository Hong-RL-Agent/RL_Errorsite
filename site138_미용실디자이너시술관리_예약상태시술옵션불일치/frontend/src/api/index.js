const BASE = 'http://localhost:9637/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchDesigners = () => fetch(`${BASE}/designers`).then(r => r.json());
export const fetchTreatments = () => fetch(`${BASE}/treatments`).then(r => r.json());
export const fetchClients = () => fetch(`${BASE}/clients`).then(r => r.json());
export const fetchReservations = () => fetch(`${BASE}/reservations`).then(r => r.json());
export const fetchVisitLogs = () => fetch(`${BASE}/visit-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchReservationsApi = (designerName, status, search) =>
  fetch(`${BASE}/reservations/search?designerName=${encodeURIComponent(designerName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchReservationTreatmentApi = (id, treatmentName) =>
  fetch(`${BASE}/reservations/${id}/treatment`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ treatmentName }) }).then(r => r.json());

export const patchReservationStatusApi = (id, status) =>
  fetch(`${BASE}/reservations/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelReservationApi = (id) =>
  fetch(`${BASE}/reservations/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeReservationApi = (id) =>
  fetch(`${BASE}/reservations/${id}/complete`, { method: 'POST' }).then(r => r.json());

export const refundReservationUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/reservations/${id}/refund-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchClientPartialApi = (id, clientName, phone, preferredDesigner) =>
  fetch(`${BASE}/clients/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientName, phone, preferredDesigner }) }).then(r => r.json());

export const deleteVisitLogApi = (id) =>
  fetch(`${BASE}/visit-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
