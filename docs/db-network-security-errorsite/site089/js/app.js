const state = {
  view: 'dashboard',
  intakes: [],
  goal: 2000,
  stats: {}
};

const $ = id => document.getElementById(id);
const views = document.querySelectorAll('.view');
const navItems = document.querySelectorAll('.nav-item');

document.addEventListener('DOMContentLoaded', () => {
  init();
  setupEventListeners();
});

async function init() {
  await fetchGoal();
  await fetchIntakes();
  await fetchStats();
  await fetchBadges();
}

function setupEventListeners() {
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      switchView(item.dataset.view);
    });
  });

  $('refresh-btn').addEventListener('click', () => {
    showToast('Refreshing data...');
    init();
  });

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      addIntake(parseInt(btn.dataset.ml));
    });
  });

  $('add-btn').addEventListener('click', () => {
    const amount = parseInt($('custom-ml').value);
    if (amount) addIntake(amount);
  });

  $('goal-slider').addEventListener('input', e => {
    $('slider-val').textContent = `${e.target.value} ml`;
  });

  $('save-goal-btn').addEventListener('click', async () => {
    const newGoal = parseInt($('goal-slider').value);
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal: newGoal })
    });
    if (res.ok) {
      showToast('Daily goal updated!');
      init();
    }
  });

  document.querySelector('.close-modal').onclick = () => $('modal').classList.add('hidden');
}

function switchView(viewId) {
  state.view = viewId;
  views.forEach(v => v.classList.add('hidden'));
  $(`${viewId}-view`).classList.remove('hidden');
  
  navItems.forEach(item => item.classList.toggle('active', item.dataset.view === viewId));

  if (viewId === 'history') fetchIntakes();
  if (viewId === 'stats') fetchStats();
}

async function fetchGoal() {
  const res = await fetch('/api/goals');
  const data = await res.json();
  state.goal = data.goal;
  $('goal-display').textContent = state.goal;
  $('goal-slider').value = state.goal;
  $('slider-val').textContent = `${state.goal} ml`;
}

async function fetchIntakes() {
  const res = await fetch('/api/intakes');
  const data = await res.json();
  state.intakes = data;
  renderHistory();
}

async function fetchStats() {
  const res = await fetch('/api/stats');
  const data = await res.json();
  state.stats = data;
  updateDashboardUI();
  updateStatsUI();
}

function updateDashboardUI() {
  const { total, goal, progress } = state.stats;
  $('intake-total').textContent = total;
  $('percentage').textContent = `${Math.min(100, Math.round(progress))}%`;
  
  // Progress Ring Animation
  const ring = $('progress-ring');
  const offset = 283 - (Math.min(1, progress / 100) * 283);
  ring.style.strokeDashoffset = offset;
}

function updateStatsUI() {
  $('stat-calc-total').textContent = `${state.stats.total} ml`;
  $('stat-real-total').textContent = `${state.stats.realTotal} ml`;
}

async function addIntake(amount) {
  // site089-bug02 demonstration
  // We don't disable the button or show a loading state, allowing duplicates
  const res = await fetch('/api/intakes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  });

  if (res.ok) {
    showToast(`Added ${amount}ml`);
    init();
  }
}

async function deleteIntake(id) {
  const res = await fetch(`/api/intakes/${id}`, { method: 'DELETE' });
  if (res.ok) {
    showToast('Record deleted');
    // Note: Due to bug01, the total on dashboard won't decrease!
    init();
  }
}

function renderHistory() {
  const list = $('history-list');
  list.innerHTML = state.intakes.map(item => {
    const isOther = item.userId !== 'me_user';
    const isDeleted = item.deleted;
    
    return `
      <div class="intake-item ${isOther ? 'others' : ''} ${isDeleted ? 'deleted' : ''}">
        <div class="item-info">
          <span class="icon">${isOther ? '👤' : '💧'}</span>
          <div class="text">
            <div class="item-amount">${item.amount}ml</div>
            <div class="item-meta">${item.time} | User: ${item.userId}</div>
            ${isOther ? '<span style="color:var(--danger); font-size:0.7rem; font-weight:700;">[bug03] DATA LEAK</span>' : ''}
          </div>
        </div>
        ${!isOther && !isDeleted ? `<button class="delete-btn" onclick="deleteIntake(${item.id})">Delete</button>` : ''}
        ${isDeleted ? '<span class="status-badge" style="color:var(--danger); font-size:0.7rem;">DELETED (Bug01: Still in total)</span>' : ''}
      </div>
    `;
  }).join('');
}

async function fetchBadges() {
  const res = await fetch('/api/badges');
  const data = await res.json();
  $('badges-grid').innerHTML = data.map(b => `
    <div class="card glass badge-card">
      <div class="badge-icon">${b.icon}</div>
      <h4>${b.name}</h4>
      <p>${b.description}</p>
    </div>
  `).join('');
}

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}

window.deleteIntake = deleteIntake;
