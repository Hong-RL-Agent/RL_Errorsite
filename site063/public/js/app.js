document.addEventListener('DOMContentLoaded', () => {
  let tasks = [];
  let budgetData = { total: 0, items: [] };
  let guests = [];
  let currentPlanId = 'plan-101';

  const taskListEl = document.getElementById('task-list');
  const taskSearch = document.getElementById('task-search');
  
  const navChecklist = document.getElementById('nav-checklist');
  const navBudget = document.getElementById('nav-budget');
  const navGuests = document.getElementById('nav-guests');
  
  const checklistView = document.getElementById('checklist-view');
  const budgetView = document.getElementById('budget-view');
  const guestView = document.getElementById('guest-view');

  const totalBudgetEl = document.getElementById('total-budget');
  const budgetCountEl = document.getElementById('budget-count');
  const budgetItemsEl = document.getElementById('budget-items');

  const guestListEl = document.getElementById('guest-list');
  const guestNameInput = document.getElementById('guest-name');
  const guestRelationInput = document.getElementById('guest-relation');
  const addGuestBtn = document.getElementById('add-guest-btn');

  const detailModal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');

  const toast = document.getElementById('toast');

  function init() {
    fetchTasks(currentPlanId);
  }

  // 준비 일정 조회 (Bug 03: 타인 일정 무단 조회 테스트 가능)
  function fetchTasks(planId) {
    fetch(`/api/tasks/${planId}`)
      .then(res => res.json())
      .then(data => {
        tasks = data;
        renderTasks();
      });
  }

  function renderTasks() {
    taskListEl.innerHTML = '';
    const term = taskSearch.value.toLowerCase();
    const filtered = tasks.filter(t => t.title.toLowerCase().includes(term));

    filtered.forEach(t => {
      const item = document.createElement('div');
      item.className = 'list-item';
      item.innerHTML = `
        <div>
          <strong style="font-size:1.1rem;">${t.title}</strong>
          <p class="text-xs text-muted">${t.category}</p>
        </div>
        <div>
          <span style="color:${t.completed ? 'var(--rose)' : '#CCC'}; font-weight:700;">
            ${t.completed ? '✓ 완료' : '진행중'}
          </span>
        </div>
      `;
      item.onclick = () => openTaskDetail(t);
      taskListEl.appendChild(item);
    });
  }

  function openTaskDetail(task) {
    modalBody.innerHTML = `
      <div style="font-family:Playfair Display; color:var(--rose); font-weight:700; font-size:0.8rem; letter-spacing:1px;">TASK DETAIL</div>
      <h2 class="mt-2" style="font-family:Playfair Display; font-size:2.5rem; line-height:1.1;">${task.title}</h2>
      <div class="mt-4 p-5" style="background:var(--rose-light); border-radius:16px;">
        <p><strong>카테고리:</strong> ${task.category}</p>
        <p class="mt-2"><strong>상태:</strong> ${task.completed ? '완료된 준비 항목입니다.' : '현재 준비가 진행 중입니다.'}</p>
      </div>
      <p class="mt-4 text-sm text-muted">웨딩 전문가가 제안하는 표준 가이드에 따라 꼼꼼하게 준비해 보세요. 행복한 결혼식의 첫걸음입니다.</p>
    `;
    detailModal.style.display = 'block';
  }

  // 예산 요약 조회 (Bug 01: 취소된 항목이 합계에 포함됨)
  function fetchBudget() {
    fetch('/api/budget/summary')
      .then(res => res.json())
      .then(data => {
        budgetData = data;
        totalBudgetEl.innerText = `₩${data.total.toLocaleString()}`;
        budgetCountEl.innerText = data.count;
        renderBudgetItems();
      });
  }

  function renderBudgetItems() {
    budgetItemsEl.innerHTML = '';
    budgetData.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div>
          <strong style="font-size:1.1rem; ${item.isCancelled ? 'text-decoration:line-through; color:#AAA;' : ''}">${item.item}</strong>
          ${item.isCancelled ? '<span class="badge-cancelled ml-2">취소됨</span>' : ''}
        </div>
        <div style="font-weight:700;">₩${item.cost.toLocaleString()}</div>
      `;
      budgetItemsEl.appendChild(div);
    });
  }

  // 하객 명단 추가 (Bug 02: 이름 비어도 성공 처리)
  addGuestBtn.onclick = () => {
    const name = guestNameInput.value;
    const relation = guestRelationInput.value;

    fetch('/api/guests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, relation })
    })
    .then(res => res.json())
    .then(data => {
      showToast(data.message);
      guestNameInput.value = '';
      fetchGuests();
    });
  };

  function fetchGuests() {
    fetch('/api/guests')
      .then(res => res.json())
      .then(data => {
        guests = data;
        renderGuests();
      });
  }

  function renderGuests() {
    guestListEl.innerHTML = '';
    guests.forEach(g => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div>
          <strong style="font-size:1.1rem;">${g.name || '(이름 없음)'}</strong>
          <p class="text-xs text-muted">${g.relation}</p>
        </div>
        <span class="text-xs text-muted">상태: ${g.invited ? '초대장 발송전' : '보류'}</span>
      `;
      guestListEl.appendChild(div);
    });
  }

  taskSearch.oninput = () => renderTasks();

  function switchTab(btn, view) {
    [navChecklist, navBudget, navGuests].forEach(b => b.classList.remove('active'));
    [checklistView, budgetView, guestView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === budgetView) fetchBudget();
    if (view === guestView) fetchGuests();
  }

  navChecklist.onclick = () => switchTab(navChecklist, checklistView);
  navBudget.onclick = () => switchTab(navBudget, budgetView);
  navGuests.onclick = () => switchTab(navGuests, guestView);

  closeBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == detailModal) detailModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
