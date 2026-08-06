const BASE = 'http://localhost:9640/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchTrailSections = () => fetch(`${BASE}/trail-sections`).then(r => r.json());
export const fetchPatrolTeams = () => fetch(`${BASE}/patrol-teams`).then(r => r.json());
export const fetchReports = () => fetch(`${BASE}/reports`).then(r => r.json());
export const fetchActionLogs = () => fetch(`${BASE}/action-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchReportsApi = (mountain, status, search) =>
  fetch(`${BASE}/reports/search?mountain=${encodeURIComponent(mountain)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchReportLocationApi = (id, locationDesc) =>
  fetch(`${BASE}/reports/${id}/location`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ locationDesc }) }).then(r => r.json());

export const patchReportStatusApi = (id, status) =>
  fetch(`${BASE}/reports/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelReportApi = (id) =>
  fetch(`${BASE}/reports/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeActionApi = (id) =>
  fetch(`${BASE}/reports/${id}/complete-action`, { method: 'POST' }).then(r => r.json());

export const clearDangerZoneUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/reports/${id}/clear-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchReportPartialApi = (id, reportType, locationDesc, dangerGrade) =>
  fetch(`${BASE}/reports/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportType, locationDesc, dangerGrade }) }).then(r => r.json());

export const deleteActionLogApi = (id) =>
  fetch(`${BASE}/action-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
