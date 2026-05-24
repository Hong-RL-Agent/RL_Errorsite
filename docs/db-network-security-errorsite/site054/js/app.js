document.addEventListener('DOMContentLoaded', () => {
  let gifts = [];
  let currentMaxPrice = '';
  let currentTarget = 'All';

  const giftGrid = document.getElementById('gift-grid');
  const wishGrid = document.getElementById('wish-grid');
  const giftSearch = document.getElementById('gift-search');
  const budgetFilter = document.getElementById('budget-filter');
  const targetFilter = document.getElementById('target-filter');
  
  const navDiscover = document.getElementById('nav-discover');
  const navWish = document.getElementById('nav-wish');
  
  const discoverView = document.getElementById('discover-view');
  const wishView = document.getElementById('wish-view');

  const giftModal = document.getElementById('gift-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  
  const secretModal = document.getElementById('secret-modal');
  const secretBody = document.getElementById('secret-body');
  const closeSecretBtn = document.querySelector('.close-secret');

  const toast = document.getElementById('toast');

  function init() {
    fetchGifts();
  }

  // 선물 조회 (Bug 01: 예산 필터 반대로 작동)
  function fetchGifts() {
    const url = `/api/gifts?maxPrice=${currentMaxPrice}&target=${currentTarget}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        gifts = data;
        renderGifts();
      });
  }

  function renderGifts() {
    giftGrid.innerHTML = '';
    const term = giftSearch.value.toLowerCase();
    const filtered = gifts.filter(g => g.name.toLowerCase().includes(term));

    filtered.forEach(g => {
      const card = document.createElement('div');
      card.className = 'gift-card';
      card.innerHTML = `
        <div class="gift-img">🎁</div>
        <div class="gift-body">
          <span class="gift-tag">${g.target}</span>
          <h3 class="mt-2">${g.name}</h3>
          <p class="gift-price">₩${g.price.toLocaleString()}</p>
        </div>
      `;
      card.onclick = () => openGiftModal(g);
      giftGrid.appendChild(card);
    });
  }

  function openGiftModal(gift) {
    modalBody.innerHTML = `
      <div style="font-family:Montserrat; color:var(--pink); font-weight:800; font-size:0.8rem; letter-spacing:1px;">GIFT DETAILS</div>
      <h2 class="mt-2" style="font-size:2rem;">${gift.name}</h2>
      <div class="mt-4 p-5" style="background:var(--pink-light); border-radius:24px;">
        <p><strong>가격:</strong> ₩${gift.price.toLocaleString()}</p>
        <p class="mt-1"><strong>추천 대상:</strong> ${gift.target}</p>
        <p class="mt-1"><strong>카테고리:</strong> ${gift.category}</p>
      </div>
      <p class="mt-4 text-sm text-muted">특별한 순간을 더 빛나게 해줄 완벽한 선택입니다. 정성스러운 포장 서비스가 기본 제공됩니다.</p>
    `;
    giftModal.style.display = 'block';
  }

  // 위시리스트 조회 (Bug 02: 응답 포맷 에러, Bug 03: 타인 데이터 접근)
  function fetchWishlist(wishId) {
    fetch(`/api/wishlist/${wishId}`)
      .then(res => res.json())
      .then(data => {
        // Bug 02: data가 JSON 문자열로 오기 때문에 파싱이 필요함. 
        // 하지만 클라이언트 코드는 이를 인지하지 못하고 배열로 다루려다 에러가 남.
        try {
          const items = (typeof data === 'string') ? JSON.parse(data) : data;
          renderWishlist(items);
        } catch (e) {
          console.error('Wishlist parsing error');
          wishGrid.innerHTML = '<p class="text-muted p-5 text-center">위시리스트를 불러오는 중 오류가 발생했습니다.</p>';
        }
      });
  }

  function renderWishlist(items) {
    wishGrid.innerHTML = '';
    if (!items || items.length === 0) {
      wishGrid.innerHTML = '<p class="text-muted p-5 text-center">담겨있는 선물이 없습니다.</p>';
      return;
    }
    items.forEach(g => {
      const card = document.createElement('div');
      card.className = 'gift-card';
      card.innerHTML = `
        <div class="gift-img">💖</div>
        <div class="gift-body">
          <h3>${g.name}</h3>
          <p class="gift-price">₩${g.price.toLocaleString()}</p>
        </div>
      `;
      wishGrid.appendChild(card);
    });
  }

  // 타인 위시리스트 조회 시뮬레이션 (Bug 03 테스트용)
  window.viewSecretWish = () => {
    secretModal.style.display = 'block';
    secretBody.innerHTML = '<p>데이터를 불러오는 중...</p>';
    fetch('/api/wishlist/wish-B')
      .then(res => res.json())
      .then(data => {
        const items = JSON.parse(data);
        secretBody.innerHTML = `
          <h2 style="color:var(--lavender);">비공개 위시리스트</h2>
          <div class="mt-4">
            ${items.map(i => `<p>• ${i.name} (₩${i.price.toLocaleString()})</p>`).join('')}
          </div>
          <p class="mt-4 text-xs text-muted">※ 이 리스트는 사용자 B의 비공개 위시리스트입니다.</p>
        `;
      });
  };

  giftSearch.oninput = () => renderGifts();
  budgetFilter.onchange = (e) => {
    currentMaxPrice = e.target.value;
    fetchGifts();
  };
  targetFilter.onchange = (e) => {
    currentTarget = e.target.value;
    fetchGifts();
  };

  function switchTab(btn, view) {
    [navDiscover, navWish].forEach(b => b.classList.remove('active'));
    [discoverView, wishView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === wishView) fetchWishlist('wish-A');
  }

  navDiscover.onclick = () => switchTab(navDiscover, discoverView);
  navWish.onclick = () => switchTab(navWish, wishView);

  closeBtn.onclick = () => giftModal.style.display = 'none';
  closeSecretBtn.onclick = () => secretModal.style.display = 'none';
  window.onclick = (e) => {
    if (e.target == giftModal) giftModal.style.display = 'none';
    if (e.target == secretModal) secretModal.style.display = 'none';
  };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
