import React from 'react';

export default function Sidebar({
  filterTier,
  setFilterTier,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  customers,
  selectedCustomerIndex,
  setSelectedCustomerIndex,
  openDetailMismatch
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 멤버십 등급 & 고객 검색</h3>

      <div className="filter-group">
        <label>등급 필터 선택 (Error 5):</label>
        <select 
          value={filterTier} 
          onChange={(e) => {
            setFilterTier(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 등급 (35명)</option>
          <option value="VVIP">VVIP 등급 (Error 5 - 3초 지연)</option>
          <option value="VIP">VIP 등급</option>
          <option value="GOLD">GOLD 등급 (0.2초 완료)</option>
          <option value="SILVER">SILVER 등급</option>
          <option value="BRONZE">BRONZE 등급</option>
        </select>
        <small className="warn-desc">* 등급 필터 고속 변경 시 VVIP(3초 지연)가 GOLD 결과를 덮어쓰고 우측 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>고객명/ID 검색:</label>
        <input 
          type="text" 
          placeholder="고객명 또는 ID 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterTier, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>고객 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 고객ID순</option>
          <option value="SPEND_DESC">누적 구매금액 높은순 (Error 3)</option>
          <option value="POINTS_DESC">보유 포인트 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 구매금액/포인트 정렬 후 쿠폰발급 클릭 시 원본 배열 인덱스 불일치로 다른 고객에게 쿠폰이 발급됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>회원 고객 목록 (최소 35명):</label>
        <div className="customer-stack">
          {customers.map((cst, idx) => (
            <div 
              key={cst.id}
              className={`customer-card-item ${selectedCustomerIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedCustomerIndex(idx)}
            >
              <div className="customer-card-head">
                <span className={`tier-badge ${cst.tier.toLowerCase()}`}>{cst.tier}</span>
                <span className="customer-id">{cst.id}</span>
              </div>
              <div className="customer-name">{cst.name} 고객</div>
              <div className="customer-meta">
                <span>누적구매: ₩{cst.totalSpend.toLocaleString()}</span>
                <span className="points-lbl">포인트: {cst.points.toLocaleString()}P</span>
              </div>
              <div className="customer-foot">
                <small>매장: {cst.preferredStore}</small>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}
                >
                  쿠폰발급 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
