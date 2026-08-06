import React from 'react';

export default function Sidebar({
  filterZone,
  setFilterZone,
  filterCategory,
  setFilterCategory,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  products,
  selectedProductIndex,
  setSelectedProductIndex,
  openDetailMismatch
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 창고 구역 & 카테고리 필터</h3>

      <div className="filter-group">
        <label>보관 구역 선택 (Error 5):</label>
        <select 
          value={filterZone} 
          onChange={(e) => {
            setFilterZone(e.target.value);
            triggerSearchRace(e.target.value, filterCategory);
          }}
        >
          <option value="ALL">전체 구역</option>
          <option value="A구역">A구역 (Error 5 - 3초 지연)</option>
          <option value="B구역">B구역 (0.2초 완료)</option>
          <option value="C구역">C구역</option>
        </select>
        <small className="warn-desc">* 구역 필터 고속 변경 시 A구역(3초 지연)이 B구역 결과를 덮어쓰고 로케이션 맵과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>카테고리 필터:</label>
        <select 
          value={filterCategory} 
          onChange={(e) => {
            setFilterCategory(e.target.value);
            triggerSearchRace(filterZone, e.target.value);
          }}
        >
          <option value="ALL">전체 카테고리</option>
          <option value="전자부품">전자부품</option>
          <option value="기계설비">기계설비</option>
          <option value="자재">자재</option>
          <option value="통신장비">통신장비</option>
          <option value="소모품">소모품</option>
          <option value="안전용품">안전용품</option>
          <option value="보관설비">보관설비</option>
        </select>
      </div>

      <div className="filter-group">
        <label>재고 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 상품ID순</option>
          <option value="STOCK_LOW">재고 부족순 (Error 3)</option>
          <option value="PRICE_HIGH">단가 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 재고부족/단가 정렬 후 상세보기 클릭 시 원본 배열 인덱스 불일치로 다른 상품 상세가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>보관 상품 목록 (최소 40개):</label>
        <div className="product-stack">
          {products.map((prd, idx) => (
            <div 
              key={prd.id}
              className={`product-card-item ${selectedProductIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedProductIndex(idx)}
            >
              <div className="product-card-head">
                <span className="location-badge">{prd.location}</span>
                <span className={`status-badge ${prd.stock <= prd.safetyStock ? 'danger' : 'normal'}`}>
                  {prd.stock <= prd.safetyStock ? '재고부족' : '정상'}
                </span>
              </div>
              <div className="product-title">{prd.name}</div>
              <div className="product-meta">
                <span>{prd.zone} | {prd.category}</span>
                <span className="stock-lbl">재고: {prd.stock} {prd.unit} (안전: {prd.safetyStock})</span>
              </div>
              <div className="product-foot">
                <small>단가: ₩{prd.price.toLocaleString()}</small>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}
                >
                  상세보기 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
