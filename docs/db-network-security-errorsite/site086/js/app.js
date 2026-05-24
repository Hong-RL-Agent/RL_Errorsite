'use strict';

const state = {
  booths: [], favorites: [], coupons: [],
  activeView: 'booths', catFilter: 'all', zone: 'all', sort: '', query: '',
  currentBooth: null
};

const $ = id => document.getElementById(id);
const showToast = (msg, ms = 2600) => {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
};

// ── API ──
async function apiGet(url) { const r = await fetch(url); return r.json(); }
async function apiPost(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { ok: r.ok, status: r.status, json: await r.json() };
}

// ── View switch ──
function switchView(v) {
  state.activeView = v;
  document.querySelectorAll('.view').forEach(s => s.classList.remove('active'));
  $(`view-${v}`).classList.add('active');
  document.querySelectorAll('.nl').forEach(l => l.classList.toggle('active', l.dataset.view === v));
  if (v === 'coupons') loadCoupons();
  if (v === 'favorites') loadFavorites();
  if (v === 'waits') loadWaitTimes();
}

// ── Booths ──
async function loadBooths() {
  const p = new URLSearchParams();
  if (state.catFilter !== 'all') p.set('category', state.catFilter);
  if (state.zone !== 'all') p.set('zone', state.zone);
  if (state.sort) p.set('sort', state.sort);
  if (state.query) p.set('q', state.query);
  const data = await apiGet(`/api/booths?${p}`);
  state.booths = data.data || [];
  renderBooths();
}

async function loadCategories() {
  const data = await apiGet('/api/categories');
  const chips = $('cat-chips');
  (data.data || []).forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'chip'; btn.dataset.cat = cat; btn.textContent = cat;
    btn.addEventListener('click', () => selectCat(cat));
    chips.appendChild(btn);
  });
}

async function loadFavIds() {
  const data = await apiGet('/api/favorites');
  state.favorites = data.ids || [];
}

function selectCat(c) {
  state.catFilter = c;
  document.querySelectorAll('#cat-chips .chip').forEach(x => x.classList.toggle('active', x.dataset.cat === c));
  loadBooths();
}

