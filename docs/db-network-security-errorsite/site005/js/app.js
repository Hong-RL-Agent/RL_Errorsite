document.addEventListener('DOMContentLoaded', () => {
  let destinationsData = [];

  // Elements
  const navHome = document.getElementById('nav-home');
  const navPlan = document.getElementById('nav-plan');
  const homeView = document.getElementById('home-view');
  const planView = document.getElementById('plan-view');

  const destContainer = document.getElementById('dest-container');
  const regionFilter = document.getElementById('region-filter');
  
  const destModal = document.getElementById('dest-modal');
  const closeModal = document.getElementById('close-modal');
  const modalBody = document.getElementById('modal-body');

  const addItiForm = document.getElementById('add-itinerary-form');
  const itineraryList = document.getElementById('itinerary-list');
  const fetchItiBtn = document.getElementById('fetch-itinerary-btn');
  const targetUserId = document.getElementById('target-user-id');

  const budgetForm = document.getElementById('budget-form');
  const budgetInput = document.getElementById('budget-input');
  const currentBudgetStr = document.getElementById('current-budget');
  const budgetLoader = document.getElementById('budget-loader');

  const accomTabs = document.querySelectorAll('.tab-btn');
  const saveNoteBtn = document.getElementById('save-note-btn');
  const toast = document.getElementById('toast');

  // Initialization
  fetch('/api/destinations')
    .then(res => res.json())
    .then(data => {
      destinationsData = data;
      renderDestinations(data);
    });
  
  fetchItinerary('user-123'); // Default user
  fetchBudget();

  // Interaction 1 & 2: Render & Filter Destinations
  function renderDestinations(data) {
    destContainer.innerHTML = '';
    data.forEach(d => {
      const card = document.createElement('div');
      card.className = 'dest-card';
      card.innerHTML = `
        <img src="${d.image}" class="dest-img" alt="${d.name}">
        <div class="dest-info">
          <span class="dest-badge">${d.region}</span>
          <h3 class="mt-2">${d.name}</h3>
        </div>
      `;
      // Interaction 3: Open Modal
      card.addEventListener('click', () => {
        modalBody.innerHTML = `<h2>${d.name}</h2><p>선택하신 여행지 상세 정보입니다.</p><button class="btn-primary mt-4 w-full" onclick="document.getElementById('dest-modal').style.display='none'">확인</button>`;
        destModal.style.display = 'flex';
      });
      destContainer.appendChild(card);
    });
  }

  regionFilter.addEventListener('change', (e) => {
    const region = e.target.value;
    if (region === '전체') renderDestinations(destinationsData);
    else renderDestinations(destinationsData.filter(d => d.region === region));
  });

  // Interaction 4: Close Modal
  closeModal.addEventListener('click', () => {
    destModal.style.display = 'none';
  });

  // Interaction 5: Add Itinerary (Triggers Bug 01: DB Duplicate)
  addItiForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const date = document.getElementById('iti-date').value;
    const time = document.getElementById('iti-time').value;
    const place = document.getElementById('iti-place').value;
    const userId = targetUserId.value || 'user-123'; // Use current hacked id or default

    fetch('/api/itinerary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, date, time, place })
    })
    .then(res => res.json())
    .then(data => {
      showToast('일정이 추가되었습니다!');
      // Bug 01 manifestation: Identical place and time can be added multiple times
      fetchItinerary(userId);
    });
  });

  // Interaction 6: Fetch Itinerary (Triggers Bug 03: IDOR)
  function fetchItinerary(uid) {
    fetch(`/api/itinerary/${uid}`)
      .then(res => res.json())
      .then(data => {
        itineraryList.innerHTML = '';
        if (data.length === 0) {
          itineraryList.innerHTML = '<li>등록된 일정이 없습니다.</li>';
          return;
        }
        data.forEach(item => {
          const li = document.createElement('li');
          li.className = 'itinerary-item';
          li.innerHTML = `
            <div>
              <strong>${item.place}</strong><br>
              <span style="font-size:0.85rem; color:var(--text-muted);">${item.date} ${item.time}</span>
            </div>
          `;
          itineraryList.appendChild(li);
        });
      });
  }

  fetchItiBtn.addEventListener('click', () => {
    const uid = targetUserId.value;
    fetchItinerary(uid);
    showToast(`'${uid}'님의 일정을 불러왔습니다.`);
  });

  // Interaction 7: Budget (Triggers Bug 02: Network Latency)
  function fetchBudget() {
    fetch('/api/budget')
      .then(res => res.json())
      .then(data => {
        currentBudgetStr.innerText = data.amount.toLocaleString();
      });
  }

  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const amountStr = budgetInput.value;
    const amount = parseInt(amountStr, 10);
    
    budgetLoader.style.display = 'block';
    // Bug 02 manifestation: If amount >= 1000000, response takes 15 seconds.
    fetch('/api/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-123', amount })
    })
    .then(res => res.json())
    .then(data => {
      budgetLoader.style.display = 'none';
      currentBudgetStr.innerText = data.amount.toLocaleString();
      showToast('예산이 저장되었습니다.');
      budgetForm.reset();
    });
  });

  // Interaction 8: Nav Tabs
  navHome.addEventListener('click', () => {
    navHome.classList.add('active');
    navPlan.classList.remove('active');
    homeView.style.display = 'block';
    planView.style.display = 'none';
  });

  navPlan.addEventListener('click', () => {
    navPlan.classList.add('active');
    navHome.classList.remove('active');
    homeView.style.display = 'none';
    planView.style.display = 'block';
  });

  // Interaction 9: Accom Tabs (Sort Dummy)
  accomTabs.forEach(btn => {
    btn.addEventListener('click', (e) => {
      accomTabs.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      showToast(`${e.target.innerText} 기준으로 정렬했습니다.`);
    });
  });

  // Interaction 10: Notes
  saveNoteBtn.addEventListener('click', () => {
    showToast('여행 노트가 브라우저에 임시 저장되었습니다.');
  });

  // Toast
  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
});
