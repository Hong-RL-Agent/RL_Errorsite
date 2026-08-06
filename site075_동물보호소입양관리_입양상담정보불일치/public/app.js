const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const animals = ref([]);
    const applications = ref([]);
    const shelterStats = ref({ totalApplicationsCount: 68, completedAdoptions: 24 });

    // Selections / Filters
    const activeUser = ref('USER_A');
    const filterSpecies = ref('ALL');
    const filterRegion = ref('ALL');
    const ageSortOrder = ref('NONE');

    const selectedAnimal = ref(null);
    const selectedApplication = ref(null);
    const toasts = ref([]);

    // Stale counselDate cache for Error 1
    let previousCounselDateCache = '2026-08-10';

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadAnimals();
      await loadApplications();
    };

    const loadAnimals = async () => {
      const res = await fetch('/api/animals');
      const data = await res.json();
      animals.value = data;

      if (data.length > 0 && !selectedAnimal.value) {
        selectAnimal(data[0]);
      }
    };

    const selectAnimal = async (animal) => {
      // Fetch detail to trigger Error 7 Image Encoding 404 test if space/Korean exists
      const res = await fetch(`/api/animals/${animal.id}`);
      if (res.ok) {
        const detailData = await res.json();
        selectedAnimal.value = detailData;
      } else {
        selectedAnimal.value = animal;
      }
    };

    const loadApplications = async () => {
      const res = await fetch('/api/applications');
      const data = await res.json();
      applications.value = data;

      const userList = data.filter(a => a.userId === activeUser.value);
      if (userList.length > 0 && !selectedApplication.value) {
        selectedApplication.value = userList[0];
        previousCounselDateCache = userList[0].counselDate;
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

    const getStatusLabel = (status) => {
      const map = {
        AVAILABLE: "입양 가능",
        ADOPTING: "입양 심사중",
        FOSTERING: "임시보호 중",
        FOSTERING_AND_REVIEWING: "임시보호 & 입양심사중",
        REVIEWING: "심사 대기",
        APPROVED: "승인 완료",
        CANCELLED: "신청 취소"
      };
      return map[status] || status;
    };

    // User Session Switch (Error 6 Target)
    const handleUserSwitch = (userId) => {
      activeUser.value = userId;
      showToast(`로그인 신청자 계정을 [${userId}] 회원으로 변경합니다.`, 'info');

      // Reload applications list
      loadApplications();

      // INTENTIONAL_ERROR
      // CATEGORY: Session + Cache
      // DESCRIPTION: 사용자 A가 본 입양 신청 내역을 열어둔 상태에서 사용자 B로 로그인하면 
      // 신청 목록은 B 기준으로 리로드되지만, 오른쪽 신청 상세 패널(`selectedApplication`)의 
      // 이전 사용자 A의 데이터가 그대로 노출 노수되어 남는 캐시 결함입니다.
      
      // Note: We intentionally do NOT reset selectedApplication here!
    };

    // Environment & Counsel Date update race (Error 1 Trigger)
    const triggerEnvCounselDateRace = (appItem) => {
      showToast('입양 거주 환경 수정과 상담 방문 날짜 조정을 순차 요청합니다.', 'info');

      // 1. PATCH Counsel Date (0.1s delay)
      fetch(`/api/applications/${appItem.id}/counsel-date`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ counselDate: appItem.counselDate })
      });

      // 2. PATCH Environment (3.0s delay) - sends old counselDate
      setTimeout(() => {
        fetch(`/api/applications/${appItem.id}/environment`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            homeEnvironment: appItem.homeEnvironment,
            counselDate: previousCounselDateCache // Sends stale counselDate cache!
          })
        });
      }, 100);

      // Optimistic cache update
      previousCounselDateCache = appItem.counselDate;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('신청서 거주 환경 수정 완료 (환경은 갱신되었으나 3초 지연 완료로 상담 날짜가 이전 값으로 롤백됨)', 'warning');
        await loadApplications();
      }, 4500);
    };

    // Species & Region search race condition (Error 5 Trigger)
    const triggerSearchRace = () => {
      const sp = filterSpecies.value;
      const reg = filterRegion.value;
      showToast(`보호 동물 검색 필터를 조회합니다: [${sp} / ${reg}]`, 'info');

      if (sp === 'DOG') {
        // Fetch DOG (3.0s delay)
        fetch(`/api/animals/search?species=DOG&region=${reg}`)
          .then(res => res.json())
          .then(data => {
            animals.value = data;
            showToast('강아지 검색 결과 수신 완료 (3초 지연 완료)', 'warning');
          });
      } else if (sp === 'CAT') {
        // Fetch CAT (0.2s delay)
        fetch(`/api/animals/search?species=CAT&region=${reg}`)
          .then(res => res.json())
          .then(data => {
            animals.value = data;
            showToast('고양이 검색 결과 수신 완료 (0.2초 완료)', 'info');
          });
      } else {
        fetch(`/api/animals/search?species=${sp}&region=${reg}`)
          .then(res => res.json())
          .then(data => {
            animals.value = data;
          });
      }
    };

    // Age Sort Favorite Index Mismatch (Error 3 Target)
    const toggleFavorite = (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 동물 목록을 나이순으로 정렬한 뒤 관심 등록(❤️)을 누르면 
      // 화면의 정렬 인덱스(index)를 원본 동물 배열(`animals`)에 그대로 대입해 
      // 선택한 동물이 아니라 같은 배열 위치의 엉뚱한 동물이 관심 등록되는 결함입니다.
      const targetAnimal = animals.value[index];
      if (targetAnimal) {
        targetAnimal.isFavorite = !targetAnimal.isFavorite;
        showToast(`[${targetAnimal.name}] 동물의 관심 등록 상태를 토글했습니다. (인덱스 불일치 오등록 가능)`, 'warning');
      }
    };

    // Dual Foster & Adopt trigger (Error 4 Target)
    const triggerDualFosterAdopt = async (animal) => {
      const res = await fetch(`/api/animals/${animal.id}/foster-and-adopt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUser.value, applicantName: "신청자" })
      });

      if (res.ok) {
        showToast(`[${animal.name}] 동물에 대한 임시보호 및 입양 신청이 동시 접수되었습니다. (상태가 '임시보호 & 입양심사중' 이중 표시됨)`, 'danger');
        await loadAll();
      }
    };

    // Delete Application (Error 2 Target)
    const deleteApplication = async (id) => {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('입양 신청을 대장에서 취소/소거 처리했습니다. (동물 누적 신청자 수 및 대시보드 통계에는 계속 유지됨)', 'warning');
        await loadApplications();
      }
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('PawShelter 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
      selectedAnimal.value = null;
      selectedApplication.value = null;
      await loadAll();
    };

    // Computed Sort properties
    const sortedAnimals = computed(() => {
      let list = [...animals.value];

      if (filterSpecies.value !== 'ALL') {
        list = list.filter(a => a.species === filterSpecies.value);
      }
      if (filterRegion.value !== 'ALL') {
        list = list.filter(a => a.region.includes(filterRegion.value));
      }

      if (ageSortOrder.value === 'AGE_ASC') {
        list.sort((a, b) => a.age - b.age);
      } else if (ageSortOrder.value === 'AGE_DESC') {
        list.sort((a, b) => b.age - a.age);
      }

      return list;
    });

    const userApplications = computed(() => {
      return applications.value.filter(a => a.userId === activeUser.value);
    });

    return {
      animals,
      applications,
      shelterStats,
      activeUser,
      filterSpecies,
      filterRegion,
      ageSortOrder,
      selectedAnimal,
      selectedApplication,
      toasts,
      getStatusLabel,
      selectAnimal,
      handleUserSwitch,
      triggerEnvCounselDateRace,
      triggerSearchRace,
      toggleFavorite,
      triggerDualFosterAdopt,
      deleteApplication,
      resetSandbox,
      removeToast,
      sortedAnimals,
      userApplications
    };
  }
}).mount('#app');
