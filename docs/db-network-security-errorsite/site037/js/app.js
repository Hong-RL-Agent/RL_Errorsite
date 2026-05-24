document.addEventListener('DOMContentLoaded', () => {
  let options = [];
  let cart = [];
  let selectedOptionId = 'opt-1';
  let uploadedPhotos = [];

  const optionsGrid = document.getElementById('options-grid');
  const photoGrid = document.getElementById('photo-grid');
  const cartList = document.getElementById('cart-list');
  const cartTotalEl = document.getElementById('cart-total');
  const cartCountEl = document.getElementById('cart-count');
  const photoCountEl = document.getElementById('photo-count');
  
  const navPrint = document.getElementById('nav-print');
  const navCart = document.getElementById('nav-cart');
  const navHistory = document.getElementById('nav-history');
  
  const printView = document.getElementById('print-view');
  const cartView = document.getElementById('cart-view');
  const historyView = document.getElementById('history-view');

  const uploadBtn = document.getElementById('upload-btn');
  const submitOrderBtn = document.getElementById('submit-order-btn');
  const historyList = document.getElementById('history-list');
  const modal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const toast = document.getElementById('toast');

  function init() {
    fetchOptions();
  }

  function fetchOptions() {
    fetch('/api/options')
      .then(res => res.json())
      .then(data => {
        options = data;
        renderOptions();
      });
  }

  function renderOptions() {
    optionsGrid.innerHTML = '';
    options.forEach(opt => {
      const card = document.createElement('div');
      card.className = `option-card ${opt.id === selectedOptionId ? 'selected' : ''}`;
      card.innerHTML = `
        <h4>${opt.size}</h4>
        <p class="price">₩${opt.price.toLocaleString()}</p>
      `;
      card.onclick = () => {
        selectedOptionId = opt.id;
        renderOptions();
      };
      optionsGrid.appendChild(card);
    });
  }

  // 사진 업로드 시뮬레이션
  uploadBtn.onclick = () => {
    const id = Date.now();
    uploadedPhotos.push({ id, name: `photo_${uploadedPhotos.length + 1}.jpg` });
    renderPhotos();
    updateCartIcon();
    
    // 자동 장바구니 추가
    const opt = options.find(o => o.id === selectedOptionId);
    cart.push({ id, optionId: opt.id, size: opt.size, price: opt.price, qty: 1 });
    updateCartUI();
    showToast('사진이 추가되었습니다.');
  };

  function renderPhotos() {
    photoGrid.innerHTML = '';
    photoCountEl.innerText = uploadedPhotos.length;
    uploadedPhotos.forEach(p => {
      const card = document.createElement('div');
      card.className = 'photo-card';
      card.innerHTML = `
        <div class="photo-thumb">🖼️</div>
        <div class="photo-info">
          <p class="text-sm font-bold">${p.name}</p>
          <button onclick="window.removePhoto(${p.id})" style="background:none; border:none; color:var(--rose-dark); font-size:0.75rem; cursor:pointer;">삭제</button>
        </div>
      `;
      photoGrid.appendChild(card);
    });
  }

  window.removePhoto = (id) => {
    uploadedPhotos = uploadedPhotos.filter(p => p.id !== id);
    cart = cart.filter(c => c.id !== id);
    renderPhotos();
    updateCartUI();
  };

  function updateCartUI() {
    cartList.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.qty;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div>
          <strong>${item.size} 인화</strong>
          <p class="text-sm text-muted">수량: ${item.qty}개</p>
        </div>
        <div class="font-bold">₩${(item.price * item.qty).toLocaleString()}</div>
      `;
      cartList.appendChild(div);
    });
    cartTotalEl.innerText = `${total.toLocaleString()}원`;
    updateCartIcon();
  }

  function updateCartIcon() {
    cartCountEl.innerText = cart.length;
  }

  // 주문 제출 (Bug 01: 가격 매핑 오류, Bug 02: 페이로드 에러 500)
  submitOrderBtn.onclick = () => {
    if (cart.length === 0) return showToast('장바구니가 비어 있습니다.');
    const address = document.getElementById('order-address').value;
    if (!address) return showToast('배송지를 입력해 주세요.');

    // Bug 02 테스트용: 데이터가 아주 많으면 1MB 초과 시뮬레이션
    // (실제로는 수만 개의 항목을 보낼 때 발생)
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, address, userId: 'user-77' })
    })
    .then(res => {
      if (res.status === 201) {
        return res.json().then(data => {
          // Bug 01: 서버가 잘못 계산한 금액이 나옴
          showToast(`주문이 완료되었습니다! (결제 금액: ${data.order.total.toLocaleString()}원)`);
          cart = [];
          uploadedPhotos = [];
          renderPhotos();
          updateCartUI();
          switchTab(navHistory, historyView);
          fetchHistory();
        });
      } else if (res.status === 500) {
        // Bug 02: Payload Too Large(413)여야 하지만 서버가 500을 보냄
        showToast('서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
      }
    });
  };

  // 주문 내역 조회 (Bug 03: 데이터 과다 노출)
  function fetchHistory() {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        historyList.innerHTML = '';
        data.forEach(order => {
          const card = document.createElement('div');
          card.className = 'option-card';
          card.style.height = 'auto';
          card.innerHTML = `
            <div style="display:flex; justify-content:space-between;">
              <strong>${order.id}</strong>
              <span class="text-rose">${order.status}</span>
            </div>
            <p class="text-sm mt-2">금액: ₩${order.total.toLocaleString()}</p>
            <button class="btn-rose mt-3" style="padding:8px 15px; font-size:0.8rem;" onclick="window.viewOrderDetail('${order.id}')">상세 정보</button>
          `;
          historyList.appendChild(card);
        });
      });
  }

  window.viewOrderDetail = (id) => {
    fetch('/api/history')
      .then(res => res.json())
      .then(data => {
        const order = data.find(o => o.id === id);
        modalBody.innerHTML = `
          <h2 style="font-family:'Montserrat';">ORDER DETAIL</h2>
          <div class="mt-4" style="background:#F9F9F9; padding:20px; border-radius:20px;">
            <p><strong>주소:</strong> ${order.address}</p>
            <p class="mt-2"><strong>배송 메모:</strong> ${order.deliveryNote}</p>
            <p class="mt-2 text-xs text-muted">※ 내부 처리 정보가 포함되어 있을 수 있습니다.</p>
          </div>
        `;
        modal.style.display = 'block';
      });
  };

  // 탭 전환
  function switchTab(btn, view) {
    [navPrint, navCart, navHistory].forEach(b => b.classList.remove('active'));
    [printView, cartView, historyView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navPrint.onclick = () => switchTab(navPrint, printView);
  navCart.onclick = () => switchTab(navCart, cartView);
  navHistory.onclick = () => { switchTab(navHistory, historyView); fetchHistory(); };

  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
