const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const papers = ref([]);
    const reviewers = ref([]);
    const stats = ref({ totalReviewers: 0, pendingReviews: 0, completedReviews: 0 });
    const privateComments = ref([]);
    const reviews = ref([]);

    const selectedPaper = ref(null);
    const selectedStatus = ref('ALL');
    const searchQuery = ref('');
    const currentEditor = ref('Editor A');

    const toasts = ref([]);

    const revisionFilenameInput = ref('');
    const assignReviewerName = ref('');

    // Stale author cache for Error 1
    let previousAuthorsCache = [];

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadPapers();
      await loadReviewers();
      await loadStats();
      await loadPrivateComments();
      await loadReviews();
    };

    const loadPapers = async () => {
      const res = await fetch('/api/papers');
      const data = await res.json();
      papers.value = data;
      if (data.length > 0 && !selectedPaper.value) {
        selectedPaper.value = data[0];
        previousAuthorsCache = [...data[0].authors];
      }
    };

    const loadReviewers = async () => {
      const res = await fetch('/api/reviewers');
      const data = await res.json();
      reviewers.value = data;
    };

    const loadStats = async () => {
      const res = await fetch('/api/stats');
      const data = await res.json();
      stats.value = data;
    };

    const loadPrivateComments = async () => {
      const res = await fetch('/api/private-comments');
      const data = await res.json();
      privateComments.value = data;
    };

    const loadReviews = async () => {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      reviews.value = data;
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

    // Editor Switcher (Error 3 Target)
    const handleEditorSwitch = (editorName) => {
      currentEditor.value = editorName;
      showToast(`[${editorName}] 편집국 세션을 활성화합니다.`, 'info');
      
      // Update papers but do NOT reload private comments
      loadPapers();

      // INTENTIONAL_ERROR
      // CATEGORY: Session + Frontend
      // DESCRIPTION: 편집자 계정 전환(A ➔ B) 시 논문 목록은 B 기준으로 전환되나, 
      // 우측 패널의 비공개 심사 의견 리스트(`privateComments`) 바인딩을 리셋하지 않고 
      // 이전 편집자 A의 비공개 심사 내역을 계속 노출하는 보안 결함입니다.
      // Bypasses loadPrivateComments()!
    };

    // Authors order shift controls
    const shiftAuthorLeft = (idx) => {
      if (idx === 0 || !selectedPaper.value) return;
      const arr = [...selectedPaper.value.authors];
      const temp = arr[idx];
      arr[idx] = arr[idx - 1];
      arr[idx - 1] = temp;
      selectedPaper.value.authors = arr;
    };

    const shiftAuthorRight = (idx) => {
      if (!selectedPaper.value || idx === selectedPaper.value.authors.length - 1) return;
      const arr = [...selectedPaper.value.authors];
      const temp = arr[idx];
      arr[idx] = arr[idx + 1];
      arr[idx + 1] = temp;
      selectedPaper.value.authors = arr;
    };

    // Reorder authors & Edit Title Race (Error 1 Trigger)
    const triggerAuthorsTitleRace = (paper) => {
      showToast(`저자 순서 변경과 새 제목 [${paper.title}] 저장을 연속 전송합니다.`, 'info');

      // 1. PATCH authors order (0.1s delay)
      fetch(`/api/papers/${paper.id}/authors`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authors: paper.authors })
      });

      // 2. PATCH title (3s delay) - sends old authors list cache
      setTimeout(async () => {
        const res = await fetch(`/api/papers/${paper.id}/title`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: paper.title,
            authors: previousAuthorsCache // Sends old order!
          })
        });
        if (res.ok) {
          showToast('제목 저장 완료 (3초 지연 완료)', 'success');
          await loadAll();
        }
      }, 100);

      // Optimistic update of cache
      previousAuthorsCache = [...paper.authors];

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('지연 처리 완료 (수정된 제목이 기록되었으나 공동 저자 순서는 이전 상태로 롤백됨)', 'warning');
        await loadAll();
      }, 4500);
    };

    // Revision Upload & File Delete Conflict (Error 2 Trigger)
    const triggerRevisionDeleteConflict = (paper) => {
      if (!revisionFilenameInput.value) return;
      const newFile = revisionFilenameInput.value;

      showToast(`수정본 [${newFile}] 제출과 구형 파일 소거를 동시에 처리 요청합니다.`, 'info');

      // 1. POST revision (4s delay) - sends paper.files list as previousFiles
      fetch(`/api/papers/${paper.id}/revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: newFile,
          previousFiles: paper.files // Includes the old file!
        })
      });

      // 2. DELETE old file (0.5s delay)
      setTimeout(async () => {
        const oldFile = paper.currentFile;
        const res = await fetch(`/api/papers/${paper.id}/files/${oldFile}`, { method: 'DELETE' });
        if (res.ok) {
          showToast(`기존 파일 [${oldFile}] 삭제 성공 (0.5초 완료)`, 'success');
          await loadAll();
        }
      }, 100);

      // Optimistic update
      paper.currentFile = newFile;
      if (!paper.files.includes(newFile)) paper.files.push(newFile);
      revisionFilenameInput.value = '';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('수정본 저장 응답 도착 (삭제되었던 이전 버전 파일이 다시 목록에 부활됨)', 'danger');
        await loadAll();
      }, 4500);
    };

    const deleteOldFile = async (paper, filename) => {
      const res = await fetch(`/api/papers/${paper.id}/files/${filename}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(`파일 [${filename}] 소거 처리가 완료되었습니다.`, 'success');
        await loadAll();
      }
    };

    // Delete reviewer (Error 4 Trigger)
    const deleteReviewer = async (id) => {
      const res = await fetch(`/api/reviewer/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('심사위원 위촉 상태가 소거되었습니다.', 'success');
        await loadAll();
      }
    };

    // Assign reviewer
    const assignReviewer = async () => {
      if (!selectedPaper.value || !assignReviewerName.value) return;
      const res = await fetch('/api/reviewers/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperId: selectedPaper.value.id,
          reviewerName: assignReviewerName.value
        })
      });
      if (res.ok) {
        showToast(`[${assignReviewerName.value}] 심사위원이 임명되었습니다.`, 'success');
        assignReviewerName.value = '';
        await loadAll();
      }
    };

    // Change final decision
    const changeDecision = async (id, statusName) => {
      const res = await fetch(`/api/papers/${id}/decision`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusName })
      });
      if (res.ok) {
        showToast(`논문 최종 판정이 [${statusName}] 상태로 의결되었습니다.`, 'success');
        await loadAll();
      }
    };

    // Filter Race (Error 5 Trigger)
    const triggerFilterRace = () => {
      showToast('심사 상태 필터 비동기 경합을 시작합니다. (심사중 ➔ 게재승인)', 'info');

      // 1. Fetch UNDER_REVIEW (3s delay)
      fetch('/api/papers/search?status=UNDER_REVIEW')
        .then(res => res.json())
        .then(data => {
          papers.value = data;
          showToast('심사중 필터 조회 완료 (3초 지연 오버라이트)', 'warning');
        });

      // 2. Fetch ACCEPTED (0.2s delay)
      setTimeout(() => {
        fetch('/api/papers/search?status=ACCEPTED')
          .then(res => res.json())
          .then(data => {
            papers.value = data;
            showToast('게재승인 필터 조회 완료 (0.2초)', 'info');
          });
      }, 150);
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('PaperReview 시스템 데이터베이스가 리셋되었습니다.', 'success');
      selectedPaper.value = null;
      await loadAll();
    };

    // Computed properties
    const sortedPapers = computed(() => {
      let list = [...papers.value];
      if (selectedStatus.value !== 'ALL') {
        list = list.filter(p => p.status === selectedStatus.value);
      }
      if (searchQuery.value) {
        list = list.filter(p => p.title.includes(searchQuery.value));
      }
      return list;
    });

    const filteredPrivateComments = computed(() => {
      // Editor B will still see A's comments if Error 3 is not synchronized!
      return privateComments.value;
    });

    const currentPaperReviews = computed(() => {
      if (!selectedPaper.value) return [];
      return reviews.value.filter(r => r.paperId === selectedPaper.value.id);
    });

    const isActiveStep = (step) => {
      if (!selectedPaper.value) return false;
      const order = ['SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'ACCEPTED'];
      const currentIdx = order.indexOf(selectedPaper.value.status);
      const stepIdx = order.indexOf(step);
      return stepIdx <= currentIdx;
    };

    return {
      papers,
      reviewers,
      stats,
      privateComments,
      reviews,
      selectedPaper,
      selectedStatus,
      searchQuery,
      currentEditor,
      toasts,
      revisionFilenameInput,
      assignReviewerName,
      handleEditorSwitch,
      shiftAuthorLeft,
      shiftAuthorRight,
      triggerAuthorsTitleRace,
      triggerRevisionDeleteConflict,
      deleteOldFile,
      deleteReviewer,
      assignReviewer,
      changeDecision,
      triggerFilterRace,
      resetSandbox,
      removeToast,
      sortedPapers,
      filteredPrivateComments,
      currentPaperReviews,
      isActiveStep
    };
  }
}).mount('#app');
