const BASE = 'http://localhost:9613/api';

export const fetchWorkers = () => fetch(`${BASE}/workers`).then(r => r.json());
export const fetchZones = () => fetch(`${BASE}/zones`).then(r => r.json());
export const fetchEquipments = () => fetch(`${BASE}/equipments`).then(r => r.json());
export const fetchSafetyInspections = () => fetch(`${BASE}/inspections`).then(r => r.json());
export const fetchSafetyTrainings = () => fetch(`${BASE}/trainings`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchInspectionsApi = (zoneId, riskGrade, search) =>
  fetch(`${BASE}/inspections/search?zoneId=${zoneId}&riskGrade=${riskGrade}&search=${search}`).then(r => r.json());

export const patchInspectionEquipmentApi = (id, equipmentId, equipmentName) =>
  fetch(`${BASE}/inspections/${id}/equipment`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ equipmentId, equipmentName }) }).then(r => r.json());

export const patchInspectionStatusApi = (id, status) =>
  fetch(`${BASE}/inspections/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelHazardApi = (id) =>
  fetch(`${BASE}/inspections/${id}/cancel-hazard`, { method: 'POST' }).then(r => r.json());

export const completeEquipmentInspectionApi = (id) =>
  fetch(`${BASE}/inspections/${id}/complete-equipment-inspection`, { method: 'POST' }).then(r => r.json());

export const completeInspectionUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/inspections/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-manager-role': role } }).then(r => r.json());

export const patchEquipmentPartialApi = (id, name, inspectCycleDays, zoneId) =>
  fetch(`${BASE}/equipments/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, inspectCycleDays, zoneId }) }).then(r => r.json());

export const deleteTrainingLogApi = (id) =>
  fetch(`${BASE}/trainings/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
