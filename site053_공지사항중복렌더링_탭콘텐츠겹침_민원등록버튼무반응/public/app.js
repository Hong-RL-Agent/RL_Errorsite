document.addEventListener('DOMContentLoaded', () => {
    let allNotices = [];
    let maintenanceFees = [];

    const noticeList = document.getElementById('notice-list');
    const noticeSearch = document.getElementById('notice-search');
    const categoryFilter = document.getElementById('notice-category-filter');
    const feeMonthSelector = document.getElementById('fee-month-selector');
    const feeSummary = document.getElementById('fee-summary');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const modal = document.getElementById('notice-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');

    // Initialize
    fetchNotices();
    fetchMaintenanceFees();

    async function fetchNotices() {
        try {
            const response = await fetch('/api/notices');
            allNotices = await response.json();
            renderNotices(allNotices);
        } catch (error) {
            noticeList.innerHTML = '<div class="error">공지사항을 불러오지 못했습니다.</div>';
        }
    }

    async function fetchMaintenanceFees() {
        try {
            const response = await fetch('/api/maintenance-fees');
            maintenanceFees = await response.json();
            updateFeeSummary('2026-04');
        } catch (error) {
            feeSummary.innerHTML = '<div class="error">관리비를 불러오지 못했습니다.</div>';
        }
    }

    function renderNotices(notices, isFiltering = false) {
        // INTENTIONAL GUI BUG: site053-bug01
        // Type: duplicate-notice-render
        // Description: 특정 공지 카테고리 필터 적용 시 기존 DOM을 비우지 않아 공지 카드가 중복 렌더링됨.
        if (!isFiltering) {
            noticeList.innerHTML = '';
        } else {
            console.warn('Skipping notice list clearing for filtering bug demonstration');
        }

        notices.forEach(notice => {
            const card = document.createElement('div');
            card.className = `notice-card ${notice.important ? 'important' : ''}`;
            card.innerHTML = `
                <div class="notice-info">
                    <span class="badge ${notice.important ? 'badge-red' : 'badge-mint'}">${notice.category}</span>
                    <h4>${notice.title}</h4>
                    <div class="notice-meta">작성일: ${notice.date}</div>
                </div>
                <div class="notice-arrow">›</div>
            `;
            card.addEventListener('click', () => openNotice(notice));
            noticeList.appendChild(card);
        });
    }

    function openNotice(notice) {
        modalBody.innerHTML = `
            <h3>${notice.title}</h3>
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">카테고리: ${notice.category} | 작성일: ${notice.date}</p>
            <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
                ${notice.content}
            </div>
        `;
        modal.style.display = 'block';
    }

    function updateFeeSummary(month) {
        const fee = maintenanceFees.find(f => f.month === month);
        if (!fee) return;

        feeSummary.innerHTML = `
            <div class="fee-item">
                <label>전기료</label>
                <span>${fee.electricity.toLocaleString()}원</span>
            </div>
            <div class="fee-item">
                <label>수도료</label>
                <span>${fee.water.toLocaleString()}원</span>
            </div>
            <div class="fee-item">
                <label>공용관리비</label>
                <span>${fee.public.toLocaleString()}원</span>
            </div>
            <div class="fee-item total">
                <label>합계 금액</label>
                <span>${fee.total.toLocaleString()}원</span>
            </div>
        `;
    }

    // Notice Filters
    noticeSearch.addEventListener('input', () => {
        const query = noticeSearch.value.toLowerCase();
        const filtered = allNotices.filter(n => n.title.toLowerCase().includes(query));
        renderNotices(filtered, false); // Searching clears list correctly
    });

    categoryFilter.addEventListener('change', () => {
        const cat = categoryFilter.value;
        const filtered = cat === 'all' ? allNotices : allNotices.filter(n => n.category === cat);
        // Pass true to trigger site053-bug01
        renderNotices(filtered, cat !== 'all');
    });

    // Maintenance Fee Selector
    feeMonthSelector.addEventListener('change', () => {
        updateFeeSummary(feeMonthSelector.value);
    });

    // Tabs logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            
            // Remove active from buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // INTENTIONAL GUI BUG: site053-bug02
            // Type: tab-content-overlap
            // Description: 탭 전환 시 이전 panel을 숨기지 않아 민원 접수와 시설 예약 콘텐츠가 겹쳐 보임.
            // Implementation: Only add 'active' to the target, but don't remove 'active' from the previous one 
            // if we are switching to 'facility'.
            if (target === 'facility') {
                document.getElementById('tab-facility').classList.add('active');
                // NOT removing 'active' from 'tab-complaint'
                console.warn('Tab overlap bug: Facility panel shown without hiding Complaint panel');
            } else {
                // Normal behavior for other tabs
                tabPanels.forEach(p => p.classList.remove('active'));
                document.getElementById(`tab-${target}`).classList.add('active');
            }
        });
    });

    // Complaint Submission
    // INTENTIONAL GUI BUG: site053-bug03
    // Type: complaint-submit-button-no-response
    // Description: 민원 등록 버튼 selector가 실제 DOM id와 달라 click listener가 연결되지 않음.
    // DOM ID is 'btn-submit-complaint-wrong-id', but we search for 'btn-submit-complaint'
    const submitBtn = document.getElementById('btn-submit-complaint');
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const title = document.getElementById('complaint-title').value;
            if (!title) {
                alert('민원 제목을 입력해 주세요.');
                return;
            }
            alert('민원이 정상적으로 접수되었습니다.');
            // Reset form
            document.getElementById('complaint-title').value = '';
            document.getElementById('complaint-content').value = '';
        });
    }

    // Modal Close
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
});
