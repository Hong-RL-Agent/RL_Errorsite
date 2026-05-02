document.addEventListener('DOMContentLoaded', () => {
  let puzzles = [];
  let currentDiff = 'all';
  let activePuzzleId = null;
  let myScore = 0;
  const userId = 'user_A';

  const puzzleGrid = document.getElementById('puzzle-grid');
  const puzzleSearch = document.getElementById('puzzle-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  const navPuzzles = document.getElementById('nav-puzzles');
  const navRanking = document.getElementById('nav-ranking');
  const navProfile = document.getElementById('nav-profile');
  
  const puzzlesView = document.getElementById('puzzles-view');
  const rankingView = document.getElementById('ranking-view');
  const profileView = document.getElementById('profile-view');

  const puzzleModal = document.getElementById('puzzle-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const submitBtn = document.getElementById('submit-btn');
  const answerInput = document.getElementById('answer-input');

  const rankingList = document.getElementById('ranking-list');
  const rankDiffFilter = document.getElementById('rank-diff-filter');

  const toast = document.getElementById('toast');

  function init() {
    fetchPuzzles();
    updateScoreUI();
  }

  function fetchPuzzles() {
    fetch('/api/puzzles')
      .then(res => res.json())
      .then(data => {
        puzzles = data;
        renderPuzzles();
      });
  }

  function renderPuzzles() {
    puzzleGrid.innerHTML = '';
    const term = puzzleSearch.value.toLowerCase();
    const filtered = puzzles.filter(p => 
      (currentDiff === 'all' || p.difficulty === currentDiff) &&
      p.title.toLowerCase().includes(term)
    );

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'puzzle-card';
      card.innerHTML = `
        <div class="card-header">
          <span class="diff-badge ${p.difficulty}">${p.difficulty}</span>
          <h3>${p.title}</h3>
        </div>
        <div class="card-body">
          <span class="text-muted">Reward</span>
          <span class="points">${p.points} LP</span>
        </div>
      `;
      card.onclick = () => openPuzzleDetail(p);
      puzzleGrid.appendChild(card);
    });
  }

  function openPuzzleDetail(puzzle) {
    activePuzzleId = puzzle.id;
    modalBody.innerHTML = `
      <div style="color:var(--neon-blue); font-family:Orbitron; font-weight:700; font-size:0.75rem; letter-spacing:2px;">MISSION START</div>
      <h2 class="mt-2" style="font-size:2.5rem; font-weight:900; line-height:1.2;">${puzzle.title}</h2>
      <div class="mt-4 p-5" style="background:#000; border-radius:12px; border:1px dashed var(--border);">
        <p><strong>난이도:</strong> ${puzzle.difficulty}</p>
        <p class="mt-1"><strong>획득 가능 점수:</strong> ${puzzle.points} LP</p>
      </div>
      <p class="mt-4 text-sm text-muted" style="line-height:1.8;">
        주어진 데이터를 분석하여 숨겨진 패턴을 찾아내세요. 
        정답을 입력하면 실시간 글로벌 랭킹에 즉시 반영됩니다.
      </p>
    `;
    answerInput.value = '';
    puzzleModal.style.display = 'block';
  }

  // 정답 제출 (Bug 01: 중복 제출 허용, Bug 03: 점수 조작 취약점)
  submitBtn.onclick = () => {
    const answer = answerInput.value;
    if (!answer) return showToast('정답을 입력해야 합니다.');

    const puzzle = puzzles.find(p => p.id === activePuzzleId);
    
    // INTENTIONAL BUG: site070-bug03 (Security Parameter Tampering)
    // 클라이언트에서 score를 임의로 설정해서 보낼 수 있음. (서버가 검증 없이 받음)
    const payload = {
      userId,
      puzzleId: activePuzzleId,
      score: puzzle.points // 개발자 도구에서 이 값을 99999로 바꿔서 보내면 랭킹 1위가 됨
    };

    fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      showToast(data.message);
      myScore += payload.score;
      updateScoreUI();
      puzzleModal.style.display = 'none';
      if (rankingView.style.display !== 'none') fetchRanking();
    });
  };

  // 랭킹 조회 (Bug 02: 특정 난이도에서 지연/타임아웃 발생)
  function fetchRanking() {
    const diff = rankDiffFilter.value;
    rankingList.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:3rem; color:var(--neon-blue);">글로벌 데이터 동기화 중...</td></tr>';
    
    fetch(`/api/ranking?difficulty=${diff}`)
      .then(res => res.json())
      .then(data => {
        renderRanking(data);
      })
      .catch(err => {
        rankingList.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:3rem; color:var(--danger);">데이터 로드 실패 (TIMEOUT)</td></tr>';
      });
  }

  function renderRanking(data) {
    rankingList.innerHTML = '';
    data.forEach((u, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family:Orbitron; font-weight:700;">#${index + 1}</td>
        <td>${u.userId === userId ? '<strong>YOU (Reader_A)</strong>' : u.userId}</td>
        <td>${u.solvedCount} Solved</td>
        <td style="color:var(--neon-blue); font-weight:700;">${u.totalScore.toLocaleString()} LP</td>
      `;
      rankingList.appendChild(tr);
    });
  }

  function fetchBadges() {
    fetch('/api/badges')
      .then(res => res.json())
      .then(data => {
        const badgeList = document.getElementById('badge-list');
        badgeList.innerHTML = '';
        data.forEach(b => {
          const card = document.createElement('div');
          card.className = 'badge-card';
          card.innerHTML = `
            <span class="badge-icon">${b.icon}</span>
            <p class="badge-name">${b.name}</p>
          `;
          badgeList.appendChild(card);
        });
      });
  }

  function updateScoreUI() {
    document.getElementById('my-total-score').innerText = myScore.toLocaleString();
  }

  puzzleSearch.oninput = () => renderPuzzles();

  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDiff = btn.getAttribute('data-diff');
      renderPuzzles();
    };
  });

  rankDiffFilter.onchange = () => fetchRanking();

  function switchTab(btn, view) {
    [navPuzzles, navRanking, navProfile].forEach(b => b.classList.remove('active'));
    [puzzlesView, rankingView, profileView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === rankingView) fetchRanking();
    if (view === profileView) fetchBadges();
  }

  navPuzzles.onclick = () => switchTab(navPuzzles, puzzlesView);
  navRanking.onclick = () => switchTab(navRanking, rankingView);
  navProfile.onclick = () => switchTab(navProfile, profileView);

  closeBtn.onclick = () => puzzleModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == puzzleModal) puzzleModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
