const BASE = 'http://localhost:9647/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchClassesList = () => fetch(`${BASE}/classes-list`).then(r => r.json());
export const fetchSeats = () => fetch(`${BASE}/seats`).then(r => r.json());
export const fetchCustomers = () => fetch(`${BASE}/customers`).then(r => r.json());
export const fetchBookings = () => fetch(`${BASE}/bookings`).then(r => r.json());
export const fetchKitLogs = () => fetch(`${BASE}/kit-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchBookingsApi = (className, status, search) =>
  fetch(`${BASE}/bookings/search?className=${encodeURIComponent(className)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchBookingSeatApi = (id, seatNo) =>
  fetch(`${BASE}/bookings/${id}/seat`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seatNo }) }).then(r => r.json());

export const patchBookingStatusApi = (id, status) =>
  fetch(`${BASE}/bookings/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelBookingApi = (id) =>
  fetch(`${BASE}/bookings/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const markKitReadyApi = (id) =>
  fetch(`${BASE}/bookings/${id}/kit-ready`, { method: 'POST' }).then(r => r.json());

export const confirmBookingUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/bookings/${id}/confirm-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchCustomerPartialApi = (id, customerName, phone, preferredWine) =>
  fetch(`${BASE}/customers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName, phone, preferredWine }) }).then(r => r.json());

export const deleteKitLogApi = (id) =>
  fetch(`${BASE}/kit-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
