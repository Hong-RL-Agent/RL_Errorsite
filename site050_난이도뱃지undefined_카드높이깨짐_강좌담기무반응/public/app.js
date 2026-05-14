document.addEventListener('DOMContentLoaded', () => {
    let allCourses = [];
    let filteredCourses = [];
    let savedCourses = new Set();
    let currentField = 'all';
    let currentDifficulty = 'all';

    const coursesGrid = document.getElementById('courses-grid');
    const searchInput = document.getElementById('course-search');
    const fieldFilters = document.querySelectorAll('#field-filters .filter-btn');
    const difficultyFilters = document.querySelectorAll('#difficulty-filters .filter-btn');
    const instructorsContainer = document.getElementById('instructors-container');
    const modal = document.getElementById('course-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');

    // Initialize
    fetchCourses();
    fetchInstructors();

    async function fetchCourses() {
        try {
            const response = await fetch('/api/courses');
            allCourses = await response.json();
            filteredCourses = [...allCourses];
            renderCourses();
        } catch (error) {
            coursesGrid.innerHTML = '<div class="error">강좌를 불러오지 못했습니다.</div>';
        }
    }

    async function fetchInstructors() {
        try {
            const response = await fetch('/api/instructors');
            const instructors = await response.json();
            renderInstructors(instructors);
        } catch (error) {
            console.error('Failed to fetch instructors');
        }
    }

    function renderCourses() {
        coursesGrid.innerHTML = '';
        if (filteredCourses.length === 0) {
            coursesGrid.innerHTML = '<div class="loading">조건에 맞는 강좌가 없습니다.</div>';
            return;
        }

        filteredCourses.forEach(course => {
            const card = document.createElement('div');
            card.className = 'course-card';
            if (course.id === 3) card.dataset.bugId = 'site050-bug02';

            // INTENTIONAL GUI BUG: site050-bug01
            // Description: difficultyLabel이 없는 강좌(ID:4)에 fallback 없이 값을 렌더링해 undefined가 표시됨.
            const difficultyBadge = `<span class="course-badge" ${course.id === 4 ? 'data-bug-id="site050-bug01"' : ''}>${course.difficultyLabel}</span>`;

            card.innerHTML = `
                <div class="course-thumb">
                    <img src="${course.thumbnail}" alt="${course.title}">
                </div>
                <div class="course-info">
                    ${difficultyBadge}
                    <h3>${course.title}</h3>
                    <div class="instructor">강사: ${course.instructor}</div>
                    <div class="course-stats">
                        <span>⭐ ${course.rating}</span>
                        <span>⏱️ ${course.time}</span>
                    </div>
                    <div class="course-footer">
                        <span class="price">${course.price.toLocaleString()}원</span>
                        <button class="btn-save ${savedCourses.has(course.id) ? 'active' : ''}" 
                                data-id="${course.id}"
                                ${course.id === 5 ? 'data-bug-id="site050-bug03"' : ''}>
                            ${savedCourses.has(course.id) ? '담기 취소' : '내 학습에 담기'}
                        </button>
                    </div>
                </div>
            `;
            
            // Add Modal Trigger
            card.querySelector('.course-info h3').addEventListener('click', () => openDetail(course));
            
            // Add Save Trigger
            const saveBtn = card.querySelector('.btn-save');
            
            // INTENTIONAL GUI BUG: site050-bug03
            // Description: 특정 강좌(ID:5)의 담기 버튼에 click listener를 연결하지 않아 클릭해도 저장 상태가 변하지 않음.
            if (course.id !== 5) {
                saveBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleSave(course.id, saveBtn);
                });
            }

            coursesGrid.appendChild(card);
        });
    }

    function toggleSave(id, btn) {
        if (savedCourses.has(id)) {
            savedCourses.delete(id);
            btn.classList.remove('active');
            btn.textContent = '내 학습에 담기';
        } else {
            savedCourses.add(id);
            btn.classList.add('active');
            btn.textContent = '담기 취소';
        }
    }

    function renderInstructors(instructors) {
        instructorsContainer.innerHTML = '';
        instructors.forEach(instr => {
            const div = document.createElement('div');
            div.className = 'instructor-card';
            div.innerHTML = `
                <div class="instr-info">
                    <div class="specialty">${instr.specialty}</div>
                    <h4>${instr.name}</h4>
                    <p class="bio">${instr.bio}</p>
                    <p style="margin-top:10px; font-size:12px;"><strong>대표 강좌:</strong> ${instr.mainCourse}</p>
                </div>
            `;
            instructorsContainer.appendChild(div);
        });
    }

    function openDetail(course) {
        modalBody.innerHTML = `
            <h2>${course.title}</h2>
            <p style="margin: 20px 0; color: #666;">${course.instructor} 강사님의 전문적인 노하우가 담긴 강좌입니다.</p>
            <div style="background: #f0f3ff; padding: 15px; border-radius: 8px;">
                <p><strong>강의 시간:</strong> ${course.time}</p>
                <p><strong>수강료:</strong> ${course.price.toLocaleString()}원</p>
                <p><strong>평점:</strong> ⭐ ${course.rating}</p>
            </div>
            <button class="btn btn-primary btn-block" style="margin-top: 20px;" onclick="alert('수강 신청이 완료되었습니다!')">수강 신청하기</button>
        `;
        modal.style.display = 'block';
    }

    // Filters
    fieldFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            fieldFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentField = btn.dataset.field;
            applyFilters();
        });
    });

    difficultyFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.difficulty;
            applyFilters();
        });
    });

    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        
        filteredCourses = allCourses.filter(course => {
            const matchesField = currentField === 'all' || course.field === currentField;
            const matchesDifficulty = currentDifficulty === 'all' || course.difficulty === currentDifficulty;
            const matchesSearch = course.title.toLowerCase().includes(query) || 
                                 course.instructor.toLowerCase().includes(query);
            return matchesField && matchesDifficulty && matchesSearch;
        });
        
        renderCourses();
    }

    searchInput.addEventListener('input', applyFilters);

    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
});
