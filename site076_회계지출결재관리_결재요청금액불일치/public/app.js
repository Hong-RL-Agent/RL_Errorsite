const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const expenses = ref([]);
    const budgetStats = ref({});
    const stats = ref({ totalUsedBudgetSum: 89400000, pendingExpensesCount: 20 });

    // Selections / Filters
    const activeAdmin = ref('ADMIN_A');
    const filterDepartment = ref('ALL');
    const filterType = ref('ALL');
    const amountSortOrder = ref('NONE');

    const selectedExpense = ref(null);
    const toasts = ref([]);

    // Stale amount cache for Error 1
    let previousRequestedAmountCache = 1500000;

    // Receipt image cache for Session leak (Error 6 Target)
    const cachedReceiptUrl = ref('/uploads/receipt_server.jpg');

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadExpenses();
      await loadBudgetStats();
    };

    const loadExpenses = async () => {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      expenses.value = data;

      const adminList = data.filter(e => e.adminId === activeAdmin.value);
      if (adminList.length > 0 && !selectedExpense.value) {
        selectExpense(adminList[0]);
      }
    };

    const selectExpense = async (exp) => {
      // Fetch detail to trigger Error 7 Image Encoding 404 test if space/parens exist
      const res = await fetch(`/api/expenses/${exp.id}`);
      if (res.ok) {
        const detailData = await res.json();
        selectedExpense.value = detailData;
        cachedReceiptUrl.value = detailData.receiptUrl;
      } else {
        selectedExpense.value = exp;
        cachedReceiptUrl.value = exp.receiptUrl;
      }
    };

    const loadBudgetStats = async () => {
      budgetStats.value = {
        "DEV": { "totalBudget": 50000000, "usedAmount": 28500000 },
        "DESIGN": { "totalBudget": 20000000, "usedAmount": 12400000 },
        "HR": { "totalBudget": 15000000, "usedAmount": 7800000 },
        "MARKETING": { "totalBudget": 40000000, "usedAmount": 24500000 },
        "SALES": { "totalBudget": 30000000, "usedAmount": 16200000 }
      };
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
      if (!val) return '0원';
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
    };

    const getDeptName = (code) => {
      const map = {
        DEV: "개발팀",
        DESIGN: "디자인팀",
        HR: "인사팀",
        MARKETING: "마케팅팀",
        SALES: "영업팀"
      };
      return map[code] || code;
    };

    // Admin Session Switch (Error 6 Target)
    const handleAdminSwitch = (adminId) => {
      activeAdmin.value = adminId;
      showToast(`결재 권한 계정을 [${adminId}]으로 스위칭합니다.`, 'info');

      // Reload expenses list
      loadExpenses();

      // INTENTIONAL_ERROR
      // CATEGORY: Session + Cache
      // DESCRIPTION: 관리자 A가 본 영수증 상세 미리보기(`cachedReceiptUrl`)가 
      // 관리자 B 로그인 후에도 오른쪽 미리보기 패널에 갱신되지 않고 그대로 남는 캐시 결함입니다.
      
      // Note: We intentionally do NOT reset cachedReceiptUrl here!
    };

    // Amount & Approval Request race (Error 1 Trigger)
    const triggerAmountRequestRace = (exp) => {
      showToast('지출 금액 수정과 결재 승인 요청을 순차 실행합니다.', 'info');

      // 1. POST Request Approval (0.1s delay)
      fetch(`/api/expenses/${exp.id}/request-approval`, { method: 'POST' });

      // 2. PATCH Amount (3.0s delay) - sends old requestedAmount
      setTimeout(() => {
        fetch(`/api/expenses/${exp.id}/amount`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: exp.amount,
            requestedAmount: previousRequestedAmountCache // Sends stale requestedAmount cache!
          })
        });
      }, 100);

      // Optimistic cache update
      previousRequestedAmountCache = exp.amount;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('금액 수정 완료 (화면에는 수정 금액으로 결재된 듯 보이나 3초 지연 완료로 이전 금액으로 덮어써짐)', 'warning');
        await loadExpenses();
      }, 4500);
    };

    // Department & Type search race condition (Error 5 Trigger)
    const triggerSearchRace = () => {
      const dept = filterDepartment.value;
      const type = filterType.value;
      showToast(`지출결재 필터를 조회합니다: [${dept} / ${type}]`, 'info');

      if (dept === 'DEV') {
        // Fetch DEV (3.0s delay)
        fetch(`/api/expenses/search?department=DEV&type=${type}`)
          .then(res => res.json())
          .then(data => {
            expenses.value = data;
            showToast('개발팀 지출 내역 수신 완료 (3초 지연 완료)', 'warning');
          });
      } else if (dept === 'HR') {
        // Fetch HR (0.2s delay)
        fetch(`/api/expenses/search?department=HR&type=${type}`)
          .then(res => res.json())
          .then(data => {
            expenses.value = data;
            showToast('인사팀 지출 내역 수신 완료 (0.2초 완료)', 'info');
          });
      } else {
        fetch(`/api/expenses/search?department=${dept}&type=${type}`)
          .then(res => res.json())
          .then(data => {
            expenses.value = data;
          });
      }
    };

    // Amount Sort Approval Index Mismatch (Error 4 Target)
    const confirmApprove = (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 승인 대기 목록을 금액순으로 정렬한 뒤 승인 버튼을 누르면 
      // 화면의 정렬 인덱스(index)를 원본 지출 배열(`expenses`)에 그대로 대입해 
      // 선택한 지출이 아니라 같은 배열 위치의 엉뚱한 지출이 승인 처리되는 결함입니다.
      const targetExp = expenses.value[index];
      if (targetExp) {
        targetExp.status = 'APPROVED';
        showToast(`[${targetExp.title}] 지출 승인을 완료하였습니다. (인덱스 불일치 오승인 가능)`, 'warning');
      }
    };

    // Approve & Modify Conflict (Error 2 Trigger)
    const triggerApproveModifyConflict = (exp) => {
      showToast('지출 결재 승인과 승인 후 항목 내용 수정을 동시 진행합니다.', 'info');

      // 1. PATCH Approve (0.5s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/expenses/${exp.id}/approve`, { method: 'PATCH' });
        if (res.ok) {
          showToast('지출 결재 승인 성공 (0.5초 완료)', 'success');
          await loadExpenses();
        }
      }, 100);

      // 2. PATCH Modify (4.0s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/expenses/${exp.id}/modify`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: `${exp.title} (수정됨)`, amount: exp.amount + 50000 })
        });
        if (res.ok) {
          showToast('승인 후 지출 수정 완료 (4초 지연 완료: 승인 완료 상태인데도 금액/제목이 오버라이트됨)', 'danger');
          await loadExpenses();
        }
      }, 150);
    };

    // Delete Expense (Error 3 Target)
    const deleteExpense = async (id) => {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('지출 항목을 결재 대장에서 삭제했습니다. (부서별 예산 소진율 및 월별 그래프 수치는 기산 유지됨)', 'warning');
        await loadExpenses();
      }
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('ExpenseGate 회계 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
      selectedExpense.value = null;
      await loadAll();
    };

    // Computed Sort & Stats
    const sortedExpenses = computed(() => {
      let list = [...expenses.value];

      if (filterDepartment.value !== 'ALL') {
        list = list.filter(e => e.department === filterDepartment.value);
      }
      if (filterType.value !== 'ALL') {
        list = list.filter(e => e.type === filterType.value);
      }

      if (amountSortOrder.value === 'AMOUNT_ASC') {
        list.sort((a, b) => a.requestedAmount - b.requestedAmount);
      } else if (amountSortOrder.value === 'AMOUNT_DESC') {
        list.sort((a, b) => b.requestedAmount - a.requestedAmount);
      }

      return list;
    });

    const totalUsedBudgetSum = computed(() => {
      return Object.values(budgetStats.value).reduce((acc, curr) => acc + curr.usedAmount, 0);
    });

    const pendingExpensesCount = computed(() => {
      return expenses.value.filter(e => e.status === 'PENDING').length;
    });

    return {
      expenses,
      budgetStats,
      stats,
      activeAdmin,
      filterDepartment,
      filterType,
      amountSortOrder,
      selectedExpense,
      cachedReceiptUrl,
      toasts,
      formatPrice,
      getDeptName,
      selectExpense,
      handleAdminSwitch,
      triggerAmountRequestRace,
      triggerSearchRace,
      confirmApprove,
      triggerApproveModifyConflict,
      deleteExpense,
      resetSandbox,
      removeToast,
      sortedExpenses,
      totalUsedBudgetSum,
      pendingExpensesCount
    };
  }
}).mount('#app');
