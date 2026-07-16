const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const inventory = ref([]);
    const orders = ref([]);
    const receivings = ref([]);
    const suppliers = ref([]);
    const stats = ref({ monthlyTotalCost: 0, supplierVolume: {} });

    // Selections
    const activeStore = ref('직영 A점');
    const selectedCategory = ref('ALL');
    const searchQuery = ref('');
    const selectedItem = ref(null);
    const currentRole = ref('STAFF');

    const sortByExpiry = ref(false);

    // Stale Session Cache (Error 5 Target)
    const cachedLowStockAlerts = ref(['대관령 감자 (재고 임박)', '한우 등심 (재고 임박)']);
    const cachedOrderTotal = ref(620000);

    const toasts = ref([]);

    // Forms/Inputs
    const expiryInput = ref('');
    const orderItemId = ref('');
    const orderQty = ref('');
    const orderQtyInputs = ref({});
    const wasteTargetIndex = ref(null);
    const wasteQtyInput = ref('');
    const showWasteModal = ref(false);

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadInventory();
      await loadOrders();
      await loadReceivings();
      await loadSuppliers();
      await loadStats();
    };

    const loadInventory = async () => {
      const res = await fetch('/api/inventory');
      const data = await res.json();
      inventory.value = data;
      if (data.length > 0 && !selectedItem.value) {
        selectedItem.value = data[0];
        expiryInput.value = data[0].exp;
      }
    };

    const loadOrders = async () => {
      const res = await fetch('/api/orders');
      const data = await res.json();
      orders.value = data;
    };

    const loadReceivings = async () => {
      const res = await fetch('/api/receivings');
      const data = await res.json();
      receivings.value = data;
    };

    const loadSuppliers = async () => {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      suppliers.value = data;
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

    // Store Switcher (Error 5 Target)
    const handleStoreSwitch = (storeName) => {
      activeStore.value = storeName;
      showToast(`[${storeName}] 지점 재고 테이블을 활성화합니다.`, 'info');
      
      // Update inventory but do NOT sync/clear cached alerts and orders total
      loadInventory();

      // INTENTIONAL_ERROR
      // CATEGORY: Session + Cache
      // DESCRIPTION: 매장 지점(A/B)을 전환할 때 재고 목록은 정상적으로 B로 갱신되지만, 
      // 부족 재고 알림 및 발주 대기 총액 캐시 변수(`cachedLowStockAlerts`, `cachedOrderTotal`)를 
      // 비우지 않아 화면 우측 요약 카트에 이전 지점 A의 실적 데이터가 노출되는 결함입니다.
      // Bypasses syncStoreCache()!
    };

    const syncStoreCache = () => {
      if (activeStore.value === '직영 A점') {
        cachedLowStockAlerts.value = ['대관령 감자 (재고 임박)', '한우 등심 (재고 임박)'];
        cachedOrderTotal.value = 620000;
      } else {
        cachedLowStockAlerts.value = ['백설 설탕 10kg (재고 임박)'];
        cachedOrderTotal.value = 180000;
      }
      showToast('지점 캐시 정보가 최신 상태로 강제 동기화되었습니다.', 'success');
    };

    // Sorted list computed
    const sortedInventory = computed(() => {
      let list = [...inventory.value];
      
      if (selectedCategory.value !== 'ALL') {
        list = list.filter(i => i.category === selectedCategory.value);
      }
      if (searchQuery.value) {
        list = list.filter(i => i.name.includes(searchQuery.value));
      }

      if (sortByExpiry.value) {
        return list.sort((a, b) => new Date(a.exp) - new Date(b.exp));
      }
      return list;
    });

    const pendingOrders = computed(() => {
      return orders.value.filter(o => o.status === 'PENDING' || o.status === 'APPROVED');
    });

    // Expiry update
    const updateExpiry = async () => {
      if (!selectedItem.value) return;
      const res = await fetch(`/api/inventory/${selectedItem.value.id}/expiry`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exp: expiryInput.value })
      });
      if (res.ok) {
        showToast(`[${selectedItem.value.name}] 유통기한 변경 완료`, 'success');
        await loadInventory();
      }
    };

    // Waste popups (Error 2 Trigger)
    const triggerWastePopup = (idx) => {
      wasteTargetIndex.value = idx;
      wasteQtyInput.value = '';
      showWasteModal.value = true;
    };

    const confirmWaste = async () => {
      if (wasteTargetIndex.value === null || !wasteQtyInput.value) return;

      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 재고 목록을 유통기한순으로 정렬한 뒤, 화면 렌더링 루프의 
      // 인덱스(`index`)를 그대로 받아 원본 배열(`inventory`)에 직접 대입하여 재고를 차감합니다. 
      // 이로 인해 엉뚱한 품목의 재고가 감소하는 인덱스 매핑 결함이 발생합니다.
      const res = await fetch('/api/inventory/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: wasteTargetIndex.value, // Passes the sorted view index directly!
          wasteQty: wasteQtyInput.value
        })
      });

      if (res.ok) {
        showToast('식자재 폐기 처리가 완료되었습니다.', 'success');
        showWasteModal.value = false;
        await loadInventory();
      }
    };

    // Create purchase order
    const createOrder = async () => {
      if (!orderItemId.value || !orderQty.value) return;
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: orderItemId.value, quantity: orderQty.value })
      });
      if (res.ok) {
        showToast('발주서 생성 성공', 'success');
        orderItemId.value = '';
        orderQty.value = '';
        await loadOrders();
      }
    };

    // Order Quantity Edit + Approve Race (Error 1 Trigger)
    const triggerQuantityApprovalRace = (ord, targetQty) => {
      showToast(`발주 번호 ${ord.id}의 수량을 ${targetQty}로 수정 후 즉시 승인합니다.`, 'info');

      // 1. PATCH qty (4s delay)
      fetch(`/api/orders/${ord.id}/quantity`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: targetQty })
      });

      // 2. POST approve (1s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/orders/${ord.id}/approve`, { method: 'POST' });
        if (res.ok) {
          showToast('발주 승인 성공 (1초 지연 완료)', 'success');
          
          // Trigger automatic receiving for convenience
          await fetch('/api/receivings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: ord.id })
          });
          showToast('해당 발주 건 자동 입고 처리 완료', 'success');
          
          await loadAll();
        }
      }, 100);

      // Optimistic update
      orders.value = orders.value.map(o => o.id === ord.id ? { ...o, quantity: targetQty, status: 'APPROVED' } : o);

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('발주 수량 지연 수정 반영 완료 (입고 승인 예정량은 이전 수량 기준)', 'warning');
        await loadAll();
      }, 4500);
    };

    // Approve order with permission role checks (Error 6 Trigger)
    const handleApproveWithRole = async (ord) => {
      showToast(`[${currentRole.value}] 등급으로 발주서 승인을 요청합니다.`, 'info');
      const res = await fetch(`/api/orders/${ord.id}/approve-role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: currentRole.value })
      });

      if (!res.ok) {
        showToast('HTTP 403: 부서 관리자 승인 권한이 필요하여 요청이 거부되었습니다.', 'danger');
      } else {
        showToast('발주 승인이 정상 수신 완료되었습니다.', 'success');
      }
      
      // Auto receiving
      await fetch('/api/receivings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: ord.id })
      });

      await loadAll();
    };

    // Cancel Receiving (Error 3 Trigger)
    const cancelReceiving = async (recId) => {
      const res = await fetch(`/api/receivings/${recId}/cancel`, { method: 'POST' });
      if (res.ok) {
        showToast('입고 승인 건을 성공적으로 취소 환원했습니다.', 'success');
        await loadAll();
      }
    };

    // Search query race (Error 4 Trigger)
    const triggerSearchRace = () => {
      showToast('식자재 고속 검색 비동기 경합을 시작합니다. (대파 ➔ 마늘)', 'info');

      // 1. Fetch 대파 (3s delay)
      fetch('/api/inventory/search?q=대파')
        .then(res => res.json())
        .then(data => {
          inventory.value = data;
          showToast('검색 결과 수신: 대파 (3초 지연 오버라이트)', 'warning');
        });

      // 2. Fetch 마늘 (0.2s delay)
      setTimeout(() => {
        fetch('/api/inventory/search?q=마늘')
          .then(res => res.json())
          .then(data => {
            inventory.value = data;
            showToast('검색 결과 수신: 마늘 (0.2초)', 'info');
          });
      }, 150);
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('KitchenStock 시스템 데이터베이스가 리셋되었습니다.', 'success');
      selectedItem.value = null;
      await loadAll();
    };

    return {
      inventory,
      orders,
      receivings,
      suppliers,
      stats,
      activeStore,
      selectedCategory,
      searchQuery,
      selectedItem,
      currentRole,
      sortByExpiry,
      cachedLowStockAlerts,
      cachedOrderTotal,
      toasts,
      expiryInput,
      orderItemId,
      orderQty,
      orderQtyInputs,
      wasteTargetIndex,
      wasteQtyInput,
      showWasteModal,
      formatPrice,
      handleStoreSwitch,
      syncStoreCache,
      sortedInventory,
      pendingOrders,
      updateExpiry,
      triggerWastePopup,
      confirmWaste,
      createOrder,
      triggerQuantityApprovalRace,
      handleApproveWithRole,
      cancelReceiving,
      triggerSearchRace,
      resetSandbox,
      removeToast
    };
  }
}).mount('#app');
