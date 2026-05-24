'use strict';

const state = {
  markets: [], favorites: [], activeTab: 'markets',
  region: 'all', status: 'all', sort: '', query: '',
  currentMarket: null, activeModalTab: 'info'
};

const $ = id => document.getElementById(id);
const showToast = (msg, ms = 2600) => {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
};

// ── API ──
async function apiGet(url) { const r = await fetch(url); return r.json(); }
async function apiPost(url, body, extraHeaders = {}) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
    body: JSON.stringify(body)
  });
  return { ok: r.ok, status: r.status, json: await r.json() };
}

// ── Tab switch ──
function switchTab(tab) {
  state.activeTab = tab;
  document.querySelectorAll('.tab').forEach(s => s.classList.remove('active'));
  $(`tab-${tab}`).classList.add('active');
  document.querySelectorAll('.gnav-link').forEach(l => l.classList.toggle('active', l.dataset.tab === tab));
  if (tab === 'map') renderMap();
  if (tab === 'favorites') loadFavorites();
  if (tab === 'apply') loadApplyData();
}

// ── Markets ──
async function loadMarkets() {
  const p = new URLSearchParams();
  if (state.region !== 'all') p.set('region', state.region);
  if (state.status !== 'all') p.set('status', state.status);
  if (state.sort) p.set('sort', state.sort);
  if (state.query) p.set('q', state.query);
  const data = await apiGet(`/api/markets?${p}`);
  state.markets = data.data || [];
  renderMarkets();
}

async function loadRegions() {
  const data = await apiGet('/api/regions');
  const chips = $('region-chips');
  (data.data || []).forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'chip'; btn.dataset.region = r; btn.textContent = r;
    btn.addEventListener('click', () => selectRegion(r));
    chips.appendChild(btn);
  });
}

async function loadFavIds() {
  const data = await apiGet('/api/favorites');
  state.favorites = data.ids || [];
}

function selectRegion(r) {
  state.region = r;
  document.querySelectorAll('#region-chips .chip').forEach(c => c.classList.toggle('active', c.dataset.region === r));
  loadMarkets();
}

