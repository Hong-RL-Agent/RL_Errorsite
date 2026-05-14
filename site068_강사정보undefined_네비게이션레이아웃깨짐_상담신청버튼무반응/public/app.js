let allLessons = [];
let allTeachers = [];
let selectedLessons = [];
let currentInstrument = 'All';

document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    initEventListeners();
});

async function fetchData() {
    try {
        const [lessonsRes, teachersRes] = await Promise.all([
            fetch('/api/lessons'),
            fetch('/api/teachers')
        ]);
        allLessons = await lessonsRes.json();
        allTeachers = await teachersRes.json();
        
        renderLessons(allLessons);
    } catch (err) {
        console.error('Fetch error:', err);
        document.getElementById('lesson-grid').innerHTML = '<p class="error">데이터 로드 실패</p>';
    }
}

function renderLessons(lessons) {
    const grid = document.getElementById('lesson-grid');
    grid.innerHTML = '';
    
    lessons.forEach(lesson => {
        // Find teacher
        // INTENTIONAL GUI BUG: site068-bug01
        // Type: undefined-teacher-info
        // Description: teacherId 타입 불일치(string vs number)로 엄격 비교(===) 실패 시 fallback 없이 teacher.name을 렌더링함.
        const teacher = allTeachers.find(t => t.id === lesson.teacherId);
        
        const card = document.createElement('div');
        card.className = 'lesson-card';
        card.innerHTML = `
            <span class="instrument-tag">${lesson.instrument}</span>
            <h3>${lesson.instrument} ${lesson.level} 레슨</h3>
            <div class="lesson-info">
                <p><strong>수업 시간:</strong> ${lesson.duration}</p>
                <p><strong>가능 요일:</strong> ${lesson.days.join(', ')}</p>
                <p><strong>수강료:</strong> 월 ${lesson.price.toLocaleString()}원</p>
            </div>
            <div class="teacher-preview" data-bug-id="${lesson.id === 'l4' ? 'site068-bug01' : ''}">
                <img src="${teacher ? teacher.image : ''}" class="teacher-img-small">
                <div class="teacher-meta">
                    <span class="teacher-name">강사: ${teacher ? teacher.name : undefined}</span>
                </div>
            </div>
            <button class="btn-card-consult" id="btn-consult-${lesson.id}">상담 신청하기</button>
        `;
        
        // Modal for teacher
        card.querySelector('.teacher-preview').addEventListener('click', () => {
            if (teacher) showTeacherDetail(teacher);
        });

        // Consultation Button
        const consultBtn = card.querySelector(`#btn-consult-${lesson.id}`);
        
        // INTENTIONAL GUI BUG: site068-bug03
        // Type: consultation-button-no-response
        // Description: 특정 레슨(l2: 바이올린) 상담 신청 버튼에만 click listener를 연결하지 않아 요약 패널이 갱신되지 않음.
        if (lesson.id === 'l2') {
            consultBtn.setAttribute('data-bug-id', 'site068-bug03');
            // listener omitted
        } else {
            consultBtn.addEventListener('click', () => {
                selectLesson(lesson);
            });
        }
        
        grid.appendChild(card);
    });
}

function selectLesson(lesson) {
    if (!selectedLessons.find(l => l.id === lesson.id)) {
        selectedLessons.push(lesson);
        updateSummary();
    } else {
        alert('이미 선택된 레슨입니다.');
    }
}

function updateSummary() {
    const summary = document.getElementById('consult-summary');
    if (selectedLessons.length === 0) {
        summary.innerHTML = '<p class="empty-msg">선택된 레슨이 없습니다.</p>';
        return;
    }
    
    summary.innerHTML = selectedLessons.map(l => `
        <div class="selected-item">
            <strong>${l.instrument} (${l.level})</strong><br>
            <span>${l.duration} | ${l.days.join(', ')}</span>
        </div>
    `).join('');
}

function showTeacherDetail(teacher) {
    const modal = document.getElementById('teacher-modal');
    const body = document.getElementById('modal-body');
    
    body.innerHTML = `
        <div style="display: flex; gap: 30px;">
            <img src="${teacher.image}" style="width: 200px; height: 200px; border-radius: 12px; object-fit: cover;">
            <div>
                <h2 style="font-family: 'Playfair Display', serif; font-size: 32px; color: var(--deep-purple);">${teacher.name} 강사님</h2>
                <p style="color: var(--gold); font-weight: 700; margin-bottom: 15px;">전문 분야: ${teacher.instrument}</p>
                <p><strong>경력:</strong> ${teacher.experience}</p>
                <p><strong>학생 평점:</strong> ⭐ ${teacher.rating}</p>
                <p style="margin-top: 20px; color: #555;">개개인의 수준에 맞춘 섬세한 지도로 음악의 즐거움을 일깨워 드립니다.</p>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function initEventListeners() {
    // Instrument Filter
    const chips = document.querySelectorAll('.chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentInstrument = chip.dataset.instrument;
            filterLessons();
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
        document.getElementById('teacher-modal').style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('teacher-modal')) {
            document.getElementById('teacher-modal').style.display = 'none';
        }
    });
}

function filterLessons() {
    const filtered = allLessons.filter(l => {
        return currentInstrument === 'All' || l.instrument === currentInstrument;
    });
    renderLessons(filtered);
}
