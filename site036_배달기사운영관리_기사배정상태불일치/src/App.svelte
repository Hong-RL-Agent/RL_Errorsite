<script>
  import { onMount } from 'svelte';

  // DB States
  let orders = [];
  let riders = [];

  // Search & Filter
  let searchQuery = '';
  let riderFilter = 'All'; // 'All' | '대기중' | '배달중' | '휴식중'
  let mobileTab = 'orders'; // 'orders' | 'riders' for mobile responsive view

  // Detail panel states (Error 4 Target)
  let selectedOrder = null;
  let localStatus = '';

  // Allocation indices (Error 1 Target)
  let assignedIndices = [];

  // Refresh clicks tracker (Error 5 Target)
  let refreshClicks = 0;
  let isLoadingRiders = false;

  // Toasts
  let toasts = [];

  onMount(() => {
    loadOrders();
    loadRiders();
  });

  async function loadOrders() {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      orders = data;
    } catch (err) {
      showToast('주문 관제 내역 로드 실패', 'danger');
    }
  }

  async function loadRiders() {
    try {
      const res = await fetch('/api/riders');
      const data = await res.json();
      riders = data;
    } catch (err) {
      showToast('기사 운행 상태 로드 실패', 'danger');
    }
  }

  function showToast(message, type = 'info') {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4500);
  }

  // Refresh positions (Error 5 logic)
  async function handleRefreshPositions() {
    refreshClicks += 1;
    isLoadingRiders = true;

    if (refreshClicks === 3) {
      // INTENTIONAL_ERROR
      // CATEGORY: Network
      // DESCRIPTION: 새로고침 버튼을 누적 3번째 누르면, 백엔드 게이트웨이 정체를 모사해 
      // 9초 동안 로딩 서스펜스를 연출한 후 타임아웃 처리를 내되, 로딩 상태 값(isLoadingRiders)을 
      // 계속 true로 유지시켜 화면 기사 리스트 로더가 영구적으로 풀리지 않게 묶어둡니다.
      showToast('네트워크 응답 대기 지연 감지 (Rider Location Refresh Gateway Congestion)', 'warning');
      setTimeout(() => {
        // Stays true, loading spinner remains visible
        showToast('위치 조회 시간 초과: 게이트웨이 응답 수신 대기 실패 (Timeout)', 'danger');
      }, 9000);
      return;
    }

    setTimeout(async () => {
      await loadRiders();
      isLoadingRiders = false;
      showToast('실시간 기사 위치 및 실적이 새로고침되었습니다.', 'success');
    }, 800);
  }

  // Assign Order to Rider (Error 2 Trigger, Error 1 Setup)
  async function handleAssignRider(orderId, riderId) {
    try {
      const res = await fetch('/api/orders/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, riderId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '배정에 실패했습니다.');
      }

      showToast('주문 배정 처리가 완료되었습니다.', 'success');
      
      // Error 1: Find the index in currently filtered list and push index instead of rider ID!
      const idx = filteredRiders.findIndex(r => r.id === riderId);
      if (idx !== -1) {
        assignedIndices = [...assignedIndices, idx];
      }

      loadOrders();
      loadRiders();
    } catch (err) {
      showToast(`[배정 거절] ${err.message}`, 'danger');
    }
  }

  // Complete order delivery (Error 3 Trigger)
  async function handleCompleteOrder(orderId) {
    try {
      const res = await fetch(`/api/orders/${orderId}/complete`, {
        method: 'POST'
      });
      if (res.ok) {
        showToast('배달이 최종 완료 처리되었습니다.', 'success');
        if (selectedOrder && selectedOrder.id === orderId) {
          selectedOrder.status = '배달완료';
        }
        loadOrders();
        loadRiders();
      }
    } catch (err) {
      showToast('배달 완료 통신 오류', 'danger');
    }
  }

  // Open Sliding Details Panel (Error 4 Setup)
  function openOrderDetail(order) {
    selectedOrder = order;
    localStatus = order.status;
  }

  // Close sliding panel
  function closeOrderDetail() {
    selectedOrder = null;
  }

  // Update order status from details panel (Error 4 Trigger)
  async function handleUpdateStatus(newVal) {
    if (!selectedOrder) return;
    localStatus = newVal;

    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newVal })
      });

      if (res.ok) {
        showToast(`주문 배송 상태가 [${newVal}]로 변경 저장되었습니다.`, 'success');
        
        // INTENTIONAL_ERROR
        // CATEGORY: Frontend
        // DESCRIPTION: 상세 패널 내에서 상태를 변경하여 DB에 전송하더라도, Svelte 부모 컴포넌트의 
        // orders 배열 캐시나 selectedOrder.status 객체는 강제로 업데이트하지 않고 방치합니다. 
        // 이로 인해 패널을 닫았다 다시 열 때 캐시된 이전 상태로 롤백되어 표시되는 화면 불일치가 발생합니다.
        // 원래 수행해야 하는 로직 누락:
        // selectedOrder.status = newVal;
        // loadOrders();
      }
    } catch (err) {
      showToast('상태 변경 API 통신 장애', 'danger');
    }
  }

  async function handleResetSandbox() {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        showToast('배송 관제 데이터베이스 상태가 초기화되었습니다.', 'warning');
        assignedIndices = [];
        refreshClicks = 0;
        isLoadingRiders = false;
        loadOrders();
        loadRiders();
      }
    } catch (err) {
      showToast('초기화 API 에러', 'danger');
    }
  }

  // Computed / Filtered lists
  $: filteredOrders = orders.filter(o => 
    o.destination.includes(searchQuery) || 
    o.food.includes(searchQuery) ||
    o.id.includes(searchQuery)
  );

  $: pendingOrdersList = filteredOrders.filter(o => o.status === '대기중');
  $: dispatchingOrdersList = filteredOrders.filter(o => o.status === '배달중' || o.status === '픽업완료');
  $: completedOrdersList = filteredOrders.filter(o => o.status === '배달완료');

  $: filteredRiders = riders.filter(r => 
    riderFilter === 'All' || r.status === riderFilter
  );

  // Stats calculation
  $: totalCompleted = riders.reduce((sum, r) => sum + r.completedOrdersCount, 0);
  $: totalActive = riders.reduce((sum, r) => sum + r.activeOrdersCount, 0);
