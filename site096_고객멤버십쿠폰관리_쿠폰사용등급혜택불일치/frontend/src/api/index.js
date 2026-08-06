const BASE_URL = 'http://localhost:9595/api';

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins`);
  return res.json();
};

export const fetchTiers = async () => {
  const res = await fetch(`${BASE_URL}/tiers`);
  return res.json();
};

export const fetchCustomers = async () => {
  const res = await fetch(`${BASE_URL}/customers`);
  return res.json();
};

export const fetchCoupons = async () => {
  const res = await fetch(`${BASE_URL}/coupons`);
  return res.json();
};

export const fetchPoints = async () => {
  const res = await fetch(`${BASE_URL}/points`);
  return res.json();
};

export const fetchPurchases = async () => {
  const res = await fetch(`${BASE_URL}/purchases`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchCustomersApi = async (tier, search) => {
  const res = await fetch(`${BASE_URL}/customers/search?tier=${tier}&search=${search}`);
  return res.json();
};

export const patchCustomerTierApi = async (id, tier) => {
  const res = await fetch(`${BASE_URL}/customers/${id}/tier`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tier })
  });
  return res.json();
};

export const issueCouponApi = async (id, couponName, discountRate, minTier) => {
  const res = await fetch(`${BASE_URL}/customers/${id}/issue-coupon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ couponName, discountRate, minTier })
  });
  return res.json();
};

export const cancelCouponUsageApi = async (id) => {
  const res = await fetch(`${BASE_URL}/coupons/${id}/cancel-use`, { method: 'POST' });
  return res.json();
};

export const earnPointsApi = async (id, pointsAmount, couponId) => {
  const res = await fetch(`${BASE_URL}/customers/${id}/earn-points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pointsAmount, couponId })
  });
  return res.json();
};

export const downgradeTierApi = async (id, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/customers/${id}/tier/downgrade`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchCustomerPartialApi = async (id, phone, preferredStore, marketingConsent) => {
  const res = await fetch(`${BASE_URL}/customers/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, preferredStore, marketingConsent })
  });
  return res.json();
};

export const deleteCouponUsageApi = async (id) => {
  const res = await fetch(`${BASE_URL}/coupons/${id}/usage`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
