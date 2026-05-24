document.addEventListener('DOMContentLoaded', () => {
  let runs = [];
  let currentDist = 'all';

  const runsGrid = document.getElementById('runs-grid');
  const runSearch = document.getElementById('run-search');
  const distFilter = document.getElementById('dist-filter');
  
  const navRuns = document.getElementById('nav-runs');
  const navRecords = document.getElementById('nav-records');
  const navRanking = document.getElementById('nav-ranking');
  
  const runsView = document.getElementById('runs-view');
  const recordsView = document.getElementById('records-view');
  const rankingView = document.getElementById('ranking-view');

  const recordListEl = document.getElementById('record-list');
  const editModal = document.getElementById('edit-modal');
  const editForm = document.getElementById('edit-form');
  const closeBtn = document.querySelector('.close');
  const toast = document.getElementById('toast');

  function init() {
    fetchRuns();
  }

  function fetchRuns() {
    fetch('/api/runs')
      .then(res => res.json())
      .then(data => {
        runs = data;
        renderRuns();
      });
  }

  function renderRuns() {
    runsGrid.innerHTML = '';
    const term = runSearch.value.toLowerCase();
    
    let filtered = runs.filter(r => 
      (currentDist === 'all' || r.distance === currentDist) &&
      (r.title.toLowerCase().includes(term))
    );

    filtered.forEach(r => {
      const card = document.createElement('div');
      card.className = 'run-card';
      const isFull = r.currentParticipants >= r.maxParticipants;
      card.innerHTML = `
        <span class="diff-tag ${r.difficulty}">${r.difficulty}</span>
        <h3>${r.title}</h3>
        <div class="meta-info">
          <span>📅 ${r.date}</span>
          <span>📍 ${r.distance}</span>
          <span style="color:${isFull ? '#F44336' : 'var(--neon)'}">${isFull ? 'FULL' : `JOINED: ${r.currentParticipants}/${r.maxParticipants}`}</span>
        </div>
        <button class="btn-neon w-full mt-4" onclick="event.stopPropagation(); registerRun('${r.id}')">참가 신청</button>
      `;
      runsGrid.appendChild(card);
    });
  }

  // 참가 신청 (Bug 01: 인원 초과 무시, Bug 02: 중복 등록 허용)
  window.registerRun = (id) => {
    fetch(`/api/runs/${id}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'runner_A' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('러닝 모임에 참가 신청이 완료되었습니다!');
        fetchRuns();
      } else {
        showToast(`ERROR: ${data.error}`);
      }
    });
  };

  function fetchMyRecords() {
    fetch('/api/records/runner_A')
      .then(res => res.json())
      .then(data => {
        recordListEl.innerHTML = '';
        data.forEach(rec => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong>${rec.title}</strong>
              <p class="text-sm text-muted">${rec.date} | ${rec.distance} | ${rec.time}</p>
            </div>
            <button onclick="openEditModal('${rec.id}', '${rec.title}', '${rec.distance}', '${rec.time}')" style="background:none; border:none; color:var(--neon); font-weight:800; cursor:pointer;">EDIT</button>
          `;
          recordListEl.appendChild(div);
        });
      });
  }

  // 기록 수정 (Bug 03: 타인 기록 수정 가능)
  window.openEditModal = (id, title, dist, time) => {
    document.getElementById('edit-rec-id').value = id;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-dist').value = dist;
    document.getElementById('edit-time').value = time;
    editModal.style.display = 'block';
  };

  editForm.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-rec-id').value;
    const title = document.getElementById('edit-title').value;
    const distance = document.getElementById('edit-dist').value;
    const time = document.getElementById('edit-time').value;

    fetch(`/api/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'runner_A', title, distance, time })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('러닝 기록이 정상적으로 수정되었습니다.');
        editModal.style.display = 'none';
        fetchMyRecords();
      }
    });
  };

  runSearch.oninput = () => renderRuns();
  distFilter.onchange = () => {
    currentDist = distFilter.value;
    renderRuns();
  };

  // 탭 전환
  function switchTab(btn, view) {
    [navRuns, navRecords, navRanking].forEach(b => b.classList.remove('active'));
    [runsView, recordsView, rankingView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === recordsView) fetchMyRecords();
  }

  navRuns.onclick = () => switchTab(navRuns, runsView);
  navRecords.onclick = () => switchTab(navRecords, recordsView);
  navRanking.onclick = () => switchTab(navRanking, rankingView);

  closeBtn.onclick = () => editModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == editModal) editModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
