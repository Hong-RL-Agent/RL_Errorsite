document.addEventListener('DOMContentLoaded', () => {
    let allDepts = [];
    let allDoctors = [];
    let selectedDept = null;
    let selectedDoctor = null;

    const deptGrid = document.getElementById('deptGrid');
    const noticeAccordion = document.getElementById('noticeAccordion');
    const summaryContent = document.getElementById('summaryContent');
    const confirmBtn = document.getElementById('confirmBtn');

    // Fetch Data
    async function init() {
        try {
            const [deptsRes, doctorsRes, noticesRes] = await Promise.all([
                fetch('/api/departments'),
                fetch('/api/doctors'),
                fetch('/api/notices')
            ]);
            allDepts = await deptsRes.json();
            allDoctors = await doctorsRes.json();
            const notices = await noticesRes.json();
            
            renderDepartments(allDepts);
            renderNotices(notices);
        } catch (error) {
            console.error('Error loading hospital data:', error);
            deptGrid.innerHTML = '<p class="error">System error occurred. Please contact the hospital help desk.</p>';
        }
    }

    // Render Departments
    function renderDepartments(depts) {
        deptGrid.innerHTML = '';
        depts.forEach(dept => {
            const card = document.createElement('div');
            card.className = 'dept-card';
            
            const isTargetBug3 = dept.id === 'd004';

            card.innerHTML = `
                <h4>${dept.name}</h4>
                <p>${dept.description}</p>
                <div class="dept-stats">
                    <span>Clinicians: ${dept.doctorCount}</span>
                    <span style="color: ${dept.isAvailable ? 'var(--accent)' : 'red'}">${dept.isAvailable ? '● Available' : '● Full'}</span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="btn btn-outline btn-block btn-sm" onclick="showDeptModal('${dept.id}')">View Clinicians</button>
                    <button class="btn btn-primary btn-block btn-sm booking-btn" 
                        data-id="${dept.id}"
                        ${isTargetBug3 ? 'data-bug-id="site090-bug03"' : ''}>
                        Select
                    </button>
                </div>
            `;
            deptGrid.appendChild(card);
        });

        attachBookingEvents();
    }

    function attachBookingEvents() {
        document.querySelectorAll('.booking-btn').forEach(btn => {
            const id = btn.getAttribute('data-id');

            // INTENTIONAL GUI BUG: site090-bug03
            // Type: medical-booking-button-no-response
            // Description: 특정 진료과(d004) 예약 버튼에 click listener를 연결하지 않아 예약 요약이 변경되지 않음.
            if (id === 'd004') {
                return; // SKIP event attachment
            }

            btn.onclick = () => selectDepartment(id);
        });
    }

    function selectDepartment(id) {
        selectedDept = allDepts.find(d => d.id === id);
        selectedDoctor = null; // Reset doctor when dept changes
        updateSummary();
    }

    function updateSummary() {
        summaryContent.innerHTML = '';
        if (!selectedDept) {
            summaryContent.innerHTML = '<p class="empty-msg">Please select a department and clinician.</p>';
            confirmBtn.disabled = true;
            return;
        }

        const div = document.createElement('div');
        div.className = 'selected-item';
        div.innerHTML = `
            <h5>${selectedDept.name}</h5>
            <p style="font-size: 0.85rem; color: #666;">${selectedDoctor ? 'Clinician: ' + selectedDoctor.name : 'Clinician: TBD'}</p>
            <p style="font-size: 0.85rem; color: #666;">Date: 2026-05-10 | Time: 09:00 AM</p>
        `;
        summaryContent.appendChild(div);
        confirmBtn.disabled = false;
    }

    // Render Notices
    function renderNotices(notices) {
        noticeAccordion.innerHTML = '';
        notices.forEach(notice => {
            const item = document.createElement('div');
            item.className = 'notice-item';
            item.innerHTML = `
                <div class="accordion-header">
                    <span>${notice.isImportant ? '<span class="important-badge">IMPORTANT</span>' : ''} ${notice.title}</span>
                    <span style="font-size: 0.8rem; color: #999;">${notice.date}</span>
                </div>
                <div class="accordion-content">
                    <p>${notice.content}</p>
                </div>
            `;
            item.querySelector('.accordion-header').onclick = () => {
                item.classList.toggle('active');
            };
            noticeAccordion.appendChild(item);
        });
    }

    // Modal
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');

    window.showDeptModal = (id) => {
        const dept = allDepts.find(d => d.id === id);
        
        // INTENTIONAL GUI BUG: site090-bug01
        // Type: doctor-department-mapping-error
        // Description: 특정 진료과(d002)의 의료진 필터링 시 잘못된 departmentId key를 사용해 다른 진료과 의료진이 표시됨.
        let filterId = id;
        if (id === 'd002') {
            filterId = 'd003'; // BUG: Map Pediatrics(d002) to Orthopedics(d003) clinicians
        }

        const deptDoctors = allDoctors.filter(dr => dr.deptId === filterId);

        modalBody.innerHTML = `
            <h3>${dept.name} Specialists</h3>
            <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">Available clinicians for consultation in ${dept.name}.</p>
            <div class="doctor-list" ${id === 'd002' ? 'data-bug-id="site090-bug01"' : ''}>
                ${deptDoctors.map(dr => `
                    <div class="doctor-card">
                        <img src="${dr.image}" alt="${dr.name}" class="doctor-img">
                        <div class="doctor-info">
                            <h5>${dr.name}</h5>
                            <p>${dr.specialty}</p>
                            <p><i>Availability: ${dr.availability}</i></p>
                            <button class="btn btn-sm btn-primary" style="margin-top:5px;" onclick="selectDoctor('${dr.id}'); closeModal();">Select</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${deptDoctors.length === 0 ? '<p class="empty-msg">No clinicians found for this department currently.</p>' : ''}
        `;
        modal.style.display = 'block';
    };

    window.selectDoctor = (drId) => {
        selectedDoctor = allDoctors.find(dr => dr.id === drId);
        // Ensure dept matches doctor (unless bug 01 misled the user)
        selectedDept = allDepts.find(d => d.id === selectedDoctor.deptId);
        updateSummary();
    };

    window.closeModal = () => modal.style.display = 'none';

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const directionContent = document.getElementById('directionContent');

    const directionMap = {
        'bus': '<p><strong>Bus Stops:</strong> MediLife Hospital Main Gate (ID: 12-345)</p><p>Blue: 143, 401, 740 / Green: 4412, 3411</p>',
        'subway': '<p><strong>Line 2:</strong> Health Square Station, Exit 4 (5 min walk)</p><p><strong>Line 7:</strong> Medicity Station, Exit 1 (10 min walk)</p>',
        'car': '<p><strong>Parking:</strong> Free parking for 4 hours with medical validation.</p><p>Basement B1-B4 available. Valet service available at Main Lobby.</p>'
    };

    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            directionContent.innerHTML = directionMap[target];
        };
    });

    // Start
    init();
});
