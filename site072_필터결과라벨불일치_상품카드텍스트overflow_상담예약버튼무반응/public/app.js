const state = {
  wines: [],
  pairings: [],
  activeType: 'all',
  activeRegion: 'all',
  activePrice: 'all',
  activePairingId: null,
  selectedWine: null
};

const els = {
  wineGrid: document.getElementById('wineGrid'),
  wineStatus: document.getElementById('wineStatus'),
  pairingStatus: document.getElementById('pairingStatus'),
  pairingTabs: document.getElementById('pairingTabs'),
  pairingPanel: document.getElementById('pairingPanel'),
  regionFilter: document.getElementById('regionFilter'),
  priceFilter: document.getElementById('priceFilter'),
  resultSummary: document.getElementById('resultSummary'),
  resetFilters: document.getElementById('resetFilters'),
  selectedWineBox: document.getElementById('selectedWineBox'),
  toggleConsultation: document.getElementById('toggleConsultation'),
  consultationBody: document.getElementById('consultationBody'),
  mockSubmit: document.getElementById('mockSubmit'),
  modal: document.getElementById('wineModal'),
  modalContent: document.getElementById('modalContent')
};

function showStatus(element, message) {
  element.textContent = message;
  element.classList.add('visible');
}

function hideStatus(element) {
  element.classList.remove('visible');
}

function typeLabel(type) {
  const labels = {
    all: '전체',
    // INTENTIONAL GUI BUG: site072-bug01
    // CSV Error: 필터 결과 라벨 불일치
    // Type: wine-filter-label-mismatch
    // Description: 필터 value와 결과 요약 label 매핑이 잘못되어 선택한 타입과 다른 라벨이 표시됨.
    red: '화이트',
    white: '레드',
    rose: '로제',
    sparkling: '스파클링'
  };
  return labels[type] || '전체';
}

