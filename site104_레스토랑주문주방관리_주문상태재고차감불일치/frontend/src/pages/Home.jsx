import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import MenuEditModal from '../components/MenuEditModal.jsx';
import {
  fetchChefs,
  fetchTables,
  fetchMenus,
  fetchIngredients,
  fetchOrders,
  fetchStockLogs,
  fetchActivityLogs,
  searchOrdersApi,
  patchOrderStatusApi,
  patchOrderChefApi,
  cancelOrderApi,
  deductStockApi,
  disposeStockUnauthorizedApi,
  patchMenuPartialApi,
  deleteStockLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [chefs, setChefs] = useState([]);
  const [tables, setTables] = useState([]);
  const [menus, setMenus] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stockLogs, setStockLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeChef, setActiveChef] = useState('CHEF-3001');
  const [filterSection, setFilterSection] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedOrderIndex, setSelectedOrderIndex] = useState(0);
  const [selectedMenuForModal, setSelectedMenuForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedUnprocessedOrders, setCachedUnprocessedOrders] = useState(18);
  const [cachedRecentOrder] = useState('ORD-1001 (T-01 창가 VIP / 안심 스테이크 48,000원)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadChefs();
    await loadTables();
    await loadMenus();
    await loadIngredients();
    await loadOrders();
    await loadStockLogs();
    await loadActivityLogs();
  };

  const loadChefs = async () => {
    const data = await fetchChefs();
    setChefs(data);
  };

  const loadTables = async () => {
    const data = await fetchTables();
    setTables(data);
  };

  const loadMenus = async () => {
    const data = await fetchMenus();
    setMenus(data);
  };

  const loadIngredients = async () => {
    const data = await fetchIngredients();
    setIngredients(data);
  };

  const loadOrders = async () => {
    const data = await fetchOrders();
    setOrders(data);
  };

  const loadStockLogs = async () => {
    const data = await fetchStockLogs();
    setStockLogs(data);
  };

  const loadActivityLogs = async () => {
    const data = await fetchActivityLogs();
    setActivityLogs(data);
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

  // Chef Session Switch (Error 6 Target)
  const handleChefSwitch = (chefId) => {
    setActiveChef(chefId);
    showToast(`로그인 셰프를 [${chefId}] 권한으로 변경합니다.`, 'info');
    loadOrders();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 직원 A가 주문 상세를 본 뒤 직원 B로 로그인하면 주문 목록은 B 담당 기준으로 바뀌지만, 
    // 상단 미처리 주문 수(cachedUnprocessedOrders) 및 최근 주문 상세 캐시(cachedRecentOrder)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Status & Chef update race condition (Error 1 Trigger)
  const triggerStatusChefRace = (order) => {
    showToast('주문 상태 변경(3초 지연)과 조리 셰프 변경(0.1초)을 순차 처리합니다.', 'info');

    // 1. Chef update (0.1s done)
    patchOrderChefApi(order.id, order.chefName);

    // 2. Status update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchOrderStatusApi(order.id, order.status);
    }, 100);

    setTimeout(async () => {
      showToast('주문 상태 변경 완료 (상태는 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 셰프와 조리중 상태 조합이 롤백 저장됨)', 'warning');
      await loadOrders();
    }, 4500);
  };

  // Section search race condition (Error 5 Trigger)
  const triggerSearchRace = (tableSection, search) => {
    showToast(`테이블 구역 주문 목록을 조회합니다: [${tableSection} / ${search}]`, 'info');

    if (tableSection === '1층 메인 홀') {
      searchOrdersApi('1층 메인 홀', 'ALL', search).then(data => {
        setOrders(data);
        showToast('1층 메인 홀 주문 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (tableSection === '3층 루프탑') {
      searchOrdersApi('3층 루프탑', 'ALL', search).then(data => {
        setOrders(data);
        showToast('3층 루프탑 주문 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchOrdersApi(tableSection, 'ALL', search).then(data => {
        setOrders(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 주문 목록을 주문금액순/접수시간순으로 정렬한 뒤 상세 버튼을 누르면 
    // 사용자가 클릭한 주문이 아니라 정렬 전 원본 배열의 같은 index 주문 상세가 열리는 결함입니다.
    setSelectedOrderIndex(index);
    const clickedOrder = sortedOrders[index];
    if (clickedOrder) {
      showToast(`[${clickedOrder.id}] 주문 상세 알림 (우측 관제 패널에는 인덱스 불일치 다른 주문의 메뉴명/테이블이 표시됨)`, 'warning');
    }
  };

  // Cancel Order & Deduct Stock Conflict (Error 2 Trigger)
  const triggerCancelDeductConflict = (order) => {
    showToast('주문 취소 처리와 재고 차감을 연쇄 진행합니다.', 'info');

    // 1. Cancel Order (0.5s done, status = CANCELLED)
    cancelOrderApi(order.id);

    // 2. Deduct Stock (4.0s delay with restore to COOKED)
    setTimeout(async () => {
      await deductStockApi(order.id, '안심 소고기 (호주산)', 0.5);
      showToast('주문 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadOrders();
    }, 100);

    setTimeout(async () => {
      showToast('재고 차감 실행 응답 완료 (4초 지연 완료: 취소된 주문을 COOKED 조리완료 상태로 복원시킴)', 'danger');
      await loadOrders();
      await loadStockLogs();
    }, 4500);
  };

  // Partial Menu Save (Error 8 Trigger)
  const triggerPartialMenuSave = async (id, name, price, mainIngredient) => {
    await patchMenuPartialApi(id, name, price, mainIngredient);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 메뉴 정보 수정 모달에서 메뉴명, 가격, 대표 재료를 동시에 수정하면 백엔드는 메뉴명과 대표 재료만 저장하고 
    // 가격은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것으로 토스트 알림을 띄우는 결함입니다.
    showToast('메뉴명, 판매 가격, 대표 주재료가 성공적으로 저장되었습니다.', 'success');
    await loadMenus();
  };

  // Delete Stock Log (Error 4 Target)
  const deleteStockLog = async (id) => {
    const data = await deleteStockLogApi(id);
    if (data.success) {
      showToast('재고 차감 로그를 삭제했습니다. (메뉴별 판매량 및 일일 매출 수치에는 계속 유지됨)', 'warning');
      await loadStockLogs();
    }
  };

  // Test Unauthorized Stock Dispose (Error 7 Trigger)
  const testUnauthorizedDispose = async (id) => {
    try {
      const res = await disposeStockUnauthorizedApi(id, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 재고 폐기 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (menuId, name, price, mainIngredient) => {
    await patchMenuPartialApi(menuId, name, price, mainIngredient);
    showToast(`[${menuId}] 메뉴 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedMenuForModal(null);
    await loadMenus();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('KitchenOps POS & 주방 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedOrderIndex(0);
    await loadAll();
  };

  const sortedOrders = useMemo(() => {
    let list = [...orders];
    if (filterSection !== 'ALL') {
      list = list.filter(o => o.tableSection === filterSection);
    }
    if (searchTerm) {
      list = list.filter(o => o.menuName.includes(searchTerm) || o.id.includes(searchTerm) || o.tableNo.includes(searchTerm));
    }
    if (sortOrder === 'PRICE_DESC') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'TIME_DESC') {
      list.sort((a, b) => b.orderTime.localeCompare(a.orderTime));
    }
    return list;
  }, [orders, filterSection, searchTerm, sortOrder]);

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
        activeChef={activeChef}
        handleChefSwitch={handleChefSwitch}
        cachedUnprocessedOrders={cachedUnprocessedOrders}
        cachedRecentOrder={cachedRecentOrder}
        resetSandbox={resetSandbox}
      />

      <div className="kitchenops-grid">
        <Sidebar
          filterSection={filterSection}
          setFilterSection={setFilterSection}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          orders={sortedOrders}
          selectedOrderIndex={selectedOrderIndex}
          setSelectedOrderIndex={setSelectedOrderIndex}
          openDetailMismatch={openDetailMismatch}
          tables={tables}
        />

        <CenterSection
          orders={orders}
          menus={menus}
          ingredients={ingredients}
          stockLogs={stockLogs}
          activityLogs={activityLogs}
          deleteStockLog={deleteStockLog}
          openMenuModal={(m) => setSelectedMenuForModal(m)}
          testUnauthorizedDispose={testUnauthorizedDispose}
        />

        <RightPanel
          selectedOrder={selectedOrderForPanel}
          setSelectedOrder={(updated) => {
            setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
          }}
          chefs={chefs}
          menus={menus}
          ingredients={ingredients}
          triggerStatusChefRace={triggerStatusChefRace}
          triggerCancelDeductConflict={triggerCancelDeductConflict}
          triggerPartialMenuSave={triggerPartialMenuSave}
        />
      </div>

      <MenuEditModal
        menu={selectedMenuForModal}
        onClose={() => setSelectedMenuForModal(null)}
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
