const BASE = 'http://localhost:9624/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchClients = () => fetch(`${BASE}/clients`).then(r => r.json());
export const fetchContracts = () => fetch(`${BASE}/contracts`).then(r => r.json());
export const fetchClauses = () => fetch(`${BASE}/clauses`).then(r => r.json());
export const fetchComments = () => fetch(`${BASE}/comments`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchContractsApi = (clientName, status, search) =>
  fetch(`${BASE}/contracts/search?clientName=${clientName}&status=${status}&search=${search}`).then(r => r.json());

export const patchContractClauseApi = (id, clauseContent) =>
  fetch(`${BASE}/contracts/${id}/clause`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clauseContent }) }).then(r => r.json());

export const patchContractStatusApi = (id, status) =>
  fetch(`${BASE}/contracts/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const rejectContractApi = (id) =>
  fetch(`${BASE}/contracts/${id}/reject`, { method: 'POST' }).then(r => r.json());

export const addReviewCommentApi = (id) =>
  fetch(`${BASE}/contracts/${id}/add-comment`, { method: 'POST' }).then(r => r.json());

export const approveContractUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/contracts/${id}/approve-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchContractPartialApi = (id, title, expireDate, clientName) =>
  fetch(`${BASE}/contracts/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, expireDate, clientName }) }).then(r => r.json());

export const deleteCommentApi = (id) =>
  fetch(`${BASE}/comments/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
