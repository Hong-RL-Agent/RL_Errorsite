let allLawyers = [];
let allTypes = [];
let selectedLawyer = null;
let selectedType = null;
let currentArea = 'All';

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    initEventListeners();
});

async function fetchData() {
    try {
        const [lawyersRes, typesRes] = await Promise.all([
            fetch('/api/lawyers'),
            fetch('/api/consultation-types')
        ]);
        allLawyers = await lawyersRes.json();
        allTypes = await typesRes.json();
        
        renderLawyers(allLawyers);
        renderTypes(allTypes);
    } catch (err) {
        console.error('Fetch error:', err);
        document.getElementById('lawyer-grid').innerHTML = '<p class="error">데이터 로드 실패</p>';
    }
}

function renderLawyers(lawyers) {
    const grid = document.getElementById('lawyer-grid');
    grid.innerHTML = '';
    
    lawyers.forEach(lawyer => {
        const card = document.createElement('div');
        card.className = 'lawyer-card';
        card.innerHTML = `
            <img src="${lawyer.image}" class="lawyer-img">
            <h3>${lawyer.name} 변호사</h3>
            <p class="lawyer-area">${getAreaName(lawyer.area)}</p>
            <div class="lawyer-meta">
                <p>경력: ${lawyer.exp}</p>
                <p>평점: ⭐ ${lawyer.rating}</p>
            </div>
            <button class="btn-card-reserve" id="btn-reserve-${lawyer.id}">상담 예약하기</button>
        `;
        
        const reserveBtn = card.querySelector(`#btn-reserve-${lawyer.id}`);
        
        // INTENTIONAL GUI BUG: site069-bug03
        // Type: legal-booking-button-no-response
        // Description: 특정 변호사(id: 2, 강소라) 예약 버튼에 click listener를 연결하지 않아 요약 패널이 변경되지 않음.
        if (lawyer.id === 2) {
            reserveBtn.setAttribute('data-bug-id', 'site069-bug03');
            // listener omitted
        } else {
            reserveBtn.addEventListener('click', () => {
                selectedLawyer = lawyer;
                renderSummary();
            });
        }
        
        card.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON') showLawyerDetail(lawyer);
        });

        grid.appendChild(card);
    });
}

function renderTypes(types) {
    const list = document.getElementById('type-list');
    list.innerHTML = '';
    
    types.forEach(type => {
        const card = document.createElement('div');
        card.className = 'type-card';
        card.innerHTML = `
            <div class="type-info">
                <h4>${type.name}</h4>
                <p>${type.desc} (${type.duration})</p>
            </div>
            <div class="type-price">${type.price.toLocaleString()}원</div>
        `;
        
        card.addEventListener('click', () => {
            document.querySelectorAll('.type-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedType = type;
            
            // INTENTIONAL GUI BUG: site069-bug01
            // Type: consultation-type-summary-mismatch
            // Description: 상담 유형 선택 후 state(selectedType)는 변경되나 renderSummary 호출을 생략하거나 고의로 누락하여 요약 정보가 갱신되지 않음.
            if (type.id !== 't1') { // t1(방문 상담)일 때만 정상 갱신, 나머지는 무시
                console.log('Type selected but summary update skipped (Intentional Bug)');
            } else {
                renderSummary();
            }
        });
        
        list.appendChild(card);
    });
}

function renderSummary() {
    const sLawyer = document.getElementById('summary-lawyer');
    const sType = document.getElementById('summary-type');
    const sPrice = document.getElementById('summary-price');
    
    if (selectedLawyer) {
        sLawyer.innerText = `${selectedLawyer.name} 변호사`;
    }
    
    // Note: Bug 01 will prevent this function from being called for t2, t3
    if (selectedType) {
        sType.innerText = selectedType.name;
        const total = (selectedLawyer ? selectedLawyer.price : 0) + selectedType.price;
        sPrice.innerText = `${total.toLocaleString()}원`;
    }
}

function showLawyerDetail(lawyer) {
    const modal = document.getElementById('lawyer-modal');
    const body = document.getElementById('modal-body');
    
    body.innerHTML = `
        <div style="display: flex; gap: 30px;">
            <img src="${lawyer.image}" style="width: 200px; height: 250px; border-radius: 12px; object-fit: cover;">
            <div>
                <h2 style="font-size: 32px; color: var(--navy-main);">${lawyer.name} 변호사</h2>
                <p style="color: var(--gold); font-weight: 700; margin-bottom: 20px;">${getAreaName(lawyer.area)} 전문</p>
                <p><strong>경력:</strong> ${lawyer.exp}</p>
                <p><strong>평점:</strong> ⭐ ${lawyer.rating}</p>
                <p style="margin-top: 20px; color: #555;">어려운 상황에서도 최선의 결과를 이끌어낼 수 있도록 정직하고 실력있게 변호하겠습니다.</p>
                <div style="margin-top: 30px;">
                    <strong>상담 가능 시간:</strong>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        ${lawyer.slots.map(s => `<span style="padding: 5px 10px; border: 1px solid #CCC; border-radius: 4px; font-size: 14px;">${s}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function getAreaName(area) {
    switch(area) {
        case 'Civil': return '민사법';
        case 'Criminal': return '형사법';
        case 'Contract': return '계약/기업법';
        case 'Family': return '가사/상속법';
        default: return '일반 법률';
    }
}

function initEventListeners() {
    // Area Filter
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentArea = chip.dataset.area;
            filterLawyers();
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
        document.getElementById('lawyer-modal').style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('lawyer-modal')) {
            document.getElementById('lawyer-modal').style.display = 'none';
        }
    });
}

function filterLawyers() {
    const filtered = allLawyers.filter(l => {
        return currentArea === 'All' || l.area === currentArea;
    });
    renderLawyers(filtered);
}
