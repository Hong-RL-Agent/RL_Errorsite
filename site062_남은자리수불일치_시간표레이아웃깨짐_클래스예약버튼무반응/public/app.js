let allClasses = [];
let allInstructors = [];
let selectedClass = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    initEventListeners();
});

async function fetchData() {
    try {
        const [classesRes, instructorsRes] = await Promise.all([
            fetch('/api/classes'),
            fetch('/api/instructors')
        ]);
        
        allClasses = await classesRes.json();
        allInstructors = await instructorsRes.json();
        
        populateInstructorFilter(allInstructors);
        renderClasses(allClasses);
    } catch (err) {
        console.error('Fetch error:', err);
        document.getElementById('class-grid').innerHTML = '<p class="error">데이터 로드 실패</p>';
    }
}

function populateInstructorFilter(instructors) {
    const select = document.getElementById('instructor-filter');
    instructors.forEach(ins => {
        const opt = document.createElement('option');
        opt.value = ins.name;
        opt.innerText = ins.name;
        select.appendChild(opt);
    });
}

function renderClasses(classes) {
    const grid = document.getElementById('class-grid');
    grid.innerHTML = '';
    
    classes.forEach(cls => {
        const card = document.createElement('div');
        card.className = 'class-card';
        card.innerHTML = `
            <h3>${cls.name}</h3>
            <div class="class-info-item">강사: <strong>${cls.instructor}</strong></div>
            <div class="class-info-item">난이도: <strong>${cls.difficulty}</strong></div>
            <div class="class-info-item">시간: <strong>${cls.time}</strong></div>
            <div class="card-footer">
                <span class="remaining-tag">잔여 ${cls.capacity - cls.booked}석</span>
                <button class="btn-outline reserve-btn" data-id="${cls.id}">선택하기</button>
            </div>
        `;
        
        const btn = card.querySelector('.reserve-btn');
        
        // INTENTIONAL GUI BUG: site062-bug03
        // Type: yoga-reserve-button-no-response
        // Description: 특정 클래스(Morning Vinyasa: c1)의 예약 버튼에 click listener를 연결하지 않음.
        if (cls.id === 'c1') {
            btn.setAttribute('data-bug-id', 'site062-bug03');
            // No listener
        } else {
            btn.addEventListener('click', () => selectClass(cls));
        }
        
        grid.appendChild(card);
    });
}

function selectClass(cls) {
    selectedClass = cls;
    const infoPanel = document.getElementById('selected-class-info');
    const remainingCount = document.getElementById('summary-remaining');
    
    infoPanel.innerHTML = `
        <div class="selected-item">
            <h4>${cls.name}</h4>
            <p>${cls.instructor} | ${cls.time}</p>
        </div>
    `;

    // INTENTIONAL GUI BUG: site062-bug01
    // Type: remaining-seats-mismatch
    // Description: 예약 요약의 남은 자리 계산식에 잘못된 보정값(+2)을 더해 클래스 카드와 수량이 불일치함.
    const actualRemaining = cls.capacity - cls.booked;
    const buggedRemaining = actualRemaining + 2;
    remainingCount.innerText = `${buggedRemaining}석`;
}

function initEventListeners() {
    // Difficulty Filter
    const diffChips = document.querySelectorAll('.filter-chip');
    diffChips.forEach(chip => {
        chip.addEventListener('click', () => {
            diffChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            filterClasses();
        });
    });

    // Instructor Filter
    document.getElementById('instructor-filter').addEventListener('change', filterClasses);

    // Accordion
    const accHeaders = document.querySelectorAll('.accordion-header');
    accHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            item.classList.toggle('active');
            header.querySelector('span').innerText = item.classList.contains('active') ? '-' : '+';
        });
    });

    // Schedule Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // Simply re-renders mock schedule for demo
            alert(`${btn.dataset.day}요일 시간표로 전환됩니다.`);
        });
    });

    // Modal logic (if needed for cards)
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('class-modal').style.display = 'none';
    });
}

function filterClasses() {
    const difficulty = document.querySelector('.filter-chip.active').dataset.difficulty;
    const instructor = document.getElementById('instructor-filter').value;
    
    let filtered = allClasses;
    if (difficulty !== 'All') {
        filtered = filtered.filter(c => c.difficulty === difficulty);
    }
    if (instructor !== 'All') {
        filtered = filtered.filter(c => c.instructor === instructor);
    }
    
    renderClasses(filtered);
}
