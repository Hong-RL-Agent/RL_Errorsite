const BASE = 'http://localhost:9643/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchRooms = () => fetch(`${BASE}/rooms`).then(r => r.json());
export const fetchUsers = () => fetch(`${BASE}/users`).then(r => r.json());
export const fetchBookings = () => fetch(`${BASE}/bookings`).then(r => r.json());
export const fetchAccessLogs = () => fetch(`${BASE}/access-logs`).then(r => r.json());
export const fetchEquipmentLogs = () => fetch(`${BASE}/equipment-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchBookingsApi = (roomName, status, search) =>
  fetch(`${BASE}/bookings/search?roomName=${encodeURIComponent(roomName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchBookingEntryTimeApi = (id, entryTime) =>
  fetch(`${BASE}/bookings/${id}/entry-time`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ entryTime }) }).then(r => r.json());

export const patchBookingStatusApi = (id, status) =>
  fetch(`${BASE}/bookings/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelBookingApi = (id) =>
  fetch(`${BASE}/bookings/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const checkInBookingApi = (id) =>
  fetch(`${BASE}/bookings/${id}/checkin`, { method: 'POST' }).then(r => r.json());

export const forceCancelBookingUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/bookings/${id}/force-cancel-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchUserPartialApi = (id, userName, phone, teamName) =>
  fetch(`${BASE}/users/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userName, phone, teamName }) }).then(r => r.json());

export const deleteAccessLogApi = (id) =>
  fetch(`${BASE}/access-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
