import React from 'react';

export default function Sidebar({
  filterDestination,
  setFilterDestination,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  destinations,
  hotels,
  selectedHotelIndex,
  setSelectedHotelIndex,
  openDetailMismatch
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 여행지 & 추천 숙소 검색</h3>

      <div className="filter-group">
        <label>목적지 검색 (Error 5):</label>
        <select 
          value={filterDestination} 
          onChange={(e) => {
            setFilterDestination(e.target.value);
            triggerSearchRace(e.target.value);
          }}
        >
          <option value="ALL">전체 여행지 (18개)</option>
          <option value="다낭">다낭 (Error 5 - 3초 지연)</option>
          <option value="도쿄">도쿄 (0.2초 완료)</option>
          <option value="오사카">오사카</option>
          <option value="후쿠오카">후쿠오카</option>
          <option value="나트랑">나트랑</option>
          <option value="방콕">방콕</option>
          <option value="발리">발리</option>
          <option value="세부">세부</option>
          <option value="싱가포르">싱가포르</option>
          <option value="하와이">하와이</option>
        </select>
        <small className="warn-desc">* 필터 고속 변경 시 다낭(3초 지연)이 도쿄 항공편 결과를 덮어쓰고 우측 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>숙소 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 숙소순</option>
          <option value="PRICE_ASC">1박 가격 낮은순 (Error 3)</option>
          <option value="RATING_DESC">평점 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 가격/평점 정렬 후 숙소 선택 클릭 시 원본 배열 인덱스 불일치로 다른 숙소가 예약 요약에 들어감 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>추천 숙소 목록 (최소 25개):</label>
        <div className="hotel-stack">
          {hotels.map((htl, idx) => (
            <div 
              key={htl.id}
              className={`hotel-card-item ${selectedHotelIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedHotelIndex(idx)}
            >
              <div className="hotel-card-head">
                <span className="grade-badge">{htl.grade}</span>
                <span className="rating-lbl">⭐ {htl.rating}</span>
              </div>
              <div className="hotel-title">{htl.name}</div>
              <div className="hotel-meta">
                <span>📍 {htl.destination}</span>
                <span className="price-lbl">₩{htl.pricePerNight.toLocaleString()}/박</span>
              </div>
              <div className="hotel-foot">
                <small>ID: {htl.id}</small>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}
                >
                  숙소 선택 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
