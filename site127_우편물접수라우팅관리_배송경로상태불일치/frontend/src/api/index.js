const BASE = 'http://localhost:9626/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchHubs = () => fetch(`${BASE}/hubs`).then(r => r.json());
export const fetchRoutesList = () => fetch(`${BASE}/routes-list`).then(r => r.json());
export const fetchParcels = () => fetch(`${BASE}/parcels`).then(r => r.json());
export const fetchDeliveryLogs = () => fetch(`${BASE}/delivery-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchParcelsApi = (hubId, status, search) =>
  fetch(`${BASE}/parcels/search?hubId=${hubId}&status=${status}&search=${search}`).then(r => r.json());

export const patchParcelRouteApi = (id, routeId, routeName) =>
  fetch(`${BASE}/parcels/${id}/route`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ routeId, routeName }) }).then(r => r.json());

export const patchParcelStatusApi = (id, status) =>
  fetch(`${BASE}/parcels/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const returnParcelApi = (id) =>
  fetch(`${BASE}/parcels/${id}/return`, { method: 'POST' }).then(r => r.json());

export const completeDeliveryApi = (id) =>
  fetch(`${BASE}/parcels/${id}/complete-delivery`, { method: 'POST' }).then(r => r.json());

export const completeDeliveryUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/parcels/${id}/complete-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchRecipientPartialApi = (id, recipientName, recipientPhone, deliveryAddress) =>
  fetch(`${BASE}/parcels/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientName, recipientPhone, deliveryAddress }) }).then(r => r.json());

export const deleteDeliveryLogApi = (id) =>
  fetch(`${BASE}/delivery-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
