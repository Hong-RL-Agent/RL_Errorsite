const API_BASE = '/api';

export async function fetchProjects() {
  const res = await fetch(`${API_BASE}/projects`);
  if (!res.ok) throw new Error('프로젝트 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchProject(id) {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) throw new Error('프로젝트 정보를 불러오지 못했습니다.');
  return res.json();
}

export async function createProject(data) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('프로젝트 생성에 실패했습니다.');
  return res.json();
}

export async function updateProjectSettings(id, data) {
  const res = await fetch(`${API_BASE}/projects/${id}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('프로젝트 설정 저장에 실패했습니다.');
  return res.json();
}

export async function fetchMembers() {
  const res = await fetch(`${API_BASE}/members`);
  if (!res.ok) throw new Error('팀원 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function createMember(data) {
  const res = await fetch(`${API_BASE}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('팀원 등록에 실패했습니다.');
  return res.json();
}

export async function fetchTasks(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/tasks?${qs}`);
  if (!res.ok) throw new Error('업무 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchTask(id) {
  const res = await fetch(`${API_BASE}/tasks/${id}`);
  if (!res.ok) throw new Error('업무 상세 정보를 불러오지 못했습니다.');
  return res.json();
}

export async function createTask(data) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('업무 생성에 실패했습니다.');
  return res.json();
}

export async function updateTaskStatus(id, status, filterContext = {}) {
  const res = await fetch(`${API_BASE}/tasks/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, filterContext })
  });
  if (!res.ok) throw new Error('업무 상태 변경에 실패했습니다.');
  return res.json();
}

export async function updateTaskAssignee(id, data, filterContext = {}) {
  const res = await fetch(`${API_BASE}/tasks/${id}/assignee`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, filterContext })
  });
  if (!res.ok) throw new Error('담당자 변경에 실패했습니다.');
  return res.json();
}

export async function updateTask(id, data) {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('업무 상세 수정에 실패했습니다.');
  return res.json();
}

export async function addComment(taskId, data) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('댓글 등록에 실패했습니다.');
  return res.json();
}

export async function deleteComment(commentId) {
  const res = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('댓글 삭제에 실패했습니다.');
  return res.json();
}

export async function fetchActivities(projectId) {
  const res = await fetch(`${API_BASE}/projects/${projectId}/activities`);
  if (!res.ok) throw new Error('활동 로그를 불러오지 못했습니다.');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/test/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('데이터베이스 초기화에 실패했습니다.');
  return res.json();
}
