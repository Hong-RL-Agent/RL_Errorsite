'use strict';

// ── State ──
const state = {
  posts: [],
  region: 'all',
  gender: 'all',
  roomType: 'all',
  sort: 'recent',
  query: '',
  activeTab: 'board',
  currentPost: null,
  activeModalTab: 'detail'
};

const CURRENT_USER = 'user_kim';

// ── DOM helpers ──
const $ = id => document.getElementById(id);
const showToast = (msg, ms = 2800) => {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
};

// ── Tab switching ──
function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  const target = $(`tab-${tabName}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.tab === tabName));

  if (tabName === 'my') loadMyData();
  if (tabName === 'messages') loadMessages();
}

// ── API ──
async function apiGet(url) {
  const res = await fetch(url);
  return res.json();
}
async function apiPost(url, body, timeout = 6000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status, json: await res.json() };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ── Load posts ──
async function loadPosts() {
  const params = new URLSearchParams();
  if (state.region !== 'all') params.set('region', state.region);
  if (state.gender !== 'all') params.set('gender', state.gender);
  if (state.roomType !== 'all') params.set('roomType', state.roomType);
  if (state.query) params.set('q', state.query);
  params.set('sort', state.sort);

  const data = await apiGet(`/api/posts?${params}`);
  state.posts = data.data || [];
  renderPosts();
}

async function loadRegions() {
  const data = await apiGet('/api/regions');
  const chips = $('region-chips');
  (data.data || []).forEach(r => {
    const btn = document.createElement('button');
    btn.className = 'fchip'; btn.dataset.region = r; btn.textContent = r;
    btn.addEventListener('click', () => selectRegion(r));
    chips.appendChild(btn);
  });
}

function selectRegion(r) {
  state.region = r;
  document.querySelectorAll('.fchip').forEach(c => c.classList.toggle('active', c.dataset.region === r));
  loadPosts();
}

// ── Render posts ──
function renderPosts() {
  const grid = $('post-grid');
  $('result-label').textContent = `${state.posts.length}개 게시글`;

  // bug01: 모든 게시글 status가 'open'으로 오기 때문에 badge는 항상 "모집중"으로 표시됨
  const openCount = state.posts.filter(p => p.status === 'open').length;
  $('status-label').textContent = `모집중 ${openCount}건`;

  if (!state.posts.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);padding:40px;text-align:center;grid-column:1/-1">게시글이 없습니다.</p>';
    return;
  }

  grid.innerHTML = state.posts.map(post => {
    // bug01: status가 항상 'open'이므로 badge-closed 분기가 실행되지 않음
    const badgeCls = post.status === 'open' ? 'badge-open' : 'badge-closed';
    const badgeTxt = post.status === 'open' ? '🟢 모집중' : '🔴 마감';
    return `
      <div class="post-card" data-post-id="${post.id}" onclick="openPostModal(${post.id})">
        <div class="post-card-top">
          <div class="post-title">${post.title}</div>
          <span class="post-status-badge ${badgeCls}">${badgeTxt}</span>
        </div>
        <div class="post-card-body">
          <div class="post-meta-row">
            <span class="pmeta">📍 ${post.region}</span>
            <span class="pmeta">${post.gender}</span>
            <span class="pmeta">${post.roomType}</span>
            <span class="pmeta">📅 ${post.moveInDate || '협의'}</span>
          </div>
          <div class="post-rent">월 ${post.rent.toLocaleString()}원</div>
          <div class="post-desc">${post.description}</div>
          <div class="post-tags">${(post.tags || []).map(t => `<span class="post-tag">#${t}</span>`).join('')}</div>
        </div>
        <div class="post-card-footer">
          <div class="post-footer-left">
            <span>👁 ${post.views}</span>
            <span>📝 ${post.applications}명 신청</span>
            <span>${post.createdAt}</span>
          </div>
          <button class="btn-post-detail" onclick="event.stopPropagation();openPostModal(${post.id})">상세보기 →</button>
        </div>
      </div>
    `;
  }).join('');
}

// ── Modal ──
async function openPostModal(postId) {
  const data = await apiGet(`/api/posts/${postId}`);
  const post = data.data;
  if (!post) return;
  state.currentPost = post;

  // Header
  const badgeCls = post.status === 'open' ? 'badge-open' : 'badge-closed';
  const badgeTxt = post.status === 'open' ? '🟢 모집중' : '🔴 마감';
  $('modal-post-header').innerHTML = `
    <div class="modal-post-title">${post.title}</div>
    <div class="modal-post-badges">
      <span class="modal-badge">${post.region}</span>
      <span class="modal-badge">${post.gender}</span>
      <span class="modal-badge">${post.roomType}</span>
      <span class="post-status-badge ${badgeCls}" style="font-size:0.75rem;padding:3px 10px;border-radius:10px">${badgeTxt}</span>
    </div>
  `;

  // Detail tab
  $('modal-detail-grid').innerHTML = [
    { label: '월세', value: `${post.rent.toLocaleString()}원`, cls: 'rent' },
    { label: '보증금', value: `${post.deposit.toLocaleString()}원`, cls: '' },
    { label: '입주 가능일', value: post.moveInDate || '협의', cls: '' },
    { label: '거주 기간', value: post.duration, cls: '' },
    { label: '지역', value: post.district, cls: '' },
    { label: '연령', value: post.age, cls: '' }
  ].map(i => `
    <div class="detail-item">
      <div class="detail-label">${i.label}</div>
      <div class="detail-value ${i.cls}">${i.value}</div>
    </div>
  `).join('');
  $('modal-desc').textContent = post.description;
  $('modal-tags').innerHTML = (post.tags || []).map(t => `<span class="post-tag" style="font-size:0.78rem">#${t}</span>`).join('');

  // Lifestyle tab
  const ls = post.lifestyle || {};
  $('lifestyle-grid').innerHTML = [
    { icon: '🌅', label: '기상 시간', value: ls.wake },
    { icon: '🌙', label: '취침 시간', value: ls.sleep },
    { icon: '🚬', label: '흡연', value: ls.smoking ? '흡연자' : '비흡연' },
    { icon: '🐾', label: '반려동물', value: ls.pet ? '있음' : '없음' },
    { icon: '🍳', label: '요리', value: ls.cook ? '함' : '안 함' },
    { icon: '🧹', label: '청소', value: ls.clean }
  ].map(i => `
    <div class="ls-item">
      <div class="ls-icon">${i.icon}</div>
      <div><div class="ls-label">${i.label}</div><div class="ls-value">${i.value}</div></div>
    </div>
  `).join('');

  // Apply tab
  const applyNotice = $('apply-notice');
  if (post.status !== 'open') {
    applyNotice.textContent = '⚠️ [bug01] 이 게시글은 isClosed=true이나 API가 status:open으로 반환하여 신청 폼이 표시됩니다.';
    applyNotice.classList.add('show');
  } else {
    applyNotice.classList.remove('show');
  }
  $('apply-post-id').value = post.id;
  $('apply-message').value = '';
  $('apply-msg').textContent = '';

  // Reset tabs
  switchModalTab('detail');
  $('modal-overlay').classList.add('open');
}