function renderMarkets() {
  const grid = $('market-grid');
  $('result-cnt').textContent = `${state.markets.length}개 마켓`;
  if (!state.markets.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);padding:32px;text-align:center;grid-column:1/-1">마켓이 없습니다.</p>';
    return;
  }
  grid.innerHTML = state.markets.map(m => {
    const isFav = state.favorites.includes(m.id);
    // bug02: 좌표 null인 경우 경고 표시
    const noCoord = (m.lat === null || m.lng === null);
    return `
      <div class="mcard" onclick="openModal(${m.id})">
        <div class="mcard-top">
          <div class="mcard-head">
            <div class="mcard-name">${m.emoji} ${m.name}</div>
            <span class="status-badge ${m.status === 'open' ? 'badge-open' : 'badge-closed'}">${m.status === 'open' ? '🟢 모집중' : '🔴 마감'}</span>
          </div>
          <div class="mcard-meta">
            <span class="mmeta">📍 ${m.district}</span>
            <span class="mmeta">💰 ${m.fee === 0 ? '무료' : m.fee.toLocaleString() + '원'}</span>
            <span class="mmeta">👥 ${m.registered}/${m.capacity}명</span>
          </div>
          <div class="mcard-date">📅 ${m.date} · ${m.time}</div>
          <div class="mcard-desc">${m.description}</div>
          ${noCoord ? '<div class="no-coord-warn">⚠️ 좌표 없음 (bug02)</div>' : ''}
          <div class="mcard-tags">${(m.tags||[]).map(t => `<span class="mtag">#${t}</span>`).join('')}</div>
        </div>
        <div class="mcard-bot">
          <div class="mcard-stats">
            <span>⭐ ${m.rating}</span>
            <span>💬 ${m.reviewCount}</span>
          </div>
          <div class="mcard-actions">
            <button class="btn-detail" onclick="event.stopPropagation();openModal(${m.id})">상세 →</button>
            <button class="btn-fav" onclick="event.stopPropagation();toggleFav(${m.id})" title="즐겨찾기">${isFav ? '⭐' : '☆'}</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// ── Favorites ──
async function toggleFav(marketId) {
  const res = await apiPost('/api/favorites/toggle', { marketId });
  state.favorites = res.json.favorites || [];
  const action = res.json.action;
  showToast(action === 'added' ? '⭐ 즐겨찾기에 추가됨' : '즐겨찾기에서 제거됨');
  renderMarkets();
}

async function loadFavorites() {
  const data = await apiGet('/api/favorites');
  state.favorites = data.ids || [];
  const favs = data.data || [];
  const grid = $('fav-grid');
  grid.innerHTML = favs.length ? favs.map(m => `
    <div class="fav-card" onclick="openModal(${m.id})">
      <div class="fav-emoji">${m.emoji}</div>
      <div class="fav-info">
        <div class="fav-name">${m.name}</div>
        <div class="fav-region">${m.region} · ${m.district}</div>
        <div class="fav-date">📅 ${m.date}</div>
      </div>
      <button class="btn-fav" onclick="event.stopPropagation();toggleFav(${m.id})">⭐</button>
    </div>`).join('') : '<p style="color:var(--text-muted);padding:24px">즐겨찾기한 마켓이 없습니다.</p>';
}

// ── Map ──
function renderMap() {
  const pinsEl = $('map-pins');
  // Pseudo-map: position pins proportionally within canvas
  const bounds = {
    latMin: 37.48, latMax: 37.56,
    lngMin: 126.90, lngMax: 127.10
  };
  pinsEl.innerHTML = '';
  state.markets.forEach(m => {
    const pin = document.createElement('button');
    pin.className = 'map-pin';
    pin.title = m.name;
    pin.textContent = m.emoji;

    if (m.lat !== null && m.lng !== null) {
      // Normal pin — compute position
      const left = ((m.lng - bounds.lngMin) / (bounds.lngMax - bounds.lngMin) * 90 + 5).toFixed(1);
      const top = (100 - (m.lat - bounds.latMin) / (bounds.latMax - bounds.latMin) * 90 - 5).toFixed(1);
      pin.style.left = `${left}%`;
      pin.style.top = `${top}%`;
      pin.classList.add('pin-ok');
    } else {
      // bug02: no coordinates — place in error zone bottom-left
      const offset = m.id * 12;
      pin.style.left = `${8 + offset % 20}%`;
      pin.style.top = `${70 + (m.id % 3) * 8}%`;
      pin.classList.add('pin-err');
    }

    pin.addEventListener('click', () => showMapInfo(m));
    pinsEl.appendChild(pin);
  });
}

function showMapInfo(m) {
  const noCoord = m.lat === null || m.lng === null;
  $('map-info').innerHTML = `
    <div class="minfo-card">
      <h3>${m.emoji} ${m.name}</h3>
      <p>📍 ${m.address}</p>
      <p>📅 ${m.date} · ${m.time}</p>
      <p>상태: <span class="${m.status === 'open' ? 'minfo-open' : 'minfo-closed'}">${m.status === 'open' ? '모집중' : '마감'}</span></p>
      <p>⭐ ${m.rating} · 💬 ${m.reviewCount}개 후기</p>
      ${noCoord ? '<p class="minfo-nocoord">⚠️ [bug02] 이 마켓은 좌표 정보가 null입니다. 지도에 정확히 표시 불가.</p>' : `<p style="font-size:.74rem;color:var(--text-muted)">좌표: ${m.lat}, ${m.lng}</p>`}
      <button class="btn-primary btn-sm" style="margin-top:10px" onclick="openModal(${m.id})">상세보기</button>
    </div>`;
}

// ── Apply ──
async function loadApplyData() {
  const mktData = await apiGet('/api/markets');
  const markets = mktData.data || [];
  const appData = await apiGet('/api/applications');
  const apps = appData.data || [];

  // Populate market selects
  const opts = markets.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
  $('apply-market-select').innerHTML = '<option value="">선택</option>' + opts;
  $('apply-market-normal').innerHTML = '<option value="">선택하세요</option>' + opts;

  // Render app list
  const list = $('app-list');
  const marketMap = Object.fromEntries(markets.map(m => [m.id, m.name]));
  list.innerHTML = apps.length ? apps.map(a => `
    <div class="app-row">
      <div class="app-info">
        <div class="app-market">${marketMap[a.marketId] || '#' + a.marketId}</div>
        <div class="app-detail">신청자: ${a.userId} · 품목: ${a.items}</div>
      </div>
      <span class="app-status ${a.status === 'approved' ? 'status-approved' : 'status-pending'}">${a.status === 'approved' ? '승인' : '검토중'}</span>
    </div>`).join('') : '<p style="color:var(--text-muted);padding:20px;text-align:center">신청 내역이 없습니다.</p>';
}

// ── Modal ──
async function openModal(marketId) {
  const data = await apiGet(`/api/markets/${marketId}`);
  const m = data.data; if (!m) return;
  state.currentMarket = m;
  const noCoord = m.lat === null || m.lng === null;

  $('modal-hero').innerHTML = `
    <div class="mhero-emoji">${m.emoji}</div>
    <div>
      <div class="mhero-name">${m.name}</div>
      <div class="mhero-badges">
        <span class="mbadge">${m.region}</span>
        <span class="status-badge ${m.status === 'open' ? 'badge-open' : 'badge-closed'}">${m.status === 'open' ? '🟢 모집중' : '🔴 마감'}</span>
        ${noCoord ? '<span class="mbadge" style="color:var(--red)">⚠️ 좌표 없음</span>' : ''}
      </div>
    </div>`;

  $('mp-info').innerHTML = `
    <div class="info-grid">
      <div class="ig-item"><div class="ig-label">날짜</div><div class="ig-val amber">${m.date}</div></div>
      <div class="ig-item"><div class="ig-label">시간</div><div class="ig-val">${m.time}</div></div>
      <div class="ig-item"><div class="ig-label">주소</div><div class="ig-val">${m.address}</div></div>
      <div class="ig-item"><div class="ig-label">참가비</div><div class="ig-val amber">${m.fee === 0 ? '무료' : m.fee.toLocaleString() + '원'}</div></div>
      <div class="ig-item"><div class="ig-label">정원</div><div class="ig-val">${m.registered}/${m.capacity}명</div></div>
      <div class="ig-item"><div class="ig-label">주최</div><div class="ig-val">${m.organizer}</div></div>
      <div class="ig-item"><div class="ig-label">좌표</div><div class="ig-val ${noCoord ? 'red' : ''}">${noCoord ? '⚠️ null (bug02)' : `${m.lat}, ${m.lng}`}</div></div>
      <div class="ig-item"><div class="ig-label">평점</div><div class="ig-val">⭐ ${m.rating}</div></div>
    </div>
    <p style="font-size:.84rem;color:var(--text-muted);line-height:1.6">${m.description}</p>`;

  // Items
  const itemData = await apiGet(`/api/items/${marketId}`);
  $('mp-items').innerHTML = `<div class="items-list">${(itemData.data || []).map(i => `<span class="item-tag">${i}</span>`).join('')}</div>`;

  // Reviews
  await reloadReviews(marketId);
  $('rev-mkt-id').value = marketId;
  $('rev-author').value = ''; $('rev-content').value = '';
  $('rev-rating').value = '5'; $('rev-msg').textContent = '';

  switchModalTab('info');
  $('modal-ov').classList.add('open');
}

async function reloadReviews(marketId) {
  const rData = await apiGet(`/api/reviews/${marketId}`);
  const reviews = rData.data || [];
  $('modal-rlist').innerHTML = reviews.length ? reviews.map(r => `
    <div class="rcard">
      <div class="rcard-head"><span class="rauthor">${r.author}</span><span class="rdate">${r.date}</span></div>
      <div class="rstars">${'⭐'.repeat(r.rating)}</div>
      <div class="rcontent">${r.content}</div>
    </div>`).join('') : '<p style="color:var(--text-muted);font-size:.82rem">아직 후기가 없습니다.</p>';
}

function closeModal() { $('modal-ov').classList.remove('open'); state.currentMarket = null; }

function switchModalTab(t) {
  state.activeModalTab = t;
  document.querySelectorAll('.mtab').forEach(b => b.classList.toggle('active', b.dataset.mt === t));
  document.querySelectorAll('.mpane').forEach(p => p.classList.toggle('hidden', !p.id.endsWith(t)));
}

// ── Events ──
document.addEventListener('DOMContentLoaded', async () => {
  await loadRegions();
  await loadFavIds();
  await loadMarkets();

  // Nav
  document.querySelectorAll('.gnav-link').forEach(l => {
    l.addEventListener('click', e => { e.preventDefault(); switchTab(l.dataset.tab); $('gnav').classList.remove('open'); });
  });
  $('nav-burger').addEventListener('click', () => $('gnav').classList.toggle('open'));

  // Region all chip
  $('region-chips').querySelector('[data-region="all"]').addEventListener('click', () => selectRegion('all'));

  // Filters
  $('sel-status').addEventListener('change', e => { state.status = e.target.value; loadMarkets(); });
  $('sel-sort').addEventListener('change', e => { state.sort = e.target.value; loadMarkets(); });

  // Search
  $('btn-mkt-search').addEventListener('click', () => { state.query = $('mkt-search').value.trim(); loadMarkets(); });
  $('mkt-search').addEventListener('keydown', e => { if (e.key === 'Enter') { state.query = $('mkt-search').value.trim(); loadMarkets(); } });

  // Refresh
  $('btn-hdr-refresh').addEventListener('click', () => { showToast('🔄 새로고침 중...'); loadMarkets(); });

  // Modal
  $('modal-x').addEventListener('click', closeModal);
  $('modal-ov').addEventListener('click', e => { if (e.target === $('modal-ov')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.querySelectorAll('.mtab').forEach(t => t.addEventListener('click', () => switchModalTab(t.dataset.mt)));

  // Review form
  $('review-form').addEventListener('submit', async e => {
    e.preventDefault();
    const marketId = $('rev-mkt-id').value;
    const author = $('rev-author').value.trim();
    const content = $('rev-content').value.trim();
    const msgEl = $('rev-msg');
    if (!author || !content) { msgEl.textContent = '닉네임과 후기를 입력하세요.'; msgEl.className = 'rev-msg error'; return; }
    const res = await apiPost('/api/reviews', { marketId: parseInt(marketId), author, rating: $('rev-rating').value, content });
    if (res.ok) {
      msgEl.textContent = '✅ 후기가 등록되었습니다!'; msgEl.className = 'rev-msg success';
      $('rev-author').value = ''; $('rev-content').value = '';
      await reloadReviews(marketId);
      showToast('후기가 등록되었습니다.');
    } else { msgEl.textContent = '등록 실패'; msgEl.className = 'rev-msg error'; }
  });

  // Normal apply form
  $('apply-form').addEventListener('submit', async e => {
    e.preventDefault();
    const marketId = $('apply-market-normal').value;
    const items = $('apply-items-normal').value.trim();
    const msgEl = $('aform-msg');
    if (!marketId || !items) { msgEl.textContent = '마켓과 품목을 입력하세요.'; msgEl.className = 'aform-msg error'; return; }
    const res = await apiPost('/api/applications', { marketId: parseInt(marketId), items });
    if (res.ok) {
      msgEl.textContent = '✅ 신청이 완료되었습니다!'; msgEl.className = 'aform-msg success';
      $('apply-items-normal').value = '';
      await loadApplyData();
      showToast('참가 신청이 완료되었습니다.');
    } else { msgEl.textContent = '신청 실패'; msgEl.className = 'aform-msg error'; }
  });

  // bug03 debug apply
  $('btn-apply-debug').addEventListener('click', async () => {
    const fakeUid = $('fake-uid').value.trim() || 'anonymous';
    const marketId = $('apply-market-select').value;
    const items = $('apply-items').value.trim();
    const resultEl = $('bug03-result');
    if (!marketId || !items) { resultEl.textContent = '마켓과 품목을 입력하세요.'; return; }
    // bug03: x-user-id 헤더에 임의 userId 삽입
    const res = await apiPost('/api/applications', { marketId: parseInt(marketId), items }, { 'x-user-id': fakeUid });
    if (res.ok) {
      resultEl.textContent = `✅ [bug03] 위조 성공: userId="${res.json.data.userId}" 로 신청됨 (서버가 헤더를 그대로 신뢰함)`;
      showToast(`⚠️ ${fakeUid} 으로 인증 우회 신청 성공 (bug03)`);
    } else { resultEl.textContent = JSON.stringify(res.json); }
  });
});

window.openModal = openModal;
window.toggleFav = toggleFav;
