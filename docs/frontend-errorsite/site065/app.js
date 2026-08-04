let laundryItems = [];
let selectedItems = [];
let pickupSlots = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchLaundryItems();
    fetchPickupSlots();
    initEventListeners();
});

async function fetchLaundryItems() {
    try {
        const response = await fetch('/api/laundry-items');
        laundryItems = await response.json();
        renderItems(laundryItems);
    } catch (err) {
        console.error('Error fetching items:', err);
        document.getElementById('item-grid').innerHTML = '<p class="error">데이터 로드 실패</p>';
    }
}

async function fetchPickupSlots() {
    try {
        const response = await fetch('/api/pickup-slots');
        pickupSlots = await response.json();
        populateSlots(pickupSlots);
    } catch (err) {
        console.error('Error fetching slots:', err);
    }
}

function renderItems(items) {
    const grid = document.getElementById('item-grid');
    grid.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'laundry-card';
        card.innerHTML = `
            <div class="card-icon">${getIcon(item.category)}</div>
            <h3>${item.name}</h3>
            <p class="price">${item.price.toLocaleString()}원</p>
            <p style="font-size: 11px; color: #888;">소요 ${item.days}일</p>
        `;
        
        card.addEventListener('click', () => toggleItem(item, card));
        grid.appendChild(card);
    });
}

function getIcon(category) {
    switch(category) {
        case '생활세탁': return '👔';
        case '드라이': return '🧥';
        case '침구류': return '🛏️';
        case '아우터': return '🧥';
        case '신발': return '👟';
        default: return '🧺';
    }
}

function toggleItem(item, card) {
    const index = selectedItems.findIndex(i => i.id === item.id);
    if (index > -1) {
        selectedItems.splice(index, 1);
        card.classList.remove('selected');
    } else {
        selectedItems.push(item);
        card.classList.add('selected');
    }
    updateSummary();
}

function updateSummary() {
    const list = document.getElementById('selected-items-list');
    const totalDisplay = document.getElementById('total-price');
    
    if (selectedItems.length === 0) {
        list.innerHTML = '<p class="empty-msg">선택된 품목이 없습니다.</p>';
        totalDisplay.innerText = '0원';
        return;
    }
    
    list.innerHTML = selectedItems.map(item => `
        <div class="selected-item">
            <span>${item.name}</span>
            <span>${item.price.toLocaleString()}원</span>
        </div>
    `).join('');

    // INTENTIONAL GUI BUG: site065-bug01
    // Type: estimated-price-mismatch
    // Description: 예상 금액 계산 시 마지막 선택 품목 가격을 제외해 실제 선택 합계와 불일치함.
    let sum = 0;
    if (selectedItems.length > 0) {
        // 의도적으로 마지막 항목을 제외하고 합산
        for (let i = 0; i < selectedItems.length - 1; i++) {
            sum += selectedItems[i].price;
        }
        // 항목이 1개일 경우 0원이 표시되는 상황 방지를 위해 0개인 경우와 구분은 되지만 여전히 불일치함
    }
    
    totalDisplay.innerText = sum.toLocaleString() + '원';
}

function populateSlots(slots) {
    const dateSelect = document.getElementById('pickup-date');
    slots.forEach(slot => {
        const opt = document.createElement('option');
        opt.value = slot.date;
        opt.innerText = slot.date;
        dateSelect.appendChild(opt);
    });

    dateSelect.addEventListener('change', (e) => {
        const date = e.target.value;
        const timeSelect = document.getElementById('pickup-time');
        timeSelect.innerHTML = '<option value="">시간 선택</option>';
        
        const selectedSlot = slots.find(s => s.date === date);
        if (selectedSlot) {
            selectedSlot.times.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.innerText = t;
                timeSelect.appendChild(opt);
            });
        }
    });
}

function initEventListeners() {
    // Accordion
    const headers = document.querySelectorAll('.accordion-header');
    headers.forEach(h => {
        h.addEventListener('click', () => {
            const item = h.parentElement;
            item.classList.toggle('active');
            h.querySelector('span').innerText = item.classList.contains('active') ? '-' : '+';
        });
    });

    // Modal Close
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('reserve-modal').style.display = 'none';
    });

    // INTENTIONAL GUI BUG: site065-bug03
    // Type: laundry-reserve-button-no-response
    // Description: 수거 예약 버튼 selector를 의도적으로 틀리게 작성 (reserve-button vs reserve-btn)
    const reserveBtn = document.getElementById('reserve-button'); // 실제 ID는 reserve-btn 임
    if (reserveBtn) {
        reserveBtn.addEventListener('click', () => {
            if (selectedItems.length === 0) {
                alert('세탁 품목을 선택해주세요.');
                return;
            }
            document.getElementById('reserve-modal').style.display = 'block';
        });
    }
    
    // 올바른 리스너가 연결되지 않아 버튼 클릭 시 반응 없음.
}
