'use strict';

const state = {
  symptoms: [], selectedSymptomId: null, plants: [],
  lastDiagnosis: null, activeView: 'diagnose'
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
  const json = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, json };
}

// ── View switch ──
function switchView(v) {
  state.activeView = v;
  document.querySelectorAll('.view').forEach(s => s.classList.remove('active'));
  $(`view-${v}`).classList.add('active');
  document.querySelectorAll('.nl').forEach(l => l.classList.toggle('active', l.dataset.view === v));
  if (v === 'plants') loadPlants();
  if (v === 'tips') loadTips();
  if (v === 'consultations') loadConsultations();
}

// ── Symptoms ──
async function loadSymptoms() {
  const data = await apiGet('/api/symptoms');
  state.symptoms = data.data || [];
  renderSymptoms();
}

function renderSymptoms() {
  const grid = $('symptom-grid');
  const sevMap = { low: 'sev-low', medium: 'sev-medium', high: 'sev-high', critical: 'sev-critical' };
  const sevLabel = { low: '경미', medium: '보통', high: '심각', critical: '긴급' };
  grid.innerHTML = state.symptoms.map(s => `
    <button class="sym-btn ${state.selectedSymptomId === s.id ? 'selected' : ''}" onclick="selectSymptom(${s.id})">
      <span class="sym-emoji">${s.emoji}</span>
      <div class="sym-info">
        <div class="sym-name">${s.name}</div>
        <div class="sym-cat">${s.category}</div>
        <span class="sym-sev ${sevMap[s.severity]}">${sevLabel[s.severity]}</span>
      </div>
    </button>`).join('');
}

function selectSymptom(id) {
  state.selectedSymptomId = state.selectedSymptomId === id ? null : id;
  renderSymptoms();
  $('diag-status').textContent = state.selectedSymptomId
    ? `✅ 선택됨: ${state.symptoms.find(s => s.id === id)?.name}`
    : '';
}

// ── Plants (for select dropdown) ──
async function loadPlantSelect() {
  const data = await apiGet('/api/plants');
  state.plants = data.data || [];
  const sel = $('plant-select');
  sel.innerHTML = '<option value="">선택 안 함</option>' + state.plants.map(p => `<option value="${p.id}">${p.emoji} ${p.name}</option>`).join('');
}

// ── Diagnose ──
async function diagnose() {
  if (!state.selectedSymptomId) { showToast('⚠️ 증상을 먼저 선택해주세요.'); return; }
  const plantId = $('plant-select').value;
  $('diag-status').textContent = '🔬 진단 중...';
  $('result-card').style.display = 'none';

  const res = await apiPost('/api/diagnosis', { symptomId: state.selectedSymptomId, plantId: plantId ? parseInt(plantId) : null });

  if (!res.ok) {
    // bug02: 빈 객체 응답으로 구체적 오류 알 수 없음
    const errMsg = Object.keys(res.json).length === 0
      ? `[bug02] 진단 실패: 서버가 빈 객체 {} 반환 (status ${res.status}). 오류 원인 불명확.`
      : JSON.stringify(res.json);
    $('diag-status').textContent = `❌ ${errMsg}`;
    showToast('진단에 실패했습니다. (bug02)');
    return;
  }

  const d = res.json.data;
  state.lastDiagnosis = d;

  // bug01 notice: 요청한 symptomId와 진단 결과의 disease가 항상 질소결핍(id:1 결과)이면 표시
  const selectedSym = state.symptoms.find(s => s.id === state.selectedSymptomId);
  const isBug01 = d.symptomId !== 1 && d.disease === '질소 결핍';

  const sevColor = { low: '#4DB6AC', medium: '#FFD54F', high: '#EF5350', critical: '#EF5350' };
  $('conf-pill').textContent = `신뢰도 ${d.confidence}%`;
  $('result-body').innerHTML = `
    ${isBug01 ? `<div class="bug01-notice" style="grid-column:1/-1">⚠️ [bug01] 진단 매핑 오류: 증상 "${selectedSym?.name}"를 선택했지만 symptomId=1(질소 결핍) 기준으로 진단됨.</div>` : ''}
    <div class="rb-item"><div class="rb-label">진단 증상</div><div class="rb-val">${d.symptomName}</div></div>
    <div class="rb-item"><div class="rb-label">진단 병해</div><div class="rb-val disease">${d.disease}</div></div>
    <div class="rb-item" style="grid-column:1/-1"><div class="rb-label">원인</div><div class="rb-val cause">${d.cause}</div></div>
    <div class="rb-item" style="grid-column:1/-1"><div class="rb-label">처치 방법</div><div class="rb-val treatment">${d.treatment}</div></div>
    <div class="rb-item"><div class="rb-label">심각도</div><div class="rb-val" style="color:${sevColor[d.severity]||'#fff'}">${d.severity}</div></div>
    <div class="rb-item"><div class="rb-label">예방</div><div class="rb-tags">${(d.preventions||[]).map(p => `<span class="rb-tag">${p}</span>`).join('')}</div></div>
    ${d.plant ? `<div class="rb-item"><div class="rb-label">식물</div><div class="rb-val">${d.plant.emoji} ${d.plant.name}</div></div>` : ''}`;

  $('result-card').style.display = 'block';
  $('diag-status').textContent = isBug01 ? '⚠️ 진단 완료 (bug01 감지됨)' : '✅ 진단 완료';
}

