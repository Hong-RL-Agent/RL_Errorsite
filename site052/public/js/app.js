document.addEventListener('DOMContentLoaded', () => {
  let cars = [];
  let currentSort = 'default';
  let currentMinYear = 0;

  const carGrid = document.getElementById('car-grid');
  const carSearch = document.getElementById('car-search');
  const yearFilter = document.getElementById('year-filter');
  const priceSort = document.getElementById('price-sort');
  
  const navHome = document.getElementById('nav-home');
  const navNotes = document.getElementById('nav-notes');
  
  const homeView = document.getElementById('home-view');
  const notesView = document.getElementById('notes-view');

  const noteListEl = document.getElementById('note-list');
  const carModal = document.getElementById('car-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  
  const noteModal = document.getElementById('note-modal');
  const noteBody = document.getElementById('note-body');
  const closeNoteBtn = document.querySelector('.close-note');

  const toast = document.getElementById('toast');

  function init() {
    fetchCars();
  }

  // 차량 조회 (Bug 01: 문자열 정렬, Bug 02: 필터 무시)
  function fetchCars() {
    const url = `/api/cars?sort=${currentSort}&minYear=${currentMinYear}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        cars = data;
        renderCars();
      });
  }

  function renderCars() {
    carGrid.innerHTML = '';
    const term = carSearch.value.toLowerCase();
    
    // 클라이언트 사이드 검색 (서버 필터 Bug 02 확인을 위해 연식 필터는 여기서 하지 않음)
    let filtered = cars.filter(c => c.model.toLowerCase().includes(term));

    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'car-card';
      card.innerHTML = `
        <div class="car-img">🏎️</div>
        <div class="car-body">
          <h3>${c.model}</h3>
          <p class="car-price">₩${c.price.toLocaleString()} 만원</p>
          <div class="car-meta">
            <span>${c.year}년식</span>
            <span>${c.milage.toLocaleString()}km</span>
            <span>${c.color}</span>
          </div>
        </div>
      `;
      card.onclick = () => openCarModal(c);
      carGrid.appendChild(card);
    });
  }

  function openCarModal(car) {
    modalBody.innerHTML = `
      <div style="font-family:Cinzel; color:var(--accent); font-weight:800; font-size:0.8rem; letter-spacing:2px;">VEHICLE SPECIFICATIONS</div>
      <h2 class="mt-2" style="font-family:Cinzel; font-size:2.5rem;">${car.model}</h2>
      <div class="mt-4 p-5" style="background:var(--black); border:1px solid var(--grey);">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; font-size:0.9rem;">
          <p><strong>연식:</strong> ${car.year}년</p>
          <p><strong>주행거리:</strong> ${car.milage.toLocaleString()}km</p>
          <p><strong>색상:</strong> ${car.color}</p>
          <p><strong>판매가:</strong> ₩${car.price.toLocaleString()} 만원</p>
        </div>
        <div class="mt-4 pt-4" style="border-top:1px solid var(--grey);">
          <p class="text-sm text-muted">무사고 보장차량이며, 최근 모든 소모품 교체가 완료되었습니다. 프리미엄 광택 서비스가 포함된 최상급 매물입니다.</p>
        </div>
      </div>
    `;
    carModal.style.display = 'block';
  }

  function fetchMyNotes() {
    fetch('/api/notes/user/user_A')
      .then(res => res.json())
      .then(data => {
        noteListEl.innerHTML = '';
        if (data.length === 0) {
          noteListEl.innerHTML = '<p class="text-muted p-5 text-center">작성된 메모가 없습니다.</p>';
          return;
        }
        data.forEach(n => {
          const car = cars.find(c => c.id === n.carId) || { model: '차량' };
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong style="font-family:Cinzel; font-size:1.2rem;">${car.model}</strong>
              <p class="text-sm text-muted">최종 수정일: ${n.date}</p>
            </div>
            <button class="btn-silver" style="padding:10px 25px; font-size:0.8rem;" onclick="viewNoteDetail('${n.id}')">메모 보기</button>
          `;
          noteListEl.appendChild(div);
        });
      });
  }

  // 개인 메모 상세 조회 (Bug 03: IDOR 취약점 테스트용)
  window.viewNoteDetail = (id) => {
    noteBody.innerHTML = '<p>불러오는 중...</p>';
    noteModal.style.display = 'block';
    fetch(`/api/notes/${id}`)
      .then(res => res.json())
      .then(data => {
        const car = cars.find(c => c.id === data.carId) || { model: '비공개 차량' };
        noteBody.innerHTML = `
          <h2 style="font-family:Cinzel; color:var(--accent);">${car.model} 메모</h2>
          <div class="mt-4 p-5" style="background:var(--black); border:1px solid var(--grey);">
            <p class="font-bold">작성자 ID: ${data.userId}</p>
            <p class="mt-4" style="line-height:1.8; font-style:italic; color:var(--silver); border-left:4px solid var(--accent); padding-left:15px;">
              "${data.content}"
            </p>
          </div>
          <p class="mt-4 text-xs text-muted">메모 고유 번호: ${data.id}</p>
        `;
      });
  };

  carSearch.oninput = () => renderCars();
  yearFilter.onchange = (e) => {
    currentMinYear = e.target.value;
    fetchCars();
  };
  priceSort.onchange = (e) => {
    currentSort = e.target.value;
    fetchCars();
  };

  function switchTab(btn, view) {
    [navHome, navNotes].forEach(b => b.classList.remove('active'));
    [homeView, notesView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === notesView) fetchMyNotes();
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navNotes.onclick = () => switchTab(navNotes, notesView);

  closeBtn.onclick = () => carModal.style.display = 'none';
  closeNoteBtn.onclick = () => noteModal.style.display = 'none';
  window.onclick = (e) => {
    if (e.target == carModal) carModal.style.display = 'none';
    if (e.target == noteModal) noteModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
