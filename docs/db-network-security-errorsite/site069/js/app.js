document.addEventListener('DOMContentLoaded', () => {
  let meetings = [];
  let myParticipants = [];
  let currentSearch = '';
  let activeMeetingId = null;

  const meetingListEl = document.getElementById('meeting-list');
  const meetingSearch = document.getElementById('meeting-search');
  const datePicker = document.getElementById('date-picker');
  
  const navDiscover = document.getElementById('nav-discover');
  const navMyMeetings = document.getElementById('nav-my-meetings');
  
  const discoverView = document.getElementById('discover-view');
  const myMeetingsView = document.getElementById('my-meetings-view');

  const meetingModal = document.getElementById('meeting-modal');
  const modalBody = document.getElementById('modal-body');
  const questionListEl = document.getElementById('question-list');
  const actionBtn = document.getElementById('action-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const closeBtn = document.querySelector('.close');

  const toast = document.getElementById('toast');

  function init() {
    fetchMeetings();
    fetchMyStatus();
  }

  function fetchMeetings() {
    fetch('/api/meetings')
      .then(res => res.json())
      .then(data => {
        meetings = data;
        renderMeetings();
      });
  }

  function fetchMyStatus() {
    fetch('/api/participants')
      .then(res => res.json())
      .then(data => {
        myParticipants = data.filter(p => p.userId === 'user_A');
      });
  }

  function renderMeetings() {
    meetingListEl.innerHTML = '';
    const term = meetingSearch.value.toLowerCase();
    const filtered = meetings.filter(m => 
      m.title.toLowerCase().includes(term) || m.book.toLowerCase().includes(term)
    );

    filtered.forEach(m => {
      const card = document.createElement('div');
      card.className = 'meeting-card';
      card.innerHTML = `
        <div class="card-header">📖</div>
        <div class="card-body">
          <span class="book-title">《${m.book}》</span>
          <h3>${m.title}</h3>
          <div class="meeting-info">
            <p>🗓️ ${m.date}</p>
            <p>📍 ${m.location}</p>
          </div>
        </div>
      `;
      card.onclick = () => openMeetingDetail(m.id);
      meetingListEl.appendChild(card);
    });
  }

  // 모임 상세 (Bug 03: 비공개 모임 무단 조회 테스트 가능)
  function openMeetingDetail(id) {
    activeMeetingId = id;
    fetch(`/api/meetings/${id}`)
      .then(res => res.json())
      .then(data => {
        modalBody.innerHTML = `
          <div style="font-family:Crimson Pro; color:var(--oak-light); font-weight:700; font-size:0.9rem; letter-spacing:1px;">MEETING DETAILS</div>
          <h2 class="mt-2" style="font-size:2.5rem; font-weight:700; line-height:1.2;">${data.title}</h2>
          <div class="mt-4 p-5" style="background:var(--beige-dark); border-radius:8px;">
            <p><strong>함께 읽는 책:</strong> 《${data.book}》</p>
            <p class="mt-2"><strong>일시:</strong> ${data.date}</p>
            <p class="mt-2"><strong>장소:</strong> ${data.location}</p>
            <p class="mt-2"><strong>공개 여부:</strong> ${data.isPrivate ? '비공개 모임 🔒' : '공개 모임 🌐'}</p>
          </div>
          <p class="mt-4 text-sm text-muted" style="line-height:1.8;">
            독서는 혼자 하는 것이지만, 사유의 나눔은 함께할 때 깊어집니다. 
            서로의 문장을 나누며 새로운 시각을 발견하는 지적인 즐거움을 느껴보세요.
          </p>
        `;
        
        const part = myParticipants.find(p => p.meetingId === id);
        if (part) {
          actionBtn.style.display = 'none';
          cancelBtn.style.display = 'block';
          cancelBtn.onclick = () => cancelParticipation(part.id);
        } else {
          actionBtn.style.display = 'block';
          cancelBtn.style.display = 'none';
          actionBtn.onclick = () => showToast('참가 신청이 완료되었습니다. (모의)');
        }

        fetchQuestions(id);
        meetingModal.style.display = 'block';
      });
  }

  // 토론 질문 (Bug 02: 일부 질문 ID 누락)
  function fetchQuestions(meetingId) {
    fetch(`/api/questions?meetingId=${meetingId}`)
      .then(res => res.json())
      .then(data => {
        questionListEl.innerHTML = '';
        if (data.length === 0) {
          questionListEl.innerHTML = '<p class="text-muted">등록된 발제문이 없습니다.</p>';
          return;
        }
        data.forEach(q => {
          const div = document.createElement('div');
          div.className = 'question-item';
          div.innerHTML = `
            <p>"${q.content}"</p>
            <div class="mt-2 text-right">
              <span class="text-xs text-muted">ID: ${q.questionId || 'N/A'}</span>
            </div>
          `;
          questionListEl.appendChild(div);
        });
      });
  }

  // 참가 취소 (Bug 01: 서버 응답은 성공이나 데이터는 삭제되지 않음)
  function cancelParticipation(id) {
    fetch(`/api/participants/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        showToast(data.message);
        // Bug 01 확인을 위해 탭을 새로고침하여 데이터를 다시 가져옴
        fetchMyStatus();
        meetingModal.style.display = 'none';
      });
  }

  function renderMyMeetings() {
    const listEl = document.getElementById('my-active-list');
    listEl.innerHTML = '';
    
    // Bug 01 영향: 취소했어도 status가 active라 리스트에 계속 나타남
    const active = myParticipants.filter(p => p.status === 'active');
    
    if (active.length === 0) {
      listEl.innerHTML = '<p class="p-5 text-center text-muted">참가 중인 모임이 없습니다.</p>';
      return;
    }

    active.forEach(p => {
      const meet = meetings.find(m => m.id === p.meetingId) || { title: '정보를 불러올 수 없는 모임', book: '-' };
      const div = document.createElement('div');
      div.className = 'list-item';
      div.innerHTML = `
        <div>
          <strong style="font-size:1.1rem; color:var(--oak);">${meet.title}</strong>
          <p class="text-sm text-muted">《${meet.book}》</p>
        </div>
        <button class="btn-oak" style="padding:8px 16px; font-size:0.85rem;" onclick="openMeetingDetail('${p.meetingId}')">상세 보기</button>
      `;
      listEl.appendChild(div);
    });
  }

  meetingSearch.oninput = () => renderMeetings();

  function switchTab(btn, view) {
    [navDiscover, navMyMeetings].forEach(b => b.classList.remove('active'));
    [discoverView, myMeetingsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    
    if (view === myMeetingsView) renderMyMeetings();
  }

  navDiscover.onclick = () => switchTab(navDiscover, discoverView);
  navMyMeetings.onclick = () => switchTab(navMyMeetings, myMeetingsView);

  closeBtn.onclick = () => meetingModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == meetingModal) meetingModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
