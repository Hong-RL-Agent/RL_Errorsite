document.addEventListener('DOMContentLoaded', () => {
  let allProducts = [];
  let currentCategory = '전체';
  let currentSort = 'default';

  const productContainer = document.getElementById('product-container');
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const catBtns = document.querySelectorAll('.cat-btn');
  const sortSelect = document.getElementById('sort-select');
  const refreshBtn = document.getElementById('refresh-btn');
  
  const modalOverlay = document.getElementById('product-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const modalBody = document.getElementById('modal-body');
  const modalFavBtn = document.getElementById('modal-fav-btn');
  let currentProductId = null;

  const notification = document.getElementById('notification');

  // Interaction 1: Fetch and render initial products
  function fetchProducts() {
    let url = `/api/products?category=${encodeURIComponent(currentCategory)}&sort=${currentSort}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        allProducts = data;
        renderProducts(data);
      })
      .catch(err => console.error("Error fetching products:", err));
  }

  function renderProducts(products) {
    productContainer.innerHTML = '';
    if (products.length === 0) {
      productContainer.innerHTML = '<p>상품이 없습니다.</p>';
      return;
    }
    products.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.image}" class="product-img" alt="${p.title}">
        <div class="product-info">
          <div class="product-title">${p.title}</div>
          <div class="product-price">${p.price.toLocaleString()}원</div>
          <div class="product-category">${p.category}</div>
        </div>
      `;
      // Interaction 5: Open product detail modal
      card.addEventListener('click', () => openModal(p.id));
      productContainer.appendChild(card);
    });
  }

  // Interaction 2: Search
  searchBtn.addEventListener('click', () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = allProducts.filter(p => p.title.toLowerCase().includes(keyword));
    renderProducts(filtered);
  });

  // Interaction 3: Category Filter (Triggers site001-bug01 on server)
  catBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      catBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.dataset.category;
      fetchProducts();
    });
  });

  // Interaction 4: Sort
  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    fetchProducts();
  });

  // Interaction 11: Refresh API
  refreshBtn.addEventListener('click', () => {
    showNotification('목록을 새로고침했습니다.');
    fetchProducts();
  });

  function openModal(id) {
    currentProductId = id;
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(p => {
        modalBody.innerHTML = `
          <h3>${p.title}</h3>
          <p class="product-price" style="font-size: 1.5rem; margin-bottom: 1rem;">${p.price.toLocaleString()}원</p>
          <p>상태: 매우 좋음</p>
          <p>카테고리: ${p.category}</p>
        `;
        modalOverlay.style.display = 'flex';
      });
  }

  // Interaction 6: Close Modal
  closeModalBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.style.display = 'none';
  });

  // Interaction 7: Add to Favorites (Triggers site001-bug02 timeout if id is p3)
  modalFavBtn.addEventListener('click', () => {
    if (!currentProductId) return;
    
    // Bug 02: Network timeout for 'p3'. The client doesn't have timeout handling!
    // It will just wait forever or until browser times out.
    const originalText = modalFavBtn.innerText;
    modalFavBtn.innerText = '저장 중...';
    modalFavBtn.disabled = true;

    fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: currentProductId })
    })
    .then(res => res.json())
    .then(data => {
      showNotification(data.message);
    })
    .catch(err => {
      console.error("Favorite failed", err);
      showNotification("찜하기 실패 (네트워크 오류)");
    })
    .finally(() => {
      modalFavBtn.innerText = originalText;
      modalFavBtn.disabled = false;
    });
  });

  // Interaction 8: Submit Sell Form
  const sellForm = document.getElementById('sell-form');
  sellForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showNotification('상품이 성공적으로 등록되었습니다!');
    sellForm.reset();
  });

  // Interaction 9: Notification
  function showNotification(msg) {
    notification.innerText = msg;
    notification.classList.add('show');
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  // Interaction 10: Review Tab Switch
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      showNotification(e.target.innerText + ' 탭으로 변경되었습니다.');
    });
  });

  // Interaction 12: Navigations
  document.getElementById('nav-home').addEventListener('click', () => {
    document.querySelectorAll('main > section').forEach(s => s.style.display = 'block');
    document.getElementById('section-mypage').style.display = 'none';
  });

  document.getElementById('nav-mypage').addEventListener('click', () => {
    document.querySelectorAll('main > section').forEach(s => s.style.display = 'none');
    document.getElementById('section-mypage').style.display = 'block';
  });

  // Interaction 13: Login dummy
  document.getElementById('nav-login').addEventListener('click', () => {
    showNotification('더미 로그인 창이 뜹니다. (실제 구현 X)');
  });

  // Bypass Login Test (Triggers site001-bug03)
  document.getElementById('bypass-login-btn').addEventListener('click', () => {
    // Sending x-user-id header without real authentication
    fetch('/api/mypage', {
      headers: {
        'x-user-id': 'hacked-user-123'
      }
    })
    .then(res => res.json())
    .then(data => {
      if(data.error) {
        document.getElementById('mypage-content').innerHTML = `<p>${data.error}</p>`;
      } else {
        document.getElementById('mypage-content').innerHTML = `
          <h4>환영합니다, ${data.name}님</h4>
          <p>보유 포인트: ${data.points} P</p>
          <p>판매 횟수: ${data.salesCount}회</p>
          <p>구매 횟수: ${data.buyCount}회</p>
          <p style="color:var(--error); margin-top:10px;">[취약점] 로그인 없이 인증이 우회되었습니다!</p>
        `;
        showNotification('비정상 접근 성공!');
      }
    })
    .catch(err => {
      console.error(err);
      showNotification('접근 실패');
    });
  });

  // Init
  fetchProducts();
});
