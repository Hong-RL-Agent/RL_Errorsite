document.addEventListener('DOMContentLoaded', () => {
  let machines = [];
  let currentType = 'Washer';
  let selectedMachineId = null;

  const machineGrid = document.getElementById('machine-grid');
  const washerCountEl = document.getElementById('washer-count');
  const dryerCountEl = document.getElementById('dryer-count');
  const tabs = document.querySelectorAll('.tab');
  
  const navHistory = document.getElementById('nav-history');
  const historyOverlay = document.getElementById('history-overlay');
  const closeHistory = document.getElementById('close-history');
  const historyListEl = document.getElementById('history-list');
  const testIdorBtn = document.getElementById('test-idor-btn');

  const modal = document.getElementById('reserve-modal');
  const confirmReserveBtn = document.getElementById('confirm-reserve');
  const cancelReserveBtn = document.getElementById('cancel-reserve');
  const toast = document.getElementById('toast');

  function init() {
    fetchMachines();
  }

  function fetchMachines() {
    fetch('/api/machines')
      .then(res => res.json())
      .then(data => {
        machines = data;
        renderMachines();
        updateSummary();
      });
  }

  function renderMachines() {
    machineGrid.innerHTML = '';
    const filtered = machines.filter(m => m.type === currentType);

    filtered.forEach(m => {
      const card = document.createElement('div');
      card.className = 'machine-card';
      // Bug 02: status 필드가 없는 경우 체크
      const statusText = m.status ? m.status.toUpperCase() : 'UNKNOWN (Bug 02)';
      const statusClass = m.status ? `status-${m.status}` : '';

      card.innerHTML = `
        <span class="m-icon">${currentType === 'Washer' ? '🧺' : '💨'}</span>
        <p class="m-name">${m.name}</p>
        <span class="m-status ${statusClass}">${statusText}</span>
      `;
      card.onclick = () => openReserveModal(m);
      machineGrid.appendChild(card);
    });
  }

  function updateSummary() {
    const availableWashers = machines.filter(m => m.type === 'Washer' && m.status === 'available').length;
    const availableDryers = machines.filter(m => m.type === 'Dryer' && m.status === 'available').length;
    washerCountEl.innerText = `${availableWashers}/2 사용가능`;
    dryerCountEl.innerText = `${availableDryers}/2 사용가능`;
  }

  function openReserveModal(m) {
    if (m.status !== 'available' && m.status !== undefined) return showToast('이미 사용 중인 기기입니다.');
    selectedMachineId = m.id;
    document.getElementById('modal-machine-name').innerText = m.name;
    modal.style.display = 'flex';
  }

  confirmReserveBtn.onclick = () => {
    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ machineId: selectedMachineId, userId: 'user123' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        showToast('예약이 완료되었습니다! (Bug 01 확인 가능)');
        modal.style.display = 'none';
        // Bug 01: 서버에서 상태 변경을 하지 않아 fetch 후에도 available 로 보임
        fetchMachines();
      }
    });
  };

  function fetchHistory(userId = 'user123') {
    // Bug 03: IDOR 취약점 테스트 가능
    fetch(`/api/history?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        historyListEl.innerHTML = '';
        if (data.length === 0) {
          historyListEl.innerHTML = '<p class="text-center text-muted">기록이 없습니다.</p>';
          return;
        }
        data.forEach(h => {
          const m = machines.find(mac => mac.id === h.machineId) || { name: '기기' };
          const div = document.createElement('div');
          div.className = 'history-item';
          div.innerHTML = `
            <div>
              <strong>${m.name} 이용</strong>
              <p class="text-xs text-muted">${h.date}</p>
              ${h.note ? `<p class="text-xs" style="color:red;">⚠️ ${h.note}</p>` : ''}
            </div>
            <div class="font-bold">${h.cost.toLocaleString()}원</div>
          `;
          historyListEl.appendChild(div);
        });
      });
  }

  // 탭 전환
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentType = tab.dataset.type;
      renderMachines();
    };
  });

  navHistory.onclick = () => {
    historyOverlay.style.display = 'flex';
    fetchHistory();
  };

  closeHistory.onclick = () => historyOverlay.style.display = 'none';

  testIdorBtn.onclick = () => {
    const targetId = prompt('조회할 사용자 ID를 입력하세요 (Try: hacker99)', 'hacker99');
    if (targetId) {
      fetchHistory(targetId);
      showToast('비인가 이용 기록 조회 성공 (Bug 03)');
    }
  };

  cancelReserveBtn.onclick = () => modal.style.display = 'none';

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  init();
});
