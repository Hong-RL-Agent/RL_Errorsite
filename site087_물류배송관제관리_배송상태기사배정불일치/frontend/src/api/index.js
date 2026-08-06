const BASE_URL = 'http://localhost:9586/api';

export const fetchUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
};

export const fetchCenters = async () => {
  const res = await fetch(`${BASE_URL}/centers`);
  return res.json();
};

export const fetchDrivers = async () => {
  const res = await fetch(`${BASE_URL}/drivers`);
  return res.json();
};

export const fetchOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
};

export const fetchLogs = async () => {
  const res = await fetch(`${BASE_URL}/logs`);
  return res.json();
};

export const fetchInquiries = async () => {
  const res = await fetch(`${BASE_URL}/inquiries`);
  return res.json();
};

export const searchOrdersApi = async (centerId, status) => {
  const res = await fetch(`${BASE_URL}/orders/search?centerId=${centerId}&status=${status}`);
  return res.json();
};

export const patchDriverApi = async (id, driverId, driverName) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/driver`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverId, driverName })
  });
  return res.json();
};

export const patchOrderStatusApi = async (id, status, driverId, driverName, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    },
    body: JSON.stringify({ status, driverId, driverName })
  });
  return res.json();
};

export const cancelOrderApi = async (id) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const reassignDriverApi = async (id, driverId, driverName) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/reassign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ driverId, driverName })
  });
  return res.json();
};

export const patchAddressPartialApi = async (id, zipcode, detailAddress, deliveryMemo) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/address`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zipcode, detailAddress, deliveryMemo })
  });
  return res.json();
};

export const deleteLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/logs/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
