document.addEventListener('DOMContentLoaded', () => {
  let walks = [];
  let currentLocation = 'All';
  let activeWalkId = null;

  const walkGrid = document.getElementById('walk-grid');
  const walkSearch = document.getElementById('walk-search');
  const locationFilter = document.getElementById('location-filter');
  
  const navDiscover = document.getElementById('nav-discover');
  const navMyDogs = document.getElementById('nav-my-dogs');
  
  const discoverView = document.getElementById('discover-view');
  const dogsView = document.getElementById('dogs-view');

  const walkModal = document.getElementById('walk-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const joinBtn = document.getElementById('join-btn');
  const applyDogSelect = document.getElementById('apply-dog-id');

  const dogModal = document.getElementById('dog-modal');
  const dogModalBody = document.getElementById('dog-modal-body');
  const closeDogBtn = document.querySelector('.close-dog');

  const toast = document.getElementById('toast');

  function init() {
    fetchWalks();
    fetchMyDogs();
  }

  // 산책 모임 조회 (Bug 02: 일부 모임 주최자 정보 누락)
  function fetchWalks() {
    fetch(`/api/walks?location=${currentLocation}`)
      .then(res => res.json())
      .then(data => {
        walks = data;
        renderWalks();
      });
  }

  function renderWalks() {
    walkGrid.innerHTML = '';
    const term = walkSearch.value.toLowerCase();
    const filtered = walks.filter(w => w.title.toLowerCase().includes(term));

    filtered.forEach(w => {
      const card = document.createElement('div');
      card.className = 'walk-card';
      card.innerHTML = `
        <div class="card-img">🐕</div>
        <div class="card-body">
          <div class="card-header">
            <span class="loc-badge">${w.location}</span>
          </div>
          <h3>${w.title}</h3>
          <div class="walk-info">
            <p>📅 ${w.time}</p>
            <p>👤 주최: ${w.organizerName || '(정보 없음)'}</p>
          </div>
          <div class="status-info">
            🐶 현재 ${w.currentDogs} / 최대 ${w.maxDogs}마리
          </div>
        </div>
      `;
      card.onclick = () => openWalkModal(w);
      walkGrid.appendChild(card);
    });
  }

  function openWalkModal(walk) {
    activeWalkId = walk.id;
    modalBody.innerHTML = `
      <div style="font-family:Fredoka; color:var(--sage); font-weight:600; font-size:0.85rem; letter-spacing:0.5px;">WALK SESSION</div>
      <h2 class="mt-1" style="font-size:2.5rem; font-weight:600; line-height:1.2;">${walk.title}</h2>
      <div class="mt-4 p-5" style="background:var(--sage-light); border-radius:16px;">
        <p><strong>지역:</strong> ${walk.location}</p>
        <p class="mt-1"><strong>시간:</strong> ${walk.time}</p>
        <p class="mt-1"><strong>주최자:</strong> ${walk.organizerName || '미지정'}</p>
      </div>
      <p class="mt-4 text-sm text-muted" style="line-height:1.8;">
        반려견들과 함께 건강한 공기를 마시며 사회성을 길러주는 즐거운 시간입니다. 매너 벨트와 리드줄을 지참해 주세요.
      </p>
    `;
    walkModal.style.display = 'block';
  }

  // 참가 신청 (Bug 01: 정원 초과 체크 미비)
  joinBtn.onclick = () => {
    const dogId = applyDogSelect.value;
    if (!dogId) return showToast('참가할 반려견을 선택해 주세요.');

    fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walkId: activeWalkId, dogId })
    })
    .then(res => res.json())
    .then(data => {
      showToast('참가 신청이 성공적으로 완료되었습니다!');
      walkModal.style.display = 'none';
      fetchWalks();
    });
  };

  function fetchMyDogs() {
    fetch('/api/my-dogs/user_A')
      .then(res => res.json())
      .then(data => {
        const dogListEl = document.getElementById('dog-list');
        dogListEl.innerHTML = '';
        applyDogSelect.innerHTML = '<option value="">강아지 선택</option>';
        
        data.forEach(d => {
          // 리스트 렌더링
          const card = document.createElement('div');
          card.className = 'walk-card';
          card.innerHTML = `
            <div class="card-img">🐾</div>
            <div class="card-body">
              <h3>${d.name}</h3>
              <p class="text-xs text-muted">${d.breed} · ${d.age}살</p>
            </div>
          `;
          card.onclick = () => viewDogDetail(d.id);
          dogListEl.appendChild(card);

          // 셀렉트 박스 추가
          const opt = new Option(d.name, d.id);
          applyDogSelect.add(opt);
        });
      });
  }

  // 반려견 상세 (Bug 03: 타인 반려견 프로필 노출 취약점)
  window.viewDogDetail = (id) => {
    dogModal.style.display = 'block';
    dogModalBody.innerHTML = '<p>불러오는 중...</p>';
    fetch(`/api/dogs/${id}`)
      .then(res => res.json())
      .then(data => {
        dogModalBody.innerHTML = `
          <h2 style="font-family:Fredoka; color:var(--brown); font-size:2.2rem; line-height:1;">PUPPY PROFILE</h2>
          <div class="mt-4 p-5" style="background:var(--cream); border-radius:20px; border:1px solid var(--border);">
            <p><strong>이름:</strong> ${data.name}</p>
            <p class="mt-1"><strong>견종:</strong> ${data.breed}</p>
            <p class="mt-1"><strong>나이:</strong> ${data.age}살</p>
            <div class="mt-4 pt-4" style="border-top:1px dashed var(--border);">
              <p><strong>특이사항:</strong> ${data.notes}</p>
            </div>
          </div>
        `;
      });
  };

  walkSearch.oninput = () => renderWalks();
  locationFilter.onchange = (e) => {
    currentLocation = e.target.value;
    fetchWalks();
  };

  function switchTab(btn, view) {
    [navDiscover, navMyDogs].forEach(b => b.classList.remove('active'));
    [discoverView, dogsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navDiscover.onclick = () => switchTab(navDiscover, discoverView);
  navMyDogs.onclick = () => switchTab(navMyDogs, dogsView);

  closeBtn.onclick = () => walkModal.style.display = 'none';
  closeDogBtn.onclick = () => dogModal.style.display = 'none';
  window.onclick = (e) => {
    if (e.target == walkModal) walkModal.style.display = 'none';
    if (e.target == dogModal) dogModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
