const BASE_URL = 'http://localhost:9594/api';

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins`);
  return res.json();
};

export const fetchProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
};

export const fetchLocations = async () => {
  const res = await fetch(`${BASE_URL}/locations`);
  return res.json();
};

export const fetchInboundLogs = async () => {
  const res = await fetch(`${BASE_URL}/inbound`);
  return res.json();
};

export const fetchOutboundLogs = async () => {
  const res = await fetch(`${BASE_URL}/outbound`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchProductsApi = async (zone, category) => {
  const res = await fetch(`${BASE_URL}/products/search?zone=${zone}&category=${category}`);
  return res.json();
};

export const patchProductLocationApi = async (id, location, zone) => {
  const res = await fetch(`${BASE_URL}/products/${id}/location`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, zone })
  });
  return res.json();
};

export const patchProductStockApi = async (id, stock) => {
  const res = await fetch(`${BASE_URL}/products/${id}/stock`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stock })
  });
  return res.json();
};

export const cancelOutboundApi = async (id) => {
  const res = await fetch(`${BASE_URL}/outbound/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const confirmInboundApi = async (id) => {
  const res = await fetch(`${BASE_URL}/inbound/${id}/confirm`, { method: 'POST' });
  return res.json();
};

export const updateStockQuantityApi = async (id, quantity, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/products/${id}/quantity`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    },
    body: JSON.stringify({ quantity })
  });
  return res.json();
};

export const patchProductPartialApi = async (id, name, safetyStock, zone) => {
  const res = await fetch(`${BASE_URL}/products/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, safetyStock, zone })
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
