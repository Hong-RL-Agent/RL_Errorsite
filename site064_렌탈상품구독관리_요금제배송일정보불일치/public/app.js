const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const products = ref([]);
    const contracts = ref([]);
    const billingChartRecords = ref([]);

    // Selection/Filters
    const currentUser = ref('User A');
    const searchQuery = ref('');
    const priceSortOrder = ref('NONE');
    const maxPriceFilter = ref(100000);
    const activeCategory = ref('ALL');

    // Comparison List
    const comparisonList = ref([]);
    const compareAvgPriceComputed = ref(0);

    // Selected Contract Operations
    const selectedContract = ref(null);
    const exchangeProductId = ref('');

    // Session Cache (Error 4 Target)
    const cachedMonthlyBillSum = ref(73000);
    const cachedDeliveryAlertsCount = ref(2);

    // Modal state
    const showRentModal = ref(false);
    const activeModalProduct = ref(null);
    const modalPlan = ref('베이직 요금제 (3년 약정)');
    const modalDeliveryDate = ref('');

    const toasts = ref([]);

    // Stale plan cache for Error 1
    let previousPlanCache = '';

    onMounted(() => {
      loadAll();
      loadBilling('second_half');
    });

    const loadAll = async () => {
      await loadProducts();
      await loadContracts();
    };

    const loadProducts = async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      products.value = data;
    };

    const loadContracts = async () => {
      const res = await fetch('/api/contracts');
      const data = await res.json();
      contracts.value = data;
      
      const userList = data.filter(c => c.user === currentUser.value);
      if (userList.length > 0 && !selectedContract.value) {
        selectedContract.value = userList[0];
        previousPlanCache = userList[0].plan;
      }
    };

    const loadBilling = async (period) => {
      const res = await fetch(`/api/billing?period=${period}`);
      const data = await res.json();
      billingChartRecords.value = data;
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

    // User Switcher (Error 4 Target)
    const handleUserSwitch = (userName) => {
      currentUser.value = userName;
      showToast(`[${userName}] 계정으로 변경 전환 로그인합니다.`, 'info');
      
      // Update contracts view
      loadContracts();

      // INTENTIONAL_ERROR
      // CATEGORY: Session + Cache
      // DESCRIPTION: 사용자 계정 전환(A ➔ B) 시 계약 목록 목록은 B 기준 정상 교체되나, 
      // 월 청구 합계 및 배송 알림 카운트 캐시(`cachedMonthlyBillSum`, `cachedDeliveryAlertsCount`)를 
      // 갱신 비우지 않고 이전 A 사용자의 통계 수치 그대로 화면에 잔존 유출하는 결함입니다.
      // Bypasses updates of stats!
    };

    // Add product to compare list
    const addToComparison = (prod) => {
      if (comparisonList.value.some(item => item.id === prod.id)) {
        showToast('이미 비교함에 들어있는 상품입니다.', 'warning');
        return;
      }
      comparisonList.value.push(prod);
      updateCompareAveragePrice();
      showToast(`${prod.name} 상품을 비교함에 담았습니다.`, 'success');
    };

    // Remove from compare list (Error 3 Target)
    const removeFromComparison = (index) => {
      const removedItem = comparisonList.value[index];
      comparisonList.value.splice(index, 1);

      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 상품 목록이 가격순 등으로 정렬된 상태에서 비교함 제거(splice) 시, 
      // 평균가 계산용 배열에서는 렌더링 리스트의 엉뚱한 인덱스를 제거해 
      // 실제 화면에 남은 상품과 계산된 평균가에 불일치 오차가 생기는 결함입니다.
      const calcList = [...comparisonList.value];
      if (priceSortOrder.value !== 'NONE' && calcList.length > 0) {
        // Deliberately deletes wrong index in internal calculation array
        calcList.splice((index + 1) % calcList.length, 1);
      }
      
      const sum = calcList.reduce((acc, cur) => acc + cur.price, 0);
      compareAvgPriceComputed.value = sum / (calcList.length || 1);

      showToast('비교 항목을 제외시켰습니다. (평균 가격은 타 품목 영향으로 오계산됨)', 'warning');
    };

    const updateCompareAveragePrice = () => {
      if (comparisonList.value.length === 0) {
        compareAvgPriceComputed.value = 0;
        return;
      }
      const sum = comparisonList.value.reduce((acc, cur) => acc + cur.price, 0);
      compareAvgPriceComputed.value = sum / comparisonList.value.length;
    };

    // Plan Modify & Delivery Date Change Race (Error 1 Trigger)
    const triggerPlanDeliveryRace = (contract) => {
      showToast(`요금제 변경과 배송 일정 [${contract.deliveryDate}] 조정을 연속 요청합니다.`, 'info');

      // 1. PATCH plan (0.1s delay)
      fetch(`/api/contracts/${contract.id}/plan`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: contract.plan })
      });

      // 2. PATCH delivery date (3.0s delay) - sends old plan cache
      setTimeout(async () => {
        const res = await fetch(`/api/contracts/${contract.id}/delivery`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deliveryDate: contract.deliveryDate,
            plan: previousPlanCache // Overwrites with stale cache plan!
          })
        });
        if (res.ok) {
          showToast('배송 일정 저장 완료 (3초 지연 완료)', 'success');
          await loadContracts();
        }
      }, 100);

      // Optimistic cache update
      previousPlanCache = contract.plan;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('지연 처리 완료 (배송 일자는 저장되었지만 요금제 구성은 변경 전 이전 약정 상태로 롤백됨)', 'warning');
        await loadContracts();
      }, 4500);
    };

    // Exchange & Terminate Conflict (Error 2 Trigger)
    const triggerExchangeTerminateConflict = (contract) => {
      if (!exchangeProductId.value) return;
      const targetProd = products.value.find(p => p.id === exchangeProductId.value);
      if (!targetProd) return;

      showToast(`[${targetProd.name}] 교체 신청과 동시에 계약 해지(Terminate)를 접수합니다.`, 'info');

      // 1. POST exchange (4s delay)
      fetch(`/api/contracts/${contract.id}/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newProductId: targetProd.id,
          newProductName: targetProd.name
        })
      });

      // 2. POST terminate (0.5s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/contracts/${contract.id}/terminate`, { method: 'POST' });
        if (res.ok) {
          showToast('계약 해지 승인 완료 (0.5초 완료)', 'success');
          await loadContracts();
        }
      }, 100);

      // Optimistic state
      contract.status = 'TERMINATED';
      exchangeProductId.value = '';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('교체 요청 처리 완료 (해지되었던 계약이 EXCHANGING 진행 중 상태로 무단 재활성화됨)', 'danger');
        await loadContracts();
      }, 4500);
    };

    const terminateContract = async (id) => {
      const res = await fetch(`/api/contracts/${id}/terminate`, { method: 'POST' });
      if (res.ok) {
        showToast('렌탈 계약 해지 조작이 즉시 완료되었습니다.', 'success');
        await loadContracts();
      }
    };

    // Billing Period Race (Error 5 Trigger)
    const triggerBillingPeriodRace = () => {
      showToast('청구 기간 통계 조회 비동기 경합을 시작합니다. (전반기 ➔ 후반기)', 'info');

      // 1. Fetch first_half (3s delay)
      fetch('/api/billing?period=first_half')
        .then(res => res.json())
        .then(data => {
          billingChartRecords.value = data;
          showToast('전반기(1~6월) 데이터 조회 완료 (3초 지연 오버라이트)', 'warning');
        });

      // 2. Fetch second_half (0.2s delay)
      setTimeout(() => {
        fetch('/api/billing?period=second_half')
          .then(res => res.json())
          .then(data => {
            billingChartRecords.value = data;
            showToast('후반기(7~12월) 데이터 조회 완료 (0.2초)', 'info');
          });
      }, 150);
    };

    // Create New Contract Apply
    const openRentModal = (prod) => {
      activeModalProduct.value = prod;
      modalDeliveryDate.value = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]; // T+3 days
      showRentModal.value = true;
    };

    const submitRentApplication = async () => {
      if (!activeModalProduct.value) return;
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeModalProduct.value.id,
          user: currentUser.value,
          plan: modalPlan.value,
          deliveryDate: modalDeliveryDate.value
        })
      });

      if (res.ok) {
        showToast('신규 렌탈 가입 신청이 접수되었습니다. (배송 대기)', 'success');
        showRentModal.value = false;
        await loadContracts();
      }
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('RentCircle 시스템 계약 데이터베이스가 리셋되었습니다.', 'success');
      selectedContract.value = null;
      comparisonList.value = [];
      compareAvgPriceComputed.value = 0;
      await loadAll();
    };

    // Sorted products list computed
    const sortedProducts = computed(() => {
      let list = [...products.value];

      if (activeCategory.value !== 'ALL') {
        list = list.filter(p => p.category === activeCategory.value);
      }
      if (searchQuery.value) {
        list = list.filter(p => p.name.includes(searchQuery.value) || p.brand.includes(searchQuery.value));
      }
      if (maxPriceFilter.value) {
        list = list.filter(p => p.price <= maxPriceFilter.value);
      }

      if (priceSortOrder.value === 'ASC') {
        list.sort((a, b) => a.price - b.price);
      } else if (priceSortOrder.value === 'DESC') {
        list.sort((a, b) => b.price - a.price);
      }

      return list;
    });

    const userContracts = computed(() => {
      return contracts.value.filter(c => c.user === currentUser.value);
    });

    return {
      products,
      contracts,
      billingChartRecords,
      currentUser,
      searchQuery,
      priceSortOrder,
      maxPriceFilter,
      activeCategory,
      comparisonList,
      compareAvgPriceComputed,
      selectedContract,
      exchangeProductId,
      cachedMonthlyBillSum,
      cachedDeliveryAlertsCount,
      showRentModal,
      activeModalProduct,
      modalPlan,
      modalDeliveryDate,
      toasts,
      formatPrice,
      handleUserSwitch,
      addToComparison,
      removeFromComparison,
      triggerPlanDeliveryRace,
      triggerExchangeTerminateConflict,
      terminateContract,
      triggerBillingPeriodRace,
      openRentModal,
      submitRentApplication,
      resetSandbox,
      removeToast,
      sortedProducts,
      userContracts
    };
  }
}).mount('#app');
