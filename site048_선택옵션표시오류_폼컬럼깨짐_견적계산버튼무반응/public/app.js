document.addEventListener('DOMContentLoaded', () => {
    let state = {
        services: [],
        selectedService: null,
        area: 0,
        options: [],
        selectedDate: null,
        selectedTime: null,
        totalPrice: 0
    };

    // DOM Elements
    const servicesGrid = document.getElementById('services-grid');
    const serviceDetail = document.getElementById('service-detail');
    const areaInput = document.getElementById('area-input');
    const optionsCheckboxes = document.querySelectorAll('input[name="option"]');
    const timeSlotsContainer = document.getElementById('time-slots-container');
    const summaryService = document.getElementById('summary-service');
    const summaryArea = document.getElementById('summary-area');
    const summaryOptions = document.getElementById('summary-options');
    const summaryDate = document.getElementById('summary-date');
    const totalPriceDisplay = document.getElementById('total-price');
    const faqItems = document.querySelectorAll('.faq-item');

    // INTENTIONAL GUI BUG: site048-bug01
    // Type: selected-options-display-error
    // Description: 옵션 value와 요약 label 매핑이 잘못되어 선택한 옵션과 다른 이름이 표시됨.
    const optionLabels = {
        'refrigerator': '창틀/유리창 집중 청소', // Swapped with window
        'window': '냉장고 내부 청소',        // Swapped with refrigerator
        'balcony': '베란다/다용도실 청소',
        'steam': '고온 스팀 살균'
    };

    // Initialize
    fetchServices();
    fetchTimeSlots();
    setupEventListeners();

    async function fetchServices() {
        try {
            const response = await fetch('/api/services');
            state.services = await response.json();
            renderServices();
        } catch (error) {
            servicesGrid.innerHTML = '<div class="error">서비스 목록을 불러오지 못했습니다.</div>';
        }
    }

    async function fetchTimeSlots() {
        try {
            const response = await fetch('/api/time-slots');
            const slots = await response.json();
            renderTimeSlots(slots);
        } catch (error) {
            timeSlotsContainer.innerHTML = '<div class="error">시간표를 불러오지 못했습니다.</div>';
        }
    }

    function renderServices() {
        servicesGrid.innerHTML = '';
        state.services.forEach(service => {
            const div = document.createElement('div');
            div.className = 'service-item';
            div.innerHTML = `<h4>${service.name}</h4>`;
            div.addEventListener('click', () => selectService(service, div));
            servicesGrid.appendChild(div);
        });
    }

    function selectService(service, element) {
        document.querySelectorAll('.service-item').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        state.selectedService = service;
        
        serviceDetail.classList.remove('empty-state');
        serviceDetail.innerHTML = `
            <h3>${service.name}</h3>
            <p>${service.description}</p>
            <div class="mt-1">
                <strong>추천 옵션:</strong> 
                ${service.recommendedOptions.map(opt => `<span class="badge">${optionLabels[opt] || opt}</span>`).join(', ')}
            </div>
            <div class="mt-1">
                <strong>기본 금액:</strong> ${service.basePrice.toLocaleString()}원
            </div>
        `;
        updateSummary();
    }

    function renderTimeSlots(slots) {
        timeSlotsContainer.innerHTML = '';
        slots.forEach(day => {
            const row = document.createElement('div');
            row.className = 'date-row';
            row.innerHTML = `
                <span class="date-label">${day.date}</span>
                <div class="times-grid">
                    ${day.times.map(t => `
                        <div class="time-slot ${t.available ? 'available' : 'unavailable'}" 
                             data-date="${day.date}" data-time="${t.time}">
                            ${t.time}
                        </div>
                    `).join('')}
                </div>
            `;
            timeSlotsContainer.appendChild(row);
        });

        document.querySelectorAll('.time-slot.available').forEach(slot => {
            slot.addEventListener('click', () => {
                document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
                slot.classList.add('selected');
                state.selectedDate = slot.dataset.date;
                state.selectedTime = slot.dataset.time;
                updateSummary();
            });
        });
    }

    function setupEventListeners() {
        areaInput.addEventListener('input', (e) => {
            state.area = e.target.value;
            updateSummary();
        });

        optionsCheckboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const selected = [];
                optionsCheckboxes.forEach(c => {
                    if (c.checked) selected.push(c.value);
                });
                state.options = selected;
                updateSummary();
            });
        });

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });

        // INTENTIONAL GUI BUG: site048-bug03
        // Type: quote-calculate-button-no-response
        // Description: 견적 계산 버튼 selector가 실제 DOM id와 달라 click listener가 연결되지 않음.
        const calculateBtn = document.getElementById('calculate-btn-wrong-id'); // Should be 'calculate-btn-actual'
        if (calculateBtn) {
            calculateBtn.addEventListener('click', calculateTotalPrice);
        } else {
            console.warn('Calculate button not found (intended bug)');
        }
    }

    function updateSummary() {
        summaryService.textContent = state.selectedService ? state.selectedService.name : '-';
        summaryArea.textContent = state.area > 0 ? `${state.area}평` : '-';
        summaryDate.textContent = state.selectedDate ? `${state.selectedDate} ${state.selectedTime}` : '-';

        if (state.options.length > 0) {
            summaryOptions.innerHTML = '';
            state.options.forEach(opt => {
                const li = document.createElement('li');
                // Bug implementation: Using the mismatched label mapping
                li.textContent = optionLabels[opt];
                summaryOptions.appendChild(li);
            });
        } else {
            summaryOptions.innerHTML = '<li class="empty">선택된 옵션 없음</li>';
        }
    }

    function calculateTotalPrice() {
        if (!state.selectedService) {
            alert('서비스를 먼저 선택해주세요.');
            return;
        }

        let total = state.selectedService.basePrice;
        
        // Add area surcharge (e.g. 5000 won per pyeong)
        total += (state.area * 5000);

        // Add options
        optionsCheckboxes.forEach(cb => {
            if (cb.checked) {
                total += parseInt(cb.dataset.price);
            }
        });

        state.totalPrice = total;
        totalPriceDisplay.textContent = `${total.toLocaleString()}원`;
        
        // Highlight summary
        totalPriceDisplay.style.color = '#0097a7';
        setTimeout(() => {
            totalPriceDisplay.style.color = '#1a237e';
        }, 1000);
    }
});
