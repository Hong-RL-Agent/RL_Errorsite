'use strict';

const state = {
  invoices: [], customers: [], items: [], activeView: 'invoices',
  statusFilter: 'all', sort: '', query: ''
};
const fmt = n => '₩' + Math.round(n).toLocaleString();
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
async function apiPatch(url, body) {
  const r = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { ok: r.ok, json: await r.json() };
}

// ── View switch ──
function switchView(v) {
  state.activeView = v;
  document.querySelectorAll('.view').forEach(s => s.classList.remove('active'));
  $(`view-${v}`).classList.add('active');
  document.querySelectorAll('.nl').forEach(l => l.classList.toggle('active', l.dataset.view === v));
  if (v === 'customers') loadCustomers();
  if (v === 'reports') loadReports();
}

// ── KPI ──
async function loadKPI() {
  const data = await apiGet('/api/reports');
  const d = data.data;
  $('kpi-total').textContent = fmt(d.totalRevenue);
  $('kpi-paid').textContent = fmt(d.paidRevenue);
  $('kpi-pending').textContent = fmt(d.pendingRevenue);
  $('kpi-overdue').textContent = fmt(d.overdueRevenue);
}

// ── Invoices ──
async function loadInvoices() {
  const p = new URLSearchParams();
  if (state.statusFilter !== 'all') p.set('status', state.statusFilter);
  if (state.sort) p.set('sort', state.sort);
  if (state.query) p.set('q', state.query);
  const data = await apiGet(`/api/invoices?${p}`);
  state.invoices = data.data || [];
  renderInvoices();
  loadKPI();
}

const statusLabel = { pending: '⏳ 대기중', paid: '✅ 결제완료', overdue: '🚨 연체', cancelled: '❌ 취소' };
const statusCls = { pending: 'st-pending', paid: 'st-paid', overdue: 'st-overdue', cancelled: 'st-cancelled' };

function renderInvoices() {
  const list = $('invoice-list');
  $('inv-cnt').textContent = `${state.invoices.length}건`;
  if (!state.invoices.length) {
    list.innerHTML = '<p style="color:var(--text-muted);padding:24px;text-align:center">청구서가 없습니다.</p>';
    return;
  }
  list.innerHTML = state.invoices.map(inv => {
    const t = inv.totals;
    return `
      <div class="inv-card" onclick="openInvoiceModal(${inv.id})">
        <div class="inv-head">
          <span class="inv-no">${inv.invoiceNo}</span>
          <span class="inv-status ${statusCls[inv.status]}">${statusLabel[inv.status]}</span>
        </div>
        <div class="inv-meta">
          <span>👤 ${inv.customerName}</span>
          <span>📅 발행: ${inv.issuedAt}</span>
          <span>⏰ 마감: ${inv.dueAt}</span>
        </div>
        <div class="inv-total">${fmt(t.total)}</div>
        <div class="inv-tax-detail">소계 ${fmt(t.subtotal)} / 할인 -${fmt(t.discount)} / 세금 ${fmt(t.tax)} (⚠️bug01: 이중할인 적용)</div>
        ${inv.note ? `<div style="font-size:.76rem;color:var(--text-muted);margin-top:3px">${inv.note}</div>` : ''}
        <div class="inv-actions" onclick="event.stopPropagation()">
          ${['pending','paid','overdue','cancelled'].map(s =>
            `<button class="btn-status" onclick="changeStatus(${inv.id},'${s}')" ${inv.status===s?'style="border-color:var(--slate);color:var(--text)"':''}>${statusLabel[s]}</button>`
          ).join('')}
        </div>
      </div>`;
  }).join('');
}

async function changeStatus(id, status) {
  const res = await apiPatch(`/api/invoices/${id}/status`, { status });
  if (res.ok) { showToast(`상태 변경: ${statusLabel[status]}`); loadInvoices(); }
}

function openInvoiceModal(id) {
  const inv = state.invoices.find(i => i.id === id);
  if (!inv) return;
  const t = inv.totals;
  $('modal-content').innerHTML = `
    <div class="minv-no">${inv.invoiceNo}</div>
    <div class="minv-meta">
      <span>👤 ${inv.customerName}</span>
      <span class="inv-status ${statusCls[inv.status]}">${statusLabel[inv.status]}</span>
      <span>📅 ${inv.issuedAt}</span>
      <span>⏰ ${inv.dueAt}</span>
    </div>
    <table class="minv-items">
      <thead><tr><th>항목</th><th>수량</th><th>단가</th><th>소계</th></tr></thead>
      <tbody>
        ${inv.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${fmt(i.unitPrice)}</td><td>${fmt(i.qty*i.unitPrice)}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="minv-totals">
      <div class="mt-row"><span>소계</span><span>${fmt(t.subtotal)}</span></div>
      <div class="mt-row"><span>할인 (${t.discountRate}%)</span><span>-${fmt(t.discount)}</span></div>
      <div class="mt-row"><span>세금 (${t.taxRate}%)<span class="mt-bug">bug01: 이중할인 적용</span></span><span>${fmt(t.tax)}</span></div>
      <div class="mt-row mt-total"><span>합계</span><span>${fmt(t.total)}</span></div>
    </div>`;
  $('modal-ov').classList.add('open');
}

