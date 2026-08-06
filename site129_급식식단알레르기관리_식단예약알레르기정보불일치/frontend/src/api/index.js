const BASE = 'http://localhost:9628/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchMenus = () => fetch(`${BASE}/menus`).then(r => r.json());
export const fetchStudents = () => fetch(`${BASE}/students`).then(r => r.json());
export const fetchAllergies = () => fetch(`${BASE}/allergies`).then(r => r.json());
export const fetchSubMealRequests = () => fetch(`${BASE}/sub-meal-requests`).then(r => r.json());
export const fetchServingLogs = () => fetch(`${BASE}/serving-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchStudentsApi = (gradeClass, riskLevel, search) =>
  fetch(`${BASE}/students/search?gradeClass=${gradeClass}&riskLevel=${riskLevel}&search=${search}`).then(r => r.json());

export const patchSubMealMenuApi = (id, menuId, menuName, requestedSubMenu) =>
  fetch(`${BASE}/sub-meal-requests/${id}/menu`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ menuId, menuName, requestedSubMenu }) }).then(r => r.json());

export const patchSubMealStatusApi = (id, status) =>
  fetch(`${BASE}/sub-meal-requests/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelSubMealApi = (id) =>
  fetch(`${BASE}/sub-meal-requests/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeServingApi = (id) =>
  fetch(`${BASE}/sub-meal-requests/${id}/complete-serving`, { method: 'POST' }).then(r => r.json());

export const approveSubMealUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/sub-meal-requests/${id}/approve-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchStudentPartialApi = (id, studentName, gradeClass, allergies) =>
  fetch(`${BASE}/students/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentName, gradeClass, allergies }) }).then(r => r.json());

export const deleteServingLogApi = (id) =>
  fetch(`${BASE}/serving-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
