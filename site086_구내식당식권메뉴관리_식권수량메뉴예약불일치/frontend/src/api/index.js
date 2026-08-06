const BASE_URL = 'http://localhost:9585/api';

export const fetchMenus = async () => {
  const res = await fetch(`${BASE_URL}/menus`);
  return res.json();
};

export const fetchTickets = async () => {
  const res = await fetch(`${BASE_URL}/tickets`);
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

export const searchMenusApi = async (cafeteria, type) => {
  const res = await fetch(`${BASE_URL}/menus/search?cafeteria=${cafeteria}&type=${type}`);
  return res.json();
};

export const patchReservationMenuApi = async (id, menuId, menuName) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/menu`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ menuId, menuName })
  });
  return res.json();
};

export const patchReservationQuantityApi = async (id, quantity, menuId, menuName) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/quantity`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity, menuId, menuName })
  });
  return res.json();
};

export const cancelReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const useTicketForReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}/use-ticket`, { method: 'POST' });
  return res.json();
};

export const createReservationApi = async (empId, empName, menuId, menuName, quantity) => {
  const res = await fetch(`${BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ empId, empName, menuId, menuName, quantity })
  });
  return res.json();
};

export const deleteReservationApi = async (id) => {
  const res = await fetch(`${BASE_URL}/reservations/${id}`, { method: 'DELETE' });
  return res.json();
};

export const deleteMenuUnauthorizedApi = async (id, role = 'GUEST_EMP') => {
  const res = await fetch(`${BASE_URL}/menus/${id}`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
