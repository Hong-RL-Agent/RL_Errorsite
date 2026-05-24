document.addEventListener('DOMContentLoaded', () => {
  let plans = [];
  let currentLevel = 'All';
  let activePlanId = null;

  const planGrid = document.getElementById('plan-grid');
  const planSearch = document.getElementById('plan-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  const navPlans = document.getElementById('nav-plans');
  const navMy = document.getElementById('nav-my');
  
  const plansView = document.getElementById('plans-view');
  const myView = document.getElementById('my-view');

  const subListEl = document.getElementById('sub-list');
  const planModal = document.getElementById('plan-modal');
  const modalBody = document.getElementById('modal-body');
  const modalPrice = document.getElementById('modal-price');
  const closeBtn = document.querySelector('.close');
  
  const subscribeBtn = document.getElementById('subscribe-btn');
  const updateDeliveryBtn = document.getElementById('update-delivery-btn');
  const deliveryDateInput = document.getElementById('delivery-date');

  const toast = document.getElementById('toast');

  function init() {
    fetchPlans();
  }

  function fetchPlans() {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        plans = data;
        renderPlans();
      });
  }

  function renderPlans() {
    planGrid.innerHTML = '';
    const term = planSearch.value.toLowerCase();
    
    let filtered = plans.filter(p => 
      (currentLevel === 'All' || p.level === currentLevel) &&
      (p.name.toLowerCase().includes(term) || p.desc.toLowerCase().includes(term))
    );

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'plan-card';
      card.innerHTML = `
        <span class="plan-badge">${p.level}</span>
        <h3 class="mt-2">${p.name}</h3>
        <p class="plan-price">₩${p.price.toLocaleString()} / 월</p>
        <p class="text-sm text-muted">${p.desc}</p>
      `;
      card.onclick = () => openPlanModal(p);
      planGrid.appendChild(card);
    });
  }

  function openPlanModal(plan) {
    activePlanId = plan.id;
    modalPrice.innerText = `₩${plan.price.toLocaleString()}`;
    modalBody.innerHTML = `
      <div style="font-family:Outfit; color:var(--green); font-weight:700; font-size:0.8rem; text-transform:uppercase;">Subscription Details</div>
      <h2 class="mt-2" style="font-family:Outfit; font-size:2.5rem;">${plan.name}</h2>
      <div class="mt-4 p-5" style="background:var(--green-light); border-radius:16px;">
        <p><strong>관리 난이도:</strong> ${plan.level}</p>
        <p class="mt-1"><strong>구성 상품:</strong> 엄선된 식물 1종, 전용 화분, 배양토, 관리 가이드</p>
      </div>
      <p class="mt-4 text-sm text-muted">매월 새로운 식물과 전문가의 케어 솔루션이 배달됩니다. 건강한 사무실 환경을 위한 최고의 파트너가 되어 드립니다.</p>
    `;
    planModal.style.display = 'block';
  }

  // 구독 신청 (Bug 01: 중복 신청 가능, Bug 03: 결제 금액 변조 취약)
  subscribeBtn.onclick = () => {
    const plan = plans.find(p => p.id === activePlanId);
    if (!plan) return;

    // 정상적인 시나리오라면 plan.price를 보내야 함
    // Bug 03: 클라이언트에서 임의의 가격을 보낼 수 있는 취약점 테스트를 위해 변수화
    const priceToSend = plan.price; 

    fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user_A', planId: activePlanId, monthlyPrice: priceToSend })
    })
    .then(res => {
      if (!res.ok) throw new Error('구독 신청에 실패했습니다.');
      return res.json();
    })
    .then(data => {
      showToast('구독이 성공적으로 시작되었습니다.');
      planModal.style.display = 'none';
      switchTab(navMy, myView);
    })
    .catch(err => {
      showToast(err.message);
    });
  };

  // 배송 일정 변경 (Bug 02: 에러 시 원인 없는 빈 응답 반환)
  updateDeliveryBtn.onclick = () => {
    const newDate = deliveryDateInput.value;
    fetch('/api/deliveries/del-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: newDate })
    })
    .then(res => {
      if (!res.ok) {
        // Bug 02: res.json()이 실패하거나 빈 메시지가 오면 적절한 피드백을 줄 수 없음
        return res.json().catch(() => ({ error: '시스템 오류가 발생했습니다.' }));
      }
      return res.json();
    })
    .then(data => {
      if (data.error) {
        showToast(data.error);
      } else {
        showToast('배송 일정이 성공적으로 변경되었습니다.');
      }
    });
  };

  function fetchMySubscriptions() {
    fetch('/api/subscriptions/user_A')
      .then(res => res.json())
      .then(data => {
        subListEl.innerHTML = '';
        if (data.length === 0) {
          subListEl.innerHTML = '<p class="text-muted p-5 text-center">현재 이용 중인 구독 상품이 없습니다.</p>';
          return;
        }
        data.forEach(s => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong style="font-family:Outfit; font-size:1.2rem;">${s.plan.name}</strong>
              <p class="text-sm text-muted">결제 예정: ₩${s.monthlyPrice.toLocaleString()} / 월</p>
            </div>
            <span class="company-tag" style="background:#000; color:#FFF;">${s.status}</span>
          `;
          subListEl.appendChild(div);
        });
      });
  }

  planSearch.oninput = () => renderPlans();
  filterBtns.forEach(btn => {
    btn.onclick = () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentLevel = btn.dataset.level;
      renderPlans();
    };
  });

  function switchTab(btn, view) {
    [navPlans, navMy].forEach(b => b.classList.remove('active'));
    [plansView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === myView) fetchMySubscriptions();
  }

  navPlans.onclick = () => switchTab(navPlans, plansView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => planModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == planModal) planModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
