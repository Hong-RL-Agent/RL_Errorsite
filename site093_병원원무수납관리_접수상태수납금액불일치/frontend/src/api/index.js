const BASE_URL = 'http://localhost:9592/api';

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins`);
  return res.json();
};

export const fetchDepartments = async () => {
  const res = await fetch(`${BASE_URL}/departments`);
  return res.json();
};

export const fetchPatients = async () => {
  const res = await fetch(`${BASE_URL}/patients`);
  return res.json();
};

export const fetchRegistrations = async () => {
  const res = await fetch(`${BASE_URL}/registrations`);
  return res.json();
};

export const fetchPayments = async () => {
  const res = await fetch(`${BASE_URL}/payments`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchRegistrationsApi = async (dept, status) => {
  const res = await fetch(`${BASE_URL}/registrations/search?dept=${dept}&status=${status}`);
  return res.json();
};

export const patchRegistrationDeptApi = async (id, dept) => {
  const res = await fetch(`${BASE_URL}/registrations/${id}/dept`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dept })
  });
  return res.json();
};

export const patchRegistrationAmountApi = async (id, amount) => {
  const res = await fetch(`${BASE_URL}/registrations/${id}/amount`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });
  return res.json();
};

export const cancelRegistrationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/registrations/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const completePaymentApi = async (id) => {
  const res = await fetch(`${BASE_URL}/registrations/${id}/complete-payment`, { method: 'POST' });
  return res.json();
};

export const cancelPaymentApi = async (id, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/payments/${id}/cancel`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchPatientPartialApi = async (id, phone, address, guardianName) => {
  const res = await fetch(`${BASE_URL}/patients/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, address, guardianName })
  });
  return res.json();
};

export const deletePaymentApi = async (id) => {
  const res = await fetch(`${BASE_URL}/payments/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