</script>

<div class="riderflow-app">
  
  {/* Header banner */}
  <header className="app-header-nav">
    <div className="logo-group">
      <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="1" y="3" width="15" height="13" rx="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
      <span className="logo-title">RiderFlow</span>
      <span className="logo-subtitle">실시간 스마트 배송관제 보드</span>
    </div>

    <div className="system-status-indicator">
      <span className="pill green">서버 정상 연결 중</span>
      <span className="pill orange">배송 중: {totalActive}건</span>
      <span className="pill blue">완료 누적: {totalCompleted}건</span>
    </div>

    <div className="header-actions">
      <button type="button" on:click={handleRefreshPositions} className="refresh-btn">
        🔄 기사 위치 새로고침
      </button>
      <button type="button" on:click={handleResetSandbox} className="reset-sandbox-btn">
        ⚠️ 관제 리셋
      </button>
    </div>
  </header>

  {/* Mobile views toggle */}
  <div class="mobile-tabs-bar">
    <button type="button" class="m-tab {mobileTab === 'orders' ? 'active' : ''}" on:click={() => mobileTab = 'orders'}>
      📦 대기 주문 ({pendingOrdersList.length})
    </button>
    <button type="button" class="m-tab {mobileTab === 'riders' ? 'active' : ''}" on:click={() => mobileTab = 'riders'}>
      🛵 기사 목록 ({filteredRiders.length})
    </button>
  </div>

  {/* Workspace Grid Layout */}
  <div class="workspace-grid">
    
    {/* Left Column: Pending orders list */}
    <aside class="panel-section pending-orders-column {mobileTab === 'orders' ? '' : 'mobile-hidden'}">
      <div class="panel-header">
        <h3>📦 주문 대기 배차 풀 ({pendingOrdersList.length}건)</h3>
      </div>

      <div class="search-box">
        <input 
          type="text" 
          placeholder="목적지, 음식 검색..." 
          bind:value={searchQuery}
          class="sidebar-search-input"
        />
      </div>

      <div class="orders-stack-list">
        {#each pendingOrdersList as order (order.id)}
          <div class="order-card-widget" on:click={() => openOrderDetail(order)}>
            <div class="header">
              <span class="ord-id">{order.id}</span>
              <span class="time">{order.time}</span>
            </div>
            <div class="body">
              <p class="food-name">{order.food}</p>
              <p class="dest">{order.destination}</p>
            </div>
            <div class="footer">
              <span class="price">{order.price.toLocaleString()}원</span>
              <span class="status-badge waiting">배차대기</span>
            </div>
          </div>
        {/each}

        {#if pendingOrdersList.length === 0}
          <div class="empty-placeholder">대기 중인 신규 배달 주문이 없습니다.</div>
        {/if}
      </div>
    </aside>

    {/* Center Column: SVG Map and route path */}
    <main class="center-stage-map-area">
      
      <div class="panel-section map-visualizer-panel">
        <div class="panel-header">
          <h3>🗺️ 관제 실시간 배달 구역 지도 (CSS/SVG)</h3>
        </div>

        <div class="svg-map-wrapper">
          <svg viewBox="0 0 500 300" class="delivery-svg-map">
            <!-- Background Grids roads -->
            <rect x="0" y="0" width="500" height="300" fill="#0f172a" />
            <line x1="50" y1="0" x2="50" y2="300" stroke="#334155" stroke-width="1.5" stroke-dasharray="4" />
            <line x1="150" y1="0" x2="150" y2="300" stroke="#334155" stroke-width="1.5" stroke-dasharray="4" />
            <line x1="250" y1="0" x2="250" y2="300" stroke="#334155" stroke-width="1.5" stroke-dasharray="4" />
            <line x1="350" y1="0" x2="350" y2="300" stroke="#334155" stroke-width="1.5" stroke-dasharray="4" />
            <line x1="450" y1="0" x2="450" y2="300" stroke="#334155" stroke-width="1.5" stroke-dasharray="4" />
            
            <line x1="0" y1="60" x2="500" y2="60" stroke="#334155" stroke-width="1.5" stroke-dasharray="4" />
            <line x1="0" y1="140" x2="500" y2="140" stroke="#334155" stroke-width="1.5" stroke-dasharray="4" />
            <line x1="0" y1="220" x2="500" y2="220" stroke="#334155" stroke-width="1.5" stroke-dasharray="4" />

            <!-- Core Hub Restaurant Center -->
            <circle cx="250" cy="140" r="16" fill="#f97316" opacity="0.2" />
            <circle cx="250" cy="140" r="8" fill="#f97316" />
            <text x="250" y="125" fill="#f97316" font-size="8" font-weight="bold" text-anchor="middle">음식 허브 센터</text>

            <!-- Draw Route Path if order is selected -->
            {#if selectedOrder}
              <line x1="250" y1="140" x2="120" y2="90" stroke="#f97316" stroke-width="3" stroke-dasharray="5" />
              <circle cx="120" cy="90" r="6" fill="#ef4444" />
              <text x="120" y="80" fill="#ef4444" font-size="8" font-weight="bold" text-anchor="middle">목적지 {selectedOrder.id}</text>
            {/if}

            <!-- Draw Rider GPS Nodes -->
            {#each riders as r, i}
              {@const cx = 50 + (i * 55) % 400}
              {@const cy = 40 + (i * 32) % 220}
              <circle cx={cx} cy={cy} r="6" fill={r.status === '배달중' ? '#ef4444' : r.status === '휴식중' ? '#64748b' : '#10b981'} />
              <text x={cx} y={cy - 8} fill="#94a3b8" font-size="6" text-anchor="middle">{r.name.substring(0, 3)}</text>
            {/each}
          </svg>
        </div>
      </div>

      {/* Rider Achievements/Performance table and charts */}
      <div class="panel-section rider-achievements-panel">
        <div class="panel-header">
          <h3>📊 기사별 일간 누적 실적 및 완료 그래프</h3>
        </div>

        <div class="achieve-grid-row">
          <div class="table-box">
            <table class="rider-stats-table">
              <thead>
                <tr>
                  <th>기사명</th>
                  <th>상태</th>
                  <th>진행중</th>
                  <th>완료건수</th>
                </tr>
              </thead>
              <tbody>
                {#each riders as r}
                  <tr>
                    <td><strong>{r.name}</strong></td>
                    <td>
                      <span class="status-dot {r.status === '배달중' ? 'red' : r.status === '휴식중' ? 'gray' : 'green'}">
                        {r.status}
                      </span>
                    </td>
                    <td>{r.activeOrdersCount}건</td>
                    <td>{r.completedOrdersCount}건</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>

          <div class="chart-box">
            <!-- SVG custom achievements chart -->
            <svg viewBox="0 0 160 120" class="achieve-mini-svg">
              {#each riders as r, i}
                {@const barH = r.completedOrdersCount * 5}
                {@const barX = 15 + i * 17}
                <rect x={barX} y={100 - barH} width="10" height={barH} fill="#f97316" rx="1" />
                <text x={barX + 5} y="112" fill="#64748b" font-size="5" text-anchor="middle">{r.name.substring(0, 3)}</text>
              {/each}
              <line x1="5" y1="100" x2="155" y2="100" stroke="#334155" stroke-width="1" />
            </svg>
          </div>
        </div>
      </div>

    </main>

    {/* Right Column: Rider status sidebar list */}
    <aside class="panel-section rider-status-sidebar {mobileTab === 'riders' ? '' : 'mobile-hidden'}">
      <div class="panel-header-row-vertical">
        <h3>🛵 기사 실시간 상태 ({filteredRiders.length}명)</h3>
        
        <div class="filter-controls">
          <select bind:value={riderFilter} class="mini-filter-select">
            <option value="All">전체</option>
            <option value="대기중">대기중</option>
            <option value="배달중">배달중</option>
            <option value="휴식중">휴식중</option>
          </select>
        </div>
      </div>

      <div class="riders-stack-list">
        {#if isLoadingRiders}
          <div class="location-loading-spin-box">
            <div class="spin-ic">🌀</div>
            <p>기사 실시간 GPS 위치 동기화 중...</p>
          </div>
        {/if}

        {#each filteredRiders as rider, idx (rider.id)}
          <div class="rider-card-item">
            <div class="header">
              <span class="name">{rider.name}</span>
              <span class="status-pill {rider.status === '배달중' ? 'red' : rider.status === '휴식중' ? 'gray' : 'green'}">
                {rider.status}
              </span>
            </div>
            
            <div class="meta">
              <span>연락처: {rider.phone}</span>
              <span>배송량: {rider.completedOrdersCount}건</span>
            </div>

            <!-- INTENTIONAL_ERROR -->
            <!-- CATEGORY: Frontend -->
            <!-- DESCRIPTION: 배정 마크의 바인딩을 기사의 고유 ID가 아닌 필터링된 배열의 인덱스(idx)에 
            매칭함으로써, 기사 목록 필터를 교체하면 엉뚱한 대기/휴식 중인 기사 카드로 배정 배지가 밀려납니다. -->
            {#if assignedIndices.includes(idx)}
              <span class="badge-assigned">배정 완료</span>
            {/if}

            {#if selectedOrder && selectedOrder.status === '대기중'}
              <button 
                type="button" 
                class="assign-submit-btn"
                on:click={() => handleAssignRider(selectedOrder.id, rider.id)}
              >
                🎯 이 기사에게 배정
              </button>
            {/if}
          </div>
        {/each}
      </div>
    </aside>

  </div>

  {/* Active Order Details Sliding side panel */}
  {#if selectedOrder}
    <div class="order-detail-slide-panel-backdrop" on:click={closeOrderDetail}></div>
    
    <aside class="order-detail-slide-panel">
      <div class="panel-header-row">
        <h3>📦 주문 정보 상세관제</h3>
        <button type="button" class="close-btn" on:click={closeOrderDetail}>&times;</button>
      </div>

      <div class="panel-body-content">
        <div class="meta-section">
          <span class="ord-id">주문 ID: {selectedOrder.id}</span>
          <span class="dt">{selectedOrder.time}</span>
        </div>

        <div class="detail-group">
          <label>요청 음식</label>
          <p class="val">{selectedOrder.food}</p>
        </div>

        <div class="detail-group">
          <label>배달 목적지 주소</label>
          <p class="val">{selectedOrder.destination}</p>
        </div>

        <div class="detail-group">
          <label>주문 금액</label>
          <p class="val">{selectedOrder.price.toLocaleString()}원</p>
        </div>

        <div class="detail-group">
          <label>현재 배달원</label>
          <p class="val">{selectedOrder.riderId || '배정된 기사 없음'}</p>
        </div>

        <div class="detail-group">
          <label>배송 단계 상태 (Error 4 Target)</label>
          <select value={localStatus} on:change={(e) => handleUpdateStatus(e.target.value)} class="form-select">
            <option value="대기중">대기중 (배차 대기)</option>
            <option value="배달중">배달중 (픽업 전)</option>
            <option value="픽업완료">픽업완료 (운행 중)</option>
            <option value="배달완료">배달완료 (인계 완료)</option>
          </select>
          <p class="helper-txt">* 상태 변경 후 본 패널을 닫았다 재오픈하면 캐시 미반영 버그(Error 4)가 유발됩니다.</p>
        </div>

        {#if selectedOrder.status !== '배달완료'}
          <button 
            type="button" 
            class="delivery-complete-direct-btn"
            on:click={() => handleCompleteOrder(selectedOrder.id)}
          >
            🏁 즉시 배달 완료 처리 (Error 3)
          </button>
        {/if}
      </div>
    </aside>
  {/if}

  {/* Toast Alerts logs */}
  <div class="toast-container">
    {#each toasts as t (t.id)}
      <div class="toast-card {t.type}">
        <span class="toast-icon">
          {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
        </span>
        <span class="toast-message">{t.message}</span>
        <button class="toast-close" on:click={() => toasts = toasts.filter(x => x.id !== t.id)}>
          &times;
        </button>
      </div>
    {/each}
  </div>

</div>