function closeModal() {
  $('modal-overlay').classList.remove('open');
  state.currentPost = null;
}

function switchModalTab(tabName) {
  state.activeModalTab = tabName;
  document.querySelectorAll('.mtab').forEach(t => t.classList.toggle('active', t.dataset.mtab === tabName));
  document.querySelectorAll('.mtab-pane').forEach(p => p.classList.toggle('hidden', !p.id.endsWith(tabName)));
}

// ── Apply form ──
$('apply-form').addEventListener('submit', async e => {
  e.preventDefault();
  const postId = $('apply-post-id').value;
  const message = $('apply-message').value.trim();
  const msgEl = $('apply-msg');
  const btn = $('btn-apply-submit');

  if (!message) {
    msgEl.textContent = '메시지를 입력해주세요.';
    msgEl.className = 'apply-msg error';
    return;
  }

  // bug02: POST /api/applications 는 4초 지연을 가짐
  // 클라이언트는 loading 상태를 표시하나, 서버 측 타임아웃 처리가 없어 무기한 대기 가능
  msgEl.textContent = '⏳ 신청 중... (응답에 시간이 걸릴 수 있습니다)';
  msgEl.className = 'apply-msg loading';
  btn.disabled = true;

  try {
    const result = await apiPost('/api/applications', { postId: parseInt(postId), message }, 6000);
    if (result.ok) {
      msgEl.textContent = '✅ 신청이 완료되었습니다!';
      msgEl.className = 'apply-msg success';
      $('apply-message').value = '';
      showToast('신청이 완료되었습니다.');
    } else {
      msgEl.textContent = result.json.message || '신청 실패';
      msgEl.className = 'apply-msg error';
    }
  } catch (err) {
    // timeout or network error
    msgEl.textContent = '⚠️ 응답 시간이 초과되었습니다. 다시 시도해주세요.';
    msgEl.className = 'apply-msg error';
  } finally {
    btn.disabled = false;
  }
});

