const BASE_URL = 'http://localhost:9579/api';

export const fetchCampsites = async () => {
  const res = await fetch(`${BASE_URL}/campsites`);
  return res.json();
};

export const searchCampsitesApi = async (region, type) => {
  const res = await fetch(`${BASE_URL}/campsites/search?region=${region}&type=${type}`);
  return res.json();
};

export const fetchCampsiteDetailApi = async (id) => {
  const res = await fetch(`${BASE_URL}/campsites/${id}`);
  return res.json();
};

export const fetchSites = async () => {
  const res = await fetch(`${BASE_URL}/sites`);
  return res.json();
};

export const fetchReservations = async () => {
  const res = await fetch(`${BASE_URL}/reservations`);
  return res.json();
};

export const fetchReviews = async () => {
  const res = await fetch(`${BASE_URL}/reviews`);
  return res.json();
};

export const addOptionApi = async (id, optionName) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/options`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ optionName })
  });
  return res.json();
};

export const patchDatesApi = async (id, checkIn, checkOut, options) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/dates`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checkIn, checkOut, options })
  });
  return res.json();
};

export const reserveSiteApi = async (siteId, userId) => {
  const res = await fetch(`${BASE_URL}/sites/${siteId}/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ siteId, userId })
  });
  return res.json();
};

export const cancelReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const deleteReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
