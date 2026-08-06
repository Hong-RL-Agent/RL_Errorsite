const BASE = 'http://localhost:9631/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchBranches = () => fetch(`${BASE}/branches`).then(r => r.json());
export const fetchCustomers = () => fetch(`${BASE}/customers`).then(r => r.json());
export const fetchLockers = () => fetch(`${BASE}/lockers`).then(r => r.json());
export const fetchContracts = () => fetch(`${BASE}/contracts`).then(r => r.json());
export const fetchInOutLogs = () => fetch(`${BASE}/in-out-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchLockersApi = (branchId, status, search) =>
  fetch(`${BASE}/lockers/search?branchId=${branchId}&status=${status}&search=${search}`).then(r => r.json());

export const patchLockerPeriodApi = (id, startDate, endDate) =>
  fetch(`${BASE}/lockers/${id}/period`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ startDate, endDate }) }).then(r => r.json());

export const patchLockerStatusApi = (id, status) =>
  fetch(`${BASE}/lockers/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const terminateContractApi = (id) =>
  fetch(`${BASE}/lockers/${id}/terminate`, { method: 'POST' }).then(r => r.json());

export const processItemInApi = (id) =>
  fetch(`${BASE}/lockers/${id}/process-in`, { method: 'POST' }).then(r => r.json());

export const terminateContractUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/lockers/${id}/terminate-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchCustomerPartialApi = (id, customerName, phone, memo) =>
  fetch(`${BASE}/customers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customerName, phone, memo }) }).then(r => r.json());

export const deleteInOutLogApi = (id) =>
  fetch(`${BASE}/in-out-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
