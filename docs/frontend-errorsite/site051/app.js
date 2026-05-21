document.addEventListener('DOMContentLoaded', () => {
    let state = {
        desserts: [],
        filteredDesserts: [],
        cart: [],
        selectedCategory: 'all',
        selectedSlot: null
    };

    const dessertsGrid = document.getElementById('desserts-grid');
    const cartItemsList = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const summaryTotalQty = document.getElementById('summary-total-qty');
    const summaryTotalPrice = document.getElementById('summary-total-price');
    const menuSearch = document.getElementById('menu-search');
    const categoryFilters = document.querySelectorAll('#category-filters .filter-btn');
    const pickupSlotsGrid = document.getElementById('pickup-slots');

    // Initialize
    fetchDesserts();
    fetchPickupSlots();

    async function fetchDesserts() {
        try {
            const response = await fetch('/api/desserts');
            state.desserts = await response.json();
            state.filteredDesserts = [...state.desserts];
            renderDesserts();
        } catch (error) {
            dessertsGrid.innerHTML = '<div class="error">메뉴 정보를 불러오지 못했습니다.</div>';
        }
    }

    async function fetchPickupSlots() {
        try {
            const response = await fetch('/api/pickup-slots');
            const slots = await response.json();
            renderPickupSlots(slots);
        } catch (error) {
            pickupSlotsGrid.innerHTML = '<div class="error">시간 정보를 불러오지 못했습니다.</div>';
        }
    }

    function renderDesserts() {
        dessertsGrid.innerHTML = '';
        state.filteredDesserts.forEach(item => {
            const card = document.createElement('div');
            card.className = 'dessert-card';
            card.innerHTML = `
                <div class="dessert-img">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="dessert-info">
                    <h3>${item.name}</h3>
                    <div class="price">${item.price.toLocaleString()}원</div>
                    <div class="allergies">알레르기: ${item.allergies}</div>
                    <div class="card-actions">
                        <div class="qty-control">
                            <button class="qty-btn minus" data-id="${item.id}">-</button>
                            <span class="qty-val" id="qty-${item.id}">1</span>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="btn btn-primary btn-order" data-id="${item.id}" 
                                ${item.id === 5 ? 'data-bug-id="site051-bug03"' : ''}>
                            주문하기
                        </button>
                    </div>
                </div>
            `;

            // Qty Logic
            const qtyVal = card.querySelector('.qty-val');
            card.querySelector('.plus').addEventListener('click', () => {
                qtyVal.textContent = parseInt(qtyVal.textContent) + 1;
            });
            card.querySelector('.minus').addEventListener('click', () => {
                const current = parseInt(qtyVal.textContent);
                if (current > 1) qtyVal.textContent = current - 1;
            });

            // Order Logic
            const orderBtn = card.querySelector('.btn-order');
            
            // INTENTIONAL GUI BUG: site051-bug03
            // Description: 특정 시즌 디저트(ID:5, 제주 말차 파운드)의 주문 버튼에 click listener를 연결하지 않음.
            if (item.id !== 5) {
                orderBtn.addEventListener('click', () => {
                    const qty = parseInt(qtyVal.textContent);
                    addToCart(item, qty);
                });
            } else {
                console.warn('Order button for item 5 is inactive (intended bug)');
            }

            dessertsGrid.appendChild(card);
        });
    }

    function addToCart(item, qty) {
        const existing = state.cart.find(c => c.id === item.id);
        if (existing) {
            existing.qty += qty;
        } else {
            state.cart.push({ ...item, qty });
        }
        updateCart();
    }

    function updateCart() {
        cartCount.textContent = state.cart.length;
        renderCartItems();
        updateCartSummary();
    }

    function renderCartItems() {
        if (state.cart.length === 0) {
            cartItemsList.innerHTML = '<p class="empty-msg">장바구니가 비어 있습니다.</p>';
            return;
        }

        cartItemsList.innerHTML = '';
        state.cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <span>${item.name}</span>
                <span class="qty">x${item.qty}</span>
                <span>${(item.price * item.qty).toLocaleString()}원</span>
            `;
            cartItemsList.appendChild(div);
        });
    }

    function updateCartSummary() {
        let totalPrice = 0;
        let totalQty = 0;

        // Correct total price calculation
        state.cart.forEach(item => {
            totalPrice += item.price * item.qty;
        });

        // INTENTIONAL GUI BUG: site051-bug01
        // Type: quantity-total-mismatch
        // Description: 주문 요약 총 수량 계산에서 일부 item 수량을 제외해 카드 수량 합계와 불일치함.
        // Implementation: If more than 1 type of item is in cart, skip the last one in qty count.
        if (state.cart.length > 1) {
            for (let i = 0; i < state.cart.length - 1; i++) {
                totalQty += state.cart[i].qty;
            }
        } else if (state.cart.length === 1) {
            // For a single item, show it normally or slightly off? 
            // Let's make it skip half for a specific item if it's the only one.
            totalQty = state.cart[0].qty;
            if (totalQty > 2) totalQty -= 1; // Subtle error
        }

        summaryTotalQty.textContent = totalQty;
        summaryTotalPrice.textContent = totalPrice.toLocaleString() + '원';
    }

    function renderPickupSlots(slots) {
        pickupSlotsGrid.innerHTML = '';
        slots.forEach(slot => {
            if (!slot.available) return;
            slot.times.forEach(time => {
                const btn = document.createElement('div');
                btn.className = 'slot-btn';
                btn.textContent = time;
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    state.selectedSlot = `${slot.date} ${time}`;
                });
                pickupSlotsGrid.appendChild(btn);
            });
        });
    }

    // Filter Logic
    categoryFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedCategory = btn.dataset.category;
            applyFilters();
        });
    });

    menuSearch.addEventListener('input', applyFilters);

    function applyFilters() {
        const query = menuSearch.value.toLowerCase();
        state.filteredDesserts = state.desserts.filter(item => {
            const matchesCategory = state.selectedCategory === 'all' || item.category === state.selectedCategory;
            const matchesSearch = item.name.toLowerCase().includes(query);
            return matchesCategory && matchesSearch;
        });
        renderDesserts();
    }
});
