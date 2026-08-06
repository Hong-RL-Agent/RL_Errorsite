const BASE_URL = 'http://localhost:9609/api';

export const fetchStaffs = async () => {
  const res = await fetch(`${BASE_URL}/staffs`);
  return res.json();
};

export const fetchAdvertisers = async () => {
  const res = await fetch(`${BASE_URL}/advertisers`);
  return res.json();
};

export const fetchCampaigns = async () => {
  const res = await fetch(`${BASE_URL}/campaigns`);
  return res.json();
};

export const fetchCreatives = async () => {
  const res = await fetch(`${BASE_URL}/creatives`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchCampaignsApi = async (advertiserName, status, search) => {
  const res = await fetch(`${BASE_URL}/campaigns/search?advertiserName=${advertiserName}&status=${status}&search=${search}`);
  return res.json();
};

export const approveCreativeApi = async (id) => {
  const res = await fetch(`${BASE_URL}/creatives/${id}/approve`, { method: 'POST' });
  return res.json();
};

export const patchCampaignBudgetApi = async (id, dailyBudget) => {
  const res = await fetch(`${BASE_URL}/campaigns/${id}/budget`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dailyBudget })
  });
  return res.json();
};

export const pauseCampaignApi = async (id) => {
  const res = await fetch(`${BASE_URL}/campaigns/${id}/pause`, { method: 'POST' });
  return res.json();
};

export const completeCreativeAuditApi = async (id) => {
  const res = await fetch(`${BASE_URL}/creatives/${id}/complete-audit`, { method: 'POST' });
  return res.json();
};

export const approveCreativeUnauthorizedApi = async (id, role = 'STAFF') => {
  const res = await fetch(`${BASE_URL}/creatives/${id}/approve-unauthorized`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchCampaignPartialApi = async (id, title, dailyBudget, targetRegion) => {
  const res = await fetch(`${BASE_URL}/campaigns/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, dailyBudget, targetRegion })
  });
  return res.json();
};

export const deleteBudgetLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/budget-logs/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
