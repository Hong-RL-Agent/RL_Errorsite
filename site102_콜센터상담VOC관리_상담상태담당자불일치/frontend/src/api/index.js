const BASE_URL = 'http://localhost:9601/api';

export const fetchVocCategories = async () => {
  const res = await fetch(`${BASE_URL}/voc-categories`);
  return res.json();
};

export const fetchAgents = async () => {
  const res = await fetch(`${BASE_URL}/agents`);
  return res.json();
};

export const fetchCustomers = async () => {
  const res = await fetch(`${BASE_URL}/customers`);
  return res.json();
};

export const fetchConsultations = async () => {
  const res = await fetch(`${BASE_URL}/consultations`);
  return res.json();
};

export const fetchMemos = async () => {
  const res = await fetch(`${BASE_URL}/memos`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchConsultationsApi = async (category, status, search) => {
  const res = await fetch(`${BASE_URL}/consultations/search?category=${category}&status=${status}&search=${search}`);
  return res.json();
};

export const patchCallStatusApi = async (id, status) => {
  const res = await fetch(`${BASE_URL}/calls/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const patchCallAgentApi = async (id, agentName) => {
  const res = await fetch(`${BASE_URL}/calls/${id}/agent`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentName })
  });
  return res.json();
};

export const completeCallApi = async (id) => {
  const res = await fetch(`${BASE_URL}/calls/${id}/complete`, { method: 'POST' });
  return res.json();
};

export const reopenCallApi = async (id, inquiryText) => {
  const res = await fetch(`${BASE_URL}/calls/${id}/reopen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ inquiryText })
  });
  return res.json();
};

export const patchStatusUnauthorizedApi = async (id, status, role = 'STAFF') => {
  const res = await fetch(`${BASE_URL}/calls/${id}/status-unauthorized`, {
    method: 'PATCH',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const patchCustomerPartialApi = async (id, phone, tier, recentInquiry) => {
  const res = await fetch(`${BASE_URL}/customers/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, tier, recentInquiry })
  });
  return res.json();
};

export const deleteMemoApi = async (id) => {
  const res = await fetch(`${BASE_URL}/memos/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
