<script>
  import { onMount } from 'svelte';

  // DB States
  let parcels = [];
  let trackingResult = null;

  // Search
  let searchWaybill = '1002030999';

  // Booking Form States
  let sender = '';
  let senderAddr = '';
  let receiver = '';
  let receiverAddr = '';
  let itemName = '';
  
  let weight = 1;
  let shippingMethod = 'standard';
  let displayedFee = 2000;
  let submitFee = 2000;

  // Notifications
  let toasts = [];

  onMount(() => {
    loadParcels();
  });

  async function loadParcels() {
    try {
      const res = await fetch('/api/parcels');
      const data = await res.json();
      parcels = data;
    } catch (err) {
      showToast('접수 목록을 가져오지 못했습니다.', 'danger');
    }
  }

  function showToast(message, type = 'info') {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4500);
  }

  // Error 1: submitFee is not updated when changing shippingMethod
  function handleWeightInput(e) {
    weight = Number(e.target.value) || 1;
    const base = weight * 2000;
    const addition = shippingMethod === 'express' ? 3000 : 0;
    displayedFee = base + addition;
    submitFee = displayedFee; // Sync weight update
  }

  function handleMethodInput(e) {
    shippingMethod = e.target.value;
    const base = weight * 2000;
    const addition = shippingMethod === 'express' ? 3000 : 0;
    displayedFee = base + addition;

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 배송 방식(일반/급송) 라벨 단추를 바꿨을 때, 화면 상의 표시 요금(displayedFee)은 
    // 실시간 갱신하지만 백엔드 요청 시 전송할 내부 값(submitFee)의 갱신을 누락합니다.
    // 이로 인해 사용자는 변경된 요금(예: 10000원)을 보고 접수 버튼을 클릭하나, 실제 저장되는 값은 변경 전 이전 값(예: 7000원)이 됩니다.
    // 원래 들어가야 할 동기화 코드:
    // submitFee = displayedFee;
  }

  // Search Waybill
  async function searchTracking() {
    if (!searchWaybill.trim()) {
      showToast('조회할 운송장 번호를 입력해 주세요.', 'warning');
      return;
    }
    trackingResult = null;
    try {
      const res = await fetch(`/api/tracking/${searchWaybill}`);
      
      // JSON parser will fail if waybill ends with '999' because server returns invalid JSON
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || '조회 오류');
      trackingResult = data;
      showToast('운송장 정보가 정상 조회되었습니다.', 'success');
    } catch (err) {
      showToast(`운송장 조회 실패 (JSON 파싱 에러): ${err.message}`, 'danger');
    }
  }

  // Create Booking
  async function handleBookingSubmit(e) {
    e.preventDefault();

    if (!sender.trim() || !receiver.trim() || !itemName.trim()) {
      showToast('보내는 사람, 받는 사람 및 물품 명칭은 필수입니다.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/parcels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender,
          senderAddr,
          receiver,
          receiverAddr,
          itemName,
          weight,
          method: shippingMethod,
          fee: submitFee // sending the stale/stashed fee
        })
      });

      if (res.ok) {
        showToast('택배 접수 신청이 성공적으로 완료되었습니다.', 'success');
        sender = '';
        senderAddr = '';
        receiver = '';
        receiverAddr = '';
        itemName = '';
        weight = 1;
        shippingMethod = 'standard';
        displayedFee = 2000;
        submitFee = 2000;
        await loadParcels();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || '접수 에러');
      }
    } catch (err) {
      showToast(`접수 실패: ${err.message}`, 'danger');
    }
  }
</script>

