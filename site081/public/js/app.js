'use strict';

const state = {
  products: [], wishlist: [], activeView: 'products',
  brandFilter: 'all', catFilter: 'all', sort: '', query: '',
  currentProduct: null, activeModalTab: 'info'
};
const CURRENT_USER = 'user_alice';
const TODAY = new Date('2026-05-02');

const $ = id => document.getElementById(id);
const showToast = (msg, ms = 2600) => {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
};

function daysLeft(dateStr) {
  return Math.floor((new Date(dateStr) - TODAY) / (1000 * 60 * 60 * 24));
}
function expiryClass(days) {
  if (days < 0) return 'expiry-expired';
  if (days <= 14) return 'expiry-warn';
  return 'expiry-ok';
}
function expiryText(days) {
  if (days < 0) return `⚠️ ${Math.abs(days)}일 초과`;
  if (days === 0) return '오늘 만료!';
  return `D-${days}`;
}
function daysBadgeClass(days) {
  if (days < 0) return 'days-expired';
  if (days <= 7) return 'days-danger';
  if (days <= 30) return 'days-warn';
  return 'days-ok';
}

// ── API helpers ──
async function apiGet(url) { const r = await fetch(url); return r.json(); }
async function apiPost(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { ok: r.ok, json: await r.json() };
}

// ── View switch ──
function switchView(v) {
  state.activeView = v;
  document.querySelectorAll('.view').forEach(s => s.classList.remove('active'));
  $(`view-${v}`).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === v));
  if (v === 'expiring') loadExpiring();
  if (v === 'wishlist') loadWishlist();
  if (v === 'stats') loadStats();
}

// ── Products ──
async function loadProducts() {
  const p = new URLSearchParams();
  if (state.brandFilter !== 'all') p.set('brand', state.brandFilter);
  if (state.catFilter !== 'all') p.set('category', state.catFilter);
  if (state.query) p.set('q', state.query);
  if (state.sort) p.set('sort', state.sort);
  const data = await apiGet(`/api/products?${p}`);
  state.products = data.data || [];
  renderProducts();
}

async function loadFilters() {
  const [brands, cats] = await Promise.all([apiGet('/api/brands'), apiGet('/api/categories')]);
  const bc = $('brand-chips');
  (brands.data || []).forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'fchip'; btn.dataset.brand = b; btn.textContent = b;
    btn.addEventListener('click', () => selectBrand(b));
    bc.appendChild(btn);
  });
  const cc = $('cat-chips');
  (cats.data || []).forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'fchip'; btn.dataset.cat = c; btn.textContent = c;
    btn.addEventListener('click', () => selectCat(c));
    cc.appendChild(btn);
  });
}

function selectBrand(b) {
  state.brandFilter = b;
  document.querySelectorAll('#brand-chips .fchip').forEach(c => c.classList.toggle('active', c.dataset.brand === b));
  loadProducts();
}
function selectCat(c) {
  state.catFilter = c;
  document.querySelectorAll('#cat-chips .fchip').forEach(x => x.classList.toggle('active', x.dataset.cat === c));
  loadProducts();
}

async function loadWishlistIds() {
  const data = await apiGet(`/api/wishlist/${CURRENT_USER}`);
  state.wishlist = (data.data || []).map(p => p.id);
}

function renderProducts() {
  const grid = $('product-grid');
  $('prod-result-label').textContent = `${state.products.length}개 제품`;

  // Update bell badge — count products expiring within 14 days
  const soon = state.products.filter(p => { const d = daysLeft(p.expiryDate); return d >= 0 && d <= 14; }).length;
  $('bell-badge').textContent = soon;

  if (!state.products.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);padding:32px;text-align:center;grid-column:1/-1">제품이 없습니다.</p>';
    return;
  }

  grid.innerHTML = state.products.map(p => {
    const days = daysLeft(p.expiryDate);
    const eCls = expiryClass(days);
    const eTxt = expiryText(days);
    const isFav = state.wishlist.includes(p.id);
    // bug02: productId 없으면 "미정" 표시
    const pidDisplay = p.productId ? p.productId : '⚠️ ID없음';
    return `
      <div class="product-card" onclick="openModal(${p.id})">
        <div class="card-banner" style="background:linear-gradient(135deg,${p.color}33,${p.color}11)">${p.image}</div>
        <div class="card-body">
          <div class="card-brand">${p.brand}</div>
          <div class="card-name">${p.name}</div>
          <div class="card-pid">ID: ${pidDisplay}</div>
          <div class="card-expiry"><span class="${eCls}">${eTxt}</span><span style="color:var(--text-muted);font-size:.72rem">(${p.expiryDate})</span></div>
          <div class="card-rating">⭐ ${p.rating} <span style="color:var(--text-muted)">(${p.reviewCount})</span></div>
        </div>
        <div class="card-footer">
          <button class="btn-detail" onclick="event.stopPropagation();openModal(${p.id})">상세보기 →</button>
          <button class="btn-wish-toggle" onclick="event.stopPropagation();toggleWish(${p.id})" title="위시리스트">${isFav ? '❤️' : '🤍'}</button>
        </div>
      </div>`;
  }).join('');
}

