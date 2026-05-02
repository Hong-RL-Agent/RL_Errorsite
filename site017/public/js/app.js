document.addEventListener('DOMContentLoaded', () => {
  let recipeData = [];
  let savedIds = [];

  const recipeGrid = document.getElementById('recipe-grid');
  const savedGrid = document.getElementById('saved-grid');
  const ingredientInput = document.getElementById('ingredient-input');
  const searchBtn = document.getElementById('search-btn');
  
  const navHome = document.getElementById('nav-home');
  const navSaved = document.getElementById('nav-saved');
  const navReviews = document.getElementById('nav-reviews');
  const homeView = document.getElementById('home-view');
  const savedView = document.getElementById('saved-view');
  const reviewsView = document.getElementById('reviews-view');
  
  const reviewList = document.getElementById('review-list');
  const submitReviewBtn = document.getElementById('submit-review');
  
  const modal = document.getElementById('recipe-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const toast = document.getElementById('toast');

  function init() {
    fetchRecipes();
  }

  function fetchRecipes(query = '') {
    const url = query ? `/api/recipes?ingredient=${encodeURIComponent(query)}` : '/api/recipes';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        recipeData = data;
        renderRecipes(data, recipeGrid);
      });
  }

  function renderRecipes(data, container) {
    container.innerHTML = '';
    if (data.length === 0) {
      container.innerHTML = '<p class="text-center text-muted" style="grid-column: 1/-1; padding: 40px;">검색 결과가 없습니다.</p>';
      return;
    }
    data.forEach(r => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${r.image}" class="card-img">
        <div class="card-body">
          <span class="badge">${r.difficulty}</span>
          <h4>${r.title}</h4>
          <p class="text-xs text-muted">${r.ingredients.join(', ')}</p>
          <div class="info-row">
            <span>⏰ ${r.time}</span>
            <button class="btn-save" onclick="saveRecipe(event, '${r.id}')">❤ 저장</button>
          </div>
        </div>
      `;
      card.onclick = () => openModal(r);
      container.appendChild(card);
    });
  }

  window.saveRecipe = (e, id) => {
    e.stopPropagation();
    fetch('/api/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipeId: id })
    })
    .then(res => {
      // Bug 02: 실패해도 201 Created가 올 수 있음
      if (res.status === 201) return res.json();
      throw new Error('Network error');
    })
    .then(data => {
      if (data.success) {
        showToast('레시피가 저장되었습니다.');
        fetchSaved();
      } else {
        // Bug 02: status는 201인데 data.success는 false인 경우
        showToast(`알림: ${data.message} (Status: 201)`);
      }
    });
  };

  function fetchSaved() {
    fetch('/api/saved')
      .then(res => res.json())
      .then(ids => {
        savedIds = ids;
        const savedList = recipeData.filter(r => ids.includes(r.id));
        renderRecipes(savedList, savedGrid);
      });
  }

  function openModal(r) {
    modalBody.innerHTML = `
      <h2 style="font-size:2rem; margin-bottom:10px;">${r.title}</h2>
      <img src="${r.image}" style="width:100%; border-radius:10px; margin-bottom:20px;">
      <p><strong>난이도:</strong> ${r.difficulty} | <strong>소요시간:</strong> ${r.time}</p>
      <div class="mt-4">
        <h4>필수 재료</h4>
        <ul class="mt-2" style="padding-left:20px;">
          ${r.ingredients.map(i => `<li>${i}</li>`).join('')}
        </ul>
      </div>
      <p class="mt-4 text-muted">상세 조리법은 준비 중입니다...</p>
    `;
    modal.style.display = 'block';
  }

  function fetchReviews() {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        reviewList.innerHTML = '';
        data.forEach(rv => {
          const div = document.createElement('div');
          div.className = 'review-card';
          // Bug 03: innerHTML을 사용하여 XSS 취약점 노출
          div.innerHTML = `
            <strong>${rv.user}</strong>
            <p>${rv.content}</p>
          `;
          reviewList.appendChild(div);
        });
      });
  }

  submitReviewBtn.onclick = () => {
    const user = document.getElementById('review-user').value;
    const content = document.getElementById('review-content').value;
    
    if(!user || !content) return showToast('닉네임과 내용을 입력하세요.');

    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, content, recipeId: 'any' })
    })
    .then(res => res.json())
    .then(() => {
      showToast('후기가 등록되었습니다.');
      document.getElementById('review-content').value = '';
      fetchReviews();
    });
  };

  searchBtn.onclick = () => {
    const val = ingredientInput.value.trim();
    // Bug 01: 부분 검색은 안되고 전체 일치만 됨
    fetchRecipes(val);
  };

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navSaved, navReviews].forEach(b => b.classList.remove('active'));
    [homeView, savedView, reviewsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navSaved.onclick = () => { switchTab(navSaved, savedView); fetchSaved(); };
  navReviews.onclick = () => { switchTab(navReviews, reviewsView); fetchReviews(); };

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
