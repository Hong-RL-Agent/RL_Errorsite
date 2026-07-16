const { createApp, ref, computed, onMounted } = Vue;

createApp({
  setup() {
    const products = ref([]);
    const orders = ref([]);
    const sellerStats = ref({});

    // Selections / Filters
    const activeSeller = ref('A');
    const stockSortOrder = ref('NONE');
    const filterOrderStatus = ref('ALL');
    const orderSearchQuery = ref('');

    const selectedProduct = ref(null);
    const selectedOrder = ref(null);
    const toasts = ref([]);

    // Stale discount rate cache for Error 1
    let previousDiscountRateCache = 0;

    // Session cache (Error 6 Target)
    const cachedUnsettledAmount = ref(1850000);
    const cachedPendingInquiries = ref(14);
    const totalSalesCount = ref(185);

    onMounted(() => {
      loadAll();
    });

    const loadAll = async () => {
      await loadProducts();
      await loadOrders();
      await loadStats();
    };

    const loadProducts = async () => {
      const res = await fetch('/api/products');
      const data = await res.json();
      products.value = data;

      if (data.length > 0 && !selectedProduct.value) {
        selectedProduct.value = data[0];
        previousDiscountRateCache = data[0].discountRate;
      }
    };

    const loadOrders = async () => {
      const res = await fetch('/api/orders');
      const data = await res.json();
      orders.value = data;

      if (data.length > 0 && !selectedOrder.value) {
        selectedOrder.value = data[0];
      }
    };

    const loadStats = async () => {
      const res = await fetch('/api/orders'); // Simple mock load
      // Total count based on active seller
      if (activeSeller.value === 'A') {
        totalSalesCount.value = 185;
      } else {
        totalSalesCount.value = 42;
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

    const formatPrice = (val) => {
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(val);
    };

    // Seller account switch (Error 6 Target)
    const handleSellerSwitch = (sellerId) => {
      activeSeller.value = sellerId;
      showToast(`판매자 계정 [${sellerId}] 파트너 어드민을 전환합니다.`, 'info');

      // Update listings
      loadProducts();

      // INTENTIONAL_ERROR
      // CATEGORY: Session
      // DESCRIPTION: 판매자 계정을 A에서 B로 전환할 시 상품 목록은 정상 교환되지만, 
      // 상단 어드민 대금 수치 캐시(`cachedUnsettledAmount`, `cachedPendingInquiries`)를 
      // 갱신 호출하지 않고 이전 계정 A의 캐시 정보를 그대로 누수 노출하는 결함입니다.
      if (sellerId === 'A') {
        totalSalesCount.value = 185;
      } else {
        totalSalesCount.value = 42; // Sales count updates, but others are left unchanged!
      }
    };

    // Price Update & Discount Rate race (Error 1 Trigger)
    const triggerPriceDiscountRace = (product) => {
      showToast(`상품 정가 및 특별 할인율 변경 조정을 서버에 순차 전송합니다.`, 'info');

      // 1. PATCH Price (3.0s delay) - sends old discountRate
      fetch(`/api/products/${product.id}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: product.price,
          discountRate: previousDiscountRateCache // Sends stale discountRate cache!
        })
      });

      // 2. PATCH Discount Rate (0.1s delay)
      setTimeout(() => {
        fetch(`/api/products/${product.id}/discount`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ discountRate: product.discountRate })
        });
      }, 100);

      // Optimistic cache update
      previousDiscountRateCache = product.discountRate;

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('가격 저장 처리 완료 (가격은 수정되었으나 지연 처리 완료로 할인율이 이전 값으로 회구 롤백됨)', 'warning');
        await loadProducts();
      }, 4500);
    };

    // Option stock change (Error 3 Target)
    const confirmStockChange = async (index) => {
      // INTENTIONAL_ERROR
      // CATEGORY: Frontend
      // DESCRIPTION: 재고순으로 정렬된 상태에서 수정 버튼 클릭 시, 
      // 화면 리스트의 인덱스(index)를 원본 상품 배열(`products`)에 그대로 대입해 
      // 엉뚱한 상품의 재고가 수정 등록되게 만드는 결함입니다.
      const targetProd = products.value[index];
      if (!targetProd) {
        showToast('상품 인덱스 바인딩을 확인할 수 없습니다.', 'danger');
        return;
      }

      const res = await fetch(`/api/products/${targetProd.id}/stock`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: targetProd.stock })
      });

      if (res.ok) {
        showToast(`[${targetProd.name}] 상품의 가용재고가 수정되었습니다. (인덱스 불일치 오등록 가능)`, 'warning');
        await loadProducts();
      }
    };

    // Delete Product (Error 4 Target)
    const deleteProduct = async (id) => {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('상품을 카탈로그에서 삭제하였습니다. (대시보드 총 판매 실적에는 여전히 수치가 포함됨)', 'warning');
        await loadProducts();
      }
    };

    // Ship order & Cancel order Conflict (Error 2 Trigger)
    const triggerShipCancelConflict = (order) => {
      showToast(`배송 물류 출고와 해당 주문의 취소 승인을 동시 요청 처리합니다.`, 'info');

      // 1. POST ship (4.0s delay)
      fetch(`/api/orders/${order.id}/ship`, { method: 'POST' });

      // 2. POST cancel (0.5s delay)
      setTimeout(async () => {
        const res = await fetch(`/api/orders/${order.id}/cancel`, { method: 'POST' });
        if (res.ok) {
          showToast('주문 결제 취소 완료 (0.5초 완료)', 'success');
          await loadOrders();
        }
      }, 100);

      // Optimistic cancel
      order.status = 'CANCELLED';

      // Refresh after 4.5s
      setTimeout(async () => {
        showToast('배송 출발 응답 완료 (취소 처리가 종료된 계약서의 최종 주문 상태가 SHIPPING 배송중으로 복구 회귀함)', 'danger');
        await loadOrders();
      }, 4500);
    };

    const cancelOrder = async (id) => {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        showToast('주문 취소 승인이 적용되었습니다.', 'success');
        await loadOrders();
      }
    };

    // Order status filter search race (Error 5 Trigger)
    const triggerOrderSearchRace = () => {
      showToast('주문 상태 조회 비동기 경합을 시작합니다. (주문취소 ➔ 배송중)', 'info');

      // 1. Fetch CANCELLED (3.0s delay)
      fetch('/api/orders/search?status=CANCELLED')
        .then(res => res.json())
        .then(data => {
          orders.value = data;
          showToast('주문취소 필터 완료 (3초 지연 완료)', 'warning');
        });

      // 2. Fetch SHIPPING (0.2s delay)
      setTimeout(() => {
        fetch('/api/orders/search?status=SHIPPING')
          .then(res => res.json())
          .then(data => {
            orders.value = data;
            showToast('배송중 필터 완료 (0.2초 완료)', 'info');
          });
      }, 150);
    };

    const resetSandbox = async () => {
      await fetch('/api/reset', { method: 'POST' });
      showToast('SellerHub 파트너 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
      selectedProduct.value = null;
      selectedOrder.value = null;
      await loadAll();
    };

    // Computed Sort properties
    const sortedProducts = computed(() => {
      let list = [...products.value];
      if (stockSortOrder.value === 'ASC') {
        list.sort((a, b) => a.stock - b.stock);
      } else if (stockSortOrder.value === 'DESC') {
        list.sort((a, b) => b.stock - a.stock);
      }
      return list;
    });

    return {
      products,
      orders,
      activeSeller,
      stockSortOrder,
      filterOrderStatus,
      orderSearchQuery,
      selectedProduct,
      selectedOrder,
      cachedUnsettledAmount,
      cachedPendingInquiries,
      totalSalesCount,
      toasts,
      formatPrice,
      handleSellerSwitch,
      triggerPriceDiscountRace,
      confirmStockChange,
      deleteProduct,
      triggerShipCancelConflict,
      cancelOrder,
      triggerOrderSearchRace,
      resetSandbox,
      removeToast,
      sortedProducts
    };
  }
}).mount('#app');