async function toggleWish(productId) {
  const res = await apiPost('/api/wishlist/toggle', { productId });
  state.wishlist = res.json.wishlist || [];
  const action = res.json.action;
  showToast(action === 'added' ? '❤️ 위시리스트에 추가했습니다.' : '위시리스트에서 제거했습니다.');
  renderProducts();
}

// ── Expiring ──
async function loadExpiring() {
  const days = $('expiry-days-select').value;
  const data = await apiGet(`/api/expiring?days=${days}`);
  const items = data.data || [];

  // bug01: 만료된 제품이 포함되어 있으면 알림 표시
  const expired = items.filter(p => p.daysLeft < 0);
  const noticeEl = $('expiry-notice');
  if (expired.length > 0) {
    noticeEl.textContent = `⚠️ [bug01] 이미 만료된 제품 ${expired.length}개가 임박 목록에 포함되어 있습니다. (DB 날짜 필터 오류)`;
    noticeEl.classList.add('show');
  } else {
    noticeEl.classList.remove('show');
  }

  const list = $('expiring-list');
  if (!items.length) { list.innerHTML = '<p style="color:var(--text-muted);padding:24px;text-align:center">임박 제품이 없습니다.</p>'; return; }

  list.innerHTML = items.map(p => {
    const bCls = daysBadgeClass(p.daysLeft);
    const bTxt = p.daysLeft < 0 ? `${Math.abs(p.daysLeft)}일 초과 만료` : p.daysLeft === 0 ? '오늘 만료!' : `D-${p.daysLeft}`;
    return `
      <div class="expiring-card" onclick="openModal(${p.id})">
        <div class="exp-emoji">${p.image}</div>
        <div>
          <div class="exp-name">${p.name}</div>
          <div class="exp-brand">${p.brand} · ${p.category}</div>
          <div style="font-size:.72rem;color:var(--text-muted);margin-top:2px">만료일: ${p.expiryDate}</div>
        </div>
        <div class="exp-days"><span class="days-badge ${bCls}">${bTxt}</span></div>
      </div>`;
  }).join('');
}

// ── Wishlist ──
async function loadWishlist() {
  const data = await apiGet(`/api/wishlist/${CURRENT_USER}`);
  const products = data.data || [];
  state.wishlist = products.map(p => p.id);
  renderWishlist(products);
}

function renderWishlist(products) {
  const grid = $('wishlist-grid');
  if (!products.length) { grid.innerHTML = '<p style="color:var(--text-muted);padding:24px">위시리스트가 비어 있습니다. 제품 목록에서 🤍를 눌러 추가하세요.</p>'; return; }
  grid.innerHTML = products.map(p => `
    <div class="wish-card" onclick="openModal(${p.id})">
      <div class="wish-emoji">${p.image}</div>
      <div class="wish-info">
        <div class="wish-name">${p.name}</div>
        <div class="wish-brand">${p.brand}</div>
        <div class="wish-price">${p.price.toLocaleString()}원</div>
      </div>
      <button class="btn-unwish" onclick="event.stopPropagation();toggleWish(${p.id})" title="제거">✕</button>
    </div>`).join('');
}

