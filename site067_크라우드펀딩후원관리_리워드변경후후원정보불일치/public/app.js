const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const projects = ref([]);
    const pledges = ref([]);
    const rewards = ref([]);
    const stats = ref({ totalRaisedAmount: 0, backerCount: 0 });
    const commentsList = ref([]);

    // Selections / Filters
    const searchQuery = ref('');
    const achievementSortOrder = ref('NONE');
    const activeCategory = ref('ALL');
    const activeCommentPage = ref('page_1');

    const selectedPledge = ref(null);
    const toasts = ref([]);

    // Stale reward cache for Error 1
    let previousRewardIdCache = '';

    onMounted(() => {
      loadAll();
      loadComments('page_1');
    });

    const loadAll = async () => {
      await loadProjects();
      await loadPledges();
      await loadRewards();
      await loadStats();
    };

    const loadProjects = async () => {
      const res = await fetch('/api/projects');
      const data = await res.json();
      projects.value = data;
    };

    const loadPledges = async () => {
      const res = await fetch('/api/pledges');
      const data = await res.json();
      pledges.value = data;

      if (data.length > 0 && !selectedPledge.value) {
        selectedPledge.value = data[0];
        previousRewardIdCache = data[0].rewardId;
      }
    };

    const loadRewards = async () => {
      const res = await fetch('/api/rewards');
      const data = await res.json();
      rewards.value = data;
    };

    const loadStats = async () => {
      const res = await fetch('/api/stats');
      const data = await res.json();
      stats.value = data;
    };

    const loadComments = async (page) => {
      const res = await fetch(`/api/comments?page=${page}`);
      const data = await res.json();
      commentsList.value = data;
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

    const handleRewardSelectChange = (rewardId) => {
      if (!selectedPledge.value) return;
      const targetReward = rewards.value.find(r => r.id === rewardId);
      if (targetReward) {
        selectedPledge.value.rewardId = rewardId;
        selectedPledge.value.rewardName = targetReward.name;
        selectedPledge.value.price = targetReward.price;
      }
    };

    // Toggle favorite index mismatch (Error 3 Target)
    const toggleFavorite = (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 달성률 정렬이 켜진 화면상의 인덱스(index)를 그대로 
      // 원본 프로젝트 배열(projects)에 대입하여 엉뚱한 제품의 관심 등록 상태(isFavorite)가 토글되는 결함입니다.
      const targetProj = projects.value[index];
      if (targetProj) {
        targetProj.isFavorite = !targetProj.isFavorite;
        showToast(`[${targetProj.title}] 관심 등록 상태를 토글했습니다. (인덱스 불일치 오등록 가능)`, 'warning');
      }
    };

    // Delete project stats leak (Error 4 Target)
    const deleteProject = async (id) => {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('창작자 프로젝트 게시물이 영구 삭제되었습니다. (플랫폼 누적 모집액/후원자수는 미차감)', 'warning');
        await loadProjects();
      }
    };

    // Reward package & Quantity race (Error 1 Trigger)
    const triggerRewardQuantityRace = (pledge) => {
      showToast(`리워드 변경 수정과 약정 수량 수정을 연속 요청합니다.`, 'info');

      // 1. PATCH reward (0.1s delay)
      fetch(`/api/pledges/${pledge.id}/reward`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: pledge.rewardId })
      });

      // 2. PATCH quantity (3.0s delay) - sends old rewardId
      setTimeout(async () => {
        const res = await fetch(`/api/pledges/${pledge.id}/quantity`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            quantity: pledge.quantity,
            rewardId: previousRewardIdCache // Sends stale rewardId cache!
          })
        });
        if (res.ok) {
          showToast('후원 수량 변경 처리 완료 (3초 지연 완료)', 'success');
          await loadPledges();
        }
      }, 100);

      // Optimistic cache update
      previousRewardIdCache = pledge.rewardId;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('지연 처리 완료 (수량 정보는 변경되었으나 리워드 선택 정보는 이전 패키지로 롤백 복귀됨)', 'warning');
        await loadPledges();
      }, 4500);
    };

    // Shipping address update & Cancel Pledge Conflict (Error 2 Trigger)
    const triggerShippingCancelConflict = (pledge) => {
      showToast(`배송지 주소 변경 수정과 후원 취소 요청을 동시 전송합니다.`, 'info');

      // 1. PATCH shipping (4.0s delay)
      fetch(`/api/pledges/${pledge.id}/shipping`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress: pledge.shippingAddress })
      });

      // 2. POST cancel (0.5s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/pledges/${pledge.id}/cancel`, { method: 'POST' });
        if (res.ok) {
          showToast('후원 결제 취소 완료 (0.5초 완료)', 'success');
          await loadPledges();
        }
      }, 100);

      // Optimistic cancel
      pledge.status = 'CANCELLED';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('주소 변경 처리 완료 (취소 완료되었던 후원 건이 PENDING_PAYMENT 결제 대기로 재부활 활성화됨)', 'danger');
        await loadPledges();
      }, 4500);
    };

    const cancelPledge = async (id) => {
      const res = await fetch(`/api/pledges/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        showToast('후원 약정 결제 취소 요청이 즉시 완료되었습니다.', 'success');
        await loadPledges();
      }
    };

    // Comments Page Switch Race (Error 5 Trigger)
    const triggerCommentPageRace = (pageName) => {
      activeCommentPage.value = pageName;
      showToast(`댓글 피드백 ${pageName} 번호를 로드 요청합니다.`, 'info');

      if (pageName === 'page_1') {
        fetch('/api/comments?page=page_1')
          .then(res => res.json())
          .then(data => {
            // INTENTIONAL_ERROR
            // CATEGORY: Network
            // DESCRIPTION: 1페이지 댓글 응답이 뒤늦게 들어와 목록을 단순히 대체하지 않고 
            // 기존 목록 뒤에 무작위 push 병합을 시켜 댓글 순서 왜곡 및 일부 항목 중복을 유발합니다.
            commentsList.value = [...commentsList.value, ...data];
            showToast('1페이지 수신 완료 (3초 지연 병합)', 'warning');
          });
      } else if (pageName === 'page_2') {
        fetch('/api/comments?page=page_2')
          .then(res => res.json())
          .then(data => {
            commentsList.value = data;
            showToast('2페이지 수신 완료 (0.2초 완료)', 'info');
          });
      }
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('FundWave 플랫폼 크라우드펀딩 데이터베이스가 리셋되었습니다.', 'success');
      selectedPledge.value = null;
      await loadAll();
    };

    // Computed filters
    const sortedProjects = computed(() => {
      let list = [...projects.value];

      if (activeCategory.value !== 'ALL') {
        list = list.filter(p => p.category === activeCategory.value);
      }
      if (searchQuery.value) {
        list = list.filter(p => p.title.includes(searchQuery.value) || p.creator.includes(searchQuery.value));
      }

      if (achievementSortOrder.value === 'ASC') {
        list.sort((a, b) => (a.raised / a.target) - (b.raised / b.target));
      } else if (achievementSortOrder.value === 'DESC') {
        list.sort((a, b) => (b.raised / b.target) - (a.raised / a.target));
      }

      return list;
    });

    return {
      projects,
      pledges,
      rewards,
      stats,
      commentsList,
      searchQuery,
      achievementSortOrder,
      activeCategory,
      activeCommentPage,
      selectedPledge,
      toasts,
      formatPrice,
      handleRewardSelectChange,
      toggleFavorite,
      deleteProject,
      triggerRewardQuantityRace,
      triggerShippingCancelConflict,
      cancelPledge,
      triggerCommentPageRace,
      resetSandbox,
      removeToast,
      sortedProjects
    };
  }
}).mount('#app');
