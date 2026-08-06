import React from 'react';

export default function Sidebar({ filterProductCategory, setFilterProductCategory, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, reservations, selectedIdx, setSelectedIdx, openDetailMismatch, products }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📷 촬영 상품 & 예약 상태 필터</h3>

      <div className="filter-group">
        <label>촬영 상품 패키지 선택 (Error 5):</label>
        <select value={filterProductCategory} onChange={(e) => { setFilterProductCategory(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 상품 패키지</option>
          <option value="프로필/증명사진 패키지">프로필/증명사진 (3초 지연 - Error 5)</option>
          <option value="웨딩/웨딩스냅 패키지">웨딩/웨딩스냅 (0.2초 완료)</option>
          <option value="가족/바디프로필 패키지">가족/바디프로필</option>
        </select>
        <small className="warn-desc">* 프로필(3초 지연)→웨딩(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>촬영 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterProductCategory, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="RESERVED">예약완료 (RESERVED)</option>
          <option value="SHOOTING">촬영중 (SHOOTING)</option>
          <option value="SHOT_COMPLETED">촬영완료 (SHOT_COMPLETED)</option>
          <option value="RETOUCHING">보정작업중 (RETOUCHING)</option>
          <option value="DELIVERED">출고완료 (DELIVERED)</option>
          <option value="CANCELLED">예약취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>고객명/상품명/연락처/예약코드 검색:</label>
        <input type="text" placeholder="최스냅 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterProductCategory, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 예약ID순</option>
          <option value="DATE_ASC">촬영 일시 빠른 순 (Error 3)</option>
          <option value="PRICE_DESC">상품 금액 높은 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedReservations 대신 원본 배열 인덱스 예약이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 촬영 예약 대장 ({reservations.length}건):</label>
        <div className="rsv-stack">
          {reservations.map((rsv, idx) => (
            <div key={rsv.id} className={`rsv-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="rsv-card-head">
                <span className="category-badge">{rsv.productCategory.split('/')[0]}</span>
                <span className={`status-badge ${rsv.status.toLowerCase()}`}>{rsv.status}</span>
              </div>
              <div className="rsv-title">{rsv.customerName} ({rsv.productName.slice(0, 14)}...)</div>
              <div className="rsv-meta">일시: {rsv.shootDate} | {rsv.phone}</div>
              <div className="rsv-foot">
                <small>금액: {rsv.priceWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
