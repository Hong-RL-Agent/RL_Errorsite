export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:9723';

async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error((json && json.error && json.error.message) || '요청을 처리하지 못했습니다.');
    err.status = res.status;
    err.code = json && json.error && json.error.code;
    throw err;
  }
  return json;
}

const qs = (o) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, v); });
  const s = p.toString();
  return s ? `?${s}` : '';
};

export const api = {
  health: () => request('/health'),
  depots: (params = {}) => request(`/depots${qs(params)}`),
  fleet: (params, signal) => request(`/fleet${qs(params)}`, { signal }),
  vehicle: (id) => request(`/fleet/${id}`),
  availability: (id) => request(`/fleet/${id}/availability`),
  fleetStatus: () => request('/fleet-status'),
  protectionPlans: () => request('/protection-plans'),
  addons: () => request('/addons'),
  rates: (params = {}) => request(`/rates${qs(params)}`),
  quote: (body, signal) => request('/quotes/calculate', { method: 'POST', body, signal }),
  driver: (id) => request(`/drivers/${id}`),
  trips: (params = {}) => request(`/itineraries${qs(params)}`),
  trip: (id) => request(`/itineraries/${id}`),
  createTrip: (body) => request('/itineraries', { method: 'POST', body }),
  updateTrip: (id, body) => request(`/itineraries/${id}`, { method: 'PATCH', body }),
  cancelTrip: (id, reason) => request(`/itineraries/${id}/cancel`, { method: 'POST', body: { reason } }),
  pickupTrip: (id) => request(`/itineraries/${id}/pickup`, { method: 'POST', body: {} }),
  returnTrip: (id) => request(`/itineraries/${id}/return`, { method: 'POST', body: {} }),
  clearHistory: (id) => request(`/itineraries/${id}/history`, { method: 'DELETE' }),
  history: () => request('/operations/history'),
  reset: () => request('/test/reset', { method: 'POST' }),
};

// 행동 로그 (콘솔 객체로 확인)
export function logAction(type, detail = '') {
  try {
    const list = (window.__roamActions = window.__roamActions || []);
    list.push({ at: Date.now(), type, detail });
    if (list.length > 300) list.shift();
  } catch (e) { /* ignore */ }
}

export const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`;

export function shiftDate(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export const fmtDT = (s) => (s ? `${s.slice(5, 10).replace('-', '/')} ${s.slice(11, 16)}` : '-');
export const fmtDateTimeFull = (s) => (s ? `${s.slice(0, 10)} ${s.slice(11, 16)}` : '-');

export const TRIP_LABEL = { pending: '예약대기', confirmed: '예약확정', picked_up: '픽업완료', returned: '반납완료', closed: '대여종료', cancelled: '예약취소' };
export const VEHICLE_LABEL = { available: '대여 가능', rented: '대여중', maintenance: '정비중' };
