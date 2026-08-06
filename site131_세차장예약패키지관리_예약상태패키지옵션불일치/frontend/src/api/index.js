const BASE = 'http://localhost:9630/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchBranches = () => fetch(`${BASE}/branches`).then(r => r.json());
export const fetchPackages = () => fetch(`${BASE}/packages`).then(r => r.json());
export const fetchVehicles = () => fetch(`${BASE}/vehicles`).then(r => r.json());
export const fetchBookings = () => fetch(`${BASE}/bookings`).then(r => r.json());
export const fetchWorkLogs = () => fetch(`${BASE}/work-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchBookingsApi = (branchId, status, search) =>
  fetch(`${BASE}/bookings/search?branchId=${branchId}&status=${status}&search=${search}`).then(r => r.json());

export const patchBookingOptionsApi = (id, packageName, options, totalFeeWon) =>
  fetch(`${BASE}/bookings/${id}/options`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packageName, options, totalFeeWon }) }).then(r => r.json());

export const patchBookingStatusApi = (id, status) =>
  fetch(`${BASE}/bookings/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelBookingApi = (id) =>
  fetch(`${BASE}/bookings/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeWorkLogApi = (id) =>
  fetch(`${BASE}/bookings/${id}/complete-log`, { method: 'POST' }).then(r => r.json());

export const refundBookingUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/bookings/${id}/refund-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchVehiclePartialApi = (id, carNo, carType, phone) =>
  fetch(`${BASE}/vehicles/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ carNo, carType, phone }) }).then(r => r.json());

export const deleteWorkLogApi = (id) =>
  fetch(`${BASE}/work-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
