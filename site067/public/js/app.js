document.addEventListener('DOMContentLoaded', () => {
  let currentDate = '2024-05-01';
  let userId = 'user_A';

  const mealListEl = document.getElementById('meal-list');
  const dateDisplay = document.getElementById('current-date-display');
  const totalKcalEl = document.getElementById('total-kcal');
  
  const navMeals = document.getElementById('nav-meals');
  const navShopping = document.getElementById('nav-shopping');
  const navRecipes = document.getElementById('nav-recipes');
  
  const mealsView = document.getElementById('meals-view');
  const shoppingView = document.getElementById('shopping-view');
  const recipeView = document.getElementById('recipe-view');

  const addMealBtn = document.getElementById('add-meal-btn');
  const mealModal = document.getElementById('meal-modal');
  const saveMealBtn = document.getElementById('save-meal-btn');
  const closeBtn = document.querySelector('.close');

  const toast = document.getElementById('toast');

  function init() {
    loadDashboard();
  }

  function loadDashboard() {
    fetchMeals();
    fetchSummary();
  }

  // 식단 조회 (Bug 02: 레이스 컨디션 유도, Bug 03: 타 유저 데이터 노출)
  function fetchMeals() {
    // INTENTIONAL BUG: site067-bug02 (Race Condition)
    // 이전 요청을 취소하지 않고 무조건 화면을 덮어씀. 서버의 랜덤 딜레이와 결합되어 순서가 뒤바뀜.
    mealListEl.innerHTML = '<p class="text-muted p-5">불러오는 중...</p>';
    
    fetch(`/api/meals?date=${currentDate}&userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        renderMeals(data);
      });
  }

  function renderMeals(data) {
    mealListEl.innerHTML = '';
    if (data.length === 0) {
      mealListEl.innerHTML = '<p class="text-muted p-5 text-center">기록된 식단이 없습니다.</p>';
      return;
    }
    data.forEach(m => {
      const card = document.createElement('div');
      card.className = 'meal-card';
      card.innerHTML = `
        <span class="meal-type">${m.type}</span>
        <strong class="meal-name">${m.name}</strong>
        <span class="meal-kcal-tag">${m.calories} kcal</span>
      `;
      mealListEl.appendChild(card);
    });
  }

  // 칼로리 요약 (Bug 01: 삭제된 항목 포함 합계 오류)
  function fetchSummary() {
    fetch(`/api/calories/summary?date=${currentDate}`)
      .then(res => res.json())
      .then(data => {
        totalKcalEl.innerText = `${data.total.toLocaleString()} kcal`;
      });
  }

  saveMealBtn.onclick = () => {
    const type = document.getElementById('meal-type').value;
    const name = document.getElementById('meal-name').value;
    const calories = document.getElementById('meal-kcal').value;

    if (!name || !calories) return showToast('식단 이름과 칼로리를 입력해 주세요.');

    fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, date: currentDate, type, name, calories })
    })
    .then(res => res.json())
    .then(() => {
      showToast('식단이 성공적으로 기록되었습니다.');
      mealModal.style.display = 'none';
      loadDashboard();
    });
  };

  document.getElementById('prev-date').onclick = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    currentDate = d.toISOString().split('T')[0];
    dateDisplay.innerText = currentDate;
    loadDashboard();
  };

  document.getElementById('next-date').onclick = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    currentDate = d.toISOString().split('T')[0];
    dateDisplay.innerText = currentDate;
    loadDashboard();
  };

  function fetchShopping() {
    fetch('/api/shopping')
      .then(res => res.json())
      .then(data => {
        const list = document.getElementById('shopping-list');
        list.innerHTML = '';
        data.forEach(item => {
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <span>${item.item}</span>
            <input type="checkbox" ${item.checked ? 'checked' : ''}>
          `;
          list.appendChild(div);
        });
      });
  }

  function fetchRecipes() {
    fetch('/api/recipes')
      .then(res => res.json())
      .then(data => {
        const grid = document.getElementById('recipe-grid');
        grid.innerHTML = '';
        data.forEach(r => {
          const card = document.createElement('div');
          card.className = 'meal-card';
          card.innerHTML = `
            <strong class="meal-name">${r.name}</strong>
            <p class="text-muted">⏰ ${r.time} | 🔥 ${r.kcal} kcal</p>
          `;
          grid.appendChild(card);
        });
      });
  }

  function switchTab(btn, view) {
    [navMeals, navShopping, navRecipes].forEach(b => b.classList.remove('active'));
    [mealsView, shoppingView, recipeView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === shoppingView) fetchShopping();
    if (view === recipeView) fetchRecipes();
  }

  navMeals.onclick = () => switchTab(navMeals, mealsView);
  navShopping.onclick = () => switchTab(navShopping, shoppingView);
  navRecipes.onclick = () => switchTab(navRecipes, recipeView);

  addMealBtn.onclick = () => mealModal.style.display = 'block';
  closeBtn.onclick = () => mealModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == mealModal) mealModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