function priceLabel(price) {
  const labels = {
    all: '전체 가격대',
    classic: 'Classic',
    signature: 'Signature',
    premium: 'Premium',
    collector: 'Collector'
  };
  return labels[price] || '전체 가격대';
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

async function loadWines() {
  showStatus(els.wineStatus, '와인 목록을 불러오는 중입니다...');
  try {
    const data = await fetchJson('/api/wines');
    state.wines = data.items;
    populateRegions();
    renderWines();
    hideStatus(els.wineStatus);
  } catch (error) {
    showStatus(els.wineStatus, '와인 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

async function loadPairings() {
  showStatus(els.pairingStatus, '페어링 가이드를 불러오는 중입니다...');
  try {
    const data = await fetchJson('/api/pairings');
    state.pairings = data.items;
    state.activePairingId = state.pairings[0]?.id || null;
    renderPairings();
    hideStatus(els.pairingStatus);
  } catch (error) {
    showStatus(els.pairingStatus, '페어링 가이드를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }
}

function populateRegions() {
  const regions = Array.from(new Map(state.wines.map((wine) => [wine.region, wine.regionLabel])).entries());
  els.regionFilter.innerHTML = '<option value="all">전체 산지</option>';
  regions.forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    els.regionFilter.appendChild(option);
  });
}

function filteredWines() {
  return state.wines.filter((wine) => {
    const matchesType = state.activeType === 'all' || wine.type === state.activeType;
    const matchesRegion = state.activeRegion === 'all' || wine.region === state.activeRegion;
    const matchesPrice = state.activePrice === 'all' || wine.priceBand === state.activePrice;
    return matchesType && matchesRegion && matchesPrice;
  });
}

function renderWines() {
  const wines = filteredWines();
  els.resultSummary.textContent = `${typeLabel(state.activeType)} · ${regionSummary()} · ${priceLabel(state.activePrice)} 조건으로 ${wines.length}개 상품 표시`;

  if (!wines.length) {
    els.wineGrid.innerHTML = '<div class="status-box visible">조건에 맞는 상품이 없습니다. 필터를 조정해 주세요.</div>';
    return;
  }

  els.wineGrid.innerHTML = '';
  wines.forEach((wine) => {
    const card = document.createElement('article');
    card.className = 'wine-card';
    if (wine.id === 'w-106') {
      card.setAttribute('data-bug-id', 'site072-bug02');
    }

    card.innerHTML = `
      <div class="wine-visual">
        <img src="${wine.image}" alt="${wine.name} 병 이미지">
      </div>
      <div class="wine-card-body">
        <div>
          <h3>${wine.name}</h3>
          <div class="wine-meta">
            <span>${wine.typeLabel}</span>
            <span>${wine.regionLabel}</span>
            <span>${wine.vintage}</span>
            <span>${wine.priceBand}</span>
          </div>
        </div>
        <p class="wine-description">${wine.pairingLong}</p>
        <div class="card-actions">
          <button class="detail-button" type="button" data-wine-detail="${wine.id}">상세 보기</button>
          <button class="reserve-button" type="button" ${wine.available ? '' : 'disabled'} data-wine-reserve="${wine.id}">
            ${wine.available ? '상담 예약' : '재입고 상담'}
          </button>
        </div>
      </div>
    `;

    els.wineGrid.appendChild(card);
  });

  bindWineCardEvents();
}

function regionSummary() {
  if (state.activeRegion === 'all') {
    return '전체 산지';
  }
  const match = state.wines.find((wine) => wine.region === state.activeRegion);
  return match ? match.regionLabel : '전체 산지';
}

function bindWineCardEvents() {
  document.querySelectorAll('[data-wine-detail]').forEach((button) => {
    button.addEventListener('click', () => {
      openWineModal(button.dataset.wineDetail);
    });
  });

  document.querySelectorAll('[data-wine-reserve]').forEach((button) => {
    const wineId = button.dataset.wineReserve;
    if (wineId === 'w-103') {
      // INTENTIONAL GUI BUG: site072-bug03
      // CSV Error: 상담 예약 버튼 무반응
      // Type: consultation-reserve-button-no-response
      // Description: 특정 상품의 상담 예약 버튼에 click listener를 연결하지 않아 예약 요약이 변경되지 않음.
      button.setAttribute('data-bug-id', 'site072-bug03');
      return;
    }

    button.addEventListener('click', () => {
      reserveWine(wineId);
    });
  });
}

function openWineModal(wineId) {
  const wine = state.wines.find((item) => item.id === wineId);
  if (!wine) {
    return;
  }

  els.modalContent.innerHTML = `
    <div class="modal-detail">
      <img src="${wine.image}" alt="${wine.name} 병 이미지">
      <div>
        <p class="eyebrow">${wine.typeLabel} · ${wine.regionLabel}</p>
        <h2 id="modalTitle">${wine.name}</h2>
        <p>${wine.vintage} 빈티지 · ${wine.priceBand} 셀렉션</p>
        <p>${wine.pairingLong}</p>
        <p><strong>상담 포인트:</strong> ${wine.consultation}</p>
      </div>
    </div>
  `;
  els.modal.classList.remove('hidden');
}

function closeWineModal() {
  els.modal.classList.add('hidden');
}

function reserveWine(wineId) {
  const wine = state.wines.find((item) => item.id === wineId);
  if (!wine) {
    return;
  }
  state.selectedWine = wine;
  els.selectedWineBox.classList.remove('empty');
  els.selectedWineBox.innerHTML = `
    <strong>${wine.name}</strong>
    <p>${wine.typeLabel} · ${wine.regionLabel} · ${wine.vintage}</p>
    <p>${wine.consultation}</p>
  `;
}

function renderPairings() {
  els.pairingTabs.innerHTML = '';
  state.pairings.forEach((pairing) => {
    const tab = document.createElement('button');
    tab.className = `pairing-tab${pairing.id === state.activePairingId ? ' active' : ''}`;
    tab.type = 'button';
    tab.role = 'tab';
    tab.textContent = pairing.category;
    tab.setAttribute('aria-selected', String(pairing.id === state.activePairingId));
    tab.addEventListener('click', () => {
      state.activePairingId = pairing.id;
      renderPairings();
    });
    els.pairingTabs.appendChild(tab);
  });

  const selected = state.pairings.find((pairing) => pairing.id === state.activePairingId);
  if (selected) {
    els.pairingPanel.innerHTML = `
      <p class="eyebrow">${selected.recommendedType} Recommended</p>
      <h3>${selected.category} 페어링</h3>
      <p>${selected.description}</p>
      <button class="secondary-button" type="button" data-action="pairing-consult">페어링 상담 준비중입니다</button>
    `;
  }
}

function setActiveType(type) {
  state.activeType = type;
  document.querySelectorAll('[data-filter-type]').forEach((button) => {
    button.classList.toggle('active', button.dataset.filterType === type);
  });
  renderWines();
}

function resetFilters() {
  state.activeType = 'all';
  state.activeRegion = 'all';
  state.activePrice = 'all';
  els.regionFilter.value = 'all';
  els.priceFilter.value = 'all';
  document.querySelectorAll('[data-filter-type]').forEach((button) => {
    button.classList.toggle('active', button.dataset.filterType === 'all');
  });
  renderWines();
}

function alertPreparing() {
  alert('준비중입니다.');
}

function bindGlobalEvents() {
  document.querySelectorAll('[data-filter-type]').forEach((button) => {
    button.addEventListener('click', () => setActiveType(button.dataset.filterType));
  });

  els.regionFilter.addEventListener('change', (event) => {
    state.activeRegion = event.target.value;
    renderWines();
  });

  els.priceFilter.addEventListener('change', (event) => {
    state.activePrice = event.target.value;
    renderWines();
  });

  els.resetFilters.addEventListener('click', resetFilters);

  els.toggleConsultation.addEventListener('click', () => {
    const isCollapsed = els.consultationBody.classList.toggle('collapsed');
    els.toggleConsultation.textContent = isCollapsed ? '상담 요약 펼치기' : '상담 요약 접기';
    els.toggleConsultation.setAttribute('aria-expanded', String(!isCollapsed));
  });

  els.mockSubmit.addEventListener('click', () => {
    alert('준비중입니다.');
  });

  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', closeWineModal);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeWineModal();
    }
  });

  document.querySelectorAll('[data-scroll-target]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelector(button.dataset.scrollTarget)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-action]');
    if (actionButton) {
      alertPreparing();
    }
  });
}

bindGlobalEvents();
loadWines();
loadPairings();
