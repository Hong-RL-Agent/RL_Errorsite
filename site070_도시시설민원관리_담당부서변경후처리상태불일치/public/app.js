const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const reports = ref([]);
    const visits = ref([]);
    const stats = ref({ totalVisits: 0, resolvedCount: 0 });

    // Selections / Filters
    const filterRegion = ref('ALL');
    const urgencySortOrder = ref('NONE');
    const activeCategory = ref('ALL');

    const selectedReport = ref(null);
    const mockFileName = ref('');
    const toasts = ref([]);

    // Stale status cache for Error 1
    let previousStatusCache = '';

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadReports();
      await loadVisits();
      await loadStats();
    };

    const loadReports = async () => {
      const res = await fetch('/api/reports');
      const data = await res.json();
      reports.value = data;

      if (data.length > 0 && !selectedReport.value) {
        selectedReport.value = data[0];
        previousStatusCache = data[0].status;
      }
    };

    const loadVisits = async () => {
      const res = await fetch('/api/visits');
      const data = await res.json();
      visits.value = data;
    };

    const loadStats = async () => {
      const dbStats = { totalVisits: 14, resolvedCount: 38 };
      stats.value = dbStats;
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

    // Coordinate projection helpers for SVG map markers
    const getMapX = (rep) => {
      // Map region coordinates mapping
      let base = 100;
      if (rep.region === '서초구') base = 350;
      if (rep.region === '강남구') base = 480;

      // Deterministic offset based on ID
      const offset = (parseInt(rep.id.split('-')[1]) * 17) % 80;
      return base + offset;
    };

    const getMapY = (rep) => {
      let base = 80;
      if (rep.region === '서초구') base = 100;
      if (rep.region === '강남구') base = 150;

      const offset = (parseInt(rep.id.split('-')[1]) * 13) % 70;
      return base + offset;
    };

    // Department & Status race (Error 1 Trigger)
    const triggerDepartmentStatusRace = (report) => {
      showToast(`담당 부서 변경 수정과 처리 상태 수정 요청을 순차 전송합니다.`, 'info');

      // 1. PATCH Status (0.1s delay)
      fetch(`/api/reports/${report.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: report.status })
      });

      // 2. PATCH Department (3.0s delay) - sends old status
      setTimeout(() => {
        fetch(`/api/reports/${report.id}/department`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            department: report.department,
            status: previousStatusCache // Sends stale status cache!
          })
        });
      }, 100);

      // Optimistic cache update
      previousStatusCache = report.status;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('부서 배정 저장 완료 (부서는 갱신되었으나 3초 지연 완료 처리로 처리 상태가 이전 값으로 롤백됨)', 'warning');
        await loadReports();
      }, 4500);
    };

    // Region & Category search race (Error 2 Trigger)
    const triggerSearchRace = (cat) => {
      activeCategory.value = cat;
      showToast(`민원 카테고리 필터 검색을 시작합니다: [${cat}]`, 'info');

      if (cat === 'ROAD') {
        // Fetch ROAD (3.0s delay)
        fetch(`/api/reports/search?category=ROAD&region=${filterRegion.value}`)
          .then(res => res.json())
          .then(data => {
            reports.value = data;
            showToast('도로/보도 민원 수신 완료 (3초 지연 완료)', 'warning');
          });
      } else if (cat === 'LIGHT') {
        // Fetch LIGHT (0.2s delay)
        fetch(`/api/reports/search?category=LIGHT&region=${filterRegion.value}`)
          .then(res => res.json())
          .then(data => {
            reports.value = data;
            showToast('가로등/보안등 민원 수신 완료 (0.2초 완료)', 'info');
          });
      } else {
        // Normal fetch
        fetch(`/api/reports/search?category=${cat}&region=${filterRegion.value}`)
          .then(res => res.json())
          .then(data => {
            reports.value = data;
          });
      }
    };

    // Delete Report (Error 3 Target)
    const deleteReport = async (id) => {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('민원을 접수 대장에서 소거했습니다. (플랫폼 누적 예정일정/완료 통계는 차감 안 됨)', 'warning');
        await loadReports();
      }
    };

    // Reply & Cancel Conflict (Error 4 Trigger)
    const triggerReplyCancelConflict = (report) => {
      showToast(`시민 답변 안내문 기입 저장과 민원 취소 처리를 동시에 진행합니다.`, 'info');

      // 1. PATCH reply (4.0s delay)
      fetch(`/api/reports/${report.id}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: report.reply })
      });

      // 2. POST cancel (0.5s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/reports/${report.id}/cancel`, { method: 'POST' });
        if (res.ok) {
          showToast('민원 접수 취소 처리 완료 (0.5초 완료)', 'success');
          await loadReports();
        }
      }, 100);

      // Optimistic cancel status
      report.status = 'CANCELLED';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('안내문 수정 완료 (취소 완료 처리되었던 민원이 PROCESSING 처리중으로 강제 복원 재활성화됨)', 'danger');
        await loadReports();
      }, 4500);
    };

    const cancelReport = async (id) => {
      const res = await fetch(`/api/reports/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        showToast('민원 접수를 취소하였습니다.', 'success');
        await loadReports();
      }
    };

    // Manager Assign index mismatch (Error 5 Target)
    const confirmManagerAssign = (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 민원 목록이 긴급도순으로 정렬된 상태에서 담당자 배정을 클릭하면, 
      // 화면 리스트의 인덱스(index)를 원본 민원 배열(`reports`)에 그대로 대입해 
      // 엉뚱한 민원의 담당자 정보가 변경 배정되는 결함입니다.
      const targetRep = reports.value[index];
      if (!targetRep) {
        showToast('배정할 민원 바인딩 정보를 조회할 수 없습니다.', 'danger');
        return;
      }

      const managers = ["홍길동", "이몽룡", "성춘향", "임꺽정", "이순신", "장길산"];
      const randomManager = managers[Math.floor(Math.random() * managers.length)];
      targetRep.manager = randomManager;

      showToast(`[${targetRep.title}] 담당자로 [${randomManager}]가 배정되었습니다. (인덱스 불일치 오지정 가능)`, 'warning');
    };

    // Mock photo upload (Error 6 Trigger)
    const uploadMockPhoto = async (report) => {
      if (!mockFileName.value) {
        showToast('업로드할 사진 파일 이름을 입력하세요.', 'danger');
        return;
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: report.id, filename: mockFileName.value })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`사진 파일 업로드에 성공했습니다: [${mockFileName.value}]`, 'success');
        mockFileName.value = '';
        await loadReports();
      }
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('도시 관제 컴플레인 센터 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
      selectedReport.value = null;
      await loadAll();
    };

    // Computed Sort Property
    const sortedReports = computed(() => {
      let list = [...reports.value];

      if (filterRegion.value !== 'ALL') {
        list = list.filter(r => r.region === filterRegion.value);
      }

      if (urgencySortOrder.value === 'ASC') {
        list.sort((a, b) => {
          const map = { LOW: 1, MEDIUM: 2, HIGH: 3 };
          return map[a.urgency] - map[b.urgency];
        });
      } else if (urgencySortOrder.value === 'DESC') {
        list.sort((a, b) => {
          const map = { LOW: 1, MEDIUM: 2, HIGH: 3 };
          return map[b.urgency] - map[a.urgency];
        });
      }

      return list;
    });

    return {
      reports,
      visits,
      stats,
      filterRegion,
      urgencySortOrder,
      activeCategory,
      selectedReport,
      mockFileName,
      toasts,
      getMapX,
      getMapY,
      triggerDepartmentStatusRace,
      triggerSearchRace,
      deleteReport,
      triggerReplyCancelConflict,
      cancelReport,
      confirmManagerAssign,
      uploadMockPhoto,
      resetSandbox,
      removeToast,
      sortedReports
    };
  }
}).mount('#app');
