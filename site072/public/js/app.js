document.addEventListener('DOMContentLoaded', () => {
  let clothes = [];
  let activeFilter = 'All';
  const userId = 'user_A';

  const clothGrid = document.getElementById('cloth-grid');
  const clothSearch = document.getElementById('cloth-search');
  const categoryFilter = document.getElementById('category-filter');
  
  const navCloset = document.getElementById('nav-closet');
  const navOutfit = document.getElementById('nav-outfit');
  const navHistory = document.getElementById('nav-history');
  
  const closetView = document.getElementById('closet-view');
  const outfitView = document.getElementById('outfit-view');
  const historyView = document.getElementById('history-view');

  const clothModal = document.getElementById('cloth-modal');
  const addClothBtn = document.getElementById('add-cloth-btn');
  const saveClothBtn = document.getElementById('save-cloth-btn');
  const closeBtn = document.querySelector('.close');

  const toast = document.getElementById('toast');

  function init() {
    fetchClothes();
  }

  // 옷 목록 조회 (Bug 03: 모든 사용자의 데이터가 노출됨)
  function fetchClothes() {
    fetch(`/api/clothes?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        clothes = data;
        renderClothes();
      });
  }

  function renderClothes() {
    clothGrid.innerHTML = '';
    const term = clothSearch.value.toLowerCase();
    const filtered = clothes.filter(c => 
      (activeFilter === 'All' || c.category === activeFilter) &&
      (c.name.toLowerCase().includes(term))
    );

    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'cloth-card';
      card.innerHTML = `
        <div class="card-img-placeholder">🧥</div>
        <div class="card-info">
          <span class="category">${c.category}</span>
          <h3>${c.name}</h3>
          <p style="font-size:0.75rem; color:#999; margin-top:5px;">${c.season} | ${c.color}</p>
        </div>
      `;
      clothGrid.appendChild(card);
    });
  }

  // 옷 추가 (Bug 01: 카테고리가 무조건 'Top'으로 저장됨)
  saveClothBtn.onclick = () => {
    const name = document.getElementById('cloth-name').value;
    const category = document.getElementById('cloth-category').value;
    const season = document.getElementById('cloth-season').value;

    if (!name) return showToast('옷 이름을 입력해 주세요.');

    fetch('/api/clothes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, category, season, color: 'N/A' })
    })
    .then(res => res.json())
    .then(() => {
      showToast('새로운 아이템이 옷장에 추가되었습니다.');
      clothModal.style.display = 'none';
      fetchClothes();
    });
  };

  // 코디 추천 (Bug 02: 일부 구성 아이템이 누락됨)
  function fetchOutfits() {
    fetch('/api/outfits/recommend')
      .then(res => res.json())
      .then(data => {
        const grid = document.getElementById('outfit-grid');
        grid.innerHTML = '';
        data.forEach(outfit => {
          const card = document.createElement('div');
          card.className = 'outfit-card';
          card.innerHTML = `
            <h3 class="outfit-title">${outfit.title}</h3>
            <ul class="outfit-items">
              ${outfit.items.map(item => `
                <li>
                  <span>${item.type}</span>
                  <span>${item.name}</span>
                </li>
              `).join('')}
            </ul>
            <button class="btn-black mt-5">이 코디 저장하기</button>
          `;
          grid.appendChild(card);
        });
      });
  }

  function fetchHistory() {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        const list = document.getElementById('history-list');
        list.innerHTML = '';
        data.forEach(h => {
          const cloth = clothes.find(c => c.id === h.clothId) || { name: '삭제된 아이템' };
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong style="font-family:Playfair Display; font-size:1.2rem;">${cloth.name}</strong>
              <p style="font-size:0.8rem; color:var(--text-muted);">${h.date}</p>
            </div>
            <span style="font-weight:700; color:var(--text-muted); font-size:0.8rem;">WEARING</span>
          `;
          list.appendChild(div);
        });
      });
  }

  clothSearch.oninput = () => renderClothes();
  categoryFilter.onchange = (e) => {
    activeFilter = e.target.value;
    renderClothes();
  };

  function switchTab(btn, view) {
    [navCloset, navOutfit, navHistory].forEach(b => b.classList.remove('active'));
    [closetView, outfitView, historyView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === outfitView) fetchOutfits();
    if (view === historyView) fetchHistory();
  }

  navCloset.onclick = () => switchTab(navCloset, closetView);
  navOutfit.onclick = () => switchTab(navOutfit, outfitView);
  navHistory.onclick = () => switchTab(navHistory, historyView);

  addClothBtn.onclick = () => clothModal.style.display = 'block';
  closeBtn.onclick = () => clothModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == clothModal) clothModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
