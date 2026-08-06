const BASE_URL = 'http://localhost:9576/api';

export const fetchCenters = async () => {
  const res = await fetch(`${BASE_URL}/centers`);
  return res.json();
};

export const searchCentersApi = async (region, serviceType) => {
  const res = await fetch(`${BASE_URL}/centers/search?region=${region}&serviceType=${serviceType}`);
  return res.json();
};

export const fetchVehicles = async () => {
  const res = await fetch(`${BASE_URL}/vehicles`);
  return res.json();
};

export const fetchReservations = async () => {
  const res = await fetch(`${BASE_URL}/reservations`);
  return res.json();
};

export const patchDateApi = async (id, date) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/date`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date })
  });
  return res.json();
};

export const patchServiceTypeApi = async (id, serviceType, date) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/service-type`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceType, date })
  });
  return res.json();
};

export const cancelReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const patchStatusApi = async (id, status) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const deleteReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}`, { method: 'DELETE' });
  return res.json();
};

export const unauthorizedStatusChangeApi = async (id, status, mechanicName) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/unauthorized-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, mechanicName })
  });
  return { status: res.status, data: await res.json() };
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
