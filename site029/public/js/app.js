document.addEventListener('DOMContentLoaded', () => {
  let stations = [];
  let currentSort = 'default';
  let selectedStationId = null;

  const stationGrid = document.getElementById('station-grid');
  const stationSearchInput = document.getElementById('station-search');
  const searchBtn = document.getElementById('search-btn');
  const sortBtns = document.querySelectorAll('.sort-btn');
  
  const navMap = document.getElementById('nav-map');
  const navFav = document.getElementById('nav-fav');
  const navHistory = document.getElementById('nav-history');
  
  const mapView = document.getElementById('map-view');
  const favView = document.getElementById('fav-view');
  const historyView = document.getElementById('history-view');

  const historyListEl = document.getElementById('history-list');
  
  const modal = document.getElementById('station-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const rentBikeBtn = document.getElementById('rent-bike-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchStations();
  }

  function fetchStations() {
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => {
        stations = data;
        renderStations();
      });
  }

  function renderStations() {
    stationGrid.innerHTML = '';
    const term = stationSearchInput.value.toLowerCase();
    let filtered = stations.filter(s => 
      s.name.toLowerCase().includes(term) || s.location.toLowerCase().includes(term)
    );

    if (currentSort === 'bikes') {
      filtered.sort((a, b) => b.availableBikes - a.availableBikes);
    }

    filtered.forEach(s => {
      const card = document.createElement('div');
      card.className = 'station-card';
      card.innerHTML = `
        <h4>${s.name}</h4>
        <p class="loc">${s.location}</p>
        <div class="station-footer">
          <span class="bike-count">${s.availableBikes}대 대여 가능</span>
          <span class="slot-info">${s.availableBikes}/${s.totalSlots}</span>
        </div>
      `;
      card.onclick = () => openStationModal(s.id);
      stationGrid.appendChild(card);
    });
  }

  function openStationModal(id) {
    selectedStationId = id;
    modalBody.innerHTML = '<p>불러오는 중...</p>';
    modal.style.display = 'block';

    // Bug 02: 특정 대여소(st-2) 조회 시 malformed JSON 응답
    fetch(`/api/stations/${id}`)
      .then(async res => {
        // res.json()에서 에러가 날 수 있음
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          modalBody.innerHTML = `
            <h2>${data.name}</h2>
            <p class="mt-2 text-muted">📍 ${data.location}</p>
            <div class="mt-4" style="background:#F8FAFC; padding:20px; border-radius:12px;">
              <p>대여 가능한 자전거: <strong style="color:var(--green);">${data.availableBikes}대</strong></p>
              <p class="mt-1">거치대 현황: ${data.availableBikes}/${data.totalSlots}</p>
            </div>
            <p class="mt-4 text-xs text-muted">※ 1시간 이내 반납 시 무료 (기본 요금 포함 시)</p>
          `;
        } catch (e) {
          // Bug 02 파싱 에러 발생 시 처리
          modalBody.innerHTML = `
            <p style="color:red; font-weight:700;">데이터 형식이 올바르지 않아 정보를 표시할 수 없습니다.</p>
            <p class="text-xs text-muted mt-2">시스템 관리자에게 문의해 주세요.</p>
          `;
          console.error('JSON Parsing Error:', e);
        }
      });
  }

  // 자전거 대여 (Bug 01: 수량 차감 안됨, Bug 03: 인증 패스)
  rentBikeBtn.onclick = () => {
    fetch('/api/rentals', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
        // Bug 03: Authorization 헤더를 일부러 누락시켜도 서버가 통과시킴
      },
      body: JSON.stringify({ stationId: selectedStationId, userId: 'guest_user' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('자전거 대여가 시작되었습니다. 안전운행 하세요!');
        modal.style.display = 'none';
        // Bug 01: 서버에서 수량을 줄이지 않아 fetchStations 후에도 수량이 그대로임
        fetchStations();
      } else {
        showToast(data.error || '대여에 실패했습니다.');
      }
    });
  };

  function fetchHistory() {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        historyListEl.innerHTML = '';
        data.forEach(h => {
          const div = document.createElement('div');
          div.className = 'history-item';
          div.innerHTML = `
            <div>
              <strong>${h.stationName}</strong>
              <p class="text-xs text-muted">${h.startTime} (${h.duration})</p>
            </div>
            <div style="font-weight:700;">${h.cost.toLocaleString()}원</div>
          `;
          historyListEl.appendChild(div);
        });
      });
  }

  searchBtn.onclick = () => renderStations();
  stationSearchInput.onkeypress = (e) => { if(e.key === 'Enter') renderStations(); };

  sortBtns.forEach(btn => {
    btn.onclick = () => {
      sortBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSort = btn.dataset.sort;
      renderStations();
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navMap, navFav, navHistory].forEach(b => b.classList.remove('active'));
    [mapView, favView, historyView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navMap.onclick = () => switchTab(navMap, mapView);
  navFav.onclick = () => switchTab(navFav, favView);
  navHistory.onclick = () => { switchTab(navHistory, historyView); fetchHistory(); };

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
