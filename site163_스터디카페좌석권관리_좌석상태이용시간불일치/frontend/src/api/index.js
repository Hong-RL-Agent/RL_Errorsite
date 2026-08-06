const BASE = 'http://localhost:9662/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchBranches = () => fetch(`${BASE}/branches`).then(r => r.json());
export const fetchMembers = () => fetch(`${BASE}/members`).then(r => r.json());
export const fetchSeats = () => fetch(`${BASE}/seats`).then(r => r.json());
export const fetchTickets = () => fetch(`${BASE}/tickets`).then(r => r.json());
export const fetchEntryLogs = () => fetch(`${BASE}/entry-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchSeatsApi = (branchName, status, search) =>
  fetch(`${BASE}/seats/search?branchName=${encodeURIComponent(branchName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchSeatTimeApi = (id, remainingHours) =>
  fetch(`${BASE}/seats/${id}/time`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ remainingHours }) }).then(r => r.json());

export const patchSeatStatusApi = (id, status) =>
  fetch(`${BASE}/seats/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelTicketApi = (id) =>
  fetch(`${BASE}/seats/${id}/cancel-ticket`, { method: 'POST' }).then(r => r.json());

export const processCheckInApi = (id) =>
  fetch(`${BASE}/seats/${id}/process-checkin`, { method: 'POST' }).then(r => r.json());

export const forceCheckOutUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/seats/${id}/force-checkout-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchMemberPartialApi = (id, memberName, phone, ticketType) =>
  fetch(`${BASE}/members/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberName, phone, ticketType }) }).then(r => r.json());

export const deleteEntryLogApi = (id) =>
  fetch(`${BASE}/entry-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
