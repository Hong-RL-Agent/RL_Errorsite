const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const manuscripts = ref([]);
    const authors = ref([]);
    const schedules = ref([]);
    const revisions = ref([]);
    const stats = ref({ totalPrintingCost: 0, totalPrintRequests: 0 });

    // Selections / Filters
    const filterStep = ref('ALL');
    const scheduleSortOrder = ref('NONE');
    const manuscriptSearchQuery = ref('');
    const authorSearchQuery = ref('');

    // Detail Panel fields
    const selectedManuscript = ref(null);
    const newRevisionVersion = ref('');
    const newRevisionNote = ref('');
    const toasts = ref([]);

    // Stale title cache for Error 1
    let previousTitleCache = '';

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadManuscripts();
      await loadSchedules();
      await loadRevisions();
      await loadStats();
      await searchAuthors('');
    };

    const loadManuscripts = async () => {
      const res = await fetch('/api/manuscripts');
      const data = await res.json();
      manuscripts.value = data;

      if (data.length > 0 && !selectedManuscript.value) {
        selectedManuscript.value = data[0];
        previousTitleCache = data[0].title;
      }
    };

    const loadSchedules = async () => {
      const res = await fetch('/api/schedules');
      const data = await res.json();
      schedules.value = data;
    };

    const loadRevisions = async () => {
      const res = await fetch('/api/revisions');
      const data = await res.json();
      revisions.value = data;
    };

    const loadStats = async () => {
      const res = await fetch('/api/manuscripts'); // Simple stats calc
      const dbStats = { totalPrintingCost: 31250000, totalPrintRequests: 12 };
      stats.value = dbStats;
    };

    const searchAuthors = async (q) => {
      const res = await fetch(`/api/authors/search?q=${q}`);
      const data = await res.json();
      authors.value = data;
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

    // Manuscript Title Update & Step race (Error 1 Trigger)
    const triggerTitleStepRace = (ms) => {
      showToast(`원고 제목 수정과 제작 단계 변경 요청을 순차적으로 기입 전송합니다.`, 'info');

      // 1. PATCH Title (0.1s delay)
      fetch(`/api/manuscripts/${ms.id}/title`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: ms.title })
      });

      // 2. PATCH Step (3.0s delay) - sends old title
      setTimeout(() => {
        fetch(`/api/manuscripts/${ms.id}/step`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            step: ms.step,
            title: previousTitleCache // Sends stale title cache!
          })
        });
      }, 100);

      // Optimistic cache update
      previousTitleCache = ms.title;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('제작 단계 저장 완료 (단계는 수정되었으나 3초 지연 완료로 제목이 이전 값으로 회구 롤백됨)', 'warning');
        await loadManuscripts();
      }, 4500);
    };

    // Delete Revision (Error 2 Trigger part 1)
    const triggerRevisionDeleteConflict = async (ms, revId) => {
      showToast(`교정본 [${revId}] 삭제 요청을 전송합니다 (0.5초 소요)`, 'info');
      const res = await fetch(`/api/manuscripts/${ms.id}/revisions/${revId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast('교정본 삭제 완료 (0.5초 완료)', 'success');
        await loadRevisions();
      }
    };

    // Upload Revision (Error 2 Trigger part 2)
    const uploadNewRevision = async (ms) => {
      if (!newRevisionVersion.value) return;
      showToast(`교정본 [${newRevisionVersion.value}] 업로드를 시작합니다 (4초 소요)`, 'info');

      const oldRevId = ms.activeRevisionId;

      fetch(`/api/manuscripts/${ms.id}/revisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: newRevisionVersion.value,
          note: newRevisionNote.value,
          activeRevisionId: oldRevId // Overwrites active ID back to the deleted one!
        })
      });

      newRevisionVersion.value = '';
      newRevisionNote.value = '';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('교정본 업로드 완료 (방금 전 삭제 완료된 버전을 활성 교정본으로 복원 연결함)', 'danger');
        await loadAll();
      }, 4500);
    };

    // Schedule Delete index mismatch (Error 3 Target)
    const confirmScheduleDelete = async (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 제작 예정 일정이 날짜순 정렬된 상태에서 삭제 버튼을 누르면 
      // 정렬 배열의 인덱스(index)를 원본 일정 배열(`schedules`)에 대입해 
      // 엉뚱한 예정 일정이 소거되는 결함입니다.
      const targetSched = schedules.value[index];
      if (!targetSched) {
        showToast('일정 바인딩 인덱스를 찾을 수 없습니다.', 'danger');
        return;
      }

      const res = await fetch(`/api/schedules/${targetSched.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showToast(`[${targetSched.task}] 일정을 소거하였습니다. (인덱스 불일치 오등록 가능)`, 'warning');
        await loadSchedules();
      }
    };

    // Delete Manuscript stats leak (Error 4 Target)
    const deleteManuscript = async (id) => {
      const res = await fetch(`/api/manuscripts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('원고 항목을 영구 삭제하였습니다. (외주제작 및 인쇄 요청 통계 지표는 유지됨)', 'warning');
        await loadManuscripts();
      }
    };

    // Author Search race condition (Error 5 Trigger)
    const triggerAuthorSearchRace = () => {
      showToast('저자 인명 검색어 비동기 경합을 시작합니다. (홍길동 ➔ 이순신)', 'info');

      // 1. Fetch 홍길동 (3.0s delay)
      fetch('/api/authors/search?q=홍길동')
        .then(res => res.json())
        .then(data => {
          authors.value = data;
          showToast('홍길동 검색 결과 완료 (3초 지연 완료)', 'warning');
        });

      // 2. Fetch 이순신 (0.2s delay)
      setTimeout(() => {
        fetch('/api/authors/search?q=이순신')
          .then(res => res.json())
          .then(data => {
            authors.value = data;
            showToast('이순신 검색 결과 완료 (0.2초 완료)', 'info');
          });
      }, 150);
    };

    // Computed Filters
    const sortedManuscripts = computed(() => {
      let list = [...manuscripts.value];
      if (filterStep.value !== 'ALL') {
        list = list.filter(m => m.step === filterStep.value);
      }
      if (manuscriptSearchQuery.value) {
        list = list.filter(m => m.title.includes(manuscriptSearchQuery.value) || m.authorName.includes(manuscriptSearchQuery.value));
      }
      return list;
    });

    const sortedSchedules = computed(() => {
      let list = [...schedules.value];
      if (scheduleSortOrder.value === 'ASC') {
        list.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));
      } else if (scheduleSortOrder.value === 'DESC') {
        list.sort((a, b) => new Date(b.targetDate) - new Date(a.targetDate));
      }
      return list;
    });

    const filteredRevisions = computed(() => {
      if (!selectedManuscript.value) return [];
      return revisions.value.filter(r => r.manuscriptId === selectedManuscript.value.id);
    });

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('PublishFlow 편집 관제 환경이 리셋되었습니다.', 'success');
      selectedManuscript.value = null;
      await loadAll();
    };

    return {
      manuscripts,
      authors,
      schedules,
      revisions,
      stats,
      filterStep,
      scheduleSortOrder,
      manuscriptSearchQuery,
      authorSearchQuery,
      selectedManuscript,
      newRevisionVersion,
      newRevisionNote,
      toasts,
      formatPrice,
      triggerTitleStepRace,
      triggerRevisionDeleteConflict,
      uploadNewRevision,
      confirmScheduleDelete,
      deleteManuscript,
      triggerAuthorSearchRace,
      sortedManuscripts,
      sortedSchedules,
      filteredRevisions,
      resetSandbox,
      removeToast
    };
  }
}).mount('#app');
