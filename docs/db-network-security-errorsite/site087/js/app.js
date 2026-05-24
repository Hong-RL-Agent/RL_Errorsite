const state = {
  activeView: 'quiz',
  currentSubject: 'All',
  score: 0,
  solvedCount: 0,
  quizzes: []
};

// Elements
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');
const filterBtns = document.querySelectorAll('.filter-btn');
const quizContainer = document.getElementById('quiz-container');
const notesContainer = document.getElementById('notes-container');
const rankingList = document.getElementById('ranking-list');
const navScore = document.getElementById('nav-score');
const statTotalScore = document.getElementById('stat-total-score');
const statSolved = document.getElementById('stat-solved');
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modal-body');
const closeModal = document.querySelector('.close-modal');
const toast = document.getElementById('toast');
const tamperBtn = document.getElementById('tamper-btn');
const tamperInput = document.getElementById('tamper-input');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  fetchScore();
  loadQuizzes();
  setupEventListeners();
});

function setupEventListeners() {
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      switchView(view);
    });
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.currentSubject = btn.textContent;
      loadQuizzes();
    });
  });

  closeModal.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  tamperBtn.addEventListener('click', () => {
    const delta = parseInt(tamperInput.value);
    if (!isNaN(delta)) {
      tamperScore(delta);
    }
  });
}

function switchView(viewId) {
  state.activeView = viewId;
  views.forEach(view => {
    view.classList.add('hidden');
    if (view.id === `${viewId}-view`) {
      view.classList.remove('hidden');
    }
  });

  navBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewId) {
      btn.classList.add('active');
    }
  });

  if (viewId === 'ranking') loadRanking();
  if (viewId === 'notes') loadNotes();
  if (viewId === 'profile') fetchScore();
}

async function fetchScore() {
  try {
    const res = await fetch('/api/scores');
    const data = await res.json();
    state.score = data.score;
    state.solvedCount = data.solvedCount;
    updateScoreUI();
  } catch (err) {
    console.error('Error fetching score:', err);
  }
}

function updateScoreUI() {
  navScore.textContent = state.score.toLocaleString();
  statTotalScore.textContent = state.score.toLocaleString();
  statSolved.textContent = state.solvedCount;
}

async function loadQuizzes() {
  try {
    const res = await fetch(`/api/quizzes?subject=${state.currentSubject}`);
    const data = await res.json();
    state.quizzes = data;
    renderQuizzes();
  } catch (err) {
    console.error('Error loading quizzes:', err);
  }
}

function renderQuizzes() {
  quizContainer.innerHTML = '';
  state.quizzes.forEach(quiz => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <span class="card-subject">${quiz.subject}</span>
      <h3 class="card-question">${quiz.question}</h3>
      <div class="options-list">
        ${quiz.options.map((opt, i) => `
          <button class="option-btn" data-index="${i}">${opt}</button>
        `).join('')}
      </div>
      <button class="action-btn" data-id="${quiz.id}">Submit Answer</button>
    `;

    const optionBtns = card.querySelectorAll('.option-btn');
    let selectedIdx = -1;

    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        optionBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedIdx = parseInt(btn.dataset.index);
      });
    });

    const submitBtn = card.querySelector('.action-btn');
    submitBtn.addEventListener('click', () => {
      if (selectedIdx === -1) {
        showToast('Please select an option first!');
        return;
      }
      submitAnswer(quiz.id, selectedIdx);
    });

    quizContainer.appendChild(card);
  });
}

async function submitAnswer(quizId, selectedIdx) {
  try {
    const res = await fetch('/api/answers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizId, selectedOption: selectedIdx })
    });
    
    const data = await res.json();
    
    // Bug Demonstration Logic
    let message = '';
    let isActuallyCorrect = data.correct;
    
    if (res.status === 201) {
      // site087-bug02 triggered
      showToast('⚠️ network-http-status detected: Wrong answer returned as 201 Created!');
      message = `<h2 style="color:var(--danger)">Network Anomaly Detected</h2>
                 <p>The server returned a 201 Created status for this answer, even though it was incorrect. (site087-bug02)</p>
                 <p><b>Explanation:</b> ${data.explanation}</p>`;
    } else if (data.correct) {
      showToast('Correct! +100 pts');
      message = `<h2 style="color:var(--success)">Great Job!</h2>
                 <p>Your answer is correct. You earned 100 points.</p>
                 <p><b>Explanation:</b> ${data.explanation}</p>`;
    } else {
      showToast('Wrong answer. Try again!');
      message = `<h2 style="color:var(--danger)">Incorrect</h2>
                 <p>Sorry, that's not the right answer.</p>
                 <p><b>Explanation:</b> ${data.explanation}</p>`;
    }

    state.score = data.currentScore;
    updateScoreUI();
    showModal(message);
    
  } catch (err) {
    console.error('Error submitting answer:', err);
  }
}

async function tamperScore(delta) {
  try {
    const res = await fetch('/api/scores', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scoreDelta: delta })
    });
    
    const data = await res.json();
    if (data.success) {
      state.score = data.newScore;
      updateScoreUI();
      showToast(`⚠️ security-parameter-tampering: Points modified by ${delta}!`);
    }
  } catch (err) {
    console.error('Error tampering score:', err);
  }
}

async function loadRanking() {
  try {
    const res = await fetch('/api/ranking');
    const data = await res.json();
    rankingList.innerHTML = '';
    data.forEach((rank, i) => {
      const li = document.createElement('li');
      li.className = `ranking-item ${rank.name === 'You' ? 'me' : ''}`;
      li.innerHTML = `
        <div class="rank-info">
          <span class="rank-num">#${i + 1}</span>
          <span class="rank-name">${rank.name}</span>
        </div>
        <span class="rank-score">${rank.score.toLocaleString()}</span>
      `;
      rankingList.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading ranking:', err);
  }
}

async function loadNotes() {
  try {
    const res = await fetch('/api/wrong-notes');
    const data = await res.json();
    notesContainer.innerHTML = '';
    
    if (data.length === 0) {
      notesContainer.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding: 4rem; color: var(--text-dim);">No wrong notes yet. Solve some quizzes!</p>';
      return;
    }

    data.forEach(note => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <span class="card-subject">${note.subject}</span>
        <h3 class="card-question">${note.question}</h3>
        <p style="margin-bottom: 1rem; color: var(--danger);">Your Answer: ${note.options[note.selected]}</p>
        <p style="margin-bottom: 1rem; color: var(--success);">Correct Answer: ${note.options[note.answer]}</p>
        <p style="font-size: 0.9rem; color: var(--text-dim);">${note.explanation}</p>
      `;
      notesContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading notes:', err);
  }
}

function showModal(content) {
  modalBody.innerHTML = content;
  modal.classList.add('open');
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
