const BASE = 'http://localhost:9651/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchInstruments = () => fetch(`${BASE}/instruments`).then(r => r.json());
export const fetchCustomers = () => fetch(`${BASE}/customers`).then(r => r.json());
export const fetchRepairs = () => fetch(`${BASE}/repairs`).then(r => r.json());
export const fetchEstimates = () => fetch(`${BASE}/estimates`).then(r => r.json());
export const fetchRepairLogs = () => fetch(`${BASE}/repair-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchRepairsApi = (category, status, search) =>
  fetch(`${BASE}/repairs/search?category=${encodeURIComponent(category)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchRepairEstimatePriceApi = (id, estimatePriceWon) =>
  fetch(`${BASE}/repairs/${id}/estimate-price`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ estimatePriceWon }) }).then(r => r.json());

export const patchRepairStatusApi = (id, status) =>
  fetch(`${BASE}/repairs/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelRepairApi = (id) =>
  fetch(`${BASE}/repairs/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeRepairApi = (id) =>
  fetch(`${BASE}/repairs/${id}/complete`, { method: 'POST' }).then(r => r.json());

export const completeRepairUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/repairs/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchCustomerPartialApi = (id, customerName, phone, storageNo) =>
  fetch(`${BASE}/customers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName, phone, storageNo }) }).then(r => r.json());

export const deleteRepairLogApi = (id) =>
  fetch(`${BASE}/repair-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
