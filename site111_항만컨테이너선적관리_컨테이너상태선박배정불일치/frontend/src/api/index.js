const BASE = 'http://localhost:9610/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchVessels = () => fetch(`${BASE}/vessels`).then(r => r.json());
export const fetchYards = () => fetch(`${BASE}/yards`).then(r => r.json());
export const fetchContainers = () => fetch(`${BASE}/containers`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchContainersApi = (zone, status, search) =>
  fetch(`${BASE}/containers/search?zone=${zone}&status=${status}&search=${search}`).then(r => r.json());

export const patchContainerYardApi = (id, zone, yardBlock) =>
  fetch(`${BASE}/containers/${id}/yard`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ zone, yardBlock }) }).then(r => r.json());

export const assignVesselApi = (id, vesselId, vesselName) =>
  fetch(`${BASE}/containers/${id}/vessel`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vesselId, vesselName }) }).then(r => r.json());

export const cancelExportApi = (id) =>
  fetch(`${BASE}/containers/${id}/cancel-export`, { method: 'POST' }).then(r => r.json());

export const completeLoadingApi = (id) =>
  fetch(`${BASE}/containers/${id}/complete-loading`, { method: 'POST' }).then(r => r.json());

export const assignVesselUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/containers/${id}/assign-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-role': role } }).then(r => r.json());

export const patchContainerPartialApi = (id, weightTon, isDangerous, destination) =>
  fetch(`${BASE}/containers/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weightTon, isDangerous, destination }) }).then(r => r.json());

export const deleteLoadingLogApi = (id) =>
  fetch(`${BASE}/loading-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
