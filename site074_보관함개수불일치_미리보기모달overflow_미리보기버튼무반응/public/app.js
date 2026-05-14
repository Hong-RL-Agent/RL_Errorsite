document.addEventListener('DOMContentLoaded', () => {
    let allTemplates = [];
    let savedTemplates = [];
    
    // DOM Elements
    const templateGrid = document.getElementById('template-grid');
    const categoryList = document.getElementById('category-list');
    const currentCategoryLabel = document.getElementById('current-category');
    const searchInput = document.getElementById('global-search');
    const searchBtn = document.getElementById('search-btn');
    const libraryCount = document.getElementById('library-count');
    const libraryPanel = document.getElementById('library-panel');
    const libraryItems = document.getElementById('library-items');
    const libraryToggleBtn = document.getElementById('library-toggle-btn');
    const closeLibraryBtn = document.getElementById('close-library');
    const previewModal = document.getElementById('preview-modal');
    const closeModalBtn = document.querySelector('.close-modal');

    // Initialize
    async function init() {
        try {
            const [templatesRes, catsRes] = await Promise.all([
                fetch('/api/templates'),
                fetch('/api/categories')
            ]);
            
            allTemplates = await templatesRes.json();
            const categories = await catsRes.json();
            
            renderCategories(categories);
            renderTemplates(allTemplates);
        } catch (error) {
            console.error('Data load error:', error);
            templateGrid.innerHTML = '<p class="error">Failed to load templates. Please refresh.</p>';
        }
    }

    // Render Categories
    function renderCategories(categories) {
        categories.forEach(cat => {
            const li = document.createElement('li');
            li.textContent = `${cat.name} (${cat.count})`;
            li.dataset.cat = cat.name;
            li.onclick = () => {
                document.querySelectorAll('.category-list li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                currentCategoryLabel.textContent = cat.name;
                filterTemplates();
            };
            categoryList.appendChild(li);
        });
    }

    // Render Templates
    function renderTemplates(templates) {
        templateGrid.innerHTML = '';
        if (templates.length === 0) {
            templateGrid.innerHTML = '<p class="no-results">No templates found for this criteria.</p>';
            return;
        }

        templates.forEach(t => {
            const card = document.createElement('div');
            card.className = 'template-card';
            card.innerHTML = `
                <div class="card-thumb">
                    <img src="${t.thumbnail}" alt="${t.title}">
                </div>
                <div class="card-body">
                    <span class="cat">${t.category}</span>
                    <h4>${t.title}</h4>
                    <div class="card-meta">
                        <span>${t.format}</span>
                        <span>${t.downloads.toLocaleString()} downloads</span>
                    </div>
                    <div class="card-footer">
                        <span class="price ${t.price === 0 ? 'free' : ''}">${t.price === 0 ? 'FREE' : t.price.toLocaleString() + ' KRW'}</span>
                        <div class="card-actions">
                            <button class="card-btn preview-btn" data-id="${t.id}">Preview</button>
                            <button class="card-btn save-btn" data-id="${t.id}">Save</button>
                        </div>
                    </div>
                </div>
            `;
            templateGrid.appendChild(card);
        });

        // Add Listeners
        document.querySelectorAll('.preview-btn').forEach(btn => {
            const id = btn.dataset.id;
            
            // INTENTIONAL GUI BUG: site074-bug03
            // Type: preview-button-no-response
            // Description: 특정 템플릿의 미리보기 버튼에 click listener를 연결하지 않아 모달이 열리지 않음.
            if (id === 'T004') {
                btn.setAttribute('data-bug-id', 'site074-bug03');
                // No listener attached for T004
            } else {
                btn.addEventListener('click', () => openPreview(id));
            }
        });

        document.querySelectorAll('.save-btn').forEach(btn => {
            btn.addEventListener('click', () => saveTemplate(btn.dataset.id));
        });
    }

    // Filter Logic
    function filterTemplates() {
        const activeCat = document.querySelector('.category-list li.active').dataset.cat;
        const searchTerm = searchInput.value.toLowerCase();
        const selectedFormats = Array.from(document.querySelectorAll('#format-filter input:checked')).map(i => i.value);
        const priceFilter = document.querySelector('input[name="price"]:checked').value;

        const filtered = allTemplates.filter(t => {
            const matchesCat = activeCat === 'all' || t.category === activeCat;
            const matchesSearch = t.title.toLowerCase().includes(searchTerm);
            const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(t.format);
            const matchesPrice = priceFilter === 'all' || (priceFilter === 'free' ? t.price === 0 : t.price > 0);
            return matchesCat && matchesSearch && matchesFormat && matchesPrice;
        });

        renderTemplates(filtered);
    }

    // Library Logic
    function saveTemplate(id) {
        const template = allTemplates.find(t => t.id === id);
        if (template && !savedTemplates.find(s => s.id === id)) {
            savedTemplates.push(template);
            updateLibraryUI();
        }
    }

    function updateLibraryUI() {
        // Render items
        libraryItems.innerHTML = '';
        if (savedTemplates.length === 0) {
            libraryItems.innerHTML = '<p class="empty-msg">No templates saved yet.</p>';
            document.getElementById('library-footer').style.display = 'none';
        } else {
            savedTemplates.forEach(t => {
                const div = document.createElement('div');
                div.className = 'saved-item';
                div.innerHTML = `
                    <img src="${t.thumbnail}" alt="">
                    <div>
                        <h5>${t.title}</h5>
                        <span class="format">${t.format}</span>
                    </div>
                `;
                libraryItems.appendChild(div);
            });
            document.getElementById('library-footer').style.display = 'block';
        }

        // INTENTIONAL GUI BUG: site074-bug01
        // Type: saved-template-count-mismatch
        // Description: 보관함 실제 배열 길이보다 하나 적은 값을 헤더 배지에 표시함.
        // Even if the array has 3 items, the badge will show 2.
        const displayCount = savedTemplates.length > 0 ? savedTemplates.length - 1 : 0;
        libraryCount.textContent = displayCount;
        
        // Ensure badge is visible if count > 0 (even if bugged)
        libraryCount.style.display = displayCount >= 0 ? 'flex' : 'none';
    }

    // Modal Logic
    function openPreview(id) {
        const t = allTemplates.find(item => item.id === id);
        if (!t) return;

        document.getElementById('modal-title').textContent = t.title;
        document.getElementById('modal-cat').textContent = t.category;
        document.getElementById('modal-format').textContent = t.format;
        document.getElementById('modal-img').src = t.thumbnail;
        document.getElementById('modal-price').textContent = t.price === 0 ? 'FREE' : t.price.toLocaleString() + ' KRW';
        document.getElementById('modal-downloads').textContent = t.downloads.toLocaleString();
        
        // Special case for BUG 02 verification: use a high-res large image if possible
        // but for now the placeholder will do if it's large enough.

        previewModal.style.display = 'block';
        
        document.getElementById('save-from-modal').onclick = () => {
            saveTemplate(id);
            previewModal.style.display = 'none';
        };
    }

    // Event Listeners
    libraryToggleBtn.addEventListener('click', () => libraryPanel.classList.toggle('open'));
    closeLibraryBtn.addEventListener('click', () => libraryPanel.classList.remove('open'));
    closeModalBtn.addEventListener('click', () => previewModal.style.display = 'none');
    
    searchInput.addEventListener('input', filterTemplates);
    document.querySelectorAll('#format-filter input').forEach(i => i.addEventListener('change', filterTemplates));
    document.querySelectorAll('input[name="price"]').forEach(i => i.addEventListener('change', filterTemplates));

    window.onclick = (e) => {
        if (e.target === previewModal) previewModal.style.display = 'none';
    };

    init();
});
