document.addEventListener('DOMContentLoaded', () => {
  let allPlants = [];
  let currentPlantId = null;

  const plantGrid = document.getElementById('plant-grid');
  const searchInput = document.getElementById('search-input');
  const typeFilter = document.getElementById('type-filter');
  const modal = document.getElementById('detail-modal');
  const closeBtn = document.querySelector('.close');
  const waterBtn = document.getElementById('water-btn');
  const growthForm = document.getElementById('growth-form');
  const growthList = document.getElementById('growth-list');
  const toast = document.getElementById('toast');

  const navPlants = document.getElementById('nav-plants');
  const navTips = document.getElementById('nav-tips');
  const plantsView = document.getElementById('plants-view');
  const tipsView = document.getElementById('tips-view');
  const tipList = document.getElementById('tip-list');

  // 데이터 가져오기
  function fetchPlants() {
    fetch('/api/plants')
      .then(res => res.json())
      .then(data => {
        allPlants = data;
        renderPlants(data);
      });
  }

  function fetchTips() {
    fetch('/api/tips')
      .then(res => res.json())
      .then(data => {
        tipList.innerHTML = '';
        data.forEach(tip => {
          const div = document.createElement('div');
          div.className = 'tip-card';
          div.innerHTML = `
            <h3>${tip.title}</h3>
            <p>${tip.content}</p>
          `;
          tipList.appendChild(div);
        });
      });
  }

  // 렌더링
  function renderPlants(data) {
    plantGrid.innerHTML = '';
    data.forEach(plant => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <img src="${plant.image}" alt="${plant.name}">
        <div class="card-content">
          <span class="badge">${plant.type}</span>
          <h3>${plant.name}</h3>
          <div class="card-footer">
            <span>마지막 물주기: ${plant.lastWatered}</span>
          </div>
        </div>
      `;
      card.addEventListener('click', () => openModal(plant.id));
      plantGrid.appendChild(card);
    });
  }

  // 검색 및 필터링
  function filterPlants() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;

    const filtered = allPlants.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm);
      const matchesType = selectedType === 'all' || p.type === selectedType;
      return matchesSearch && matchesType;
    });

    renderPlants(filtered);
  }

  searchInput.addEventListener('input', filterPlants);
  typeFilter.addEventListener('change', filterPlants);

  // 모달 열기
  function openModal(id) {
    const plant = allPlants.find(p => p.id === id);
    if (!plant) return;
    currentPlantId = id;

    document.getElementById('modal-img').src = plant.image;
    document.getElementById('modal-name').innerText = plant.name;
    document.getElementById('modal-type').innerText = plant.type;
    document.getElementById('modal-last-watered').innerText = plant.lastWatered;

    fetchGrowthRecords(id);
    modal.style.display = 'block';
  }

  // 상세 데이터 가져오기
  function fetchGrowthRecords(plantId) {
    fetch(`/api/growth/${plantId}`)
      .then(res => res.json())
      .then(response => {
        // INTENTIONAL BUG: site011-bug02 반영 (스키마 불일치)
        // 서버는 { data: [...] } 를 보내지만 프론트는 배열을 기대하는 상황
        // 하지만 여기서는 버그를 '보여주기' 위해 에러 핸들링 없이 시도함
        try {
          const records = response; // 원래는 response.data 여야 함
          growthList.innerHTML = '';
          
          if (!Array.isArray(records)) {
            // 버그가 발생했음을 알리기 위해 수동 체크
            throw new TypeError("records.map is not a function (Response was object, expected array)");
          }

          records.forEach(r => {
            const div = document.createElement('div');
            div.className = 'growth-item';
            div.innerHTML = `
              <div class="date">${r.date} | 키: ${r.height}</div>
              <p>${r.note}</p>
            `;
            growthList.appendChild(div);
          });
        } catch (e) {
          growthList.innerHTML = `<p class="text-danger">데이터를 불러올 수 없습니다. (${e.message})</p>`;
          console.error(e);
        }
      });
  }

  // 물주기 (Bug 01)
  waterBtn.addEventListener('click', () => {
    fetch(`/api/watering/${currentPlantId}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('성공적으로 물을 주었습니다!');
          // BUG01: 서버 DB에 저장이 안되므로 새로고침하면 다시 돌아옴을 확인시키기 위해 fetch 호출
          setTimeout(() => {
            fetchPlants(); // 상태 변화가 없는 것을 확인하기 위함
          }, 1000);
        }
      });
  });

  // 기록 추가 (Bug 03)
  growthForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const height = document.getElementById('growth-height').value;
    const note = document.getElementById('growth-note').value;

    fetch('/api/growth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plantId: currentPlantId,
        height,
        note,
        ownerId: 'user123' // 원래는 토큰에서 가져와야 하지만 body에 실어 보냄
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('성장 기록이 추가되었습니다.');
        growthForm.reset();
        fetchGrowthRecords(currentPlantId);
      }
    });
  });

  // 탭 전환
  navPlants.addEventListener('click', () => {
    navPlants.classList.add('active');
    navTips.classList.remove('active');
    plantsView.style.display = 'block';
    tipsView.style.display = 'none';
  });

  navTips.addEventListener('click', () => {
    navTips.classList.add('active');
    navPlants.classList.remove('active');
    plantsView.style.display = 'none';
    tipsView.style.display = 'block';
    fetchTips();
  });

  // 유틸
  closeBtn.onclick = () => modal.style.display = 'none';
  window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
  fetchPlants();
});
