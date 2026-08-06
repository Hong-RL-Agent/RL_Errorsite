const BASE = 'http://localhost:9621/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchZones = () => fetch(`${BASE}/zones`).then(r => r.json());
export const fetchVehicles = () => fetch(`${BASE}/vehicles`).then(r => r.json());
export const fetchSchedules = () => fetch(`${BASE}/schedules`).then(r => r.json());
export const fetchComplaints = () => fetch(`${BASE}/complaints`).then(r => r.json());
export const fetchPickupLogs = () => fetch(`${BASE}/pickup-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchSchedulesApi = (zoneId, status, search) =>
  fetch(`${BASE}/schedules/search?zoneId=${zoneId}&status=${status}&search=${search}`).then(r => r.json());

export const patchScheduleVehicleApi = (id, vehicleId, vehiclePlate) =>
  fetch(`${BASE}/schedules/${id}/vehicle`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleId, vehiclePlate }) }).then(r => r.json());

export const patchScheduleStatusApi = (id, status) =>
  fetch(`${BASE}/schedules/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelScheduleApi = (id) =>
  fetch(`${BASE}/schedules/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const resolveComplaintApi = (id) =>
  fetch(`${BASE}/schedules/${id}/resolve-complaint`, { method: 'POST' }).then(r => r.json());

export const completeScheduleUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/schedules/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchVehiclePartialApi = (id, plateNumber, zoneId, maintenanceStatus) =>
  fetch(`${BASE}/vehicles/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plateNumber, zoneId, maintenanceStatus }) }).then(r => r.json());

export const deletePickupLogApi = (id) =>
  fetch(`${BASE}/pickup-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