// ── Stats ──
async function loadStats() {
  const [statsData, prodData] = await Promise.all([apiGet('/api/stats'), apiGet('/api/products')]);
  const s = statsData.data;
  const all = prodData.data || [];

  $('stats-grid').innerHTML = [
    { emoji: '💄', num: s.total, label: '총 제품' },
    { emoji: '⏰', num: s.expiringSoon, label: '30일 내 만료' },
    { emoji: '❌', num: s.expired, label: '이미 만료' },
    { emoji: '⭐', num: s.avgRating, label: '평균 평점' }
  ].map(x => `
    <div class="stat-card">
      <div class="stat-emoji">${x.emoji}</div>
      <div class="stat-num">${x.num}</div>
      <div class="stat-label">${x.label}</div>
    </div>`).join('');

  // Category bars
  const catMap = {};
  all.forEach(p => { catMap[p.category] = (catMap[p.category] || 0) + 1; });
  const maxCat = Math.max(...Object.values(catMap));
  $('cat-bars').innerHTML = Object.entries(catMap).map(([cat, cnt]) => `
    <div class="cat-bar-row">
      <span>${cat}</span>
      <div class="cat-bar-bg"><div class="cat-bar-fill" style="width:${Math.round(cnt/maxCat*100)}%"></div></div>
      <span>${cnt}</span>
    </div>`).join('');

  // Brand table
  const brandMap = {};
  all.forEach(p => { brandMap[p.brand] = (brandMap[p.brand] || 0) + 1; });
  $('brand-table').innerHTML = Object.entries(brandMap).sort((a, b) => b[1] - a[1]).map(([brand, cnt]) => `
    <div class="brand-row">
      <span class="brand-name">${brand}</span>
      <span class="brand-count">${cnt}개</span>
    </div>`).join('');
}

// ── Modal ──
async function openModal(productId) {
  const data = await apiGet(`/api/products/${productId}`);
  const p = data.data; if (!p) return;
  state.currentProduct = p;

  const days = daysLeft(p.expiryDate);
  const eCls = expiryClass(days);
  const eTxt = expiryText(days);
  const pidDisplay = p.productId || '⚠️ productId 누락 (bug02)';

  $('modal-product-hero').innerHTML = `
    <div class="modal-emoji">${p.image}</div>
    <div>
      <div class="modal-hero-brand">${p.brand}</div>
      <div class="modal-hero-name">${p.name}</div>
      <div class="modal-hero-badges">
        <span class="mbadge">${p.category}</span>
        <span class="mbadge">${p.subcategory}</span>
        <span class="mbadge ${eCls}">${eTxt}</span>
        <span class="mbadge" style="font-family:monospace;font-size:.65rem">${pidDisplay}</span>
      </div>
    </div>`;

  $('modal-info-grid').innerHTML = [
    { label: '가격', value: `${p.price.toLocaleString()}원`, cls: 'pink' },
    { label: '개봉일', value: p.openedDate },
    { label: '사용기한', value: p.expiryDate },
    { label: '남은 일수', value: eTxt },
    { label: '평점', value: `⭐ ${p.rating}` },
    { label: '리뷰 수', value: `${p.reviewCount}개` }
  ].map(i => `<div class="info-item"><div class="info-label">${i.label}</div><div class="info-value ${i.cls||''}">${i.value}</div></div>`).join('');
  $('modal-desc').textContent = p.description;

  // Reviews
  const rData = await apiGet(`/api/reviews/${productId}`);
  const reviews = rData.data || [];
  $('modal-review-list').innerHTML = reviews.length ? reviews.map(r => `
    <div class="review-card">
      <div class="review-head"><span class="review-author">${r.author}</span><span class="review-date">${r.date}</span></div>
      <div class="review-stars">${'⭐'.repeat(r.rating)}</div>
      <div class="review-content">${r.content}</div>
    </div>`).join('') : '<p style="color:var(--text-muted);font-size:.82rem">아직 리뷰가 없습니다.</p>';

  $('review-product-id').value = productId;
  $('review-author').value = ''; $('review-content').value = '';
  $('review-rating').value = '5'; $('review-msg').textContent = '';

  // Manage
  $('manage-grid').innerHTML = [
    { label: '사용법', value: p.usage },
    { label: '위시리스트', value: state.wishlist.includes(p.id) ? '❤️ 추가됨' : '🤍 미추가' },
    { label: 'Product ID', value: pidDisplay },
    { label: '브랜드', value: p.brand }
  ].map(i => `<div class="manage-item"><div class="info-label">${i.label}</div><div class="info-value">${i.value}</div></div>`).join('');
  $('manage-msg').textContent = '';

  switchModalTab('info');
  $('modal-overlay').classList.add('open');
}

function closeModal() { $('modal-overlay').classList.remove('open'); state.currentProduct = null; }

function switchModalTab(t) {
  state.activeModalTab = t;
  document.querySelectorAll('.mtab').forEach(b => b.classList.toggle('active', b.dataset.mtab === t));
  document.querySelectorAll('.mtab-pane').forEach(p => p.classList.toggle('hidden', !p.id.endsWith(t)));
}

