document.addEventListener('DOMContentLoaded', () => {
  let customers = [];
  let activeCustomerId = null;

  const customerListEl = document.getElementById('customer-list');
  const customerSearch = document.getElementById('customer-search');
  
  const navDashboard = document.getElementById('nav-dashboard');
  const navCustomers = document.getElementById('nav-customers');
  
  const dashboardView = document.getElementById('dashboard-view');
  const customersView = document.getElementById('customers-view');

  const detailModal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const saveTagsBtn = document.getElementById('save-tags-btn');
  const tagInput = document.getElementById('new-tags');

  const toast = document.getElementById('toast');

  function init() {
    fetchDashboard();
    fetchCustomers();
    
    // INTENTIONAL BUG: site068-bug02 (Rate Limit)
    // 부하 유발 테스트를 위해 대시보드 데이터를 매우 짧은 간격으로 자동 갱신함
    setInterval(() => {
      fetchDashboard();
    }, 3000); 
  }

  function fetchDashboard() {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        document.getElementById('total-customers').innerText = data.totalCustomers;
        document.getElementById('today-consultations').innerText = data.todayConsultations;
        document.getElementById('monthly-revenue').innerText = `₩${data.monthlyRevenue.toLocaleString()}`;
      });
  }

  // 고객 목록 조회 (Bug 03: 민감 정보 노출 확인 가능)
  function fetchCustomers() {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        customers = data;
        renderCustomers();
      });
  }

  function renderCustomers() {
    customerListEl.innerHTML = '';
    const term = customerSearch.value.toLowerCase();
    const filtered = customers.filter(c => 
      c.name.toLowerCase().includes(term) || c.phoneSuffix.includes(term)
    );

    filtered.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600;">${c.name}</td>
        <td>****-****-${c.phoneSuffix}</td>
        <td>
          ${c.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}
        </td>
        <td>
          <button class="btn-outline" onclick="openCustomerDetail('${c.id}')">상세 보기</button>
        </td>
      `;
      customerListEl.appendChild(tr);
    });
  }

  window.openCustomerDetail = (id) => {
    const customer = customers.find(c => c.id === id);
    activeCustomerId = id;
    
    modalBody.innerHTML = `
      <div style="color:var(--blue); font-weight:700; font-size:0.75rem; letter-spacing:1px; margin-bottom:10px;">CUSTOMER PROFILE</div>
      <h2 style="font-size:2.2rem; font-weight:700; color:var(--slate-dark);">${customer.name}</h2>
      <div class="mt-4 p-5" style="background:var(--slate-light); border-radius:16px;">
        <p><strong>연락처:</strong> 010-****-${customer.phoneSuffix}</p>
        <p class="mt-1"><strong>현재 태그:</strong> ${customer.tags.join(', ')}</p>
      </div>
      <p class="mt-4 text-sm text-muted">최근 상담 이력 및 선호도를 기반으로 최적화된 서비스를 제공하세요.</p>
      <!-- Bug 03 확인용 힌트 (네트워크 탭 확인 유도) -->
      <div class="mt-4 pt-4" style="border-top:1px dashed #DDD; color:#AAA; font-size:0.7rem;">
        ※ 보안 점검: API 응답의 'fullPhoneNumber'와 'privateMemo' 필드 노출 여부를 확인하십시오.
      </div>
    `;
    
    tagInput.value = customer.tags.join(', ');
    detailModal.style.display = 'block';
  };

  // 태그 저장 (Bug 01: 이전 태그가 저장되는 상태 오염 버그)
  saveTagsBtn.onclick = () => {
    const tags = tagInput.value.split(',').map(t => t.trim()).filter(t => t);
    
    fetch(`/api/customers/${activeCustomerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags })
    })
    .then(res => res.json())
    .then(data => {
      showToast('고객 정보가 성공적으로 업데이트되었습니다.');
      detailModal.style.display = 'none';
      fetchCustomers();
    });
  };

  customerSearch.oninput = () => renderCustomers();

  function switchTab(btn, view) {
    [navDashboard, navCustomers].forEach(b => b.classList.remove('active'));
    [dashboardView, customersView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navDashboard.onclick = () => switchTab(navDashboard, dashboardView);
  navCustomers.onclick = () => switchTab(navCustomers, customersView);

  closeBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == detailModal) detailModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
