document.addEventListener('DOMContentLoaded', () => {
    let allTypes = [];
    let allAdvisors = [];
    let selectedType = null;
    let selectedAdvisor = null;
    let selectedTime = null;

    const insuranceGrid = document.getElementById('insurance-grid');
    const advisorGrid = document.getElementById('advisor-grid');
    const summaryType = document.getElementById('summary-type');
    const summaryAdvisor = document.getElementById('summary-advisor');
    const summaryTime = document.getElementById('summary-time');

    // Fetch Data
    const fetchData = async () => {
        try {
            const [typesRes, advisorsRes] = await Promise.all([
                fetch('/api/insurance-types'),
                fetch('/api/advisors')
            ]);
            allTypes = await typesRes.json();
            allAdvisors = await advisorsRes.json();
            
            renderInsuranceTypes(allTypes);
            renderAdvisors(allAdvisors);
        } catch (error) {
            console.error('Data loading failed:', error);
            insuranceGrid.innerHTML = '<div class="error">데이터를 불러오는 데 실패했습니다.</div>';
        }
    };

    // Render Insurance Types
    const renderInsuranceTypes = (types) => {
        insuranceGrid.innerHTML = '';
        types.forEach(type => {
            const card = document.createElement('div');
            card.className = 'type-card';
            card.innerHTML = `
                <h4>${type.name}</h4>
                <p style="font-size: 14px; color: #64748B;">${type.description}</p>
                <button class="btn-reserve-mini" 
                    ${type.id === 'AUTO' ? 'data-bug-id="site079-bug03"' : ''}
                    data-id="${type.id}">상담 예약</button>
            `;
            
            // INTENTIONAL GUI BUG: site079-bug03
            // Type: insurance-consult-button-no-response
            // Description: 특정 보험 유형(자동차보험, AUTO) 상담 예약 버튼에 click listener를 연결하지 않아 예약 요약이 변경되지 않음.
            const btn = card.querySelector('.btn-reserve-mini');
            if (type.id === 'AUTO') {
                console.log('Skipping listener for buggy button site079-bug03');
            } else {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    selectType(type);
                };
            }
            
            card.onclick = () => selectType(type);
            insuranceGrid.appendChild(card);
        });
    };

    // Render Advisors
    const renderAdvisors = (advisors) => {
        advisorGrid.innerHTML = '';
        advisors.forEach(advisor => {
            const card = document.createElement('div');
            card.className = 'advisor-card';
            card.innerHTML = `
                <div class="advisor-header">
                    <img src="/assets/advisor.png" alt="${advisor.name}" class="advisor-img">
                    <div class="advisor-info">
                        <h4>${advisor.name}</h4>
                        <p class="specialty">${advisor.specialty}</p>
                    </div>
                </div>
                <div class="advisor-meta" style="font-size: 13px; color: #64748B;">
                    <span>경력: ${advisor.experience}</span> | <span>평점: ⭐ ${advisor.rating}</span>
                </div>
                <div class="available-times" style="margin-top: 15px; display: flex; gap: 5px; flex-wrap: wrap;">
                    ${advisor.times.map(time => `<button class="time-chip" style="padding: 4px 8px; font-size: 11px; border: 1px solid #E2E8F0; border-radius: 4px; background: white; cursor: pointer;">${time}</button>`).join('')}
                </div>
            `;
            card.onclick = () => selectAdvisor(advisor);
            advisorGrid.appendChild(card);
        });
    };

    const selectType = (type) => {
        selectedType = type;
        summaryType.textContent = type.name;
        summaryType.style.color = '#0EA5E9';
    };

    const selectAdvisor = (advisor) => {
        selectedAdvisor = advisor;
        
        // Update Summary
        renderSummary();
        
        alert(`${advisor.name} 상담사가 선택되었습니다. 예약을 확정해 주세요.`);
    };

    // INTENTIONAL GUI BUG: site079-bug01
    // Type: advisor-summary-mismatch
    // Description: 상담사 변경 후 예약 요약의 상담사명을 갱신하지 않아 이전 상담사가 표시됨.
    let initialAdvisorRendered = false;
    const renderSummary = () => {
        if (!initialAdvisorRendered) {
            // 처음 선택할 때만 UI에 반영하고 이후에는 무시함 (상태 불일치 유도)
            summaryAdvisor.textContent = selectedAdvisor ? selectedAdvisor.name : '미선택';
            summaryAdvisor.style.color = '#0EA5E9';
            initialAdvisorRendered = true;
        } else {
            // BUG: 실제 selectedAdvisor 변수는 업데이트되지만 DOM에는 반영하지 않음
            console.log('BUG: Selected advisor changed to', selectedAdvisor.name, 'but summary not updated.');
        }
    };

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelector('.tab-btn.active').classList.remove('active');
            btn.classList.add('active');
            // Mock tab switching
            alert(`${btn.textContent} 보장 비교표로 전환되었습니다.`);
        };
    });

    // FAQ Accordion
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.onclick = () => {
            const item = header.parentElement;
            item.classList.toggle('active');
            const arrow = header.querySelector('.arrow');
            arrow.textContent = item.classList.contains('active') ? '▲' : '▼';
        };
    });

    fetchData();
});