// ── Events ──
document.addEventListener('DOMContentLoaded', async () => {
  await loadFilters();
  await loadWishlistIds();
  await loadProducts();

  // Nav
  document.querySelectorAll('.nav-item').forEach(n => {
    n.addEventListener('click', e => { e.preventDefault(); switchView(n.dataset.view); $('main-nav').classList.remove('open'); });
  });
  $('nav-toggle').addEventListener('click', () => $('main-nav').classList.toggle('open'));

  // Filters - all chips
  $('brand-chips').querySelector('[data-brand="all"]').addEventListener('click', () => selectBrand('all'));
  $('cat-chips').querySelector('[data-cat="all"]').addEventListener('click', () => selectCat('all'));

  // Search
  $('prod-search').addEventListener('input', e => { state.query = e.target.value.trim(); loadProducts(); });

  // Sort
  $('prod-sort').addEventListener('change', e => { state.sort = e.target.value; loadProducts(); });

  // Expiry days
  $('expiry-days-select').addEventListener('change', loadExpiring);

  // Refresh
  $('btn-hdr-refresh').addEventListener('click', () => { showToast('🔄 새로고침 중...'); loadProducts(); });
  $('btn-refresh-stats').addEventListener('click', () => { showToast('📊 통계 갱신 중...'); loadStats(); });

  // Bell
  $('alert-bell').addEventListener('click', () => switchView('expiring'));

  // Modal
  $('modal-close').addEventListener('click', closeModal);
  $('modal-overlay').addEventListener('click', e => { if (e.target === $('modal-overlay')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.querySelectorAll('.mtab').forEach(t => t.addEventListener('click', () => switchModalTab(t.dataset.mtab)));

  // Modal wishlist btn
  $('btn-wishlist-modal').addEventListener('click', async () => {
    if (!state.currentProduct) return;
    await toggleWish(state.currentProduct.id);
    const isFav = state.wishlist.includes(state.currentProduct.id);
    $('manage-msg').textContent = isFav ? '❤️ 위시리스트에 추가됨' : '위시리스트에서 제거됨';
    $('manage-msg').className = 'manage-msg info';
  });

  // Modal delete btn
  $('btn-delete-modal').addEventListener('click', () => {
    $('manage-msg').textContent = '🗑 선반에서 제거 처리됨 (mock)';
    $('manage-msg').className = 'manage-msg info';
    showToast('선반에서 제거했습니다.');
  });

  // Review form
  $('review-form').addEventListener('submit', async e => {
    e.preventDefault();
    const productId = $('review-product-id').value;
    const author = $('review-author').value.trim();
    const rating = $('review-rating').value;
    const content = $('review-content').value.trim();
    const msgEl = $('review-msg');
    if (!author || !content) { msgEl.textContent = '닉네임과 리뷰를 입력하세요.'; msgEl.className = 'review-msg error'; return; }
    const res = await apiPost('/api/reviews', { productId: parseInt(productId), author, rating, content });
    if (res.ok) {
      msgEl.textContent = '✅ 리뷰가 등록되었습니다!'; msgEl.className = 'review-msg success';
      $('review-author').value = ''; $('review-content').value = '';
      const rData = await apiGet(`/api/reviews/${productId}`);
      $('modal-review-list').innerHTML = (rData.data || []).map(r => `
        <div class="review-card">
          <div class="review-head"><span class="review-author">${r.author}</span><span class="review-date">${r.date}</span></div>
          <div class="review-stars">${'⭐'.repeat(r.rating)}</div>
          <div class="review-content">${r.content}</div>
        </div>`).join('');
      showToast('리뷰가 등록되었습니다!');
    } else { msgEl.textContent = '등록 실패'; msgEl.className = 'review-msg error'; }
  });

  // IDOR panel (bug03)
  $('btn-idor-lookup').addEventListener('click', async () => {
    const userId = $('idor-user-input').value.trim();
    if (!userId) return;
    const resultEl = $('idor-result');
    resultEl.textContent = '조회 중...';
    const data = await apiGet(`/api/wishlist/${userId}`);
    if (data.success) {
      const items = data.data || [];
      resultEl.textContent = `userId: ${data.userId}, 제품 ${items.length}개: ${items.map(p => p.name).join(', ')}`;
      showToast(`⚠️ ${userId}의 위시리스트 조회 성공 (bug03 IDOR)`);
    } else { resultEl.textContent = data.message || '조회 실패'; }
  });
});

window.openModal = openModal;
window.toggleWish = toggleWish;
