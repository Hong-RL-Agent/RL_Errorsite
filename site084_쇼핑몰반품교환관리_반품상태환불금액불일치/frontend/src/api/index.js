const BASE_URL = 'http://localhost:9583/api';

export const fetchOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
};

export const fetchReturns = async () => {
  const res = await fetch(`${BASE_URL}/returns`);
  return res.json();
};

export const searchReturnsApi = async (status, reason) => {
  const res = await fetch(`${BASE_URL}/returns/search?status=${status}&reason=${reason}`);
  return res.json();
};

export const fetchExchanges = async () => {
  const res = await fetch(`${BASE_URL}/exchanges`);
  return res.json();
};

export const fetchInquiries = async () => {
  const res = await fetch(`${BASE_URL}/inquiries`);
  return res.json();
};

export const patchPickupDateApi = async (id, pickupDate) => {
  const res = await fetch(`${BASE_URL}/returns/${id}/pickup-date`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pickupDate })
  });
  return res.json();
};

export const patchReasonApi = async (id, reason, pickupDate) => {
  const res = await fetch(`${BASE_URL}/returns/${id}/reason`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason, pickupDate })
  });
  return res.json();
};

export const cancelReturnApi = async (id) => {
  const res = await fetch(`${BASE_URL}/returns/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const approveRefundApi = async (id, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/returns/${id}/approve`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const deleteReturnApi = async (id) => {
  const res = await fetch(`${BASE_URL}/returns/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
