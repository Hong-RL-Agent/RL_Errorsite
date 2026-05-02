document.addEventListener('DOMContentLoaded', () => {
  let boxes = [];
  let currentExclude = 'None';
  let activeBoxId = null;

  const boxGrid = document.getElementById('box-grid');
  const boxSearch = document.getElementById('box-search');
  const allergyFilter = document.getElementById('allergy-filter');
  
  const navDiscover = document.getElementById('nav-discover');
  const navMy = document.getElementById('nav-my');
  
  const discoverView = document.getElementById('discover-view');
  const myView = document.getElementById('my-view');

  const mySubListEl = document.getElementById('my-sub-list');
  const boxModal = document.getElementById('box-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const subscribeBtn = document.getElementById('subscribe-btn');

  const detailModal = document.getElementById('detail-modal');
  const detailBody = document.getElementById('detail-body');
  const closeDetailBtn = document.querySelector('.close-detail');

  const toast = document.getElementById('toast');

  function init() {
    fetchBoxes();
  }

  // 간식 박스 조회 (Bug 01: 알레르기 필터링 로직 오류 테스트 가능)
  function fetchBoxes() {
    fetch(`/api/boxes?exclude=${currentExclude}`)
      .then(res => res.json())
      .then(data => {
        boxes = data;
        renderBoxes();
      });
  }

  function renderBoxes() {
    boxGrid.innerHTML = '';
    const term = boxSearch.value.toLowerCase();
    const filtered = boxes.filter(b => b.name.toLowerCase().includes(term));

    filtered.forEach(b => {
      const card = document.createElement('div');
      card.className = 'box-card';
      card.innerHTML = `
        <div class="box-img">🥑</div>
        <div class="box-body">
          <span class="text-sm text-green">${b.category}</span>
          <h3>${b.name}</h3>
          <p class="box-price">₩${b.price.toLocaleString()} / 월</p>
          <div class="ingredients">
            ${b.ingredients.map(i => `<span class="badge">${i}</span>`).join('')}
          </div>
        </div>
      `;
      card.onclick = () => openBoxModal(b);
      boxGrid.appendChild(card);
    });
  }

  function openBoxModal(box) {
    activeBoxId = box.id;
    modalBody.innerHTML = `
      <div style="font-family:Montserrat; color:var(--green); font-weight:800; font-size:0.8rem; letter-spacing:1px;">NUTRITION PLAN</div>
      <h2 class="mt-2" style="font-family:Montserrat; font-size:2.5rem; line-height:1.1;">${box.name}</h2>
      <div class="mt-4 p-5" style="background:var(--green-light); border-radius:16px;">
        <p><strong>포함 성분:</strong> ${box.ingredients.join(', ')}</p>
        <p class="mt-2"><strong>월 구독료:</strong> ₩${box.price.toLocaleString()}</p>
      </div>
      <p class="mt-4 text-sm text-muted" style="line-height:1.8;">
        매주 신선한 상태로 배송되는 ${box.name}과 함께 활기찬 하루를 시작해 보세요. 영양 전문가가 설계한 밸런스 있는 간식 구성으로 당신의 식단을 책임집니다.
      </p>
    `;
    boxModal.style.display = 'block';
  }

  // 구독 신청 (Bug 02: Rate Limit 미적용으로 무제한 호출 가능)
  subscribeBtn.onclick = () => {
    const box = boxes.find(b => b.id === activeBoxId);
    if (!box) return;

    fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user_A', boxId: activeBoxId, address: '서울시 강남구 테헤란로 123-45' })
    })
    .then(res => res.json())
    .then(data => {
      showToast('구독 신청이 완료되었습니다!');
      boxModal.style.display = 'none';
      switchTab(navMy, myView);
    });
  };

  function fetchMySubscriptions() {
    fetch('/api/my-subs/user_A')
      .then(res => res.json())
      .then(data => {
        mySubListEl.innerHTML = '';
        if (data.length === 0) {
          mySubListEl.innerHTML = '<p class="text-muted p-5 text-center">이용 중인 구독 서비스가 없습니다.</p>';
          return;
        }
        data.forEach(s => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong style="font-size:1.2rem; color:var(--black);">${s.box.name}</strong>
              <p class="text-sm text-muted">구독 상태: ${s.status}</p>
            </div>
            <button class="btn-login" style="padding:10px 20px; font-size:0.75rem;" onclick="viewDetail('${s.id}')">내역 상세보기</button>
          `;
          mySubListEl.appendChild(div);
        });
      });
  }

  // 구독 상세 내역 (Bug 03: 개인정보 및 내부 메모 노출 취약점)
  window.viewDetail = (id) => {
    detailModal.style.display = 'block';
    detailBody.innerHTML = '<p>불러오는 중...</p>';
    fetch(`/api/subscriptions/${id}`)
      .then(res => res.json())
      .then(data => {
        detailBody.innerHTML = `
          <h2 style="font-family:Montserrat; color:var(--green); font-size:2.2rem; line-height:1;">SUBSCRIPTION DETAIL</h2>
          <div class="mt-4 p-5" style="background:var(--beige); border-radius:16px;">
            <p><strong>구독 번호:</strong> ${data.id}</p>
            <p class="mt-1"><strong>배송 주소:</strong> ${data.address}</p>
            <p class="mt-1"><strong>구독 상태:</strong> ${data.status}</p>
            <div class="mt-4 pt-4" style="border-top:1px dashed #CCC; color:#777; font-size:0.8rem;">
              <p>※ 서버 응답의 'internalNote' 필드에 비공개 관리자 메모가 포함되어 있습니다. (개발자 도구 확인 필요)</p>
            </div>
          </div>
        `;
      });
  };

  boxSearch.oninput = () => renderBoxes();
  allergyFilter.onchange = (e) => {
    currentExclude = e.target.value;
    fetchBoxes();
  };

  function switchTab(btn, view) {
    [navDiscover, navMy].forEach(b => b.classList.remove('active'));
    [discoverView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === myView) fetchMySubscriptions();
  }

  navDiscover.onclick = () => switchTab(navDiscover, discoverView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => boxModal.style.display = 'none';
  closeDetailBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => {
    if (e.target == boxModal) boxModal.style.display = 'none';
    if (e.target == detailModal) detailModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
