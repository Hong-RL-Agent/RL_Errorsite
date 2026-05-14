document.addEventListener('DOMContentLoaded', () => {
    let allGlasses = [];
    let lensOptions = [];
    let cart = {
        item: null,
        lens: null
    };

    // State for Bug 01
    let selectedLensOption = null;

    // DOM Elements
    const productGrid = document.getElementById('product-grid');
    const categoryTitle = document.getElementById('category-title');
    const searchInput = document.getElementById('search-input');
    const frameFilters = document.querySelectorAll('#frame-filter input');
    const cartSummary = document.getElementById('summary-content');
    const lensSummaryBox = document.getElementById('lens-summary-box');
    const totalPriceEl = document.getElementById('total-price');
    const productModal = document.getElementById('product-modal');
    const closeModal = document.querySelector('.close-modal');
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const cartSummaryPanel = document.getElementById('cart-summary');
    const closeSummaryBtn = document.getElementById('close-summary');

    // Bug 01 related elements
    const selectedLensNameEl = document.getElementById('selected-lens-name');
    const selectedLensPriceEl = document.getElementById('selected-lens-price');

    // Initialize
    async function init() {
        try {
            const [glassesRes, lensRes] = await Promise.all([
                fetch('/api/glasses'),
                fetch('/api/lens-options')
            ]);
            
            allGlasses = await glassesRes.json();
            lensOptions = await lensRes.json();
            
            // Set default lens for Bug 01 logic
            selectedLensOption = lensOptions[0];
            
            renderProducts(allGlasses);
        } catch (error) {
            console.error('Failed to load data:', error);
            productGrid.innerHTML = '<div class="error">Failed to load collection. Please try again later.</div>';
        }
    }

    // Render Products
    function renderProducts(products) {
        productGrid.innerHTML = '';
        if (products.length === 0) {
            productGrid.innerHTML = '<div class="no-results">No frames found matching your criteria.</div>';
            return;
        }

        products.forEach(item => {
            const card = document.createElement('div');
            card.className = 'product-card';
            
            // Bug 02: Force ratio break on a specific item (G005)
            if (item.id === 'G005') {
                card.classList.add('bug-ratio');
                card.setAttribute('data-bug-id', 'site071-bug02');
            }

            card.innerHTML = `
                <div class="image-container">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="product-info">
                    <h4>${item.name}</h4>
                    <p class="product-meta">${item.type} | ${item.material}</p>
                    <div class="color-swatches">
                        <div class="swatch" style="background: ${item.color.toLowerCase().includes('black') ? '#000' : (item.color.toLowerCase().includes('gold') ? '#D4AF37' : '#AAA')}"></div>
                    </div>
                    <p class="product-price">${item.price.toLocaleString()} KRW</p>
                    <div class="card-actions">
                        <button class="tryon-btn" data-id="${item.id}">Try-on</button>
                        <button class="add-btn" data-id="${item.id}">Detail</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });

        // Add event listeners to buttons
        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', (e) => openProductModal(e.target.dataset.id));
        });

        document.querySelectorAll('.tryon-btn').forEach(btn => {
            const id = btn.dataset.id;
            
            // INTENTIONAL GUI BUG: site071-bug03
            // Type: try-on-button-no-response
            // Description: 특정 안경 상품의 가상 착용 버튼에 click listener를 연결하지 않아 모달이 열리지 않음.
            if (id === 'G003') {
                btn.setAttribute('data-bug-id', 'site071-bug03');
                // No listener attached for G003
            } else {
                btn.addEventListener('click', () => {
                    openTryonModal(id);
                });
            }
        });
    }

    // Filter Logic
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedFrames = Array.from(frameFilters)
            .filter(i => i.checked)
            .map(i => i.value);

        const filtered = allGlasses.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            const matchesFrame = selectedFrames.length === 0 || selectedFrames.includes(item.type);
            return matchesSearch && matchesFrame;
        });

        renderProducts(filtered);
    }

    // Modal Logic
    function openProductModal(id) {
        const product = allGlasses.find(g => g.id === id);
        if (!product) return;

        cart.item = product;
        document.getElementById('modal-img').src = product.image;
        document.getElementById('modal-title').textContent = product.name;
        document.getElementById('modal-type').textContent = `${product.type} Frame`;
        document.getElementById('modal-price').textContent = `${product.price.toLocaleString()} KRW`;

        // Render Lens Options
        const lensList = document.getElementById('lens-options-list');
        lensList.innerHTML = '';
        lensOptions.forEach(opt => {
            const div = document.createElement('div');
            div.className = `lens-card ${opt.id === (cart.lens?.id || 'L001') ? 'selected' : ''}`;
            div.innerHTML = `
                <h5>${opt.name} <span>+${opt.extraPrice.toLocaleString()} KRW</span></h5>
                <p>${opt.description}</p>
            `;
            div.onclick = () => {
                // Update internal state
                selectedLensOption = opt;
                cart.lens = opt;
                
                // Update UI selection state in modal
                document.querySelectorAll('.lens-card').forEach(c => c.classList.remove('selected'));
                div.classList.add('selected');
            };
            lensList.appendChild(div);
        });

        productModal.style.display = 'block';
    }

    // Cart Logic
    function renderCartSummary() {
        if (!cart.item) {
            cartSummary.innerHTML = '<p class="empty-msg">Select a frame to start</p>';
            lensSummaryBox.style.display = 'none';
            document.getElementById('summary-footer').style.display = 'none';
            return;
        }

        cartSummary.innerHTML = `
            <div class="cart-item">
                <span>${cart.item.name}</span>
                <span>${cart.item.price.toLocaleString()} KRW</span>
            </div>
        `;

        lensSummaryBox.style.display = 'block';
        
        // INTENTIONAL GUI BUG: site071-bug01
        // Type: lens-option-summary-mismatch
        // Description: 렌즈 옵션 변경 후 장바구니 요약의 렌즈 옵션 값을 갱신하지 않아 이전 값이 표시됨.
        // We use a hardcoded value or don't update this part when renderCartSummary is called again
        // Actually, the bug description says it shows the *previous* or *initial* value.
        // To implement this, we only set the text once or use a stale reference.
        
        if (!selectedLensNameEl.getAttribute('data-initialized')) {
             selectedLensNameEl.textContent = 'Basic Clear'; // Default initial value
             selectedLensPriceEl.textContent = '+0 KRW';
             selectedLensNameEl.setAttribute('data-initialized', 'true');
        }
        // Even if selectedLensOption changes, we don't update selectedLensNameEl here.
        // The total price will be correct though, making the UI inconsistent.

        const total = cart.item.price + (cart.lens?.extraPrice || 0);
        totalPriceEl.textContent = `${total.toLocaleString()} KRW`;
        document.getElementById('summary-footer').style.display = 'block';
        document.getElementById('cart-count').textContent = '1';
    }

    function openTryonModal(id) {
        const product = allGlasses.find(g => g.id === id);
        document.getElementById('tryon-frame').src = product.image;
        document.getElementById('tryon-modal').style.display = 'block';
    }

    // Event Listeners
    searchInput.addEventListener('input', filterProducts);
    frameFilters.forEach(f => f.addEventListener('change', filterProducts));

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const cat = e.target.dataset.category;
            categoryTitle.textContent = cat;
            const filtered = allGlasses.filter(g => g.category === cat);
            renderProducts(filtered);
        });
    });

    document.getElementById('logo').addEventListener('click', () => {
        categoryTitle.textContent = 'All Collections';
        renderProducts(allGlasses);
    });

    document.getElementById('add-to-cart-modal').addEventListener('click', () => {
        renderCartSummary();
        productModal.style.display = 'none';
        cartSummaryPanel.style.display = 'block';
    });

    cartToggleBtn.addEventListener('click', () => {
        cartSummaryPanel.style.display = cartSummaryPanel.style.display === 'block' ? 'none' : 'block';
    });

    closeSummaryBtn.addEventListener('click', () => {
        cartSummaryPanel.style.display = 'none';
    });

    closeModal.addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    document.querySelector('.close-tryon').addEventListener('click', () => {
        document.getElementById('tryon-modal').style.display = 'none';
    });

    window.onclick = (e) => {
        if (e.target == productModal) productModal.style.display = 'none';
        if (e.target == document.getElementById('tryon-modal')) document.getElementById('tryon-modal').style.display = 'none';
    };

    init();
});
