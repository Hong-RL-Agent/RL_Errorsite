const BASE = 'http://localhost:9646/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchRoutesList = () => fetch(`${BASE}/routes-list`).then(r => r.json());
export const fetchBuses = () => fetch(`${BASE}/buses`).then(r => r.json());
export const fetchDrivers = () => fetch(`${BASE}/drivers`).then(r => r.json());
export const fetchSchedules = () => fetch(`${BASE}/schedules`).then(r => r.json());
export const fetchBoardingLogs = () => fetch(`${BASE}/boarding-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchSchedulesApi = (routeName, status, search) =>
  fetch(`${BASE}/schedules/search?routeName=${encodeURIComponent(routeName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchSchedulePassengerCountApi = (id, passengerCount) =>
  fetch(`${BASE}/schedules/${id}/passenger-count`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ passengerCount }) }).then(r => r.json());

export const patchScheduleStatusApi = (id, status) =>
  fetch(`${BASE}/schedules/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelScheduleApi = (id) =>
  fetch(`${BASE}/schedules/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const recordBoardingLogApi = (id) =>
  fetch(`${BASE}/schedules/${id}/record-boarding`, { method: 'POST' }).then(r => r.json());

export const completeScheduleUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/schedules/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchBusPartialApi = (id, busNo, seatCapacity, driverName) =>
  fetch(`${BASE}/buses/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ busNo, seatCapacity, driverName }) }).then(r => r.json());

export const deleteBoardingLogApi = (id) =>
  fetch(`${BASE}/boarding-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
