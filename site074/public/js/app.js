document.addEventListener('DOMContentLoaded', () => {
  let ingredients = [];
  let recipes = [];
  let selectedIngredients = [];
  const userId = 'user_A';

  const ingredientChipsEl = document.getElementById('ingredient-chips');
  const recipeGrid = document.getElementById('recipe-grid');
  const recipeSearch = document.getElementById('recipe-search');
  
  const navRecipes = document.getElementById('nav-recipes');
  const navPrices = document.getElementById('nav-prices');
  const navSaved = document.getElementById('nav-saved');
  
  const recipesView = document.getElementById('recipes-view');
  const pricesView = document.getElementById('prices-view');
  const savedView = document.getElementById('saved-view');

  const detailModal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');

  const toast = document.getElementById('toast');

  function init() {
    fetchIngredients();
    fetchRecipes();
  }

  function fetchIngredients() {
    fetch('/api/ingredients')
      .then(res => res.json())
      .then(data => {
        ingredients = data;
        renderIngredients();
      });
  }

  function renderIngredients() {
    ingredientChipsEl.innerHTML = '';
    ingredients.forEach(ing => {
      const chip = document.createElement('div');
      chip.className = `chip ${selectedIngredients.includes(ing) ? 'active' : ''}`;
      chip.innerText = ing;
      chip.onclick = () => toggleIngredient(ing);
      ingredientChipsEl.appendChild(chip);
    });
  }

  function toggleIngredient(ing) {
    if (selectedIngredients.includes(ing)) {
      selectedIngredients = selectedIngredients.filter(i => i !== ing);
    } else {
      selectedIngredients.push(ing);
    }
    renderIngredients();
    fetchRecipes();
  }

  // 레시피 조회 (Bug 01: 필터 로직이 OR로 작동함)
  function fetchRecipes() {
    const query = selectedIngredients.join(',');
    fetch(`/api/recipes?ingredients=${query}`)
      .then(res => res.json())
      .then(data => {
        recipes = data;
        renderRecipes();
      });
  }

  function renderRecipes() {
    recipeGrid.innerHTML = '';
    const term = recipeSearch.value.toLowerCase();
    const filtered = recipes.filter(r => r.title.toLowerCase().includes(term));

    filtered.forEach(r => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <div class="card-image">🥗</div>
        <div class="card-content">
          <span class="tag">${r.category} | ${r.difficulty}</span>
          <h3>${r.title}</h3>
          <p class="ingredients-preview">${r.ingredients.join(', ')}</p>
        </div>
      `;
      card.onclick = () => openRecipeDetail(r.id);
      recipeGrid.appendChild(card);
    });
  }

  // 가격 비교 (Bug 02: Content-Type이 text/html이라 JSON 파싱 실패 가능성)
  function fetchPrices() {
    fetch('/api/prices')
      .then(res => {
        // Content-Type이 application/json이 아니면 여기서 에러가 날 수 있음
        return res.json();
      })
      .then(data => {
        const list = document.getElementById('price-list');
        list.innerHTML = '';
        data.forEach(p => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${p.ingredient}</td>
            <td>${p.market}</td>
            <td class="price-text">₩${p.price.toLocaleString()}</td>
            <td><span style="color:#4CAF50; font-size:0.8rem;">● 판매중</span></td>
          `;
          list.appendChild(tr);
        });
      })
      .catch(err => {
        console.error('Data error:', err);
        showToast('가격 정보를 불러오는 중 오류가 발생했습니다.');
      });
  }

  function openRecipeDetail(id) {
    const recipe = recipes.find(r => r.id === id);
    modalBody.innerHTML = `
      <div style="color:var(--green); font-family:Fredoka; font-weight:700; font-size:0.8rem; letter-spacing:1px; margin-bottom:10px;">RECIPE PREVIEW</div>
      <h2 style="font-family:Fredoka; font-size:2.5rem; font-weight:700; line-height:1.2;">${recipe.title}</h2>
      <div class="mt-4 p-5" style="background:var(--green-light); border-radius:20px; border:1.5px dashed var(--green);">
        <p><strong>필요한 재료:</strong> ${recipe.ingredients.join(', ')}</p>
        <p class="mt-2"><strong>카테고리:</strong> ${recipe.category}</p>
        <p class="mt-2"><strong>난이도:</strong> ${recipe.difficulty}</p>
      </div>
      <p class="mt-4 text-sm text-muted" style="line-height:1.8;">
        신선한 재료의 풍미를 그대로 살린 건강한 레시피입니다. 
        간단한 조리 과정으로 집에서도 셰프의 맛을 경험해 보세요.
      </p>
    `;
    detailModal.style.display = 'block';
  }

  // 저장된 목록 (Bug 03: 타인의 ID로 상세 조회가 가능함)
  function fetchSaved() {
    const list = document.getElementById('saved-list');
    list.innerHTML = `
      <div class="list-item">
        <div>
          <strong style="font-family:Fredoka; font-size:1.2rem;">토마토 바질 파스타</strong>
          <p style="font-size:0.85rem; color:var(--text-muted);">저장일: 2024-05-01</p>
        </div>
        <button class="btn-green" style="padding:10px 20px; font-size:0.9rem;" onclick="viewSavedDetail('save-1')">상세 보기</button>
      </div>
      <div class="p-4 text-xs text-muted">
        ※ 보안 테스트: /api/saved/save-99 경로를 통해 다른 사용자의 저장 정보를 조회해 보세요.
      </div>
    `;
  }

  function viewSavedDetail(saveId) {
    fetch(`/api/saved/${saveId}`)
      .then(res => res.json())
      .then(data => {
        openRecipeDetail(data.recipeDetails.id);
      });
  }

  recipeSearch.oninput = () => renderRecipes();

  function switchTab(btn, view) {
    [navRecipes, navPrices, navSaved].forEach(b => b.classList.remove('active'));
    [recipesView, pricesView, savedView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === pricesView) fetchPrices();
    if (view === savedView) fetchSaved();
  }

  navRecipes.onclick = () => switchTab(navRecipes, recipesView);
  navPrices.onclick = () => switchTab(navPrices, pricesView);
  navSaved.onclick = () => switchTab(navSaved, savedView);

  closeBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == detailModal) detailModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
