document.addEventListener('DOMContentLoaded', () => {
  let notes = [];
  let activeNoteId = null;

  const noteGrid = document.getElementById('note-grid');
  const noteSearch = document.getElementById('note-search');
  const subjectFilter = document.getElementById('subject-filter');
  
  const navExplore = document.getElementById('nav-explore');
  const navUpload = document.getElementById('nav-upload');
  
  const exploreView = document.getElementById('explore-view');
  const uploadView = document.getElementById('upload-view');

  const noteModal = document.getElementById('note-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  
  const commentList = document.getElementById('comment-list');
  const commentCount = document.getElementById('comment-count');
  const newCommentInput = document.getElementById('new-comment');
  const submitCommentBtn = document.getElementById('submit-comment');

  const uploadTitle = document.getElementById('upload-title');
  const uploadFile = document.getElementById('upload-file');
  const submitUploadBtn = document.getElementById('submit-upload');

  const toast = document.getElementById('toast');

  function init() {
    fetchNotes();
  }

  function fetchNotes() {
    const subject = subjectFilter.value;
    fetch(`/api/notes?subject=${subject}`)
      .then(res => res.json())
      .then(data => {
        notes = data;
        renderNotes();
      });
  }

  function renderNotes() {
    noteGrid.innerHTML = '';
    const term = noteSearch.value.toLowerCase();
    const filtered = notes.filter(n => n.title.toLowerCase().includes(term));

    filtered.forEach(n => {
      const card = document.createElement('div');
      card.className = 'note-card';
      card.innerHTML = `
        <h3>${n.title}</h3>
        <p class="text-xs text-muted">${n.subject}</p>
        <div class="note-meta">
          <span>By ${n.author}</span>
          <span>📥 ${n.downloads}</span>
        </div>
      `;
      card.onclick = () => openNoteModal(n.id);
      noteGrid.appendChild(card);
    });
  }

  // 노트 상세 조회 (Bug 03: 비공개 접근 제어 실패 테스트 가능)
  function openNoteModal(id) {
    activeNoteId = id;
    fetch(`/api/notes/${id}`)
      .then(res => res.json())
      .then(data => {
        modalBody.innerHTML = `
          <div style="font-family:Libre Baskerville; color:var(--indigo); font-weight:700; font-size:0.9rem;">LECTURE NOTE DETAIL</div>
          <h2 class="mt-2" style="font-family:Libre Baskerville; font-size:2.4rem;">${data.title}</h2>
          <div class="mt-4 p-4" style="background:var(--indigo-light); border-radius:4px;">
            <p><strong>작성자:</strong> ${data.author}</p>
            <p><strong>과목:</strong> ${data.subject}</p>
            <p><strong>공개 여부:</strong> ${data.isPrivate ? '비공개 (Private)' : '공개 (Public)'}</p>
          </div>
          <p class="mt-4">이 노트는 해당 강의의 핵심 내용을 체계적으로 정리한 자료입니다. 학습 목적으로만 활용해 주세요.</p>
        `;
        fetchComments(id);
        noteModal.style.display = 'block';
      });
  }

  // 댓글 조회 및 작성 (Bug 01: userId가 noteId에 저장됨)
  function fetchComments(noteId) {
    fetch(`/api/comments/${noteId}`)
      .then(res => res.json())
      .then(data => {
        commentList.innerHTML = '';
        commentCount.innerText = data.length;
        data.forEach(c => {
          const div = document.createElement('div');
          div.className = 'comment-item';
          div.innerHTML = `<span class="comment-author">${c.author}:</span> ${c.text}`;
          commentList.appendChild(div);
        });
      });
  }

  submitCommentBtn.onclick = () => {
    const text = newCommentInput.value;
    if (!text) return;

    fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId: activeNoteId, userId: 'User_Current', text })
    })
    .then(res => res.json())
    .then(() => {
      newCommentInput.value = '';
      fetchComments(activeNoteId);
      showToast('댓글이 등록되었습니다.');
    });
  };

  // 업로드 처리 (Bug 02: 비허용 파일 확장자 성공 처리)
  submitUploadBtn.onclick = () => {
    const title = uploadTitle.value;
    const file = uploadFile.files[0];
    if (!title || !file) return showToast('제목과 파일을 입력해 주세요.');

    fetch('/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, fileName: file.name })
    })
    .then(res => res.json())
    .then(data => {
      showToast(data.message);
      if (data.status === 'success') {
        uploadTitle.value = '';
        uploadFile.value = '';
        switchTab(navExplore, exploreView);
      }
    });
  };

  noteSearch.oninput = () => renderNotes();
  subjectFilter.onchange = () => fetchNotes();

  function switchTab(btn, view) {
    [navExplore, navUpload].forEach(b => b.classList.remove('active'));
    [exploreView, uploadView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navExplore.onclick = () => switchTab(navExplore, exploreView);
  navUpload.onclick = () => switchTab(navUpload, uploadView);

  closeBtn.onclick = () => noteModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == noteModal) noteModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
