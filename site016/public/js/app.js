document.addEventListener('DOMContentLoaded', () => {
  const currentUserId = 'user_123';
  let expenseData = [];
  let budgetLimit = 500000;

  const totalSpentEl = document.getElementById('total-spent');
  const remainingBudgetEl = document.getElementById('remaining-budget');
  const budgetProgressEl = document.getElementById('budget-progress');
  const budgetTextEl = document.getElementById('budget-text');
  
  const recentListEl = document.getElementById('recent-list');
  const allListEl = document.getElementById('all-transaction-list');
  const sortFilter = document.getElementById('sort-filter');
  const idorTestBtn = document.getElementById('idor-test-btn');
  const refreshReportBtn = document.getElementById('refresh-report-btn');
  const reportContent = document.getElementById('report-content');

  const navItems = document.querySelectorAll('.nav-item');
  const dashboardView = document.getElementById('dashboard-view');
  const transactionsView = document.getElementById('transactions-view');
  const reportView = document.getElementById('report-view');
  
  const modal = document.getElementById('add-modal');
  const closeBtn = document.querySelector('.close');
  const addBtn = document.getElementById('add-expense-btn');
  const expenseForm = document.getElementById('expense-form');
  const toast = document.getElementById('toast');

  function init() {
    fetchExpenses(currentUserId);
    fetchBudget(currentUserId);
  }

  function fetchExpenses(userId, sort = 'date_desc') {
    fetch(`/api/expenses?userId=${userId}&sort=${sort}`)
      .then(res => res.json())
      .then(data => {
        expenseData = data;
        renderDashboardList(data.slice(0, 5));
        renderAllList(data);
        updateSummary(data);
      });
  }

  function fetchBudget(userId) {
    fetch(`/api/budget/${userId}`)
      .then(res => res.json())
      .then(data => {
        budgetLimit = data.limit;
        updateSummary(expenseData);
      });
  }

  function renderDashboardList(data) {
    recentListEl.innerHTML = '';
    if(data.length === 0) {
      recentListEl.innerHTML = '<p class="p-4 text-muted">최근 지출 내역이 없습니다.</p>';
      return;
    }
    data.forEach(e => {
      const item = createTransactionItem(e);
      recentListEl.appendChild(item);
    });
  }

  function renderAllList(data) {
    allListEl.innerHTML = '';
    if(data.length === 0) {
      allListEl.innerHTML = '<p class="p-4 text-muted">지출 내역이 없습니다.</p>';
      return;
    }
    data.forEach(e => {
      const item = createTransactionItem(e);
      allListEl.appendChild(item);
    });
  }

  function createTransactionItem(e) {
    const div = document.createElement('div');
    div.className = 'transaction-item px-4';
    div.innerHTML = `
      <div class="item-left">
        <div class="icon-box">${e.category[0]}</div>
        <div>
          <p class="item-name">${e.note || e.category}</p>
          <p class="item-date">${e.date}</p>
        </div>
      </div>
      <div class="item-amount">-${Number(e.amount).toLocaleString()}원</div>
    `;
    return div;
  }

  function updateSummary(data) {
    // Bug 01의 영향: 서버에서 보낸 amount가 string일 수 있으나 JS Number()로 여기서 합산
    const total = data.reduce((sum, e) => sum + Number(e.amount), 0);
    totalSpentEl.innerText = `${total.toLocaleString()}원`;
    
    const remaining = budgetLimit - total;
    remainingBudgetEl.innerText = `${remaining.toLocaleString()}원`;
    
    const percent = Math.min((total / budgetLimit) * 100, 100);
    budgetProgressEl.style.width = `${percent}%`;
    budgetTextEl.innerText = `예산 대비 ${Math.round(percent)}% 사용`;
  }

  expenseForm.onsubmit = (e) => {
    e.preventDefault();
    const payload = {
      userId: currentUserId,
      category: document.getElementById('exp-category').value,
      amount: document.getElementById('exp-amount').value,
      note: document.getElementById('exp-note').value,
      date: document.getElementById('exp-date').value
    };

    fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      if(data.success) {
        showToast('지출이 등록되었습니다.');
        modal.style.display = 'none';
        expenseForm.reset();
        fetchExpenses(currentUserId);
      }
    });
  };

  sortFilter.onchange = () => {
    fetchExpenses(currentUserId, sortFilter.value);
  };

  // Bug 03: IDOR 테스트
  idorTestBtn.onclick = () => {
    const targetUserId = prompt('조회할 사용자 ID를 입력하세요 (예: user_999)', 'user_999');
    if(targetUserId) {
      showToast(`사용자 [${targetUserId}]의 데이터를 무단 조회합니다.`);
      fetchExpenses(targetUserId);
    }
  };

  // Bug 02: Rate Limit 테스트
  refreshReportBtn.onclick = () => {
    // 버튼 연타 시 제한이 없음을 보여주기 위해 바로 호출
    reportContent.innerHTML = '<p class="text-sage">📊 리포트 분석 중...</p>';
    
    fetch(`/api/report?userId=${currentUserId}`)
      .then(res => res.json())
      .then(data => {
        setTimeout(() => {
          reportContent.innerHTML = `
            <div class="report-stats">
              <div class="row"><span>총 지출 횟수</span> <strong>${data.count}회</strong></div>
              <div class="row mt-2"><span>총 소비 금액</span> <strong>${data.totalSpent.toLocaleString()}원</strong></div>
              <div class="row mt-2"><span>분석 시각</span> <strong>${data.timestamp}</strong></div>
            </div>
          `;
          showToast('리포트가 갱신되었습니다.');
        }, 500);
      });
  };

  // 탭 전환
  function switchTab(id) {
    navItems.forEach(item => item.classList.remove('active'));
    [dashboardView, transactionsView, reportView].forEach(v => v.style.display = 'none');
    
    document.getElementById(id).classList.add('active');
    if(id === 'nav-dashboard') dashboardView.style.display = 'block';
    if(id === 'nav-transactions') transactionsView.style.display = 'block';
    if(id === 'nav-report') reportView.style.display = 'block';
  }

  navItems.forEach(item => {
    item.onclick = () => switchTab(item.id);
  });

  addBtn.onclick = () => modal.style.display = 'block';
  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
