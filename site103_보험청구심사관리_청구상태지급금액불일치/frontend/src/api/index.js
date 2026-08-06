const BASE_URL = 'http://localhost:9602/api';

export const fetchAdjusters = async () => {
  const res = await fetch(`${BASE_URL}/adjusters`);
  return res.json();
};

export const fetchProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return res.json();
};

export const fetchPolicyholders = async () => {
  const res = await fetch(`${BASE_URL}/policyholders`);
  return res.json();
};

export const fetchClaims = async () => {
  const res = await fetch(`${BASE_URL}/claims`);
  return res.json();
};

export const fetchMemos = async () => {
  const res = await fetch(`${BASE_URL}/memos`);
  return res.json();
};

export const fetchPayouts = async () => {
  const res = await fetch(`${BASE_URL}/payouts`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchClaimsApi = async (productName, status, search) => {
  const res = await fetch(`${BASE_URL}/claims/search?productName=${productName}&status=${status}&search=${search}`);
  return res.json();
};

export const patchClaimStatusApi = async (id, status) => {
  const res = await fetch(`${BASE_URL}/claims/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const patchPayoutAmountApi = async (id, payoutAmount) => {
  const res = await fetch(`${BASE_URL}/claims/${id}/payout`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payoutAmount })
  });
  return res.json();
};

export const rejectClaimApi = async (id) => {
  const res = await fetch(`${BASE_URL}/claims/${id}/reject`, { method: 'POST' });
  return res.json();
};

export const completeSupplementApi = async (id) => {
  const res = await fetch(`${BASE_URL}/claims/${id}/supplement`, { method: 'POST' });
  return res.json();
};

export const approvePayoutUnauthorizedApi = async (id, role = 'STAFF') => {
  const res = await fetch(`${BASE_URL}/claims/${id}/approve-unauthorized`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchPolicyholderPartialApi = async (id, address, phone, bankAccount) => {
  const res = await fetch(`${BASE_URL}/policyholders/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, phone, bankAccount })
  });
  return res.json();
};

export const deletePayoutApi = async (id) => {
  const res = await fetch(`${BASE_URL}/payouts/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
