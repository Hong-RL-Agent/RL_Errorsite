document.addEventListener('DOMContentLoaded', () => {
  let notices = [];
  let myComplaints = [];
  let currentRegion = '전체';
  const userId = 'user_A';

  const noticeListEl = document.getElementById('notice-list');
  const myComplaintListEl = document.getElementById('my-complaint-list');
  const noticeSearch = document.getElementById('notice-search');
  const regionFilter = document.getElementById('region-filter');
  
  const navNotices = document.getElementById('nav-notices');
  const navComplaints = document.getElementById('nav-complaints');
  const navFaq = document.getElementById('nav-faq');
  
  const noticesView = document.getElementById('notices-view');
  const complaintsView = document.getElementById('complaints-view');
  const faqView = document.getElementById('faq-view');

  const detailModal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const modalActions = document.getElementById('modal-actions');
  const closeBtn = document.querySelector('.close');
  const submitComplaintBtn = document.getElementById('submit-complaint');
  const resolveBtn = document.getElementById('resolve-btn');

  const toast = document.getElementById('toast');

  let activeComplaintId = null;

  function init() {
    fetchNotices();
    fetchMyComplaints();
  }

  function fetchNotices() {
    fetch('/api/notices')
      .then(res => res.json())
      .then(data => {
        notices = data;
        renderNotices();
      });
  }

  function renderNotices() {
    noticeListEl.innerHTML = '';
    const term = noticeSearch.value.toLowerCase();
    const filtered = notices.filter(n => 
      (currentRegion === '전체' || n.region === currentRegion || n.region === '전체') &&
      n.title.toLowerCase().includes(term)
    );

    filtered.forEach(n => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div>
          <strong>${n.title}</strong>
          <p class="item-meta">📍 ${n.region} | 📅 ${n.date}</p>
        </div>
      `;
      noticeListEl.appendChild(div);
    });
  }

  // 민원 접수 (Bug 02: 제목 검증 누락)
  submitComplaintBtn.onclick = () => {
    const title = document.getElementById('complaint-title').value;
    const content = document.getElementById('complaint-content').value;

    fetch('/api/complaints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, title, content })
    })
    .then(res => res.json())
    .then(data => {
      showToast('민원이 성공적으로 접수되었습니다.');
      document.getElementById('complaint-title').value = '';
      document.getElementById('complaint-content').value = '';
      fetchMyComplaints();
    });
  };

  function fetchMyComplaints() {
    // 실제로는 소유자 필터링이 필요하지만 단순화
    fetch('/api/notices') // 여기서는 임시로 공통 데이터를 쓰지만 실제 앱은 개인 데이터 호출
      .then(() => {
        // Mocking for local state as we don't have a list-by-user API
        // For testing Bug 03, we'll manually use ID 'c1' and 'c2'
        renderMyComplaints([
          { id: 'c1', title: '가로등 고장 수리 요청', status: 'pending', date: '2024-05-01' }
        ]);
      });
  }

  function renderMyComplaints(data) {
    myComplaintListEl.innerHTML = '';
    data.forEach(c => {
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div>
          <strong>${c.title}</strong>
          <p class="item-meta">📅 접수일: ${c.date}</p>
        </div>
        <span class="status-badge ${c.status}">${c.status === 'pending' ? '처리중' : '해결됨'}</span>
      `;
      div.onclick = () => openComplaintDetail(c.id);
      myComplaintListEl.appendChild(div);
    });
  }

  // 민원 상세 (Bug 03: 타인의 민원 상세 조회 가능)
  function openComplaintDetail(id) {
    activeComplaintId = id;
    fetch(`/api/complaints/${id}`)
      .then(res => res.json())
      .then(data => {
        modalBody.innerHTML = `
          <div style="color:var(--green); font-weight:700; font-size:0.8rem; margin-bottom:10px;">민원 상세 정보</div>
          <h2 style="font-size:2rem; font-weight:700; line-height:1.2;">${data.title}</h2>
          <div class="mt-4 p-4" style="background:var(--grey); border-radius:8px;">
            <p><strong>접수 번호:</strong> ${data.id}</p>
            <p class="mt-2"><strong>현재 상태:</strong> <span class="status-badge ${data.status}">${data.status === 'pending' ? '처리중' : '해결됨'}</span></p>
          </div>
          <p class="mt-4" style="line-height:1.8;">${data.content}</p>
        `;
        
        modalActions.style.display = data.status === 'pending' ? 'block' : 'none';
        detailModal.style.display = 'block';
      });
  }

  // 상태 업데이트 (Bug 01: 요청 ID 상관없이 첫 번째 항목만 업데이트)
  resolveBtn.onclick = () => {
    fetch(`/api/complaints/${activeComplaintId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'resolved' })
    })
    .then(res => res.json())
    .then(data => {
      showToast('민원 상태가 변경되었습니다.');
      detailModal.style.display = 'none';
      fetchMyComplaints();
    });
  };

  function fetchFaq() {
    fetch('/api/faq')
      .then(res => res.json())
      .then(data => {
        faqView.querySelector('.grid').innerHTML = '';
        data.forEach(f => {
          const card = document.createElement('div');
          card.className = 'faq-card';
          card.innerHTML = `
            <h4>Q. ${f.question}</h4>
            <p>A. ${f.answer}</p>
          `;
          faqView.querySelector('.grid').appendChild(card);
        });
      });
  }

  noticeSearch.oninput = () => renderNotices();
  regionFilter.onchange = (e) => {
    currentRegion = e.target.value;
    renderNotices();
  };

  function switchTab(btn, view) {
    [navNotices, navComplaints, navFaq].forEach(b => b.classList.remove('active'));
    [noticesView, complaintsView, faqView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === faqView) fetchFaq();
  }

  navNotices.onclick = () => switchTab(navNotices, noticesView);
  navComplaints.onclick = () => switchTab(navComplaints, complaintsView);
  navFaq.onclick = () => switchTab(navFaq, faqView);

  closeBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == detailModal) detailModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
