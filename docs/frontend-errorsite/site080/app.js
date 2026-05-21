document.addEventListener('DOMContentLoaded', () => {
    let allOptions = [];
    let selectedOptions = [];
    let allPortfolio = [];
    let currentPyeong = 32;

    const optionsList = document.getElementById('options-list');
    const selectedSummary = document.getElementById('selected-options-summary');
    const totalEstimate = document.getElementById('total-estimate');
    const pyeongInput = document.getElementById('pyeong-input');
    const portfolioGrid = document.getElementById('portfolio-grid');

    // Fetch Data
    const fetchData = async () => {
        try {
            const [optRes, portRes] = await Promise.all([
                fetch('/api/options'),
                fetch('/api/portfolio')
            ]);
            allOptions = await optRes.json();
            allPortfolio = await portRes.json();
            
            renderOptions(allOptions);
            renderPortfolio(allPortfolio);
        } catch (error) {
            console.error('Data loading failed:', error);
            optionsList.innerHTML = '<div class="error">데이터를 불러오는 데 실패했습니다.</div>';
        }
    };

    // Render Options
    const renderOptions = (options) => {
        optionsList.innerHTML = '';
        options.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'option-item';
            div.innerHTML = `
                <input type="checkbox" id="opt-${opt.id}" data-id="${opt.id}">
                <label for="opt-${opt.id}">${opt.name} ${opt.recommended ? '<small style="color: #8B5E3C;">(추천)</small>' : ''}</label>
            `;
            const checkbox = div.querySelector('input');
            checkbox.onchange = () => toggleOption(opt, checkbox.checked);
            optionsList.appendChild(div);
        });
    };

    const toggleOption = (option, isChecked) => {
        if (isChecked) {
            selectedOptions.push(option);
        } else {
            selectedOptions = selectedOptions.filter(o => o.id !== option.id);
        }
        updateSummary();
    };

    // INTENTIONAL GUI BUG: site080-bug01
    // Type: estimate-total-mismatch
    // Description: 예상 견적 계산 시 마지막 선택 옵션 금액을 제외해 실제 선택 옵션 합계와 총액이 불일치함.
    const updateSummary = () => {
        if (selectedOptions.length === 0) {
            selectedSummary.innerHTML = '<p class="empty-msg">선택된 항목이 없습니다.</p>';
            totalEstimate.textContent = '0원';
            return;
        }

        selectedSummary.innerHTML = selectedOptions.map(opt => `
            <div class="selected-opt-row">
                <span>${opt.name}</span>
                <span>${opt.price.toLocaleString()}원</span>
            </div>
        `).join('');

        // BUG: 합계 계산 시 마지막으로 추가된 항목을 제외함
        let sum = 0;
        const countToSum = selectedOptions.length > 1 ? selectedOptions.length - 1 : selectedOptions.length;
        
        for (let i = 0; i < countToSum; i++) {
            sum += selectedOptions[i].price;
        }

        // 평수 보정 (평당 기본 시공비 10만원 가정)
        const baseCost = currentPyeong * 100000;
        const finalTotal = sum + baseCost;

        totalEstimate.textContent = `${finalTotal.toLocaleString()}원`;
    };

    pyeongInput.onchange = (e) => {
        currentPyeong = parseInt(e.target.value) || 0;
        updateSummary();
    };

    // Render Portfolio
    const renderPortfolio = (portfolio) => {
        portfolioGrid.innerHTML = '';
        portfolio.forEach((port, index) => {
            const card = document.createElement('div');
            card.className = 'port-card';
            
            // Buggy vertical image for index 2
            const isLong = (index === 2);
            
            card.innerHTML = `
                <div class="port-img-container">
                    <img src="${isLong ? '/assets/port_long.png' : '/assets/port_default.png'}" alt="${port.description}">
                </div>
                <div class="port-info">
                    <h5>${port.description}</h5>
                    <p style="font-size: 12px; color: #6B7280;">${port.type} | ${port.pyeong}평 | ${port.style}</p>
                </div>
            `;
            card.onclick = () => showPortfolioDetail(port);
            portfolioGrid.appendChild(card);
        });
    };

    // INTENTIONAL GUI BUG: site080-bug03
    // Type: interior-consult-button-no-response
    // Description: 상담 신청 버튼 selector가 실제 DOM id와 달라 click listener가 연결되지 않음.
    // HTML ID is 'btn-submit-consult-wrong', but we look for 'btn-submit-consult-correct'
    const consultBtn = document.getElementById('btn-submit-consult-correct');
    if (consultBtn) {
        consultBtn.onclick = () => {
            const name = document.getElementById('user-name').value;
            if (name) {
                alert(`${name}님, 상담 신청이 정상 접수되었습니다!`);
            } else {
                alert('성함을 입력해 주세요.');
            }
        };
    } else {
        console.warn('BUG: Consultation button not found by ID "btn-submit-consult-correct"');
    }

    // Modal
    const modal = document.getElementById('port-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-modal');

    const showPortfolioDetail = (port) => {
        modalBody.innerHTML = `
            <div style="display: flex; gap: 40px;">
                <img src="./assets/port_default.png" style="width: 500px; border-radius: 8px;">
                <div>
                    <h2>${port.description}</h2>
                    <hr style="margin: 20px 0; border: 1px solid #eee;">
                    <p><strong>유형:</strong> ${port.type}</p>
                    <p><strong>평수:</strong> ${port.pyeong}평</p>
                    <p><strong>스타일:</strong> ${port.style}</p>
                    <p style="margin-top: 30px; color: #666;">이 시공 사례는 프리미엄 자재를 사용하여 완성된 The Living의 대표 프로젝트입니다. 고객님의 니즈에 맞춘 맞춤형 시공이 가능합니다.</p>
                </div>
            </div>
        `;
        modal.style.display = 'block';
    };

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    // Space Type Chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.onclick = () => {
            document.querySelector('.chip.active').classList.remove('active');
            chip.classList.add('active');
        };
    });

    fetchData();
});
