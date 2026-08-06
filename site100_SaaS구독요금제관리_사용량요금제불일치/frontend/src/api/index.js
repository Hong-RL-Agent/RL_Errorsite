const BASE_URL = 'http://localhost:9599/api';

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins`);
  return res.json();
};

export const fetchPlans = async () => {
  const res = await fetch(`${BASE_URL}/plans`);
  return res.json();
};

export const fetchOrganizations = async () => {
  const res = await fetch(`${BASE_URL}/organizations`);
  return res.json();
};

export const fetchTeamMembers = async () => {
  const res = await fetch(`${BASE_URL}/team-members`);
  return res.json();
};

export const fetchUsageLogs = async () => {
  const res = await fetch(`${BASE_URL}/usage-logs`);
  return res.json();
};

export const fetchBillingHistories = async () => {
  const res = await fetch(`${BASE_URL}/billing-histories`);
  return res.json();
};

export const searchOrganizationsApi = async (planId, status, search) => {
  const res = await fetch(`${BASE_URL}/organizations/search?planId=${planId}&status=${status}&search=${search}`);
  return res.json();
};

export const patchPlanApi = async (id, planId, planName) => {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}/plan`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ planId, planName })
  });
  return res.json();
};

export const patchLicenseSeatsApi = async (id, seatsAllowed) => {
  const res = await fetch(`${BASE_URL}/organizations/${id}/seats`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seatsAllowed })
  });
  return res.json();
};

export const cancelSubscriptionApi = async (id) => {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}/cancel`, { method: 'POST' });
  return res.json();
};

export const refreshUsageApi = async (id) => {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}/refresh-usage`, { method: 'POST' });
  return res.json();
};

export const patchPlanUnauthorizedApi = async (id, planId, planName, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/subscriptions/${id}/plan-unauthorized`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    },
    body: JSON.stringify({ planId, planName })
  });
  return res.json();
};

export const patchOrgPartialApi = async (id, name, billingEmail, bizRegNo) => {
  const res = await fetch(`${BASE_URL}/organizations/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, billingEmail, bizRegNo })
  });
  return res.json();
};

export const deleteUsageLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/usage-logs/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
