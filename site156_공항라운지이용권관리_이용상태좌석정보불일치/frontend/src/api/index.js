const BASE = 'http://localhost:9655/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchLounges = () => fetch(`${BASE}/lounges`).then(r => r.json());
export const fetchSeats = () => fetch(`${BASE}/seats`).then(r => r.json());
export const fetchPassengers = () => fetch(`${BASE}/passengers`).then(r => r.json());
export const fetchPasses = () => fetch(`${BASE}/passes`).then(r => r.json());
export const fetchCheckinLogs = () => fetch(`${BASE}/checkin-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchPassesApi = (terminal, status, search) =>
  fetch(`${BASE}/passes/search?terminal=${encodeURIComponent(terminal)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchPassSeatNoApi = (id, seatNo) =>
  fetch(`${BASE}/passes/${id}/seat-no`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seatNo }) }).then(r => r.json());

export const patchPassStatusApi = (id, status) =>
  fetch(`${BASE}/passes/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelCheckinApi = (id) =>
  fetch(`${BASE}/passes/${id}/cancel-checkin`, { method: 'POST' }).then(r => r.json());

export const completeLoungeUseApi = (id) =>
  fetch(`${BASE}/passes/${id}/complete-use`, { method: 'POST' }).then(r => r.json());

export const approveLoungeEntryUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/passes/${id}/approve-entry-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchPassengerPartialApi = (id, passengerName, phone, flightNo, seatNo) =>
  fetch(`${BASE}/passengers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passengerName, phone, flightNo, seatNo }) }).then(r => r.json());

export const deleteCheckinLogApi = (id) =>
  fetch(`${BASE}/checkin-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
