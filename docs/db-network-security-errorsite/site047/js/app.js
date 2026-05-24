document.addEventListener('DOMContentLoaded', () => {
  let games = [];
  let tables = [];
  let currentCat = 'all';
  let activeTableId = null;

  const gameGrid = document.getElementById('game-grid');
  const gameSearch = document.getElementById('game-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  const navGames = document.getElementById('nav-games');
  const navTables = document.getElementById('nav-tables');
  const navMy = document.getElementById('nav-my');
  
  const gamesView = document.getElementById('games-view');
  const tablesView = document.getElementById('tables-view');
  const myView = document.getElementById('my-view');

  const tableGrid = document.getElementById('table-grid');
  const resListEl = document.getElementById('res-list');
  const adminDataEl = document.getElementById('admin-data');
  const resModal = document.getElementById('res-modal');
  const closeBtn = document.querySelector('.close');
  const confirmResBtn = document.getElementById('confirm-res-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchGames();
    fetchTables();
  }

  function fetchGames() {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        games = data;
        renderGames();
      });
  }

  function renderGames() {
    gameGrid.innerHTML = '';
    const term = gameSearch.value.toLowerCase();
    
    let filtered = games.filter(g => 
      (currentCat === 'all' || g.category === currentCat) &&
      (g.title.toLowerCase().includes(term))
    );

    filtered.forEach(g => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.innerHTML = `
        <div class="game-thumb">🎲</div>
        <div class="tags">
          <span class="tag">${g.players}</span>
          <span class="tag">${g.difficulty}</span>
        </div>
        <h3 class="mt-2">${g.title}</h3>
        <p class="text-sm text-muted mt-1">#${g.category}</p>
      `;
      gameGrid.appendChild(card);
    });
  }

  // 테이블 현황 조회 (Bug 02: 예약 직후에도 Available로 보이는 Stale Data 발생)
  function fetchTables() {
    fetch('/api/tables')
      .then(res => res.json())
      .then(data => {
        tables = data;
        renderTables();
      });
  }

  function renderTables() {
    tableGrid.innerHTML = '';
    tables.forEach(t => {
      const card = document.createElement('div');
      card.className = `table-card ${t.status}`;
      card.innerHTML = `
        <h3>${t.name}</h3>
        <p class="mt-2 font-bold">${t.status === 'Available' ? '예약 가능' : '이용 중'}</p>
      `;
      if (t.status === 'Available') {
        card.onclick = () => openResModal(t.id);
      }
      tableGrid.appendChild(card);
    });
  }

  function openResModal(id) {
    activeTableId = id;
    resModal.style.display = 'block';
  }

  // 예약 확정 (Bug 01: 중복 예약 허용)
  confirmResBtn.onclick = () => {
    const time = document.getElementById('res-time').value;
    const contact = document.getElementById('res-contact').value;

    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user_A', tableId: activeTableId, time, contact })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('테이블 예약이 완료되었습니다. 방문을 환영합니다!');
        resModal.style.display = 'none';
        fetchTables(); // 다시 가져오지만 Bug 02 때문에 여전히 Available일 수 있음
        switchTab(navMy, myView);
      }
    });
  };

  // 내 예약 및 전체 통계 (Bug 03: 타인의 민감 정보 노출)
  function fetchReservations() {
    fetch('/api/reservations/recent')
      .then(res => res.json())
      .then(data => {
        // 내 예약 필터링
        const myRes = data.filter(r => r.userId === 'user_A');
        resListEl.innerHTML = '';
        if (myRes.length === 0) {
          resListEl.innerHTML = '<p class="text-muted p-4">예약 내역이 없습니다.</p>';
        } else {
          myRes.forEach(r => {
            const table = tables.find(t => t.id === r.tableId) || { name: '테이블' };
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `
              <div>
                <strong>${table.name}</strong>
                <p class="text-sm text-muted">예약 시간: ${r.time}</p>
              </div>
              <span class="badge" style="background:var(--yellow); padding:5px 12px; border-radius:20px; font-size:0.8rem;">CONFIRMED</span>
            `;
            resListEl.appendChild(div);
          });
        }

        // 전체 데이터 노출 (Bug 03 시각화)
        adminDataEl.innerHTML = '<strong>[최근 예약 시스템 로그]</strong><br>';
        data.forEach(r => {
          adminDataEl.innerHTML += `<div class="mt-1 text-xs">예약ID: ${r.id} | 연락처: ${r.contact} | 테이블: ${r.tableId}</div>`;
        });
      });
  }

  gameSearch.oninput = () => renderGames();
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      renderGames();
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navGames, navTables, navMy].forEach(b => b.classList.remove('active'));
    [gamesView, tablesView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === tablesView) fetchTables();
    if (view === myView) fetchReservations();
  }

  navGames.onclick = () => switchTab(navGames, gamesView);
  navTables.onclick = () => switchTab(navTables, tablesView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => resModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == resModal) resModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
