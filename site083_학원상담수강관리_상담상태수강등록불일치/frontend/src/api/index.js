const BASE_URL = 'http://localhost:9582/api';

export const fetchStudents = async () => {
  const res = await fetch(`${BASE_URL}/students`);
  return res.json();
};

export const fetchConsultations = async () => {
  const res = await fetch(`${BASE_URL}/consultations`);
  return res.json();
};

export const fetchCourses = async () => {
  const res = await fetch(`${BASE_URL}/courses`);
  return res.json();
};

export const searchCoursesApi = async (subject, grade) => {
  const res = await fetch(`${BASE_URL}/courses/search?subject=${subject}&grade=${grade}`);
  return res.json();
};

export const fetchAttendance = async () => {
  const res = await fetch(`${BASE_URL}/attendance`);
  return res.json();
};

export const patchConsultationStatusApi = async (id, status) => {
  const res = await fetch(`${BASE_URL}/consultations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const patchConsultationTimeApi = async (id, date, timeSlot, status) => {
  const res = await fetch(`${BASE_URL}/consultations/${id}/time`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, timeSlot, status })
  });
  return res.json();
};

export const cancelEnrollmentApi = async (id) => {
  const res = await fetch(`${BASE_URL}/students/${id}/cancel-enrollment`, { method: 'POST' });
  return res.json();
};

export const checkAttendanceApi = async (studentId, courseId, status) => {
  const res = await fetch(`${BASE_URL}/attendance/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, courseId, status })
  });
  return res.json();
};

export const enrollCourseApi = async (courseId, studentName) => {
  const res = await fetch(`${BASE_URL}/courses/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId, studentName })
  });
  return res.json();
};

export const deleteConsultationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/consultations/${id}`, { method: 'DELETE' });
  return res.json();
};

export const patchAttendanceUnauthorizedApi = async (id, status, role = 'GUEST_TEACHER') => {
  const res = await fetch(`${BASE_URL}/attendance/${id}`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
