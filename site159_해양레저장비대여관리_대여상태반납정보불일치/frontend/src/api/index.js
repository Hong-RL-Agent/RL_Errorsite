const BASE = 'http://localhost:9658/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchEquipments = () => fetch(`${BASE}/equipments`).then(r => r.json());
export const fetchCustomers = () => fetch(`${BASE}/customers`).then(r => r.json());
export const fetchRentals = () => fetch(`${BASE}/rentals`).then(r => r.json());
export const fetchReturnLogs = () => fetch(`${BASE}/return-logs`).then(r => r.json());
export const fetchSafetyLogs = () => fetch(`${BASE}/safety-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchRentalsApi = (branchName, status, search) =>
  fetch(`${BASE}/rentals/search?branchName=${encodeURIComponent(branchName)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchRentalReturnTimeApi = (id, returnTime) =>
  fetch(`${BASE}/rentals/${id}/return-time`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnTime }) }).then(r => r.json());

export const patchRentalStatusApi = (id, status) =>
  fetch(`${BASE}/rentals/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelRentalApi = (id) =>
  fetch(`${BASE}/rentals/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeReturnApi = (id) =>
  fetch(`${BASE}/rentals/${id}/complete-return`, { method: 'POST' }).then(r => r.json());

export const confirmDamageUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/rentals/${id}/confirm-damage-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchEquipmentPartialApi = (id, equipmentName, storageLocation, safetyGrade) =>
  fetch(`${BASE}/equipments/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ equipmentName, storageLocation, safetyGrade }) }).then(r => r.json());

export const deleteReturnLogApi = (id) =>
  fetch(`${BASE}/return-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
