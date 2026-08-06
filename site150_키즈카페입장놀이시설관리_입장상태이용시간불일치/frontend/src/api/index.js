const BASE = 'http://localhost:9649/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchFacilities = () => fetch(`${BASE}/facilities`).then(r => r.json());
export const fetchGuardians = () => fetch(`${BASE}/guardians`).then(r => r.json());
export const fetchChildren = () => fetch(`${BASE}/children`).then(r => r.json());
export const fetchTickets = () => fetch(`${BASE}/tickets`).then(r => r.json());
export const fetchUsageLogs = () => fetch(`${BASE}/usage-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchTicketsApi = (storeName, status, search) =>
  fetch(`${BASE}/tickets/search?storeName=${encodeURIComponent(storeName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchTicketAllowedHoursApi = (id, allowedHours) =>
  fetch(`${BASE}/tickets/${id}/allowed-hours`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ allowedHours }) }).then(r => r.json());

export const patchTicketStatusApi = (id, status) =>
  fetch(`${BASE}/tickets/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelTicketApi = (id) =>
  fetch(`${BASE}/tickets/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const recordUsageLogApi = (id) =>
  fetch(`${BASE}/tickets/${id}/record-usage`, { method: 'POST' }).then(r => r.json());

export const forceCheckoutUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/tickets/${id}/force-checkout-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchGuardianPartialApi = (id, guardianName, phone, relationship) =>
  fetch(`${BASE}/guardians/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ guardianName, phone, relationship }) }).then(r => r.json());

export const deleteUsageLogApi = (id) =>
  fetch(`${BASE}/usage-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
