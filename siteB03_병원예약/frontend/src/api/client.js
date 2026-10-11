const BASE = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:9717`;

export async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  if (!res.ok) {
    const err = new Error(payload?.error?.message || '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.');
    err.status = res.status;
    err.code = payload?.error?.code;
    throw err;
  }
  return payload?.data;
}

export const qs = (params) => {
  const p = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') p.set(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : '';
};
