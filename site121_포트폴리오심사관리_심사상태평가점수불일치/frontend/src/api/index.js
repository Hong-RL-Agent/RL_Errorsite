const BASE = 'http://localhost:9620/api';

export const fetchReviewers = () => fetch(`${BASE}/reviewers`).then(r => r.json());
export const fetchApplicants = () => fetch(`${BASE}/applicants`).then(r => r.json());
export const fetchPortfolios = () => fetch(`${BASE}/portfolios`).then(r => r.json());
export const fetchEvaluations = () => fetch(`${BASE}/evaluations`).then(r => r.json());
export const fetchComments = () => fetch(`${BASE}/comments`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchApplicantsApi = (targetJob, status, search) =>
  fetch(`${BASE}/applicants/search?targetJob=${targetJob}&status=${status}&search=${search}`).then(r => r.json());

export const patchApplicantScoreApi = (id, evalScore) =>
  fetch(`${BASE}/applicants/${id}/score`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ evalScore }) }).then(r => r.json());

export const patchApplicantStatusApi = (id, status) =>
  fetch(`${BASE}/applicants/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelApplicantApi = (id) =>
  fetch(`${BASE}/applicants/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const addEvaluationCommentApi = (id) =>
  fetch(`${BASE}/applicants/${id}/add-comment`, { method: 'POST' }).then(r => r.json());

export const confirmPassUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/applicants/${id}/confirm-pass-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchApplicantPartialApi = (id, name, targetJob, phone) =>
  fetch(`${BASE}/applicants/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, targetJob, phone }) }).then(r => r.json());

export const deleteEvaluationApi = (id) =>
  fetch(`${BASE}/evaluations/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
