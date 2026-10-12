const API_BASE = '/api';

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('사용자 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function loginUser(username) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username })
  });
  if (!res.ok) throw new Error('로그인에 실패했습니다.');
  return res.json();
}

export async function fetchPreferences(userId) {
  const res = await fetch(`${API_BASE}/preferences?userId=${userId}`);
  if (!res.ok) throw new Error('환경설정을 불러오지 못했습니다.');
  return res.json();
}

export async function updatePreferences(userId, data) {
  const res = await fetch(`${API_BASE}/preferences`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...data })
  });
  if (!res.ok) throw new Error('환경설정 저장에 실패했습니다.');
  return res.json();
}

export async function updateProfile(userId, data) {
  const res = await fetch(`${API_BASE}/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...data })
  });
  if (!res.ok) throw new Error('프로필 저장에 실패했습니다.');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/test/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('시스템 초기화에 실패했습니다.');
  return res.json();
}

export async function fetchLogs(userId) {
  const res = await fetch(`${API_BASE}/preferences/logs?userId=${userId}`);
  if (!res.ok) throw new Error('로그를 불러오지 못했습니다.');
  return res.json();
}
