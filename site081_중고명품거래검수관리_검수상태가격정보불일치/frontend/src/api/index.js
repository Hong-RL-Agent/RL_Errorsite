const BASE_URL = 'http://localhost:9580/api';

export const fetchProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
};

export const searchProductsApi = async (brand, inspectionStatus) => {
  const res = await fetch(`${BASE_URL}/products/search?brand=${brand}&inspectionStatus=${inspectionStatus}`);
  return res.json();
};

export const fetchProductDetailApi = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  return res.json();
};

export const fetchInspections = async () => {
  const res = await fetch(`${BASE_URL}/inspections`);
  return res.json();
};

export const fetchTransactions = async () => {
  const res = await fetch(`${BASE_URL}/transactions`);
  return res.json();
};

export const fetchSellers = async () => {
  const res = await fetch(`${BASE_URL}/sellers`);
  return res.json();
};

export const patchInspectionStatusApi = async (id, inspectionStatus) => {
  const res = await fetch(`${BASE_URL}/products/${id}/inspection-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inspectionStatus })
  });
  return res.json();
};

export const patchPriceApi = async (id, price, inspectionStatus) => {
  const res = await fetch(`${BASE_URL}/products/${id}/price`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ price, inspectionStatus })
  });
  return res.json();
};

export const rejectProductApi = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}/reject`, { method: 'POST' });
  return res.json();
};

export const patchDescriptionApi = async (id, name) => {
  const res = await fetch(`${BASE_URL}/products/${id}/description`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
};

export const purchaseProductApi = async (productId, buyerName) => {
  const res = await fetch(`${BASE_URL}/products/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, buyerName })
  });
  return res.json();
};

export const deleteTransactionApi = async (id) => {
  const res = await fetch(`${BASE_URL}/transactions/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
