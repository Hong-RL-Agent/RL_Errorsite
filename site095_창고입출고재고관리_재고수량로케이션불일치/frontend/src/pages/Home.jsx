import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import ProductEditModal from '../components/ProductEditModal.jsx';
import {
  fetchAdmins,
  fetchProducts,
  fetchLocations,
  fetchInboundLogs,
  fetchOutboundLogs,
  fetchActivityLogs,
  searchProductsApi,
  patchProductLocationApi,
  patchProductStockApi,
  cancelOutboundApi,
  confirmInboundApi,
  updateStockQuantityApi,
  patchProductPartialApi,
  deleteLogApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [admins, setAdmins] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [inboundLogs, setInboundLogs] = useState([]);
  const [outboundLogs, setOutboundLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-101');
  const [filterZone, setFilterZone] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NONE');

  const [selectedProductIndex, setSelectedProductIndex] = useState(0);
  const [selectedProductForModal, setSelectedProductForModal] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Session stats cache (Error 6 Target)
  const [cachedLowStockCount, setCachedLowStockCount] = useState(8);
  const [cachedRecentProduct, setCachedRecentProduct] = useState('PRD-1001 (3D 프린터 필라멘트 / LOC-A01)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadAdmins();
    await loadProducts();
    await loadLocations();
    await loadInboundLogs();
    await loadOutboundLogs();
    await loadActivityLogs();
  };

  const loadAdmins = async () => {
    const data = await fetchAdmins();
    setAdmins(data);
  };

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  const loadLocations = async () => {
    const data = await fetchLocations();
    setLocations(data);
  };

  const loadInboundLogs = async () => {
    const data = await fetchInboundLogs();
    setInboundLogs(data);
  };

  const loadOutboundLogs = async () => {
    const data = await fetchOutboundLogs();
    setOutboundLogs(data);
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

  // Staff Session Switch (Error 6 Target)
  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 창고 작업자를 [${staffId}] 권한으로 변경합니다.`, 'info');
    loadProducts();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 직원 A가 재고 상세를 본 뒤 직원 B로 로그인하면 상품 목록은 B 권한 기준으로 바뀌지만, 
    // 상단 안전재고 미달 품목 건수(cachedLowStockCount) 및 최근 실사 작업 상품 요약 캐시(cachedRecentProduct)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Location & Stock update race condition (Error 1 Trigger)
  const triggerLocationStockRace = (prd) => {
    showToast('로케이션 이동(3초 지연)과 재고 수량 수정(0.1초)을 순차 처리합니다.', 'info');

    // 1. Stock update (0.1s done)
    patchProductStockApi(prd.id, prd.stock);

    // 2. Location update (3.0s delay with DB snapshot)
    setTimeout(() => {
      patchProductLocationApi(prd.id, prd.location, prd.zone);
    }, 100);

    setTimeout(async () => {
      showToast('로케이션 이동 완료 (로케이션은 갱신되었으나 3초 전 구 스냅샷 덮어쓰기로 이전 로케이션과 새 수량 조합이 롤백 저장됨)', 'warning');
      await loadProducts();
    }, 4500);
  };

  // Zone search race condition (Error 5 Trigger)
  const triggerSearchRace = (zone, category) => {
    showToast(`창고 구역 상품 목록을 조회합니다: [${zone} / ${category}]`, 'info');

    if (zone === 'A구역') {
      searchProductsApi('A구역', category).then(data => {
        setProducts(data);
        showToast('A구역 상품 목록 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (zone === 'B구역') {
      searchProductsApi('B구역', category).then(data => {
        setProducts(data);
        showToast('B구역 상품 목록 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchProductsApi(zone, category).then(data => {
        setProducts(data);
      });
    }
  };

  // Sort Open Detail Index Mismatch (Error 3 Target)
  const openDetailMismatch = (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 상품 목록을 재고부족순/단가순으로 정렬한 뒤 상세보기 버튼을 누르면 
    // 사용자가 클릭한 상품이 아니라 정렬 전 원본 배열의 같은 index 상품 상세가 열리는 결함입니다.
    setSelectedProductIndex(index);
    const clickedPrd = sortedProducts[index];
    if (clickedPrd) {
      showToast(`[${clickedPrd.name}] 상세보기 알림 (우측 관제 패널에는 인덱스 불일치 상품의 로케이션/수량이 표시됨)`, 'warning');
    }
  };

  // Cancel Outbound & Confirm Inbound Conflict (Error 2 Trigger)
  const testCancelOutbound = (outboundId, inboundId) => {
    showToast('출고 취소 처리와 입고 확정을 연쇄 진행합니다.', 'info');

    // 1. Cancel Outbound (0.5s done, restores stock once)
    cancelOutboundApi(outboundId);

    // 2. Confirm Inbound (4.0s delay with double add)
    setTimeout(async () => {
      await confirmInboundApi(inboundId);
      showToast('출고 취소 응답 완료 (0.5초 완료)', 'warning');
      await loadProducts();
      await loadOutboundLogs();
    }, 100);

    setTimeout(async () => {
      showToast('입고 확정 응답 완료 (4초 지연 완료: 재고 수량을 DB에 한 번 더 중복 합산하여 증가시킴)', 'danger');
      await loadProducts();
      await loadInboundLogs();
    }, 4500);
  };

  // Partial Product Save (Error 8 Trigger)
  const triggerPartialProductSave = async (id, name, safetyStock, zone) => {
    await patchProductPartialApi(id, name, safetyStock, zone);
    // INTENTIONAL_ERROR
    // CATEGORY: 부분 저장 오류
    // DESCRIPTION: 상품 정보 수정 모달에서 상품명, 안전재고, 보관구역을 동시에 수정하면 백엔드는 상품명과 안전재고만 저장하고 
    // 보관구역은 이전 값을 유지하지만, 프론트엔드는 세 항목 모두 수정 성공한 것처럼 토스트 알림을 띄우는 결함입니다.
    showToast('상품명, 안전재고, 보관구역이 성공적으로 저장되었습니다.', 'success');
    await loadProducts();
  };

  // Delete Log (Error 4 Target)
  const deleteLog = async (id) => {
    const data = await deleteLogApi(id);
    if (data.success) {
      showToast('활동 감사 로그를 삭제했습니다. (월별 입출고 통계 및 안전재고 미달 배지 수치에는 계속 유지됨)', 'warning');
      await loadActivityLogs();
    }
  };

  // Test Unauthorized Stock Update (Error 7 Trigger)
  const testUnauthorizedStockUpdate = async (id, quantity) => {
    try {
      const res = await updateStockQuantityApi(id, quantity, 'STAFF');
      if (res.error) {
        showToast(`[HTTP 403 Forbidden] 권한 오류 발생. (하지만 서버 내부활동 감사로그에는 재고 수정 성공으로 기록됨)`, 'danger');
      }
    } catch (e) {
      showToast(`[HTTP 403 Forbidden] 권한 없음 (로그에는 성공 기록)`, 'danger');
    }
  };

  const handleModalConfirm = async (productId, name, safetyStock, zone) => {
    await patchProductPartialApi(productId, name, safetyStock, zone);
    showToast(`[${productId}] 상품 정보가 성공적으로 저장되었습니다.`, 'success');
    setSelectedProductForModal(null);
    await loadProducts();
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('StockYard 창고 재고 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedProductIndex(0);
    await loadAll();
  };

  const sortedProducts = useMemo(() => {
    let list = [...products];
    if (filterZone !== 'ALL') {
      list = list.filter(p => p.zone === filterZone);
    }
    if (sortOrder === 'STOCK_LOW') {
      list.sort((a, b) => a.stock - b.stock);
    } else if (sortOrder === 'PRICE_HIGH') {
      list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [products, filterZone, sortOrder]);

  // Selected Product for RightPanel (Error 3 Effect)
  const selectedProductForPanel = useMemo(() => {
    if (sortOrder === 'NONE') {
      return sortedProducts[selectedProductIndex] || products[0];
    } else {
      // INTENTIONAL_ERROR: Index Mismatch! Uses index of sorted list on raw unsorted products array
      return products[selectedProductIndex] || products[0];
    }
  }, [sortedProducts, products, selectedProductIndex, sortOrder]);

  return (
    <div id="app">
      <Header
        activeStaff={activeStaff}
        handleStaffSwitch={handleStaffSwitch}
        cachedLowStockCount={cachedLowStockCount}
        cachedRecentProduct={cachedRecentProduct}
        resetSandbox={resetSandbox}
      />

      <div className="stockyard-grid">
        <Sidebar
          filterZone={filterZone}
          setFilterZone={setFilterZone}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          products={sortedProducts}
          selectedProductIndex={selectedProductIndex}
          setSelectedProductIndex={setSelectedProductIndex}
          openDetailMismatch={openDetailMismatch}
        />

        <CenterSection
          locations={locations}
          inboundLogs={inboundLogs}
          outboundLogs={outboundLogs}
          activityLogs={activityLogs}
          deleteLog={deleteLog}
          openProductModal={(prd) => setSelectedProductForModal(prd)}
          testCancelOutbound={testCancelOutbound}
        />

        <RightPanel
          selectedProduct={selectedProductForPanel}
          setSelectedProduct={(updated) => {
            setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
          }}
          locations={locations}
          triggerLocationStockRace={triggerLocationStockRace}
          triggerPartialProductSave={triggerPartialProductSave}
          testUnauthorizedStockUpdate={testUnauthorizedStockUpdate}
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
