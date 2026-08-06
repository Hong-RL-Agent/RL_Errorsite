const BASE = 'http://localhost:9656/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchZones = () => fetch(`${BASE}/zones`).then(r => r.json());
export const fetchVehicles = () => fetch(`${BASE}/vehicles`).then(r => r.json());
export const fetchWorkers = () => fetch(`${BASE}/workers`).then(r => r.json());
export const fetchTasks = () => fetch(`${BASE}/tasks`).then(r => r.json());
export const fetchSnowLogs = () => fetch(`${BASE}/snow-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchTasksApi = (zoneName, status, search) =>
  fetch(`${BASE}/tasks/search?zoneName=${encodeURIComponent(zoneName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchTaskLocationApi = (id, currentLocation) =>
  fetch(`${BASE}/tasks/${id}/location`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentLocation }) }).then(r => r.json());

export const patchTaskStatusApi = (id, status) =>
  fetch(`${BASE}/tasks/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelTaskApi = (id) =>
  fetch(`${BASE}/tasks/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const registerSaltUsageApi = (id) =>
  fetch(`${BASE}/tasks/${id}/register-salt`, { method: 'POST' }).then(r => r.json());

export const completeTaskUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/tasks/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchVehiclePartialApi = (id, vehicleNo, assignedZone, equipmentStatus) =>
  fetch(`${BASE}/vehicles/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vehicleNo, assignedZone, equipmentStatus }) }).then(r => r.json());

export const deleteSnowLogApi = (id) =>
  fetch(`${BASE}/snow-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
