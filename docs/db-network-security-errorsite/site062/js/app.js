document.addEventListener('DOMContentLoaded', () => {
  let snippets = [];
  let currentLang = 'All';
  let activeSnippetId = null;
  let selectedTags = [];

  const snippetGrid = document.getElementById('snippet-grid');
  const snippetSearch = document.getElementById('snippet-search');
  const langItems = document.querySelectorAll('#lang-list li');
  
  const navAll = document.getElementById('nav-all');
  const navNew = document.getElementById('nav-new');
  
  const snippetsView = document.getElementById('snippets-view');
  const newView = document.getElementById('new-view');

  const detailModal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  
  const tagSelector = document.getElementById('tag-selector');
  const saveBtn = document.getElementById('save-snippet-btn');
  const newTitle = document.getElementById('new-title');
  const newLang = document.getElementById('new-lang');
  const newPrivate = document.getElementById('new-private');
  const newCode = document.getElementById('new-code');

  const toast = document.getElementById('toast');

  function init() {
    fetchSnippets();
    fetchTags();
  }

  function fetchSnippets() {
    fetch(`/api/snippets?lang=${currentLang}`)
      .then(res => res.json())
      .then(data => {
        snippets = data;
        renderSnippets();
      });
  }

  function renderSnippets() {
    snippetGrid.innerHTML = '';
    const term = snippetSearch.value.toLowerCase();
    const filtered = snippets.filter(s => 
      s.title.toLowerCase().includes(term) || 
      s.tags.some(t => t.toLowerCase().includes(term))
    );

    filtered.forEach(s => {
      const card = document.createElement('div');
      card.className = 'snippet-card';
      card.innerHTML = `
        <div class="flex-between">
          <span class="lang-tag">${s.language}</span>
          <span class="text-xs text-dim">${s.isPrivate ? '🔒 Private' : '🌐 Public'}</span>
        </div>
        <h3 class="mt-2">${s.title}</h3>
        <div class="card-footer">
          <div class="tags">
            ${s.tags.map(t => `<span class="tag-badge">#${t}</span>`).join('')}
          </div>
          <button class="btn-copy-small" onclick="event.stopPropagation(); copyToClipboard(\`${s.code.replace(/`/g, '\\`')}\`)">Copy</button>
        </div>
      `;
      card.onclick = () => openSnippetDetail(s.id);
      snippetGrid.appendChild(card);
    });
  }

  // 태그 로드 (Bug 02: 응답이 배열이 아닌 쉼표 문자열로 옴)
  function fetchTags() {
    fetch('/api/tags')
      .then(res => res.text()) // JSON이 아닌 텍스트로 받아야 함 (Bug 02 대응)
      .then(data => {
        tagSelector.innerHTML = '';
        // Bug 02: 데이터가 "Frontend,Backend" 처럼 옴. 
        // 런타임 에러 방지를 위해 수동 파싱 시도 (RL 에이전트가 이를 발견해야 함)
        const tagArray = data.split(','); 
        tagArray.forEach(tag => {
          const btn = document.createElement('div');
          btn.className = 'tag-option';
          btn.innerText = tag;
          btn.onclick = () => {
            btn.classList.toggle('selected');
            if (btn.classList.contains('selected')) {
              selectedTags.push(tag);
            } else {
              selectedTags = selectedTags.filter(t => t !== tag);
            }
          };
          tagSelector.appendChild(btn);
        });
      });
  }

  // 스니펫 상세 조회 (Bug 03: 비공개 접근 제어 우회 테스트 가능)
  function openSnippetDetail(id) {
    activeSnippetId = id;
    fetch(`/api/snippets/${id}`)
      .then(res => res.json())
      .then(data => {
        modalBody.innerHTML = `
          <div style="font-family:JetBrains Mono; color:var(--purple); font-weight:700; font-size:0.8rem; margin-bottom:15px;">SNIPPET DETAILS</div>
          <h2 style="font-family:Inter; font-size:2rem; font-weight:800;">${data.title}</h2>
          <div class="mt-2">
            <span class="lang-tag">${data.language}</span>
            <span class="text-xs text-dim ml-3">${data.isPrivate ? '🔒 Private Snippet' : '🌐 Public Snippet'}</span>
          </div>
          <div class="mt-4 code-display">${escapeHtml(data.code)}</div>
          <div class="mt-4 tags">
            ${data.tags.map(t => `<span class="tag-badge" style="font-size:0.9rem;">#${t}</span>`).join('')}
          </div>
        `;
        detailModal.style.display = 'block';
      });
  }

  // 스니펫 저장 (Bug 01: 첫 번째 태그만 저장됨)
  saveBtn.onclick = () => {
    const title = newTitle.value;
    const lang = newLang.value;
    const isPrivate = newPrivate.value === 'true';
    const code = newCode.value;

    if (!title || !code) return showToast('제목과 코드를 모두 입력해 주세요.');

    fetch('/api/snippets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, language: lang, isPrivate, code, tags: selectedTags })
    })
    .then(res => res.json())
    .then(data => {
      showToast('스니펫이 저장소에 보관되었습니다.');
      resetForm();
      switchTab(navAll, snippetsView);
      fetchSnippets();
    });
  };

  function resetForm() {
    newTitle.value = '';
    newCode.value = '';
    selectedTags = [];
    document.querySelectorAll('.tag-option.selected').forEach(el => el.classList.remove('selected'));
  }

  window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => showToast('코드가 클립보드에 복사되었습니다.'));
  };

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  snippetSearch.oninput = () => renderSnippets();
  langItems.forEach(item => {
    item.onclick = () => {
      langItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      currentLang = item.dataset.lang;
      fetchSnippets();
    };
  });

  function switchTab(btn, view) {
    [navAll, navNew].forEach(b => b.classList.remove('active'));
    [snippetsView, newView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navAll.onclick = () => switchTab(navAll, snippetsView);
  navNew.onclick = () => switchTab(navNew, newView);

  closeBtn.onclick = () => detailModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == detailModal) detailModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
