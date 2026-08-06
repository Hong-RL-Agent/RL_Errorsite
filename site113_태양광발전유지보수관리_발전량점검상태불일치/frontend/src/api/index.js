const BASE = 'http://localhost:9612/api';

export const fetchWorkers = () => fetch(`${BASE}/workers`).then(r => r.json());
export const fetchZones = () => fetch(`${BASE}/zones`).then(r => r.json());
export const fetchInverters = () => fetch(`${BASE}/inverters`).then(r => r.json());
export const fetchPanels = () => fetch(`${BASE}/panels`).then(r => r.json());
export const fetchMaintenanceJobs = () => fetch(`${BASE}/maintenance-jobs`).then(r => r.json());
export const fetchPowerLogs = () => fetch(`${BASE}/power-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchPanelsApi = (zoneId, status, search) =>
  fetch(`${BASE}/panels/search?zoneId=${zoneId}&status=${status}&search=${search}`).then(r => r.json());

export const patchPanelWorkerApi = (id, workerId, workerName) =>
  fetch(`${BASE}/panels/${id}/worker`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ workerId, workerName }) }).then(r => r.json());

export const patchPanelStatusApi = (id, status) =>
  fetch(`${BASE}/panels/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelJobApi = (id) =>
  fetch(`${BASE}/maintenance-jobs/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const calibratePowerApi = (id) =>
  fetch(`${BASE}/maintenance-jobs/${id}/calibrate`, { method: 'POST' }).then(r => r.json());

export const calibratePowerUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/maintenance-jobs/${id}/calibrate-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-worker-role': role } }).then(r => r.json());

export const patchPanelPartialApi = (id, installDate, grade, zoneId) =>
  fetch(`${BASE}/panels/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ installDate, grade, zoneId }) }).then(r => r.json());

export const deletePowerLogApi = (id) =>
  fetch(`${BASE}/power-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