// ── Consult form ──
function showConsultForm() {
  if (!state.lastDiagnosis) return;
  const sym = state.symptoms.find(s => s.id === state.selectedSymptomId);
  $('cform-symptom-id').value = state.selectedSymptomId;
  $('cf-symptom').value = sym?.name || '';
  $('consult-form-card').style.display = 'block';
  $('consult-form-card').scrollIntoView({ behavior: 'smooth' });
}

// ── Plants view ──
async function loadPlants() {
  const typeFilter = $('plant-type-filter')?.value || 'all';
  const p = new URLSearchParams();
  if (typeFilter !== 'all') p.set('type', typeFilter);
  const data = await apiGet(`/api/plants?${p}`);
  const plants = data.data || [];
  const grid = $('plants-grid');
  grid.innerHTML = plants.map(p => `
    <div class="plant-card" onclick="openPlantModal(${p.id})">
      <div class="plant-head">
        <span class="plant-emoji">${p.emoji}</span>
        <div>
          <div class="plant-name">${p.name}</div>
          <div class="plant-type">${p.type}</div>
          <span class="plant-diff">난이도: ${p.difficulty}</span>
        </div>
      </div>
      <div class="plant-meta">
        <div class="pm-item"><div class="pm-label">💡 빛</div><div class="pm-val">${p.light}</div></div>
        <div class="pm-item"><div class="pm-label">💧 물</div><div class="pm-val">${p.water}</div></div>
        <div class="pm-item"><div class="pm-label">💦 습도</div><div class="pm-val">${p.humidity}</div></div>
      </div>
    </div>`).join('');
}

function openPlantModal(id) {
  const plant = state.plants.find(p => p.id === id);
  if (!plant) return;
  $('modal-content').innerHTML = `
    <div class="mplant-emoji">${plant.emoji}</div>
    <div class="mplant-name">${plant.name} <span style="font-size:.76rem;color:var(--green-l);font-weight:600">${plant.type}</span></div>
    <div class="mplant-grid">
      <div class="mpi"><div class="mpi-label">난이도</div><div class="mpi-val">${plant.difficulty}</div></div>
      <div class="mpi"><div class="mpi-label">빛</div><div class="mpi-val">${plant.light}</div></div>
      <div class="mpi"><div class="mpi-label">물 주기</div><div class="mpi-val">${plant.water}</div></div>
      <div class="mpi"><div class="mpi-label">습도</div><div class="mpi-val">${plant.humidity}</div></div>
    </div>
    <div class="mplant-tip">💡 관리 팁: ${plant.tips}</div>`;
  $('modal-ov').classList.add('open');
}

// ── Tips ──
async function loadTips(cat = 'all') {
  const p = new URLSearchParams();
  if (cat !== 'all') p.set('category', cat);
  const data = await apiGet(`/api/tips?${p}`);
  const tips = data.data || [];
  $('tips-list').innerHTML = tips.map(t => `
    <div class="tip-card">
      <div class="tip-head">
        <span class="tip-title">${t.title}</span>
        <span class="tip-cat">${t.category}</span>
      </div>
      <div class="tip-content">${t.content}</div>
    </div>`).join('');
}

