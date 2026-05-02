document.addEventListener('DOMContentLoaded', () => {
  let places = [];
  let routes = [{ id: 'route-1', name: '서울 역사 산책', region: '서울', theme: 'History' }];
  let currentRegion = 'all';

  const routeGrid = document.getElementById('route-grid');
  const placeGrid = document.getElementById('place-grid');
  const placeSearch = document.getElementById('place-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  const navHome = document.getElementById('nav-home');
  const navPlaces = document.getElementById('nav-places');
  const navMy = document.getElementById('nav-my');
  
  const homeView = document.getElementById('home-view');
  const placesView = document.getElementById('places-view');
  const myView = document.getElementById('my-view');

  const savedListEl = document.getElementById('saved-list');
  const routeModal = document.getElementById('route-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  
  const savedModal = document.getElementById('saved-modal');
  const savedBody = document.getElementById('saved-body');
  const closeSavedBtn = document.querySelector('.close-saved');

  const toast = document.getElementById('toast');

  function init() {
    renderRoutes();
    fetchPlaces();
  }

  function renderRoutes() {
    routeGrid.innerHTML = '';
    routes.forEach(r => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-img">🏯</div>
        <div class="card-body">
          <span class="tag">${r.region}</span>
          <span class="tag">${r.theme}</span>
          <h3 class="mt-2">${r.name}</h3>
          <p class="text-sm text-muted">현지 전문가가 엄선한 5성급 투어 코스</p>
        </div>
      `;
      card.onclick = () => openRouteModal(r.id);
      routeGrid.appendChild(card);
    });
  }

  // 장소 조회 (Bug 02: 특정 지역 설명 누락)
  function fetchPlaces() {
    const url = currentRegion === 'all' ? '/api/places' : `/api/places?region=${currentRegion}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        places = data;
        renderPlaces();
      });
  }

  function renderPlaces() {
    placeGrid.innerHTML = '';
    const term = placeSearch.value.toLowerCase();
    const filtered = places.filter(p => p.name.toLowerCase().includes(term));

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-img">📍</div>
        <div class="card-body">
          <span class="tag">${p.region}</span>
          <h3>${p.name}</h3>
          <p class="text-sm text-muted mt-2">${p.description || '상세 정보 준비 중...'}</p>
        </div>
      `;
      placeGrid.appendChild(card);
    });
  }

  // 코스 상세 조회 (Bug 01: 방문 순환 꼬임)
  function openRouteModal(id) {
    fetch(`/api/routes/${id}`)
      .then(res => res.json())
      .then(route => {
        modalBody.innerHTML = `
          <h2 style="font-family:Montserrat;">${route.name}</h2>
          <p class="text-blue font-bold mt-1">오늘의 추천 코스 동선</p>
          <div class="timeline mt-5">
            ${route.stops.map(s => `
              <div class="timeline-item">
                <div class="font-bold">${s.placeId === 'pl-1' ? '경복궁' : s.placeId}</div>
                <div class="text-xs text-muted">방문 순서: ${s.stopOrder}</div>
              </div>
            `).join('')}
          </div>
          <button class="btn-invite w-full mt-4" onclick="saveRoute('${route.id}')">이 코스 저장하기</button>
        `;
        routeModal.style.display = 'block';
      });
  }

  window.saveRoute = (id) => {
    showToast('나의 여행 코스에 저장되었습니다.');
    routeModal.style.display = 'none';
  };

  function fetchMySaved() {
    fetch('/api/saved-routes/user/user_A')
      .then(res => res.json())
      .then(data => {
        savedListEl.innerHTML = '';
        if (data.length === 0) {
          savedListEl.innerHTML = '<p class="text-muted p-5 text-center">저장된 코스가 없습니다.</p>';
          return;
        }
        data.forEach(s => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong>${s.routeName}</strong>
              <p class="text-sm text-muted">${s.places.join(' → ')}</p>
            </div>
            <button class="btn-invite" onclick="viewSavedDetail('${s.id}')">보기</button>
          `;
          savedListEl.appendChild(div);
        });
      });
  }

  // 저장 코스 상세 조회 (Bug 03: IDOR 취약점 테스트용)
  window.viewSavedDetail = (id) => {
    savedBody.innerHTML = '<p>불러오는 중...</p>';
    savedModal.style.display = 'block';
    fetch(`/api/saved-routes/${id}`)
      .then(res => res.json())
      .then(data => {
        savedBody.innerHTML = `
          <h2 style="color:var(--blue);">${data.routeName}</h2>
          <div class="mt-4 p-5" style="background:var(--bg); border-radius:15px;">
            <p><strong>소유자 ID:</strong> ${data.userId}</p>
            <p class="mt-2"><strong>포함된 장소:</strong></p>
            <ul class="mt-2 text-sm" style="padding-left:20px;">
              ${data.places.map(p => `<li>${p}</li>`).join('')}
            </ul>
            <p class="mt-4 text-xs text-muted">※ 이 일정은 ${data.isPrivate ? '비공개' : '공개'} 설정되어 있습니다.</p>
          </div>
        `;
      });
  };

  placeSearch.oninput = () => renderPlaces();
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentRegion = btn.dataset.region;
      fetchPlaces();
    };
  });

  function switchTab(btn, view) {
    [navHome, navPlaces, navMy].forEach(b => b.classList.remove('active'));
    [homeView, placesView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === placesView) fetchPlaces();
    if (view === myView) fetchMySaved();
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navPlaces.onclick = () => switchTab(navPlaces, placesView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => routeModal.style.display = 'none';
  closeSavedBtn.onclick = () => savedModal.style.display = 'none';
  window.onclick = (e) => {
    if (e.target == routeModal) routeModal.style.display = 'none';
    if (e.target == savedModal) savedModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
