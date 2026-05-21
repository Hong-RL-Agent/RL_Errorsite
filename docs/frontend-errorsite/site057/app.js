document.addEventListener('DOMContentLoaded', () => {
    let allJobs = [];
    let allCompanies = [];
    let filteredJobs = [];

    const jobGrid = document.getElementById('job-grid');
    const companyList = document.getElementById('company-list');
    const jobCountBadge = document.getElementById('job-count-badge');
    const jobSearchInput = document.getElementById('job-search-input');
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    const remoteFilters = document.querySelectorAll('#remote-filters input');
    const modal = document.getElementById('job-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');

    // Initialize
    fetchJobs();
    fetchCompanies();

    async function fetchJobs() {
        try {
            const response = await fetch('/api/jobs');
            allJobs = await response.json();
            filteredJobs = [...allJobs];
            renderJobs(filteredJobs);
        } catch (error) {
            jobGrid.innerHTML = '<div class="error">채용공고를 불러오지 못했습니다.</div>';
        }
    }

    async function fetchCompanies() {
        try {
            const response = await fetch('/api/companies');
            allCompanies = await response.json();
            renderCompanies(allCompanies);
        } catch (error) {
            companyList.innerHTML = '<div class="error">기업 정보를 불러오지 못했습니다.</div>';
        }
    }

    function renderJobs(jobs) {
        jobGrid.innerHTML = '';
        
        // INTENTIONAL GUI BUG: site057-bug01
        // Type: job-filter-count-mismatch
        // Description: 필터링된 공고 목록과 결과 수 배지가 서로 다른 배열 기준을 사용해 개수가 불일치함.
        // If we are filtering, we show the TOTAL length instead of the filtered length.
        const isFiltering = document.querySelector('input[name="category"]:checked').value !== 'all';
        if (isFiltering) {
            jobCountBadge.innerText = allJobs.length + 2; // Intentionally wrong count
        } else {
            jobCountBadge.innerText = jobs.length;
        }

        jobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'job-card';
            card.innerHTML = `
                <div class="job-card-header">
                    <span class="company-badge">${job.company}</span>
                    <button class="save-btn" onclick="event.stopPropagation(); this.innerText = this.innerText === '☆' ? '★' : '☆'">☆</button>
                </div>
                <h4>${job.title}</h4>
                <div class="job-meta">
                    <span>${job.location}</span> • <span>${job.remoteType}</span>
                </div>
                <div class="tech-tags">
                    ${job.techStack.map(tech => `<span class="tag">${tech}</span>`).join('')}
                </div>
                <div class="job-card-footer">
                    <span class="salary">${job.salary}</span>
                    <button class="btn btn-indigo btn-sm apply-btn" data-job-id="${job.id}">지원하기</button>
                </div>
            `;
            
            card.addEventListener('click', () => openJobDetail(job));

            // INTENTIONAL GUI BUG: site057-bug03
            // Type: apply-button-no-response
            // Description: 특정 채용공고 지원 버튼에 click listener를 연결하지 않아 클릭해도 지원 UI가 열리지 않음.
            // Job ID 4 (NovaSoft Fullstack) will be unresponsive.
            const applyBtn = card.querySelector('.apply-btn');
            if (job.id === 4) {
                applyBtn.dataset.bugId = 'site057-bug03';
                // Listener NOT attached
                applyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    console.warn(`Bug 03: Apply button for job ${job.id} is intentionally unresponsive.`);
                });
            } else {
                applyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    alert(`${job.company} - ${job.title} 포지션에 지원하시겠습니까? (준비 중)`);
                });
            }

            jobGrid.appendChild(card);
        });
    }

    function renderCompanies(companies) {
        companyList.innerHTML = '';
        companies.forEach(company => {
            const item = document.createElement('div');
            item.className = 'company-item';
            item.innerHTML = `
                <div class="company-logo-placeholder">${company.name[0]}</div>
                <div class="company-info">
                    <h5>${company.name}</h5>
                    <span>${company.industry} • ${company.openings} 공고</span>
                </div>
            `;
            companyList.appendChild(item);
        });
    }

    function openJobDetail(job) {
        modalBody.innerHTML = `
            <div class="modal-header">
                <span class="company-badge">${job.company}</span>
                <h2>${job.title}</h2>
                <p style="color: #64748b; margin-top: 10px;">${job.location} | ${job.remoteType} | 마감일: ${job.deadline}</p>
            </div>
            <div class="modal-info-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px;">
                <div class="info-item">
                    <strong>연봉 범위</strong>
                    <p>${job.salary}</p>
                </div>
                <div class="info-item">
                    <strong>기술 스택</strong>
                    <p>${job.techStack.join(', ')}</p>
                </div>
            </div>
            <div class="modal-description" style="margin-top: 25px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <h3>주요 업무</h3>
                <ul style="margin-left: 20px; margin-top: 10px;">
                    <li>원격 근무 기반의 효율적인 협업 및 기능 구현</li>
                    <li>사용자 중심의 제품 설계 및 지속적인 성능 개선</li>
                    <li>최신 기술 스택을 활용한 안정적인 시스템 구축</li>
                </ul>
            </div>
            <button class="btn btn-indigo btn-block mt-1" onclick="alert('지원서 작성 페이지로 이동합니다. (준비 중)')">지금 지원하기</button>
        `;
        modal.style.display = 'block';
    }

    // Filter Logic
    function applyFilters() {
        const query = jobSearchInput.value.toLowerCase();
        const selectedCategory = document.querySelector('input[name="category"]:checked').value;
        const selectedRemotes = Array.from(remoteFilters).filter(i => i.checked).map(i => i.value);

        filteredJobs = allJobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query);
            const matchesCategory = selectedCategory === 'all' || job.title.includes(selectedCategory) || (selectedCategory === 'Development' && (job.title.includes('Developer') || job.title.includes('Engineer')));
            const matchesRemote = selectedRemotes.includes(job.remoteType);
            return matchesSearch && matchesCategory && matchesRemote;
        });

        renderJobs(filteredJobs);
    }

    jobSearchInput.addEventListener('input', applyFilters);
    categoryFilters.forEach(radio => radio.addEventListener('change', applyFilters));
    remoteFilters.forEach(checkbox => checkbox.addEventListener('change', applyFilters));

    // Modal Close
    closeModal.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
});
