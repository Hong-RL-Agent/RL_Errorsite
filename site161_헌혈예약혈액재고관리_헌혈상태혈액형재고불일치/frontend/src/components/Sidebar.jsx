import React from 'react';

export default function Sidebar({ filterCenterName, setFilterCenterName, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, reservations, selectedIdx, setSelectedIdx, openDetailMismatch, centers }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🩸 헌혈 센터 & 예약 상태 필터</h3>

      <div className="filter-group">
        <label>헌혈 센터 선택 (Error 5):</label>
        <select value={filterCenterName} onChange={(e) => { setFilterCenterName(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 헌혈 센터</option>
          <option value="서울 중앙 헌혈의 집">서울 중앙 센터 (3초 지연 - Error 5)</option>
          <option value="강남역 헌혈 센터">강남역 센터 (0.2초 완료)</option>
          <option value="신촌 헌혈의 집">신촌 센터</option>
        </select>
        <small className="warn-desc">* 서울 중앙(3초 지연)→강남역(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>헌혈 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterCenterName, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="RESERVED">예약완료 (RESERVED)</option>
          <option value="SCREENED">문진완료 (SCREENED)</option>
          <option value="IN_PROGRESS">헌혈중 (IN_PROGRESS)</option>
          <option value="COMPLETED">헌혈완료 (COMPLETED)</option>
          <option value="CANCELLED">예약취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>헌혈자명/혈액형/코드/헌혈종류 검색:</label>
        <input type="text" placeholder="최생명 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterCenterName, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 예약ID순</option>
          <option value="TIME_ASC">예약 시간 빠른 순 (Error 3)</option>
          <option value="BLOOD_ASC">혈액형 알파벳 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedReservations 대신 원본 배열 인덱스 헌혈자가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 헌혈 예약 대장 ({reservations.length}건):</label>
        <div className="reservation-stack">
          {reservations.map((rsv, idx) => (
            <div key={rsv.id} className={`rsv-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="rsv-card-head">
                <span className="center-badge">{rsv.centerName.split(' ')[0]}</span>
                <span className={`status-badge ${rsv.status.toLowerCase()}`}>{rsv.status}</span>
              </div>
              <div className="rsv-title">{rsv.donorName} ({rsv.bloodType.split(' ')[0]})</div>
              <div className="rsv-meta">종류: {rsv.donationType} | 시간: {rsv.reservationTime.split(' ')[1]}</div>
              <div className="rsv-foot">
                <small>재고: {rsv.bloodStockUnits}팩</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
