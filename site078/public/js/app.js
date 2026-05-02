'use strict';

// ── State ──
const state = {
  trucks: [],
  favorites: [],
  region: 'all',
  openOnly: false,
  sort: '',
  query: '',
  loading: false,
  activeTruck: null,
  activeTab: 'menu'
};

const TRUCK_EMOJIS = { 1: '🌮', 2: '🍔', 3: '🍣', 4: '🍕', 5: '🍛', 6: '🥞' };

// ── DOM helpers ──
const $ = id => document.getElementById(id);
const showToast = (msg, duration = 2500) => {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
};

// ── Stars renderer ──
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  let stars = '⭐'.repeat(full);
  if (half) stars += '½';
  return stars;
}

// ── API calls ──
async function fetchTrucks() {
  const params = new URLSearchParams();
  if (state.region !== 'all') params.set('region', state.region);
  if (state.openOnly) params.set('open', 'true');
  if (state.sort) params.set('sort', state.sort);
  if (state.query) params.set('q', state.query);
  const res = await fetch(`/api/trucks?${params}`);
  const json = await res.json();
  return json.data || [];
}

async function fetchFavorites() {
  const res = await fetch('/api/favorites');
  const json = await res.json();
  return { trucks: json.data || [], ids: json.ids || [] };
}

async function fetchMenus(truckId) {
  const res = await fetch(`/api/menus/${truckId}`);
  const json = await res.json();
  return json.data || [];
}

async function fetchReviews(truckId) {
  const res = await fetch(`/api/reviews/${truckId}`);
  const json = await res.json();
  return json.data || [];
}

async function fetchAllReviews() {
  // Gather reviews for all loaded trucks
  const reviews = [];
  for (const truck of state.trucks.slice(0, 3)) {
    const truckReviews = await fetchReviews(truck.id);
    truckReviews.forEach(r => {
      reviews.push({ ...r, truckName: truck.name });
    });
  }
  return reviews;
}

async function fetchRegions() {
  const res = await fetch('/api/regions');
  const json = await res.json();
  return json.data || [];
}

async function toggleFavorite(truckId) {
  const res = await fetch('/api/favorites/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ truckId })
  });
  const json = await res.json();
  return json;
}

