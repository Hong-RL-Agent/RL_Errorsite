const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const orders = ref([]);
    const drivers = ref([]);
    const settlements = ref([]);
    const mapMarkers = ref([]); // Separate markers array for Error 3

    // Selections / Filters
    const filterStatus = ref('ALL');
    const filterRegion = ref('ALL');
    const searchQuery = ref('');
    const settlementSortOrder = ref('NONE');

    const selectedOrder = ref(null);
    const toasts = ref([]);

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadOrders();
      await loadDrivers();
      await loadSettlements();
    };

    const loadOrders = async () => {
      const res = await fetch('/api/orders');
      const data = await res.json();
      orders.value = data;
      mapMarkers.value = data; // Keep map markers in sync initially
      
      if (data.length > 0 && !selectedOrder.value) {
        selectedOrder.value = data[0];
      }
    };

    const loadDrivers = async () => {
      const res = await fetch('/api/drivers');
      const data = await res.json();
      drivers.value = data;
    };

    const loadSettlements = async () => {
      const res = await fetch('/api/settlements');
      const data = await res.json();
      settlements.value = data;
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

    const selectOrder = (order) => {
      selectedOrder.value = order;
      showToast(`주문 [${order.id}] 관제를 활성화합니다.`, 'info');
    };

    // Driver Assign Race (Error 1 Trigger)
    const triggerDriverAssignRace = (order) => {
      showToast(`기사 A(김라이더, 3초 지연) ➔ 기사 B(박배달, 0.1초 완료) 연속 배정을 보냅니다.`, 'info');

      // 1. PATCH Driver A (DR-01, 3.0s delay)
      fetch(`/api/orders/${order.id}/driver`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: 'DR-01' })
      });

      // 2. PATCH Driver B (DR-02, 0.1s delay)
      setTimeout(() => {
        fetch(`/api/orders/${order.id}/driver`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ driverId: 'DR-02' })
        });
      }, 100);

      // Optimistic view
      order.driverId = 'DR-02';
      order.status = 'DELIVERING';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('배차 지연 저장 완료 (화면엔 B 기사였으나 3초 뒤 A 배정이 덮어써 최종 A 기사로 롤백됨)', 'warning');
        await loadAll();
      }, 4500);
    };

    // Complete order delivery
    const completeDelivery = async (id) => {
      const res = await fetch(`/api/orders/${id}/complete`, { method: 'POST' });
      if (res.ok) {
        showToast(`주문 [${id}] 배달 완료가 확정되었습니다.`, 'success');
        await loadAll();
      }
    };

    // Cancel order delivery
    const cancelDelivery = async (id) => {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        showToast(`주문 [${id}] 배달 건이 취소 처리되었습니다.`, 'success');
        await loadAll();
      }
    };

    // Address edit & Cancel Order Conflict (Error 4 Trigger)
    const triggerAddressCancelConflict = (order) => {
      showToast(`주소지 변경 수정과 배달 강제 취소 처리를 동시에 요청합니다.`, 'info');

      // 1. PATCH address (4.0s delay)
      fetch(`/api/orders/${order.id}/address`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: order.address })
      });

      // 2. POST cancel (0.5s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/orders/${order.id}/cancel`, { method: 'POST' });
        if (res.ok) {
          showToast('배달 강제 취소 접수 성공 (0.5초 완료)', 'success');
          await loadAll();
        }
      }, 100);

      // Optimistic cancel
      order.status = 'CANCELLED';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('주소 변경 완료 응답 도착 (취소되었던 주문 상태가 MATCHING 배차 대기로 다시 활성화 부활됨)', 'danger');
        await loadAll();
      }, 4500);
    };

    // Delete Settlement (Error 2 Trigger)
    const deleteSettlement = async (id) => {
      const res = await fetch(`/api/settlements/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('기사 배달 정산 건을 취소하였습니다. (완료 건수/실적 수치는 유지)', 'warning');
        await loadSettlements();
      }
    };

    // Confirm settlement (Error 5 Target)
    const confirmSettlement = async (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 정산 목록이 금액순 등으로 정렬된 상태에서 확정 버튼 클릭 시, 
      // 렌더링 리스트의 인덱스(index)를 그대로 원본 정산 배열(`settlements`)에 대입하여 
      // 전혀 다른 기사의 정산이 확정 처리되는 결함입니다.
      const targetSettle = settlements.value[index];
      if (!targetSettle) {
        showToast('정산 대상 라이더 정보를 대치할 수 없습니다.', 'danger');
        return;
      }

      const res = await fetch(`/api/settlements/${targetSettle.id}/confirm`, {
        method: 'PATCH'
      });

      if (res.ok) {
        showToast(`[${targetSettle.driverName}] 기사의 배달 정산이 성공적으로 확정되었습니다.`, 'success');
        await loadSettlements();
      }
    };

    // Filter status/region fast change (Error 3 Trigger)
    const triggerSearchRace = () => {
      showToast('상태 및 지역 필터링 비동기 경합을 시작합니다. (배달완료 ➔ 강남구)', 'info');

      // 1. Fetch DELIVERED (3.0s delay)
      fetch('/api/orders/search?status=DELIVERED')
        .then(res => res.json())
        .then(data => {
          orders.value = data;
          showToast('배달완료 필터 수신 완료 (3초 지연 완료)', 'warning');
        });

      // 2. Fetch 강남 (0.2s delay)
      setTimeout(() => {
        fetch('/api/orders/search?region=강남')
          .then(res => res.json())
          .then(data => {
            orders.value = data;
            // Diverge map markers to trigger count difference
            mapMarkers.value = data.slice(0, Math.max(1, data.length - 2));
            showToast('강남구 필터 수신 완료 (0.2초 완료, 마커 개수 다름)', 'info');
          });
      }, 150);
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('LocalDispatch 관제 시스템 데이터베이스가 리셋되었습니다.', 'success');
      selectedOrder.value = null;
      await loadAll();
    };

    // Computed Properties
    const sortedOrders = computed(() => {
      let list = [...orders.value];

      if (filterStatus.value !== 'ALL') {
        list = list.filter(o => o.status === filterStatus.value);
      }
      if (filterRegion.value !== 'ALL') {
        list = list.filter(o => o.region === filterRegion.value);
      }
      if (searchQuery.value) {
        list = list.filter(o => o.storeName.includes(searchQuery.value) || o.address.includes(searchQuery.value));
      }

      return list;
    });

    const mapMarkersComputed = computed(() => {
      return mapMarkers.value;
    });

    const sortedSettlements = computed(() => {
      let list = [...settlements.value];
      if (settlementSortOrder.value === 'ASC') {
        list.sort((a, b) => a.amount - b.amount);
      } else if (settlementSortOrder.value === 'DESC') {
        list.sort((a, b) => b.amount - a.amount);
      }
      return list;
    });

    const activeRidersCount = computed(() => {
      return drivers.value.filter(d => d.status === 'DELIVERING').length;
    });

    const matchingOrdersCount = computed(() => {
      return orders.value.filter(o => o.status === 'MATCHING').length;
    });

    return {
      orders,
      drivers,
      settlements,
      filterStatus,
      filterRegion,
      searchQuery,
      settlementSortOrder,
      selectedOrder,
      toasts,
      formatPrice,
      selectOrder,
      triggerDriverAssignRace,
      completeDelivery,
      cancelDelivery,
      triggerAddressCancelConflict,
      deleteSettlement,
      confirmSettlement,
      triggerSearchRace,
      resetSandbox,
      removeToast,
      sortedOrders,
      mapMarkersComputed,
      sortedSettlements,
      activeRidersCount,
      matchingOrdersCount
    };
  }
}).mount('#app');
