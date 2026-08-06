const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const restaurants = ref([]);
    const reservations = ref([]);
    const stats = ref({ totalReservations: 10, activeWaitingCount: 4 });

    // Selections / Filters
    const activeUser = ref('USER_A');
    const filterRegion = ref('ALL');
    const filterCategory = ref('ALL');
    const ratingSortOrder = ref('NONE');

    const selectedRestaurant = ref(null);
    const selectedReservation = ref(null);
    const toasts = ref([]);

    // Stale time cache for Error 1
    let previousTimeCache = '18:00';

    // User session stats cache (Error 6 Target)
    const cachedTotalReservations = ref(10);
    const cachedActiveWaitingCount = ref(4);

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadRestaurants();
      await loadReservations();
    };

    const loadRestaurants = async () => {
      const res = await fetch('/api/restaurants');
      const data = await res.json();
      restaurants.value = data;

      if (data.length > 0 && !selectedRestaurant.value) {
        selectRestaurant(data[0]);
      }
    };

    const selectRestaurant = async (rst) => {
      // Fetch detail to trigger Error 7 Image Encoding 404 test if space exists
      const res = await fetch(`/api/restaurants/${rst.id}`);
      if (res.ok) {
        const detailData = await res.json();
        selectedRestaurant.value = detailData;
      } else {
        selectedRestaurant.value = rst;
      }
    };

    const loadReservations = async () => {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      reservations.value = data;

      const userList = data.filter(r => r.userId === activeUser.value);
      if (userList.length > 0 && !selectedReservation.value) {
        selectedReservation.value = userList[0];
        previousTimeCache = userList[0].time;
      }
    };

    const showToast = (message, type = 'info') => {
      const id = Date.now();
      toasts.value.push({ id, message, type });
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    };

    const removeToast = (id) => {
      toasts.value = toasts.value.filter(t => t.id !== id);
    };

    const isTableAssigned = (tNo) => {
      if (!selectedRestaurant.value) return false;
      const resv = reservations.value.find(r => r.rstId === selectedRestaurant.value.id && r.tableNo === tNo);
      return !!resv;
    };

    // Customer Session Switch (Error 6 Target)
    const handleUserSwitch = (userId) => {
      activeUser.value = userId;
      showToast(`고객 세션 계정을 [${userId}] 회원으로 변경합니다.`, 'info');

      // Reload reservations list
      loadReservations();

      // INTENTIONAL_ERROR
      // CATEGORY: Session + Cache
      // DESCRIPTION: 사용자 A의 내역을 본 뒤 사용자 B로 로그인하면 예약 목록은 B 기준으로 리로드되지만, 
      // 상단의 누적 예약수 및 활성 웨이팅 알림 캐시(`cachedTotalReservations`, `cachedActiveWaitingCount`)를 
      // 갱신하지 않고 사용자 A 데이터를 그대로 유지 노출하는 캐시 결함입니다.
      
      // Note: We intentionally do NOT update cachedTotalReservations or cachedActiveWaitingCount!
    };

    // Party Size & Time update race (Error 1 Trigger)
    const triggerPartySizeTimeRace = (resv) => {
      showToast('방문 예약 인원수 수정과 방문 시간 조정을 순차 요청합니다.', 'info');

      // 1. PATCH Time (0.1s delay)
      fetch(`/api/reservations/${resv.id}/time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: resv.time })
      });

      // 2. PATCH Party Size (3.0s delay) - sends old time
      setTimeout(() => {
        fetch(`/api/reservations/${resv.id}/party-size`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            partySize: resv.partySize,
            time: previousTimeCache // Sends stale time cache!
          })
        });
      }, 100);

      // Optimistic cache update
      previousTimeCache = resv.time;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('인원 수정 완료 (인원은 갱신되었으나 3초 지연 완료로 예약 시간이 이전 값으로 롤백됨)', 'warning');
        await loadReservations();
      }, 4500);
    };

    // Region & Category search race condition (Error 5 Trigger)
    const triggerSearchRace = () => {
      const cat = filterCategory.value;
      const reg = filterRegion.value;
      showToast(`음식점 탐색 필터를 조회합니다: [${cat} / ${reg}]`, 'info');

      if (cat === '한식') {
        // Fetch 한식 (3.0s delay)
        fetch(`/api/restaurants/search?category=한식&region=${reg}`)
          .then(res => res.json())
          .then(data => {
            restaurants.value = data;
            showToast('한식 매장 결과 수신 완료 (3초 지연 완료)', 'warning');
          });
      } else if (cat === '일식') {
        // Fetch 일식 (0.2s delay)
        fetch(`/api/restaurants/search?category=일식&region=${reg}`)
          .then(res => res.json())
          .then(data => {
            restaurants.value = data;
            showToast('일식 매장 결과 수신 완료 (0.2초 완료)', 'info');
          });
      } else {
        fetch(`/api/restaurants/search?category=${cat}&region=${reg}`)
          .then(res => res.json())
          .then(data => {
            restaurants.value = data;
          });
      }
    };

    // Rating Sort Booking Index Mismatch (Error 3 Target)
    const confirmBooking = (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 음식점 목록을 평점순으로 정렬한 뒤 예약 버튼을 누르면 
      // 화면의 정렬 인덱스(index)를 원본 음식점 배열(`restaurants`)에 그대로 대입해 
      // 선택한 매장이 아닌 엉뚱한 매장으로 즉시 예약 처리되는 결함입니다.
      const targetRst = restaurants.value[index];
      if (!targetRst) {
        showToast('예약할 매장 인덱스를 찾을 수 없습니다.', 'danger');
        return;
      }

      showToast(`[${targetRst.name}] 매장 즉시 예약이 완료되었습니다. (인덱스 불일치 오예약 가능)`, 'warning');
    };

    // Cancel & Waiting Conflict (Error 2 Trigger)
    const triggerCancelWaitingConflict = (resv) => {
      showToast(`예약 취소 처리와 해당 건의 웨이팅 대기 등록을 동시 전송합니다.`, 'info');

      // 1. POST Waiting (4.0s delay)
      fetch(`/api/reservations/${resv.id}/waiting`, { method: 'POST' });

      // 2. POST Cancel (0.5s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/reservations/${resv.id}/cancel`, { method: 'POST' });
        if (res.ok) {
          showToast('예약 취소 성공 (0.5초 완료)', 'success');
          await loadReservations();
        }
      }, 100);

      // Optimistic cancel
      resv.status = 'CANCELLED';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('웨이팅 응답 완료 (취소 완료 처리되었던 예약이 WAITING 대기 상태로 강제 부활 재생성됨)', 'danger');
        await loadReservations();
      }, 4500);
    };

    // Delete Table Assignment (Error 4 Target)
    const deleteTableAssignment = async (id) => {
      const res = await fetch(`/api/reservations/${id}/table`, { method: 'DELETE' });
      if (res.ok) {
        showToast('테이블 배정을 삭제 처리했습니다. (매장 배치도 및 혼잡도에는 점유 중으로 지속 남아있음)', 'warning');
        await loadReservations();
      }
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('TableNow 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
      selectedRestaurant.value = null;
      selectedReservation.value = null;
      await loadAll();
    };

    // Computed Sort properties
    const sortedRestaurants = computed(() => {
      let list = [...restaurants.value];

      if (filterRegion.value !== 'ALL') {
        list = list.filter(r => r.region === filterRegion.value);
      }
      if (filterCategory.value !== 'ALL') {
        list = list.filter(r => r.category === filterCategory.value);
      }

      if (ratingSortOrder.value === 'RATING_DESC') {
        list.sort((a, b) => b.rating - a.rating);
      }

      return list;
    });

    const userReservations = computed(() => {
      return reservations.value.filter(r => r.userId === activeUser.value);
    });

    return {
      restaurants,
      reservations,
      stats,
      activeUser,
      filterRegion,
      filterCategory,
      ratingSortOrder,
      selectedRestaurant,
      selectedReservation,
      cachedTotalReservations,
      cachedActiveWaitingCount,
      toasts,
      isTableAssigned,
      selectRestaurant,
      handleUserSwitch,
      triggerPartySizeTimeRace,
      triggerSearchRace,
      confirmBooking,
      triggerCancelWaitingConflict,
      deleteTableAssignment,
      resetSandbox,
      removeToast,
      sortedRestaurants,
      userReservations
    };
  }
}).mount('#app');
