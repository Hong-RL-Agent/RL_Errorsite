const state = {
  holdings: [],
  transactions: [],
  activeType: 'all',
  searchTerm: '',
  activeMonth: 'all',
  watchlist: new Set()
};

const els = {
  globalSearch: document.getElementById('globalSearch'),
  totalValue: document.getElementById('totalValue'),
  totalChange: document.getElementById('totalChange'),
  profitValue: document.getElementById('profitValue'),
  holdingCount: document.getElementById('holdingCount'),
  watchCount: document.getElementById('watchCount'),
  holdingsBody: document.getElementById('holdingsBody'),
  holdingStatus: document.getElementById('holdingStatus'),
  transactionStatus: document.getElementById('transactionStatus'),
  transactionList: document.getElementById('transactionList'),
  monthFilter: document.getElementById('monthFilter'),
  resetFilters: document.getElementById('resetFilters'),
  allocationLegend: document.getElementById('allocationLegend'),
  donutCenter: document.getElementById('donutCenter'),
  watchList: document.getElementById('watchList'),
  topWeight: document.getElementById('topWeight'),
  highRiskCount: document.getElementById('highRiskCount'),
  latestTransaction: document.getElementById('latestTransaction'),
  summaryToggle: document.getElementById('summaryToggle'),
  summaryBody: document.getElementById('summaryBody'),
  riskAcknowledge: document.getElementById('riskAcknowledge'),
  assetModal: document.getElementById('assetModal'),
  modalContent: document.getElementById('modalContent')
};

function formatCurrency(value) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    maximumFractionDigits: 0
  }).format(value);
}

function formatPercent(value) {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}

function showStatus(element, message) {
  element.textContent = message;
  element.classList.add('visible');
}

