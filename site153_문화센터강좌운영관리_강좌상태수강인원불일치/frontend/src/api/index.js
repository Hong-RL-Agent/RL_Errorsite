const BASE = 'http://localhost:9652/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchInstructors = () => fetch(`${BASE}/instructors`).then(r => r.json());
export const fetchStudents = () => fetch(`${BASE}/students`).then(r => r.json());
export const fetchCourses = () => fetch(`${BASE}/courses`).then(r => r.json());
export const fetchEnrollments = () => fetch(`${BASE}/enrollments`).then(r => r.json());
export const fetchAttendanceLogs = () => fetch(`${BASE}/attendance-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchCoursesApi = (category, status, search) =>
  fetch(`${BASE}/courses/search?category=${encodeURIComponent(category)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchCourseEnrolledCountApi = (id, enrolledCount) =>
  fetch(`${BASE}/courses/${id}/enrolled-count`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enrolledCount }) }).then(r => r.json());

export const patchCourseStatusApi = (id, status) =>
  fetch(`${BASE}/courses/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelEnrollmentApi = (id) =>
  fetch(`${BASE}/enrollments/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const markAttendanceApi = (id) =>
  fetch(`${BASE}/enrollments/${id}/mark-attendance`, { method: 'POST' }).then(r => r.json());

export const cancelCourseUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/courses/${id}/cancel-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchCoursePartialApi = (id, courseName, roomNo, instructorName) =>
  fetch(`${BASE}/courses/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseName, roomNo, instructorName }) }).then(r => r.json());

export const deleteAttendanceLogApi = (id) =>
  fetch(`${BASE}/attendance-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
