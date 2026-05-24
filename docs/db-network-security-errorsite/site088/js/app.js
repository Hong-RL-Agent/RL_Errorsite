const state = {
  view: 'explore',
  items: [],
  offers: [],
  selectedCategory: 'All',
  searchQuery: '',
  activeOfferTab: 'pending'
};

const $ = id => document.getElementById(id);
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');

document.addEventListener('DOMContentLoaded', () => {
  loadItems();
  setupEventListeners();
});

function setupEventListeners() {
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });

  $('search-btn').addEventListener('click', () => {
    state.searchQuery = $('item-search').value;
    loadItems();
  });

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedCategory = btn.textContent;
      loadItems();
    });
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeOfferTab = btn.dataset.status;
      loadOffers();
    });
  });

  $('send-offer-btn').addEventListener('click', submitOffer);
  
  $('debug-offer-btn').addEventListener('click', () => {
    const id = $('debug-offer-id').value;
    if (id) viewOfferDetail(id);
  });

  document.querySelector('.close-modal').onclick = () => $('item-modal').classList.add('hidden');
  document.querySelector('.close-modal-detail').onclick = () => $('detail-modal').classList.add('hidden');
}

function switchView(viewId) {
  state.view = viewId;
  views.forEach(v => v.classList.add('hidden'));
  $(`${viewId}-view`).classList.remove('hidden');
  
  navBtns.forEach(b => b.classList.remove('active'));
  document.querySelector(`[data-view="${viewId}"]`).classList.add('active');

  if (viewId === 'my-offers') loadOffers();
  if (viewId === 'reviews') loadReviews();
}

async function loadItems() {
  const params = new URLSearchParams({
    category: state.selectedCategory,
    search: state.searchQuery
  });
  const res = await fetch(`/api/items?${params}`);
  const data = await res.json();
  state.items = data;
  renderItems();
}

function renderItems() {
  const grid = $('items-grid');
  grid.innerHTML = state.items.map(item => `
    <div class="item-card" onclick="openItemModal(${item.id})">
      <span class="category-tag">${item.category}</span>
      <h3>${item.title}</h3>
      <p style="color:var(--text-light); margin-bottom:1rem;">${item.description}</p>
      <div class="trade-intent">
        <p>Wants:</p>
        <span>${item.want}</span>
      </div>
      <div style="margin-top:1rem; font-size:0.8rem; font-weight:600;">By ${item.user}</div>
    </div>
  `).join('');
}

let currentItemId = null;
function openItemModal(id) {
  currentItemId = id;
  const item = state.items.find(i => i.id === id);
  $('modal-item-body').innerHTML = `
    <h2>${item.title}</h2>
    <p>${item.description}</p>
    <div style="margin:1.5rem 0; padding:1rem; background:#f0f7f4; border-radius:8px;">
      <strong>Owner's Wishlist:</strong> ${item.want}
    </div>
  `;
  $('item-modal').classList.remove('hidden');
}

async function submitOffer() {
  const offerItem = $('offer-item').value;
  const offerMessage = $('offer-message').value;

  if (!offerItem) {
    showToast('Please specify what you are offering.');
    return;
  }

  // site088-bug02 demonstration
  // We send the request even if offerMessage is empty
  const res = await fetch('/api/offers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId: currentItemId, offerItem, offerMessage })
  });

  if (res.ok) {
    if (!offerMessage) {
      showToast('⚠️ network-request-validation: Offer sent without message (Bug02)!');
    } else {
      showToast('Offer sent successfully!');
    }
    $('item-modal').classList.add('hidden');
    $('offer-item').value = '';
    $('offer-message').value = '';
  }
}

async function loadOffers() {
  const res = await fetch(`/api/my-offers?status=${state.activeOfferTab}`);
  const data = await res.json();
  state.offers = data;
  renderOffers();
}

function renderOffers() {
  const list = $('offers-list');
  
  // site088-bug01 demonstration
  // In 'pending' tab, if we see 'rejected' items, it's a bug
  list.innerHTML = state.offers.map(offer => {
    const isBug = state.activeOfferTab === 'pending' && offer.status === 'rejected';
    return `
      <div class="offer-card" style="${isBug ? 'border: 2px solid var(--danger)' : ''}">
        <div class="offer-info">
          <h4>${offer.offerItem}</h4>
          <p style="color:var(--text-light)">For item #${offer.itemId} | To: ${offer.toUser}</p>
          ${isBug ? '<span style="color:var(--danger); font-size:0.7rem; font-weight:800;">[bug01] REJECTED SHOWN AS PENDING</span>' : ''}
        </div>
        <div class="status-badge status-${offer.status}">${offer.status}</div>
      </div>
    `;
  }).join('');
}

async function viewOfferDetail(id) {
  try {
    const res = await fetch(`/api/offers/${id}`);
    const data = await res.json();
    
    if (res.status === 200) {
      // Check if it's someone else's offer
      const isOthers = data.fromUser !== 'me_user' && data.toUser !== 'me_user';
      
      let html = `
        <h3>Offer Details #${data.id}</h3>
        <p><strong>From:</strong> ${data.fromUser}</p>
        <p><strong>To:</strong> ${data.toUser}</p>
        <p><strong>Item Offered:</strong> ${data.offerItem}</p>
        <p><strong>Message:</strong> ${data.offerMessage || '(No message)'}</p>
        <p><strong>Status:</strong> ${data.status}</p>
      `;
      
      if (isOthers) {
        html = `<div style="color:var(--danger); font-weight:800; margin-bottom:1rem;">⚠️ [bug03] IDOR: ACCESS GRANTED TO OTHERS OFFER</div>` + html;
        showToast('⚠️ security-idor: Accessed unauthorized offer data!');
      }

      $('detail-modal-body').innerHTML = html;
      $('detail-modal').classList.remove('hidden');
    } else {
      showToast('Offer not found or error occurred.');
    }
  } catch (err) {
    showToast('Error fetching offer.');
  }
}

async function loadReviews() {
  const res = await fetch('/api/reviews');
  const data = await res.json();
  $('reviews-list').innerHTML = data.map(r => `
    <div class="item-card" style="cursor:default">
      <div style="font-weight:800; margin-bottom:0.5rem;">${r.user}</div>
      <div style="color:#f1c40f; margin-bottom:0.5rem;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      <p>"${r.content}"</p>
      <div style="font-size:0.8rem; color:var(--text-light); margin-top:1rem;">${r.date}</div>
    </div>
  `).join('');
}

function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 3000);
}
