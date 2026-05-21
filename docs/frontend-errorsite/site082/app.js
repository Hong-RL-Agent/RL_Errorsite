document.addEventListener('DOMContentLoaded', () => {
    let allSessions = [];
    let allSpeakers = [];
    let selectedSessionIds = new Set();

    const sessionGrid = document.getElementById('sessionGrid');
    const speakerGrid = document.getElementById('speakerGrid');
    const timetableGrid = document.getElementById('timetableGrid');
    const selectedSessionsList = document.getElementById('selectedSessionsList');
    const selectedCount = document.getElementById('selectedCount');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Filters
    const categoryFilter = document.getElementById('categoryFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchInput = document.getElementById('searchInput');

    // Fetch Data
    async function init() {
        try {
            const [sessionsRes, speakersRes] = await Promise.all([
                fetch('/api/sessions'),
                fetch('/api/speakers')
            ]);
            allSessions = await sessionsRes.json();
            allSpeakers = await speakersRes.json();
            
            renderSessions(allSessions);
            renderSpeakers(allSpeakers);
            renderTimetable('2026-06-15');
        } catch (error) {
            console.error('Error loading data:', error);
            sessionGrid.innerHTML = '<p class="error">Failed to load sessions. Please try again later.</p>';
        }
    }

    // Render Sessions
    function renderSessions(sessions) {
        sessionGrid.innerHTML = '';
        if (sessions.length === 0) {
            sessionGrid.innerHTML = '<p class="empty">No sessions found matching your criteria.</p>';
            return;
        }

        sessions.forEach(session => {
            const speaker = allSpeakers.find(s => s.id === session.speakerId);
            const card = document.createElement('div');
            card.className = 'session-card';
            
            const remainingSeats = session.capacity - session.reserved;
            const isSelected = selectedSessionIds.has(session.id);
            
            card.innerHTML = `
                <div class="session-cat">${session.category}</div>
                <h4>${session.title}</h4>
                <div class="session-info">
                    <div><span>👤</span> ${speaker ? speaker.name : 'Unknown Speaker'}</div>
                    <div><span>📅</span> ${session.date}</div>
                    <div><span>⏰</span> ${session.time}</div>
                    <div><span>📍</span> ${session.location}</div>
                </div>
                <div class="session-footer">
                    <span class="seats ${remainingSeats < 10 ? 'low' : ''}">
                        ${remainingSeats} seats left
                    </span>
                    <button class="btn ${isSelected ? 'btn-outline' : 'btn-primary'} reserve-btn" 
                        data-id="${session.id}"
                        ${session.id === 's005' ? 'data-bug-id="site082-bug03"' : ''}>
                        ${isSelected ? 'Remove' : 'Reserve'}
                    </button>
                </div>
            `;
            sessionGrid.appendChild(card);
        });

        attachReserveEvents();
    }

    // Attach Reserve Button Events
    function attachReserveEvents() {
        document.querySelectorAll('.reserve-btn').forEach(btn => {
            const sessionId = btn.getAttribute('data-id');

            // INTENTIONAL GUI BUG: site082-bug03
            // Type: seminar-reserve-button-no-response
            // Description: 특정 세미나 세션(s005) 예약 버튼에 click listener를 연결하지 않아 예약 요약이 변경되지 않음.
            if (sessionId === 's005') {
                return; // SKIP event attachment
            }

            btn.onclick = () => toggleSession(sessionId);
        });
    }

    // Toggle Session Selection
    function toggleSession(id) {
        if (selectedSessionIds.has(id)) {
            selectedSessionIds.delete(id);
        } else {
            selectedSessionIds.add(id);
        }
        updateSummary();
        renderSessions(filterSessions());
    }

    // Update Summary Sticky Panel
    function updateSummary() {
        selectedSessionsList.innerHTML = '';
        const count = selectedSessionIds.size;
        selectedCount.textContent = count;
        checkoutBtn.disabled = count === 0;

        if (count === 0) {
            selectedSessionsList.innerHTML = '<p class="empty-msg">No sessions selected yet.</p>';
            return;
        }

        selectedSessionIds.forEach(id => {
            const session = allSessions.find(s => s.id === id);
            const item = document.createElement('div');
            item.className = 'selected-item';
            
            // INTENTIONAL GUI BUG: site082-bug01
            // Type: seminar-seat-count-mismatch
            // Description: 예약 요약 남은 좌석 계산식이 카드 계산식(capacity - reserved)과 달리 -2를 추가해 좌석 수가 불일치함.
            const buggedSeats = session.capacity - session.reserved - 2;

            item.innerHTML = `
                <h6>${session.title}</h6>
                <div class="item-info">
                    ${session.time} | ${session.location}
                    <span class="seat-bug-container" data-bug-id="site082-bug01">
                        Remaining: ${buggedSeats} seats
                    </span>
                </div>
                <button class="remove-btn" onclick="this.parentElement.remove(); toggleSession('${session.id}')">&times;</button>
            `;
            selectedSessionsList.appendChild(item);
        });
    }

    // Render Speakers
    function renderSpeakers(speakers) {
        speakerGrid.innerHTML = '';
        speakers.forEach(speaker => {
            const card = document.createElement('div');
            card.className = 'speaker-card';
            card.onclick = () => showSpeakerModal(speaker);
            card.innerHTML = `
                <div class="speaker-img" style="background-image: url('${speaker.image}')"></div>
                <h4>${speaker.name}</h4>
                <p>${speaker.company}</p>
                <p>${speaker.field}</p>
            `;
            speakerGrid.appendChild(card);
        });
    }

    // Render Timetable
    function renderTimetable(day) {
        timetableGrid.innerHTML = '';
        const daySessions = allSessions.filter(s => s.date === day);
        
        daySessions.forEach(session => {
            const speaker = allSpeakers.find(s => s.id === session.speakerId);
            const row = document.createElement('div');
            row.className = 'timetable-row';
            row.innerHTML = `
                <div class="time-cell">${session.time.split(' - ')[0]}</div>
                <div class="session-cell">
                    <h5>${session.title}</h5>
                    <p>${speaker ? speaker.name : ''} | ${session.location}</p>
                </div>
            `;
            timetableGrid.appendChild(row);
        });
    }

    // Filters Logic
    function filterSessions() {
        const catValue = categoryFilter.value;
        const dateValue = dateFilter.value;
        const searchValue = searchInput.value.toLowerCase();

        return allSessions.filter(session => {
            const matchesCat = catValue === 'all' || session.category === catValue;
            const matchesDate = dateValue === 'all' || session.date === dateValue;
            const matchesSearch = session.title.toLowerCase().includes(searchValue) || 
                                 session.category.toLowerCase().includes(searchValue);
            return matchesCat && matchesDate && matchesSearch;
        });
    }

    categoryFilter.onchange = () => renderSessions(filterSessions());
    dateFilter.onchange = () => renderSessions(filterSessions());
    searchInput.oninput = () => renderSessions(filterSessions());

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelector('.tab-btn.active').classList.remove('active');
            btn.classList.add('active');
            renderTimetable(btn.getAttribute('data-day'));
        };
    });

    // Modals
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.querySelector('.close-modal');

    function showSpeakerModal(speaker) {
        modalBody.innerHTML = `
            <div style="display: flex; gap: 30px;">
                <img src="${speaker.image}" style="width: 200px; height: 200px; border-radius: 12px; object-fit: cover;">
                <div>
                    <h2>${speaker.name}</h2>
                    <p style="color: var(--primary); font-weight: 600; margin-bottom: 10px;">${speaker.field} @ ${speaker.company}</p>
                    <p>${speaker.bio}</p>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    }

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    // Start
    init();
});
