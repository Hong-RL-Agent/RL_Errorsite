document.addEventListener('DOMContentLoaded', () => {
  let concerts = [];
  let currentGenre = 'all';
  let selectedConcertId = null;

  const concertGrid = document.getElementById('concert-grid');
  const alertList = document.getElementById('alert-list');
  const concertSearch = document.getElementById('concert-search');
  const genreTabs = document.querySelectorAll('.filter-tab');
  
  const navHome = document.getElementById('nav-home');
  const navAlerts = document.getElementById('nav-alerts');
  
  const homeView = document.getElementById('home-view');
  const alertsView = document.getElementById('alerts-view');

  const concertModal = document.getElementById('concert-modal');
  const alertModal = document.getElementById('alert-modal');
  const alertDetailBody = document.getElementById('alert-detail-body');
  const closeBtns = document.querySelectorAll('.close');
  const setAlertBtn = document.getElementById('set-alert-btn');
  const checkSeatsBtn = document.getElementById('check-seats-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchConcerts();
  }

  function fetchConcerts() {
    fetch('/api/concerts')
      .then(res => res.json())
      .then(data => {
        concerts = data;
        renderConcerts();
      });
  }

  function renderConcerts() {
    concertGrid.innerHTML = '';
    const term = concertSearch.value.toLowerCase();
    
    let filtered = concerts.filter(c => 
      (currentGenre === 'all' || c.genre === currentGenre) &&
      (c.artist.toLowerCase().includes(term) || c.title.toLowerCase().includes(term))
    );

    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'concert-card';
      card.innerHTML = `
        <span class="artist">${c.artist}</span>
        <h3>${c.title}</h3>
        <div class="meta">
          <span>🗓️ ${c.date}</span>
          <span>📍 ${c.venue}</span>
        </div>
      `;
      card.onclick = () => openConcertModal(c.id);
      concertGrid.appendChild(card);
    });
  }

  function openConcertModal(id) {
    selectedConcertId = id;
    const concert = concerts.find(c => c.id === id);
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
      <span class="artist" style="font-size:1rem; letter-spacing:4px;">${concert.artist}</span>
      <h2 style="font-size:2.5rem; font-weight:800; margin-top:10px;">${concert.title}</h2>
      <div class="mt-4" style="background:rgba(255,255,255,0.03); padding:25px; border-radius:20px;">
        <p><strong>장르:</strong> ${concert.genre}</p>
        <p class="mt-2"><strong>일시:</strong> ${concert.date} 20:00</p>
        <p class="mt-2"><strong>장소:</strong> ${concert.venue}</p>
      </div>
      <div id="seat-status-area" class="mt-4" style="display:none; color:var(--neon); font-weight:700;">
        <p>현시각 예매 가능 좌석: <span id="available-count">...</span> / 50,000</p>
      </div>
    `;
    concertModal.style.display = 'block';
  }

  // 실시간 좌석 확인 (Bug 02: 캐시로 인해 오래된 데이터 반환)
  checkSeatsBtn.onclick = () => {
    fetch(`/api/concerts/${selectedConcertId}/seats`)
      .then(res => res.json())
      .then(data => {
        document.getElementById('seat-status-area').style.display = 'block';
        document.getElementById('available-count').innerText = data.available;
        showToast('실시간 예매 현황이 업데이트되었습니다.');
      });
  };

  // 알림 등록 (Bug 01: 중복 등록 가능)
  setAlertBtn.onclick = () => {
    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concertId: selectedConcertId, userId: 'user_A', type: 'Email' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('티켓 오픈 알림이 성공적으로 등록되었습니다!');
        concertModal.style.display = 'none';
        fetchAlerts();
      }
    });
  };

  function fetchAlerts() {
    // 실제 서버 API는 아니지만 IDOR 테스트를 위해 샘플 렌더링
    alertList.innerHTML = `
      <div class="concert-card" style="border-left:4px solid var(--neon);">
        <span class="artist">Alert Active</span>
        <h3>나의 알림 설정</h3>
        <p class="text-sm text-muted">선택하신 공연의 티켓 오픈 시 알림을 보내드립니다.</p>
        <button class="btn-outline mt-3" style="padding:8px 15px; font-size:0.8rem;" onclick="window.openAlertDetail('al-1')">설정 상세 보기</button>
      </div>
    `;
  }

  // 알림 상세 조회 (Bug 03: IDOR 취약점 테스트용)
  window.openAlertDetail = (id) => {
    alertDetailBody.innerHTML = '<p>불러오는 중...</p>';
    alertModal.style.display = 'block';

    fetch(`/api/alerts/${id}`)
      .then(res => res.json())
      .then(data => {
        const concert = concerts.find(c => c.id === data.concertId) || { title: 'Unknown Concert' };
        alertDetailBody.innerHTML = `
          <h2 style="color:var(--neon); font-family:'Syncopate';">ALERT INFO</h2>
          <div class="mt-4" style="background:rgba(255,255,255,0.05); padding:20px; border-radius:20px;">
            <p><strong>공연명:</strong> ${concert.title}</p>
            <p class="mt-2"><strong>알림 방식:</strong> ${data.type}</p>
            <p class="mt-2"><strong>상태:</strong> ${data.status}</p>
            <p class="mt-2"><strong>작성자 ID:</strong> ${data.userId}</p>
          </div>
          <p class="mt-4 text-xs text-muted">※ 개인 정보 보호를 위해 알림 설정은 본인만 확인할 수 있습니다.</p>
        `;
      });
  };

  concertSearch.oninput = () => renderConcerts();

  genreTabs.forEach(tab => {
    tab.onclick = () => {
      genreTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentGenre = tab.dataset.genre;
      renderConcerts();
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navAlerts].forEach(b => b.classList.remove('active'));
    [homeView, alertsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navAlerts.onclick = () => { switchTab(navAlerts, alertsView); fetchAlerts(); };

  closeBtns.forEach(btn => {
    btn.onclick = () => {
      concertModal.style.display = 'none';
      alertModal.style.display = 'none';
    };
  });

  window.onclick = (e) => {
    if (e.target == concertModal) concertModal.style.display = 'none';
    if (e.target == alertModal) alertModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
