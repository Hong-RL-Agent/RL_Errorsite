document.addEventListener('DOMContentLoaded', () => {
    let allFreelancers = [];
    let selectedFreelancers = [];

    const freelancerGrid = document.getElementById('freelancer-grid');
    const jobFilter = document.getElementById('job-filter');
    const expFilter = document.getElementById('exp-filter');
    const selectedList = document.getElementById('selected-list');
    const matchProgress = document.getElementById('match-progress');
    const panelToggle = document.getElementById('panel-toggle');
    const panelContent = document.getElementById('selected-list');

    // Fetch Data
    const fetchData = async () => {
        try {
            const response = await fetch('/api/freelancers');
            allFreelancers = await response.json();
            renderFreelancers(allFreelancers);
        } catch (error) {
            console.error('Data loading failed:', error);
            freelancerGrid.innerHTML = '<div class="error">데이터를 불러오는 데 실패했습니다.</div>';
        }
    };

    // Render Freelancers
    const renderFreelancers = (freelancers) => {
        freelancerGrid.innerHTML = '';
        freelancers.forEach(fl => {
            const card = document.createElement('div');
            card.className = 'freelancer-card';
            card.innerHTML = `
                <div class="card-top">
                    <img src="./assets/profile.png" alt="${fl.name}" class="profile-avatar">
                    <div class="card-header">
                        <h4>${fl.name}</h4>
                        <p class="job-title">${fl.job}</p>
                    </div>
                </div>
                <div class="skill-tags" data-bug-id="site077-bug01">
                    ${renderSkillTags(fl.skills)}
                </div>
                <div class="card-footer">
                    <div class="rate">${fl.rate}</div>
                    <button class="btn-proposal" 
                        ${fl.id === 3 ? 'data-bug-id="site077-bug03"' : ''}
                        data-id="${fl.id}">제안 요청</button>
                </div>
            `;
            card.onclick = (e) => {
                if (e.target.tagName !== 'BUTTON') showFreelancerDetail(fl);
            };
            freelancerGrid.appendChild(card);
        });

        // Add Button Listeners
        document.querySelectorAll('.btn-proposal').forEach(btn => {
            // INTENTIONAL GUI BUG: site077-bug03
            // Type: proposal-request-button-no-response
            // Description: 특정 프리랜서(ID: 3, Marcus Thorne) 제안 요청 버튼에 click listener를 연결하지 않아 선택 패널이 변경되지 않음.
            if (parseInt(btn.dataset.id) === 3) {
                // No listener attached
                console.log('Skipping listener for buggy button site077-bug03');
            } else {
                btn.onclick = (e) => {
                    e.stopPropagation();
                    toggleFreelancerSelection(parseInt(btn.dataset.id));
                };
            }
        });
    };

    // INTENTIONAL GUI BUG: site077-bug01
    // Type: duplicate-skill-tag-render
    // Description: 기술 태그 렌더링 시 특정 skill을 추가로 append하여 같은 태그가 중복 표시됨.
    const renderSkillTags = (skills) => {
        let tagsHtml = skills.map(skill => `<span class="tag">${skill}</span>`).join('');
        
        // BUG: 첫 번째 기술 태그를 한 번 더 추가하여 중복 발생시킴
        if (skills.length > 0) {
            tagsHtml += `<span class="tag">${skills[0]}</span>`;
        }
        
        return tagsHtml;
    };

    const filterFreelancers = () => {
        const job = jobFilter.value;
        const exp = expFilter.value;

        let filtered = allFreelancers.filter(fl => {
            const jobMatch = job === 'all' || fl.job === job;
            
            let expMatch = true;
            const years = parseInt(fl.exp);
            if (exp === 'junior') expMatch = years <= 3;
            if (exp === 'senior') expMatch = years >= 5;

            return jobMatch && expMatch;
        });

        renderFreelancers(filtered);
    };

    jobFilter.addEventListener('change', filterFreelancers);
    expFilter.addEventListener('change', filterFreelancers);

    // Selection Logic
    const toggleFreelancerSelection = (id) => {
        const fl = allFreelancers.find(f => f.id === id);
        if (!fl) return;

        const index = selectedFreelancers.findIndex(f => f.id === id);
        if (index > -1) {
            selectedFreelancers.splice(index, 1);
        } else {
            if (selectedFreelancers.length >= 3) {
                alert('최대 3명까지 선택 가능합니다.');
                return;
            }
            selectedFreelancers.push(fl);
        }

        updateSelectedPanel();
    };

    const updateSelectedPanel = () => {
        if (selectedFreelancers.length === 0) {
            selectedList.innerHTML = '<p class="empty-msg">선택된 전문가가 없습니다.</p>';
            matchProgress.style.width = '0%';
            return;
        }

        selectedList.innerHTML = selectedFreelancers.map(fl => `
            <div class="selected-user">
                <img src="./assets/profile.png" alt="${fl.name}">
                <div class="user-info">
                    <p style="font-size: 13px; font-weight: 600;">${fl.name}</p>
                    <p style="font-size: 11px; color: var(--gray);">${fl.job}</p>
                </div>
                <button class="btn-remove" onclick="window.removeSelection(${fl.id})">×</button>
            </div>
        `).join('');

        matchProgress.style.width = `${(selectedFreelancers.length / 3) * 100}%`;
    };

    window.removeSelection = (id) => toggleFreelancerSelection(id);

    // Panel Toggle
    panelToggle.onclick = () => {
        panelContent.style.display = panelContent.style.display === 'none' ? 'block' : 'none';
        panelToggle.querySelector('.toggle-icon').textContent = panelContent.style.display === 'none' ? '▲' : '▼';
    };

    // Modal Logic
    const modal = document.getElementById('freelancer-modal');
    const modalInfo = document.getElementById('modal-info');
    const modalProfile = document.getElementById('modal-profile');
    const closeBtn = document.querySelector('.close-modal');

    const showFreelancerDetail = (fl) => {
        modalProfile.innerHTML = `<img src="./assets/profile.png" alt="${fl.name}" class="modal-profile-img">`;
        modalInfo.innerHTML = `
            <h2>${fl.name}</h2>
            <p class="job-title" style="font-size: 18px;">${fl.job}</p>
            <div style="margin-top: 10px;">
                <span class="stars">★★★★★</span>
                <span style="margin-left: 10px; font-weight: 600;">${fl.rating}</span>
                <span style="margin-left: 20px; color: var(--gray);">${fl.exp} 경력</span>
            </div>
        `;
        modal.style.display = 'block';
    };

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelector('.tab-btn.active').classList.remove('active');
            btn.classList.add('active');
            // Tab content switching would happen here
        };
    });

    fetchData();
});
