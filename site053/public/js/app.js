document.addEventListener('DOMContentLoaded', () => {
  let crops = [];
  let currentView = 'crops';

  const cropGrid = document.getElementById('crop-grid');
  const cropSearch = document.getElementById('crop-search');
  const statCropSelect = document.getElementById('stat-crop-select');
  
  const navCrops = document.getElementById('nav-crops');
  const navStats = document.getElementById('nav-stats');
  
  const cropsView = document.getElementById('crops-view');
  const statsView = document.getElementById('stats-view');

  const statTotal = document.getElementById('stat-total');
  const statLoader = document.getElementById('stat-loader');
  
  const cropModal = document.getElementById('crop-modal');
  const modalBody = document.getElementById('modal-body');
  const closeBtn = document.querySelector('.close');
  const toast = document.getElementById('toast');

  function init() {
    fetchCrops();
  }

  // 작물 조회 (Bug 03: 멀티테넌시 분리 실패)
  function fetchCrops() {
    fetch('/api/crops?userId=farmer_A')
      .then(res => res.json())
      .then(data => {
        crops = data;
        renderCrops();
        updateStatSelect();
      });
  }

  function renderCrops() {
    cropGrid.innerHTML = '';
    const term = cropSearch.value.toLowerCase();
    const filtered = crops.filter(c => c.name.toLowerCase().includes(term));

    filtered.forEach(c => {
      const card = document.createElement('div');
      card.className = 'crop-card';
      card.innerHTML = `
        <span class="status-tag">${c.status}</span>
        <h3 class="mt-3">${c.name}</h3>
        <p class="text-sm text-muted">심은 날짜: ${c.plantedDate}</p>
        <p class="text-xs mt-2">농부 ID: ${c.userId}</p>
      `;
      card.onclick = () => openCropModal(c);
      cropGrid.appendChild(card);
    });
  }

  function openCropModal(crop) {
    modalBody.innerHTML = `
      <h2 style="color:var(--brown-dark); font-size:2rem;">${crop.name}</h2>
      <div class="mt-4 p-4" style="background:var(--green-light); border-radius:12px;">
        <p><strong>현재 상태:</strong> ${crop.status}</p>
        <p class="mt-1"><strong>재배 시작일:</strong> ${crop.plantedDate}</p>
        <p class="mt-1"><strong>관리 구역:</strong> 제 1 농장</p>
      </div>
      <p class="mt-4 text-sm text-muted">작물의 성장을 위해 매일 물주기와 잡초 제거가 필요합니다. 병충해 발생 여부를 꼼꼼히 확인해 주세요.</p>
    `;
    cropModal.style.display = 'block';
  }

  function updateStatSelect() {
    statCropSelect.innerHTML = '<option value="">작물 선택...</option>';
    crops.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.innerText = c.name;
      statCropSelect.appendChild(opt);
    });
  }

  // 수확 통계 조회 (Bug 01: 합계 오류, Bug 02: 인위적 지연)
  statCropSelect.onchange = (e) => {
    const cropId = e.target.value;
    if (!cropId) return;

    statTotal.innerText = '...';
    statLoader.style.display = 'block';

    fetch(`/api/stats/${cropId}`)
      .then(res => res.json())
      .then(data => {
        statLoader.style.display = 'none';
        statTotal.innerHTML = `${data.totalHarvest.toLocaleString()} <span class="unit">kg</span>`;
        showToast(`${data.cropName} 통계 데이터가 로드되었습니다.`);
      });
  };

  cropSearch.oninput = () => renderCrops();

  function switchTab(btn, view) {
    [navCrops, navStats].forEach(b => b.classList.remove('active'));
    [cropsView, statsView].forEach(v => v.style.display = 'none');
    btn.classList.add('active');
    view.style.display = 'block';
  }

  navCrops.onclick = () => switchTab(navCrops, cropsView);
  navStats.onclick = () => switchTab(navStats, statsView);

  closeBtn.onclick = () => cropModal.style.display = 'none';
  window.onclick = (e) => { if (e.target == cropModal) cropModal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
