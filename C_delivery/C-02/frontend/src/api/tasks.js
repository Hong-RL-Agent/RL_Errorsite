import { request } from './client';

export async function fetchTasks(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
  if (filters.assignee_id && filters.assignee_id !== 'ALL') params.append('assignee_id', filters.assignee_id);
  if (filters.search) params.append('search', filters.search);
  if (filters.sort) params.append('sort', filters.sort);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/tasks${query}`, { method: 'GET' });
}

export async function fetchAssignees() {
  return request('/tasks/assignees', { method: 'GET' });
}

export async function fetchTaskById(id) {
  return request(`/tasks/${id}`, { method: 'GET' });
}

export async function createTask(taskData) {
  return request('/tasks', {
    method: 'POST',
    body: taskData
  });
}

export async function updateTask(id, updateData) {
  return request(`/tasks/${id}`, {
    method: 'PATCH',
    body: updateData
  });
}

export async function updateTaskStatus(id, status, fromCheckbox = false) {
  return request(`/tasks/${id}/status`, {
    method: 'PUT',
    body: { status, fromCheckbox }
  });
}

export async function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE'
  });
}