// ── Create form ──
let formItems = [{ name: '', qty: 1, unitPrice: 0 }];

function renderFormItems() {
  const tbody = $('items-tbody');
  tbody.innerHTML = formItems.map((item, i) => `
    <tr>
      <td><input type="text" value="${item.name}" oninput="formItems[${i}].name=this.value" placeholder="항목명"/></td>
      <td><input type="number" value="${item.qty}" min="1" style="width:60px" oninput="formItems[${i}].qty=parseInt(this.value)||1;calcPreview()"/></td>
      <td><input type="number" value="${item.unitPrice}" min="0" oninput="formItems[${i}].unitPrice=parseInt(this.value)||0;calcPreview()"/></td>
      <td class="td-subtotal">${fmt(item.qty * item.unitPrice)}</td>
      <td><button class="btn-rm-item" onclick="removeItem(${i})" type="button">✕</button></td>
    </tr>`).join('');
  calcPreview();
}

function addItem() { formItems.push({ name: '', qty: 1, unitPrice: 0 }); renderFormItems(); }
function removeItem(i) { if (formItems.length > 1) { formItems.splice(i, 1); renderFormItems(); } }

function calcPreview() {
  const discountRate = parseFloat($('f-discount').value) || 0;
  const taxRate = parseFloat($('f-tax').value) || 10;
  const subtotal = formItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const discount = subtotal * (discountRate / 100);
  const discounted = subtotal - discount;
  // bug01 재현: 이중할인 적용한 세금 계산
  const taxBuggy = discounted * (1 - discountRate / 100) * (taxRate / 100);
  const taxCorrect = discounted * (taxRate / 100);
  const totalBuggy = discounted + taxBuggy;

  $('price-preview').innerHTML = `
    <div class="pp-row"><span class="pp-label">소계</span><span class="pp-val">${fmt(subtotal)}</span></div>
    <div class="pp-row"><span class="pp-label">할인 (${discountRate}%)</span><span class="pp-val amber">-${fmt(discount)}</span></div>
    <div class="pp-row"><span class="pp-label">할인 후</span><span class="pp-val">${fmt(discounted)}</span></div>
    <div class="pp-row"><span class="pp-label">세금 (${taxRate}%)<span class="bug01-mark">bug01: ${fmt(taxBuggy)} (정상: ${fmt(taxCorrect)})</span></span><span class="pp-val">${fmt(taxBuggy)}</span></div>
    <div class="pp-row pp-total"><span class="pp-label">합계</span><span class="pp-val big">${fmt(totalBuggy)}</span></div>`;
}

