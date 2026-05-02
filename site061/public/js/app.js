document.addEventListener('DOMContentLoaded', () => {
  let account = null;
  let transactions = [];
  let currentCategory = 'All';

  const accNo = document.getElementById('acc-no');
  const accBalance = document.getElementById('acc-balance');
  const txListEl = document.getElementById('transaction-list');
  const categoryFilter = document.getElementById('category-filter');

  const navDashboard = document.getElementById('nav-dashboard');
  const navTransfer = document.getElementById('nav-transfer');
  const navBudget = document.getElementById('nav-budget');

  const dashboardView = document.getElementById('dashboard-view');
  const transferView = document.getElementById('transfer-view');
  const budgetView = document.getElementById('budget-view');

  const targetAccInput = document.getElementById('target-acc');
  const transferAmountInput = document.getElementById('transfer-amount');
  const transferDescInput = document.getElementById('transfer-desc');
  const confirmTransferBtn = document.getElementById('confirm-transfer-btn');

  const txModal = document.getElementById('tx-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');

  const toast = document.getElementById('toast');

  function init() {
    fetchAccount('acc-1');
    fetchTransactions('acc-1');
  }

  // 계좌 정보 조회 (Bug 03: IDOR 취약점 테스트 가능)
  function fetchAccount(id) {
    fetch(`/api/accounts/${id}`)
      .then(res => res.json())
      .then(data => {
        account = data;
        accNo.innerText = data.accountNo;
        accBalance.innerText = data.balance.toLocaleString();
      });
  }

  function fetchTransactions(id) {
    fetch(`/api/transactions/${id}`)
      .then(res => res.json())
      .then(data => {
        transactions = data;
        renderTransactions();
      });
  }

  function renderTransactions() {
    txListEl.innerHTML = '';
    const filtered = transactions.filter(tx => currentCategory === 'All' || tx.category === currentCategory);

    if (filtered.length === 0) {
      txListEl.innerHTML = '<p class="text-muted p-5 text-center">거래 내역이 없습니다.</p>';
      return;
    }

    filtered.forEach(tx => {
      const item = document.createElement('div');
      item.className = 'list-item';
      item.innerHTML = `
        <div class="tx-info">
          <h4>${tx.desc}</h4>
          <p>${tx.date} · ${tx.category}</p>
        </div>
        <div class="tx-amount ${tx.amount < 0 ? 'minus' : 'plus'}">
          ${tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString()}원
        </div>
      `;
      item.onclick = () => openTxModal(tx);
      txListEl.appendChild(item);
    });
  }

  function openTxModal(tx) {
    modalBody.innerHTML = `
      <div style="font-family:Outfit; color:var(--blue); font-weight:800; font-size:0.8rem; margin-bottom:15px; text-transform:uppercase;">Transaction Detail</div>
      <h2 style="font-family:Pretendard; font-size:1.8rem; font-weight:800;">${tx.desc}</h2>
      <div class="mt-4 p-5" style="background:var(--grey); border-radius:16px;">
        <p class="flex-between"><span>거래 일시</span> <span>${tx.date}</span></p>
        <p class="flex-between mt-3"><span>카테고리</span> <span>${tx.category}</span></p>
        <p class="flex-between mt-3"><span>거래 금액</span> <strong class="${tx.amount < 0 ? 'minus' : 'plus'}">${tx.amount.toLocaleString()}원</strong></p>
      </div>
      <div class="mt-4 text-xs text-muted">
        ※ 이 거래는 보안 승인이 완료된 정상 거래입니다. 상세 정산 내역은 웹 뱅킹에서 확인 가능합니다.
      </div>
    `;
    txModal.style.display = 'block';
  }

  // 송금 처리 (Bug 01: 수수료 차감 누락, Bug 02: 중복 송금 허용)
  confirmTransferBtn.onclick = () => {
    const toAccount = targetAccInput.value;
    const amount = parseInt(transferAmountInput.value);
    const desc = transferDescInput.value;

    if (!toAccount || !amount) return showToast('계좌번호와 금액을 입력해 주세요.');

    fetch('/api/transfers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fromId: 'acc-1', toAccount, amount, desc })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('송금이 완료되었습니다.');
        // 서버 응답으로 잔액 갱신 (Bug 01 확인 포인트)
        fetchAccount('acc-1');
        fetchTransactions('acc-1');
        
        targetAccInput.value = '';
        transferAmountInput.value = '';
        transferDescInput.value = '';
        switchTab(navDashboard, dashboardView);
      } else {
        showToast(data.error);
      }
    });
  };

  categoryFilter.onchange = (e) => {
    currentCategory = e.target.value;
    renderTransactions();
  };

  function switchTab(btn, view) {
    [navDashboard, navTransfer, navBudget].forEach(b => b.classList.remove('active'));
    [dashboardView, transferView, budgetView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navDashboard.onclick = () => switchTab(navDashboard, dashboardView);
  navTransfer.onclick = () => switchTab(navTransfer, transferView);
  navBudget.onclick = () => switchTab(navBudget, budgetView);

  closeBtn.onclick = () => txModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == txModal) txModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
