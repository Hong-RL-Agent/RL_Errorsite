const BASE = 'http://localhost:9663/api';

export const fetchOperators = () => fetch(`${BASE}/operators`).then(r => r.json());
export const fetchEquipments = () => fetch(`${BASE}/equipments`).then(r => r.json());
export const fetchInspections = () => fetch(`${BASE}/inspections`).then(r => r.json());
export const fetchAlerts = () => fetch(`${BASE}/alerts`).then(r => r.json());
export const fetchWaterLogs = () => fetch(`${BASE}/water-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchEquipmentsApi = (section, status, search) =>
  fetch(`${BASE}/equipments/search?section=${encodeURIComponent(section)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchWaterMetricsApi = (id, turbidityNtu, phLevel) =>
  fetch(`${BASE}/inspections/${id}/water-metrics`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ turbidityNtu, phLevel }) }).then(r => r.json());

export const patchInspectionStatusApi = (id, status) =>
  fetch(`${BASE}/inspections/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelInspectionApi = (id) =>
  fetch(`${BASE}/inspections/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const processAlertActionApi = (id) =>
  fetch(`${BASE}/inspections/${id}/process-alert`, { method: 'POST' }).then(r => r.json());

export const updateWaterMetricsUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/inspections/${id}/calibrate-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchEquipmentPartialApi = (id, equipName, location, checkCycleDays) =>
  fetch(`${BASE}/equipments/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ equipName, location, checkCycleDays }) }).then(r => r.json());

export const deleteWaterLogApi = (id) =>
  fetch(`${BASE}/water-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
