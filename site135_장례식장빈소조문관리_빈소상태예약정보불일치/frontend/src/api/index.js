const BASE = 'http://localhost:9634/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchAltars = () => fetch(`${BASE}/altars`).then(r => r.json());
export const fetchReservations = () => fetch(`${BASE}/reservations`).then(r => r.json());
export const fetchSchedules = () => fetch(`${BASE}/schedules`).then(r => r.json());
export const fetchVisitorGuides = () => fetch(`${BASE}/visitor-guides`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchAltarsApi = (status, search) =>
  fetch(`${BASE}/altars/search?status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchReservationScheduleTextApi = (id, scheduleText) =>
  fetch(`${BASE}/reservations/${id}/schedule-text`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scheduleText }) }).then(r => r.json());

export const patchAltarStatusApi = (id, status) =>
  fetch(`${BASE}/altars/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelReservationApi = (id) =>
  fetch(`${BASE}/reservations/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const addVisitorGuideApi = (id, visitorGroup, visitorCount) =>
  fetch(`${BASE}/reservations/${id}/add-guide`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ visitorGroup, visitorCount }) }).then(r => r.json());

export const terminateAltarUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/altars/${id}/terminate-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchClientPartialApi = (id, clientName, phone, requests) =>
  fetch(`${BASE}/reservations/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientName, phone, requests }) }).then(r => r.json());

export const deleteVisitorGuideApi = (id) =>
  fetch(`${BASE}/visitor-guides/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
