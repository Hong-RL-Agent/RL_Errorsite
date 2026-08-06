const BASE = 'http://localhost:9618/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchDistricts = () => fetch(`${BASE}/districts`).then(r => r.json());
export const fetchVolunteers = () => fetch(`${BASE}/volunteers`).then(r => r.json());
export const fetchSchedules = () => fetch(`${BASE}/schedules`).then(r => r.json());
export const fetchReports = () => fetch(`${BASE}/reports`).then(r => r.json());
export const fetchAssignmentLogs = () => fetch(`${BASE}/assignment-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchSchedulesApi = (districtId, status, search) =>
  fetch(`${BASE}/schedules/search?districtId=${districtId}&status=${status}&search=${search}`).then(r => r.json());

export const patchScheduleVolunteerApi = (id, assignedVolunteerId, assignedVolunteerName) =>
  fetch(`${BASE}/schedules/${id}/volunteer`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignedVolunteerId, assignedVolunteerName }) }).then(r => r.json());

export const patchScheduleStatusApi = (id, status) =>
  fetch(`${BASE}/schedules/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelScheduleApi = (id) =>
  fetch(`${BASE}/schedules/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const addFieldReportApi = (id) =>
  fetch(`${BASE}/schedules/${id}/add-report`, { method: 'POST' }).then(r => r.json());

export const confirmScheduleUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/schedules/${id}/confirm-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchVolunteerPartialApi = (id, name, phone, assignedDistrictId) =>
  fetch(`${BASE}/volunteers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone, assignedDistrictId }) }).then(r => r.json());

export const deleteAssignmentLogApi = (id) =>
  fetch(`${BASE}/assignment-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
