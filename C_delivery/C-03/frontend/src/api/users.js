import { request } from './client';

export async function fetchUsers(filters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.role && filters.role !== 'ALL') params.append('role', filters.role);
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.sort) params.append('sort', filters.sort);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/users${query}`, { method: 'GET' });
}

export async function fetchUserById(id) {
  return request(`/users/${id}`, { method: 'GET' });
}

export async function updateUser(id, updateData) {
  return request(`/users/${id}`, {
    method: 'PATCH',
    body: updateData
  });
}

export async function updateUserRole(id, role) {
  return request(`/users/${id}/role`, {
    method: 'PATCH',
    body: { role }
  });
}

export async function updateUserStatus(id, isActive) {
  return request(`/users/${id}/status`, {
    method: 'PATCH',
    body: { isActive }
  });
}

export async function sendPasswordResetLink(id) {
  return request(`/users/${id}/password-reset`, {
    method: 'POST'
  });
}

export async function fetchAuditLogs() {
  return request('/users/audit-logs', { method: 'GET' });
}
