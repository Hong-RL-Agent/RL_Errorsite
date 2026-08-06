const BASE = 'http://localhost:9644/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchLanes = () => fetch(`${BASE}/lanes`).then(r => r.json());
export const fetchInstructors = () => fetch(`${BASE}/instructors`).then(r => r.json());
export const fetchMembers = () => fetch(`${BASE}/members`).then(r => r.json());
export const fetchAttendanceLogs = () => fetch(`${BASE}/attendance-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchMembersApi = (level, status, search) =>
  fetch(`${BASE}/members/search?level=${encodeURIComponent(level)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchMemberLaneApi = (id, laneNo) =>
  fetch(`${BASE}/members/${id}/lane`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ laneNo }) }).then(r => r.json());

export const patchMemberStatusApi = (id, status) =>
  fetch(`${BASE}/members/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelClassApi = (id) =>
  fetch(`${BASE}/members/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeAttendanceApi = (id) =>
  fetch(`${BASE}/members/${id}/complete-attendance`, { method: 'POST' }).then(r => r.json());

export const changeLaneUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/members/${id}/change-lane-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchMemberPartialApi = (id, name, phone, level) =>
  fetch(`${BASE}/members/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone, level }) }).then(r => r.json());

export const deleteAttendanceLogApi = (id) =>
  fetch(`${BASE}/attendance-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