// ── My data ──
async function loadMyData() {
  const [myPosts, apps] = await Promise.all([apiGet('/api/my-posts'), apiGet('/api/applications')]);
  const postList = $('my-post-list');
  const posts = myPosts.data || [];
  postList.innerHTML = posts.length ? posts.map(p => `
    <div class="my-post-row">
      <div>
        <div class="my-post-title">${p.title}</div>
        <div class="my-post-meta">📍 ${p.region} · 신청 ${p.applications}명 · ${p.createdAt}</div>
      </div>
      <span class="post-status-badge ${p.isClosed ? 'badge-closed' : 'badge-open'}">${p.isClosed ? '마감' : '모집중'}</span>
    </div>
  `).join('') : '<p class="empty-hint">등록한 게시글이 없습니다.</p>';

  const appList = $('my-app-list');
  const applications = apps.data || [];
  appList.innerHTML = applications.length ? applications.map(a => `
    <div class="my-app-row">
      <div>
        <div class="app-applicant">📝 ${a.applicant} (게시글 #${a.postId})</div>
        <div class="app-msg">${a.message}</div>
      </div>
      <span class="app-status status-${a.status}">${a.status === 'pending' ? '검토중' : a.status === 'accepted' ? '수락' : '거절'}</span>
    </div>
  `).join('') : '<p class="empty-hint">받은 신청이 없습니다.</p>';
}

// ── Messages ──
async function loadMessages() {
  const data = await apiGet('/api/messages');
  const threads = data.data || [];
  const list = $('thread-list');
  list.innerHTML = threads.map(t => `
    <div class="thread-item" onclick="loadThread('${t.threadId}')">
      <div class="thread-title">${t.postTitle}</div>
      <div class="thread-preview">${t.lastMessage?.text || ''}</div>
    </div>
  `).join('') || '<p style="color:var(--text-muted);font-size:0.8rem">메시지가 없습니다.</p>';
}