async function submitReview(data) {
  const res = await fetch('/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const json = await res.json();
  return { ok: res.ok, data: json };
}

// ── Render: Trucks ──
function renderTruckGrid(trucks) {
  const grid = $('truck-grid');
  if (!trucks.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:48px 0;grid-column:1/-1">검색 결과가 없습니다.</p>';
    return;
  }
  grid.innerHTML = trucks.map(truck => {
    const emoji = TRUCK_EMOJIS[truck.id] || '🚚';
    const isFav = state.favorites.includes(truck.id);
    const hasLocation = truck.lat !== undefined && truck.lng !== undefined;

    let badgeHtml;
    if (!hasLocation) {
      badgeHtml = `<span class="truck-badge badge-no-location">📍 위치없음</span>`;
    } else if (truck.isOpen) {
      badgeHtml = `<span class="truck-badge badge-open">🟢 영업중</span>`;
    } else {
      badgeHtml = `<span class="truck-badge badge-closed">⚫ 영업종료</span>`;
    }

    return `
      <div class="truck-card" data-truck-id="${truck.id}" id="truck-card-${truck.id}">
        <div class="truck-card-img">${emoji}</div>
        <div class="truck-card-body">
          <div class="truck-card-head">
            <span class="truck-name">${truck.name}</span>
            ${badgeHtml}
          </div>
          <div class="truck-category">${truck.category}</div>
          <div class="truck-region">📍 ${truck.region} · ${truck.address}</div>
          <div class="truck-rating">
            <span class="stars">${renderStars(truck.rating)}</span>
            <span>${truck.rating}</span>
            <span style="color:var(--text-muted)">(${truck.reviewCount})</span>
          </div>
          <div class="truck-tags">
            ${(truck.tags || []).map(tag => `<span class="truck-tag">#${tag}</span>`).join('')}
          </div>
        </div>
        <div class="truck-card-footer">
          <button class="btn-detail" onclick="openModal(${truck.id})">상세보기 →</button>
          <button class="btn-fav ${isFav ? 'active' : ''}" data-truck-id="${truck.id}" 
            onclick="handleFavToggle(event, ${truck.id})" title="즐겨찾기">
            ${isFav ? '⭐' : '☆'}
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Update stats
  $('result-count').textContent = `${trucks.length}개 트럭`;
  $('stat-total').textContent = trucks.length;
  const openCount = trucks.filter(t => t.isOpen).length;
  $('stat-open').textContent = openCount;
}

// ── Render: Map ──
function renderMap(trucks) {
  const canvas = $('map-markers');
  canvas.innerHTML = '';

  // Place markers at pseudo-random positions based on region
  const regionOffsets = {
    '강남': { x: 65, y: 55 },
    '홍대': { x: 28, y: 40 },
    '이태원': { x: 45, y: 65 },
    '신촌': { x: 22, y: 42 }
  };

  trucks.forEach((truck, i) => {
    const base = regionOffsets[truck.region] || { x: 50, y: 50 };
    const jitter = (truck.id * 7) % 12;
    const x = Math.min(90, Math.max(10, base.x + (i % 3 - 1) * 8 + jitter));
    const y = Math.min(85, Math.max(10, base.y + (i % 2) * 8 - jitter / 2));
    const emoji = TRUCK_EMOJIS[truck.id] || '🚚';

    const hasLocation = truck.lat !== undefined && truck.lng !== undefined;
    let cls = hasLocation ? (truck.isOpen ? 'open' : 'closed') : 'no-location';

    const marker = document.createElement('div');
    marker.className = `map-marker ${cls}`;
    marker.style.left = `${x}%`;
    marker.style.top = `${y}%`;
    marker.title = truck.name;
    marker.textContent = emoji;
    marker.addEventListener('click', () => showMapInfo(truck));
    canvas.appendChild(marker);
  });
}

function showMapInfo(truck) {
  const sidebar = $('map-sidebar');
  const emoji = TRUCK_EMOJIS[truck.id] || '🚚';
  const hasLocation = truck.lat !== undefined && truck.lng !== undefined;
  const statusClass = truck.isOpen ? 'info-open' : 'info-closed';
  const statusText = truck.isOpen ? '🟢 영업중' : '⚫ 영업종료';
  const locationInfo = hasLocation
    ? `<p>📍 ${truck.lat.toFixed(4)}, ${truck.lng.toFixed(4)}</p>`
    : `<p class="info-no-loc">⚠️ 위치 정보 없음 (lat/lng 누락)</p>`;

  sidebar.innerHTML = `
    <div class="map-info-card">
      <div style="font-size:2.5rem;margin-bottom:8px">${emoji}</div>
      <h3>${truck.name}</h3>
      <p>${truck.category} · ${truck.region}</p>
      <p class="${statusClass}">${statusText}</p>
      <p>⏰ ${truck.openTime} ~ ${truck.closeTime}</p>
      ${locationInfo}
      <button class="btn-detail" style="margin-top:12px;font-size:0.85rem;color:var(--orange);font-weight:700"
        onclick="openModal(${truck.id})">상세보기 →</button>
    </div>
  `;
}

// ── Render: Favorites ──
function renderFavorites(trucks) {
  const grid = $('fav-grid');
  if (!trucks.length) {
    grid.innerHTML = '<p class="fav-empty">즐겨찾기한 트럭이 없습니다. ☆ 버튼으로 추가해보세요!</p>';
    return;
  }
  grid.innerHTML = trucks.map(truck => {
    const emoji = TRUCK_EMOJIS[truck.id] || '🚚';
    const openClass = truck.isOpen ? 'open' : 'closed';
    const openText = truck.isOpen ? '🟢 영업중' : '⚫ 영업종료';
    return `
      <div class="fav-card" onclick="openModal(${truck.id})">
        <div class="fav-icon">${emoji}</div>
        <div class="fav-info">
          <div class="fav-name">${truck.name}</div>
          <div class="fav-region">📍 ${truck.region}</div>
          <div class="fav-open ${openClass}">${openText}</div>
        </div>
        <button class="btn-remove-fav" onclick="handleFavToggle(event, ${truck.id})" title="즐겨찾기 해제">✕</button>
      </div>
    `;
  }).join('');
}

// ── Render: Reviews ──
function renderReviewList(reviews, containerId) {
  const container = $(containerId);
  if (!reviews.length) {
    container.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem">아직 리뷰가 없습니다.</p>';
    return;
  }
  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-avatar">${r.avatar || r.author.charAt(0).toUpperCase()}</div>
      <div class="review-body">
        <div class="review-head">
          <span class="review-author">${r.author}</span>
          <span class="review-date">${r.date}</span>
        </div>
        <div class="review-stars">${'⭐'.repeat(r.rating)}</div>
        <div class="review-content">${r.content}</div>
        ${r.truckName ? `<div class="review-truck-name">🚚 ${r.truckName}</div>` : ''}
      </div>
    </div>
  `).join('');
}

// ── Modal ──
async function openModal(truckId) {
  const truck = state.trucks.find(t => t.id === truckId);
  if (!truck) return;
  state.activeTruck = truck;
  state.activeTab = 'menu';

  // Populate header
  $('modal-truck-icon').textContent = TRUCK_EMOJIS[truck.id] || '🚚';
  $('modal-truck-name').textContent = truck.name;
  $('review-truck-id').value = truck.id;

  const hasLocation = truck.lat !== undefined && truck.lng !== undefined;
  $('modal-meta').innerHTML = `
    <span class="modal-badge">${truck.category}</span>
    <span class="modal-badge">📍 ${truck.region}</span>
    <span class="modal-badge">${truck.isOpen ? '🟢 영업중' : '⚫ 영업종료'}</span>
    ${!hasLocation ? '<span class="modal-badge" style="color:var(--red)">⚠️ 위치없음</span>' : ''}
    <span class="modal-badge">⭐ ${truck.rating}</span>
  `;

  // Switch to menu tab
  switchTab('menu');

  // Load menus
  $('modal-menu-list').innerHTML = '<div class="loading-skeleton" style="height:80px"></div>';
  const menus = await fetchMenus(truck.id);
  $('modal-menu-list').innerHTML = menus.map(m => `
    <div class="menu-item">
      <div class="menu-item-info">
        <div class="menu-item-name ${m.popular ? 'popular' : ''}">${m.name}</div>
        <div class="menu-item-desc">${m.description}</div>
      </div>
      <div class="menu-item-price">${m.price.toLocaleString()}원</div>
    </div>
  `).join('');

  // Populate info tab
  const openStatus = truck.isOpen ? 'open-status' : 'closed-status';
  const openText = truck.isOpen ? '🟢 영업중' : '⚫ 영업종료';
  const locationVal = hasLocation
    ? `${truck.lat.toFixed(4)}, ${truck.lng.toFixed(4)}`
    : '위치 정보 없음 ⚠️';

  $('modal-info-grid').innerHTML = `
    <div class="info-item"><div class="info-label">상태</div><div class="info-value ${openStatus}">${openText}</div></div>
    <div class="info-item"><div class="info-label">영업시간</div><div class="info-value">${truck.openTime} ~ ${truck.closeTime}</div></div>
    <div class="info-item"><div class="info-label">주소</div><div class="info-value" style="font-size:0.85rem">${truck.address}</div></div>
    <div class="info-item"><div class="info-label">전화</div><div class="info-value">${truck.phone}</div></div>
    <div class="info-item"><div class="info-label">위치</div><div class="info-value" style="font-size:0.82rem">${locationVal}</div></div>
    <div class="info-item"><div class="info-label">카테고리</div><div class="info-value">${truck.category}</div></div>
  `;

  // Load reviews for this truck
  const reviews = await fetchReviews(truck.id);
  renderReviewList(reviews, 'modal-review-list');

  // Clear review form
  $('review-author').value = '';
  $('review-content').value = '';
  $('review-rating').value = '5';
  $('review-msg').textContent = '';
  $('review-msg').className = 'review-msg';

  $('modal-overlay').classList.add('open');
}

function closeModal() {
  $('modal-overlay').classList.remove('open');
  state.activeTruck = null;
}

function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
  document.querySelectorAll('.tab-content').forEach(c => {
    c.classList.toggle('hidden', !c.id.endsWith(tabName));
  });
}

// ── Favorites toggle ──
async function handleFavToggle(event, truckId) {
  event.stopPropagation();
  const result = await toggleFavorite(truckId);
  state.favorites = result.favorites || [];
  const action = result.action;
  showToast(action === 'added' ? '⭐ 즐겨찾기에 추가했습니다.' : '즐겨찾기에서 제거했습니다.');
  await refreshAll();
}

// ── Region chips ──
async function renderRegionChips() {
  const regions = await fetchRegions();
  const chipsEl = $('region-chips');
  const all = chipsEl.querySelector('[data-region="all"]');
  regions.forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.dataset.region = r;
    btn.textContent = r;
    btn.addEventListener('click', () => selectRegion(r));
    chipsEl.appendChild(btn);
  });
  $('stat-regions').textContent = regions.length;
}

function selectRegion(region) {
  state.region = region;
  document.querySelectorAll('#region-chips .chip').forEach(c => {
    c.classList.toggle('active', c.dataset.region === region);
  });
  refreshAll();
}

// ── Main refresh ──
async function refreshAll() {
  state.loading = true;
  $('result-count').textContent = '로딩 중...';

  try {
    const [trucks, favData] = await Promise.all([fetchTrucks(), fetchFavorites()]);
    state.trucks = trucks;
    state.favorites = favData.ids;

    renderTruckGrid(trucks);
    renderMap(trucks);
    renderFavorites(favData.trucks);

    // Refresh global reviews
    const allRevs = await fetchAllReviews();
    renderReviewList(allRevs, 'global-review-list');
  } catch (err) {
    console.error('Data fetch error:', err);
    showToast('데이터를 불러오는 중 오류가 발생했습니다.');
  } finally {
    state.loading = false;
  }
}

// ── Event listeners ──
document.addEventListener('DOMContentLoaded', async () => {
  // Initial load
  await renderRegionChips();
  await refreshAll();

  // Search
  $('btn-search').addEventListener('click', () => {
    state.query = $('search-input').value.trim();
    refreshAll();
  });
  $('search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      state.query = $('search-input').value.trim();
      refreshAll();
    }
  });

  // Open-only filter
  $('btn-open-filter').addEventListener('click', () => {
    state.openOnly = !state.openOnly;
    const btn = $('btn-open-filter');
    btn.classList.toggle('active', state.openOnly);
    btn.dataset.active = state.openOnly;
    refreshAll();
  });

  // Sort
  $('sort-select').addEventListener('change', e => {
    state.sort = e.target.value;
    refreshAll();
  });

  // Region chip - all
  $('region-chips').querySelector('[data-region="all"]').addEventListener('click', () => selectRegion('all'));

  // Global refresh
  $('btn-global-refresh').addEventListener('click', () => {
    showToast('🔄 데이터를 새로고침합니다...');
    refreshAll();
  });

  // Modal tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Modal close
  $('modal-close').addEventListener('click', closeModal);
  $('modal-overlay').addEventListener('click', e => {
    if (e.target === $('modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Mobile nav
  $('mobile-menu-toggle').addEventListener('click', () => {
    $('main-nav').classList.toggle('open');
  });

  // Review form submit
  $('review-form').addEventListener('submit', async e => {
    e.preventDefault();
    const truckId = parseInt($('review-truck-id').value);
    const author = $('review-author').value.trim();
    const rating = parseInt($('review-rating').value);
    const content = $('review-content').value.trim();
    const msgEl = $('review-msg');

    if (!author || !content) {
      msgEl.textContent = '닉네임과 리뷰 내용을 입력해주세요.';
      msgEl.className = 'review-msg error';
      return;
    }

    const result = await submitReview({ truckId, author, rating, content });
    if (result.ok) {
      msgEl.textContent = '✅ 리뷰가 등록되었습니다!';
      msgEl.className = 'review-msg success';
      $('review-author').value = '';
      $('review-content').value = '';
      $('review-rating').value = '5';
      // Reload reviews
      const reviews = await fetchReviews(truckId);
      renderReviewList(reviews, 'modal-review-list');
      showToast('리뷰가 등록되었습니다!');
    } else {
      msgEl.textContent = result.data.message || '리뷰 등록에 실패했습니다.';
      msgEl.className = 'review-msg error';
    }
  });

  // Smooth nav
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      $('main-nav').classList.remove('open');
    });
  });
});

// Expose to inline onclick handlers
window.openModal = openModal;
window.handleFavToggle = handleFavToggle;
