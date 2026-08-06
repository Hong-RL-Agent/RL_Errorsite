const BASE_URL = 'http://localhost:9584/api';

export const fetchRooms = async () => {
  const res = await fetch(`${BASE_URL}/rooms`);
  return res.json();
};

export const fetchEquipments = async () => {
  const res = await fetch(`${BASE_URL}/equipments`);
  return res.json();
};

export const fetchReservations = async () => {
  const res = await fetch(`${BASE_URL}/reservations`);
  return res.json();
};

export const fetchEmployees = async () => {
  const res = await fetch(`${BASE_URL}/employees`);
  return res.json();
};

export const searchRoomsApi = async (floor, type) => {
  const res = await fetch(`${BASE_URL}/rooms/search?floor=${floor}&type=${type}`);
  return res.json();
};

export const patchReservationEquipmentApi = async (id, equipments) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/equipment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ equipments })
  });
  return res.json();
};

export const patchReservationTimeApi = async (id, date, timeSlot, equipments) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/time`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, timeSlot, equipments })
  });
  return res.json();
};

export const cancelReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const returnEquipmentStatusApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/return-equipment`, { method: 'POST' });
  return res.json();
};

export const reserveEquipmentApi = async (eqpId, empId, empName) => {
  const res = await fetch(`${BASE_URL}/equipments/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eqpId, empId, empName })
  });
  return res.json();
};

export const deleteReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}`, { method: 'DELETE' });
  return res.json();
};

export const updateEquipmentStatusUnauthorizedApi = async (id, status = 'AVAILABLE', role = 'GUEST_EMP') => {
  const res = await fetch(`${BASE_URL}/equipments/${id}/status`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
