const { createApp, ref, computed, onMounted, watch } = Vue;

createApp({
  setup() {
    const exhibitions = ref([]);
    const reservations = ref([]);
    const hourlyCongestion = ref({});
    const stats = ref({ totalReservations: 0, pendingCount: 0 });

    // Selections / Filters
    const activeAdmin = ref('A');
    const reservationSortOrder = ref('NONE');
    const exhibitionSearchQuery = ref('');
    const activeCategory = ref('ALL');

    const selectedReservation = ref(null);
    const mockFileNames = ref({});
    const toasts = ref([]);

    // Stale docent time cache for Error 1
    let previousDocentTimeCache = '';

    // Visitor details caches for Session switch leak (Error 6 Target)
    const selectedVisitorPhone = ref('');
    const selectedVisitorMemo = ref('');

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadExhibitions();
      await loadReservations();
      await loadStats();
      await loadCongestion();
    };

    const loadExhibitions = async () => {
      const res = await fetch('/api/exhibitions');
      const data = await res.json();
      exhibitions.value = data;

      // Populate file upload inputs
      data.forEach(ex => {
        if (!mockFileNames.value[ex.id]) {
          mockFileNames.value[ex.id] = '';
        }
      });
    };

    const loadReservations = async () => {
      const res = await fetch('/api/reservations');
      const data = await res.json();
      reservations.value = data;

      // Filtered initial preview
      const activeList = data.filter(r => r.adminId === activeAdmin.value);
      if (activeList.length > 0 && !selectedReservation.value) {
        selectedReservation.value = activeList[0];
        previousDocentTimeCache = activeList[0].docentTime;
        selectedVisitorPhone.value = activeList[0].phone;
        selectedVisitorMemo.value = activeList[0].memo;
      }
    };

    const loadStats = async () => {
      const dbStats = {
        totalReservations: 20,
        pendingCount: 16
      };
      stats.value = dbStats;
    };

    const loadCongestion = async () => {
      const res = await fetch('/api/reservations'); // Simple calculations
      hourlyCongestion.value = {
        "10:00": 3,
        "11:00": 5,
        "12:00": 2,
        "13:00": 4,
        "14:00": 7,
        "15:00": 8,
        "16:00": 6
      };
    };

    // Watch selected reservation to update details:
    watch(selectedReservation, (newVal) => {
      if (newVal) {
        selectedVisitorPhone.value = newVal.phone;
        selectedVisitorMemo.value = newVal.memo;
      }
    });

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

    // Admin KPIs summary calculators
    const formatStatCount = () => {
      return activeAdmin.value === 'A' ? 10 : 10;
    };

    const formatPendingCount = () => {
      return activeAdmin.value === 'A' ? 7 : 9;
    };

    // Session Switch (Error 6 Target)
    const handleAdminSwitch = (adminId) => {
      activeAdmin.value = adminId;
      showToast(`어드민 계정 권한을 [${adminId}] 사원으로 교환합니다.`, 'info');

      // INTENTIONAL_ERROR
      // CATEGORY: Session + Cache
      // DESCRIPTION: 관리자를 A에서 B로 교환하면 예약 명단은 B 기준으로 리로드되지만, 
      // 우측 관람객 정보 패널의 캐시(`selectedVisitorPhone`, `selectedVisitorMemo`)를 
      // 지우거나 갱신하지 않고 A가 보던 정보를 그대로 남겨두어 보안 누수를 유발하는 결함입니다.
      
      // We load reservations which updates list, but we do NOT reset visitor phone/memo cache
      loadReservations();
    };

    // Date & Docent Time adjustments (Error 1 Trigger)
    const triggerDateDocentRace = (resv) => {
      showToast(`전시 관람 예약 날짜와 도슨트 세션 조정을 기입 요청합니다.`, 'info');

      // 1. PATCH Docent (0.1s delay)
      fetch(`/api/reservations/${resv.id}/docent`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docentTime: resv.docentTime })
      });

      // 2. PATCH Date (3.0s delay) - sends old docentTime
      setTimeout(() => {
        fetch(`/api/reservations/${resv.id}/date`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date: resv.date,
            docentTime: previousDocentTimeCache // Sends stale docentTime cache!
          })
        });
      }, 100);

      // Optimistic cache update
      previousDocentTimeCache = resv.docentTime;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('관람 일정 조정 완료 (날짜는 변경되었으나 지연 완료로 도슨트 시간은 이전 값으로 원복됨)', 'warning');
        await loadReservations();
      }, 4500);
    };

    // Search query race (Error 2 Trigger)
    const triggerSearchRace = () => {
      const q = exhibitionSearchQuery.value;
      if (!q) return;

      showToast(`미술 전시 검색어를 조회를 시작합니다: [${q}]`, 'info');

      if (q === '한국') {
        // Fetch 한국 (3.0s delay)
        fetch('/api/exhibitions/search?q=한국')
          .then(res => res.json())
          .then(data => {
            exhibitions.value = data;
            showToast('한국화 특별전 결과 수신 완료 (3초 지연 완료)', 'warning');
          });
      } else if (q === '현대') {
        // Fetch 현대 (0.2s delay)
        fetch('/api/exhibitions/search?q=현대')
          .then(res => res.json())
          .then(data => {
            exhibitions.value = data;
            showToast('현대 추상 조각 결과 수신 완료 (0.2초 완료)', 'info');
          });
      } else {
        fetch(`/api/exhibitions/search?q=${q}`)
          .then(res => res.json())
          .then(data => {
            exhibitions.value = data;
          });
      }
    };

    // Cancel reservation statistics leak (Error 3 Target)
    const confirmReservationCancel = async (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 예약 대장을 시간순으로 정렬한 뒤 삭제/취소 단추를 누르면, 
      // 정렬된 리스트 인덱스(index)를 정렬 이전의 원본 예약 배열(`reservations`)에 그대로 대입해 
      // 엉뚱한 예약 건이 오등록 취소되게 만드는 결함입니다.
      const targetResv = reservations.value[index];
      if (!targetResv) {
        showToast('취소할 예약 바인딩 정보를 찾을 수 없습니다.', 'danger');
        return;
      }

      const res = await fetch(`/api/reservations/${targetResv.id}/cancel`, { method: 'POST' });
      if (res.ok) {
        showToast(`[${targetResv.visitorName}] 관람객 예약을 취소 승인했습니다. (인덱스 불일치 오취소 가능)`, 'warning');
        await loadReservations();
      }
    };

    // Checkin & Time update race (Error 5 Trigger)
    const triggerTimeCheckinConflict = (resv) => {
      showToast(`티켓 예약 관람시간 수정과 입장 승인을 순차 진행합니다.`, 'info');

      // 1. PATCH time (4.0s delay)
      fetch(`/api/reservations/${resv.id}/time`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time: resv.time })
      });

      // 2. POST checkin (0.5s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/reservations/${resv.id}/checkin`, { method: 'POST' });
        if (res.ok) {
          showToast('티켓 입장 확인 완료 (0.5초 완료)', 'success');
          await loadReservations();
        }
      }, 100);

      // Optimistic checkin
      resv.status = 'CHECKED_IN';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('예약 시간 저장 완료 (티켓 정보가 갱신되었으나 입장 상태가 PENDING으로 오버라이트 롤백됨)', 'danger');
        await loadReservations();
      }, 4500);
    };

    const checkinReservation = async (id) => {
      const res = await fetch(`/api/reservations/${id}/checkin`, { method: 'POST' });
      if (res.ok) {
        showToast('티켓 입장을 완료 처리하였습니다.', 'success');
        await loadReservations();
      }
    };

    // Exhibition Image Upload (Error 7 Trigger)
    const uploadMockPoster = async (exId) => {
      const filename = mockFileNames.value[exId];
      if (!filename) {
        showToast('등록할 포스터 파일명을 입력해주세요.', 'danger');
        return;
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: exId, filename })
      });

      if (res.ok) {
        showToast(`포스터 등록 접수 완료: [${filename}]`, 'success');
        mockFileNames.value[exId] = '';
        await loadExhibitions();
      }
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('미술관 어드민 예약 관제 테이블이 초기화되었습니다.', 'success');
      selectedReservation.value = null;
      await loadAll();
    };

    // Computed Sort Options
    const filteredExhibitions = computed(() => {
      let list = [...exhibitions.value];
      if (activeCategory.value !== 'ALL') {
        list = list.filter(e => e.type === activeCategory.value);
      }
      return list;
    });

    const sortedReservations = computed(() => {
      // Filter by active admin authority
      let list = reservations.value.filter(r => r.adminId === activeAdmin.value);

      if (reservationSortOrder.value === 'ASC') {
        list.sort((a, b) => a.time.localeCompare(b.time));
      } else if (reservationSortOrder.value === 'DESC') {
        list.sort((a, b) => b.time.localeCompare(a.time));
      }

      return list;
    });

    return {
      exhibitions,
      reservations,
      hourlyCongestion,
      stats,
      activeAdmin,
      reservationSortOrder,
      exhibitionSearchQuery,
      activeCategory,
      selectedReservation,
      mockFileNames,
      toasts,
      selectedVisitorPhone,
      selectedVisitorMemo,
      formatPrice,
      formatStatCount,
      formatPendingCount,
      handleAdminSwitch,
      triggerDateDocentRace,
      triggerSearchRace,
      confirmReservationCancel,
      triggerTimeCheckinConflict,
      checkinReservation,
      uploadMockPoster,
      resetSandbox,
      removeToast,
      filteredExhibitions,
      sortedReservations
    };
  }
}).mount('#app');
