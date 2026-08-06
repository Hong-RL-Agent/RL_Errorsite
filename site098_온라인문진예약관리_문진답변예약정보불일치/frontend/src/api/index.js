const BASE_URL = 'http://localhost:9597/api';

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins`);
  return res.json();
};

export const fetchDepartments = async () => {
  const res = await fetch(`${BASE_URL}/departments`);
  return res.json();
};

export const fetchQuestions = async () => {
  const res = await fetch(`${BASE_URL}/questions`);
  return res.json();
};

export const fetchPatients = async () => {
  const res = await fetch(`${BASE_URL}/patients`);
  return res.json();
};

export const fetchSurveys = async () => {
  const res = await fetch(`${BASE_URL}/surveys`);
  return res.json();
};

export const fetchAppointments = async () => {
  const res = await fetch(`${BASE_URL}/appointments`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchSurveysApi = async (deptName, riskLevel, search) => {
  const res = await fetch(`${BASE_URL}/surveys/search?deptName=${deptName}&riskLevel=${riskLevel}&search=${search}`);
  return res.json();
};

export const patchSurveyAnswersApi = async (id, chiefComplaint, painScore) => {
  const res = await fetch(`${BASE_URL}/surveys/${id}/answers`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chiefComplaint, painScore })
  });
  return res.json();
};

export const patchAppointmentTimeApi = async (id, appointmentTime) => {
  const res = await fetch(`${BASE_URL}/appointments/${id}/time`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ appointmentTime })
  });
  return res.json();
};

export const cancelAppointmentApi = async (id) => {
  const res = await fetch(`${BASE_URL}/appointments/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const submitSurveyApi = async (patientId, patientName, deptName, chiefComplaint, appointmentId) => {
  const res = await fetch(`${BASE_URL}/surveys/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ patientId, patientName, deptName, chiefComplaint, appointmentId })
  });
  return res.json();
};

export const updateSurveyRiskApi = async (id, riskLevel, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/surveys/${id}/risk`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    },
    body: JSON.stringify({ riskLevel })
  });
  return res.json();
};

export const patchPatientPartialApi = async (id, height, weight, medication) => {
  const res = await fetch(`${BASE_URL}/patients/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ height, weight, medication })
  });
  return res.json();
};

export const deleteSurveyApi = async (id) => {
  const res = await fetch(`${BASE_URL}/surveys/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
