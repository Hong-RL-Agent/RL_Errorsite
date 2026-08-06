const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const employees = ref([]);
    const leaveRequests = ref([]);
    const stats = ref({ usedLeaveTotal: 14.5, pendingCount: 18 });

    // Selections / Filters
    const activeAdmin = ref('ADMIN_A');
    const filterTeam = ref('ALL');
    const employeeSearchQuery = ref('');
    const leaveSortOrder = ref('NONE');

    const selectedEmployee = ref(null);
    const selectedLeaveRequest = ref(null);
    const toasts = ref([]);

    // Stale leave type cache for Error 1
    let previousTypeCache = 'ANNUAL';

    // Session stats cache (Error 6 Target)
    const cachedUsedLeaveTotal = ref(14.5);
    const cachedPendingCount = ref(18);

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadEmployees();
      await loadLeaveRequests();
      await loadStats();
    };

    const loadEmployees = async () => {
      const res = await fetch('/api/employees');
      const data = await res.json();
      employees.value = data;

      if (data.length > 0 && !selectedEmployee.value) {
        selectedEmployee.value = data[0];
      }
    };

    const loadLeaveRequests = async () => {
      const res = await fetch('/api/leave-requests');
      const data = await res.json();
      leaveRequests.value = data;

      if (data.length > 0 && !selectedLeaveRequest.value) {
        selectedLeaveRequest.value = data[0];
        previousTypeCache = data[0].type;
      }
    };

    const loadStats = async () => {
      // Mock stats
      if (activeAdmin.value === 'ADMIN_A') {
        cachedUsedLeaveTotal.value = 14.5;
        cachedPendingCount.value = 18;
      } else {
        cachedUsedLeaveTotal.value = 6.0;
        cachedPendingCount.value = 7;
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

    const getLeaveTypeLabel = (type) => {
      const map = {
        ANNUAL: "연차",
        HALF_AM: "오전반차",
        HALF_PM: "오후반차",
        SICK: "병가"
      };
      return map[type] || type;
    };

    // Calendar day event calculator
    const getDayLeaveEvents = (dayNum) => {
      const dayStr = String(dayNum).padStart(2, '0');
      const dateTarget = `2026-08-${dayStr}`;
      return leaveRequests.value.filter(r => {
        return dateTarget >= r.startDate && dateTarget <= r.endDate && r.status !== 'CANCELLED';
      });
    };

    // Admin Session Switch (Error 6 Target)
    const handleAdminSwitch = (adminRole) => {
      activeAdmin.value = adminRole;
      showToast(`관리자 권한 계정을 [${adminRole}]으로 변경합니다.`, 'info');

      // Update employee listings
      loadEmployees();

      // INTENTIONAL_ERROR
      // CATEGORY: Session + Cache
      // DESCRIPTION: 관리자 A로 확인 후 관리자 B로 로그인하면 직원 목록은 B 권한 기준으로 리로드되지만, 
      // 상단의 잔여 휴가 요약 및 승인 대기 개수 캐시(`cachedUsedLeaveTotal`, `cachedPendingCount`)를 
      // 갱신하지 않고 이전 관리자 A의 데이터를 그대로 노출 노수하는 결함입니다.
      
      // Note: We intentionally do NOT call loadStats() here to leave cachedUsedLeaveTotal & cachedPendingCount untouched!
    };

    // Leave Dates & Type update race (Error 1 Trigger)
    const triggerDatesTypeRace = (req) => {
      showToast(`휴가 기간 수정과 휴가 구분 유형 변경을 연속 요청합니다.`, 'info');

      // 1. PATCH Type (0.1s delay)
      fetch(`/api/leave-requests/${req.id}/type`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: req.type })
      });

      // 2. PATCH Dates (3.0s delay) - sends old type
      setTimeout(() => {
        fetch(`/api/leave-requests/${req.id}/dates`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: req.startDate,
            endDate: req.endDate,
            days: req.days,
            type: previousTypeCache // Sends stale type cache!
          })
        });
      }, 100);

      // Optimistic cache update
      previousTypeCache = req.type;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('기간 수정 완료 (기간은 갱신되었으나 3초 지연 완료로 휴가 유형이 이전 값으로 롤백됨)', 'warning');
        await loadLeaveRequests();
      }, 4500);
    };

    // Employee search & Team filter race condition (Error 5 Trigger)
    const triggerSearchRace = () => {
      const q = employeeSearchQuery.value;
      showToast(`직원 검색 필터링을 조회합니다: [${q}]`, 'info');

      if (q === '이영희') {
        // Fetch 이영희 (3.0s delay)
        fetch(`/api/employees/search?q=이영희&team=${filterTeam.value}`)
          .then(res => res.json())
          .then(data => {
            employees.value = data;
            showToast('이영희 검색 결과 완료 (3초 지연 완료)', 'warning');
          });
      } else if (q === '정수진') {
        // Fetch 정수진 (0.2s delay)
        fetch(`/api/employees/search?q=정수진&team=${filterTeam.value}`)
          .then(res => res.json())
          .then(data => {
            employees.value = data;
            showToast('정수진 검색 결과 완료 (0.2초 완료)', 'info');
          });
      } else {
        fetch(`/api/employees/search?q=${q}&team=${filterTeam.value}`)
          .then(res => res.json())
          .then(data => {
            employees.value = data;
          });
      }
    };

    // Leave Approval index mismatch (Error 4 Target)
    const confirmLeaveApprove = async (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 승인 대기 목록을 신청일순으로 정렬한 뒤 승인 버튼을 누르면 
      // 화면의 정렬 인덱스(index)를 원본 휴가 배열(`leaveRequests`)에 그대로 대입해 
      // 엉뚱한 직원의 휴가가 승인 처리되는 결함입니다.
      const targetReq = leaveRequests.value[index];
      if (!targetReq) {
        showToast('승인할 휴가 신청 인덱스를 찾을 수 없습니다.', 'danger');
        return;
      }

      const res = await fetch(`/api/leave-requests/${targetReq.id}/approve`, {
        method: 'PATCH'
      });

      if (res.ok) {
        showToast(`[${targetReq.empName}] 님의 휴가를 승인 처리하였습니다. (인덱스 불일치 오승인 가능)`, 'warning');
        await loadLeaveRequests();
      }
    };

    // Delete Leave Request (Error 3 Target)
    const deleteLeaveRequest = async (id) => {
      const res = await fetch(`/api/leave-requests/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('휴가 신청을 대장에서 삭제 처리했습니다. (잔여 휴가 차감 및 월간 통계 수치는 유지됨)', 'warning');
        await loadLeaveRequests();
      }
    };

    // Approve & Cancel Conflict (Error 2 Trigger)
    const triggerApproveCancelConflict = (req) => {
      showToast(`휴가 결재 승인과 해당 휴가의 취소 요청을 동시 전송합니다.`, 'info');

      // 1. PATCH approve (4.0s delay)
      fetch(`/api/leave-requests/${req.id}/approve`, { method: 'PATCH' });

      // 2. POST cancel (0.5s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/leave-requests/${req.id}/cancel`, { method: 'POST' });
        if (res.ok) {
          showToast('휴가 취소 신청 완료 (0.5초 완료)', 'success');
          await loadLeaveRequests();
        }
      }, 100);

      // Optimistic cancel
      req.status = 'CANCELLED';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('승인 완료 응답 수신 (취소 완료되었던 휴가가 APPROVED 승인 상태로 강제 부활됨)', 'danger');
        await loadLeaveRequests();
      }, 4500);
    };

    const cancelLeaveRequest = async (id) => {
      const res = await fetch(`/api/leave-requests/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        showToast('휴가 신청이 취소되었습니다.', 'success');
        await loadLeaveRequests();
      }
    };

    // Unauthorized Approve Attempt (Error 7 Trigger)
    const triggerUnauthorizedApprove = async (req) => {
      const res = await fetch(`/api/leave-requests/${req.id}/unauthorized-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId: "EMP-002", empName: "이영희" })
      });

      if (!res.ok) {
        showToast('HTTP 403 Forbidden: 일반 직원은 승인 권한이 없습니다. (서버 감사 로그에는 승인 완료로 기록됨)', 'danger');
      }
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('WorkTime 근태 관리 데이터베이스가 초기화되었습니다.', 'success');
      selectedEmployee.value = null;
      selectedLeaveRequest.value = null;
      await loadAll();
    };

    // Computed Sort properties
    const sortedEmployees = computed(() => {
      let list = [...employees.value];
      if (filterTeam.value !== 'ALL') {
        list = list.filter(e => e.team === filterTeam.value);
      }
      return list;
    });

    const sortedLeaveRequests = computed(() => {
      let list = [...leaveRequests.value];

      if (leaveSortOrder.value === 'ASC') {
        list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      } else if (leaveSortOrder.value === 'DESC') {
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }

      return list;
    });

    return {
      employees,
      leaveRequests,
      stats,
      activeAdmin,
      filterTeam,
      employeeSearchQuery,
      leaveSortOrder,
      selectedEmployee,
      selectedLeaveRequest,
      cachedUsedLeaveTotal,
      cachedPendingCount,
      toasts,
      getLeaveTypeLabel,
      getDayLeaveEvents,
      handleAdminSwitch,
      triggerDatesTypeRace,
      triggerSearchRace,
      confirmLeaveApprove,
      deleteLeaveRequest,
      triggerApproveCancelConflict,
      cancelLeaveRequest,
      triggerUnauthorizedApprove,
      resetSandbox,
      removeToast,
      sortedEmployees,
      sortedLeaveRequests
    };
  }
}).mount('#app');
