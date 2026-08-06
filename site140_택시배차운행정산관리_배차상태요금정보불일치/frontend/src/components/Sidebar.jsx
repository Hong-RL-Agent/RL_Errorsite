import React from 'react';

export default function Sidebar({ filterRegion, setFilterRegion, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, calls, selectedIdx, setSelectedIdx, openDetailMismatch, drivers }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🚕 권역 & 호출 배차 필터</h3>

      <div className="filter-group">
        <label>운행 권역 선택 (Error 5):</label>
        <select value={filterRegion} onChange={(e) => { setFilterRegion(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 권역</option>
          <option value="서울 강남권">서울 강남권 (3초 지연 - Error 5)</option>
          <option value="서울 서초권">서울 서초권 (0.2초 완료)</option>
          <option value="서울 송파권">서울 송파권</option>
          <option value="서울 마포/홍대권">서울 마포/홍대권</option>
          <option value="경기 판교/성남권">경기 판교/성남권</option>
        </select>
        <small className="warn-desc">* 서울 강남권(3초 지연)→서초권(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>배차/운행 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterRegion, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="PENDING">호출접수 (PENDING)</option>
          <option value="DISPATCHED">배차완료 (DISPATCHED)</option>
          <option value="IN_DRIVE">운행중 (IN_DRIVE)</option>
          <option value="COMPLETED">운행완료 (COMPLETED)</option>
          <option value="SETTLED">정산확정 (SETTLED)</option>
          <option value="CANCELLED">호출취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>출발지/목적지/기사명/코드 검색:</label>
        <input type="text" placeholder="강남역 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterRegion, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 호출ID순</option>
          <option value="DIST_DESC">운행 거리 긴 순 (Error 3)</option>
          <option value="FEE_DESC">예상 요금 높은 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedCalls 대신 원본 배열 인덱스 호출이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 택시 배차 관제 대장 ({calls.length}건):</label>
        <div className="call-stack">
          {calls.map((cl, idx) => (
            <div key={cl.id} className={`call-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="cl-card-head">
                <span className="region-badge">{cl.region.split(' ')[1] || cl.region}</span>
                <span className={`status-badge ${cl.status.toLowerCase()}`}>{cl.status}</span>
              </div>
              <div className="cl-title">{cl.origin} ➔ {cl.destination}</div>
              <div className="cl-meta">기사: {cl.driverName} | 거리: {cl.distanceKm}km</div>
              <div className="cl-foot">
                <small>요금: {cl.actualFeeWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
