<script>
  import { onMount } from 'svelte';

  // DB states
  let cars = [];
  let favorites = [];
  let bookings = [];

  // Filter signals
  let searchQuery = '';
  let selectedBrand = 'All';
  let selectedClass = 'All';
  let maxPrice = 5000; // max value

  // Interaction variables
  let activeCarId = null;
  let compareList = [];
  let cachedCompareScores = []; // Holds scores for Evaluation (Error 1 Target)

  // Booking forms
  let bookingDate = '2026-08-05';
  let bookingTime = '14:00';

  // Installment Calculator inputs
  let downPayment = 1000; // in 10k won
  let months = 36;
  let interestRate = 5.9;

  // Toast notifications
  let toasts = [];

  onMount(() => {
    loadCars();
    loadFavorites();
    loadBookings();
  });

  const loadCars = async () => {
    try {
      const res = await fetch('/api/cars');
      const data = await res.json();
      cars = data;
    } catch (err) {
      showToast('차량 카탈로그 정보 조회 실패', 'danger');
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await fetch('/api/favorites');
      const data = await res.json();
      favorites = data;
    } catch (err) {
      showToast('찜 목록 조회 실패', 'danger');
    }
  };

  const loadBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      bookings = data;
    } catch (err) {
      showToast('시승 예약 이력 조회 실패', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    toasts = [...toasts, { id, message, type }];
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id);
    }, 4500);
  };

  // Filtered cars list
  $: filteredCars = cars.filter(car => {
    const matchSearch = car.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchBrand = selectedBrand === 'All' || car.brand === selectedBrand;
    const matchClass = selectedClass === 'All' || car.class === selectedClass;
    const matchPrice = car.price <= maxPrice;
    return matchSearch && matchBrand && matchClass && matchPrice;
  });

  // active car selected object
  $: activeCar = cars.find(c => c.id === activeCarId);

  // Map favorites to car objects (Error 3 Handler)
  $: favoriteCars = favorites.map(fav => {
    const matchedCar = cars.find(c => c.id === fav.carId);
    return {
      favId: fav.id,
      car: matchedCar
    };
  });

  // Installment monthly payment calculator
  $: monthlyPayment = (() => {
    if (!activeCar) return 0;
    const principal = Math.max(0, activeCar.price - downPayment) * 10000; // in won
    if (principal <= 0) return 0;
    const monthlyRate = (interestRate / 12) / 100;
    if (monthlyRate === 0) return Math.round(principal / months);
    
    const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(payment);
  })();

  // Toggle favorite
  const toggleFavorite = async (carId) => {
    const isFav = favorites.some(f => f.carId === carId);

    if (isFav) {
      try {
        const res = await fetch(`/api/favorites/${carId}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('찜 해제 처리가 전달되었습니다.', 'success');
          await loadFavorites();
        }
      } catch (err) {
        showToast('찜 취소 요청 실패', 'danger');
      }
    } else {
      try {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ carId })
        });
        if (res.ok) {
          showToast('해당 차량을 찜 목록에 추가했습니다.', 'success');
          await loadFavorites();
        }
      } catch (err) {
        showToast('찜 저장 실패', 'danger');
      }
    }
  };

  // Compare functions
  const addToCompare = (car) => {
    if (compareList.length >= 2) {
      showToast('비교는 한 번에 최대 2대까지 가능합니다.', 'warning');
      return;
    }
    if (compareList.some(c => c.id === car.id)) return;
    compareList = [...compareList, car];
    cachedCompareScores = [...cachedCompareScores, car.score];
  };

  const removeFromCompare = (carId) => {
    compareList = compareList.filter(c => c.id !== carId);

    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 비교 슬롯 목록에서 차량을 삭제(filter)할 때, 
    // 총평 점수 합산에 엮여 있는 cachedCompareScores 배열에서 삭제 차량의 스코어를 
    // 함께 지우거나 map으로 동기화하지 않고 이전 캐시 점수를 잔류시킵니다.
    // 원래 들어가야 할 동기화 코드 제거:
    // cachedCompareScores = compareList.map(c => c.score);
  };

  // Evaluated overall score of compare cars (Error 1 Target)
  $: averageScore = cachedCompareScores.length > 0
    ? (cachedCompareScores.reduce((sum, val) => sum + val, 0) / cachedCompareScores.length).toFixed(1)
    : 0;

  // Submit test drive booking
  const submitBooking = async () => {
    if (!activeCar) return;

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carId: activeCar.id,
          date: bookingDate,
          time: bookingTime
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '시승 예약 실패');
      }

      showToast('시승 예약이 완료되었습니다.', 'success');
      await loadBookings();
    } catch (err) {
      showToast(`[예약 에러] ${err.message}`, 'danger');
    }
  };

  // Error 4: 사고 이력 다시 조회 calls undefined port 9597
  const recheckAccidents = async () => {
    if (!activeCar) return;

    // INTENTIONAL_ERROR
    // CATEGORY: Network
    // DESCRIPTION: 차량 상세 페이지의 '사고 이력 다시 조회' 클릭 시, 
    // 백엔드가 가동 중인 9522 포트 대신 다른 미가동 포트(http://localhost:9597)로 API 호출을 시도하여 
    // ERR_CONNECTION_REFUSED 네트워크 접속 거절 오류가 브라우저에 발생하게 합니다.
    try {
      const res = await fetch(`http://localhost:9597/api/cars/${activeCar.id}/accidents`);
      if (!res.ok) throw new Error('API 포트 연결 에러');
      const data = await res.json();
      showToast('사고 기록 갱신에 성공했습니다.', 'success');
    } catch (err) {
      showToast(`사고 이력 재갱신 연결 실패: ${err.message}`, 'danger');
    }
  };
</script>

<div class="carscope-app">
  <!-- Top bar navbar -->
  <header class="app-navbar">
    <div class="logo-group">
      <svg class="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="2" y="10" width="20" height="8" rx="2" />
        <path d="M6 10V6a3 3 0 016 0v4M18 10V6a3 3 0 00-6 0" />
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="18" r="2" />
      </svg>
      <span class="logo-title">CarScope</span>
      <span class="logo-subtitle">프리미엄 인증중고 비교센터</span>
    </div>

    <div class="search-box-wrapper">
      <input 
        type="text" 
        placeholder="모델명을 입력하여 빠른 검색... (예: 그랜저, 쏘렌토)" 
        bind:value={searchQuery}
        class="nav-search-bar"
      />
    </div>
  </header>

  <!-- Workspace Grid Layout -->
  <div class="workspace-grid">
    
    <!-- Left column: filters -->
    <aside class="panel-section left-filters-sidebar">
      <div class="panel-header">
        <h2>🔍 차량 상세 조건 필터</h2>
      </div>

      <div class="filters-vertical-box">
        <div class="filter-row">
          <label for="brand-select">제조사 브랜드</label>
          <select id="brand-select" bind:value={selectedBrand} class="filter-select">
            <option value="All">전체 브랜드</option>
            <option value="현대">현대 (Hyundai)</option>
            <option value="기아">기아 (Kia)</option>
            <option value="제네시스">제네시스 (Genesis)</option>
            <option value="BMW">BMW</option>
            <option value="벤츠">벤츠 (Mercedes)</option>
            <option value="아우디">아우디 (Audi)</option>
            <option value="쉐보레">쉐보레 (Chevrolet)</option>
            <option value="르노">르노 (Renault)</option>
            <option value="볼보">볼보 (Volvo)</option>
          </select>
        </div>

        <div class="filter-row">
          <label for="class-select">차급 분류</label>
          <select id="class-select" bind:value={selectedClass} class="filter-select">
            <option value="All">전체 차급</option>
            <option value="소형">소형</option>
            <option value="준중형">준중형</option>
            <option value="중형">중형</option>
            <option value="대형">대형</option>
            <option value="SUV">SUV</option>
          </select>
        </div>

        <div class="filter-row range-row">
          <label for="price-range">최대 가격선: {maxPrice === 5000 ? '제한없음' : maxPrice + '만원'}</label>
          <input 
            id="price-range"
            type="range" 
            min="1000" 
            max="5000" 
            step="100" 
            bind:value={maxPrice}
            class="filter-range" 
          />
        </div>
      </div>
    </aside>

    <!-- Center column: Car catalog list -->
    <main class="center-catalog-workspace">
      <section class="panel-section cars-list-panel">
        <div class="panel-header">
          <h2>🚘 입고 완료된 인증중고 차량 목록 ({filteredCars.length}개)</h2>
        </div>

        <div class="cars-grid">
          {#each filteredCars as car}
            <div class="car-card" class:selected={activeCarId === car.id} on:click={() => activeCarId = car.id}>
              <div class="car-card-header">
                <span class="class-tag">[{car.class}]</span>
                <button 
                  type="button" 
                  class="card-fav-btn" 
                  class:starred={favorites.some(f => f.carId === car.id)}
                  on:click|stopPropagation={() => toggleFavorite(car.id)}
                >
                  ★
                </button>
              </div>

              <div class="car-card-body">
                <h3>{car.brand} {car.name}</h3>
                <p class="meta">{car.year}년식 • {car.mileage.toLocaleString()}km • {car.fuel}</p>
                <div class="status-gauge-bar">
                  <span class="lbl">성능 진단 점수 ({car.score}점):</span>
                  <div class="gauge-track">
                    <div class="gauge-fill" style="width: {car.score}%"></div>
                  </div>
                </div>
              </div>

              <div class="car-card-footer">
                <strong class="price">{car.price.toLocaleString()}만원</strong>
                <button type="button" class="compare-add-btn" on:click|stopPropagation={() => addToCompare(car)}>
                  ⚔️ 비교 추가
                </button>
              </div>
            </div>
          {/each}
          {#if filteredCars.length === 0}
            <div class="empty-placeholder">필터에 매칭되는 인증 차량이 없습니다.</div>
          {/if}
        </div>
      </section>
    </main>

    <!-- Right column: Compare slots & Vehicle Details -->
    <aside class="right-compare-column">
      
      <!-- Compare slot panel -->
      <section class="panel-section compare-matrix-panel">
        <div class="panel-header">
          <h2>⚔️ 스마트 차량 대조 비교표</h2>
        </div>

        <div class="compare-slots-row">
          {#each compareList as car}
            <div class="compare-slot-card">
              <button class="remove-btn" on:click={() => removeFromCompare(car.id)}>&times;</button>
              <h4>{car.name}</h4>
              <p class="price">{car.price}만원</p>
              <div class="slot-details">
                <p>연식: {car.year}년</p>
                <p>주행: {car.mileage.toLocaleString()}km</p>
                <p>점수: ⭐️ {car.score}점</p>
              </div>
            </div>
          {/each}

          {#if compareList.length === 0}
            <div class="empty-placeholder compare">
              비교할 차량 카드의 [비교 추가] 버튼을 눌러주세요. (최대 2대)
            </div>
          {:else if compareList.length === 1}
            <div class="empty-placeholder compare">
              비교 대상 1대를 더 추가할 수 있습니다.
            </div>
          {/if}
        </div>

        <!-- Overall Score calculation with Error 1 -->
        {#if compareList.length > 0}
          <div class="overall-evaluation-score-box">
            <span class="label">🎯 비교군 평균 성능 점수:</span>
            <strong class="score-val">{averageScore}점</strong>
            <p class="warn-label">※ 차량 제거 시 총평 평균 계산 점수 갱신 상태를 점검하십시오.</p>
          </div>
        {/if}
      </section>

      <!-- Car Detail & Installment & Booking panel -->
      {#if activeCar}
        <section class="panel-section active-car-detail-panel">
          <div class="panel-header">
            <h2>🔎 차량 정밀 상태 보고서</h2>
          </div>

          <div class="detail-vehicle-summary">
            <h3>{activeCar.brand} {activeCar.name}</h3>
            <p class="price-val">판매 금액: <strong>{activeCar.price.toLocaleString()}만원</strong></p>

            <table class="specs-table">
              <tbody>
                <tr>
                  <td>연식 / 연료</td>
                  <td>{activeCar.year}년식 / {activeCar.fuel}</td>
                </tr>
                <tr>
                  <td>누적 주행거리</td>
                  <td>{activeCar.mileage.toLocaleString()} km</td>
                </tr>
                <tr>
                  <td>진단 등급</td>
                  <td>⭐️ {activeCar.score >= 88 ? 'S등급' : activeCar.score >= 80 ? 'A등급' : 'B등급'} ({activeCar.score}점)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Accident Timeline -->
          <div class="accident-history-timeline-box">
            <div class="box-header">
              <h4>🛡️ 보험개발원 사고/교체 이력 타임라인</h4>
              <button class="recheck-history-btn" on:click={recheckAccidents}>🔄 사고 이력 다시 조회</button>
            </div>
            
            <div class="timeline-trail">
              {#each activeCar.accidents as acc}
                <div class="timeline-node">
                  <span class="date">{acc.date}</span>
                  <span class="desc">{acc.desc}</span>
                </div>
              {/each}
              {#if activeCar.accidents.length === 0}
                <p class="clean-badge">✅ 용도이력 및 단순 사고도 존재하지 않는 완전무사고 차량입니다.</p>
              {/if}
            </div>
          </div>

          <!-- Installment loan calculator -->
          <div class="installment-loan-calculator">
            <h4>🧮 인증 차량 할부 금리 시뮬레이터</h4>
            <div class="calc-form">
              <div class="row">
                <label for="downpayment-input">초기 인도금 (만원):</label>
                <input id="downpayment-input" type="number" bind:value={downPayment} class="calc-input" />
              </div>
              <div class="row">
                <label for="months-select">할부 기간:</label>
                <select id="months-select" bind:value={months} class="calc-select">
                  <option value={12}>12개월</option>
                  <option value={24}>24개월</option>
                  <option value={36}>36개월</option>
                  <option value={48}>48개월</option>
                  <option value={60}>60개월</option>
                </select>
              </div>
              <div class="row">
                <label for="rate-input">적용 이율 (%):</label>
                <input id="rate-input" type="number" step="0.1" bind:value={interestRate} class="calc-input" />
              </div>

              <div class="calc-result">
                <span>월 예상 납입 원리금:</span>
                <strong>{monthlyPayment.toLocaleString()}원</strong>
              </div>
            </div>
          </div>

          <!-- Test Drive Booking form -->
          <div class="test-drive-booking-form">
            <h4>📅 1:1 안심 시승 예약 신청</h4>
            <div class="booking-inputs">
              <div class="row">
                <label for="booking-date">시승 희망일:</label>
                <input id="booking-date" type="date" bind:value={bookingDate} class="booking-input" />
              </div>
              <div class="row">
                <label for="booking-time">시승 희망 시간:</label>
                <select id="booking-time" bind:value={bookingTime} class="booking-select">
                  <option value="10:00">오전 10:00</option>
                  <option value="12:00">정오 12:00</option>
                  <option value="14:00">오후 14:00</option>
                  <option value="16:00">오후 16:00</option>
                </select>
              </div>
              <button class="submit-booking-btn" on:click={submitBooking}>안심 시승 시간대 확정</button>
            </div>
          </div>
        </section>
      {:else}
        <section class="panel-section active-car-detail-panel empty">
          <div class="empty-placeholder">
            차량 카드나 목록을 선택하면 상세 사고 이력 및 할부금 시뮬레이션, 시승 예약 창이 이곳에 로드됩니다.
          </div>
        </section>
      {/if}

      <!-- Wishlist Star Cabinet -->
      <section class="panel-section wishlist-panel">
        <div class="panel-header">
          <h2>⭐ 찜해놓은 관심 차량 ({favoriteCars.length})</h2>
        </div>

        <div class="wishlist-cards-column">
          {#each favoriteCars as fav}
            {#if fav.car}
              <div class="wishlist-car-card">
                <div class="info">
                  <h4>{fav.car.brand} {fav.car.name}</h4>
                  <p>{fav.car.year}년식 • {fav.car.price}만원</p>
                </div>
                <button class="remove-wish-btn" on:click={() => toggleFavorite(fav.car.id)}>해제</button>
              </div>
            {:else}
              <!-- INTENTIONAL_ERROR
                   CATEGORY: Database
                   DESCRIPTION: 찜 취소 시 Backend에서 carId만 빈 값으로 치환하여 남겨두었기 때문에, 
                   fav.car가 undefined가 되어 정보가 매핑되지 못한 공백 껍데기 카드를 노출시킵니다. -->
              <div class="empty-favorite-card-leak">
                <p class="warn-txt">⚠️ 정보 없음 (해제된 찜 기록)</p>
                <span class="sub">carId 매핑 실패</span>
              </div>
            {/if}
          {/each}
          {#if favoriteCars.length === 0}
            <div class="empty-placeholder">별표를 누른 관심 매물이 없습니다.</div>
          {/if}
        </div>
      </section>

    </aside>

  </div>

  <!-- Toast alerts -->
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