// ── Consultations ──
async function loadConsultations() {
  const data = await apiGet('/api/consultations');
  const list = data.data || [];
  const el = $('consult-list');
  el.innerHTML = list.length ? list.map(c => `
    <div class="consult-card" onclick="openConsultModal(${c.id})">
      <div class="cc-head">
        <span class="cc-plant">🌿 ${c.plantName}</span>
        <span class="cc-status ${c.status === 'answered' ? 'st-answered' : 'st-pending'}">${c.status === 'answered' ? '✅ 답변완료' : '⏳ 검토중'}</span>
      </div>
      <div class="cc-sym">증상: ${c.symptomName}</div>
      <div class="cc-date">신청일: ${c.createdAt} · ID: #${c.id}</div>
      ${c.answer ? `<div class="cc-answer">💬 ${c.answer}</div>` : ''}
    </div>`).join('') : '<p style="color:var(--text-muted);padding:24px;text-align:center">상담 기록이 없습니다.</p>';
}

function openConsultModal(id) {
  const fakeConsults = [
    { id: 1, plantName: '몬스테라', symptomName: '잎이 노랗게 변함', status: 'answered', answer: '질소 비료를 2주 간격으로 시비하세요.' },
    { id: 2, plantName: '선인장', symptomName: '흰 가루 같은 게 생김', status: 'pending', answer: null }
  ];
  const c = fakeConsults.find(x => x.id === id);
  if (!c) return;
  $('modal-content').innerHTML = `<div class="mplant-name">상담 #${c.id}</div><p style="font-size:.84rem;color:var(--text-muted);margin-bottom:8px">식물: ${c.plantName}</p><p style="font-size:.84rem;margin-bottom:8px">증상: ${c.symptomName}</p>${c.answer ? `<div class="mplant-tip">💬 ${c.answer}</div>` : '<p style="color:var(--yellow);font-size:.82rem">⏳ 답변 대기 중</p>'}`;
  $('modal-ov').classList.add('open');
}

// ── Events ──
document.addEventListener('DOMContentLoaded', async () => {
  await loadSymptoms();
  await loadPlantSelect();

  document.querySelectorAll('.nl').forEach(l => {
    l.addEventListener('click', e => { e.preventDefault(); switchView(l.dataset.view); $('gnav').classList.remove('open'); });
  });
  $('burger').addEventListener('click', () => $('gnav').classList.toggle('open'));
  $('btn-refresh').addEventListener('click', () => { showToast('🔄 새로고침...'); loadSymptoms(); });

  $('btn-diagnose').addEventListener('click', diagnose);
  $('btn-clear-sym').addEventListener('click', () => { state.selectedSymptomId = null; renderSymptoms(); $('diag-status').textContent = ''; $('result-card').style.display = 'none'; $('consult-form-card').style.display = 'none'; });
  $('btn-request-consult').addEventListener('click', showConsultForm);
  $('btn-cancel-consult').addEventListener('click', () => { $('consult-form-card').style.display = 'none'; });

  // Consult form submit
  $('cform').addEventListener('submit', async e => {
    e.preventDefault();
    const body = { plantName: $('cf-plant').value.trim(), symptomId: $('cform-symptom-id').value, message: $('cf-msg').value.trim() };
    const msgEl = $('cform-msg');
    if (!body.plantName) { msgEl.textContent = '식물 이름을 입력하세요.'; msgEl.className = 'cform-msg error'; return; }
    const res = await apiPost('/api/consultations', body);
    if (res.ok) {
      msgEl.textContent = '✅ 상담이 신청되었습니다!'; msgEl.className = 'cform-msg success';
      $('cf-plant').value = ''; $('cf-msg').value = '';
      showToast('상담 신청이 완료되었습니다.');
    } else { msgEl.textContent = '신청 실패'; msgEl.className = 'cform-msg error'; }
  });

  // Plant type filter
  $('plant-type-filter')?.addEventListener('change', loadPlants);

  // Tips filter chips
  document.querySelectorAll('#tips-filter .fchip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#tips-filter .fchip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      loadTips(chip.dataset.cat);
    });
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
    const data = await apiGet(`/api/consultations/${id}`);
    if (data.success) {
      const c = data.data;
      const isOwn = c.userId === 'user_green';
      resultEl.textContent = JSON.stringify({ id: c.id, userId: c.userId, plantName: c.plantName, symptomName: c.symptomName, status: c.status }, null, 2);
      if (!isOwn) showToast(`⚠️ [bug03] ${c.userId}의 상담 기록 조회 성공 (IDOR)`);
    } else { resultEl.textContent = data.message || '조회 실패'; }
  });
});

window.selectSymptom = selectSymptom;
window.openPlantModal = openPlantModal;
window.openConsultModal = openConsultModal;