// ── Customers ──
async function loadCustomers(q = '') {
  const p = new URLSearchParams();
  if (q) p.set('q', q);
  const data = await apiGet(`/api/customers?${p}`);
  state.customers = data.data || [];
  renderCustomers();
  // Populate form dropdown
  const sel = $('f-customer');
  if (sel) sel.innerHTML = '<option value="">선택하세요</option>' + state.customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

function renderCustomers() {
  const grid = $('customer-grid');
  if (!grid) return;
  grid.innerHTML = state.customers.map(c => `
    <div class="cust-card">
      <div class="cust-name">👤 ${c.name}</div>
      <div class="cust-row">✉️ ${c.email}</div>
      <div class="cust-row">📞 ${c.phone}</div>
      <div class="cust-row">📍 ${c.address}</div>
    </div>`).join('');
}

// ── Reports ──
async function loadReports() {
  const data = await apiGet('/api/reports');
  const d = data.data;
  $('tax-notice').textContent = `⚠️ [bug01] 세금 계산 시 할인이 이중 적용되어 모든 세금 금액이 실제보다 낮게 계산됩니다. 총 청구액 오류 포함.`;
  $('report-grid').innerHTML = [
    { emoji: '🧾', val: d.totalInvoices, label: '총 청구서' },
    { emoji: '💰', val: fmt(d.totalRevenue), label: '총 청구액' },
    { emoji: '✅', val: fmt(d.paidRevenue), label: '수금 완료' },
    { emoji: '⏳', val: fmt(d.pendingRevenue), label: '대기 중' },
    { emoji: '🚨', val: fmt(d.overdueRevenue), label: '연체액' }
  ].map(x => `<div class="rg-card"><div class="rg-emoji">${x.emoji}</div><div class="rg-val">${x.val}</div><div class="rg-label">${x.label}</div></div>`).join('');
  $('report-breakdown').innerHTML = `
    <div class="rb-title">상태별 현황</div>
    ${[['paid','✅ 결제완료'], ['pending','⏳ 대기중'], ['overdue','🚨 연체']].map(([s,l]) => `
      <div class="rb-row">
        <span>${l}</span>
        <span class="rb-stat">${d.byStatus[s] || 0}건</span>
      </div>`).join('')}`;
}

// ── Events ──
document.addEventListener('DOMContentLoaded', async () => {
  await loadCustomers();
  await loadInvoices();
  renderFormItems();

  document.querySelectorAll('.nl').forEach(l => {
    l.addEventListener('click', e => { e.preventDefault(); switchView(l.dataset.view); $('gnav').classList.remove('open'); });
  });
  $('burger').addEventListener('click', () => $('gnav').classList.toggle('open'));
  $('btn-refresh').addEventListener('click', () => { showToast('🔄 새로고침 중...'); loadInvoices(); });

  // Invoice filters
  $('inv-search').addEventListener('input', e => { state.query = e.target.value.trim(); loadInvoices(); });
  $('inv-status-filter').addEventListener('change', e => { state.statusFilter = e.target.value; loadInvoices(); });
  $('inv-sort').addEventListener('change', e => { state.sort = e.target.value; loadInvoices(); });

  // Add item
  $('btn-add-item').addEventListener('click', addItem);
  $('btn-preview-calc').addEventListener('click', calcPreview);
  $('f-discount').addEventListener('input', calcPreview);
  $('f-tax').addEventListener('input', calcPreview);

  // Create form — bug02: 중복 제출 방지 로직 없음
  $('create-form').addEventListener('submit', async e => {
    e.preventDefault();
    const msgEl = $('cform-msg');
    const body = {
      customerId: $('f-customer').value,
      items: formItems.filter(i => i.name.trim()),
      discountRate: $('f-discount').value,
      taxRate: $('f-tax').value,
      dueAt: $('f-due').value,
      note: $('f-note').value
    };
    if (!body.customerId || !body.items.length) {
      msgEl.textContent = '고객과 항목을 입력하세요.'; msgEl.className = 'cform-msg error'; return;
    }
    // bug02: 버튼 비활성화 없이 바로 발행 → 연속 클릭 시 중복 생성
    const res = await apiPost('/api/invoices', body);
    if (res.ok) {
      msgEl.textContent = `✅ 청구서 발행: ${res.json.data.invoiceNo} (연속 클릭 시 중복 생성됨 — bug02)`;
      msgEl.className = 'cform-msg success';
      $('create-form').reset();
      formItems = [{ name: '', qty: 1, unitPrice: 0 }];
      renderFormItems();
      await loadInvoices();
      showToast(`청구서가 발행되었습니다: ${res.json.data.invoiceNo}`);
    } else { msgEl.textContent = res.json.message || '발행 실패'; msgEl.className = 'cform-msg error'; }
  });

  // Customer search
  $('btn-cust-search').addEventListener('click', () => loadCustomers($('cust-search').value.trim()));
  $('cust-search').addEventListener('keydown', e => { if (e.key === 'Enter') loadCustomers(e.target.value.trim()); });

  // Reports refresh
  $('btn-refresh-reports').addEventListener('click', () => { showToast('📊 리포트 갱신 중...'); loadReports(); });

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
    const data = await apiGet(`/api/invoices/${id}`);
    if (data.success) {
      const inv = data.data;
      const isOwn = inv.userId === 'user_maya';
      resultEl.textContent = JSON.stringify({ id: inv.id, invoiceNo: inv.invoiceNo, userId: inv.userId, customerName: inv.customerName, total: inv.totals.total }, null, 2);
      if (!isOwn) showToast(`⚠️ [bug03] ${inv.userId}의 청구서 조회 성공 (IDOR)`);
    } else { resultEl.textContent = data.message || '조회 실패'; }
  });
});

window.changeStatus = changeStatus;
window.openInvoiceModal = openInvoiceModal;
window.removeItem = removeItem;
window.formItems = formItems;
