const BASE_URL = 'http://localhost:9598/api';

export const fetchSellers = async () => {
  const res = await fetch(`${BASE_URL}/sellers`);
  return res.json();
};

export const fetchProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
};

export const fetchBuyers = async () => {
  const res = await fetch(`${BASE_URL}/buyers`);
  return res.json();
};

export const fetchOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`);
  return res.json();
};

export const fetchSettlements = async () => {
  const res = await fetch(`${BASE_URL}/settlements`);
  return res.json();
};

export const fetchDeliveryLogs = async () => {
  const res = await fetch(`${BASE_URL}/delivery-logs`);
  return res.json();
};

export const searchOrdersApi = async (status, sellerId, search) => {
  const res = await fetch(`${BASE_URL}/orders/search?status=${status}&sellerId=${sellerId}&search=${search}`);
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

export const patchSettlementAmountApi = async (id, settlementAmount) => {
  const res = await fetch(`${BASE_URL}/settlements/${id}/amount`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ settlementAmount })
  });
  return res.json();
};

export const cancelOrderApi = async (id) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const registerTrackingApi = async (id, trackingNo) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/tracking`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackingNo })
  });
  return res.json();
};

export const cancelOrderUnauthorizedApi = async (id, sellerId = 'SLR-101') => {
  const res = await fetch(`${BASE_URL}/orders/${id}/cancel-unauthorized`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-seller-id': sellerId
    }
  });
  return res.json();
};

export const patchProductPartialApi = async (id, name, price, shippingFee) => {
  const res = await fetch(`${BASE_URL}/products/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, price, shippingFee })
  });
  return res.json();
};

export const deleteSettlementApi = async (id) => {
  const res = await fetch(`${BASE_URL}/settlements/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