<div class="parcelflow-app">
  <!-- Navbar Header -->
  <header class="app-navbar">
    <div class="navbar-logo">
      <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
      </svg>
      <span class="logo-title">ParcelFlow</span>
      <span class="logo-subtitle">스마트 택배 배송 분석 다이어리</span>
    </div>
    <div class="navbar-actions">
      <span class="status-badge">실시간 물류 모니터링 활성</span>
    </div>
  </header>

  <!-- Workspace Grid Layout -->
  <div class="workspace-grid">
    
    {/* Left column: Booking Form */}
    <aside class="panel-section left-booking-panel">
      <div class="panel-header">
        <h2>📦 택배 접수 등록</h2>
        <p class="subtitle">새 배송 화물 정보를 접수합니다.</p>
      </div>

      <form on:submit={handleBookingSubmit} class="booking-form-vertical">
        <div class="form-group">
          <label for="sender-in">보내는 분 성함</label>
          <input id="sender-in" type="text" bind:value={sender} placeholder="보내는 이 성명" class="form-in" />
        </div>
        <div class="form-group">
          <label for="sender-addr-in">보내는 주소</label>
          <input id="sender-addr-in" type="text" bind:value={senderAddr} placeholder="출발지 주소" class="form-in" />
        </div>
        <div class="form-group">
          <label for="receiver-in">받는 분 성함</label>
          <input id="receiver-in" type="text" bind:value={receiver} placeholder="받는 이 성명" class="form-in" />
        </div>
        <div class="form-group">
          <label for="receiver-addr-in">받는 주소</label>
          <input id="receiver-addr-in" type="text" bind:value={receiverAddr} placeholder="도착지 주소" class="form-in" />
        </div>
        <div class="form-group">
          <label for="item-name-in">물품 종류 / 품목</label>
          <input id="item-name-in" type="text" bind:value={itemName} placeholder="품명 (예: 도서 3권)" class="form-in" />
        </div>

        <div class="form-group">
          <label for="weight-in">물품 무게 (kg)</label>
          <input 
            id="weight-in" 
            type="number" 
            value={weight} 
            on:input={handleWeightInput} 
            min="0.1" 
            step="0.1" 
            class="form-in" 
          />
        </div>

        <div class="form-group">
          <span class="label-lbl">배송 방식</span>
          <div class="radio-group-mesh">
            <label class="radio-lbl">
              <input 
                type="radio" 
                name="method" 
                value="standard" 
                checked={shippingMethod === 'standard'} 
                on:change={handleMethodInput} 
              />
              <span>일반 택배</span>
            </label>
            <label class="radio-lbl">
              <input 
                type="radio" 
                name="method" 
                value="express" 
                checked={shippingMethod === 'express'} 
                on:change={handleMethodInput} 
              />
              <span>당일 급송 (+3,000원)</span>
            </label>
          </div>
        </div>

        <button type="submit" class="submit-booking-btn">📦 위탁 택배 예약 승인</button>
      </form>
    </aside>

    {/* Center column: Box Preview */}
    <main class="center-preview-panel">
      <section class="panel-section box-preview-box">
        <div class="panel-header">
          <h2>📦 택배 박스 볼륨 프리뷰</h2>
          <p class="subtitle">입력한 무게(kg)에 따라 박스 부피 스케일이 조정됩니다.</p>
        </div>

        <div class="box-preview-stage">
          <!-- Scaled 3D-like box preview based on weight -->
          <div class="box-3d-visual" style="transform: scale({Math.min(1.8, Math.max(0.6, 0.4 + weight * 0.3))});">
            <div class="box-face face-front">
              <span class="box-text">FRAGILE</span>
              <span class="box-logo">ParcelFlow</span>
            </div>
            <div class="box-face face-top">
              <div class="tape-strip"></div>
            </div>
            <div class="box-face face-side">
              <span class="bar-code">||||| | |||</span>
              <span class="weight-tag">{weight} kg</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom: Booking history list -->
      <section class="panel-section bookings-history-panel">
        <div class="panel-header">
          <h2>📑 최근 위탁 접수 내역 ({parcels.length})</h2>
        </div>

        <div class="bookings-grid-shelf">
          {#each parcels as p}
            <div class="parcel-history-card" on:click={() => { searchWaybill = p.waybill; searchTracking(); }}>
              <div class="card-head">
                <span class="waybill-lbl">No. {p.waybill}</span>
                <span class="badge {p.status}">{p.status === 'delivered' ? '배송완료' : p.status === 'transit' ? '배송중' : '접수완료'}</span>
              </div>
              <div class="card-contents">
                <p>📦 <strong>{p.itemName}</strong> ({p.weight}kg)</p>
                <p>👤 송하인: {p.sender} → 수하인: {p.receiver}</p>
                <p>💳 요금 결제액: <strong>{p.fee.toLocaleString()}원</strong></p>
              </div>
            </div>
          {/each}
          {#if parcels.length === 0}
            <div class="empty-placeholder">최근 접수된 택배 목록이 비어 있습니다.</div>
          {/if}
        </div>
      </section>
    </main>

    {/* Right column: Rate Calculator & Waybill Tracking check */}
    <aside class="right-tracking-panel">
      
      <!-- Estimated rate calculator card -->
      <section class="panel-section rate-calculator-card">
        <div class="panel-header">
          <h2>💳 예상 요금 실시간 청구</h2>
        </div>

        <div class="pricing-summary-box">
          <div class="pricing-row">
            <span>물품 기본 무게 요금:</span>
            <span>{(weight * 2000).toLocaleString()}원</span>
          </div>
          <div class="pricing-row">
            <span>배송 방식 추가요금:</span>
            <span>{(shippingMethod === 'express' ? 3000 : 0).toLocaleString()}원</span>
          </div>
          <div class="pricing-row total-charge">
            <span>최종 표시 결제 금액:</span>
            <span class="price-val">{displayedFee.toLocaleString()}원</span>
          </div>
          <div class="stale-charge-warning-badge">
            {#if submitFee !== displayedFee}
              <span class="warning-msg">⚠️ 요금 전송 동기화 오류 상태 (실제 청구액: {submitFee.toLocaleString()}원)</span>
            {/if}
          </div>
        </div>
      </section>

      <!-- Waybill Search Tracking -->
      <section class="panel-section waybill-search-card">
        <div class="panel-header">
          <h2>🔍 실시간 위치 운송장 조회</h2>
          <p class="subtitle">운송장 번호를 조회해 현 이동 경로를 추적합니다.</p>
        </div>

        <div class="search-form-mesh">
          <input 
            type="text" 
            bind:value={searchWaybill} 
            placeholder="운송장 번호 (예: 1002030999)" 
            class="search-in" 
          />
          <button on:click={searchTracking} class="search-btn">위치 추적</button>
        </div>

        {#if trackingResult}
          <div class="tracking-timeline-box">
            <div class="timeline-header">
              <h3>📦 운송장 {trackingResult.waybill} 이동 피드</h3>
              <p>송하인 {trackingResult.sender} → 수하인 {trackingResult.receiver}</p>
            </div>

            <!-- Horizontal timeline nodes path -->
            <div class="horizontal-steps-timeline">
              <div class="step-node active">
                <span class="circle">1</span>
                <span class="lbl">접수</span>
              </div>
              <div class="step-line active"></div>
              <div class="step-node {trackingResult.status !== 'ready' ? 'active' : ''}">
                <span class="circle">2</span>
                <span class="lbl">배송중</span>
              </div>
              <div class="step-line {trackingResult.status === 'delivered' ? 'active' : ''}"></div>
              <div class="step-node {trackingResult.status === 'delivered' ? 'active' : ''}">
                <span class="circle">3</span>
                <span class="lbl">완료</span>
              </div>
            </div>

            <!-- Vertical scan records -->
            <div class="vertical-scans-list">
              {#each trackingResult.steps as step}
                <div class="scan-node-item">
                  <div class="scan-icon-box">
                    <!-- Serves dynamic normal SVGs, or 404 broken image for delivery-complete -->
                    <img src={step.icon} alt="icon" class="status-img-icon" />
                  </div>
                  <div class="scan-info">
                    <h4>{step.node}</h4>
                    <p class="meta">{step.date} | {step.place}</p>
                  </div>
                </div>
              {/each}
            </div>

          </div>
        {/if}
      </section>

    </aside>

  </div>

  <!-- Toast warnings -->
  <div class="toast-container">
    {#each toasts as t}
      <div class="toast-card {t.type}">
        <span class="toast-icon">
          {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
        </span>
        <span class="toast-message">{t.message}</span>
        <button class="toast-close" on:click={() => toasts = toasts.filter(x => x.id !== t.id)}>&times;</button>
      </div>
    {/each}
  </div>
</div>
