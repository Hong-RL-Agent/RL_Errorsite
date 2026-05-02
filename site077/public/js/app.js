document.addEventListener('DOMContentLoaded', () => {
  let habits = [];
  let stats = [];
  let currentHabitId = null;
  const userId = 'user_A';

  const plantGrid = document.getElementById('plant-grid');
  const habitListEl = document.getElementById('habit-list');
  
  const navGarden = document.getElementById('nav-garden');
  const navHabits = document.getElementById('nav-habits');
  const navStats = document.getElementById('nav-stats');
  
  const gardenView = document.getElementById('garden-view');
  const habitsView = document.getElementById('habits-view');
  const statsView = document.getElementById('stats-view');

  const detailModal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const checkinBtn = document.getElementById('checkin-btn');

  const toast = document.getElementById('toast');

  function init() {
    fetchHabits();
    fetchStats();
  }

  function fetchHabits() {
    fetch(`/api/habits?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        habits = data;
        renderGarden();
        renderHabitList();
      });
  }

  function renderGarden() {
    plantGrid.innerHTML = '';
    habits.forEach(h => {
      const card = document.createElement('div');
      card.className = 'plant-card';
      const growth = h.streak > 10 ? '🌳' : h.streak > 3 ? '🌿' : '🌱';
      card.innerHTML = `
        <span class="plant-icon">${growth}</span>
        <h3>${h.name}</h3>
        <span class="streak-badge">${h.streak}일 연속 성장 중</span>
      `;
      card.onclick = () => openHabitDetail(h.id);
      plantGrid.appendChild(card);
    });
  }

  function renderHabitList() {
    habitListEl.innerHTML = '';
    habits.forEach(h => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div>
          <strong>${h.name}</strong>
          <p style="font-size:0.8rem; color:var(--text-muted);">${h.plantType}</p>
        </div>
        <button class="btn-green" style="padding:8px 16px; font-size:0.9rem;">돌보기</button>
      `;
      div.onclick = () => openHabitDetail(h.id);
      habitListEl.appendChild(div);
    });
  }

  // 습관 상세 (Bug 03: 타인의 habitId로 조회 가능)
  function openHabitDetail(id) {
    currentHabitId = id;
    fetch(`/api/habits/${id}`)
      .then(res => res.json())
      .then(data => {
        modalBody.innerHTML = `
          <div style="color:var(--green-dark); font-family:Gaegu; font-weight:700; font-size:1.2rem; margin-bottom:10px;">식물 성장 가이드</div>
          <h2 style="font-family:Gaegu; font-size:2.5rem; font-weight:700; line-height:1.2;">${data.name}</h2>
          <div class="mt-4 p-5" style="background:var(--green-light); border-radius:20px; border:2px dashed var(--green);">
            <p><strong>현재 스트릭:</strong> ${data.streak}일</p>
            <p class="mt-2"><strong>총 기록 횟수:</strong> ${data.history.length}회</p>
          </div>
          <p class="mt-4" style="font-size:0.95rem; color:var(--text-muted);">
            매일 꾸준히 돌볼수록 식물은 더 건강하게 자라납니다. 
            오늘의 습관을 완료하고 정원을 풍성하게 가꿔보세요!
          </p>
        `;
        detailModal.style.display = 'block';
      });
  }

  // 체크인 (Bug 02: 중복 저장 방지 누락)
  checkinBtn.onclick = () => {
    fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ habitId: currentHabitId })
    })
    .then(res => res.json())
    .then(data => {
      showToast('정성이 전달되어 식물이 한 뼘 더 자랐습니다!');
      detailModal.style.display = 'none';
      fetchHabits();
      fetchStats();
    });
  };

  // 통계 (Bug 01: 스트릭 계산 오류 - 하루 건너뛰어도 유지됨)
  function fetchStats() {
    fetch(`/api/stats?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        stats = data;
        const statsEl = document.getElementById('stats-cards');
        statsEl.innerHTML = '';
        data.forEach(s => {
          const card = document.createElement('div');
          card.className = 'stats-card';
          card.innerHTML = `
            <span class="stats-num">${s.currentStreak}</span>
            <p style="font-weight:700;">${s.name}</p>
            <p style="font-size:0.8rem; color:var(--text-muted);">총 ${s.totalCheckins}회 달성</p>
          `;
          statsEl.appendChild(card);
        });
      });
  }

  function fetchBadges() {
    fetch('/api/badges')
      .then(res => res.json())
      .then(data => {
        const list = document.getElementById('badge-list');
        list.innerHTML = '';
        data.forEach(b => {
          const div = document.createElement('div');
          div.className = 'badge';
          div.innerHTML = '🏅';
          div.title = `${b.name}: ${b.description}`;
          list.appendChild(div);
        });
      });
  }

  function switchTab(btn, view) {
    [navGarden, navHabits, navStats].forEach(b => b.classList.remove('active'));
    [gardenView, habitsView, statsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === statsView) fetchBadges();
  }

  navGarden.onclick = () => switchTab(navGarden, gardenView);
  navHabits.onclick = () => switchTab(navHabits, habitsView);
  navStats.onclick = () => switchTab(navStats, statsView);

  closeBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == detailModal) detailModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
