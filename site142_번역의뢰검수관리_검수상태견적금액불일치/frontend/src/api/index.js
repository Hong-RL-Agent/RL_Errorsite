const BASE = 'http://localhost:9641/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchClients = () => fetch(`${BASE}/clients`).then(r => r.json());
export const fetchTranslators = () => fetch(`${BASE}/translators`).then(r => r.json());
export const fetchRequests = () => fetch(`${BASE}/requests`).then(r => r.json());
export const fetchReviewComments = () => fetch(`${BASE}/review-comments`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchRequestsApi = (langPair, status, search) =>
  fetch(`${BASE}/requests/search?langPair=${encodeURIComponent(langPair)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchRequestFeeApi = (id, actualFeeWon) =>
  fetch(`${BASE}/requests/${id}/fee`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actualFeeWon }) }).then(r => r.json());

export const patchRequestStatusApi = (id, status) =>
  fetch(`${BASE}/requests/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelRequestApi = (id) =>
  fetch(`${BASE}/requests/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeDeliveryApi = (id) =>
  fetch(`${BASE}/requests/${id}/complete-delivery`, { method: 'POST' }).then(r => r.json());

export const confirmQuoteUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/requests/${id}/confirm-quote-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchClientPartialApi = (id, clientName, phone, company) =>
  fetch(`${BASE}/clients/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientName, phone, company }) }).then(r => r.json());

export const deleteReviewCommentApi = (id) =>
  fetch(`${BASE}/review-comments/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
