const BASE_URL = 'http://localhost:9590/api';

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins`);
  return res.json();
};

export const fetchRooms = async () => {
  const res = await fetch(`${BASE_URL}/rooms`);
  return res.json();
};

export const fetchReservations = async () => {
  const res = await fetch(`${BASE_URL}/reservations`);
  return res.json();
};

export const fetchStaff = async () => {
  const res = await fetch(`${BASE_URL}/staff`);
  return res.json();
};

export const fetchCleaningLogs = async () => {
  const res = await fetch(`${BASE_URL}/cleaning-logs`);
  return res.json();
};

export const fetchRequests = async () => {
  const res = await fetch(`${BASE_URL}/requests`);
  return res.json();
};

export const searchRoomsApi = async (floor, status) => {
  const res = await fetch(`${BASE_URL}/rooms/search?floor=${floor}&status=${status}`);
  return res.json();
};

export const patchRoomStaffApi = async (id, cleanerId, cleanerName) => {
  const res = await fetch(`${BASE_URL}/rooms/${id}/staff`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cleanerId, cleanerName })
  });
  return res.json();
};

export const patchRoomStatusApi = async (id, status) => {
  const res = await fetch(`${BASE_URL}/rooms/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const checkoutRoomApi = async (id) => {
  const res = await fetch(`${BASE_URL}/rooms/${id}/checkout`, { method: 'POST' });
  return res.json();
};

export const completeCleaningApi = async (id) => {
  const res = await fetch(`${BASE_URL}/rooms/${id}/complete-cleaning`, { method: 'POST' });
  return res.json();
};

export const inspectRoomApi = async (id, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/rooms/${id}/inspect`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchRoomPartialApi = async (id, roomType, price, cleaningNote) => {
  const res = await fetch(`${BASE_URL}/rooms/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomType, price, cleaningNote })
  });
  return res.json();
};

export const deleteCleaningLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/cleaning-logs/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
