document.addEventListener('DOMContentLoaded', () => {
    let checklistItems = [];
    let templates = [];

    const templateSelect = document.getElementById('template-select');
    const checklistGrid = document.getElementById('checklist-grid-container');
    const totalCountSpan = document.getElementById('total-count');
    const doneCountSpan = document.getElementById('done-count');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const recommendationsList = document.getElementById('recommendations-list');
    const destInput = document.getElementById('destination-input');
    const destDisplay = document.getElementById('dest-display');

    const sharePanel = document.getElementById('share-panel');
    const btnShare = document.getElementById('btn-share');
    const closeModal = document.querySelector('.close-modal');

    // Initialize
    fetchInitialData();

    async function fetchInitialData() {
        try {
            const [checkRes, tempRes] = await Promise.all([
                fetch('/api/checklist'),
                fetch('/api/templates')
            ]);
            checklistItems = await checkRes.json();
            templates = await tempRes.json();
            
            renderTemplates();
            renderChecklist();
            updateProgress();
            renderRecommendations();
        } catch (error) {
            console.error('Data fetch error:', error);
        }
    }

    function renderTemplates() {
        templateSelect.innerHTML = '<option value="">여행 유형 선택</option>';
        templates.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.type;
            opt.innerText = t.name;
            templateSelect.appendChild(opt);
        });
    }

    function renderChecklist() {
        const categories = {
            '필수 서류': document.querySelector('#col-documents .item-list'),
            '전자기기': document.querySelector('#col-electronics .item-list'),
            '의류 및 기타': document.querySelector('#col-clothing .item-list')
        };

        // Clear previous items
        Object.values(categories).forEach(el => el.innerHTML = '');

        checklistItems.forEach(item => {
            const container = categories[item.category] || categories['의류 및 기타'];
            const div = document.createElement('div');
            div.className = `check-item ${item.done ? 'done' : ''}`;
            div.innerHTML = `
                <input type="checkbox" ${item.done ? 'checked' : ''}>
                <span>${item.name} ${item.required ? '(필수)' : ''}</span>
            `;

            div.querySelector('input').addEventListener('change', (e) => {
                item.done = e.target.checked;
                div.classList.toggle('done', item.done);
                updateProgress();
            });

            container.appendChild(div);
        });
    }

    function updateProgress() {
        const total = checklistItems.length;
        const actualDone = checklistItems.filter(i => i.done).length;

        // INTENTIONAL GUI BUG: site059-bug01
        // Type: completed-count-mismatch
        // Description: 완료 개수 계산 시 마지막 checked item을 제외해 실제 체크된 항목 수보다 적게 표시함.
        // If there are at least one item done, show (done - 1)
        let displayDone = actualDone;
        if (actualDone > 0) {
            displayDone = actualDone - 1;
        }

        const percentage = total === 0 ? 0 : Math.round((displayDone / total) * 100);

        totalCountSpan.innerText = total;
        doneCountSpan.innerText = displayDone;
        progressFill.style.width = `${percentage}%`;
        progressText.innerText = `${percentage}%`;
    }

    function renderRecommendations() {
        recommendationsList.innerHTML = '';
        const allRecs = templates.flatMap(t => t.items);
        const uniqueRecs = [...new Set(allRecs)].slice(0, 8);
        
        uniqueRecs.forEach(text => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerText = `+ ${text}`;
            tag.addEventListener('click', () => {
                const newItem = {
                    id: Date.now(),
                    name: text,
                    category: '의류 및 기타',
                    done: false,
                    required: false
                };
                checklistItems.push(newItem);
                renderChecklist();
                updateProgress();
            });
            recommendationsList.appendChild(tag);
        });
    }

    // INTENTIONAL GUI BUG: site059-bug03
    // Type: add-item-button-no-response
    // Description: 항목 추가 버튼 selector가 실제 DOM id와 달라 click listener가 연결되지 않음.
    // DOM id is 'btn-add-item-real', but we are selecting 'btn-add-item' (wrong id)
    const btnAddItem = document.getElementById('btn-add-item'); 
    if (btnAddItem) {
        btnAddItem.addEventListener('click', () => {
            const nameInput = document.getElementById('new-item-name');
            const categorySelect = document.getElementById('new-item-category');
            
            if (!nameInput.value.trim()) return;

            const newItem = {
                id: Date.now(),
                name: nameInput.value.trim(),
                category: categorySelect.value,
                done: false,
                required: false
            };

            checklistItems.push(newItem);
            nameInput.value = '';
            renderChecklist();
            updateProgress();
        });
    } else {
        console.warn('Bug 03: Add item button listener failed to bind due to ID mismatch.');
    }

    // Hero Actions
    document.getElementById('btn-start').addEventListener('click', () => {
        if (destInput.value) {
            destDisplay.innerText = destInput.value;
        }
        
        const type = templateSelect.value;
        if (type) {
            const template = templates.find(t => t.type === type);
            // Add template items to checklist if not already there
            template.items.forEach(name => {
                if (!checklistItems.find(i => i.name === name)) {
                    checklistItems.push({
                        id: Date.now() + Math.random(),
                        name: name,
                        category: '의류 및 기타',
                        done: false,
                        required: false
                    });
                }
            });
            renderChecklist();
            updateProgress();
            alert(`${template.name} 템플릿이 적용되었습니다.`);
        }
    });

    // Share Modal
    btnShare.addEventListener('click', () => sharePanel.style.display = 'block');
    closeModal.addEventListener('click', () => sharePanel.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === sharePanel) sharePanel.style.display = 'none'; });
});
