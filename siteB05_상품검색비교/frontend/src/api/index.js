export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:9719';

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

export const assetUrl = (u) => (!u ? '' : u.startsWith('http') ? u : `${API_BASE}${u}`);

// 검색 필터 상태 → 서버 쿼리스트링
export function buildProductQuery(f, { limit = 8, page = f.page, track = false } = {}) {
  const p = new URLSearchParams();
  if (f.query) p.set('query', f.query);
  if (f.category) p.set('category', f.category);
  if (f.brands && f.brands.length) p.set('brand', f.brands.join(','));
  if (f.minPrice !== null && f.minPrice !== undefined) p.set('minPrice', f.minPrice);
  if (f.maxPrice !== null && f.maxPrice !== undefined) p.set('maxPrice', f.maxPrice);
  Object.entries(f.specs || {}).forEach(([k, vals]) => { if (vals.length) p.set(`spec_${k}`, vals.join(',')); });
  p.set('sort', f.sort || 'popular');
  p.set('page', page);
  p.set('limit', limit);
  if (track) p.set('track', '1');
  return p.toString();
}

export const api = {
  health: () => request('/health'),
  categories: () => request('/categories'),
  brands: (category) => request(`/brands${category ? `?category=${category}` : ''}`),
  filters: (category) => request(`/filters${category ? `?category=${category}` : ''}`),
  suggestions: (q) => request(`/search/suggestions?q=${encodeURIComponent(q || '')}`),
  searchHistory: () => request('/search/history?limit=20'),
  recordSearch: (keyword) => request('/search/history', { method: 'POST', body: { keyword } }),

  listProducts: (qs, signal) => request(`/products?${qs}`, { signal }),
  product: (id) => request(`/products/${id}`),
  productImages: (id) => request(`/products/${id}/images`),
  productSpecs: (id) => request(`/products/${id}/specifications`),
  productReviews: (id, page = 1) => request(`/products/${id}/reviews?page=${page}&limit=4`),
  priceHistory: (id) => request(`/products/${id}/price-history`),

  listComparisons: (scope, limit = 12) => request(`/comparisons?saved=1&scope=${scope}&limit=${limit}`),
  createComparison: (body) => request('/comparisons', { method: 'POST', body }),
  comparison: (id) => request(`/comparisons/${id}`),
  updateComparison: (id, body) => request(`/comparisons/${id}`, { method: 'PATCH', body }),
  deleteComparison: (id) => request(`/comparisons/${id}`, { method: 'DELETE' }),
  addToComparison: (id, productId) => request(`/comparisons/${id}/products`, { method: 'POST', body: { productId } }),
  removeFromComparison: (id, productId) => request(`/comparisons/${id}/products/${productId}`, { method: 'DELETE' }),
  comparisonStats: (id) => request(`/comparisons/${id}/statistics`),

  recentlyViewed: () => request('/recently-viewed'),
  recordView: (productId) => request('/recently-viewed', { method: 'POST', body: { productId } }),
  activity: () => request('/activity?limit=30'),
  reset: () => request('/test/reset', { method: 'POST' }),
};

// 사용자 행동 기록 (콘솔 객체 + 서버 활동 로그)
export function logAction(type, detail = '') {
  try {
    const list = (window.__compareLabActions = window.__compareLabActions || []);
    list.push({ at: Date.now(), type, detail });
    if (list.length > 300) list.shift();
  } catch (e) { /* ignore */ }
  request('/activity', { method: 'POST', body: { type, detail } }).catch(() => {});
}

export const won = (n) => `${Number(n).toLocaleString('ko-KR')}원`;
