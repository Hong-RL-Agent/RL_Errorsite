const BASE = 'http://localhost:9659/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchClasses = () => fetch(`${BASE}/classes`).then(r => r.json());
export const fetchStudents = () => fetch(`${BASE}/students`).then(r => r.json());
export const fetchArtworks = () => fetch(`${BASE}/artworks`).then(r => r.json());
export const fetchEvaluations = () => fetch(`${BASE}/evaluations`).then(r => r.json());
export const fetchFeedbacks = () => fetch(`${BASE}/feedbacks`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchArtworksApi = (className, status, search) =>
  fetch(`${BASE}/artworks/search?className=${encodeURIComponent(className)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchArtworkScoreApi = (id, score) =>
  fetch(`${BASE}/artworks/${id}/score`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ score }) }).then(r => r.json());

export const patchArtworkStatusApi = (id, status) =>
  fetch(`${BASE}/artworks/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelSubmissionApi = (id) =>
  fetch(`${BASE}/artworks/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const addFeedbackApi = (id) =>
  fetch(`${BASE}/artworks/${id}/feedback`, { method: 'POST' }).then(r => r.json());

export const confirmScoreUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/artworks/${id}/confirm-score-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchStudentPartialApi = (id, studentName, className, parentContact) =>
  fetch(`${BASE}/students/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ studentName, className, parentContact }) }).then(r => r.json());

export const deleteFeedbackApi = (id) =>
  fetch(`${BASE}/feedbacks/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
