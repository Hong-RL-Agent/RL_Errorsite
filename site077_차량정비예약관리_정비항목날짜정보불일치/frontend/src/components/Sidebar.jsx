import React from 'react';

export default function Sidebar({
  filterRegion,
  setFilterRegion,
  filterServiceType,
  setFilterServiceType,
  ratingSortOrder,
  setRatingSortOrder,
  triggerSearchRace,
  sortedCenters,
  selectedCenter,
  setSelectedCenter,
  confirmBooking,
  formatPrice,
  getServiceTypeLabel
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 정비소 탐색 및 정렬</h3>
      
      <div className="filter-group">
        <label>지역구 선택 (Error 5):</label>
        <select 
          value={filterRegion} 
          onChange={(e) => {
            setFilterRegion(e.target.value);
            triggerSearchRace(e.target.value, filterServiceType);
          }}
        >
          <option value="ALL">전체 지역구</option>
          <option value="강남구">강남구 (Error 5)</option>
          <option value="마포구">마포구</option>
          <option value="성동구">성동구</option>
          <option value="서초구">서초구</option>
          <option value="송파구">송파구</option>
        </select>
        <small className="warn-desc">* 필터 고속 변경 시 이전 응답(강남구 3초)이 최신 결과를 덮어쓰고 견적 가격이 엇갈림 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>정비 항목 필터:</label>
        <select 
          value={filterServiceType} 
          onChange={(e) => {
            setFilterServiceType(e.target.value);
            triggerSearchRace(filterRegion, e.target.value);
          }}
        >
          <option value="ALL">전체 정비 항목</option>
          <option value="ENGINE_OIL">엔진오일 교환 (ENGINE_OIL)</option>
          <option value="BRAKE_PAD">브레이크 패드 (BRAKE_PAD)</option>
          <option value="TIRE">타이어 교체 (TIRE)</option>
          <option value="BATTERY">배터리 점검 (BATTERY)</option>
          <option value="INSPECTION">정밀 점검 (INSPECTION)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>평점순 정렬 (Error 3):</label>
        <select value={ratingSortOrder} onChange={(e) => setRatingSortOrder(e.target.value)}>
          <option value="NONE">기본 순서</option>
          <option value="RATING_DESC">평점 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 평점순 정렬 상태에서 예약 버튼 클릭 시, 정렬 인덱스 불일치로 엉뚱한 정비소가 예약됨 (Error 3)</small>
      </div>

      <div className="centers-stack">
        <h4>🏬 제휴 정비소 대장 (최소 12곳)</h4>
        {sortedCenters.map((ctr, idx) => (
          <div 
            key={ctr.id}
            className={`ctr-card ${selectedCenter?.id === ctr.id ? 'active' : ''}`}
            onClick={() => setSelectedCenter(ctr)}
          >
            <div className="ctr-head">
              <span className="type-tag">{getServiceTypeLabel(ctr.serviceType)}</span>
              <span className="rating-tag">⭐ {ctr.rating}</span>
            </div>
            <h5 className="ctr-name">{ctr.name}</h5>
            <div className="ctr-foot">
              <span>{ctr.region} | 예상견적: {formatPrice(ctr.estPrice)}</span>
              <button className="book-btn-sm" onClick={(e) => { e.stopPropagation(); confirmBooking(idx); }}>
                즉시 예약 (Error 3)
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
