import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Sidebar from '../components/Sidebar.jsx';
import CenterSection from '../components/CenterSection.jsx';
import RightPanel from '../components/RightPanel.jsx';
import {
  fetchProducts,
  searchProductsApi,
  fetchProductDetailApi,
  fetchInspections,
  fetchTransactions,
  fetchSellers,
  patchInspectionStatusApi,
  patchPriceApi,
  rejectProductApi,
  patchDescriptionApi,
  purchaseProductApi,
  deleteTransactionApi,
  resetSandboxApi
} from '../api/index.js';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [sellers, setSellers] = useState([]);

  const [activeSeller, setActiveSeller] = useState('SLR-01');
  const [filterBrand, setFilterBrand] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [priceSortOrder, setPriceSortOrder] = useState('NONE');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Stale status cache for Error 1
  const [previousStatusCache, setPreviousStatusCache] = useState('INSPECTING');

  // Seller session stats cache (Error 6 Target)
  const [cachedSalesAmount, setCachedSalesAmount] = useState('49,750,000원');
  const [cachedInspectionNotice, setCachedInspectionNotice] = useState('4건 대기중 (샤넬, 에르메스, 롤렉스)');
  const [cachedRecentTrxSummary, setCachedRecentTrxSummary] = useState('샤넬 클래식 플랩백 (12,500,000원)');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await loadProducts();
    await loadInspections();
    await loadTransactions();
    await loadSellers();
  };

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
    if (data.length > 0 && !selectedProduct) {
      selectProduct(data[0]);
    }
  };

  const selectProduct = async (product) => {
    setSelectedProduct(product);
    setPreviousStatusCache(product.inspectionStatus);
    try {
      const detail = await fetchProductDetailApi(product.id);
      setSelectedProductDetail(detail);
    } catch (e) {
      setSelectedProductDetail(product);
    }
  };

  const loadInspections = async () => {
    const data = await fetchInspections();
    setInspections(data);
  };

  const loadTransactions = async () => {
    const data = await fetchTransactions();
    setTransactions(data);
  };

  const loadSellers = async () => {
    const data = await fetchSellers();
    setSellers(data);
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
    showToast(`로그인 셀러 계정을 [${sellerId}] 회원으로 변경합니다.`, 'info');
    loadProducts();
    // INTENTIONAL_ERROR
    // CATEGORY: Session + Cache 잔존 오류
    // DESCRIPTION: 판매자 A의 상품 관리 화면을 본 뒤 판매자 B로 로그인하면 상품 목록은 B 기준으로 바뀌지만, 
    // 판매 예정 금액, 검수 대기 알림, 최근 거래 요약 캐시(cachedSalesAmount, cachedInspectionNotice)는 A 데이터가 남아 노출되는 결함입니다.
  };

  // Price & Inspection Status update race (Error 1 Trigger)
  const triggerPriceInspectionRace = (prd) => {
    showToast('상품 판매 가격 수정과 검수 상태 변경을 순차 요청합니다.', 'info');

    patchInspectionStatusApi(prd.id, prd.inspectionStatus);

    setTimeout(() => {
      patchPriceApi(prd.id, prd.price, previousStatusCache);
    }, 100);

    setPreviousStatusCache(prd.inspectionStatus);

    setTimeout(async () => {
      showToast('가격 수정 완료 (가격은 갱신되었으나 3초 지연 완료로 검수 상태가 이전 값으로 롤백 저장됨)', 'warning');
      await loadProducts();
    }, 4500);
  };

  // Brand & Status search race condition (Error 5 Trigger)
  const triggerSearchRace = (brand, status) => {
    showToast(`명품 브랜드 검색 필터를 조회합니다: [${brand} / ${status}]`, 'info');

    if (brand === 'CHANEL') {
      searchProductsApi('CHANEL', status).then(data => {
        setProducts(data);
        showToast('샤넬 브랜드 상품 검색 수신 완료 (3초 지연 완료)', 'warning');
      });
    } else if (brand === 'HERMES') {
      searchProductsApi('HERMES', status).then(data => {
        setProducts(data);
        showToast('에르메스 브랜드 상품 검색 수신 완료 (0.2초 완료)', 'info');
      });
    } else {
      searchProductsApi(brand, status).then(data => {
        setProducts(data);
      });
    }
  };

  // Price Sort Purchase Index Mismatch (Error 3 Target)
  const confirmPurchase = async (index) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend 정렬 인덱스 오류
    // DESCRIPTION: 상품 목록을 가격순으로 정렬한 뒤 구매 신청 버튼을 누르면 
    // 사용자가 클릭한 상품이 아니라 정렬 전 배열의 같은 index 상품으로 구매 신청되어 저장되는 결함입니다.
    const targetProduct = products[index];
    if (!targetProduct) {
      showToast('상품 인덱스를 찾을 수 없습니다.', 'danger');
      return;
    }

    showToast(`[${targetProduct.name}] 구매 신청 알림 표시 완료 (실제 backend DB에는 인덱스 불일치 상품 id로 저장됨)`, 'warning');
    await purchaseProductApi(targetProduct.id, '구매자');
    await loadTransactions();
  };

  // Reject & Description Conflict (Error 2 Trigger)
  const triggerRejectDescriptionConflict = (prd) => {
    showToast('검수 반려 처리와 상품 설명 수정을 진행합니다.', 'info');

    // 1. Reject Product (0.5s done)
    rejectProductApi(prd.id);

    // 2. Update Description & Re-activate (4.0s delay)
    setTimeout(async () => {
      await patchDescriptionApi(prd.id, `${prd.name} (수정 완료)`);
      showToast('검수 반려 응답 완료 (0.5초 완료)', 'warning');
      await loadProducts();
    }, 100);

    setTimeout(async () => {
      showToast('설명 수정 완료 (4초 지연 완료: 반려된 상품을 다시 INSPECTING 검수 대기로 재활성화시킴)', 'danger');
      await loadProducts();
    }, 4500);
  };

  // Delete Transaction (Error 4 Target)
  const deleteTransaction = async (id) => {
    const data = await deleteTransactionApi(id);
    if (data.success) {
      showToast('거래 내역을 삭제했습니다. (셀러 누적 판매액 및 브랜드별 거래 통계 그래프 수치에는 계속 유지됨)', 'warning');
      await loadTransactions();
    }
  };

  const resetSandbox = async () => {
    await resetSandboxApi();
    showToast('LuxeCheck 데이터베이스가 성공적으로 리셋되었습니다.', 'success');
    setSelectedProduct(null);
    await loadAll();
  };

  const sortedProducts = useMemo(() => {
    let list = [...products];
    if (filterBrand !== 'ALL') {
      list = list.filter(p => p.brand === filterBrand);
    }
    if (filterStatus !== 'ALL') {
      list = list.filter(p => p.inspectionStatus === filterStatus);
    }
    if (priceSortOrder === 'PRICE_DESC') {
      list.sort((a, b) => b.price - a.price);
    } else if (priceSortOrder === 'PRICE_ASC') {
      list.sort((a, b) => a.price - b.price);
    }
    return list;
  }, [products, filterBrand, filterStatus, priceSortOrder]);

  const sellerTransactions = useMemo(() => {
    return transactions.filter(t => t.sellerId === activeSeller);
  }, [transactions, activeSeller]);

  const selectedSellerInfo = useMemo(() => {
    return sellers.find(s => s.id === activeSeller);
  }, [sellers, activeSeller]);

  return (
    <div id="app">
      <Header
        activeSeller={activeSeller}
        handleSellerSwitch={handleSellerSwitch}
        cachedSalesAmount={cachedSalesAmount}
        cachedInspectionNotice={cachedInspectionNotice}
        cachedRecentTrxSummary={cachedRecentTrxSummary}
        resetSandbox={resetSandbox}
      />

      <div className="luxecheck-grid">
        <Sidebar
          filterBrand={filterBrand}
          setFilterBrand={setFilterBrand}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          priceSortOrder={priceSortOrder}
          setPriceSortOrder={setPriceSortOrder}
          triggerSearchRace={triggerSearchRace}
          products={sortedProducts}
          selectedProduct={selectedProduct}
          setSelectedProduct={selectProduct}
          confirmPurchase={confirmPurchase}
        />

        <CenterSection
          inspections={inspections}
          sellerTransactions={sellerTransactions}
          deleteTransaction={deleteTransaction}
          selectedSellerInfo={selectedSellerInfo}
        />

        <RightPanel
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          triggerPriceInspectionRace={triggerPriceInspectionRace}
          triggerRejectDescriptionConflict={triggerRejectDescriptionConflict}
          selectedProductDetail={selectedProductDetail}
        />
      </div>

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
