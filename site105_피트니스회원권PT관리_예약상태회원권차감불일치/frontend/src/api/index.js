const BASE_URL = 'http://localhost:9604/api';

export const fetchTrainers = async () => {
  const res = await fetch(`${BASE_URL}/trainers`);
  return res.json();
};

export const fetchMembers = async () => {
  const res = await fetch(`${BASE_URL}/members`);
  return res.json();
};

export const fetchMembershipPasses = async () => {
  const res = await fetch(`${BASE_URL}/membership-passes`);
  return res.json();
};

export const fetchReservations = async () => {
  const res = await fetch(`${BASE_URL}/reservations`);
  return res.json();
};

export const fetchAttendanceLogs = async () => {
  const res = await fetch(`${BASE_URL}/attendance-logs`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchReservationsApi = async (trainerName, status, search) => {
  const res = await fetch(`${BASE_URL}/reservations/search?trainerName=${trainerName}&status=${status}&search=${search}`);
  return res.json();
};

export const patchReservationTimeApi = async (id, resTime) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/time`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resTime })
  });
  return res.json();
};

export const patchReservationTrainerApi = async (id, trainerName) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/trainer`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trainerName })
  });
  return res.json();
};

export const cancelReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const checkInAttendanceApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/check-in`, { method: 'POST' });
  return res.json();
};

export const deductPassUnauthorizedApi = async (id, role = 'STAFF') => {
  const res = await fetch(`${BASE_URL}/passes/${id}/deduct-unauthorized`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchMemberPartialApi = async (id, phone, expiryDate, assignedTrainer) => {
  const res = await fetch(`${BASE_URL}/members/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, expiryDate, assignedTrainer })
  });
  return res.json();
};

export const deleteAttendanceLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/attendance-logs/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
