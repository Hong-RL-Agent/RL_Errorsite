'use strict';

// ── State ──
const state = {
  decks: [],
  currentDeck: null,
  currentCards: [],
  cardIndex: 0,
  sessionCorrect: 0,
  sessionWrong: 0,
  sessionAnswered: [],   // 'correct' | 'wrong' | null per card
  showingBack: false,
  activeView: 'decks',
  tagFilter: 'all',
  searchQuery: '',
  wrongNotes: [],
  progressData: {},
  // bug02 abort controller tracking
  lastCardRequestId: 0
};

// ── DOM shortcuts ──
const $ = id => document.getElementById(id);
const showToast = (msg, ms = 2500) => {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
};

// ── View switching ──
function switchView(viewName) {
  state.activeView = viewName;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const target = $(`view-${viewName}`);
  if (target) target.classList.add('active');

  document.querySelectorAll('.snav-item').forEach(n => n.classList.remove('active'));
  const navItem = $(`nav-${viewName}`);
  if (navItem) navItem.classList.add('active');

  const titles = { decks: '덱 목록', study: '학습 모드', wrong: '오답 노트', progress: '진행률', profile: '프로필' };
  $('topbar-title').textContent = titles[viewName] || '';

  if (viewName === 'wrong') loadWrongNotes();
  if (viewName === 'progress') loadProgress();
  if (viewName === 'profile') loadProfile();
  if (viewName === 'study') renderStudyDeckPicker();
}

// ── API ──
async function apiGet(url) {
  const res = await fetch(url);
  return res.json();
}
async function apiPost(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { ok: res.ok, json: await res.json() };
}
async function apiDelete(url) {
  const res = await fetch(url, { method: 'DELETE' });
  return res.json();
}

// ── Decks ──
async function loadDecks() {
  const params = new URLSearchParams();
  if (state.tagFilter !== 'all') params.set('tag', state.tagFilter);
  if (state.searchQuery) params.set('q', state.searchQuery);
  const data = await apiGet(`/api/decks?${params}`);
  state.decks = data.data || [];
  renderDeckGrid();
}

async function loadTags() {
  const data = await apiGet('/api/tags');
  const tags = data.data || [];
  const chipsEl = $('tag-chips');
  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className = 'tag-chip';
    btn.dataset.tag = tag;
    btn.textContent = tag;
    btn.addEventListener('click', () => selectTag(tag));
    chipsEl.appendChild(btn);
  });
}

function selectTag(tag) {
  state.tagFilter = tag;
  document.querySelectorAll('.tag-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.tag === tag);
  });
  loadDecks();
}

function renderDeckGrid() {
  const grid = $('deck-grid');
  $('deck-count-label').textContent = `${state.decks.length}개 덱`;

  if (!state.decks.length) {
    grid.innerHTML = '<p style="color:var(--text-muted);padding:32px;grid-column:1/-1;text-align:center">덱을 찾을 수 없습니다.</p>';
    return;
  }

  grid.innerHTML = state.decks.map(deck => {
    const prog = deck.progress || {};
    const pct = deck.cardCount > 0 ? Math.round((prog.studied || 0) / deck.cardCount * 100) : 0;
    return `
      <div class="deck-card" data-deck-id="${deck.id}" onclick="openDeckModal(${deck.id})">
        <div class="deck-card-banner" style="background:linear-gradient(135deg,${deck.color}33,${deck.color}11)">
          ${deck.emoji}
        </div>
        <div class="deck-card-body">
          <div class="deck-card-title">${deck.title}</div>
          <div class="deck-card-desc">${deck.description}</div>
          <div class="deck-card-meta">
            <span class="deck-tag">${deck.tag}</span>
            <span class="deck-card-count">카드 ${deck.cardCount}개</span>
          </div>
          <div class="deck-progress-wrap">
            <div class="deck-prog-bar-bg">
              <div class="deck-prog-bar" style="width:${pct}%;background:${deck.color}"></div>
            </div>
            <div class="deck-prog-label">학습 ${pct}% (${prog.studied || 0}/${deck.cardCount})</div>
          </div>
        </div>
        <div class="deck-card-footer">
          <button class="btn-deck-detail" onclick="event.stopPropagation();openDeckModal(${deck.id})">상세보기 →</button>
          <button class="btn-deck-study" onclick="event.stopPropagation();startStudy(${deck.id})">📖 학습</button>
        </div>
      </div>
    `;
  }).join('');
}

