document.addEventListener('DOMContentLoaded', () => {
  let tasks = [];
  let currentProj = 'all';

  const colTodo = document.getElementById('col-todo');
  const colDoing = document.getElementById('col-doing');
  const colDone = document.getElementById('col-done');
  
  const taskSearch = document.getElementById('task-search');
  const navAll = document.getElementById('nav-all');
  const projBtns = document.querySelectorAll('.proj-btn');
  const viewTitle = document.getElementById('view-title');

  const taskModal = document.getElementById('task-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const statusBtns = document.querySelectorAll('.status-btn');
  const toast = document.getElementById('toast');

  let activeTaskId = null;

  function init() {
    fetchAllTasks();
  }

  function fetchAllTasks() {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        tasks = data;
        renderTasks();
      });
  }

  // 프로젝트별 할 일 조회 (Bug 03: 권한 검증 누락)
  function fetchProjectTasks(projId) {
    fetch(`/api/projects/${projId}/tasks`)
      .then(res => res.json())
      .then(data => {
        tasks = data;
        renderTasks();
      });
  }

  function renderTasks() {
    [colTodo, colDoing, colDone].forEach(col => col.innerHTML = '');
    const term = taskSearch.value.toLowerCase();
    
    tasks.filter(t => t.title.toLowerCase().includes(term) || t.assignee.toLowerCase().includes(term))
      .forEach(t => {
        const card = document.createElement('div');
        card.className = 'task-card';
        card.innerHTML = `
          <h4>${t.title}</h4>
          <div class="meta">
            <span>👤 ${t.assignee}</span>
            <span style="color:var(--${t.status.toLowerCase()}); font-weight:700;">● ${t.status}</span>
          </div>
        `;
        card.onclick = () => openTaskModal(t);
        
        if (t.status === 'Todo') colTodo.appendChild(card);
        else if (t.status === 'Doing') colDoing.appendChild(card);
        else if (t.status === 'Done') colDone.appendChild(card);
      });
  }

  function openTaskModal(task) {
    activeTaskId = task.id;
    modalBody.innerHTML = `
      <div style="font-size:0.8rem; color:var(--blue); font-weight:700; text-transform:uppercase;">Task Details</div>
      <h2 class="mt-2">${task.title}</h2>
      <div class="mt-4 p-4" style="background:var(--grey-bg); border-radius:12px;">
        <p><strong>담당자:</strong> ${task.assignee}</p>
        <p class="mt-1"><strong>현재 상태:</strong> ${task.status}</p>
        <p class="mt-1"><strong>프로젝트 ID:</strong> ${task.projectId}</p>
      </div>
      <p class="mt-4 text-sm text-muted">팀원들과 협업하여 기한 내에 업무를 완료해 주세요. 상태 변경 시 팀 알림이 발송됩니다.</p>
    `;
    taskModal.style.display = 'block';
  }

  // 할 일 상태 변경 (Bug 01: 인덱스 기반 업데이트 오류, Bug 02: 네트워크 레이스 컨디션)
  statusBtns.forEach(btn => {
    btn.onclick = () => {
      const newStatus = btn.dataset.status;
      
      // 낙관적 업데이트 (UI 즉시 반영)
      const task = tasks.find(t => t.id === activeTaskId);
      if (task) task.status = newStatus;
      renderTasks();

      fetch(`/api/tasks/${activeTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Bug 02: 지연 응답이 오면 최신 로컬 상태를 덮어쓸 수 있음
          // Bug 01: 서버가 엉뚱한 인덱스의 task를 업데이트해서 돌려줌
          const updatedTask = data.task;
          const idx = tasks.findIndex(t => t.id === updatedTask.id);
          if (idx !== -1) {
            tasks[idx] = updatedTask;
            renderTasks();
          }
          showToast('작업 상태가 변경되었습니다.');
          taskModal.style.display = 'none';
        }
      });
    };
  });

  taskSearch.oninput = () => renderTasks();

  navAll.onclick = () => {
    navAll.classList.add('active');
    projBtns.forEach(b => b.classList.remove('active'));
    viewTitle.innerText = '모든 할 일';
    fetchAllTasks();
  };

  projBtns.forEach(btn => {
    btn.onclick = () => {
      navAll.classList.remove('active');
      projBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      viewTitle.innerText = btn.innerText;
      fetchProjectTasks(btn.dataset.id);
    };
  });

  // 임의의 타 팀 프로젝트 조회 시뮬레이션 (Bug 03 테스트용)
  window.accessSecretProject = () => {
    fetchProjectTasks('proj-secret');
    viewTitle.innerText = 'Secret Project (전략)';
    showToast('비공개 프로젝트 데이터에 접근했습니다.');
  };

  closeBtn.onclick = () => taskModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == taskModal) taskModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
