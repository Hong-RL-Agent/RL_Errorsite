const BASE_URL = 'http://localhost:9591/api';

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins`);
  return res.json();
};

export const fetchCourses = async () => {
  const res = await fetch(`${BASE_URL}/courses`);
  return res.json();
};

export const fetchStudents = async () => {
  const res = await fetch(`${BASE_URL}/students`);
  return res.json();
};

export const fetchRegistrations = async () => {
  const res = await fetch(`${BASE_URL}/registrations`);
  return res.json();
};

export const fetchWaitlists = async () => {
  const res = await fetch(`${BASE_URL}/waitlists`);
  return res.json();
};

export const fetchCart = async () => {
  const res = await fetch(`${BASE_URL}/cart`);
  return res.json();
};

export const searchCoursesApi = async (dept, type) => {
  const res = await fetch(`${BASE_URL}/courses/search?dept=${dept}&type=${type}`);
  return res.json();
};

export const addToCartApi = async (studentId, courseId, courseName) => {
  const res = await fetch(`${BASE_URL}/cart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, courseId, courseName })
  });
  return res.json();
};

export const registerCourseApi = async (studentId, studentName, courseId, courseName, credits) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, studentName, courseId, courseName, credits })
  });
  return res.json();
};

export const cancelRegistrationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/registrations/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const autoPromoteWaitlistApi = async (id) => {
  const res = await fetch(`${BASE_URL}/waitlists/${id}/auto-promote`, { method: 'POST' });
  return res.json();
};

export const updateCourseCapacityApi = async (id, capacity, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/courses/${id}/capacity`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    },
    body: JSON.stringify({ capacity })
  });
  return res.json();
};

export const patchCoursePartialApi = async (id, classroom, capacity, professorName) => {
  const res = await fetch(`${BASE_URL}/courses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classroom, capacity, professorName })
  });
  return res.json();
};

export const deleteRegistrationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/registrations/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
