const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const rooms = ref([]);
    const reservations = ref([]);
    const stats = ref({ occupiedCount: 0, cleaningQueueCount: 0 });

    // Selections / Filters
    const activeBranch = ref('서울 본점');
    const selectedRoomType = ref('ALL');
    const selectedRoomStatus = ref('ALL');
    const activeFloor = ref(0);
    const searchQuery = ref('');

    // Active Selection Details
    const selectedReservation = ref(null);

    // Session cache (Error 6 Target)
    const cachedDailyRevenue = ref(4850000);
    const cachedPendingRequests = ref(8);

    const toasts = ref([]);

    // Stale room cache for Error 1
    let previousRoomIdCache = '';
    let previousRoomNumberCache = 0;

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadRooms();
      await loadReservations();
      await loadStats();
    };

    const loadRooms = async () => {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      rooms.value = data;
    };

    const loadReservations = async () => {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      reservations.value = data;

      if (data.length > 0 && !selectedReservation.value) {
        selectedReservation.value = data[0];
        previousRoomIdCache = data[0].roomId;
        previousRoomNumberCache = data[0].roomNumber;
      }
    };

    const loadStats = async () => {
      const res = await fetch('/api/stats');
      const data = await res.json();
      stats.value = data;
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

    const formatPrice = (val) => {
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
    };

    // Branch Switcher (Error 6 Target)
    const handleBranchSwitch = (branchName) => {
      activeBranch.value = branchName;
      showToast(`[${branchName}] 객실 점유 현황판을 동기화합니다.`, 'info');
      
      // Update rooms view
      loadRooms();

      // INTENTIONAL_ERROR
      // CATEGORY: Session
      // DESCRIPTION: 지점을 A에서 B로 전환할 시 객실 그리드는 정상 갱신되나, 
      // 당일 누적 매출 및 미처리 요청 건수 캐시(`cachedDailyRevenue`, `cachedPendingRequests`)를 
      // 갱신하지 않고 이전 지점 A의 매출 정보를 노출하는 결함입니다.
      // Bypasses sync of stats!
    };

    const handleRoomSelectChange = (roomId) => {
      if (!selectedReservation.value) return;
      const targetRoom = rooms.value.find(r => r.id === roomId);
      if (targetRoom) {
        selectedReservation.value.roomId = roomId;
        selectedReservation.value.roomNumber = targetRoom.number;
      }
    };

    // Clean room completed (Error 2 Target)
    const confirmCleanRoom = async (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 필터링 및 층수 조작을 거친 화면상의 객실 인덱스(index)를 그대로 
      // 원본 객실 배열(rooms)에 직접 주입하여 엉뚱한 방의 청소 완료 처리가 실행되는 결함입니다.
      const targetRoom = rooms.value[index];
      if (!targetRoom) {
        showToast('객실 매핑 대입 인덱스를 찾을 수 없습니다.', 'danger');
        return;
      }

      const res = await fetch(`/api/rooms/${targetRoom.id}/cleaning`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cleaning: 'CLEAN' })
      });

      if (res.ok) {
        showToast(`[${targetRoom.number}호] 객실 청소 완료 처리가 등록되었습니다. (인덱스 불일치 오등록 가능)`, 'warning');
        await loadRooms();
      }
    };

    // Room Change & Check-in Race (Error 1 Trigger)
    const triggerRoomCheckinRace = (resv) => {
      showToast(`객실 변경 요청과 투숙 체크인 처리를 연속 기입 전송합니다.`, 'info');

      // 1. PATCH room change (0.1s delay)
      fetch(`/api/reservations/${resv.id}/room`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: resv.roomId, roomNumber: resv.roomNumber })
      });

      // 2. POST check-in (3.0s delay) - sends old roomId
      setTimeout(async () => {
        const res = await fetch(`/api/reservations/${resv.id}/checkin`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: previousRoomIdCache,
            roomNumber: previousRoomNumberCache
          })
        });
        if (res.ok) {
          showToast('체크인 승인 완료 (3초 지연 완료)', 'success');
          await loadAll();
        }
      }, 100);

      // Optimistic cache update
      previousRoomIdCache = resv.roomId;
      previousRoomNumberCache = resv.roomNumber;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('지연 처리 완료 (투숙 상태는 CHECKED_IN으로 갱신되었으나 배정 객실은 이전 방 번호로 롤백됨)', 'warning');
        await loadAll();
      }, 4500);
    };

    // Checkout & service charge conflict (Error 3 Trigger)
    const triggerCheckoutServiceConflict = (resv) => {
      showToast(`체크아웃 퇴실 등록과 추가 서비스 요금 [${resv.serviceCharge}원] 수정을 동시 요청합니다.`, 'info');

      // 1. PATCH service charge (4s delay)
      fetch(`/api/reservations/${resv.id}/service`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceCharge: resv.serviceCharge })
      });

      // 2. POST checkout (0.5s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/reservations/${resv.id}/checkout`, { method: 'POST' });
        if (res.ok) {
          showToast('체크아웃 정산 완료 (0.5초 완료)', 'success');
          await loadAll();
        }
      }, 100);

      // Optimistic update
      resv.status = 'CHECKED_OUT';
      resv.paymentStatus = 'PAID';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('서비스 요금 수정 완료 (퇴실 완료된 예약의 청구서가 UNPAID 결제 대기 상태로 다시 풀림)', 'danger');
        await loadAll();
      }, 4500);
    };

    const deleteReservation = async (id) => {
      const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('객실 예약 명단 소거 처리가 완료되었습니다.', 'success');
        selectedReservation.value = null;
        await loadAll();
      }
    };

    // Search query race (Error 4 Trigger)
    const triggerSearchRace = () => {
      showToast('투숙객 검색어 비동기 경합을 시작합니다. (김철수 ➔ 김영희)', 'info');

      // 1. Fetch 김철수 (3s delay)
      fetch('/api/reservations/search?q=김철수')
        .then(res => res.json())
        .then(data => {
          reservations.value = data;
          showToast('검색 결과 수신: 김철수 (3초 지연 오버라이트)', 'warning');
        });

      // 2. Fetch 김영희 (0.2s delay)
      setTimeout(() => {
        fetch('/api/reservations/search?q=김영희')
          .then(res => res.json())
          .then(data => {
            reservations.value = data;
            showToast('검색 결과 수신: 김영희 (0.2초)', 'info');
          });
      }, 150);
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('HotelDesk PMS 시스템 예약 데이터베이스가 리셋되었습니다.', 'success');
      selectedReservation.value = null;
      await loadAll();
    };

    // Computed filters
    const filteredRooms = computed(() => {
      let list = [...rooms.value];

      if (selectedRoomType.value !== 'ALL') {
        list = list.filter(r => r.type === selectedRoomType.value);
      }
      if (selectedRoomStatus.value !== 'ALL') {
        list = list.filter(r => r.status === selectedRoomStatus.value);
      }
      if (activeFloor.value !== 0) {
        list = list.filter(r => r.floor === activeFloor.value);
      }

      return list;
    });

    const sortedReservations = computed(() => {
      let list = [...reservations.value];
      if (searchQuery.value) {
        list = list.filter(r => r.guestName.includes(searchQuery.value) || r.id.includes(searchQuery.value));
      }
      return list;
    });

    const vacantRooms = computed(() => {
      return rooms.value.filter(r => r.status === 'VACANT');
    });

    return {
      rooms,
      reservations,
      stats,
      activeBranch,
      selectedRoomType,
      selectedRoomStatus,
      activeFloor,
      searchQuery,
      selectedReservation,
      cachedDailyRevenue,
      cachedPendingRequests,
      toasts,
      formatPrice,
      handleBranchSwitch,
      handleRoomSelectChange,
      confirmCleanRoom,
      triggerRoomCheckinRace,
      triggerCheckoutServiceConflict,
      deleteReservation,
      triggerSearchRace,
      resetSandbox,
      removeToast,
      filteredRooms,
      sortedReservations,
      vacantRooms
    };
  }
}).mount('#app');
