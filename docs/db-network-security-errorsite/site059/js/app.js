document.addEventListener('DOMContentLoaded', () => {
  let games = [];
  let currentGenre = 'All';
  let activeGameId = null;

  const gameGrid = document.getElementById('game-grid');
  const upcomingList = document.getElementById('upcoming-list');
  const favGrid = document.getElementById('fav-grid');
  const gameSearch = document.getElementById('game-search');
  const genreFilter = document.getElementById('genre-filter');
  
  const navDiscover = document.getElementById('nav-discover');
  const navUpcoming = document.getElementById('nav-upcoming');
  const navFav = document.getElementById('nav-fav');
  
  const discoverView = document.getElementById('discover-view');
  const upcomingView = document.getElementById('upcoming-view');
  const favView = document.getElementById('fav-view');

  const gameModal = document.getElementById('game-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const favBtn = document.getElementById('fav-btn');

  const toast = document.getElementById('toast');

  function init() {
    fetchGames();
  }

  // 게임 목록 조회 (Bug 01: 평점에 삭제된 리뷰 포함)
  function fetchGames() {
    fetch(`/api/games?genre=${currentGenre}`)
      .then(res => res.json())
      .then(data => {
        games = data;
        renderGames();
      });
  }

  function renderGames() {
    gameGrid.innerHTML = '';
    const term = gameSearch.value.toLowerCase();
    const filtered = games.filter(g => g.title.toLowerCase().includes(term));

    filtered.forEach(g => {
      const card = document.createElement('div');
      card.className = 'game-card';
      card.innerHTML = `
        <div class="card-img">🎮</div>
        <div class="card-body">
          <span class="genre">${g.genre}</span>
          <h3>${g.title}</h3>
          <div class="rating">⭐ ${g.rating} <span class="text-xs text-muted">(${g.reviews} reviews)</span></div>
        </div>
      `;
      card.onclick = () => openGameModal(g);
      gameGrid.appendChild(card);
    });
  }

  function openGameModal(game) {
    activeGameId = game.id;
    modalBody.innerHTML = `
      <div style="font-family:Press Start 2P; color:var(--yellow); font-size:0.7rem; margin-bottom:15px;">GAME INFO</div>
      <h2 style="font-family:Rajdhani; font-size:3rem; line-height:1;">${game.title}</h2>
      <div class="mt-4 p-5" style="background:var(--black); border:1px solid var(--purple-dark);">
        <p><strong>장르:</strong> ${game.genre}</p>
        <p><strong>평점:</strong> ⭐ ${game.rating}</p>
        <p class="mt-4" style="color:var(--text-muted); line-height:1.8;">
          인디 개발자의 열정이 담긴 독특한 메커니즘과 아트 스타일을 경험해 보세요. 수많은 커뮤니티 플레이어들이 추천하는 올해의 기대작입니다.
        </p>
      </div>
    `;
    gameModal.style.display = 'block';
  }

  // 출시 예정 조회 (Bug 02: 일부 게임의 출시일 필드 누락)
  function fetchUpcoming() {
    fetch('/api/games/upcoming')
      .then(res => res.json())
      .then(data => {
        upcomingList.innerHTML = '';
        data.forEach(g => {
          const card = document.createElement('div');
          card.className = 'game-card';
          // Bug 02: g.releaseDate가 없는 경우를 대비한 방어 로직이 없음
          const dateStr = g.releaseDate || 'TBA'; 
          card.innerHTML = `
            <div class="card-img">📅</div>
            <div class="card-body">
              <span class="genre">UPCOMING</span>
              <h3>${g.title}</h3>
              <p class="text-sm text-yellow">출시 예정일: ${dateStr}</p>
            </div>
          `;
          upcomingList.appendChild(card);
        });
      });
  }

  // 찜하기 처리 (Bug 03: userId 조작 취약점)
  favBtn.onclick = () => {
    if (!activeGameId) return;
    
    // 정상 시나리오: 현재 유저 ID 'user_A'를 보내야 함
    // Bug 03 테스트를 위해 서버가 body의 userId를 검증하지 않는지 확인
    fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user_A', gameId: activeGameId })
    })
    .then(res => res.json())
    .then(data => {
      showToast('찜 목록에 추가되었습니다!');
      gameModal.style.display = 'none';
    });
  };

  function fetchFavorites() {
    fetch('/api/favorites/user_A')
      .then(res => res.json())
      .then(data => {
        favGrid.innerHTML = '';
        if (data.length === 0) {
          favGrid.innerHTML = '<p class="text-muted p-5 text-center">찜한 게임이 없습니다.</p>';
          return;
        }
        data.forEach(g => {
          const card = document.createElement('div');
          card.className = 'game-card';
          card.innerHTML = `
            <div class="card-img">💖</div>
            <div class="card-body">
              <span class="genre">${g.genre}</span>
              <h3>${g.title}</h3>
            </div>
          `;
          favGrid.appendChild(card);
        });
      });
  }

  gameSearch.oninput = () => renderGames();
  genreFilter.onchange = (e) => {
    currentGenre = e.target.value;
    fetchGames();
  };

  function switchTab(btn, view) {
    [navDiscover, navUpcoming, navFav].forEach(b => b.classList.remove('active'));
    [discoverView, upcomingView, favView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === upcomingView) fetchUpcoming();
    if (view === favView) fetchFavorites();
  }

  navDiscover.onclick = () => switchTab(navDiscover, discoverView);
  navUpcoming.onclick = () => switchTab(navUpcoming, upcomingView);
  navFav.onclick = () => switchTab(navFav, favView);

  closeBtn.onclick = () => gameModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == gameModal) gameModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
