const BASE = 'http://localhost:9648/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchLights = () => fetch(`${BASE}/lights`).then(r => r.json());
export const fetchWorkers = () => fetch(`${BASE}/workers`).then(r => r.json());
export const fetchReports = () => fetch(`${BASE}/reports`).then(r => r.json());
export const fetchTasks = () => fetch(`${BASE}/tasks`).then(r => r.json());
export const fetchLocationLogs = () => fetch(`${BASE}/location-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchReportsApi = (district, status, search) =>
  fetch(`${BASE}/reports/search?district=${encodeURIComponent(district)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchReportLocationApi = (id, location) =>
  fetch(`${BASE}/reports/${id}/location`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location }) }).then(r => r.json());

export const patchReportStatusApi = (id, status) =>
  fetch(`${BASE}/reports/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelReportApi = (id) =>
  fetch(`${BASE}/reports/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeReportApi = (id) =>
  fetch(`${BASE}/reports/${id}/complete`, { method: 'POST' }).then(r => r.json());

export const completeReportUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/reports/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchLightPartialApi = (id, lightCode, location, bulbType) =>
  fetch(`${BASE}/lights/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lightCode, location, bulbType }) }).then(r => r.json());

export const deleteLocationLogApi = (id) =>
  fetch(`${BASE}/location-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