function hideStatus(element) {
  element.classList.remove('visible');
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadHoldings() {
  showStatus(els.holdingStatus, '보유 종목을 불러오는 중입니다...');
  try {
    const data = await fetchJson('/api/holdings');
    state.holdings = data.items;
    renderAllHoldingsViews();
    hideStatus(els.holdingStatus);
  } catch (error) {
    showStatus(els.holdingStatus, '보유 종목을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

async function loadTransactions() {
  showStatus(els.transactionStatus, '거래 내역을 불러오는 중입니다...');
  try {
    const data = await fetchJson('/api/transactions');
    state.transactions = data.items;
    renderTransactions();
    renderStickySummary();
    hideStatus(els.transactionStatus);
  } catch (error) {
    showStatus(els.transactionStatus, '거래 내역을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

function filteredHoldings() {
  const term = state.searchTerm.trim().toLowerCase();
  return state.holdings.filter((holding) => {
    const matchesType = state.activeType === 'all' || holding.type === state.activeType;
    const matchesSearch = !term ||
      holding.name.toLowerCase().includes(term) ||
      holding.ticker.toLowerCase().includes(term) ||
      holding.type.toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });
}

function renderAllHoldingsViews() {
  renderSummaryCards();
  renderAllocation();
  renderHoldingsTable();
  renderWatchlist();
  renderStickySummary();
}

function renderSummaryCards() {
  // INTENTIONAL GUI BUG: site073-bug01
  // CSV Error: 포트폴리오 합계 불일치
  // Type: portfolio-total-mismatch
  // Description: 총 자산 계산 시 마지막 보유 항목을 제외해 테이블 합계와 상단 총액이 불일치함.
  const totalValue = state.holdings.slice(0, -1).reduce((sum, holding) => sum + holding.value, 0);
  const profitValue = state.holdings.reduce((sum, holding) => sum + holding.value * (holding.returnRate / 100), 0);
  const weightedReturn = state.holdings.reduce((sum, holding) => sum + holding.returnRate * holding.weight, 0) / 100;

  els.totalValue.textContent = formatCurrency(totalValue);
  els.totalChange.textContent = `가중 수익률 ${formatPercent(weightedReturn)}`;
  els.profitValue.textContent = formatCurrency(profitValue);
  els.holdingCount.textContent = `${state.holdings.length}개`;
  els.watchCount.textContent = `${state.watchlist.size}개`;
}

function renderAllocation() {
  const colors = ['#0f9f7a', '#224d7b', '#7aa7c7', '#b9c4d0', '#dbe4ed', '#6ee7b7', '#64748b'];
  els.allocationLegend.innerHTML = '';
  state.holdings.forEach((holding, index) => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `
      <span><i style="background:${colors[index % colors.length]}"></i> ${holding.ticker}</span>
      <strong>${holding.weight.toFixed(1)}%</strong>
    `;
    els.allocationLegend.appendChild(item);
  });
  const top = state.holdings[0]?.weight || 0;
  els.donutCenter.textContent = `${top.toFixed(0)}%`;
}

function renderHoldingsTable() {
  const rows = filteredHoldings();
  if (!rows.length) {
    els.holdingsBody.innerHTML = '<tr><td colspan="8">조건에 맞는 보유 종목이 없습니다.</td></tr>';
    return;
  }

  els.holdingsBody.innerHTML = '';
  rows.forEach((holding) => {
    const row = document.createElement('tr');
    const returnClass = holding.returnRate >= 0 ? 'return-positive' : 'return-negative';
    const watched = state.watchlist.has(holding.id);
    row.innerHTML = `
      <td>
        <div class="asset-name">
          <strong>${holding.name}</strong>
          <span>${holding.ticker} · ${holding.note}</span>
        </div>
      </td>
      <td>${holding.type}</td>
      <td>${holding.quantity.toLocaleString('ko-KR')}</td>
      <td>${formatCurrency(holding.value)}</td>
      <td class="${returnClass}">${formatPercent(holding.returnRate)}</td>
      <td>${holding.weight.toFixed(1)}%</td>
      <td><button class="table-action" type="button" data-detail-id="${holding.id}">상세</button></td>
      <td><button class="watch-toggle${watched ? ' active' : ''}" type="button" data-watch-id="${holding.id}">${watched ? '제거' : '추가'}</button></td>
    `;
    els.holdingsBody.appendChild(row);
  });

  bindHoldingRowEvents();
}

function bindHoldingRowEvents() {
  document.querySelectorAll('[data-detail-id]').forEach((button) => {
    button.addEventListener('click', () => openAssetModal(button.dataset.detailId));
  });

  document.querySelectorAll('[data-watch-id]').forEach((button) => {
    button.addEventListener('click', () => toggleWatch(button.dataset.watchId));
  });
}

function renderTransactions() {
  const rows = state.transactions.filter((transaction) => {
    return state.activeMonth === 'all' || transaction.date.startsWith(state.activeMonth);
  });

  if (!rows.length) {
    els.transactionList.innerHTML = '<div class="transaction-row"><strong>내역 없음</strong><span>선택한 월의 mock 거래가 없습니다.</span><em></em><span></span><span></span></div>';
    return;
  }

  els.transactionList.innerHTML = rows.map((transaction) => `
    <div class="transaction-row">
      <strong>${transaction.date}</strong>
      <span>${transaction.assetName}</span>
      <em>${transaction.type}</em>
      <span>${formatCurrency(transaction.amount)}</span>
      <span>${transaction.status}</span>
    </div>
  `).join('');
}

function renderWatchlist() {
  els.watchCount.textContent = `${state.watchlist.size}개`;
  if (!state.watchlist.size) {
    els.watchList.className = 'watch-list empty';
    els.watchList.textContent = '관심 종목이 없습니다.';
    return;
  }

  els.watchList.className = 'watch-list';
  els.watchList.innerHTML = '';
  Array.from(state.watchlist).forEach((id) => {
    const holding = state.holdings.find((item) => item.id === id);
    if (!holding) {
      return;
    }
    const item = document.createElement('div');
    item.className = 'watch-item';
    item.innerHTML = `
      <strong>${holding.ticker}</strong>
      <span>${holding.name}</span>
      <button class="plain-button" type="button" data-watch-remove="${holding.id}">제거</button>
    `;
    els.watchList.appendChild(item);
  });

  document.querySelectorAll('[data-watch-remove]').forEach((button) => {
    button.addEventListener('click', () => toggleWatch(button.dataset.watchRemove));
  });
}

function renderStickySummary() {
  if (!state.holdings.length) {
    return;
  }
  const topHolding = [...state.holdings].sort((a, b) => b.weight - a.weight)[0];
  const highRiskCount = state.holdings.filter((holding) => holding.risk === '높음').length;
  const latest = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date))[0];

  els.topWeight.textContent = `${topHolding.name} · ${topHolding.weight.toFixed(1)}%`;
  els.highRiskCount.textContent = `${highRiskCount}개`;
  els.latestTransaction.textContent = latest ? `${latest.date} · ${latest.type}` : '거래 없음';
}

function toggleWatch(holdingId) {
  if (state.watchlist.has(holdingId)) {
    state.watchlist.delete(holdingId);
  } else {
    state.watchlist.add(holdingId);
  }
  renderHoldingsTable();
  renderWatchlist();
}

function openAssetModal(holdingId) {
  const holding = state.holdings.find((item) => item.id === holdingId);
  if (!holding) {
    return;
  }
  els.modalContent.innerHTML = `
    <div class="modal-detail">
      <p class="eyebrow">${holding.type} · ${holding.ticker}</p>
      <h2 id="modalTitle">${holding.name}</h2>
      <p>${holding.note}</p>
      <div class="detail-grid">
        <div><span>평가금액</span><strong>${formatCurrency(holding.value)}</strong></div>
        <div><span>수익률</span><strong>${formatPercent(holding.returnRate)}</strong></div>
        <div><span>위험도</span><strong>${holding.risk}</strong></div>
      </div>
      <button class="primary-button" type="button" data-action="asset-note">메모 작성</button>
    </div>
  `;
  els.assetModal.classList.remove('hidden');
}

function closeAssetModal() {
  els.assetModal.classList.add('hidden');
}

function resetFilters() {
  state.activeType = 'all';
  state.searchTerm = '';
  els.globalSearch.value = '';
  document.querySelectorAll('[data-type-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.typeFilter === 'all');
  });
  renderHoldingsTable();
}

function alertPreparing() {
  alert('준비중입니다.');
}

function bindEvents() {
  document.querySelectorAll('[data-type-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeType = button.dataset.typeFilter;
      document.querySelectorAll('[data-type-filter]').forEach((item) => {
        item.classList.toggle('active', item === button);
      });
      renderHoldingsTable();
    });
  });

  els.globalSearch.addEventListener('input', (event) => {
    state.searchTerm = event.target.value;
    renderHoldingsTable();
  });

  els.monthFilter.addEventListener('change', (event) => {
    state.activeMonth = event.target.value;
    renderTransactions();
  });

  els.resetFilters.addEventListener('click', resetFilters);

  els.summaryToggle.addEventListener('click', () => {
    const collapsed = els.summaryBody.classList.toggle('collapsed');
    els.summaryToggle.textContent = collapsed ? '포트폴리오 요약 펼치기' : '포트폴리오 요약 접기';
    els.summaryToggle.setAttribute('aria-expanded', String(!collapsed));
  });

  els.riskAcknowledge.addEventListener('change', () => {
    document.querySelector('.risk-card').classList.toggle('acknowledged', els.riskAcknowledge.checked);
  });

  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', closeAssetModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeAssetModal();
    }
  });

  // INTENTIONAL GUI BUG: site073-bug03
  // CSV Error: 리포트 다운로드 버튼 무반응
  // Type: report-download-button-no-response
  // Description: 리포트 다운로드 버튼 selector가 실제 DOM id와 달라 click listener가 연결되지 않음.
  const reportDownloadButton = document.querySelector('#downloadReportButton');
  if (reportDownloadButton) {
    reportDownloadButton.addEventListener('click', () => {
      alert('준비중입니다.');
    });
  }

  document.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      alertPreparing();
    }
  });
}

bindEvents();
loadHoldings();
loadTransactions();
