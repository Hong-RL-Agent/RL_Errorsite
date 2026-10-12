const API_BASE = '/api';

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('사용자 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('카테고리 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchEvents(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/events?${qs}`);
  if (!res.ok) throw new Error('행사 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchEvent(id) {
  const res = await fetch(`${API_BASE}/events/${id}`);
  if (!res.ok) throw new Error('행사 상세 정보를 불러오지 못했습니다.');
  return res.json();
}

export async function fetchRegistrations(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/registrations?${qs}`);
  if (!res.ok) throw new Error('신청 내역을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchRegistration(id) {
  const res = await fetch(`${API_BASE}/registrations/${id}`);
  if (!res.ok) throw new Error('참가권 정보를 불러오지 못했습니다.');
  return res.json();
}

export async function createRegistration(data) {
  const res = await fetch(`${API_BASE}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('행사 참가 신청에 실패했습니다.');
  return res.json();
}

export async function updateAttendee(id, data) {
  const res = await fetch(`${API_BASE}/registrations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('참석자 정보 수정에 실패했습니다.');
  return res.json();
}

export async function updateContact(id, attendeePhone) {
  const res = await fetch(`${API_BASE}/registrations/${id}/contact`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ attendeePhone })
  });
  if (!res.ok) throw new Error('참석자 연락처 수정에 실패했습니다.');
  return res.json();
}

export async function cancelRegistration(id) {
  const res = await fetch(`${API_BASE}/registrations/${id}/cancel`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('참가 신청 취소에 실패했습니다.');
  return res.json();
}

export async function resetDatabase() {
  const res = await fetch(`${API_BASE}/test/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('데이터베이스 초기화에 실패했습니다.');
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats`);
  if (!res.ok) throw new Error('통계 정보를 불러오지 못했습니다.');
  return res.json();
}