async function loadThread(threadId) {
  const data = await apiGet(`/api/messages/${threadId}`);
  const thread = data.data;
  if (!thread) return;
  const main = $('msg-main');
  main.innerHTML = `
    <div class="msg-thread-title">💬 ${thread.postTitle}</div>
    <div class="msg-bubbles">
      ${thread.messages.map(m => {
        const isMine = m.sender === CURRENT_USER;
        const time = new Date(m.ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
        return `
          <div class="msg-bubble ${isMine ? 'mine' : 'theirs'}">
            <div class="bubble-sender">${m.sender}</div>
            <div class="bubble-text">${m.text}</div>
            <div class="bubble-time">${time}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ── Write form ──
$('write-form').addEventListener('submit', async e => {
  e.preventDefault();
  const body = {
    title: $('f-title').value.trim(),
    region: $('f-region').value,
    district: $('f-district').value.trim(),
    rent: $('f-rent').value,
    deposit: $('f-deposit').value,
    roomType: $('f-roomtype').value,
    gender: $('f-gender').value,
    moveInDate: $('f-movein').value,
    duration: $('f-duration').value.trim(),
    description: $('f-desc').value.trim(),
    tags: $('f-tags').value
  };
  const msgEl = $('form-msg');
  if (!body.title || !body.region || !body.rent) {
    msgEl.textContent = '제목, 지역, 월세는 필수 항목입니다.'; msgEl.className = 'form-msg error'; return;
  }
  try {
    const res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json();
    if (res.ok) {
      msgEl.textContent = '✅ 게시글이 등록되었습니다!'; msgEl.className = 'form-msg success';
      $('write-form').reset();
      showToast('게시글이 등록되었습니다.');
      await loadPosts();
    } else {
      msgEl.textContent = json.message || '등록 실패'; msgEl.className = 'form-msg error';
    }
  } catch (err) {
    msgEl.textContent = '서버 오류가 발생했습니다.'; msgEl.className = 'form-msg error';
  }
});

// ── Event listeners ──
document.addEventListener('DOMContentLoaded', async () => {
  await loadRegions();
  await loadPosts();

  // Nav tabs
  document.querySelectorAll('.nav-link').forEach(l => {
    l.addEventListener('click', e => {
      e.preventDefault();
      switchTab(l.dataset.tab);
      $('main-nav').classList.remove('open');
    });
  });

  // Mobile toggle
  $('mobile-toggle').addEventListener('click', () => $('main-nav').classList.toggle('open'));

  // Search
  $('btn-search').addEventListener('click', () => { state.query = $('search-input').value.trim(); loadPosts(); });
  $('search-input').addEventListener('keydown', e => { if (e.key === 'Enter') { state.query = $('search-input').value.trim(); loadPosts(); } });

  // Region all chip
  $('region-chips').querySelector('[data-region="all"]').addEventListener('click', () => selectRegion('all'));

  // Gender filter
  $('filter-gender').addEventListener('change', e => { state.gender = e.target.value; loadPosts(); });

  // Room type filter
  $('filter-roomtype').addEventListener('change', e => { state.roomType = e.target.value; loadPosts(); });

  // Sort
  $('sort-select').addEventListener('change', e => { state.sort = e.target.value; loadPosts(); });

  // Refresh
  $('btn-refresh-header').addEventListener('click', () => { showToast('🔄 새로고침 중...'); loadPosts(); });

  // Modal
  $('modal-close').addEventListener('click', closeModal);
  $('modal-overlay').addEventListener('click', e => { if (e.target === $('modal-overlay')) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Modal tabs
  document.querySelectorAll('.mtab').forEach(t => {
    t.addEventListener('click', () => switchModalTab(t.dataset.mtab));
  });

  // Write cancel
  $('btn-write-cancel').addEventListener('click', () => switchTab('board'));

  // IDOR debug lookup (bug03)
  $('btn-debug-lookup').addEventListener('click', async () => {
    const threadId = $('debug-thread-input').value.trim();
    if (!threadId) return;
    const debugResult = $('debug-result');
    debugResult.textContent = '조회 중...';
    try {
      const data = await apiGet(`/api/messages/${threadId}`);
      if (data.success) {
        const thread = data.data;
        debugResult.textContent = JSON.stringify({
          threadId: thread.threadId,
          participants: thread.participants,
          postTitle: thread.postTitle,
          messageCount: thread.messages.length,
          lastMsg: thread.messages[thread.messages.length - 1]?.text
        }, null, 2);
        showToast('⚠️ 다른 사용자 메시지를 조회했습니다 (bug03 IDOR)');
      } else {
        debugResult.textContent = data.message || '조회 실패';
      }
    } catch {
      debugResult.textContent = '오류 발생';
    }
  });
});

// Expose
window.openPostModal = openPostModal;
window.loadThread = loadThread;
