import React from 'react';

export default function Sidebar({ filterLot, setFilterLot, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, records, selectedIdx, setSelectedIdx, openDetailMismatch, parkingLots }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🚘 주차장 & 입출차 필터</h3>

      <div className="filter-group">
        <label>공영주차장 선택 (Error 5):</label>
        <select value={filterLot} onChange={(e) => { setFilterLot(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 공영주차장</option>
          <option value="LOT-01">강남역 노외 공영 (3초 지연 - Error 5)</option>
          <option value="LOT-02">서초중앙 공영 (0.2초 완료)</option>
          <option value="LOT-03">송파 잠실역 공영</option>
          <option value="LOT-04">성수역 공영</option>
        </select>
        <small className="warn-desc">* 강남역 노외(3초 지연)→서초중앙(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>입출차 / 정산 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterLot, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="OCCUPIED">주차중 (OCCUPIED)</option>
          <option value="EXITED">출차완료 (EXITED)</option>
          <option value="SETTLED">정산완료 (SETTLED)</option>
          <option value="UNPAID">미납 (UNPAID)</option>
          <option value="CANCELLED">출차취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>차량번호/주차면/입출차코드 검색:</label>
        <input type="text" placeholder="123가 4567 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterLot, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 입출차ID순</option>
          <option value="TIME_DESC">주차 시간 긴 순 (Error 3)</option>
          <option value="FEE_DESC">정산 금액 높은 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedRecords 대신 원본 배열 인덱스 차량이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 차량 입출차 대장 ({records.length}건):</label>
        <div className="record-stack">
          {records.map((rec, idx) => (
            <div key={rec.id} className={`record-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="rec-card-head">
                <span className="space-no-badge">{rec.spaceNo}</span>
                <span className={`status-badge ${rec.status.toLowerCase()}`}>{rec.status}</span>
              </div>
              <div className="rec-title">{rec.carNo} ({rec.carType})</div>
              <div className="rec-meta">주차장: {rec.lotName.split(' ')[0]} | 주차: {rec.durationMinutes}분</div>
              <div className="rec-foot">
                <small>요금: {rec.feeWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
