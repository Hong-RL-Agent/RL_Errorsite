const BASE = 'http://localhost:9611/api';

export const fetchCurators = () => fetch(`${BASE}/curators`).then(r => r.json());
export const fetchGalleries = () => fetch(`${BASE}/galleries`).then(r => r.json());
export const fetchArtifacts = () => fetch(`${BASE}/artifacts`).then(r => r.json());
export const fetchLoanRequests = () => fetch(`${BASE}/loan-requests`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchArtifactsApi = (gallery, conservationGrade, search) =>
  fetch(`${BASE}/artifacts/search?gallery=${gallery}&conservationGrade=${conservationGrade}&search=${search}`).then(r => r.json());

export const patchArtifactGalleryApi = (id, galleryId, galleryName) =>
  fetch(`${BASE}/artifacts/${id}/gallery`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ galleryId, galleryName }) }).then(r => r.json());

export const patchArtifactConservationApi = (id, conservationGrade, status) =>
  fetch(`${BASE}/artifacts/${id}/conservation`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conservationGrade, status }) }).then(r => r.json());

export const cancelLoanApi = (id) =>
  fetch(`${BASE}/loan-requests/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeReturnApi = (id) =>
  fetch(`${BASE}/loan-requests/${id}/complete-return`, { method: 'POST' }).then(r => r.json());

export const approveLoanUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/loan-requests/${id}/approve-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-curator-role': role } }).then(r => r.json());

export const patchArtifactPartialApi = (id, name, madeYear, conservationGrade) =>
  fetch(`${BASE}/artifacts/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, madeYear, conservationGrade }) }).then(r => r.json());

export const deleteConservationLogApi = (id) =>
  fetch(`${BASE}/conservation-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
