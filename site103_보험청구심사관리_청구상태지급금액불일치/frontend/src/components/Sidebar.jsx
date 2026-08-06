import React from 'react';

export default function Sidebar({
  filterProduct,
  setFilterProduct,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  claims,
  selectedClaimIndex,
  setSelectedClaimIndex,
  openDetailMismatch,
  products
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 보험 상품 & 청구 검색</h3>

      <div className="filter-group">
        <label>보험 상품 선택 (Error 5):</label>
        <select 
          value={filterProduct} 
          onChange={(e) => {
            setFilterProduct(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 보험 상품 (15개)</option>
          {products.map(p => (
            <option key={p.id} value={p.name}>
              {p.name} {p.name === '무배당 실손의료비보장보험' ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 상품 필터 고속 변경 시 실손의료비(3초 지연)가 암진단비 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>가입자명/청구ID/병명 검색:</label>
        <input 
          type="text" 
          placeholder="검색어 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterProduct, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>청구 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 청구ID순</option>
          <option value="AMOUNT_DESC">청구 금액 높은순 (Error 3)</option>
          <option value="DATE_DESC">접수일 최신순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 금액/접수일 정렬 후 상세 클릭 시 원본 배열 인덱스 불일치로 다른 청구 상세가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>보험 청구 대기열 (최소 45개):</label>
        <div className="claim-stack">
          {claims.map((claim, idx) => (
            <div 
              key={claim.id}
              className={`claim-card-item ${selectedClaimIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedClaimIndex(idx)}
            >
              <div className="claim-card-head">
                <span className="product-badge">{claim.productName}</span>
                <span className={`status-badge ${claim.status.toLowerCase()}`}>{claim.status}</span>
              </div>
              <div className="claim-policyholder">{claim.policyholderName} 가입자 ({claim.id})</div>
              <div className="claim-disease">{claim.diseaseName}</div>
              <div className="claim-foot">
                <small>청구액: {claim.claimAmount?.toLocaleString()}원</small>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}
                >
                  상세 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
