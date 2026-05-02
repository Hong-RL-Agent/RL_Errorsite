document.addEventListener('DOMContentLoaded', () => {
  let challenges = [];
  let selectedChallengeId = null;

  const challengeGrid = document.getElementById('challenge-grid');
  const rankingList = document.getElementById('ranking-list');
  const badgeGrid = document.getElementById('badge-grid');
  const myRecords = document.getElementById('my-records');
  
  const navHome = document.getElementById('nav-home');
  const navRanking = document.getElementById('nav-ranking');
  const navBadges = document.getElementById('nav-badges');
  const navMy = document.getElementById('nav-my');
  
  const homeView = document.getElementById('home-view');
  const rankingView = document.getElementById('ranking-view');
  const badgesView = document.getElementById('badges-view');
  const myView = document.getElementById('my-view');

  const modal = document.getElementById('challenge-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const submissionForm = document.getElementById('submission-form');
  const targetUserIdInput = document.getElementById('target-user-id');
  const toast = document.getElementById('toast');

  function init() {
    fetchChallenges();
  }

  function fetchChallenges() {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        challenges = data;
        renderChallenges();
      });
  }

  function renderChallenges() {
    challengeGrid.innerHTML = '';
    challenges.forEach(c => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <span class="tag">${c.category}</span>
        <h3>${c.title}</h3>
        <p class="text-sm text-muted">${c.description}</p>
        <p class="points mt-3">+ ${c.points} P</p>
      `;
      card.onclick = () => openChallengeModal(c);
      challengeGrid.appendChild(card);
    });
  }

  function openChallengeModal(c) {
    selectedChallengeId = c.id;
    modalBody.innerHTML = `
      <span class="tag">${c.category}</span>
      <h2 style="font-size:2.2rem; font-weight:800; margin-top:10px;">${c.title}</h2>
      <p class="mt-4" style="font-size:1.1rem; line-height:1.8;">${c.description}</p>
      <div class="mt-4" style="background:#F0F7F0; padding:25px; border-radius:20px;">
        <p><strong>참여 보상:</strong> ${c.points} 에코 포인트</p>
        <p class="mt-2"><strong>인증 방식:</strong> 실천 사진 1장 업로드</p>
      </div>
    `;
    modal.style.display = 'block';
  }

  // 챌린지 인증 제출 (Bug 03: 타인 ID로 제출 가능)
  submissionForm.onsubmit = (e) => {
    e.preventDefault();
    const userId = targetUserIdInput.value;

    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, challengeId: selectedChallengeId, photoUrl: 'eco_photo.jpg' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(`${userId}님의 이름으로 챌린지 인증이 완료되었습니다!`);
        modal.style.display = 'none';
        submissionForm.reset();
        if (userId === 'eco_warrior') fetchMyRecords();
      }
    });
  };

  // 랭킹 조회 (Bug 01: 거절된 기록도 포함됨)
  function fetchRanking() {
    fetch('/api/ranking')
      .then(res => res.json())
      .then(data => {
        rankingList.innerHTML = '';
        data.forEach((r, idx) => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div style="display:flex; align-items:center; gap:15px;">
              <span style="font-weight:800; color:var(--green); font-size:1.2rem;">${idx + 1}</span>
              <strong>${r.userId}</strong>
            </div>
            <div class="text-sm font-bold">인증 ${r.count}회</div>
          `;
          rankingList.appendChild(div);
        });
      });
  }

  // 뱃지 조회 (Bug 02: 일부 이미지 필드 누락)
  function fetchBadges() {
    fetch('/api/badges')
      .then(res => res.json())
      .then(data => {
        badgeGrid.innerHTML = '';
        data.forEach(b => {
          const card = document.createElement('div');
          card.className = 'card';
          card.style.textAlign = 'center';
          // b.imageUrl이 없을 경우(Bug 02) 엑스박스나 기본 이미지 노출
          card.innerHTML = `
            <img src="${b.imageUrl || '/img/placeholder.png'}" style="width:80px; height:80px; margin-bottom:15px;" alt="${b.name}">
            <h3>${b.name}</h3>
            <p class="text-sm text-muted">에코 챌린지 달성 보상</p>
          `;
          badgeGrid.appendChild(card);
        });
      });
  }

  function fetchMyRecords() {
    fetch('/api/submissions/eco_warrior')
      .then(res => res.json())
      .then(data => {
        myRecords.innerHTML = '';
        data.forEach(s => {
          const c = challenges.find(ch => ch.id === s.challengeId) || { title: '챌린지' };
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong>${c.title}</strong>
              <p class="text-sm text-muted">${s.date}</p>
            </div>
            <span class="tag" style="background:${s.status === 'Approved' ? '#E8F5E9' : '#FFEBEE'}; color:${s.status === 'Approved' ? '#2E7D32' : '#C62828'}; margin:0;">${s.status === 'Approved' ? '승인' : (s.status === 'Rejected' ? '거절' : '대기')}</span>
          `;
          myRecords.appendChild(div);
        });
      });
  }

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navRanking, navBadges, navMy].forEach(b => b.classList.remove('active'));
    [homeView, rankingView, badgesView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === rankingView) fetchRanking();
    if (view === badgesView) fetchBadges();
    if (view === myView) fetchMyRecords();
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navRanking.onclick = () => switchTab(navRanking, rankingView);
  navBadges.onclick = () => switchTab(navBadges, badgesView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
