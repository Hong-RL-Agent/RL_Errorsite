'use strict';

const state = {
  records: [], goals: {}, stats: null, activeView: 'records',
  filterFrom: '', filterTo: '', filterQ: ''
};

const $ = id => document.getElementById(id);
const showToast = (msg, ms = 2600) => {
  const t = $('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), ms);
};

// ── Live clock ──
function updateClock() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const el = $('hero-clock');
  if (el) el.textContent = `${hh}:${mm}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── API ──
async function apiGet(url) { const r = await fetch(url); return r.json(); }
async function apiPost(url, body) {
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { ok: r.ok, json: await r.json() };
}
async function apiPut(url, body) {
  const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { ok: r.ok, json: await r.json() };
}

// ── View switch ──
function switchView(v) {
  state.activeView = v;
  document.querySelectorAll('.view').forEach(s => s.classList.remove('active'));
  $(`view-${v}`).classList.add('active');
  document.querySelectorAll('.nl').forEach(l => l.classList.toggle('active', l.dataset.view === v));
  if (v === 'routines') loadRoutines();
  if (v === 'stats') loadStats();
  if (v === 'goals') loadGoals();
  if (v === 'history') loadHistory();
}

// ── Records ──
async function loadRecords() {
  const p = new URLSearchParams();
  if (state.filterFrom) p.set('from', state.filterFrom);
  if (state.filterTo) p.set('to', state.filterTo);
  if (state.filterQ) p.set('q', state.filterQ);
  const data = await apiGet(`/api/sleep-records?${p}`);
  state.records = data.data || [];
  renderRecords();
  checkGoalAlert();
}

function durClass(h) { if (h < 0) return 'dur-neg'; if (h < 6) return 'dur-warn'; return 'dur-ok'; }
function durText(h) {
  if (h < 0) return `⚠️ ${h}h (bug01: 음수값)`;
  return `${h}h`;
}

function renderRecords() {
  const list = $('record-list');
  $('rcnt').textContent = `${state.records.length}개 기록`;
  if (!state.records.length) {
    list.innerHTML = '<p style="color:var(--text-muted);padding:24px;text-align:center">기록이 없습니다.</p>';
    return;
  }
  list.innerHTML = state.records.map(r => `
    <div class="rec-card" onclick="openRecordModal(${r.id})">
      <div class="rec-head">
        <span class="rec-date">${r.date}</span>
        <span class="rec-mood">${r.mood}</span>
      </div>
      <div class="rec-times">
        <span>🌙 취침 <span class="rec-time-val">${r.bedtime}</span></span>
        <span>☀️ 기상 <span class="rec-time-val">${r.wakeTime}</span></span>
      </div>
      <div class="rec-duration ${durClass(r.duration)}">${durText(r.duration)}</div>
      <div class="rec-quality"><span class="stars">${'⭐'.repeat(r.quality)}</span><span style="color:var(--text-muted)">(${r.quality}/5)</span></div>
      ${r.notes ? `<div class="rec-notes">"${r.notes}"</div>` : ''}
      <div class="rec-tags">${(r.tags || []).map(t => `<span class="rtag">#${t}</span>`).join('')}</div>
    </div>`).join('');
}

function openRecordModal(id) {
  const r = state.records.find(x => x.id === id);
  if (!r) return;
  $('modal-content').innerHTML = `
    <div class="mc-date">${r.mood} ${r.date} 수면 기록</div>
    <div class="mc-grid">
      <div class="mc-item"><div class="mc-label">취침</div><div class="mc-val">🌙 ${r.bedtime}</div></div>
      <div class="mc-item"><div class="mc-label">기상</div><div class="mc-val">☀️ ${r.wakeTime}</div></div>
      <div class="mc-item"><div class="mc-label">수면 시간 (API)</div><div class="mc-val ${r.duration < 0 ? 'mc-dur-neg' : 'mc-dur-ok'}">${r.duration}h ${r.duration < 0 ? '← bug01: 음수' : ''}</div></div>
      <div class="mc-item"><div class="mc-label">수면 품질</div><div class="mc-val">${'⭐'.repeat(r.quality)} ${r.quality}/5</div></div>
      <div class="mc-item"><div class="mc-label">태그</div><div class="mc-val">${(r.tags || []).join(', ') || '없음'}</div></div>
      <div class="mc-item"><div class="mc-label">recordId</div><div class="mc-val" style="font-family:monospace">#${r.id}</div></div>
    </div>
    ${r.notes ? `<div class="mc-notes">"${r.notes}"</div>` : ''}`;
  $('modal-ov').classList.add('open');
}

// ── Routines ──
async function loadRoutines() {
  const data = await apiGet('/api/routines');
  const routines = data.data || [];
  const grid = $('routine-grid');
  grid.innerHTML = routines.map(r => `
    <div class="rout-card">
      ${r.recommended ? '<div class="rout-recommended">✨ 추천 루틴</div>' : ''}
      <div class="rout-head">
        <span class="rout-name">${r.name}</span>
        <span class="rout-cat">${r.category}</span>
      </div>
      <div class="rout-steps">
        ${(r.steps || []).map((s, i) => `
          <div class="rstep">
            <span class="rstep-num">${i + 1}</span>
            <span>${s}</span>
          </div>`).join('')}
      </div>
      <div class="rout-foot">
        ${r.saved ? '<span class="rout-saved">✅ 저장됨</span>' : '<span></span>'}
        ${!r.saved ? `<button class="btn-save-rout" onclick="saveRoutine(${r.id})">루틴 저장</button>` : ''}
      </div>
    </div>`).join('');
}

async function saveRoutine(routineId) {
  const res = await apiPost('/api/routines/save', { routineId });
  if (res.ok) { showToast('루틴이 저장되었습니다!'); loadRoutines(); }
}

// ── Stats ──
async function loadStats() {
  const data = await apiGet('/api/stats');
  state.stats = data.data;
  const s = state.stats;

  // bug02: 서버가 avgSleep을 반환하지만 클라이언트는 averageHours를 기대
  // averageHours는 undefined → 'N/A' 표시
  const avgDisplay = s.averageHours !== undefined ? `${s.averageHours}h` : `N/A (bug02: avgSleep=${s.avgSleep}h)`;
  const schemaNotice = $('schema-notice');
  if (s.averageHours === undefined) {
    schemaNotice.textContent = `⚠️ [bug02] 스키마 불일치: API가 averageHours 대신 avgSleep을 반환합니다. 평균 수면 시간을 표시할 수 없습니다.`;
    schemaNotice.classList.add('show');
  } else {
    schemaNotice.classList.remove('show');
  }

  $('stats-cards').innerHTML = [
    { emoji: '📅', val: s.totalRecords, label: '총 기록' },
    { emoji: '⏱️', val: avgDisplay, label: '평균 수면', note: s.averageHours === undefined ? '⚠️ bug02' : '' },
    { emoji: '⭐', val: `${s.avgQuality}/5`, label: '평균 품질' },
    { emoji: '🎯', val: s.goalAchieved ? '달성' : '미달성', label: '목표 달성', note: '' },
    { emoji: '📊', val: `${s.weeklyTotal}h`, label: '주간 합계' }
  ].map(x => `
    <div class="sc">
      <div class="sc-emoji">${x.emoji}</div>
      <div class="sc-val">${x.val}</div>
      <div class="sc-label">${x.label}</div>
      ${x.note ? `<div class="sc-note">${x.note}</div>` : ''}
    </div>`).join('');

  // Bars for recent records
  const recData = await apiGet('/api/sleep-records');
  const recs = (recData.data || []).slice(0, 7).reverse();
  const maxDur = Math.max(...recs.map(r => Math.abs(r.duration)), 1);
  $('sleep-bars').innerHTML = recs.map(r => {
    const isNeg = r.duration < 0;
    const h = Math.abs(r.duration);
    const barH = Math.max(4, Math.round(h / maxDur * 100));
    const cls = isNeg ? 'sbar-neg' : h < 6 ? 'sbar-low' : 'sbar-ok';
    return `
      <div class="sbar-wrap">
        <div class="sbar-val">${isNeg ? '⚠️' : h + 'h'}</div>
        <div class="sbar ${cls}" style="height:${barH}px" title="${r.date}: ${r.duration}h"></div>
        <div class="sbar-label">${r.date.slice(5)}</div>
      </div>`;
  }).join('');
}

// ── Goals ──
async function loadGoals() {
  const data = await apiGet('/api/goals');
  state.goals = data.data || {};
  const g = state.goals;
  $('g-hours').value = g.targetHours || 8;
  $('g-bedtime').value = g.bedtimeGoal || '23:00';
  $('g-wake').value = g.wakeGoal || '07:00';
  $('g-quality').value = g.qualityGoal || 4;

  // Goal progress vs recent
  const recData = await apiGet('/api/sleep-records');
  const recent = (recData.data || [])[0];
  const gp = $('goal-progress');
  if (!recent) { gp.innerHTML = '<p style="color:var(--text-muted);font-size:.84rem">기록이 없습니다.</p>'; return; }
  const rows = [
    { label: '최근 수면 시간', val: `${recent.duration}h`, target: `목표: ${g.targetHours}h`, ok: recent.duration >= g.targetHours },
    { label: '취침 시간', val: recent.bedtime, target: `목표: ${g.bedtimeGoal}`, ok: recent.bedtime <= g.bedtimeGoal },
    { label: '기상 시간', val: recent.wakeTime, target: `목표: ${g.wakeGoal}`, ok: true },
    { label: '수면 품질', val: `${recent.quality}/5`, target: `목표: ${g.qualityGoal}/5`, ok: recent.quality >= g.qualityGoal }
  ];
  gp.innerHTML = '<div style="font-size:.82rem;font-weight:700;margin-bottom:8px;color:var(--text-muted)">최근 기록 vs 목표</div>' +
    rows.map(row => `
      <div class="gp-row">
        <span class="gp-label">${row.label}</span>
        <span class="gp-val ${row.ok ? 'gp-ok' : 'gp-fail'}">${row.val} ${row.ok ? '✅' : '❌'}</span>
        <span style="font-size:.74rem;color:var(--text-muted)">${row.target}</span>
      </div>`).join('');
}

// ── History ──
async function loadHistory() {
  const data = await apiGet('/api/sleep-records');
  const records = data.data || [];
  const tbody = $('history-tbody');
  tbody.innerHTML = records.map(r => {
    const cls = r.duration < 0 ? 'td-neg' : r.duration < 6 ? 'td-warn' : 'td-ok';
    return `<tr>
      <td>${r.date}</td>
      <td>${r.bedtime}</td>
      <td>${r.wakeTime}</td>
      <td class="${cls}">${r.duration}h${r.duration < 0 ? ' ⚠️' : ''}</td>
      <td>${'⭐'.repeat(r.quality)}</td>
      <td>${r.mood}</td>
      <td style="color:var(--text-muted);font-size:.78rem">${r.notes || '-'}</td>
    </tr>`;
  }).join('');
}

// ── Goal alert ──
function checkGoalAlert() {
  if (!state.records.length) return;
  const recent = state.records[0];
  const needAlert = recent.duration < 0 || recent.duration < (state.goals.targetHours || 7);
  $('alert-dot').classList.toggle('show', needAlert);
}

// ── Events ──
document.addEventListener('DOMContentLoaded', async () => {
  await loadRecords();
  await apiGet('/api/goals').then(d => { state.goals = d.data || {}; });

  // Nav
  document.querySelectorAll('.nl').forEach(l => {
    l.addEventListener('click', e => { e.preventDefault(); switchView(l.dataset.view); $('gnav').classList.remove('open'); });
  });
  $('burger').addEventListener('click', () => $('gnav').classList.toggle('open'));

  // Alert bell → stats
  $('sleep-alert').addEventListener('click', () => switchView('stats'));

  // Refresh
  $('btn-refresh').addEventListener('click', () => { showToast('🔄 새로고침 중...'); loadRecords(); });

  // Filter
  $('btn-filter').addEventListener('click', () => {
    state.filterFrom = $('filter-from').value;
    state.filterTo = $('filter-to').value;
    state.filterQ = $('record-search').value.trim();
    loadRecords();
  });
  $('record-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') { state.filterQ = e.target.value.trim(); loadRecords(); }
  });

  // Stats refresh
  $('btn-refresh-stats').addEventListener('click', () => { showToast('📊 통계 갱신 중...'); loadStats(); });

  // Add form
  $('add-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = {
      date: $('f-date').value, bedtime: $('f-bed').value, wakeTime: $('f-wake').value,
      quality: $('f-quality').value, notes: $('f-notes').value,
      mood: $('f-mood').value, tags: $('f-tags').value
    };
    const msgEl = $('add-msg');
    const res = await apiPost('/api/sleep-records', body);
    if (res.ok) {
      msgEl.textContent = `✅ 기록 추가됨 (수면 ${res.json.data.duration}h${res.json.data.duration < 0 ? ' ← bug01 음수!' : ''})`;
      msgEl.className = 'add-msg success';
      $('add-form').reset();
      await loadRecords();
      showToast('수면 기록이 추가되었습니다.');
    } else { msgEl.textContent = '추가 실패'; msgEl.className = 'add-msg error'; }
  });

  // Goals form
  $('goals-form').addEventListener('submit', async e => {
    e.preventDefault();
    const body = {
      targetHours: $('g-hours').value, bedtimeGoal: $('g-bedtime').value,
      wakeGoal: $('g-wake').value, qualityGoal: $('g-quality').value
    };
    const res = await apiPut('/api/goals', body);
    const msgEl = $('gform-msg');
    if (res.ok) {
      state.goals = res.json.data;
      msgEl.textContent = '✅ 목표가 저장되었습니다!'; msgEl.className = 'gform-msg success';
      showToast('목표가 저장되었습니다.');
      loadGoals();
    } else { msgEl.textContent = '저장 실패'; }
  });

  // Modal
  $('modal-x').addEventListener('click', () => $('modal-ov').classList.remove('open'));
  $('modal-ov').addEventListener('click', e => { if (e.target === $('modal-ov')) $('modal-ov').classList.remove('open'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('modal-ov').classList.remove('open'); });

  // IDOR debug
  $('btn-idor').addEventListener('click', async () => {
    const id = $('idor-id').value.trim();
    if (!id) return;
    const resultEl = $('idor-result');
    resultEl.textContent = '조회 중...';
    const data = await apiGet(`/api/sleep-records/${id}`);
    if (data.success) {
      const r = data.data;
      const isOwn = r.userId === 'user_james';
      resultEl.textContent = JSON.stringify({ id: r.id, userId: r.userId, date: r.date, bedtime: r.bedtime, notes: r.notes }, null, 2);
      if (!isOwn) showToast(`⚠️ [bug03] ${r.userId}의 기록을 조회함 (IDOR)`);
    } else { resultEl.textContent = data.message || '조회 실패'; }
  });
});

window.openRecordModal = openRecordModal;
window.saveRoutine = saveRoutine;
