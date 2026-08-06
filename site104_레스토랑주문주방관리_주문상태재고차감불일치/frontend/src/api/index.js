const BASE_URL = 'http://localhost:9603/api';

export const fetchChefs = async () => {
  const res = await fetch(`${BASE_URL}/chefs`);
  return res.json();
};

export const fetchTables = async () => {
  const res = await fetch(`${BASE_URL}/tables`);
  return res.json();
};

export const fetchMenus = async () => {
  const res = await fetch(`${BASE_URL}/menus`);
  return res.json();
};

export const fetchIngredients = async () => {
  const res = await fetch(`${BASE_URL}/ingredients`);
  return res.json();
};

export const fetchOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
};

export const fetchStockLogs = async () => {
  const res = await fetch(`${BASE_URL}/stock-logs`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchOrdersApi = async (tableSection, status, search) => {
  const res = await fetch(`${BASE_URL}/orders/search?tableSection=${tableSection}&status=${status}&search=${search}`);
  return res.json();
};

export const patchOrderStatusApi = async (id, status) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const patchOrderChefApi = async (id, chefName) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/chef`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chefName })
  });
  return res.json();
};

export const cancelOrderApi = async (id) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const deductStockApi = async (id, ingredientName, deductQty) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/deduct-stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredientName, deductQty })
  });
  return res.json();
};

export const disposeStockUnauthorizedApi = async (id, role = 'STAFF') => {
  const res = await fetch(`${BASE_URL}/stock/${id}/dispose-unauthorized`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchMenuPartialApi = async (id, name, price, mainIngredient) => {
  const res = await fetch(`${BASE_URL}/menus/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, mainIngredient })
  });
  return res.json();
};

export const deleteStockLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/stock-logs/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
