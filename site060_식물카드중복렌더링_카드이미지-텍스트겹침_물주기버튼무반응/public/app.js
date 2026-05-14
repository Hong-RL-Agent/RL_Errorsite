let allPlants = [];
let allTasks = [];
let currentFilter = 'All';

document.addEventListener('DOMContentLoaded', () => {
    fetchPlants();
    fetchTasks();
    initEventListeners();
});

async function fetchPlants() {
    try {
        const response = await fetch('/api/plants');
        allPlants = await response.json();
        renderPlants(allPlants);
    } catch (error) {
        console.error('Error fetching plants:', error);
        document.getElementById('plant-grid').innerHTML = '<div class="error">데이터를 불러오는데 실패했습니다.</div>';
    }
}

async function fetchTasks() {
    try {
        const response = await fetch('/api/care-tasks');
        allTasks = await response.json();
        renderTasks(allTasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        document.getElementById('task-list').innerHTML = '<div class="error">데이터를 불러오는데 실패했습니다.</div>';
    }
}

function renderPlants(plants) {
    const grid = document.getElementById('plant-grid');
    grid.innerHTML = '';

    plants.forEach(plant => {
        const card = createPlantCard(plant);
        grid.appendChild(card);
    });

    // INTENTIONAL GUI BUG: site060-bug01
    // Type: duplicate-plant-card-render
    // Description: 특정 식물 필터 렌더링 시 plant 배열에 기존 항목을 추가로 append하여 카드가 중복 표시됨.
    if (currentFilter !== 'All' && plants.length > 0) {
        const duplicateCard = createPlantCard(plants[0]);
        duplicateCard.style.border = '2px solid transparent'; // 눈에 띄지 않게 처리
        grid.appendChild(duplicateCard);
    }
}

function createPlantCard(plant) {
    const div = document.createElement('div');
    div.className = 'plant-card';
    div.innerHTML = `
        <img src="${plant.image}" alt="${plant.name}">
        <div class="card-body">
            <span class="card-tag">${plant.type}</span>
            <h3>${plant.name}</h3>
            <p class="card-info">상태: <strong>${plant.status}</strong></p>
            <p class="card-info">마지막 물주기: <span id="last-watered-${plant.id}">${plant.lastWatered}</span></p>
            <div class="card-actions">
                <button class="btn-card water-btn" data-id="${plant.id}">물주기 기록</button>
                <button class="btn-card fill detail-btn" data-id="${plant.id}">상세 보기</button>
            </div>
        </div>
    `;

    const waterBtn = div.querySelector('.water-btn');
    
    // INTENTIONAL GUI BUG: site060-bug03
    // Type: watering-record-button-no-response
    // Description: 특정 식물(p2: Snake Plant)의 물주기 기록 버튼에 click listener를 연결하지 않아 날짜 상태가 갱신되지 않음.
    if (plant.id === 'p2') {
        waterBtn.setAttribute('data-bug-id', 'site060-bug03');
        // No listener added for p2
    } else {
        waterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            recordWatering(plant.id);
        });
    }

    div.querySelector('.detail-btn').addEventListener('click', () => {
        openModal(plant);
    });

    return div;
}

function recordWatering(plantId) {
    const today = new Date().toISOString().split('T')[0];
    const dateSpan = document.getElementById(`last-watered-${plantId}`);
    if (dateSpan) {
        dateSpan.innerText = today;
        alert(`${plantId} 물주기가 기록되었습니다.`);
    }
}

function renderTasks(tasks) {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const plant = allPlants.find(p => p.id === task.plantId);
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        div.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-info">
                <span class="task-type">${task.type}</span>
                <span class="task-plant">${plant ? plant.name : '알 수 없는 식물'}</span>
            </div>
        `;
        
        div.querySelector('input').addEventListener('change', (e) => {
            task.completed = e.target.checked;
            div.classList.toggle('completed', task.completed);
        });

        taskList.appendChild(div);
    });
}

function initEventListeners() {
    // Search
    document.getElementById('plant-search').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allPlants.filter(p => 
            p.name.toLowerCase().includes(term) || p.type.toLowerCase().includes(term)
        );
        renderPlants(filtered);
    });

    // Filters
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            
            const filtered = currentFilter === 'All' 
                ? allPlants 
                : allPlants.filter(p => p.type === currentFilter);
            
            renderPlants(filtered);
        });
    });

    // Accordion
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
            header.querySelector('span').innerText = item.classList.contains('active') ? '-' : '+';
        });
    });

    // Modal close
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('plant-modal').style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('plant-modal')) {
            document.getElementById('plant-modal').style.display = 'none';
        }
    });
}

function openModal(plant) {
    const modal = document.getElementById('plant-modal');
    const body = document.getElementById('modal-body');
    body.innerHTML = `
        <img src="${plant.image}" class="modal-img">
        <h2>${plant.name}</h2>
        <p><strong>종류:</strong> ${plant.type}</p>
        <p><strong>상태:</strong> ${plant.status}</p>
        <p><strong>다음 물주기:</strong> ${plant.nextWatering}</p>
        <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
        <p>${plant.description || '상세 설명이 준비 중입니다.'}</p>
        <button class="btn-primary" style="margin-top: 20px; width: 100%;" onclick="alert('추가 가이드 준비 중입니다.')">관리 가이드 보기</button>
    `;
    modal.style.display = 'block';
}
