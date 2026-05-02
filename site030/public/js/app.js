document.addEventListener('DOMContentLoaded', () => {
  let pantryItems = [];
  let currentSort = 'name';

  const itemGrid = document.getElementById('item-grid');
  const expiringList = document.getElementById('expiring-list');
  const recipeGrid = document.getElementById('recipe-grid');
  const itemSearchInput = document.getElementById('item-search');
  const sortSelect = document.getElementById('sort-select');
  
  const navPantry = document.getElementById('nav-pantry');
  const navExpiring = document.getElementById('nav-expiring');
  const navRecipes = document.getElementById('nav-recipes');
  
  const pantryView = document.getElementById('pantry-view');
  const expiringView = document.getElementById('expiring-view');
  const recipesView = document.getElementById('recipes-view');

  const addModal = document.getElementById('add-modal');
  const openAddBtn = document.getElementById('open-add-modal');
  const closeBtn = document.querySelector('.close');
  const addForm = document.getElementById('add-form');
  const toast = document.getElementById('toast');

  function init() {
    fetchItems();
  }

  function fetchItems() {
    // Bug 03: 모든 사용자의 데이터가 노출됨
    fetch('/api/items?userId=user_A')
      .then(res => res.json())
      .then(data => {
        pantryItems = data;
        renderPantry();
      });
  }

  function renderPantry() {
    itemGrid.innerHTML = '';
    const term = itemSearchInput.value.toLowerCase();
    let filtered = pantryItems.filter(i => i.name.toLowerCase().includes(term));

    if (currentSort === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      filtered.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'item-card';
      const isUrgent = new Date(item.expiryDate) < new Date('2024-05-17');
      card.innerHTML = `
        <span class="cat-tag">${item.category}</span>
        <h3>${item.name}</h3>
        <p class="qty">수량: ${item.quantity}</p>
        <div class="expiry ${isUrgent ? 'urgent' : ''}">
          <span>유통기한</span>
          <span>${item.expiryDate}</span>
        </div>
      `;
      itemGrid.appendChild(card);
    });
  }

  // 재료 추가 (Bug 02: 타입 불일치 허용)
  addForm.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('item-name').value;
    const quantity = document.getElementById('item-qty').value; // 문자열 그대로 전송
    const category = document.getElementById('item-cat').value;
    const expiryDate = document.getElementById('item-expiry').value;

    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user_A', name, category, quantity, expiryDate })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast(`${name}이(가) 냉장고에 추가되었습니다.`);
        addModal.style.display = 'none';
        addForm.reset();
        fetchItems();
      }
    });
  };

  // 임박 재료 조회 (Bug 01: 만료된 것 포함)
  function fetchExpiring() {
    fetch('/api/expiring')
      .then(res => res.json())
      .then(data => {
        expiringList.innerHTML = '';
        data.forEach(item => {
          const card = document.createElement('div');
          card.className = 'item-card';
          const isExpired = new Date(item.expiryDate) < new Date('2024-05-14');
          card.innerHTML = `
            <span class="cat-tag" style="${isExpired ? 'background:#FFEBEE; color:#C62828;' : ''}">${item.category}</span>
            <h3>${item.name}</h3>
            <div class="expiry urgent">
              <span>${isExpired ? '만료됨' : '곧 만료'}</span>
              <span>${item.expiryDate}</span>
            </div>
          `;
          expiringList.appendChild(card);
        });
      });
  }

  function fetchRecipes() {
    fetch('/api/recipes')
      .then(res => res.json())
      .then(data => {
        recipeGrid.innerHTML = '';
        data.forEach(r => {
          const card = document.createElement('div');
          card.className = 'item-card';
          card.innerHTML = `
            <span class="cat-tag">Recipe</span>
            <h3>${r.name}</h3>
            <p class="text-sm">주재료: ${r.mainIngredient}</p>
            <div class="expiry">
              <span>조리 시간</span>
              <span>${r.time}</span>
            </div>
          `;
          recipeGrid.appendChild(card);
        });
      });
  }

  itemSearchInput.oninput = () => renderPantry();
  sortSelect.onchange = (e) => { currentSort = e.target.value; renderPantry(); };

  // 탭 전환
  function switchTab(btn, view) {
    [navPantry, navExpiring, navRecipes].forEach(b => b.classList.remove('active'));
    [pantryView, expiringView, recipesView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navPantry.onclick = () => switchTab(navPantry, pantryView);
  navExpiring.onclick = () => { switchTab(navExpiring, expiringView); fetchExpiring(); };
  navRecipes.onclick = () => { switchTab(navRecipes, recipesView); fetchRecipes(); };

  openAddBtn.onclick = () => addModal.style.display = 'block';
  closeBtn.onclick = () => addModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == addModal) addModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
