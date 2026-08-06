const BASE = 'http://localhost:9650/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchPlants = () => fetch(`${BASE}/plants`).then(r => r.json());
export const fetchSubscribers = () => fetch(`${BASE}/subscribers`).then(r => r.json());
export const fetchDeliveries = () => fetch(`${BASE}/deliveries`).then(r => r.json());
export const fetchHealthLogs = () => fetch(`${BASE}/health-logs`).then(r => r.json());
export const fetchReplacements = () => fetch(`${BASE}/replacements`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchSubscribersApi = (plantType, status, search) =>
  fetch(`${BASE}/subscribers/search?plantType=${encodeURIComponent(plantType)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchSubscriberHealthStatusApi = (id, healthStatus) =>
  fetch(`${BASE}/subscribers/${id}/health-status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ healthStatus }) }).then(r => r.json());

export const patchSubscriberDeliveryStatusApi = (id, status) =>
  fetch(`${BASE}/subscribers/${id}/delivery-status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelSubscriptionApi = (id) =>
  fetch(`${BASE}/subscribers/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const approveReplacementApi = (id) =>
  fetch(`${BASE}/subscribers/${id}/approve-replacement`, { method: 'POST' }).then(r => r.json());

export const approveReplacementUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/subscribers/${id}/approve-replacement-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchPlantPartialApi = (id, plantName, waterCycle, sunlightGrade) =>
  fetch(`${BASE}/plants/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plantName, waterCycle, sunlightGrade }) }).then(r => r.json());

export const deleteHealthLogApi = (id) =>
  fetch(`${BASE}/health-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
