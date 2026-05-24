const state = {
  view: 'memories',
  memories: [],
  tags: [],
  selectedTag: '',
  searchQuery: '',
  sortOrder: 'desc'
};

const $ = id => document.getElementById(id);
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');

document.addEventListener('DOMContentLoaded', () => {
  init();
  setupEventListeners();
});

async function init() {
  await fetchTags();
  await loadMemories();
}

function setupEventListeners() {
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  $('write-btn').addEventListener('click', () => $('write-modal').classList.remove('hidden'));
  document.querySelector('.close-modal').onclick = () => $('write-modal').classList.add('hidden');
  document.querySelector('.close-detail').onclick = () => $('detail-modal').classList.add('hidden');

  $('search-btn').addEventListener('click', () => {
    state.searchQuery = $('memory-search').value;
    loadMemories();
  });

  $('sort-select').addEventListener('change', e => {
    state.sortOrder = e.target.value;
    loadMemories();
  });

  $('write-form').addEventListener('submit', handleWrite);

  $('debug-access-btn').addEventListener('click', async () => {
    const id = $('debug-id').value;
    if (id) viewDetail(id);
  });
}

function switchView(viewId) {
  state.view = viewId;
  views.forEach(v => v.classList.add('hidden'));
  $(`${viewId}-view`).classList.remove('hidden');
  navBtns.forEach(b => b.classList.toggle('active', b.dataset.view === viewId));

  if (viewId === 'favorites') loadMemories(true);
  if (viewId === 'stats') loadStats();
}

async function fetchTags() {
  const res = await fetch('/api/tags');
  const tags = await res.json();
  state.tags = tags;
  renderTagFilters();
}

function renderTagFilters() {
  const container = $('tags-list');
  container.innerHTML = `<button class="tag-btn ${state.selectedTag === '' ? 'active' : ''}" onclick="selectTag('')">All</button>`;
  state.tags.forEach(t => {
    container.innerHTML += `<button class="tag-btn ${state.selectedTag === t ? 'active' : ''}" onclick="selectTag('${t}')">${t}</button>`;
  });
}

window.selectTag = (t) => {
  state.selectedTag = t;
  renderTagFilters();
  loadMemories();
};

async function loadMemories(onlyFavorites = false) {
  const params = new URLSearchParams();
  if (state.selectedTag) params.append('tag', state.selectedTag);
  if (state.searchQuery) params.append('search', state.searchQuery);
  if (onlyFavorites) params.append('favorite', 'true');

  const res = await fetch(`/api/memories?${params}`);
  let data = await res.json();

  if (state.sortOrder === 'asc') data.sort((a, b) => new Date(a.date) - new Date(b.date));
  else data.sort((a, b) => new Date(b.date) - new Date(a.date));

  state.memories = data;
  renderGrid(onlyFavorites ? 'favorites-grid' : 'memories-grid');
}

function renderGrid(targetId) {
  const grid = $(targetId);
  if (!state.memories.length) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:5rem; font-style:italic;">No memories found in this corner of the box...</p>';
    return;
  }

  grid.innerHTML = state.memories.map(m => `
    <div class="card" onclick="viewDetail(${m.id})">
      <div class="fav-icon">${m.favorite ? '⭐' : ''}</div>
      <div class="card-date">${m.date}</div>
      <h3 class="card-title">${m.title}</h3>
      <p class="card-content">${m.content}</p>
      <div class="card-tags">
        ${m.tags.map(t => `<span class="small-tag">#${t}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

async function viewDetail(id) {
  try {
    const res = await fetch(`/api/memories/${id}`);
    const data = await res.json();
    
    if (res.status === 200) {
      const isPrivate = data.private;
      let html = `
        <div class="card-date">${data.date} ${isPrivate ? '🔒 (Private)' : ''}</div>
        <h2 class="detail-title">${data.title}</h2>
        <div class="detail-content">${data.content}</div>
        <div class="card-tags" style="margin-top:2rem">
          ${data.tags.map(t => `<span class="tag-btn active">#${t}</span>`).join('')}
        </div>
        <div style="margin-top:2rem">
          <button class="primary-btn" onclick="toggleFavorite(${data.id})">
            ${data.favorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
        </div>
      `;
      
      if (isPrivate) {
        showToast('🔒 [bug03] Accessed private memory via IDOR!');
      }

      $('detail-body').innerHTML = html;
      $('detail-modal').classList.remove('hidden');
    } else {
      showToast('Error finding memory.');
    }
  } catch (err) {
    showToast('Failed to fetch memory detail.');
  }
}

async function toggleFavorite(id) {
  const res = await fetch('/api/favorites/toggle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  if (res.ok) {
    showToast('Box updated.');
    $('detail-modal').classList.add('hidden');
    loadMemories(state.view === 'favorites');
  }
}

async function handleWrite(e) {
  e.preventDefault();
  const body = {
    title: $('m-title').value,
    content: $('m-content').value,
    tags: $('m-tags').value.split(',').map(t => t.trim()).filter(t => t),
    private: $('m-private').checked
  };

  const res = await fetch('/api/memories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (res.ok) {
    showToast('Memory stored safely.');
    $('write-modal').classList.add('hidden');
    $('write-form').reset();
    init();
  }
}

async function loadStats() {
  const res = await fetch('/api/stats');
  // site090-bug02 demonstration
  // Res.json() will fail because the server returns a stringified object instead of raw JSON content-type handled correctly or whatever
  // Actually res.json() might still work if Content-Type is application/json but the body is double stringified?
  // Let's see how res.text() looks
  const rawText = await res.text();
  let data;
  try {
    // If it's a stringified JSON string, we need to parse it
    data = JSON.parse(rawText);
    if (typeof data === 'string') {
      data = JSON.parse(data); // Double parse for the bug
      showToast('📦 [bug02] Network response was stringified!');
    }
  } catch (err) {
    $('stats-content').innerHTML = '<p style="color:var(--danger)">Error parsing stats: Format mismatch.</p>';
    return;
  }

  $('stats-content').innerHTML = `
    <div class="stat-card">
      <div class="stat-val">${data.totalCount}</div>
      <div class="stat-label">Total Memories</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${data.favoriteCount}</div>
      <div class="stat-label">Treasured Moments</div>
    </div>
    <div class="stat-card">
      <div class="stat-val">${data.privateCount}</div>
      <div class="stat-label">Private Thoughts</div>
    </div>
  `;
}

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}