// ── Deck Modal ──
async function openDeckModal(deckId) {
  const data = await apiGet(`/api/decks/${deckId}`);
  const deck = data.data;
  if (!deck) return;

  // Header
  $('modal-deck-header').innerHTML = `
    <div class="modal-deck-icon">${deck.emoji}</div>
    <div>
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <div class="modal-deck-title">${deck.title}</div>
        ${deck.isPrivate ? '<span class="modal-private-badge">🔒 비공개</span>' : ''}
      </div>
      <div class="modal-deck-desc">${deck.description}</div>
    </div>
  `;

  // Cards tab
  const cardsData = await apiGet(`/api/cards/${deckId}`);
  const cards = cardsData.data || [];
  $('mtab-content-cards').innerHTML = `
    <div class="modal-card-list">
      ${cards.map(c => `
        <div class="modal-card-item">
          <div class="modal-card-front">${c.front}</div>
          <div class="modal-card-back">${c.back}</div>
        </div>
      `).join('')}
    </div>
  `;

  // Info tab
  const prog = deck.progress || {};
  $('mtab-content-info').innerHTML = `
    <div class="modal-info-grid">
      <div class="modal-info-item"><div class="modal-info-label">태그</div><div class="modal-info-value">${deck.tag}</div></div>
      <div class="modal-info-item"><div class="modal-info-label">카드 수</div><div class="modal-info-value">${deck.cardCount}개</div></div>
      <div class="modal-info-item"><div class="modal-info-label">소유자</div><div class="modal-info-value">${deck.owner}</div></div>
      <div class="modal-info-item"><div class="modal-info-label">생성일</div><div class="modal-info-value">${deck.createdAt}</div></div>
      <div class="modal-info-item"><div class="modal-info-label">학습 완료</div><div class="modal-info-value">${prog.studied || 0}개</div></div>
      <div class="modal-info-item"><div class="modal-info-label">정답률</div><div class="modal-info-value">${prog.studied > 0 ? Math.round((prog.correct || 0) / prog.studied * 100) : 0}%</div></div>
    </div>
  `;

  // Tab switch reset
  document.querySelectorAll('.mtab').forEach(t => t.classList.toggle('active', t.dataset.mtab === 'cards'));
  document.querySelectorAll('.mtab-content').forEach(c => c.classList.toggle('hidden', c.id !== 'mtab-content-cards'));

  $('btn-study-this').onclick = () => { closeModal(); startStudy(deckId); };
  $('modal-overlay').classList.add('open');
}

function closeModal() {
  $('modal-overlay').classList.remove('open');
}

// ── Study Mode ──
function renderStudyDeckPicker() {
  const list = $('study-deck-list');
  list.innerHTML = state.decks.map(d => `
    <div class="study-deck-pick" onclick="startStudy(${d.id})">
      <div class="study-deck-pick-icon">${d.emoji}</div>
      <div class="study-deck-pick-name">${d.title}</div>
      <div class="study-deck-pick-count">${d.cardCount}장</div>
    </div>
  `).join('');

  $('study-deck-selector').classList.remove('hidden');
  $('study-session').classList.add('hidden');
  $('study-done').classList.add('hidden');
}

async function startStudy(deckId) {
  switchView('study');
  const deckData = await apiGet(`/api/decks/${deckId}`);
  const cardsData = await apiGet(`/api/cards/${deckId}`);

  state.currentDeck = deckData.data;
  state.currentCards = cardsData.data || [];
  state.cardIndex = 0;
  state.sessionCorrect = 0;
  state.sessionWrong = 0;
  state.sessionAnswered = new Array(state.currentCards.length).fill(null);
  state.showingBack = false;

  $('study-deck-name').textContent = state.currentDeck.title;
  $('study-deck-selector').classList.add('hidden');
  $('study-done').classList.add('hidden');
  $('study-session').classList.remove('hidden');

  renderCurrentCard();
}

