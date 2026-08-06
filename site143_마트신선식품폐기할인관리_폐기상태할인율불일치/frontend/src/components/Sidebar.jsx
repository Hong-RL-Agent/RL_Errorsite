import React from 'react';

export default function Sidebar({ filterStore, setFilterStore, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, products, selectedIdx, setSelectedIdx, openDetailMismatch, stores }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🥬 매장 & 유통기한/폐기 필터</h3>

      <div className="filter-group">
        <label>매장 선택 (Error 5):</label>
        <select value={filterStore} onChange={(e) => { setFilterStore(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 매장</option>
          <option value="강남본점">강남본점 (3초 지연 - Error 5)</option>
          <option value="서초점">서초점 (0.2초 완료)</option>
          <option value="송파점">송파점</option>
          <option value="마포점">마포점</option>
          <option value="분당점">분당점</option>
        </select>
        <small className="warn-desc">* 강남본점(3초 지연)→서초점(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>유통기한/할인/폐기 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterStore, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="NORMAL">정상판매 (NORMAL)</option>
          <option value="DISCOUNTED">할인판매 (DISCOUNTED)</option>
          <option value="DISPOSAL_PENDING">폐기예정 (DISPOSAL_PENDING)</option>
          <option value="DISPOSED">폐기완료 (DISPOSED)</option>
          <option value="SOLD_OUT">판매완료 (SOLD_OUT)</option>
          <option value="CANCELLED">폐기취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>상품명/카테고리/코드 검색:</label>
        <input type="text" placeholder="한우 등심 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterStore, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 상품ID순</option>
          <option value="EXPIRY_ASC">유통기한 마감 임박 순 (Error 3)</option>
          <option value="DISCOUNT_DESC">할인율 높은 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedProducts 대신 원본 배열 인덱스 상품이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 신선식품 재고 대장 ({products.length}개):</label>
        <div className="product-stack">
          {products.map((prd, idx) => (
            <div key={prd.id} className={`prd-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="prd-card-head">
                <span className="store-badge">{prd.storeName}</span>
                <span className={`status-badge ${prd.status.toLowerCase()}`}>{prd.status}</span>
              </div>
              <div className="prd-title">{prd.productName}</div>
              <div className="prd-meta">유통기한: {prd.expiryDate} | 재고: {prd.stockQty}개</div>
              <div className="prd-foot">
                <small>가격: {prd.currentPriceWon.toLocaleString()}원 ({prd.discountRatePercent}% Off)</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
