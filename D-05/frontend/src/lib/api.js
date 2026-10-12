const BASE_URL = '/api';

export async function fetchStats() {
  const res = await fetch(`${BASE_URL}/stats`);
  if (!res.ok) throw new Error('통계 데이터를 불러오지 못했습니다.');
  return res.json();
}

export async function fetchDepartments() {
  const res = await fetch(`${BASE_URL}/departments`);
  if (!res.ok) throw new Error('부서 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchUsers(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/users?${qs}`);
  if (!res.ok) throw new Error('사용자 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchUserDetail(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`);
  if (!res.ok) throw new Error('사용자 상세 정보를 불러오지 못했습니다.');
  return res.json();
}

export async function updateUser(id, data, filterContext = {}) {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, filterContext })
  });
  if (!res.ok) throw new Error('사용자 정보 수정에 실패했습니다.');
  return res.json();
}

export async function updateUserStatus(id, status, filterContext = {}) {
  const res = await fetch(`${BASE_URL}/users/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, filterContext })
  });
  if (!res.ok) throw new Error('사용자 상태 변경에 실패했습니다.');
  return res.json();
}

export async function fetchRequests(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/requests?${qs}`);
  if (!res.ok) throw new Error('서비스 요청 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function approveRequest(id, filterContext = {}) {
  const res = await fetch(`${BASE_URL}/requests/${id}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filterContext })
  });
  if (!res.ok) throw new Error('서비스 요청 승인 처리에 실패했습니다.');
  return res.json();
}

export async function rejectRequest(id, reason = '') {
  const res = await fetch(`${BASE_URL}/requests/${id}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) throw new Error('서비스 요청 반려 처리에 실패했습니다.');
  return res.json();
}

export async function fetchLogs(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/logs?${qs}`);
  if (!res.ok) throw new Error('감사 로그를 불러오지 못했습니다.');
  return res.json();
}

export async function resetSystemData() {
  const res = await fetch(`${BASE_URL}/test/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('시스템 데이터 초기화에 실패했습니다.');
  return res.json();
}

export function getExportCsvUrl(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return `${BASE_URL}/export/csv?${qs}`;
}