function renderCurrentCard() {
  const cards = state.currentCards;
  const idx = state.cardIndex;
  const total = cards.length;
  const card = cards[idx];

  if (!card) return;

  // Progress bar
  const pct = Math.round((idx / total) * 100);
  $('study-progress-bar').style.width = `${pct}%`;
  $('study-counter').textContent = `${idx + 1} / ${total}`;

  // Card content
  $('card-tag').textContent = state.currentDeck.tag;
  $('card-question').textContent = card.front;
  $('card-hint').textContent = card.hint ? `힌트: ${card.hint}` : '';
  $('card-answer').textContent = card.back;
  $('card-example').textContent = card.example ? `예: ${card.example}` : '';

  // Show front
  state.showingBack = false;
  $('card-front').classList.remove('hidden');
  $('card-back').classList.add('hidden');

  // Nav buttons
  $('btn-prev-card').disabled = idx === 0;
  $('btn-next-card').textContent = idx === total - 1 ? '완료 ✓' : '다음 →';

  // Session stats
  $('sess-correct').textContent = state.sessionCorrect;
  $('sess-wrong').textContent = state.sessionWrong;
  $('sess-remain').textContent = total - idx - 1;
}

// ── Wrong Notes ──
async function loadWrongNotes() {
  const data = await apiGet('/api/wrong-notes');
  state.wrongNotes = data.data || [];
  renderWrongNotes();
}

function renderWrongNotes() {
  const list = $('wrong-list');
  if (!state.wrongNotes.length) {
    list.innerHTML = '<p class="wrong-empty">오답 노트가 없습니다. 🎉</p>';
    return;
  }
  list.innerHTML = state.wrongNotes.map(w => `
    <div class="wrong-card" data-wrong-id="${w.id}">
      <div>
        <div class="wrong-front">${w.front}</div>
        <div style="font-size:0.72rem;color:var(--text-muted);margin-top:3px">덱 ID: ${w.deckId}</div>
      </div>
      <div class="wrong-back">${w.back}</div>
      <div class="wrong-meta">
        <div class="wrong-count">❌ ${w.wrongCount}회 틀림</div>
        <div class="wrong-date">${w.lastWrong}</div>
        <button class="btn-remove-wrong" onclick="removeWrongNote(${w.id})">🗑</button>
      </div>
    </div>
  `).join('');
}

async function removeWrongNote(id) {
  await apiDelete(`/api/wrong-notes/${id}`);
  showToast('오답 노트에서 제거했습니다.');
  loadWrongNotes();
}

// ── Progress ──
async function loadProgress() {
  // bug01: POST /api/progress 는 저장 안 됨 → GET으로 재조회 시 이전 값 유지
  // 사용자에게 알림 표시
  const noticeEl = $('progress-notice');
  noticeEl.textContent = '⚠️ [bug01] 진행률 저장 오류: 학습 완료 후 진행률이 갱신되지 않을 수 있습니다.';
  noticeEl.classList.add('show');

  const grid = $('progress-grid');
  const results = [];
  for (const deck of state.decks) {
    const data = await apiGet(`/api/progress/${deck.id}`);
    results.push({ deck, prog: data.data });
  }
  state.progressData = results;

  grid.innerHTML = results.map(({ deck, prog }) => {
    const pct = deck.cardCount > 0 ? Math.round((prog.studied || 0) / deck.cardCount * 100) : 0;
    const correctPct = prog.studied > 0 ? Math.round((prog.correct || 0) / prog.studied * 100) : 0;
    return `
      <div class="prog-card">
        <div class="prog-card-head">
          <div class="prog-deck-name">${deck.emoji} ${deck.title}</div>
          <div class="prog-date">${prog.lastStudied || '미학습'}</div>
        </div>
        <div class="prog-bar-bg">
          <div class="prog-bar" style="width:${pct}%;background:${deck.color}"></div>
        </div>
        <div class="prog-nums">
          <div class="prog-num"><span>${prog.studied || 0}</span><small>학습</small></div>
          <div class="prog-num"><span style="color:var(--green)">${prog.correct || 0}</span><small>정답</small></div>
          <div class="prog-num"><span style="color:var(--red)">${prog.wrong || 0}</span><small>오답</small></div>
          <div class="prog-num"><span>${correctPct}%</span><small>정답률</small></div>
        </div>
      </div>
    `;
  }).join('');
}

// ── Profile ──
async function loadProfile() {
  const wrongData = await apiGet('/api/wrong-notes');
  $('pstat-decks').textContent = state.decks.length;
  $('pstat-cards').textContent = state.decks.reduce((s, d) => s + d.cardCount, 0);
  $('pstat-correct').textContent = state.decks.reduce((s, d) => s + (d.progress?.correct || 0), 0);
  $('pstat-wrong').textContent = (wrongData.data || []).length;
}

