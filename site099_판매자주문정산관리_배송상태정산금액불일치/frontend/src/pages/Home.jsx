import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import ProductEditModal from '../components/ProductEditModal.jsx';
import {
  fetchSellers,
  fetchProducts,
  fetchBuyers,
  fetchOrders,
  fetchSettlements,
  fetchDeliveryLogs,
  searchOrdersApi,
  patchOrderStatusApi,
  patchSettlementAmountApi,
  cancelOrderApi,
  registerTrackingApi,
  cancelOrderUnauthorizedApi,
  patchProductPartialApi,
  deleteSettlementApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [sellers, setSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [deliveryLogs, setDeliveryLogs] = useState([]);

  const [activeSeller, setActiveSeller] = useState('SLR-101');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedTodayOrders, setCachedTodayOrders] = useState(15);
  const [cachedSettlementAmount, setCachedSettlementAmount] = useState(2327500);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadSellers();
    await loadProducts();
    await loadBuyers();
    await loadOrders();
    await loadSettlements();
    await loadDeliveryLogs();
  };

  const loadSellers = async () => {
    const data = await fetchSellers();
    setSellers(data);
  };

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  const loadBuyers = async () => {
    const data = await fetchBuyers();
    setBuyers(data);
  };

  const loadOrders = async () => {
    const data = await fetchOrders();
    setOrders(data);
  };

  const loadSettlements = async () => {
    const data = await fetchSettlements();
    setSettlements(data);
  };

  const loadDeliveryLogs = async () => {
    const data = await fetchDeliveryLogs();
    setDeliveryLogs(data);
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Seller Session Switch (Error 6 Target)
  const handleSellerSwitch = (sellerId) => {
    setActiveSeller(sellerId);
    showToast(`로그인 판매자를 [${sellerId}] 스토어 권한으로 변경합니다.`, 'info');
    loadOrders();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 판매자 A가 주문 상세를 본 뒤 판매자 B로 로그인하면 주문 목록은 B 스토어 기준으로 바뀌지만, 
    // 상단 오늘 신규 주문 수(cachedTodayOrders) 및 정산 예정 금액 캐시(cachedSettlementAmount)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Status & Settlement Amount update race condition (Error 1 Trigger)
  const triggerStatusSettlementRace = (ord, settlementId) => {
    showToast('배송 상태 변경(3초 지연)과 정산 금액 수정(0.1초)을 순차 처리합니다.', 'info');

    // 1. Settlement amount update (0.1s done)
    patchSettlementAmountApi(settlementId || ord.id, 350000);

    // 2. Order status update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchOrderStatusApi(ord.id, ord.status);
    }, 100);

    setTimeout(async () => {
      showToast('배송 상태 변경 완료 (상태는 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 배송 상태와 새 정산액 조합이 롤백 저장됨)', 'warning');
      await loadOrders();
      await loadSettlements();
    }, 4500);
  };

  // Order search race condition (Error 5 Trigger)
  const triggerSearchRace = (status, search) => {
    showToast(`스토어 주문 목록을 조회합니다: [${status} / ${search}]`, 'info');

    if (status === 'PAID') {
      searchOrdersApi('PAID', 'ALL', search).then(data => {
        setOrders(data);
        showToast('결제완료 주문 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (status === 'PREPARING') {
      searchOrdersApi('PREPARING', 'ALL', search).then(data => {
        setOrders(data);
        showToast('상품준비 주문 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchOrdersApi(status, 'ALL', search).then(data => {
        setOrders(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 주문 목록을 결제금액순/주문일순으로 정렬한 뒤 상세 보기 버튼을 누르면 
    // 사용자가 클릭한 주문이 아니라 정렬 전 원본 배열의 같은 index 주문 상세가 열리는 결함입니다.
    setSelectedOrderIndex(index);
    const clickedOrd = sortedOrders[index];
    if (clickedOrd) {
      showToast(`[${clickedOrd.id}] 주문 상세 알림 (우측 관제 패널에는 인덱스 불일치 다른 주문의 구매자/상품이 표시됨)`, 'warning');
    }
  };

  // Cancel Order & Register Tracking Conflict (Error 2 Trigger)
  const triggerCancelTrackingConflict = (ord) => {
    showToast('주문 취소 처리와 송장 등록을 연쇄 진행합니다.', 'info');

    // 1. Cancel Order (0.5s done, status = CANCELLED)
    cancelOrderApi(ord.id);

    // 2. Register Tracking (4.0s delay with restore to SHIPPING)
    setTimeout(async () => {
      await registerTrackingApi(ord.id, `CJ-${Date.now().toString().slice(-8)}`);
      showToast('주문 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadOrders();
    }, 100);

    setTimeout(async () => {
      showToast('송장 등록 응답 완료 (4초 지연 완료: 취소된 주문을 SHIPPING 배송중 상태로 복원시킴)', 'danger');
      await loadOrders();
      await loadDeliveryLogs();
    }, 4500);
  };

  // Partial Product Save (Error 8 Trigger)
  const triggerPartialProductSave = async (id, name, price, shippingFee) => {
    await patchProductPartialApi(id, name, price, shippingFee);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 상품 정보 수정 모달에서 상품명, 판매가, 배송비를 동시에 수정하면 백엔드는 상품명과 배송비만 저장하고 
    // 판매가는 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('상품명, 판매가, 기본 배송비가 성공적으로 저장되었습니다.', 'success');
    await loadProducts();
  };

  // Delete Settlement (Error 4 Target)
  const deleteSettlement = async (id) => {
    const data = await deleteSettlementApi(id);
    if (data.success) {
      showToast('정산 내역을 삭제했습니다. (월별 정산 예정 금액 및 매출 차트 수치에는 계속 유지됨)', 'warning');
      await loadSettlements();
    }
  };

  // Test Unauthorized Order Cancel (Error 7 Trigger)
  const testUnauthorizedCancel = async (id) => {
    try {
      const res = await cancelOrderUnauthorizedApi(id, 'SLR-999');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 주문 취소 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (productId, name, price, shippingFee) => {
    await patchProductPartialApi(productId, name, price, shippingFee);
    showToast(`[${productId}] 상품 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedProductForModal(null);
    await loadProducts();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('SellerDesk 판매자 정산 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedOrderIndex(0);
    await loadAll();
  };

  const sortedOrders = useMemo(() => {
    let list = [...orders];
    if (filterStatus !== 'ALL') {
      list = list.filter(o => o.status === filterStatus);
    }
    if (searchTerm) {
      list = list.filter(o => o.productName.includes(searchTerm) || o.buyerName.includes(searchTerm) || o.id.includes(searchTerm));
    }
    if (sortOrder === 'AMOUNT_DESC') {
      list.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (sortOrder === 'DATE_DESC') {
      list.sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));
    }
    return list;
  }, [orders, filterStatus, searchTerm, sortOrder]);

  // Selected Order for RightPanel (Error 3 Effect)
  const selectedOrderForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedOrders[selectedOrderIndex] || orders[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted orders array
      return orders[selectedOrderIndex] || orders[0];
    }
  }, [sortedOrders, orders, selectedOrderIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeSeller={activeSeller}
        handleSellerSwitch={handleSellerSwitch}
        cachedTodayOrders={cachedTodayOrders}
        cachedSettlementAmount={cachedSettlementAmount}
        resetSandbox={resetSandbox}
      />

      <div className="sellerdesk-grid">
        <Sidebar
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          orders={sortedOrders}
          selectedOrderIndex={selectedOrderIndex}
          setSelectedOrderIndex={setSelectedOrderIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          orders={orders}
          settlements={settlements}
          products={products}
          buyers={buyers}
          deliveryLogs={deliveryLogs}
          deleteSettlement={deleteSettlement}
          openProductModal={(prd) => setSelectedProductForModal(prd)}
          testUnauthorizedCancel={testUnauthorizedCancel}
        />

        <RightPanel
          selectedOrder={selectedOrderForPanel}
          setSelectedOrder={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
          }}
          settlements={settlements}
          products={products}
          triggerStatusSettlementRace={triggerStatusSettlementRace}
          triggerCancelTrackingConflict={triggerCancelTrackingConflict}
          triggerPartialProductSave={triggerPartialProductSave}
        />
      </div>

      <ProductEditModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onConfirm={handleModalConfirm}
      />

      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => removeToast(t.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
