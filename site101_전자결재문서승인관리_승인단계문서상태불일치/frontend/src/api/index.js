const BASE_URL = 'http://localhost:9600/api';

export const fetchDepartments = async () => {
  const res = await fetch(`${BASE_URL}/departments`);
  return res.json();
};

export const fetchEmployees = async () => {
  const res = await fetch(`${BASE_URL}/employees`);
  return res.json();
};

export const fetchDocuments = async () => {
  const res = await fetch(`${BASE_URL}/documents`);
  return res.json();
};

export const fetchApprovalLines = async () => {
  const res = await fetch(`${BASE_URL}/approval-lines`);
  return res.json();
};

export const fetchComments = async () => {
  const res = await fetch(`${BASE_URL}/comments`);
  return res.json();
};

export const fetchActivityLogs = async () => {
  const res = await fetch(`${BASE_URL}/activity-logs`);
  return res.json();
};

export const searchDocumentsApi = async (deptName, status, search) => {
  const res = await fetch(`${BASE_URL}/documents/search?deptName=${deptName}&status=${status}&search=${search}`);
  return res.json();
};

export const patchApprovalLineApi = async (id, approverName) => {
  const res = await fetch(`${BASE_URL}/documents/${id}/line`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approverName })
  });
  return res.json();
};

export const patchDocumentStatusApi = async (id, status) => {
  const res = await fetch(`${BASE_URL}/documents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  return res.json();
};

export const rejectDocumentApi = async (id) => {
  const res = await fetch(`${BASE_URL}/documents/${id}/reject`, { method: 'POST' });
  return res.json();
};

export const submitApprovalCommentApi = async (id, authorName, opinion) => {
  const res = await fetch(`${BASE_URL}/documents/${id}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authorName, opinion })
  });
  return res.json();
};

export const approveDocumentUnauthorizedApi = async (id, role = 'DRAFTER') => {
  const res = await fetch(`${BASE_URL}/documents/${id}/approve-unauthorized`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-user-role': role
    }
  });
  return res.json();
};

export const patchDocPartialApi = async (id, title, urgency, attachment) => {
  const res = await fetch(`${BASE_URL}/documents/${id}/partial`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, urgency, attachment })
  });
  return res.json();
};

export const deleteActivityLogApi = async (id) => {
  const res = await fetch(`${BASE_URL}/activity-logs/${id}`, { method: 'DELETE' });
  return res.json();
};

export const resetSandboxApi = async () => {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  return res.json();
};
