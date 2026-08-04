let lunchboxes = [];
let nutritionData = [];
let cart = [];
let currentType = 'All';
let selectedOptions = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    initEventListeners();
});

async function fetchData() {
    try {
        const [boxesRes, nutritionRes] = await Promise.all([
            fetch('/api/lunchboxes'),
            fetch('/api/nutrition')
        ]);
        lunchboxes = await boxesRes.json();
        nutritionData = await nutritionRes.json();
        renderProducts(lunchboxes);
    } catch (err) {
        console.error('Fetch error:', err);
        document.getElementById('product-grid').innerHTML = '<p class="error">데이터 로드 실패</p>';
    }
}

function renderProducts(items) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${item.image}" class="product-img">
            <div class="product-info">
                <h3>${item.name}</h3>
                <div class="product-meta">
                    <span class="calories">${item.calories}kcal</span>
                    <span class="price">${item.price.toLocaleString()}원</span>
                </div>
                <p class="ingredients">${item.ingredients.join(', ')}</p>
                <div class="card-actions">
                    <div class="qty-controls">
                        <button class="btn-minus" data-id="${item.id}">-</button>
                        <span id="qty-${item.id}">1</span>
                        <button class="btn-plus" data-id="${item.id}">+</button>
                    </div>
                    <button class="btn-add" data-id="${item.id}">담기</button>
                </div>
                <button class="btn-link" style="margin-top: 10px; font-size: 12px; border:none; background:none; color:var(--lime-green); cursor:pointer;" data-id="${item.id}">영양 정보 보기</button>
            </div>
        `;
        
        // Quantity Handlers
        card.querySelector('.btn-plus').addEventListener('click', () => {
            const span = document.getElementById(`qty-${item.id}`);
            span.innerText = parseInt(span.innerText) + 1;
        });
        
        card.querySelector('.btn-minus').addEventListener('click', () => {
            const span = document.getElementById(`qty-${item.id}`);
            const val = parseInt(span.innerText);
            if (val > 1) span.innerText = val - 1;
        });

        // Add to Cart
        card.querySelector('.btn-add').addEventListener('click', () => {
            const qty = parseInt(document.getElementById(`qty-${item.id}`).innerText);
            addToCart(item, qty);
        });

        // Nutrition Modal
        card.querySelector('.btn-link').addEventListener('click', () => {
            showNutrition(item.id);
        });

        grid.appendChild(card);
    });
}

function addToCart(item, qty) {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
        existing.qty += qty;
    } else {
        cart.push({ ...item, qty });
    }
    updateCart();
}

function updateCart() {
    const itemsList = document.getElementById('cart-items');
    const totalDisplay = document.getElementById('cart-total');
    
    if (cart.length === 0) {
        itemsList.innerHTML = '<p class="empty-msg">선택한 메뉴가 없습니다.</p>';
        totalDisplay.innerText = '0원';
        return;
    }
    
    itemsList.innerHTML = cart.map(item => `
        <div class="cart-item">
            <span>${item.name} (x${item.qty})</span>
            <span>${(item.price * item.qty).toLocaleString()}원</span>
        </div>
    `).join('');
    
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    totalDisplay.innerText = total.toLocaleString() + '원';
    
    renderOptionSummary();
}

function renderOptionSummary() {
    const summary = document.getElementById('option-summary');
    summary.innerHTML = '';
    
    // selectedOptions is updated by checkbox listeners
    selectedOptions.forEach(opt => {
        const span = document.createElement('div');
        span.innerText = `✔️ ${opt}`;
        summary.appendChild(span);

        // INTENTIONAL GUI BUG: site066-bug01
        // Type: order-option-summary-duplicate
        // Description: 주문 요약 렌더링 시 특정 선택 옵션("Less Rice")을 추가로 append하여 같은 옵션이 두 번 표시됨.
        if (opt === 'Less Rice') {
            const duplicateSpan = document.createElement('div');
            duplicateSpan.innerText = `✔️ ${opt}`;
            summary.appendChild(duplicateSpan);
        }
    });
}

function showNutrition(id) {
    const modal = document.getElementById('nutrition-modal');
    const body = document.getElementById('modal-body');
    const data = nutritionData.find(n => n.id === id);
    const box = lunchboxes.find(b => b.id === id);
    
    if (!data || !box) return;
    
    body.innerHTML = `
        <h2>${box.name} 영양 정보</h2>
        <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="nut-card">탄수화물: <strong>${data.carb}g</strong></div>
            <div class="nut-card">단백질: <strong>${data.protein}g</strong></div>
            <div class="nut-card">지방: <strong>${data.fat}g</strong></div>
            <div class="nut-card">나트륨: <strong>${data.sodium}mg</strong></div>
        </div>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">칼로리: ${box.calories}kcal</p>
    `;
    
    modal.style.display = 'block';
}

function initEventListeners() {
    // Type Filter
    const typeItems = document.querySelectorAll('#type-filter li');
    typeItems.forEach(li => {
        li.addEventListener('click', () => {
            typeItems.forEach(l => l.classList.remove('active'));
            li.classList.add('active');
            currentType = li.dataset.type;
            filterProducts();
        });
    });

    // Calorie Filter
    document.getElementById('calorie-filter').addEventListener('change', filterProducts);

    // Search
    document.getElementById('menu-search').addEventListener('input', filterProducts);

    // Options Checkboxes
    document.querySelectorAll('.opt-check').forEach(chk => {
        chk.addEventListener('change', () => {
            selectedOptions = Array.from(document.querySelectorAll('.opt-check:checked')).map(c => c.value);
            renderOptionSummary();
        });
    });

    // Accordion
    document.querySelectorAll('.accordion-header').forEach(h => {
        h.addEventListener('click', () => {
            const item = h.parentElement;
            item.classList.toggle('active');
            h.querySelector('span').innerText = item.classList.contains('active') ? '-' : '+';
        });
    });

    // Modal Close
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('nutrition-modal').style.display = 'none';
    });

    // INTENTIONAL GUI BUG: site066-bug03
    // Type: order-confirm-button-no-response
    // Description: 주문 확인 버튼 selector를 의도적으로 틀리게 작성 (order-complete-button vs order-confirm-btn)
    const orderBtn = document.getElementById('order-complete-button'); // 실제 ID는 order-confirm-btn
    if (orderBtn) {
        orderBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('도시락을 먼저 담아주세요.');
                return;
            }
            alert('주문이 정상적으로 접수되었습니다!');
            cart = [];
            updateCart();
        });
    }
}

function filterProducts() {
    const calFilter = document.getElementById('calorie-filter').value;
    const search = document.getElementById('menu-search').value.toLowerCase();
    
    const filtered = lunchboxes.filter(box => {
        const matchesType = currentType === 'All' || box.type === currentType;
        const matchesSearch = box.name.toLowerCase().includes(search);
        
        let matchesCal = true;
        if (calFilter === 'low') matchesCal = box.calories <= 500;
        if (calFilter === 'high') matchesCal = box.calories > 500;
        
        return matchesType && matchesSearch && matchesCal;
    });
    
    renderProducts(filtered);
}
