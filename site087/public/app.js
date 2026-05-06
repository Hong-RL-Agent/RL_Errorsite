document.addEventListener('DOMContentLoaded', () => {
    let allItems = [];
    let cart = [];
    
    const productGrid = document.getElementById('productGrid');
    const orderItems = document.getElementById('orderItems');
    const orderTotal = document.getElementById('orderTotal');
    const cartBadge = document.getElementById('cartBadge');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Filters
    const typeRadios = document.querySelectorAll('input[name="type"]');
    const allergyCheckboxes = document.querySelectorAll('input[name="allergy"]');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const bestOnly = document.getElementById('bestOnly');
    const searchInput = document.getElementById('searchInput');

    // Fetch Data
    async function init() {
        try {
            const response = await fetch('/api/bakery-items');
            allItems = await response.json();
            renderItems(allItems);
        } catch (error) {
            console.error('Error loading bakery items:', error);
            productGrid.innerHTML = '<p class="error">The oven is cold. Please refresh.</p>';
        }
    }

    // Render Items
    function renderItems(items) {
        productGrid.innerHTML = '';
        if (items.length === 0) {
            productGrid.innerHTML = '<p class="empty-msg">No crumbs found. Try another search.</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // INTENTIONAL GUI BUG: site087-bug01
            // Type: allergy-tag-missing-render
            // Description: 특정 상품(b005) 카드에서 allergyTags 렌더링을 건너뛰어 상세 모달과 알레르기 정보가 불일치함.
            const shouldRenderAllergy = item.id !== 'b005';
            const allergyBugAttr = item.id === 'b005' ? 'data-bug-id="site087-bug01"' : '';

            const isTargetBug3 = item.id === 'b004';

            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="product-img" onclick="showItemModal('${item.id}')">
                <div class="product-content">
                    ${item.isBest ? '<span class="product-badge">BEST SELLER</span>' : ''}
                    <h4>${item.name}</h4>
                    <p class="product-price">₩${item.price.toLocaleString()}</p>
                    <div class="allergy-tags" ${allergyBugAttr}>
                        ${shouldRenderAllergy ? item.allergyTags.map(tag => `<span class="tag">${tag}-Free</span>`).join('') : '<!-- Bug: Tags skipped -->'}
                    </div>
                    <div class="product-actions">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                            <span id="qty-${item.id}">1</span>
                            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                        </div>
                        <button class="btn btn-primary btn-block order-btn" 
                            data-id="${item.id}"
                            ${isTargetBug3 ? 'data-bug-id="site087-bug03"' : ''}>
                            Add to Basket
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });

        attachOrderEvents();
    }

    function attachOrderEvents() {
        document.querySelectorAll('.order-btn').forEach(btn => {
            const id = btn.getAttribute('data-id');

            // INTENTIONAL GUI BUG: site087-bug03
            // Type: bakery-order-button-no-response
            // Description: 특정 시즌 케이크(b004) 주문 버튼에 click listener를 연결하지 않아 주문 요약이 변경되지 않음.
            if (id === 'b004') {
                return; // SKIP event attachment
            }

            btn.onclick = () => addToCart(id);
        });
    }

    // Quantity Control
    window.updateQty = (id, delta) => {
        const qtyEl = document.getElementById(`qty-${id}`);
        let currentQty = parseInt(qtyEl.textContent);
        currentQty = Math.max(1, currentQty + delta);
        qtyEl.textContent = currentQty;
    };

    // Cart Logic
    function addToCart(id) {
        const item = allItems.find(i => i.id === id);
        const qty = parseInt(document.getElementById(`qty-${id}`).textContent);
        
        const existing = cart.find(c => c.id === id);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ ...item, qty });
        }
        
        updateOrderUI();
    }

    function updateOrderUI() {
        orderItems.innerHTML = '';
        let total = 0;
        let totalCount = 0;

        if (cart.length === 0) {
            orderItems.innerHTML = '<p class="empty-msg">No items in your basket yet.</p>';
            orderTotal.textContent = '₩0';
            cartBadge.textContent = '0';
            checkoutBtn.disabled = true;
            return;
        }

        cart.forEach((c, index) => {
            total += c.price * c.qty;
            totalCount += c.qty;
            const div = document.createElement('div');
            div.className = 'order-item';
            div.innerHTML = `
                <span>${c.name} x ${c.qty}</span>
                <span>₩${(c.price * c.qty).toLocaleString()}</span>
                <button onclick="removeFromCart(${index})" style="background:none; border:none; color:white; cursor:pointer; font-size:0.7rem; margin-left:10px;">Remove</button>
            `;
            orderItems.appendChild(div);
        });

        orderTotal.textContent = `₩${total.toLocaleString()}`;
        cartBadge.textContent = totalCount;
        checkoutBtn.disabled = false;
    }

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateOrderUI();
    };

    // Filter Logic
    function filterItems() {
        const type = document.querySelector('input[name="type"]:checked').value;
        const selectedAllergies = Array.from(allergyCheckboxes)
            .filter(i => i.checked)
            .map(i => i.value);
        const maxPrice = parseInt(priceRange.value);
        const isBest = bestOnly.checked;
        const search = searchInput.value.toLowerCase();

        return allItems.filter(item => {
            const matchesType = type === 'all' || item.type === type;
            // The request said "Allergy Tags Filter". Usually means "exclude if contains tag" or "only if doesn't contain".
            // Let's implement it as "Show items that are SAFE for the selected allergies" (meaning they don't have the tag).
            const isSafe = selectedAllergies.length === 0 || !item.allergyTags.some(tag => selectedAllergies.includes(tag));
            
            const matchesPrice = item.price <= maxPrice;
            const matchesBest = !isBest || item.isBest;
            const matchesSearch = item.name.toLowerCase().includes(search);

            return matchesType && isSafe && matchesPrice && matchesBest && matchesSearch;
        });
    }

    // Filter Listeners
    typeRadios.forEach(r => r.onchange = () => renderItems(filterItems()));
    allergyCheckboxes.forEach(c => c.onchange = () => renderItems(filterItems()));
    priceRange.oninput = () => {
        priceValue.textContent = `₩${parseInt(priceRange.value).toLocaleString()}`;
        renderItems(filterItems());
    };
    bestOnly.onchange = () => renderItems(filterItems());
    searchInput.oninput = () => renderItems(filterItems());

    // Modals
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    const cakeModal = document.getElementById('cakeModal');

    window.showItemModal = (id) => {
        const item = allItems.find(i => i.id === id);
        modalBody.innerHTML = `
            <div style="display: flex; gap: 30px;">
                <img src="${item.image}" style="width: 250px; height: 250px; border-radius: 15px; object-fit: cover;">
                <div>
                    <span class="product-badge" style="background:#5d4037; color:white;">${item.type}</span>
                    <h2 style="font-family: serif; margin: 10px 0;">${item.name}</h2>
                    <p style="font-size: 1.5rem; color: #ff8f00; font-weight: 700; margin-bottom: 20px;">₩${item.price.toLocaleString()}</p>
                    <div style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 5px;">Allergy Info</h4>
                        <div class="allergy-tags">
                            ${item.allergyTags.map(tag => `<span class="tag">${tag}-Free</span>`).join('')}
                        </div>
                    </div>
                    <p style="color: #666; font-size: 0.9rem;">Freshly baked everyday with premium ingredients. Available for pickup between 10:00 - 20:00.</p>
                    <button class="btn btn-primary btn-block" style="margin-top: 30px;" onclick="addToCart('${item.id}'); closeModal();">Add to Basket</button>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    };

    window.closeModal = () => modal.style.display = 'none';
    window.openCakeModal = () => cakeModal.style.display = 'block';
    window.closeCakeModal = () => cakeModal.style.display = 'none';

    window.onclick = (e) => {
        if (e.target == modal) closeModal();
        if (e.target == cakeModal) closeCakeModal();
    };

    // Start
    init();
});
