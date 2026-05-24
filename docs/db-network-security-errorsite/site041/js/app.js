document.addEventListener('DOMContentLoaded', () => {
  let records = [];
  let growthData = null;

  const feedingList = document.getElementById('feeding-list');
  const growthCard = document.getElementById('growth-card');
  const sharedList = document.getElementById('shared-list');
  const dateFilter = document.getElementById('log-date-filter');
  const guardianSelector = document.getElementById('guardian-selector');
  
  const navHome = document.getElementById('nav-home');
  const navGrowth = document.getElementById('nav-growth');
  const navShare = document.getElementById('nav-share');
  
  const homeView = document.getElementById('home-view');
  const growthView = document.getElementById('growth-view');
  const shareView = document.getElementById('share-view');

  const modal = document.getElementById('record-modal');
  const closeBtn = document.querySelector('.close');
  const feedingForm = document.getElementById('feeding-form');
  const addFeedingBtn = document.getElementById('add-feeding-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchFeedingRecords();
  }

  // 수유 기록 조회 (Bug 01: 날짜 필터 무시)
  function fetchFeedingRecords() {
    const date = dateFilter.value;
    fetch(`/api/feeding?userId=mom_1&date=${date}`)
      .then(res => res.json())
      .then(data => {
        records = data;
        renderFeedingRecords();
      });
  }

  function renderFeedingRecords() {
    feedingList.innerHTML = '';
    if (records.length === 0) {
      feedingList.innerHTML = '<p class="text-muted p-4">기록이 없습니다.</p>';
      return;
    }

    records.forEach(f => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div>
          <strong style="color:var(--pink-dark);">${f.type}</strong>
          <p class="text-sm text-muted">${f.date} ${f.time}</p>
        </div>
        <div class="font-bold">${f.amount} ml</div>
      `;
      feedingList.appendChild(div);
    });
  }

  // 성장 기록 조회 (Bug 02: 스키마 불일치)
  function fetchGrowthRecords() {
    fetch('/api/growth?userId=mom_1')
      .then(res => res.json())
      .then(data => {
        const latest = data[0] || {};
        growthData = latest;
        // Bug 02: 서버는 height를 보내지만 클라이언트는 heightCm을 기대함
        growthCard.innerHTML = `
          <div style="display:flex; justify-content:space-around;">
            <div>
              <p class="text-muted">몸무게</p>
              <h3 style="font-size:2.5rem; color:var(--blue-dark);">${latest.weightKg || '--'} kg</h3>
            </div>
            <div>
              <p class="text-muted">키</p>
              <h3 style="font-size:2.5rem; color:var(--pink-dark);">${latest.heightCm || '--'} cm</h3>
            </div>
          </div>
          <p class="mt-4 text-sm text-muted">측정일: ${latest.date || '--'}</p>
        `;
      });
  }

  // 공유 기록 조회 (Bug 03: 권한 검증 누락)
  function fetchSharedRecords() {
    const guardianId = guardianSelector.value;
    fetch(`/api/records/${guardianId}`)
      .then(res => res.json())
      .then(data => {
        sharedList.innerHTML = '';
        data.forEach(f => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong>${f.type}</strong>
              <p class="text-sm text-muted">작성자 ID: ${f.userId} | ${f.date}</p>
            </div>
            <div class="font-bold">${f.amount} ml</div>
          `;
          sharedList.appendChild(div);
        });
      });
  }

  feedingForm.onsubmit = (e) => {
    e.preventDefault();
    const type = document.getElementById('feed-type').value;
    const amount = document.getElementById('feed-amount').value;
    const time = document.getElementById('feed-time').value;
    const date = dateFilter.value;

    fetch('/api/feeding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'mom_1', type, amount, time, date })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('수유 기록이 성공적으로 저장되었습니다.');
        modal.style.display = 'none';
        feedingForm.reset();
        fetchFeedingRecords();
      }
    });
  };

  dateFilter.onchange = () => fetchFeedingRecords();
  guardianSelector.onchange = () => fetchSharedRecords();

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navGrowth, navShare].forEach(b => b.classList.remove('active'));
    [homeView, growthView, shareView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === growthView) fetchGrowthRecords();
    if (view === shareView) fetchSharedRecords();
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navGrowth.onclick = () => switchTab(navGrowth, growthView);
  navShare.onclick = () => switchTab(navShare, shareView);

  addFeedingBtn.onclick = () => modal.style.display = 'block';
  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
