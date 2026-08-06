const BASE = 'http://localhost:9632/api';

export const fetchStaffs = () => fetch(`${BASE}/staffs`).then(r => r.json());
export const fetchEditors = () => fetch(`${BASE}/editors`).then(r => r.json());
export const fetchReporters = () => fetch(`${BASE}/reporters`).then(r => r.json());
export const fetchArticles = () => fetch(`${BASE}/articles`).then(r => r.json());
export const fetchReviewComments = () => fetch(`${BASE}/review-comments`).then(r => r.json());
export const fetchPublishLogs = () => fetch(`${BASE}/publish-logs`).then(r => r.json());
export const fetchActivityLogs = () => fetch(`${BASE}/activity-logs`).then(r => r.json());

export const searchArticlesApi = (category, status, search) =>
  fetch(`${BASE}/articles/search?category=${encodeURIComponent(category)}&status=${status}&search=${encodeURIComponent(search)}`).then(r => r.json());

export const patchArticleEditorApi = (id, editorName) =>
  fetch(`${BASE}/articles/${id}/editor`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ editorName }) }).then(r => r.json());

export const patchArticleStatusApi = (id, status) =>
  fetch(`${BASE}/articles/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }).then(r => r.json());

export const deleteArticleApi = (id) =>
  fetch(`${BASE}/articles/${id}`, { method: 'DELETE' }).then(r => r.json());

export const addReviewCommentApi = (id, editorName, comment) =>
  fetch(`${BASE}/articles/${id}/comment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ editorName, comment }) }).then(r => r.json());

export const publishArticleUnauthorizedApi = (id, role = 'STAFF') =>
  fetch(`${BASE}/articles/${id}/publish-unauthorized`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-staff-role': role } }).then(r => r.json());

export const patchArticlePartialApi = (id, title, category, scheduledTime) =>
  fetch(`${BASE}/articles/${id}/partial`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, category, scheduledTime }) }).then(r => r.json());

export const deletePublishLogApi = (id) =>
  fetch(`${BASE}/publish-logs/${id}`, { method: 'DELETE' }).then(r => r.json());

export const resetSandboxApi = () =>
  fetch(`${BASE}/reset`, { method: 'POST' }).then(r => r.json());
