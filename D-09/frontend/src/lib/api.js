const API_BASE = '/api';

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error('보호자 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchUser(id) {
  const res = await fetch(`${API_BASE}/users/${id}`);
  if (!res.ok) throw new Error('보호자 정보를 불러오지 못했습니다.');
  return res.json();
}

export async function fetchServices() {
  const res = await fetch(`${API_BASE}/services`);
  if (!res.ok) throw new Error('서비스 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchPets(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/pets?${qs}`);
  if (!res.ok) throw new Error('반려동물 목록을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchPet(id) {
  const res = await fetch(`${API_BASE}/pets/${id}`);
  if (!res.ok) throw new Error('반려동물 상세 정보를 불러오지 못했습니다.');
  return res.json();
}

export async function createPet(data) {
  const res = await fetch(`${API_BASE}/pets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('반려동물 등록에 실패했습니다.');
  return res.json();
}

export async function updatePet(id, data) {
  const res = await fetch(`${API_BASE}/pets/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('반려동물 정보 수정에 실패했습니다.');
  return res.json();
}

export async function updatePetCareNotes(id, careNotes) {
  const res = await fetch(`${API_BASE}/pets/${id}/care-notes`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ careNotes })
  });
  if (!res.ok) throw new Error('돌봄 주의사항 저장에 실패했습니다.');
  return res.json();
}

export async function fetchReservations(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/reservations?${qs}`);
  if (!res.ok) throw new Error('예약 내역을 불러오지 못했습니다.');
  return res.json();
}

export async function fetchReservation(id) {
  const res = await fetch(`${API_BASE}/reservations/${id}`);
  if (!res.ok) throw new Error('예약 상세 영수증을 불러오지 못했습니다.');
  return res.json();
}

export async function createReservation(data) {
  const res = await fetch(`${API_BASE}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('예약 신청에 실패했습니다.');
  return res.json();
}

export async function cancelReservation(id) {
  const res = await fetch(`${API_BASE}/reservations/${id}/cancel`, {
    method: 'PATCH'
  });
  if (!res.ok) throw new Error('예약 취소에 실패했습니다.');
  return res.json();
}

export async function rescheduleReservation(id, data) {
  const res = await fetch(`${API_BASE}/reservations/${id}/reschedule`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('예약 일정 변경에 실패했습니다.');
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
