document.addEventListener('DOMContentLoaded', () => {
  let partners = [];
  let currentLang = 'all';
  let selectedPartnerId = null;

  const partnerGrid = document.getElementById('partner-grid');
  const langChips = document.querySelectorAll('.chip');
  
  const navDiscover = document.getElementById('nav-discover');
  const navChat = document.getElementById('nav-chat');
  const navProfile = document.getElementById('nav-profile');
  
  const discoverView = document.getElementById('discover-view');
  const chatView = document.getElementById('chat-view');
  const profileView = document.getElementById('profile-view');

  const matchListEl = document.getElementById('match-list');
  const matchCountEl = document.getElementById('match-count');
  
  const modal = document.getElementById('partner-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const sendMatchBtn = document.getElementById('send-match-btn');
  const toast = document.getElementById('toast');

  function init() {
    fetchPartners();
    fetchProfile();
  }

  function fetchPartners() {
    fetch('/api/partners')
      .then(res => res.json())
      .then(data => {
        partners = data;
        renderPartners(data);
      });
  }

  function renderPartners(data) {
    partnerGrid.innerHTML = '';
    const filtered = data.filter(p => 
      currentLang === 'all' || p.native === currentLang
    );

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'partner-card';
      card.innerHTML = `
        <div class="avatar">${p.name[0]}</div>
        <div class="partner-info">
          <h3>${p.name}</h3>
          <p class="partner-meta">${p.country} • ${p.native} ➔ ${p.target}</p>
        </div>
      `;
      card.onclick = () => openModal(p);
      partnerGrid.appendChild(card);
    });
  }

  function openModal(p) {
    selectedPartnerId = p.id;
    modalBody.innerHTML = `
      <div style="text-align:center;">
        <div class="avatar" style="width:80px; height:80px; margin: 0 auto 15px; font-size:2rem;">${p.name[0]}</div>
        <h2>${p.name}</h2>
        <p class="text-muted mt-2">${p.bio}</p>
        <p class="mt-3"><strong>Native:</strong> ${p.native} | <strong>Target:</strong> ${p.target}</p>
      </div>
    `;
    modal.style.display = 'block';
  }

  // 매칭 신청 (Bug 02: Race Condition 유도)
  sendMatchBtn.onclick = () => {
    showToast('Matching request sent...');
    
    fetch('/api/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: selectedPartnerId })
    })
    .then(res => res.json())
    .then(data => {
      // 버그: 여러 번 신청 시 응답 순서가 꼬여 UI에 반영될 수 있음
      showToast('Successfully requested matching!');
      modal.style.display = 'none';
      fetchProfile();
    });
  };

  function fetchProfile() {
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        matchCountEl.innerText = data.matchesCount;
        // 실제로는 매칭 목록도 여기서 업데이트 (예시로 m101만 렌더)
        renderMatches([{ id: 'm101', partnerId: 'p1', status: 'pending' }]);
      });
  }

  function renderMatches(data) {
    matchListEl.innerHTML = '';
    data.forEach(m => {
      const partner = partners.find(p => p.id === m.partnerId) || { name: 'Partner' };
      const div = document.createElement('div');
      div.className = 'match-item';
      div.innerHTML = `
        <div class="m-info">
          <strong>${partner.name}</strong>
          <p class="text-muted" style="font-size:0.8rem;">Status: ${m.status}</p>
        </div>
        <button class="btn-reject" onclick="rejectMatch('${m.id}')">Reject</button>
      `;
      matchListEl.appendChild(div);
    });
  }

  // 매칭 거절 (Bug 01: 상태 업데이트 미반영)
  window.rejectMatch = (id) => {
    fetch(`/api/matches/${id}/reject`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        showToast('Request rejected.');
        // 버그: 서버에서 상태를 바꾸지 않아 다시 조회해도 pending 으로 나옴
        fetchProfile(); 
      });
  };

  langChips.forEach(chip => {
    chip.onclick = () => {
      langChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentLang = chip.dataset.lang;
      renderPartners(partners);
    };
  });

  // 탭 전환
  function switchTab(btn, view) {
    [navDiscover, navChat, navProfile].forEach(b => b.classList.remove('active'));
    [discoverView, chatView, profileView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navDiscover.onclick = () => switchTab(navDiscover, discoverView);
  navChat.onclick = () => switchTab(navChat, chatView);
  navProfile.onclick = () => switchTab(navProfile, profileView);

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