// ── Save progress (bug01: 저장 안 됨) ──
async function saveProgress(deckId, studied, correct, wrong) {
  // bug01: POST는 성공 응답을 반환하지만 실제로는 저장되지 않음
  await apiPost('/api/progress', { deckId, studied, correct, wrong });
}

// ── Add to wrong notes ──
async function addWrongNote(card, deckId) {
  await apiPost('/api/wrong-notes', {
    cardId: card.id, deckId, front: card.front, back: card.back
  });
}

// ── Event listeners ──
document.addEventListener('DOMContentLoaded', async () => {
  // Load initial data
  await loadTags();
  await loadDecks();

  // Sidebar nav
  document.querySelectorAll('.snav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      switchView(item.dataset.view);
      $('sidebar').classList.remove('open');
    });
  });

  // Sidebar toggle (mobile)
  $('sidebar-toggle').addEventListener('click', () => {
    $('sidebar').classList.toggle('open');
  });

  // Tag chip "all"
  $('tag-chips').querySelector('[data-tag="all"]').addEventListener('click', () => selectTag('all'));

  // Deck search
  $('deck-search').addEventListener('input', e => {
    state.searchQuery = e.target.value.trim();
    loadDecks();
  });

  // Refresh
  $('btn-refresh').addEventListener('click', () => {
    showToast('🔄 새로고침 중...');
    loadDecks();
    if (state.activeView === 'wrong') loadWrongNotes();
    if (state.activeView === 'progress') loadProgress();
  });

  // Modal tabs
  document.querySelectorAll('.mtab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.mtab').forEach(t => t.classList.toggle('active', t === tab));
      document.querySelectorAll('.mtab-content').forEach(c => {
        c.classList.toggle('hidden', c.id !== `mtab-content-${tab.dataset.mtab}`);
      });
    });
  });

  // Modal close
  $('modal-close').addEventListener('click', closeModal);
  $('modal-overlay').addEventListener('click', e => {
    if (e.target === $('modal-overlay')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Study: flip card
  $('btn-flip').addEventListener('click', () => {
    state.showingBack = true;
    $('card-front').classList.add('hidden');
    $('card-back').classList.remove('hidden');
  });

  // Study: mark correct
  $('btn-correct-mark').addEventListener('click', async () => {
    if (!state.showingBack) return;
    state.sessionCorrect++;
    state.sessionAnswered[state.cardIndex] = 'correct';
    showToast('✅ 정답!');
    advanceCard();
  });

  // Study: mark wrong
  $('btn-wrong-mark').addEventListener('click', async () => {
    if (!state.showingBack) return;
    state.sessionWrong++;
    state.sessionAnswered[state.cardIndex] = 'wrong';
    const card = state.currentCards[state.cardIndex];
    await addWrongNote(card, state.currentDeck.id);
    showToast('❌ 오답 노트에 추가했습니다.');
    advanceCard();
  });

  // Study: next/prev
  $('btn-next-card').addEventListener('click', advanceCard);
  $('btn-prev-card').addEventListener('click', () => {
    if (state.cardIndex > 0) {
      state.cardIndex--;
      renderCurrentCard();
    }
  });

  // Study: back to deck selector
  $('btn-back-decks').addEventListener('click', renderStudyDeckPicker);

  // Study done: retry
  $('btn-retry').addEventListener('click', () => {
    if (state.currentDeck) startStudy(state.currentDeck.id);
  });

  // Study done: back to decks
  $('btn-done-back').addEventListener('click', () => switchView('decks'));
});

async function advanceCard() {
  const total = state.currentCards.length;
  if (state.cardIndex >= total - 1) {
    // 학습 완료
    await saveProgress(
      state.currentDeck.id,
      total,
      state.sessionCorrect,
      state.sessionWrong
    );
    $('study-session').classList.add('hidden');
    $('study-done').classList.remove('hidden');
    $('done-summary').textContent =
      `총 ${total}장 중 ✅ ${state.sessionCorrect}개 정답, ❌ ${state.sessionWrong}개 오답`;
  } else {
    state.cardIndex++;
    state.showingBack = false;
    renderCurrentCard();
  }
}

// ── Global expose ──
window.openDeckModal = openDeckModal;
window.startStudy = startStudy;
window.removeWrongNote = removeWrongNote;
