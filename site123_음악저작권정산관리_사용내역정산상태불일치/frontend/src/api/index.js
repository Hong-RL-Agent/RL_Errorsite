const BASE = 'http://localhost:9622/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchCreators = () => fetch(`${BASE}/creators`).then(r => r.json());
export const fetchTracks = () => fetch(`${BASE}/tracks`).then(r => r.json());
export const fetchRoyaltySplits = () => fetch(`${BASE}/royalty-splits`).then(r => r.json());
export const fetchSettlements = () => fetch(`${BASE}/settlements`).then(r => r.json());
export const fetchUsageLogs = () => fetch(`${BASE}/usage-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchTracksApi = (genre, status, search) =>
  fetch(`${BASE}/tracks/search?genre=${genre}&status=${status}&search=${search}`).then(r => r.json());

export const patchTrackSplitApi = (id, royaltyRate) =>
  fetch(`${BASE}/tracks/${id}/split`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ royaltyRate }) }).then(r => r.json());

export const patchTrackStatusApi = (id, status) =>
  fetch(`${BASE}/tracks/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelSettlementApi = (id) =>
  fetch(`${BASE}/tracks/${id}/cancel-settlement`, { method: 'POST' }).then(r => r.json());

export const addUsageLogApi = (id) =>
  fetch(`${BASE}/tracks/${id}/add-usage`, { method: 'POST' }).then(r => r.json());

export const confirmSettlementUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/tracks/${id}/confirm-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchTrackPartialApi = (id, title, genre, primaryCreatorName) =>
  fetch(`${BASE}/tracks/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, genre, primaryCreatorName }) }).then(r => r.json());

export const deleteUsageLogApi = (id) =>
  fetch(`${BASE}/usage-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
