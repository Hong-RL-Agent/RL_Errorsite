document.addEventListener('DOMContentLoaded', () => {
    let allPosts = [];
    let filteredPosts = [];
    let activeTag = 'all';
    let previousTag = 'all'; // Used for the bug

    const postsContainer = document.getElementById('posts-container');
    const tagsList = document.getElementById('tags-list');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const modal = document.getElementById('post-modal');
    const modalBody = document.getElementById('modal-body');
    const closeModal = document.querySelector('.close-modal');

    // Initialize
    fetchPosts();
    fetchTags();

    async function fetchPosts() {
        try {
            const response = await fetch('/api/posts');
            allPosts = await response.json();
            filteredPosts = [...allPosts];
            renderPosts();
        } catch (error) {
            postsContainer.innerHTML = '<div class="error">글을 불러오지 못했습니다.</div>';
        }
    }

    async function fetchTags() {
        try {
            const response = await fetch('/api/tags');
            const tags = await response.json();
            renderTags(tags);
        } catch (error) {
            console.error('Failed to fetch tags');
        }
    }

    function renderTags(tags) {
        tags.forEach(tag => {
            const btn = document.createElement('button');
            btn.className = 'tag-chip';
            btn.textContent = `${tag.name} (${tag.count})`;
            btn.dataset.tag = tag.name;
            btn.addEventListener('click', () => handleTagClick(tag.name, btn));
            tagsList.appendChild(btn);
        });
    }

    function handleTagClick(tag, element) {
        document.querySelectorAll('.tag-chip').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
        
        previousTag = activeTag;
        activeTag = tag;
        
        filterPosts();
    }

    function filterPosts() {
        // INTENTIONAL GUI BUG: site049-bug01
        // Type: tag-filter-mismatch
        // Description: 활성 태그 state와 실제 필터 함수에서 참조하는 태그 값이 달라 글 목록이 불일치함.
        // Specifically, when '여행' is clicked, it might use 'previousTag' (like '일상') to filter.
        let tagToUse = activeTag;
        if (activeTag === '여행') {
            tagToUse = '일상'; // Hardcoded mismatch for demonstration
        }

        const searchTerm = searchInput.value.toLowerCase();
        
        filteredPosts = allPosts.filter(post => {
            const matchesTag = tagToUse === 'all' || post.tags.includes(tagToUse);
            const matchesSearch = post.title.toLowerCase().includes(searchTerm) || 
                                post.summary.toLowerCase().includes(searchTerm);
            return matchesTag && matchesSearch;
        });

        sortPosts();
        renderPosts();
    }

    function sortPosts() {
        const criteria = sortSelect.value;
        if (criteria === 'popular') {
            // Mock popularity sorting (by ID for now)
            filteredPosts.sort((a, b) => b.id - a.id);
        } else {
            filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    }

    function renderPosts() {
        if (filteredPosts.length === 0) {
            postsContainer.innerHTML = '<div class="loading">검색 결과가 없습니다.</div>';
            return;
        }

        postsContainer.innerHTML = '';
        filteredPosts.forEach(post => {
            const article = document.createElement('article');
            article.className = 'post-card';
            article.innerHTML = `
                <div class="post-thumb">
                    <img src="${post.thumbnail}" alt="${post.title}">
                </div>
                <div class="post-meta">
                    <span class="category">${post.category}</span>
                    <h2>${post.title}</h2>
                    <p>${post.summary}</p>
                    <div class="post-footer">
                        <span>${post.date}</span>
                        <span>${post.readTime}</span>
                    </div>
                </div>
            `;
            article.addEventListener('click', () => openPostDetail(post));
            postsContainer.appendChild(article);
        });
    }

    function openPostDetail(post) {
        modalBody.innerHTML = `
            <div class="modal-header">
                <span class="category">${post.category}</span>
                <h1>${post.title}</h1>
                <div class="post-info">
                    <span>작성일: ${post.date}</span> | <span>읽는 시간: ${post.readTime}</span>
                </div>
            </div>
            <div class="modal-img" style="margin: 20px 0;">
                <img src="${post.thumbnail}" alt="" style="width: 100%; border-radius: 4px;">
            </div>
            <div class="modal-text">
                <p>${post.summary}</p>
                <p style="margin-top: 20px;">본문 내용은 준비 중입니다. 작가 김세이지의 에세이를 기다려주세요...</p>
            </div>
            <div class="modal-tags" style="margin-top: 30px;">
                ${post.tags.map(t => `<span class="tag-chip">${t}</span>`).join(' ')}
            </div>
        `;
        modal.style.display = 'block';
    }

    // Event Listeners
    searchInput.addEventListener('input', filterPosts);
    sortSelect.addEventListener('change', filterPosts);
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // INTENTIONAL GUI BUG: site049-bug03
    // Type: newsletter-button-no-response
    // Description: 뉴스레터 버튼 selector가 실제 DOM id와 달라 click listener가 연결되지 않음.
    const newsletterBtn = document.getElementById('newsletter-subscribe-wrong-id'); // Actual ID is 'newsletter-btn-actual'
    if (newsletterBtn) {
        newsletterBtn.addEventListener('click', () => {
            const email = document.getElementById('newsletter-email').value;
            if (email) {
                alert(`${email}로 뉴스레터 구독이 신청되었습니다.`);
            } else {
                alert('이메일을 입력해주세요.');
            }
        });
    } else {
        console.warn('Newsletter subscribe button not found (intended bug)');
    }
});
