const BASE_URL = 'http://localhost:9581/api';

export const fetchAppointments = async () => {
  const res = await fetch(`${BASE_URL}/appointments`);
  return res.json();
};

export const searchAppointmentsApi = async (deptId, status) => {
  const res = await fetch(`${BASE_URL}/appointments/search?deptId=${deptId}&status=${status}`);
  return res.json();
};

export const fetchTestResults = async () => {
  const res = await fetch(`${BASE_URL}/test-results`);
  return res.json();
};

export const fetchTestResultDetailApi = async (id) => {
  const res = await fetch(`${BASE_URL}/test-results/${id}`);
  return res.json();
};

export const fetchDoctors = async () => {
  const res = await fetch(`${BASE_URL}/doctors`);
  return res.json();
};

export const fetchPatients = async () => {
  const res = await fetch(`${BASE_URL}/patients`);
  return res.json();
};

export const patchDoctorApi = async (id, doctorId, doctorName) => {
  const res = await fetch(`${BASE_URL}/appointments/${id}/doctor`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctorId, doctorName })
  });
  return res.json();
};

export const patchTimeSlotApi = async (id, date, timeSlot, doctorId, doctorName) => {
  const res = await fetch(`${BASE_URL}/appointments/${id}/time`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, timeSlot, doctorId, doctorName })
  });
  return res.json();
};

export const cancelAppointmentApi = async (id) => {
  const res = await fetch(`${BASE_URL}/appointments/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const patchSymptomsApi = async (id, symptoms) => {
  const res = await fetch(`${BASE_URL}/appointments/${id}/symptoms`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms })
  });
  return res.json();
};

export const deleteAppointmentApi = async (id) => {
  const res = await fetch(`${BASE_URL}/appointments/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
