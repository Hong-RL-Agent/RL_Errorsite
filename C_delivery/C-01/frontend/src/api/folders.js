import { request } from './client';

export async function fetchFolders(parentId = null) {
  const query = parentId ? `?parentId=${parentId}` : '';
  return request(`/folders${query}`, { method: 'GET' });
}

export async function fetchAllFolders() {
  return request('/folders?parentId=all', { method: 'GET' });
}

export async function createFolder(folderData) {
  return request('/folders', {
    method: 'POST',
    body: folderData
  });
}

export async function updateFolder(id, updateData) {
  return request(`/folders/${id}`, {
    method: 'PATCH',
    body: updateData
  });
}

export async function deleteFolder(id) {
  return request(`/folders/${id}`, {
    method: 'DELETE'
  });
}
