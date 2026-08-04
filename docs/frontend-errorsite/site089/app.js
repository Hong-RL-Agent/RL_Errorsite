document.addEventListener('DOMContentLoaded', () => {
    let allClasses = [];
    let allTeachers = [];
    let bookings = [];

    const classGrid = document.getElementById('classGrid');
    const teacherGrid = document.getElementById('teacherGrid');
    const bookingList = document.getElementById('bookingList');
    const bookingBadge = document.getElementById('bookingBadge');
    const totalClasses = document.getElementById('totalClasses');
    const reserveBtn = document.getElementById('reserveBtn');
    
    // Filters
    const ageFilterBtns = document.querySelectorAll('.filter-btn');
    const categoryFilter = document.getElementById('categoryFilter');
    let activeAgeFilter = 'all';

    // Fetch Data
    async function init() {
        try {
            const [classesRes, teachersRes] = await Promise.all([
                fetch('/api/kids-classes'),
                fetch('/api/teachers')
            ]);
            allClasses = await classesRes.json();
            allTeachers = await teachersRes.json();
            
            renderClasses(allClasses);
            renderTeachers(allTeachers);
        } catch (error) {
            console.error('Error loading data:', error);
            classGrid.innerHTML = '<p class="error">Oops! Something went wrong. Refresh to try again.</p>';
        }
    }

    // Render Classes
    function renderClasses(classes) {
        classGrid.innerHTML = '';
        if (classes.length === 0) {
            classGrid.innerHTML = '<p class="empty-msg">No classes found for this selection.</p>';
            return;
        }

        classes.forEach(cls => {
            const card = document.createElement('div');
            card.className = 'class-card';
            
            const teacher = allTeachers.find(t => t.id === cls.teacherId);
            const isTargetBug3 = cls.id === 'c003';

            card.innerHTML = `
                <img src="${cls.image}" alt="${cls.name}" class="card-img" onclick="showClassModal('${cls.id}')">
                <div class="card-content">
                    <span class="card-badge">${cls.category}</span>
                    <h4>${cls.name}</h4>
                    <div class="class-info">
                        <div><span>Target Age:</span> <strong>${cls.ageGroup}</strong></div>
                        <div><span>Duration:</span> ${cls.duration}</div>
                        <div><span>Teacher:</span> ${teacher ? teacher.name : 'Staff'}</div>
                        <div><span>Availability:</span> ${cls.capacity - cls.booked} slots left</div>
                    </div>
                    <button class="btn btn-primary btn-block book-btn" 
                        data-id="${cls.id}"
                        ${isTargetBug3 ? 'data-bug-id="site089-bug03"' : ''}>
                        Book Class
                    </button>
                </div>
            `;
            classGrid.appendChild(card);
        });

        attachBookingEvents();
    }

    function attachBookingEvents() {
        document.querySelectorAll('.book-btn').forEach(btn => {
            const id = btn.getAttribute('data-id');

            // INTENTIONAL GUI BUG: site089-bug03
            // Type: kids-class-book-button-no-response
            // Description: 특정 키즈 클래스(c003) 예약 버튼에 click listener를 연결하지 않아 예약 요약이 변경되지 않음.
            if (id === 'c003') {
                return; // SKIP event attachment
            }

            btn.onclick = () => addToBookings(id);
        });
    }

    function addToBookings(id) {
        const cls = allClasses.find(c => c.id === id);
        if (!bookings.find(b => b.id === id)) {
            bookings.push(cls);
            updateBookingUI();
        } else {
            alert('This class is already in your booking list!');
        }
    }

    function updateBookingUI() {
        bookingList.innerHTML = '';
        if (bookings.length === 0) {
            bookingList.innerHTML = '<p class="empty-msg">Select a class to start your adventure!</p>';
            bookingBadge.textContent = '0';
            totalClasses.textContent = '0';
            reserveBtn.disabled = true;
            return;
        }

        bookings.forEach((b, index) => {
            const item = document.createElement('div');
            item.className = 'booking-item';
            item.innerHTML = `
                <span>${b.name}</span>
                <button onclick="removeBooking(${index})" style="background:none; border:none; color:var(--primary); cursor:pointer; font-weight:700;">×</button>
            `;
            bookingList.appendChild(item);
        });

        bookingBadge.textContent = bookings.length;
        totalClasses.textContent = bookings.length;
        reserveBtn.disabled = false;
    }

    window.removeBooking = (index) => {
        bookings.splice(index, 1);
        updateBookingUI();
    };

    // Render Teachers
    function renderTeachers(teachers) {
        teacherGrid.innerHTML = '';
        teachers.forEach(t => {
            const card = document.createElement('div');
            card.className = 'teacher-card';
            card.innerHTML = `
                <img src="${t.image}" alt="${t.name}" class="teacher-img">
                <div class="teacher-info">
                    <h5>${t.name}</h5>
                    <span>${t.specialty}</span>
                </div>
            `;
            teacherGrid.appendChild(card);
        });
    }

    // Filter Logic
    function filterClasses() {
        const category = categoryFilter.value;
        
        // INTENTIONAL GUI BUG: site089-bug01
        // Type: age-filter-result-mismatch
        // Description: 연령 필터 매핑이 잘못되어 6~7세 필터 결과에 다른 연령대 클래스(4~5세)가 섞여 표시됨.
        const ageRangeMap = {
            'all': ['4~5 years', '6~7 years', '8~9 years'],
            '4~5 years': ['4~5 years'],
            '6~7 years': ['6~7 years', '4~5 years'], // BUG: Includes 4~5y in 6~7y filter
            '8~9 years': ['8~9 years']
        };

        const allowedAges = ageRangeMap[activeAgeFilter] || [activeAgeFilter];

        return allClasses.filter(cls => {
            const matchesAge = allowedAges.includes(cls.ageGroup);
            const matchesCat = category === 'all' || cls.category === category;
            return matchesAge && matchesCat;
        });
    }

    ageFilterBtns.forEach(btn => {
        btn.onclick = () => {
            ageFilterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeAgeFilter = btn.getAttribute('data-age');
            renderClasses(filterClasses());
        };
    });

    categoryFilter.onchange = () => renderClasses(filterClasses());

    // Schedule Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const scheduleBody = document.getElementById('scheduleBody');

    const mockSchedule = {
        'Mon': [{time: '10:00 AM', title: 'Little Picasso Art Lab', teacher: 'Sarah Jenkins'}, {time: '02:00 PM', title: 'Robo-Juniors Coding', teacher: 'Mark Peterson'}],
        'Tue': [{time: '11:00 AM', title: 'Mini Mozart Music', teacher: 'Sarah Jenkins'}, {time: '04:00 PM', title: 'Galaxy Science Explorers', teacher: 'Mark Peterson'}],
        'Wed': [{time: '10:00 AM', title: 'Junior Chef Academy', teacher: 'Chef Maria'}],
        'Thu': [{time: '01:00 PM', title: 'Little Picasso Art Lab', teacher: 'Sarah Jenkins'}],
        'Fri': [{time: '03:00 PM', title: 'Robo-Juniors Coding', teacher: 'Mark Peterson'}]
    };

    tabBtns.forEach(btn => {
        btn.onclick = () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const day = btn.getAttribute('data-day');
            renderSchedule(day);
        };
    });

    function renderSchedule(day) {
        scheduleBody.innerHTML = '';
        const items = mockSchedule[day] || [];
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'schedule-item';
            div.innerHTML = `
                <span class="time">${item.time}</span>
                <span class="title">${item.title}</span>
                <span class="teacher">${item.teacher}</span>
            `;
            scheduleBody.appendChild(div);
        });
    }

    // Safety Accordion
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.onclick = () => {
            const item = header.parentElement;
            item.classList.toggle('active');
        };
    });

    // Modals
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    
    window.showClassModal = (id) => {
        const cls = allClasses.find(c => c.id === id);
        const teacher = allTeachers.find(t => t.id === cls.teacherId);
        
        modalBody.innerHTML = `
            <div style="display: flex; gap: 30px;">
                <img src="${cls.image}" style="width: 200px; height: 200px; border-radius: 20px; object-fit: cover;">
                <div>
                    <span class="card-badge">${cls.category}</span>
                    <h2 style="font-family: 'Fredoka One'; margin: 10px 0;">${cls.name}</h2>
                    <div style="font-size: 0.95rem; margin-bottom: 20px;">
                        <p><strong>Age Group:</strong> ${cls.ageGroup}</p>
                        <p><strong>Duration:</strong> ${cls.duration}</p>
                        <p><strong>Available Slots:</strong> ${cls.capacity - cls.booked} of ${cls.capacity}</p>
                    </div>
                    <div style="background: #f1f8e9; padding: 15px; border-radius: 15px; display: flex; align-items: center; gap: 15px;">
                        <img src="${teacher.image}" style="width: 50px; height: 50px; border-radius: 50%;">
                        <div>
                            <h5 style="margin: 0;">Teacher ${teacher.name}</h5>
                            <p style="font-size: 0.8rem; margin: 0;">${teacher.specialty}</p>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-block" style="margin-top: 30px;" onclick="addToBookings('${cls.id}'); closeModal();">Book This Adventure</button>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    };

    window.closeModal = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) closeModal(); };

    // Start
    init();
});
