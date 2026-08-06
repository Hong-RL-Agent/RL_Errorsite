const BASE = 'http://localhost:9645/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchZones = () => fetch(`${BASE}/zones`).then(r => r.json());
export const fetchDrones = () => fetch(`${BASE}/drones`).then(r => r.json());
export const fetchPilots = () => fetch(`${BASE}/pilots`).then(r => r.json());
export const fetchRequests = () => fetch(`${BASE}/requests`).then(r => r.json());
export const fetchFlightLogs = () => fetch(`${BASE}/flight-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchRequestsApi = (region, status, search) =>
  fetch(`${BASE}/requests/search?region=${encodeURIComponent(region)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchRequestZoneApi = (id, zoneName) =>
  fetch(`${BASE}/requests/${id}/zone`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ zoneName }) }).then(r => r.json());

export const patchRequestStatusApi = (id, status) =>
  fetch(`${BASE}/requests/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelRequestApi = (id) =>
  fetch(`${BASE}/requests/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeShootingApi = (id) =>
  fetch(`${BASE}/requests/${id}/complete-shooting`, { method: 'POST' }).then(r => r.json());

export const approveFlightUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/requests/${id}/approve-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchDronePartialApi = (id, droneName, batteryStatus, pilotName) =>
  fetch(`${BASE}/drones/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ droneName, batteryStatus, pilotName }) }).then(r => r.json());

export const deleteFlightLogApi = (id) =>
  fetch(`${BASE}/flight-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
