import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchStaffs, fetchStores, fetchProducts, fetchDiscountLogs, fetchDisposalLogs, fetchActivityLogs,
  searchProductsApi, patchProductDiscountRateApi, patchProductStatusApi,
  cancelDisposalApi, completeSoldOutApi, confirmDisposalUnauthorizedApi,
  patchProductPartialApi, deleteDisposalLogApi, resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [staffs, setStaffs] = useState([]);
  const [stores, setStores] = useState([]);
  const [products, setProducts] = useState([]);
  const [discountLogs, setDiscountLogs] = useState([]);
  const [disposalLogs, setDisposalLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [activeStaff, setActiveStaff] = useState('STF-4001');
  const [filterStore, setFilterStore] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('NONE');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [toasts, setToasts] = useState([]);

  // INTENTIONAL_ERROR: Session cache - remains stale when switching staff (Error 6)
  const [cachedDisposalPendingCount] = useState(18);
  const [cachedRecentProduct] = useState('제주 생물 고등어 (50% Off / 서초점)');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => await Promise.all([loadProducts(), loadStores(), loadDiscountLogs(), loadDisposalLogs(), loadActivityLogs(), loadStaffs()]);
  const loadProducts = async () => setProducts(await fetchProducts());
  const loadStores = async () => setStores(await fetchStores());
  const loadDiscountLogs = async () => setDiscountLogs(await fetchDiscountLogs());
  const loadDisposalLogs = async () => setDisposalLogs(await fetchDisposalLogs());
  const loadActivityLogs = async () => setActivityLogs(await fetchActivityLogs());
  const loadStaffs = async () => setStaffs(await fetchStaffs());

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4500);
  };

  const handleStaffSwitch = (staffId) => {
    setActiveStaff(staffId);
    showToast(`로그인 매장 담당자를 [${staffId}] 계정으로 변경합니다. (상단 KPI 캐시 잔존 - Error 6)`, 'warning');
    loadProducts();
    // INTENTIONAL_ERROR: cachedDisposalPendingCount and cachedRecentProduct remain from previous staff session (Error 6)
  };

  const triggerSearchRace = (storeName, status, search) => {
    // INTENTIONAL_ERROR: Error 5 - 강남본점(3초 지연) 결과가 최신 서초점(0.2초) 결과를 덮어씀
    showToast(`신선식품 목록 조회 중 [매장: ${storeName} / 상태: ${status}]...`, 'info');
    searchProductsApi(storeName, status, search).then(data => {
      setProducts(data);
      if (storeName === '강남본점') {
        showToast('강남본점 신선식품 수신 완료 (3초 지연 완료 ➔ 최신 매장 결과를 덮어썼을 수 있음)', 'warning');
      } else {
        showToast(`상품 목록 수신 완료`, 'info');
      }
    });
  };

  const openDetailMismatch = (idx) => {
    // INTENTIONAL_ERROR: Error 3 - 정렬 후 클릭 시 sortedProducts[idx] 아닌 원본 products[idx] 상품이 선택됨
    setSelectedIdx(idx);
    const clicked = sortedProducts[idx];
    if (clicked) {
      showToast(`[${clicked.productName}] 상세 선택 (우측 패널에는 원본 배열 인덱스 ${idx}번 상품 정보 표시 - Error 3)`, 'warning');
    }
  };

  const triggerStatusDiscountRace = (prdId, target, discountRatePercent) => {
    showToast('폐기예정 변경(3초 지연)과 할인율 수정(0.1초 완료)을 동시 처리합니다. (Error 1)', 'info');
    patchProductStatusApi(prdId, target.status);
    setTimeout(() => {
      patchProductDiscountRateApi(prdId, discountRatePercent);
    }, 100);
    setTimeout(async () => {
      showToast('타임세일 할인율 수정 완료 (0.1초 완료)', 'info');
    }, 200);
    setTimeout(async () => {
      showToast('폐기예정 변경 완료 (3초 완료 - 할인율 수정이 롤백될 수 있음 → 새로고침으로 확인)', 'danger');
      await loadProducts();
    }, 4000);
  };

  const triggerCancelSoldOutConflict = (prdId) => {
    showToast('폐기 취소(0.5초 완료)와 판매 완료(4초 지연 완료)를 연쇄 실행합니다. (Error 2)', 'info');
    cancelDisposalApi(prdId);
    setTimeout(async () => {
      showToast('폐기 취소 완료 (0.5초 완료 → 상태: CANCELLED)', 'warning');
      await loadProducts();
    }, 600);
    completeSoldOutApi(prdId);
    setTimeout(async () => {
      showToast('판매 완료 처리 (4초 완료 → CANCELLED 상품을 SOLD_OUT으로 복원시킴 - Error 2)', 'danger');
      await loadProducts();
      await loadDisposalLogs();
    }, 4500);
  };

  const triggerPartialSave = async (id, productName, storageTemp, expiryDate) => {
    await patchProductPartialApi(id, productName, storageTemp, expiryDate);
    // INTENTIONAL_ERROR: Frontend shows success but backend did not save storageTemp (Error 8)
    showToast(`[${id}] 상품명/보관온도/유통기한이 성공적으로 저장되었습니다.`, 'success');
    await loadProducts();
  };

  const deleteLog = async (id) => {
    const data = await deleteDisposalLogApi(id);
    if (data.success) {
      showToast('폐기 로그 삭제 완료. (대시보드 매장별 폐기율 및 카테고리별 손실금액 통계에는 계속 반영됨 - Error 4)', 'warning');
      await loadDisposalLogs();
    }
  };

  const testUnauthorizedConfirmDisposal = async (id) => {
    const res = await confirmDisposalUnauthorizedApi(id, 'STAFF');
    if (res.error) {
      showToast('[HTTP 403 Forbidden] 권한 오류. (백엔드 감사 로그에는 폐기 확정 성공 200 OK으로 기록됨 - Error 7)', 'danger');
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('FreshMark 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedIdx(0);
    await loadAll();
  };

  const sortedProducts = useMemo(() => {
    let list = [...products];
    if (sortOrder === 'EXPIRY_ASC') {
      list.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
    } else if (sortOrder === 'DISCOUNT_DESC') {
      list.sort((a, b) => b.discountRatePercent - a.discountRatePercent);
    }
    return list;
  }, [products, sortOrder]);

  // INTENTIONAL_ERROR: selectedProduct is based on original products[] not sortedProducts[] (Error 3)
  const selectedProduct = useMemo(() => products[selectedIdx] || products[0] || null, [products, selectedIdx]);

  return (
    <div id="app">
      <Header activeStaff={activeStaff} handleStaffSwitch={handleStaffSwitch} cachedDisposalPendingCount={cachedDisposalPendingCount} cachedRecentProduct={cachedRecentProduct} resetSandbox={resetSandbox} />
      <div className="freshmark-grid">
        <Sidebar
          filterStore={filterStore} setFilterStore={setFilterStore}
          filterStatus={filterStatus} setFilterStatus={setFilterStatus}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
          triggerSearchRace={triggerSearchRace}
          products={sortedProducts} selectedIdx={selectedIdx}
          setSelectedIdx={setSelectedIdx} openDetailMismatch={openDetailMismatch}
          stores={stores}
        />
        <CenterSection
          products={products} stores={stores} discountLogs={discountLogs}
          disposalLogs={disposalLogs} activityLogs={activityLogs}
          deleteDisposalLog={deleteLog} testUnauthorizedConfirmDisposal={testUnauthorizedConfirmDisposal}
        />
        <RightPanel
          selectedProduct={selectedProduct}
          setSelectedProduct={(u) => setProducts(prev => prev.map(p => p.id === u.id ? u : p))}
          products={products} stores={stores}
          triggerStatusDiscountRace={triggerStatusDiscountRace}
          triggerCancelSoldOutConflict={triggerCancelSoldOutConflict}
          triggerPartialSave={triggerPartialSave}
        />
      </div>
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">{t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}</span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-close" onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
}
