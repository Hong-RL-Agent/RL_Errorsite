const BASE = 'http://localhost:9657/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchHabitats = () => fetch(`${BASE}/habitats`).then(r => r.json());
export const fetchZookeepers = () => fetch(`${BASE}/zookeepers`).then(r => r.json());
export const fetchAnimals = () => fetch(`${BASE}/animals`).then(r => r.json());
export const fetchMedicalRecords = () => fetch(`${BASE}/medical-records`).then(r => r.json());
export const fetchFeedingLogs = () => fetch(`${BASE}/feeding-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchAnimalsApi = (habitatZone, status, search) =>
  fetch(`${BASE}/animals/search?habitatZone=${encodeURIComponent(habitatZone)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchAnimalHabitatZoneApi = (id, habitatZone) =>
  fetch(`${BASE}/animals/${id}/habitat-zone`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ habitatZone }) }).then(r => r.json());

export const patchAnimalStatusApi = (id, status) =>
  fetch(`${BASE}/animals/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelTreatmentApi = (id) =>
  fetch(`${BASE}/animals/${id}/cancel-treatment`, { method: 'POST' }).then(r => r.json());

export const registerFeedingLogApi = (id) =>
  fetch(`${BASE}/animals/${id}/register-feeding`, { method: 'POST' }).then(r => r.json());

export const completeTreatmentUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/animals/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchAnimalPartialApi = (id, animalName, ageYears, healthGrade) =>
  fetch(`${BASE}/animals/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ animalName, ageYears, healthGrade }) }).then(r => r.json());

export const deleteFeedingLogApi = (id) =>
  fetch(`${BASE}/feeding-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
