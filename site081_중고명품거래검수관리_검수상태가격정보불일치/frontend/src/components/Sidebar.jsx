import React from 'react';

export default function Sidebar({
  filterBrand,
  setFilterBrand,
  filterStatus,
  setFilterStatus,
  priceSortOrder,
  setPriceSortOrder,
  triggerSearchRace,
  products,
  selectedProduct,
  setSelectedProduct,
  confirmPurchase
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 브랜드 & 검수 상태 필터</h3>
      
      <div className="filter-group">
        <label>명품 브랜드 선택 (Error 5):</label>
        <select 
          value={filterBrand} 
          onChange={(e) => {
            setFilterBrand(e.target.value);
            triggerSearchRace(e.target.value, filterStatus);
          }}
        >
          <option value="ALL">전체 브랜드</option>
          <option value="CHANEL">샤넬 (CHANEL - Error 5)</option>
          <option value="HERMES">에르메스 (HERMES)</option>
          <option value="ROLEX">롤렉스 (ROLEX)</option>
          <option value="LOUIS_VUITTON">루이비통 (LOUIS_VUITTON)</option>
          <option value="DIOR">디올 (DIOR)</option>
          <option value="CARTIER">까르띠에 (CARTIER)</option>
          <option value="GUCCI">구찌 (GUCCI)</option>
          <option value="PRADA">프라다 (PRADA)</option>
        </select>
        <small className="warn-desc">* 브랜드 고속 변경 시 이전 응답(샤넬 3초)이 최신 결과를 덮어써 중앙 목록과 오른쪽 검수 요약이 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>검수 상태 필터:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            triggerSearchRace(filterBrand, e.target.value);
          }}
        >
          <option value="ALL">전체 검수 상태</option>
          <option value="PASSED">검수 통과 (PASSED)</option>
          <option value="INSPECTING">검수 대기중 (INSPECTING)</option>
          <option value="REJECTED">검수 반려 (REJECTED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>가격순 정렬 (Error 3):</label>
        <select value={priceSortOrder} onChange={(e) => setPriceSortOrder(e.target.value)}>
          <option value="NONE">등록순 (기본)</option>
          <option value="PRICE_DESC">높은 가격순 (Error 3)</option>
          <option value="PRICE_ASC">낮은 가격순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 가격순 정렬 상태에서 구매 신청 클릭 시 정렬 인덱스 불일치로 다른 상품이 구매 저장됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>등록 상품 목록 (최소 20개):</label>
        <div className="products-stack">
          {products.map((p, idx) => (
            <div 
              key={p.id}
              className={`prd-card ${selectedProduct?.id === p.id ? 'active' : ''}`}
              onClick={() => setSelectedProduct(p)}
            >
              <div className="prd-head">
                <span className="brand-tag">{p.brand}</span>
                <span className={`status-badge ${p.inspectionStatus.toLowerCase()}`}>{p.inspectionStatus}</span>
              </div>
              <div className="prd-name">{p.name}</div>
              <div className="prd-foot">
                <strong className="price-lbl">{p.price.toLocaleString()}원</strong>
                <button 
                  className="buy-btn-sm"
                  onClick={(e) => { e.stopPropagation(); confirmPurchase(idx); }}
                >
                  구매 신청 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
