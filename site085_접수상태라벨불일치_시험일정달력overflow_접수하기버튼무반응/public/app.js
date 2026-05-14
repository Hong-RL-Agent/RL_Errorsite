document.addEventListener('DOMContentLoaded', () => {
    let allExams = [];
    let selectedExam = null;

    const examGrid = document.getElementById('examGrid');
    const noticeSection = document.getElementById('noticeSection');
    const selectedExamInfo = document.getElementById('selectedExamInfo');
    const examFee = document.getElementById('examFee');
    const finalApplyBtn = document.getElementById('finalApplyBtn');
    
    // Filters
    const categoryFilter = document.getElementById('categoryFilter');
    const regionFilter = document.getElementById('regionFilter');
    const searchInput = document.getElementById('searchInput');

    // Calendar
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYear = document.getElementById('currentMonthYear');
    let currentMonth = 4; // May (0-indexed: 4)
    let currentYear = 2026;

    // Status Label Map
    const statusLabels = {
        'open': 'Open',
        'closed': 'Closed',
        'upcoming': 'Upcoming'
    };

    // Fetch Data
    async function init() {
        try {
            const [examsRes, noticesRes] = await Promise.all([
                fetch('/api/exams'),
                fetch('/api/notices')
            ]);
            allExams = await examsRes.json();
            const notices = await noticesRes.json();
            
            renderExams(allExams);
            renderNotices(notices);
            renderCalendar(currentMonth, currentYear);
        } catch (error) {
            console.error('Error loading data:', error);
            examGrid.innerHTML = '<p class="error">Failed to load system data. Contact admin.</p>';
        }
    }

    // Render Exams
    function renderExams(exams) {
        examGrid.innerHTML = '';
        if (exams.length === 0) {
            examGrid.innerHTML = '<p class="empty-msg">No exams found matching your filters.</p>';
            return;
        }

        exams.forEach(exam => {
            const card = document.createElement('div');
            card.className = 'exam-card';
            
            const isTargetBug3 = exam.id === 'ex004';

            card.innerHTML = `
                <div class="exam-cat">${exam.category}</div>
                <h4>${exam.name}</h4>
                <div class="exam-info">
                    <div><span>Region:</span> ${exam.region}</div>
                    <div><span>Exam Date:</span> ${exam.examDate}</div>
                    <div><span>Status:</span> <span class="status-badge status-${exam.status}">${statusLabels[exam.status]}</span></div>
                </div>
                <div style="display: flex; gap: 10px; margin-top: auto;">
                    <button class="btn btn-outline btn-block btn-sm" onclick="showExamModal('${exam.id}')">Details</button>
                    <button class="btn btn-primary btn-block btn-sm apply-btn" 
                        data-id="${exam.id}"
                        ${isTargetBug3 ? 'data-bug-id="site085-bug03"' : ''}>
                        Apply
                    </button>
                </div>
            `;
            examGrid.appendChild(card);
        });

        attachApplyEvents();
    }

    function attachApplyEvents() {
        document.querySelectorAll('.apply-btn').forEach(btn => {
            const id = btn.getAttribute('data-id');

            // INTENTIONAL GUI BUG: site085-bug03
            // Type: exam-apply-button-no-response
            // Description: 특정 시험(ex004) 접수 버튼에 click listener를 연결하지 않아 접수 요약이 변경되지 않음.
            if (id === 'ex004') {
                return; // SKIP event attachment
            }

            btn.onclick = () => selectExam(id);
        });
    }

    function selectExam(id) {
        selectedExam = allExams.find(e => e.id === id);
        updateSummary();
    }

    function updateSummary() {
        if (!selectedExam) {
            selectedExamInfo.innerHTML = '<p class="placeholder-text">Please select an exam to proceed with registration.</p>';
            examFee.textContent = '$0';
            finalApplyBtn.disabled = true;
            return;
        }

        selectedExamInfo.innerHTML = `
            <div class="selected-card">
                <h5>${selectedExam.name}</h5>
                <p style="font-size: 0.8rem; color: #666; margin-bottom: 10px;">${selectedExam.category} | ${selectedExam.region}</p>
                <div style="font-size: 0.85rem;">
                    <strong>Reg:</strong> ${selectedExam.regStart} ~ ${selectedExam.regEnd}<br>
                    <strong>Date:</strong> ${selectedExam.examDate}
                </div>
            </div>
        `;
        examFee.textContent = '$45.00';
        finalApplyBtn.disabled = false;
    }

    // Render Notices
    function renderNotices(notices) {
        noticeSection.innerHTML = '';
        notices.forEach(notice => {
            const item = document.createElement('div');
            item.className = 'notice-item';
            item.innerHTML = `
                <div class="notice-header">
                    <h5>${notice.priority ? '<span class="prio">CRITICAL</span>' : ''} ${notice.title}</h5>
                    <span style="font-size: 0.8rem; color: #888;">${notice.date}</span>
                </div>
                <div class="notice-content">
                    <p>${notice.content}</p>
                </div>
            `;
            item.querySelector('.notice-header').onclick = () => {
                item.classList.toggle('active');
            };
            noticeSection.appendChild(item);
        });
    }

    // Modal
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    const closeModal = document.querySelector('.close-modal');

    window.showExamModal = (id) => {
        const exam = allExams.find(e => e.id === id);
        
        // INTENTIONAL GUI BUG: site085-bug01
        // Type: exam-status-label-mismatch
        // Description: 상세 모달의 접수 상태 label 매핑이 카드와 달라 같은 시험의 상태가 다르게 표시됨.
        const buggedLabels = {
            'open': 'Closed',    // SWAPPED
            'closed': 'Open',    // SWAPPED
            'upcoming': 'Upcoming'
        };

        modalBody.innerHTML = `
            <h2 style="color: var(--primary); margin-bottom: 20px;">${exam.name}</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
                <div>
                    <h5 style="color: var(--text-gray);">Category</h5>
                    <p>${exam.category}</p>
                </div>
                <div>
                    <h5 style="color: var(--text-gray);">Region</h5>
                    <p>${exam.region}</p>
                </div>
                <div>
                    <h5 style="color: var(--text-gray);">Registration Period</h5>
                    <p>${exam.regStart} ~ ${exam.regEnd}</p>
                </div>
                <div>
                    <h5 style="color: var(--text-gray);">Exam Date</h5>
                    <p>${exam.examDate}</p>
                </div>
                <div data-bug-id="site085-bug01">
                    <h5 style="color: var(--text-gray);">Current Status</h5>
                    <span class="status-badge status-${exam.status === 'open' ? 'closed' : (exam.status === 'closed' ? 'open' : exam.status)}">
                        ${buggedLabels[exam.status]}
                    </span>
                    <p style="font-size: 0.7rem; color: #b91c1c; margin-top: 5px;">(Bug: Status differs from card)</p>
                </div>
            </div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; font-size: 0.9rem;">
                <h4 style="margin-bottom: 10px;">Exam Guidelines</h4>
                <p>Candidates must arrive 30 minutes before the exam starts. Late entry is strictly prohibited. Materials required: Admission Ticket, Photo ID, Writing utensils.</p>
            </div>
            <div style="margin-top: 30px; text-align: right;">
                <button class="btn btn-secondary" onclick="document.getElementById('modal').style.display='none'">Close</button>
            </div>
        `;
        modal.style.display = 'block';
    };

    closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // Calendar Logic
    function renderCalendar(month, year) {
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthYear.textContent = `${months[month]} ${year}`;
        
        // Remove existing days (keep weekdays)
        const weekdays = document.querySelectorAll('.weekday');
        calendarGrid.innerHTML = '';
        weekdays.forEach(w => calendarGrid.appendChild(w));

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Previous month padding
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'day-cell empty';
            calendarGrid.appendChild(empty);
        }

        // Days
        for (let i = 1; i <= daysInMonth; i++) {
            const day = document.createElement('div');
            day.className = 'day-cell';
            day.textContent = i;
            
            // Highlight today (May 6)
            if (month === 4 && i === 6) day.classList.add('today');

            // Mock exam marks
            if (i % 7 === 0) {
                day.classList.add('has-exam');
                const mark = document.createElement('div');
                mark.style.fontSize = '0.6rem';
                mark.style.color = 'var(--secondary)';
                mark.textContent = 'Exam Day';
                day.appendChild(mark);
            }
            
            calendarGrid.appendChild(day);
        }
    }

    document.getElementById('prevMonth').onclick = () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar(currentMonth, currentYear);
    };

    document.getElementById('nextMonth').onclick = () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar(currentMonth, currentYear);
    };

    // Filter Logic
    function filterExams() {
        const cat = categoryFilter.value;
        const reg = regionFilter.value;
        const search = searchInput.value.toLowerCase();

        return allExams.filter(exam => {
            const matchesCat = cat === 'all' || exam.category === cat;
            const matchesReg = reg === 'all' || exam.region === reg;
            const matchesSearch = exam.name.toLowerCase().includes(search);
            return matchesCat && matchesReg && matchesSearch;
        });
    }

    categoryFilter.onchange = () => renderExams(filterExams());
    regionFilter.onchange = () => renderExams(filterExams());
    searchInput.oninput = () => renderExams(filterExams());

    // Start
    init();
});
