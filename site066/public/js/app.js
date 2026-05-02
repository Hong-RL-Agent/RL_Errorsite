document.addEventListener('DOMContentLoaded', () => {
  let projects = [];
  let currentSkill = 'All';
  let activeProjectId = null;

  const projectGrid = document.getElementById('project-grid');
  const projectSearch = document.getElementById('project-search');
  const skillFilter = document.getElementById('skill-filter');
  
  const navDiscover = document.getElementById('nav-discover');
  const navMy = document.getElementById('nav-my');
  
  const discoverView = document.getElementById('discover-view');
  const myView = document.getElementById('my-view');

  const proposalModal = document.getElementById('proposal-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const submitBtn = document.getElementById('submit-btn');

  const propPrice = document.getElementById('prop-price');
  const propMessage = document.getElementById('prop-message');
  const proposalListEl = document.getElementById('proposal-list');

  const toast = document.getElementById('toast');

  function init() {
    fetchProjects();
  }

  // 프로젝트 조회 (Bug 03: 클라이언트 민감 정보 노출 테스트 가능)
  function fetchProjects() {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        projects = data;
        renderProjects();
      });
  }

  function renderProjects() {
    projectGrid.innerHTML = '';
    const term = projectSearch.value.toLowerCase();
    const filtered = projects.filter(p => 
      (p.title.toLowerCase().includes(term) || p.skills.some(s => s.toLowerCase().includes(term))) &&
      (currentSkill === 'All' || p.skills.includes(currentSkill))
    );

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.innerHTML = `
        <div class="card-header">
          <span class="status ${p.status}">${p.status === 'open' ? '모집 중' : '모집 마감'}</span>
          <h3>${p.title}</h3>
        </div>
        <div class="card-body">
          <span class="budget">₩${p.budget.toLocaleString()}</span>
          <div class="skills-cloud">
            ${p.skills.map(s => `<span class="skill-badge">${s}</span>`).join('')}
          </div>
        </div>
        <div class="card-footer">
          🏢 ${p.clientName}
        </div>
      `;
      card.onclick = () => openProposalModal(p);
      projectGrid.appendChild(card);
    });
  }

  function openProposalModal(project) {
    activeProjectId = project.id;
    modalBody.innerHTML = `
      <div style="color:var(--indigo); font-weight:800; font-size:0.8rem; letter-spacing:1px;">PROJECT DETAILS</div>
      <h2 class="mt-2" style="font-size:2.2rem; font-weight:800; line-height:1.2;">${project.title}</h2>
      <div class="mt-4 p-5" style="background:var(--indigo-light); border-radius:16px;">
        <p><strong>클라이언트:</strong> ${project.clientName}</p>
        <p class="mt-1"><strong>예산 범위:</strong> ₩${project.budget.toLocaleString()}</p>
        <p class="mt-1"><strong>요구 기술:</strong> ${project.skills.join(', ')}</p>
      </div>
      <p class="mt-4 text-sm text-muted" style="line-height:1.8;">
        본 프로젝트에 대한 구체적인 제안서를 작성해 주세요. 클라이언트가 제안하신 금액과 메시지를 검토한 후 연락을 드릴 예정입니다.
      </p>
      <!-- Bug 03 확인을 위한 힌트 (실제 운영 환경이라면 숨겨져 있어야 함) -->
      <div class="mt-4 pt-4" style="border-top:1px dashed #CCC; color:#999; font-size:0.75rem;">
        ※ API 응답의 'clientInternalMemo' 필드를 통해 클라이언트의 내부 메모를 확인할 수 있습니다.
      </div>
    `;
    proposalModal.style.display = 'block';
  }

  // 제안서 제출 (Bug 01: 중복 제출 허용, Bug 02: 마감 프로젝트 실패 시에도 201 반환)
  submitBtn.onclick = () => {
    const price = parseInt(propPrice.value);
    const message = propMessage.value;

    if (!price || !message) return showToast('금액과 메시지를 모두 입력해 주세요.');

    fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: activeProjectId, userId: 'freelancer_A', message, price })
    })
    .then(res => {
      // Bug 02: res.status가 201이어도 내부 success 필드를 확인해야 함
      return res.json().then(data => ({ status: res.status, data }));
    })
    .then(({ status, data }) => {
      if (status === 201 && data.success) {
        showToast('제안서가 성공적으로 제출되었습니다!');
        proposalModal.style.display = 'none';
        propPrice.value = '';
        propMessage.value = '';
        switchTab(navMy, myView);
      } else {
        // Bug 02 발생: 마감된 경우에도 status가 201이어서 이쪽으로 안 올 수 있음
        showToast(data.message || '제안서 제출에 실패했습니다.');
      }
    });
  };

  function fetchMyProposals() {
    fetch('/api/proposals/freelancer_A')
      .then(res => res.json())
      .then(data => {
        proposalListEl.innerHTML = '';
        if (data.length === 0) {
          proposalListEl.innerHTML = '<p class="text-muted p-5 text-center">지원한 프로젝트가 없습니다.</p>';
          return;
        }
        data.forEach(p => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong style="font-size:1.15rem; color:var(--graphite);">${p.project.title}</strong>
              <p class="text-sm text-muted">제안 금액: ₩${p.price.toLocaleString()}</p>
            </div>
            <span class="text-indigo" style="font-weight:800;">제안 완료</span>
          `;
          proposalListEl.appendChild(div);
        });
      });
  }

  projectSearch.oninput = () => renderProjects();
  skillFilter.onchange = (e) => {
    currentSkill = e.target.value;
    renderProjects();
  };

  function switchTab(btn, view) {
    [navDiscover, navMy].forEach(b => b.classList.remove('active'));
    [discoverView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === myView) fetchMyProposals();
  }

  navDiscover.onclick = () => switchTab(navDiscover, discoverView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => proposalModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == proposalModal) proposalModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
