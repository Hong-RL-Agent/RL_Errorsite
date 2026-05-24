document.addEventListener('DOMContentLoaded', () => {
  let currentPage = 1;
  let currentFilter = 'all';
  let jobData = [];
  let savedIds = [];

  const jobListEl = document.getElementById('job-list');
  const savedListEl = document.getElementById('saved-list');
  const pageInfo = document.getElementById('page-info');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  
  const navExplore = document.getElementById('nav-explore');
  const navSaved = document.getElementById('nav-saved');
  const navStatus = document.getElementById('nav-status');
  const navChecklist = document.getElementById('nav-checklist');
  
  const exploreView = document.getElementById('explore-view');
  const savedView = document.getElementById('saved-view');
  const statusView = document.getElementById('status-view');
  const checklistView = document.getElementById('checklist-view');

  const appStatusList = document.getElementById('app-status-list');
  const testAuthBtn = document.getElementById('test-auth-btn');
  const toast = document.getElementById('toast');
  const modal = document.getElementById('job-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');

  function init() {
    fetchJobs(1);
    fetchSavedJobs();
  }

  function fetchJobs(page, position = 'all') {
    // Bug 02: position 필터를 보내도 서버가 무시함
    const url = `/api/jobs?page=${page}&limit=6${position !== 'all' ? `&position=${position}` : ''}`;
    
    fetch(url)
      .then(res => res.json())
      .then(resData => {
        // Bug 01: 서버의 페이징 로직 오류로 인해 데이터가 중복되거나 누락됨
        jobData = resData.data;
        renderJobs(jobData, jobListEl);
        currentPage = resData.page;
        pageInfo.innerText = `Page ${currentPage}`;
      });
  }

  function renderJobs(data, container) {
    container.innerHTML = '';
    data.forEach(job => {
      const card = document.createElement('div');
      card.className = 'job-card';
      card.innerHTML = `
        <span class="company-name">${job.company}</span>
        <h3>${job.title}</h3>
        <div class="tag-container">
          ${job.tags.map(t => `<span class="tag">${t}</span>`).join('')}
          <span class="tag" style="background:#E0F2FE; color:#0369A1;">${job.position}</span>
        </div>
        <div class="card-footer">
          <span class="salary">${job.salary}</span>
          <button class="btn-save" onclick="saveJob(event, '${job.id}')">🔖</button>
        </div>
      `;
      card.onclick = () => openModal(job);
      container.appendChild(card);
    });
  }

  window.saveJob = (e, id) => {
    e.stopPropagation();
    fetch('/api/saved-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: id })
    })
    .then(res => res.json())
    .then(() => {
      showToast('공고가 북마크에 저장되었습니다.');
      fetchSavedJobs();
    });
  };

  function fetchSavedJobs() {
    fetch('/api/saved-jobs')
      .then(res => res.json())
      .then(ids => {
        savedIds = ids;
        // Mock filter for saved jobs view
        const savedList = jobData.filter(j => ids.includes(j.id));
        if (navSaved.classList.contains('active')) renderJobs(savedList, savedListEl);
      });
  }

  function fetchApplicationDetails(id) {
    // Bug 03: IDOR 취약점 테스트용
    fetch(`/api/applications/${id}`)
      .then(res => res.json())
      .then(data => {
        if(data.error) {
          showToast(`에러: ${data.error}`);
          return;
        }
        appStatusList.innerHTML = `
          <div class="status-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <strong>지원 ID: ${data.id}</strong>
              <span class="badge badge-blue">${data.status}</span>
            </div>
            <p class="mt-2">지원자: ${data.user}</p>
            <p class="text-xs text-muted mt-1">지원일: ${data.appliedAt}</p>
            ${data.secretNote ? `<div class="mt-4 p-3" style="background:#FFF9C4; border-radius:8px;">⚠️ 민감 정보 노출: ${data.secretNote}</div>` : ''}
          </div>
        `;
      });
  }

  function openModal(job) {
    modalBody.innerHTML = `
      <h2 style="margin-bottom:10px;">${job.title}</h2>
      <p class="company-name" style="font-size:1.2rem;">${job.company}</p>
      <div class="mt-4">
        <p><strong>위치:</strong> ${job.location}</p>
        <p><strong>경력:</strong> ${job.experience}</p>
        <p><strong>급여:</strong> ${job.salary}</p>
      </div>
      <div class="mt-5">
        <button class="btn-primary w-full" onclick="showToast('지원이 완료되었습니다!')">즉시 지원하기</button>
      </div>
    `;
    modal.style.display = 'block';
  }

  // 필터 클릭 (Bug 02 확인용)
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.onclick = () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.val;
      fetchJobs(1, currentFilter);
      showToast(`필터 [${currentFilter}] 적용됨 (Bug 02 확인 요망)`);
    };
  });

  // 페이지네이션 (Bug 01 확인용)
  nextBtn.onclick = () => fetchJobs(currentPage + 1, currentFilter);
  prevBtn.onclick = () => { if(currentPage > 1) fetchJobs(currentPage - 1, currentFilter); };

  // Bug 03 테스트
  testAuthBtn.onclick = () => {
    const targetAppId = prompt('조회할 지원 내역 ID를 입력하세요 (예: app-999)', 'app-999');
    if(targetAppId) fetchApplicationDetails(targetAppId);
  };

  // 탭 전환
  function switchTab(btn, view) {
    [navExplore, navSaved, navStatus, navChecklist].forEach(b => b.classList.remove('active'));
    [exploreView, savedView, statusView, checklistView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navExplore.onclick = () => switchTab(navExplore, exploreView);
  navSaved.onclick = () => { switchTab(navSaved, savedView); fetchSavedJobs(); };
  navStatus.onclick = () => { switchTab(navStatus, statusView); fetchApplicationDetails('app-101'); };
  navChecklist.onclick = () => switchTab(navChecklist, checklistView);

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
