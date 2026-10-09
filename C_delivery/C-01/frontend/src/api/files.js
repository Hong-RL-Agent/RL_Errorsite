import { request } from './client';

export async function fetchFiles(folderId = null, search = '') {
  const params = new URLSearchParams();
  if (folderId) params.append('folderId', folderId);
  if (search) params.append('search', search);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/files${query}`, { method: 'GET' });
}

export async function fetchFileById(id) {
  return request(`/files/${id}`, { method: 'GET' });
}

export async function createFile(fileData) {
  return request('/files', {
    method: 'POST',
    body: fileData
  });
}

export async function updateFile(id, updateData) {
  return request(`/files/${id}`, {
    method: 'PATCH',
    body: updateData
  });
}

export async function deleteFile(id) {
  return request(`/files/${id}`, {
    method: 'DELETE'
  });
}

export async function moveFile(id, targetFolderId) {
  return request(`/files/${id}/move`, {
    method: 'PUT',
    body: { targetFolderId }
  });
}
