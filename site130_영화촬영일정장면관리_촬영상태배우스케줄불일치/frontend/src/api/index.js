const BASE = 'http://localhost:9629/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchActors = () => fetch(`${BASE}/actors`).then(r => r.json());
export const fetchLocations = () => fetch(`${BASE}/locations`).then(r => r.json());
export const fetchScenes = () => fetch(`${BASE}/scenes`).then(r => r.json());
export const fetchSchedules = () => fetch(`${BASE}/schedules`).then(r => r.json());
export const fetchFilmingLogs = () => fetch(`${BASE}/filming-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchScenesApi = (actorName, status, search) =>
  fetch(`${BASE}/scenes/search?actorName=${actorName}&status=${status}&search=${search}`).then(r => r.json());

export const patchSceneActorScheduleApi = (id, actorName, actorSchedule) =>
  fetch(`${BASE}/scenes/${id}/actor-schedule`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actorName, actorSchedule }) }).then(r => r.json());

export const patchSceneStatusApi = (id, status) =>
  fetch(`${BASE}/scenes/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const cancelSceneApi = (id) =>
  fetch(`${BASE}/scenes/${id}/cancel`, { method: 'POST' }).then(r => r.json());

export const completeFilmingLogApi = (id) =>
  fetch(`${BASE}/scenes/${id}/complete-log`, { method: 'POST' }).then(r => r.json());

export const completeSceneUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/scenes/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchScenePartialApi = (id, sceneName, location, shootDate) =>
  fetch(`${BASE}/scenes/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sceneName, location, shootDate }) }).then(r => r.json());

export const deleteFilmingLogApi = (id) =>
  fetch(`${BASE}/filming-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
