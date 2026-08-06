const BASE = 'http://localhost:9654/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchCounselors = () => fetch(`${BASE}/counselors`).then(r => r.json());
export const fetchClients = () => fetch(`${BASE}/clients`).then(r => r.json());
export const fetchCounsels = () => fetch(`${BASE}/counsels`).then(r => r.json());
export const fetchFollowups = () => fetch(`${BASE}/followups`).then(r => r.json());
export const fetchCounselLogs = () => fetch(`${BASE}/counsel-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchCounselsApi = (counselorName, status, search) =>
  fetch(`${BASE}/counsels/search?counselorName=${encodeURIComponent(counselorName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchCounselNoteTextApi = (id, noteText) =>
  fetch(`${BASE}/counsels/${id}/note-text`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ noteText }) }).then(r => r.json());

export const patchCounselStatusApi = (id, status) =>
  fetch(`${BASE}/counsels/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelCounselApi = (id) =>
  fetch(`${BASE}/counsels/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const registerFollowupApi = (id) =>
  fetch(`${BASE}/counsels/${id}/register-followup`, { method: 'POST' }).then(r => r.json());

export const viewCounselLogUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/counsels/${id}/view-log-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchClientPartialApi = (id, clientName, phone, topic) =>
  fetch(`${BASE}/clients/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientName, phone, topic }) }).then(r => r.json());

export const deleteCounselLogApi = (id) =>
  fetch(`${BASE}/counsel-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
