document.addEventListener('DOMContentLoaded', () => {
    let allAccessories = [];
    let cart = [];
    let wishlist = [];

    const productGrid = document.getElementById('productGrid');
    const collectionGrid = document.getElementById('collectionGrid');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartBadge = document.getElementById('cartBadge');
    const wishlistBadge = document.getElementById('wishlistBadge');
    const cartSidebar = document.getElementById('cartSidebar');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Filters
    const materialFilter = document.getElementById('materialFilter');
    const priceRange = document.getElementById('priceRange');
    const priceValue = document.getElementById('priceValue');
    const giftOnly = document.getElementById('giftOnly');
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    const colorSwatches = document.querySelectorAll('.swatch');

    // Fetch Data
    async function init() {
        try {
            const [accRes, colRes] = await Promise.all([
                fetch('/api/accessories'),
                fetch('/api/collections')
            ]);
            allAccessories = await accRes.json();
            const collections = await colRes.json();
            
            renderProducts(allAccessories);
            renderCollections(collections);
        } catch (error) {
            console.error('Error loading data:', error);
            productGrid.innerHTML = '<p class="error">Failed to load beautiful things. Please try again.</p>';
        }
    }

    // Render Products
    function renderProducts(products) {
        productGrid.innerHTML = '';
        if (products.length === 0) {
            productGrid.innerHTML = '<p class="empty">No matches found for your refined taste.</p>';
            return;
        }

        products.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // INTENTIONAL GUI BUG: site083-bug02
            // Applied to a specific item to demonstrate overlap
            if (item.id === 'a001') {
                card.setAttribute('data-bug-id', 'site083-bug02');
            }

            const inWishlist = wishlist.includes(item.id);
            
            card.innerHTML = `
                <div class="product-img-wrapper" onclick="showProductModal('${item.id}')">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="product-details">
                    <div class="product-info-top">
                        <h4>${item.name}</h4>
                        <span class="product-price">$${item.price}</span>
                    </div>
                    <p style="font-size: 0.8rem; color: #888;">${item.material} | ${item.color}</p>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm add-to-cart-btn" 
                            data-id="${item.id}"
                            ${item.id === 'a004' ? 'data-bug-id="site083-bug03"' : ''}>
                            Add to Bag
                        </button>
                        <button class="btn-wishlist ${inWishlist ? 'active' : ''}" data-id="${item.id}">
                            ${inWishlist ? '♥' : '♡'}
                        </button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });

        attachProductEvents();
    }

    function attachProductEvents() {
        // Cart Buttons
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            const id = btn.getAttribute('data-id');

            // INTENTIONAL GUI BUG: site083-bug03
            // Type: accessory-cart-button-no-response
            // Description: 특정 악세서리 상품(a004)의 장바구니 버튼에 click listener를 연결하지 않아 장바구니가 변경되지 않음.
            if (id === 'a004') {
                return; // SKIP event attachment
            }

            btn.onclick = () => addToCart(id);
        });

        // Wishlist Buttons
        document.querySelectorAll('.btn-wishlist').forEach(btn => {
            const id = btn.getAttribute('data-id');
            btn.onclick = () => toggleWishlist(id);
        });
    }

    // Cart Logic
    function addToCart(id) {
        const item = allAccessories.find(a => a.id === id);
        cart.push(item);
        updateCartUI();
        openCart();
    }

    function updateCartUI() {
        cartItems.innerHTML = '';
        let total = 0;
        cartBadge.textContent = cart.length;

        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-msg">Your bag is empty.</p>';
            cartTotal.textContent = '$0.00';
            checkoutBtn.disabled = true;
            return;
        }

        cart.forEach((item, index) => {
            total += item.price;
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h5>${item.name}</h5>
                    <p>$${item.price}</p>
                    <button class="btn-text" style="font-size: 0.7rem;" onclick="removeFromCart(${index})">Remove</button>
                </div>
            `;
            cartItems.appendChild(div);
        });

        cartTotal.textContent = `$${total.toFixed(2)}`;
        checkoutBtn.disabled = false;
    }

    window.removeFromCart = (index) => {
        cart.splice(index, 1);
        updateCartUI();
    };

    // Wishlist Logic
    function toggleWishlist(id) {
        const index = wishlist.indexOf(id);
        if (index > -1) {
            wishlist.splice(index, 1);
        } else {
            wishlist.push(id);
        }
        updateWishlistBadge();
        renderProducts(filterAccessories());
    }

    function updateWishlistBadge() {
        // INTENTIONAL GUI BUG: site083-bug01
        // Type: wishlist-count-mismatch
        // Description: 찜한 상품 실제 배열 길이보다 하나 적은 수를 헤더 배지에 표시함.
        const count = wishlist.length > 0 ? wishlist.length - 1 : 0;
        wishlistBadge.textContent = count;
    }

    // Filter Logic
    function filterAccessories() {
        const selectedCats = Array.from(categoryCheckboxes)
            .filter(i => i.checked)
            .map(i => i.value);
        
        const matValue = materialFilter.value;
        const maxPrice = parseInt(priceRange.value);
        const giftOnlyVal = giftOnly.checked;
        
        const activeColor = document.querySelector('.swatch.active')?.getAttribute('data-color');

        return allAccessories.filter(item => {
            const matchesCat = selectedCats.length === 0 || selectedCats.includes(item.category);
            const matchesMat = matValue === 'all' || item.material === matValue;
            const matchesPrice = item.price <= maxPrice;
            const matchesGift = !giftOnlyVal || item.isGiftRecommended;
            const matchesColor = !activeColor || item.color === activeColor;

            return matchesCat && matchesMat && matchesPrice && matchesGift && matchesColor;
        });
    }

    // Event Listeners for Filters
    categoryCheckboxes.forEach(cb => {
        cb.onchange = () => renderProducts(filterAccessories());
    });

    materialFilter.onchange = () => renderProducts(filterAccessories());

    priceRange.oninput = () => {
        priceValue.textContent = `$${priceRange.value}`;
        renderProducts(filterAccessories());
    };

    giftOnly.onchange = () => renderProducts(filterAccessories());

    colorSwatches.forEach(swatch => {
        swatch.onclick = () => {
            if (swatch.classList.contains('active')) {
                swatch.classList.remove('active');
            } else {
                colorSwatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
            }
            renderProducts(filterAccessories());
        };
    });

    // Render Collections
    function renderCollections(collections) {
        collectionGrid.innerHTML = '';
        collections.forEach(col => {
            const card = document.createElement('div');
            card.className = 'collection-card';
            card.innerHTML = `
                <img src="${col.image}" alt="${col.name}">
                <div class="collection-overlay">
                    <h3>${col.name}</h3>
                    <p>${col.description}</p>
                </div>
            `;
            collectionGrid.appendChild(card);
        });
    }

    // Modal
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    const modalClose = document.querySelector('.modal-close');

    window.showProductModal = (id) => {
        const item = allAccessories.find(a => a.id === id);
        modalBody.innerHTML = `
            <div style="display: flex; gap: 40px; width: 100%;">
                <div style="flex: 1;">
                    <img src="${item.image}" style="width: 100%; border-radius: 8px;">
                </div>
                <div style="flex: 1;">
                    <span style="color: #d4a373; text-transform: uppercase; font-size: 0.8rem; font-weight: 600;">${item.category}</span>
                    <h2 style="font-family: serif; font-size: 2.5rem; margin: 10px 0;">${item.name}</h2>
                    <p style="font-size: 1.5rem; color: #e76f51; margin-bottom: 20px;">$${item.price}</p>
                    <p style="color: #666; margin-bottom: 30px;">This exquisite piece is crafted from premium ${item.material}. Each detail is meticulously finished to ensure a lasting shine and timeless appeal.</p>
                    <div style="margin-bottom: 20px;">
                        <strong>Material:</strong> ${item.material}<br>
                        <strong>Color:</strong> ${item.color}<br>
                        <strong>Gift Wrap:</strong> ${item.giftWrap ? 'Available' : 'Standard Box'}
                    </div>
                    <button class="btn btn-primary btn-block" onclick="addToCart('${item.id}'); document.getElementById('modal').style.display='none';">Add to Bag</button>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    };

    modalClose.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // Cart Sidebar Toggle
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const closeCart = document.getElementById('closeCart');

    function openCart() {
        cartSidebar.classList.add('open');
        // Basic sidebar animation/visibility via JS for simplicity
        cartSidebar.style.display = 'block';
    }

    function toggleCart() {
        if (cartSidebar.style.display === 'block') {
            cartSidebar.style.display = 'none';
        } else {
            openCart();
        }
    }

    cartToggleBtn.onclick = toggleCart;
    closeCart.onclick = () => cartSidebar.style.display = 'none';

    // Start
    init();
});
