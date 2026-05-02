document.addEventListener('DOMContentLoaded', () => {
  let parkingLots = [];
  let currentSort = 'default';
  let selectedLotId = null;

  const lotGrid = document.getElementById('lot-grid');
  const lotCountEl = document.getElementById('lot-count');
  const areaSearchInput = document.getElementById('area-search');
  const searchBtn = document.getElementById('search-btn');
  const sortChips = document.querySelectorAll('.filter-chip');
  
  const navFind = document.getElementById('nav-find');
  const navMy = document.getElementById('nav-my');
  const findView = document.getElementById('find-view');
  const myView = document.getElementById('my-view');

  const reservationListEl = document.getElementById('reservation-list');
  const testIdorBtn = document.getElementById('test-idor-btn');
  
  const modal = document.getElementById('reserve-modal');
  const closeBtn = document.querySelector('.close');
  const reserveForm = document.getElementById('reserve-form');
  const submitReserveBtn = document.getElementById('submit-reserve-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchParkingLots();
  }

  function fetchParkingLots(query = '') {
    const url = `/api/parking-lots?${query ? `query=${encodeURIComponent(query)}&` : ''}sort=${currentSort}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        parkingLots = data;
        renderLots(data);
        lotCountEl.innerText = `${data.length}개 발견`;
      });
  }

  function renderLots(data) {
    lotGrid.innerHTML = '';
    data.forEach(lot => {
      const card = document.createElement('div');
      card.className = 'lot-card';
      card.innerHTML = `
        <div class="lot-header">
          <h4>${lot.name}</h4>
          <p class="lot-addr">${lot.address}</p>
        </div>
        <div class="lot-footer">
          <span class="price-tag">${lot.price.toLocaleString()}원/시간</span>
          <span class="slots-tag">잔여 ${lot.slots}석</span>
        </div>
      `;
      card.onclick = () => openReserveModal(lot);
      lotGrid.appendChild(card);
    });
  }

  function openReserveModal(lot) {
    selectedLotId = lot.id;
    document.getElementById('modal-lot-name').innerText = lot.name;
    document.getElementById('modal-lot-addr').innerText = lot.address;
    modal.style.display = 'block';
  }

  // 예약 신청 (Bug 02: 지연 발생)
  reserveForm.onsubmit = (e) => {
    e.preventDefault();
    const carNum = document.getElementById('car-num').value;
    const time = document.getElementById('reserve-time').value;

    submitReserveBtn.disabled = true;
    submitReserveBtn.innerText = '예약 처리 중... (5초 지연)';
    showToast('예약 요청을 전송했습니다. 잠시만 기다려 주세요.');

    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lotId: selectedLotId, user: '홍길동', carNum, time })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('주차 예약이 완료되었습니다!');
        modal.style.display = 'none';
        reserveForm.reset();
        fetchReservations();
      }
    })
    .finally(() => {
      submitReserveBtn.disabled = false;
      submitReserveBtn.innerText = '예약하기 (지연 발생)';
    });
  };

  function fetchReservations() {
    // 실제로는 전체 조회가 아니라 내 예약을 가져와야 함 (간략화)
    fetch('/api/reservations/res-101') 
      .then(res => res.json())
      .then(resData => {
        renderReservations([resData]);
      });
  }

  function renderReservations(data) {
    reservationListEl.innerHTML = '';
    data.forEach(res => {
      const lot = parkingLots.find(l => l.id === res.lotId) || { name: '알 수 없는 주차장' };
      const card = document.createElement('div');
      card.className = 'res-card';
      card.innerHTML = `
        <div class="res-info">
          <strong>${lot.name}</strong>
          <p class="text-sm mt-1">${res.carNum} | ${res.time}</p>
        </div>
        <div class="status-badge">${res.status}</div>
      `;
      reservationListEl.appendChild(card);
    });
  }

  // Bug 03: IDOR 테스트
  testIdorBtn.onclick = () => {
    const targetId = prompt('조회할 예약 ID를 입력하세요 (예: res-999)', 'res-999');
    if (targetId) {
      fetch(`/api/reservations/${targetId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) return showToast(data.error);
          
          showToast('비인가 예약 정보 조회 성공 (Bug 03)');
          reservationListEl.innerHTML = `
            <div class="res-card" style="border-color:var(--danger);">
              <div class="res-info">
                <strong>[타인] ${data.user} 님의 예약</strong>
                <p class="text-sm mt-1">${data.carNum} | ${data.time}</p>
                <p class="text-xs mt-1" style="color:red;">메모: ${data.privateNote || '없음'}</p>
              </div>
              <div class="status-badge" style="background:red; color:white;">${data.status}</div>
            </div>
          `;
        });
    }
  };

  // 검색
  searchBtn.onclick = () => {
    const query = areaSearchInput.value.trim();
    // Bug 01: 주소가 아닌 이름에서만 검색됨
    fetchParkingLots(query);
  };

  // 정렬
  sortChips.forEach(chip => {
    chip.onclick = () => {
      sortChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentSort = chip.dataset.sort;
      fetchParkingLots(areaSearchInput.value.trim());
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navFind, navMy].forEach(b => b.classList.remove('active'));
    [findView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navFind.onclick = () => switchTab(navFind, findView);
  navMy.onclick = () => { switchTab(navMy, myView); fetchReservations(); };

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
