const BASE_URL = 'http://localhost:9596/api';

export const fetchAdmins = async () => {
  const res = await fetch(`${BASE_URL}/admins`);
  return res.json();
};

export const fetchProjects = async () => {
  const res = await fetch(`${BASE_URL}/projects`);
  return res.json();
};

export const fetchTeamMembers = async () => {
  const res = await fetch(`${BASE_URL}/team-members`);
  return res.json();
};

export const fetchIssues = async () => {
  const res = await fetch(`${BASE_URL}/issues`);
  return res.json();
};

export const fetchComments = async () => {
  const res = await fetch(`${BASE_URL}/comments`);
  return res.json();
};

export const fetchWorkLogs = async () => {
  const res = await fetch(`${BASE_URL}/work-logs`);
  return res.json();
};

export const searchIssuesApi = async (projectId, status, search) => {
  const res = await fetch(`${BASE_URL}/issues/search?projectId=${projectId}&status=${status}&search=${search}`);
  return res.json();
};

export const patchIssueStatusApi = async (id, status) => {
  const res = await fetch(`${BASE_URL}/issues/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const patchIssueAssigneeApi = async (id, assigneeId, assigneeName) => {
  const res = await fetch(`${BASE_URL}/issues/${id}/assignee`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assigneeId, assigneeName })
  });
  return res.json();
};

export const deleteIssueApi = async (id) => {
  const res = await fetch(`${BASE_URL}/issues/${id}`, { method: 'DELETE' });
  return res.json();
};

export const addCommentApi = async (id, authorName, content) => {
  const res = await fetch(`${BASE_URL}/issues/${id}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorName, content })
  });
  return res.json();
};

export const deleteProjectApi = async (id, role = 'ADMIN') => {
  const res = await fetch(`${BASE_URL}/projects/${id}`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchIssuePartialApi = async (id, title, dueDate, priority) => {
  const res = await fetch(`${BASE_URL}/issues/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, dueDate, priority })
  });
  return res.json();
};

export const deleteWorkLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/logs/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
