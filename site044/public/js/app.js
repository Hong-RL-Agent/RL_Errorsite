document.addEventListener('DOMContentLoaded', () => {
  let polls = [];
  let currentCat = 'all';
  let selectedOptionIdx = null;
  let activePollId = null;

  const pollGrid = document.getElementById('poll-grid');
  const pollSearch = document.getElementById('poll-search');
  const catBtns = document.querySelectorAll('.cat-btn');
  
  const navHome = document.getElementById('nav-home');
  const navMy = document.getElementById('nav-my');
  
  const homeView = document.getElementById('home-view');
  const myView = document.getElementById('my-view');

  const myVoteListEl = document.getElementById('my-vote-list');
  const pollModal = document.getElementById('poll-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const submitVoteBtn = document.getElementById('submit-vote-btn');
  const backToVoteBtn = document.getElementById('back-to-vote');
  const voteBtnGroup = document.getElementById('vote-btn-group');
  const resultBtnGroup = document.getElementById('result-btn-group');
  const toast = document.getElementById('toast');

  function init() {
    fetchPolls();
  }

  function fetchPolls() {
    fetch('/api/polls')
      .then(res => res.json())
      .then(data => {
        polls = data;
        renderPolls();
      });
  }

  function renderPolls() {
    pollGrid.innerHTML = '';
    const term = pollSearch.value.toLowerCase();
    
    let filtered = polls.filter(p => 
      (currentCat === 'all' || p.category === currentCat) &&
      (p.question.toLowerCase().includes(term))
    );

    filtered.forEach(p => {
      const card = document.createElement('div');
      card.className = 'poll-card';
      card.innerHTML = `
        <span class="cat-tag" style="color:var(--indigo); font-weight:700; font-size:0.8rem;">#${p.category}</span>
        <h3 class="mt-2">${p.question}</h3>
        <div class="poll-meta mt-4">
          <span>${p.options.length}개 항목</span>
          <span>투표 참여 가능</span>
        </div>
      `;
      card.onclick = () => openPollModal(p);
      pollGrid.appendChild(card);
    });
  }

  function openPollModal(poll) {
    activePollId = poll.id;
    selectedOptionIdx = null;
    showVoteView(poll);
    pollModal.style.display = 'block';
  }

  function showVoteView(poll) {
    voteBtnGroup.style.display = 'block';
    resultBtnGroup.style.display = 'none';
    modalBody.innerHTML = `<h2 class="mb-4">${poll.question}</h2>`;
    
    poll.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerText = opt;
      btn.onclick = () => {
        document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedOptionIdx = idx;
      };
      modalBody.appendChild(btn);
    });
  }

  // 투표 제출 (Bug 01: 중복 투표 허용)
  submitVoteBtn.onclick = () => {
    if (selectedOptionIdx === null) return showToast('항목을 선택해 주세요.');

    fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId: activePollId, optionIndex: selectedOptionIdx, userId: 'user_active' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('투표가 정상적으로 반영되었습니다.');
        showResultsView(activePollId);
      }
    });
  };

  // 결과 조회 (Bug 02: 특정 설문 지연 발생)
  function showResultsView(pollId) {
    voteBtnGroup.style.display = 'none';
    resultBtnGroup.style.display = 'block';
    modalBody.innerHTML = `<p class="text-center p-5">결과를 집계 중입니다...</p>`;

    fetch(`/api/results/${pollId}`)
      .then(res => res.json())
      .then(results => {
        const poll = polls.find(p => p.id === pollId);
        const total = results.reduce((acc, r) => acc + r.count, 0);
        
        modalBody.innerHTML = `<h2 class="mb-4">${poll.question}</h2>`;
        results.forEach(r => {
          const percent = total === 0 ? 0 : Math.round((r.count / total) * 100);
          const wrapper = document.createElement('div');
          wrapper.className = 'chart-bar-wrapper';
          wrapper.innerHTML = `
            <div class="chart-info">
              <span>${r.option}</span>
              <span>${percent}% (${r.count}표)</span>
            </div>
            <div class="chart-bar-bg">
              <div class="chart-bar-fill" style="width: ${percent}%"></div>
            </div>
          `;
          modalBody.appendChild(wrapper);
        });
      });
  }

  // 조작된 투표 제출 (Bug 03: 개발자 도구 등으로 voteCount를 수동 조작하는 상황 시뮬레이션)
  window.sendAdvancedVote = (pollId, optIdx, count) => {
    fetch('/api/votes/advanced', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pollId, optionIndex: optIdx, userId: 'hacker', voteCount: count })
    })
    .then(res => res.json())
    .then(data => {
      showToast(`${data.addedCount}표가 즉시 반영되었습니다.`);
      if (activePollId === pollId) showResultsView(pollId);
    });
  };

  function fetchMyVotes() {
    fetch('/api/my-votes/user_active')
      .then(res => res.json())
      .then(data => {
        myVoteListEl.innerHTML = '';
        if (data.length === 0) {
          myVoteListEl.innerHTML = '<p class="text-muted p-4">참여한 설문이 없습니다.</p>';
          return;
        }
        data.forEach(v => {
          const poll = polls.find(p => p.id === v.pollId);
          const div = document.createElement('div');
          div.className = 'list-item';
          div.innerHTML = `
            <div>
              <strong>${poll.question}</strong>
              <p class="text-sm text-muted">선택 항목: ${poll.options[v.optionIndex]}</p>
            </div>
            <button onclick="openPollModal(${JSON.stringify(poll).replace(/"/g, '&quot;')})" style="background:none; border:none; color:var(--indigo); font-weight:700; cursor:pointer;">결과 보기</button>
          `;
          myVoteListEl.appendChild(div);
        });
      });
  }

  pollSearch.oninput = () => renderPolls();
  catBtns.forEach(btn => {
    btn.onclick = () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      renderPolls();
    };
  });

  backToVoteBtn.onclick = () => {
    const poll = polls.find(p => p.id === activePollId);
    showVoteView(poll);
  };

  // 탭 전환
  function switchTab(btn, view) {
    [navHome, navMy].forEach(b => b.classList.remove('active'));
    [homeView, myView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
    if (view === myView) fetchMyVotes();
  }

  navHome.onclick = () => switchTab(navHome, homeView);
  navMy.onclick = () => switchTab(navMy, myView);

  closeBtn.onclick = () => pollModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == pollModal) pollModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
