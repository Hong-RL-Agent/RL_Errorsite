const BASE_URL = 'http://localhost:9588/api';

export const fetchUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
};

export const fetchShows = async () => {
  const res = await fetch(`${BASE_URL}/shows`);
  return res.json();
};

export const fetchSeats = async () => {
  const res = await fetch(`${BASE_URL}/seats`);
  return res.json();
};

export const fetchReservations = async () => {
  const res = await fetch(`${BASE_URL}/reservations`);
  return res.json();
};

export const fetchTicketLogs = async () => {
  const res = await fetch(`${BASE_URL}/ticket-logs`);
  return res.json();
};

export const searchSeatsApi = async (date, grade) => {
  const res = await fetch(`${BASE_URL}/seats/search?date=${date}&grade=${grade}`);
  return res.json();
};

export const patchPurchaserApi = async (id, userName, seatNo) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/purchaser`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userName, seatNo })
  });
  return res.json();
};

export const patchSeatApi = async (id, seatNo) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/seat`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatNo })
  });
  return res.json();
};

export const cancelReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const issueTicketApi = async (id, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/issue`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchShowPartialApi = async (id, time, venue, price) => {
  const res = await fetch(`${BASE_URL}/shows/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ time, venue, price })
  });
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