function renderBooths() {
  const grid = $('booth-grid');
  $('booth-cnt').textContent = `${state.booths.length}개 부스`;
  if (!state.booths.length) { grid.innerHTML = '<p style="color:var(--text-muted);padding:32px;text-align:center;grid-column:1/-1">부스가 없습니다.</p>'; return; }

  grid.innerHTML = state.booths.map(b => {
    const isFav = state.favorites.includes(b.id);
    const waitCls = !b.open ? 'wait-closed' : b.waitMinutes <= 10 ? 'wait-low' : b.waitMinutes <= 25 ? 'wait-med' : 'wait-high';
    return `
      <div class="booth-card" onclick="openModal(${b.id})">
        <div class="booth-top">
          <div class="booth-emoji">${b.emoji}</div>
          <div class="booth-main">
            <div class="booth-name">${b.name}</div>
            <div class="booth-zone">📍 ${b.zone} · ${b.category}</div>
            <div class="booth-status">
              <span class="open-badge ${b.open ? 'open-y' : 'open-n'}">${b.open ? '🟢 영업중' : '🔴 준비중'}</span>
              <span class="booth-wait">⏱️ ${b.open ? b.waitMinutes + '분 대기' : '-'}</span>
            </div>
          </div>
        </div>
        <div class="booth-desc">${b.description}</div>
        <div class="booth-bot">
          <span class="booth-rating">⭐ ${b.rating} <span style="color:var(--text-muted)">(${b.reviewCount})</span></span>
          <div class="booth-acts">
            <button class="btn-detail" onclick="event.stopPropagation();openModal(${b.id})">메뉴 →</button>
            <button class="btn-fav" onclick="event.stopPropagation();toggleFav(${b.id})">${isFav ? '⭐' : '☆'}</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

async function toggleFav(boothId) {
  const res = await apiPost('/api/favorites/toggle', { boothId });
  state.favorites = res.json.favorites || [];
  showToast(res.json.action === 'added' ? '⭐ 즐겨찾기에 추가됨' : '즐겨찾기에서 제거됨');
  renderBooths();
}

// ── Favorites ──
async function loadFavorites() {
  const data = await apiGet('/api/favorites');
  state.favorites = data.ids || [];
  const favs = data.data || [];
  const grid = $('fav-grid');
  grid.innerHTML = favs.length ? favs.map(b => `
    <div class="fav-card" onclick="openModal(${b.id})">
      <div class="fav-emoji">${b.emoji}</div>
      <div>
        <div class="fav-name">${b.name}</div>
        <div class="fav-zone">${b.zone}</div>
        <div class="fav-rating">⭐ ${b.rating} · ${b.reviewCount}개 후기</div>
      </div>
      <button class="btn-fav" onclick="event.stopPropagation();toggleFav(${b.id})">⭐</button>
    </div>`).join('') : '<p style="color:var(--text-muted);padding:24px">즐겨찾기한 부스가 없습니다.</p>';
}

// ── Wait Times ──
async function loadWaitTimes() {
  const data = await apiGet('/api/wait-times');
  const items = data.data || [];
  const snapshotAt = data.snapshotAt;
  const now = new Date();
  const snapshot = new Date(snapshotAt);
  const hoursAgo = Math.round((now - snapshot) / (1000 * 60 * 60));

  const noticeEl = $('stale-notice');
  noticeEl.textContent = `⚠️ [bug02] 이 데이터는 ${hoursAgo}시간 전(${snapshotAt}) 스냅샷입니다. 실시간 대기시간이 아닙니다.`;
  noticeEl.classList.add('show');

  const list = $('waits-list');
  const boothMap = Object.fromEntries(state.booths.map(b => [b.id, b]));
  list.innerHTML = items.map(w => {
    const booth = boothMap[w.boothId] || {};
    const isOpen = booth.open;
    const cls = !isOpen ? 'wait-closed' : w.waitMinutes <= 10 ? 'wait-low' : w.waitMinutes <= 25 ? 'wait-med' : 'wait-high';
    const label = !isOpen ? '준비중' : w.waitMinutes === 0 ? '즉시 입장' : `${w.waitMinutes}분 대기`;
    return `
      <div class="wait-row" onclick="openModal(${w.boothId})">
        <div class="wait-emoji">${booth.emoji || '🍽️'}</div>
        <div>
          <div class="wait-name">${booth.name || '#' + w.boothId}</div>
          <div class="wait-zone">${booth.zone || ''} · ${booth.category || ''}</div>
        </div>
        <div class="wait-mins"><span class="wait-badge ${cls}">${label}</span></div>
      </div>`;
  }).join('');
}

// ── Coupons ──
async function loadCoupons() {
  const data = await apiGet('/api/coupons');
  state.coupons = data.data || [];
  renderCoupons();
}

function renderCoupons() {
  const list = $('coupon-list');
  list.innerHTML = state.coupons.map(c => `
    <div class="coupon-card ${c.used ? 'used' : ''}">
      <div class="coupon-disc">
        <div class="coupon-disc-val">${c.discount}${c.type === 'percent' ? '%' : '원'}</div>
        <div class="coupon-disc-type">OFF</div>
      </div>
      <div class="coupon-info">
        <div class="coupon-code">${c.code}</div>
        <div class="coupon-desc">${c.description}</div>
        <div class="coupon-exp">~${c.expiresAt} / ID: #${c.id}</div>
      </div>
      ${c.used
        ? '<span class="coupon-used-badge">✅ 사용됨</span>'
        : `<button class="btn-use-coupon" onclick="useCoupon(${c.id})">사용하기</button>`}
    </div>`).join('');
}

async function useCoupon(couponId) {
  const res = await apiPost(`/api/coupons/${couponId}/use`, {});
  if (res.ok) {
    // bug01: 서버가 used=false를 그대로 반환 → 프론트에서 감지
    const returnedUsed = res.json.data?.used;
    const msg = returnedUsed === false
      ? `[bug01] 쿠폰 적용됨 (${res.json.data.code}) — 서버 응답 used=false (상태 미변경)`
      : `쿠폰 적용됨: ${res.json.data?.code}`;
    showToast('🎫 ' + msg);
    await loadCoupons(); // 재조회해도 used=false 유지 (bug01)
  } else { showToast('쿠폰 사용 실패'); }
}

// ── Modal ──
async function openModal(boothId) {
  const data = await apiGet(`/api/booths/${boothId}`);
  const b = data.data; if (!b) return;
  state.currentBooth = b;

  $('modal-booth-hero').innerHTML = `
    <div class="mhero-emoji">${b.emoji}</div>
    <div>
      <div class="mhero-name">${b.name}</div>
      <div class="mhero-badges">
        <span class="mbadge">${b.zone}</span>
        <span class="mbadge">${b.category}</span>
        <span class="open-badge ${b.open ? 'open-y' : 'open-n'}">${b.open ? '영업중' : '준비중'}</span>
        <span class="mbadge">⏱️ ${b.waitMinutes}분</span>
      </div>
    </div>`;

  // Menu
  const menuData = await apiGet(`/api/menus/${boothId}`);
  const menus = menuData.data || [];
  $('mp-menu').innerHTML = `<div class="menu-list">${menus.map(m => `
    <div class="menu-item">
      <div class="menu-left">
        <span class="menu-emoji">${m.emoji}</span>
        <span class="menu-name">${m.name}${m.popular ? '<span class="menu-popular">🔥인기</span>' : ''}</span>
      </div>
      <span class="menu-price">${m.price.toLocaleString()}원</span>
    </div>`).join('')}</div>`;

  // Reviews
  await reloadReviews(boothId);
  $('rev-booth-id').value = boothId;
  $('rev-author').value = ''; $('rev-content').value = ''; $('rev-rating').value = '5'; $('rev-msg').textContent = '';

  // Info
  $('mp-info').innerHTML = `<div class="info-grid">
    <div class="ig-item"><div class="ig-label">구역</div><div class="ig-val">${b.zone}</div></div>
    <div class="ig-item"><div class="ig-label">카테고리</div><div class="ig-val">${b.category}</div></div>
    <div class="ig-item"><div class="ig-label">운영 시간</div><div class="ig-val">${b.openAt}~${b.closeAt}</div></div>
    <div class="ig-item"><div class="ig-label">현재 대기</div><div class="ig-val">${b.waitMinutes}분</div></div>
    <div class="ig-item"><div class="ig-label">평점</div><div class="ig-val">⭐ ${b.rating}</div></div>
    <div class="ig-item"><div class="ig-label">후기</div><div class="ig-val">${b.reviewCount}개</div></div>
  </div>`;

  switchModalTab('menu');
  $('modal-ov').classList.add('open');
}

async function reloadReviews(boothId) {
  const rData = await apiGet(`/api/reviews/${boothId}`);
  $('modal-rlist').innerHTML = (rData.data || []).length
    ? rData.data.map(r => `
      <div class="rcard">
        <div class="rcard-head"><span class="rauthor">${r.author}</span><span class="rdate">${r.date}</span></div>
        <div class="rstars">${'⭐'.repeat(r.rating)}</div>
        <div class="rcontent">${r.content}</div>
      </div>`).join('')
    : '<p style="color:var(--text-muted);font-size:.82rem">후기가 없습니다.</p>';
}

function closeModal() { $('modal-ov').classList.remove('open'); }
function switchModalTab(t) {
  document.querySelectorAll('.mtab').forEach(b => b.classList.toggle('active', b.dataset.mt === t));
  document.querySelectorAll('.mpane').forEach(p => p.classList.toggle('hidden', !p.id.endsWith(t)));
}

// ── Events ──
document.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();
  await loadFavIds();
  await loadBooths();

  document.querySelectorAll('.nl').forEach(l => {
    l.addEventListener('click', e => { e.preventDefault(); switchView(l.dataset.view); $('gnav').classList.remove('open'); });
  });
  $('burger').addEventListener('click', () => $('gnav').classList.toggle('open'));

  $('cat-chips').querySelector('[data-cat="all"]').addEventListener('click', () => selectCat('all'));
  $('zone-filter').addEventListener('change', e => { state.zone = e.target.value; loadBooths(); });
  $('booth-sort').addEventListener('change', e => { state.sort = e.target.value; loadBooths(); });
  $('btn-booth-search').addEventListener('click', () => { state.query = $('booth-search').value.trim(); loadBooths(); });
  $('booth-search').addEventListener('keydown', e => { if (e.key === 'Enter') { state.query = e.target.value.trim(); loadBooths(); } });

  $('btn-refresh').addEventListener('click', () => { showToast('🔄 새로고침 중...'); loadBooths(); });
  $('btn-refresh-waits').addEventListener('click', () => { showToast('⏱️ 대기시간 갱신 중...'); loadWaitTimes(); });

  // Modal
  $('modal-x').addEventListener('click', closeModal);
  $('modal-ov').addEventListener('click', e => { if (e.target === $('modal-ov')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  document.querySelectorAll('.mtab').forEach(t => t.addEventListener('click', () => switchModalTab(t.dataset.mt)));

  // Review form
  $('review-form').addEventListener('submit', async e => {
    e.preventDefault();
    const boothId = $('rev-booth-id').value;
    const body = { boothId: parseInt(boothId), author: $('rev-author').value.trim(), rating: $('rev-rating').value, content: $('rev-content').value.trim() };
    const msgEl = $('rev-msg');
    if (!body.author || !body.content) { msgEl.textContent = '닉네임과 후기를 입력하세요.'; msgEl.className = 'rev-msg error'; return; }
    const res = await apiPost('/api/reviews', body);
    if (res.ok) {
      msgEl.textContent = '✅ 후기가 등록되었습니다!'; msgEl.className = 'rev-msg success';
      $('rev-author').value = ''; $('rev-content').value = '';
      await reloadReviews(boothId);
      showToast('후기가 등록되었습니다.');
    } else { msgEl.textContent = '등록 실패'; msgEl.className = 'rev-msg error'; }
  });

  // bug03 IDOR coupon test
  $('btn-coupon-idor').addEventListener('click', async () => {
    const id = $('idor-coupon-id').value.trim();
    if (!id) return;
    const resultEl = $('bug03-result');
    resultEl.textContent = '처리 중...';
    const res = await apiPost(`/api/coupons/${id}/use`, {});
    if (res.ok) {
      resultEl.textContent = `✅ [bug03] 성공: couponId=${res.json.data.couponId}, code=${res.json.data.code}, userId 검증 없이 사용됨`;
      showToast(`⚠️ [bug03] 타 유저 쿠폰 #${id} 사용 성공 (소유자 검증 없음)`);
    } else { resultEl.textContent = res.json.message || '사용 실패'; }
  });
});

window.openModal = openModal;
window.toggleFav = toggleFav;
window.useCoupon = useCoupon;
