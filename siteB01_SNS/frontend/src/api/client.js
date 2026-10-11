export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:9715';

export async function request(path, { method = 'GET', body, params } = {}) {
  const url = new URL(API_BASE + path);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
    });
  }
  const res = await fetch(url.toString(), {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) throw new Error((data && data.error) || `요청에 실패했습니다. (${res.status})`);
  return data;
}

export const assetUrl = (path) => (!path ? '' : path.startsWith('http') ? path : API_BASE + path);
