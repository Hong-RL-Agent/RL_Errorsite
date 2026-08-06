const BASE = 'http://localhost:9638/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchSubjects = () => fetch(`${BASE}/subjects`).then(r => r.json());
export const fetchExamCenters = () => fetch(`${BASE}/exam-centers`).then(r => r.json());
export const fetchExaminees = () => fetch(`${BASE}/examinees`).then(r => r.json());
export const fetchScores = () => fetch(`${BASE}/scores`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchExamineesApi = (subjectName, status, search) =>
  fetch(`${BASE}/examinees/search?subjectName=${encodeURIComponent(subjectName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchExamineeScoreApi = (id, score) =>
  fetch(`${BASE}/examinees/${id}/score`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score }) }).then(r => r.json());

export const patchExamineeStatusApi = (id, status) =>
  fetch(`${BASE}/examinees/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelRegistrationApi = (id) =>
  fetch(`${BASE}/examinees/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeScoringApi = (id) =>
  fetch(`${BASE}/examinees/${id}/complete-scoring`, { method: 'POST' }).then(r => r.json());

export const passExamineeUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/examinees/${id}/pass-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchExamineePartialApi = (id, name, phone, examCenter) =>
  fetch(`${BASE}/examinees/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, phone, examCenter }) }).then(r => r.json());

export const deleteScoreApi = (id) =>
  fetch(`${BASE}/scores/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
