const BASE_URL = 'http://localhost:9578/api';

export const fetchSeats = async () => {
  const res = await fetch(`${BASE_URL}/seats`);
  return res.json();
};

export const fetchBooks = async () => {
  const res = await fetch(`${BASE_URL}/books`);
  return res.json();
};

export const searchBooksApi = async (query, category) => {
  const res = await fetch(`${BASE_URL}/books/search?query=${encodeURIComponent(query)}&category=${category}`);
  return res.json();
};

export const fetchBookDetailApi = async (id) => {
  const res = await fetch(`${BASE_URL}/books/${id}`);
  return res.json();
};

export const fetchReservations = async () => {
  const res = await fetch(`${BASE_URL}/reservations`);
  return res.json();
};

export const fetchUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
};

export const patchCapacityApi = async (id, capacity) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/capacity`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ capacity })
  });
  return res.json();
};

export const patchTimeSlotApi = async (id, timeSlot, capacity) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/time`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timeSlot, capacity })
  });
  return res.json();
};

export const reserveSeatApi = async (seatId, userId, userName) => {
  const res = await fetch(`${BASE_URL}/seats/${seatId}/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatId, userId, userName })
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
