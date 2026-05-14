let allItems = [];
let allRegions = [];
let currentCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    initEventListeners();
});

async function fetchData() {
    try {
        const [itemsRes, regionsRes] = await Promise.all([
            fetch('/api/items'),
            fetch('/api/regions')
        ]);
        
        allItems = await itemsRes.json();
        allRegions = await regionsRes.json();
        
        populateRegions(allRegions);
        renderItems(allItems);
    } catch (err) {
        console.error('Fetch error:', err);
        document.getElementById('item-grid').innerHTML = '<p class="error">매물을 불러오지 못했습니다.</p>';
    }
}

function populateRegions(regions) {
    const select = document.getElementById('region-select');
    regions.forEach(reg => {
        const opt = document.createElement('option');
        opt.value = reg.name;
        opt.innerText = reg.name;
        select.appendChild(opt);
    });
}

function renderItems(items) {
    const grid = document.getElementById('item-grid');
    grid.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'item-card';
        if (item.id === 'i6') card.setAttribute('data-bug-id', 'site063-bug02');
        
        card.innerHTML = `
            <img src="${item.image}" class="item-img">
            <div class="item-title">${item.title}</div>
            <div class="item-price">${item.price.toLocaleString()}원</div>
            <div class="item-region">${item.region}</div>
            <div class="item-counts">
                <span>관심 ${item.likes}</span>
                <span>채팅 ${item.chats}</span>
            </div>
        `;
        
        card.addEventListener('click', () => openItemModal(item));
        grid.appendChild(card);
    });
}

function openItemModal(item) {
    const modal = document.getElementById('item-modal');
    const body = document.getElementById('modal-body');
    
    body.innerHTML = `
        <img src="${item.image}" class="modal-img-large">
        <h2>${item.title}</h2>
        <p class="item-price" style="font-size: 24px; color: var(--orange-main);">${item.price.toLocaleString()}원</p>
        <p class="item-region">${item.region} | ${item.category}</p>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid #EEE;">
        <p>상품 상태: ${item.status}</p>
        <p style="margin-top: 10px; color: #555;">이웃과 채팅으로 거래를 시작해보세요!</p>
        <button class="btn-inquiry" id="inquiry-btn">문의하기</button>
    `;
    
    const inquiryBtn = body.querySelector('#inquiry-btn');
    
    // INTENTIONAL GUI BUG: site063-bug03
    // Type: inquiry-button-no-response
    // Description: 특정 매물(i1: 에어팟 프로) 문의 버튼에 click listener를 연결하지 않아 문의 UI가 열리지 않음.
    if (item.id === 'i1') {
        inquiryBtn.setAttribute('data-bug-id', 'site063-bug03');
        // No listener added
    } else {
        inquiryBtn.addEventListener('click', () => {
            alert('채팅방으로 이동합니다.');
            modal.style.display = 'none';
        });
    }
    
    modal.style.display = 'block';
}

function initEventListeners() {
    // Category Filter
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.dataset.category;
            filterItems();
        });
    });

    // Region Select
    document.getElementById('region-select').addEventListener('change', filterItems);

    // Search
    document.getElementById('search-btn').addEventListener('click', filterItems);
    document.getElementById('search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') filterItems();
    });

    // Modal close
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('item-modal').style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('item-modal')) {
            document.getElementById('item-modal').style.display = 'none';
        }
    });
}

function filterItems() {
    const region = document.getElementById('region-select').value;
    const search = document.getElementById('search-input').value.toLowerCase();
    
    // INTENTIONAL GUI BUG: site063-bug01
    // Type: category-filter-mismatch
    // Description: 카테고리 필터가 "Electronics"일 때, 의도적으로 "Furniture" 상품을 포함하도록 오동작함.
    let filtered = allItems.filter(item => {
        const matchesRegion = region === 'All' || item.region === region;
        const matchesSearch = item.title.toLowerCase().includes(search);
        
        let matchesCategory = true;
        if (currentCategory !== 'All') {
            if (currentCategory === 'Electronics') {
                // BUG: Electronics 선택 시 Furniture 도 섞여 나오게 함
                matchesCategory = (item.category === 'Electronics' || item.category === 'Furniture');
            } else {
                matchesCategory = item.category === currentCategory;
            }
        }
        
        return matchesRegion && matchesSearch && matchesCategory;
    });
    
    renderItems(filtered);
}
