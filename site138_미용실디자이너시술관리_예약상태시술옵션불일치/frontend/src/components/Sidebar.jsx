import React from 'react';

export default function Sidebar({ filterDesigner, setFilterDesigner, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, reservations, selectedIdx, setSelectedIdx, openDetailMismatch, designers }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>💇‍♀️ 디자이너 & 시술 예약 필터</h3>

      <div className="filter-group">
        <label>담당 디자이너 선택 (Error 5):</label>
        <select value={filterDesigner} onChange={(e) => { setFilterDesigner(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 디자이너</option>
          <option value="엘리 원장">엘리 원장 (3초 지연 - Error 5)</option>
          <option value="지아 디자이너">지아 디자이너 (0.2초 완료)</option>
          <option value="민우 디자이너">민우 디자이너</option>
        </select>
        <small className="warn-desc">* 엘리 원장(3초 지연)→지아 디자이너(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>시술 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterDesigner, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="RESERVED">예약확정 (RESERVED)</option>
          <option value="IN_PROGRESS">시술중 (IN_PROGRESS)</option>
          <option value="COMPLETED">시술완료 (COMPLETED)</option>
          <option value="CANCELLED">예약취소 (CANCELLED)</option>
          <option value="REFUNDED">환불 (REFUNDED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>고객명/시술명/예약코드 검색:</label>
        <input type="text" placeholder="김지민 시술 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterDesigner, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 예약ID순</option>
          <option value="PRICE_DESC">시술 금액 높은 순 (Error 3)</option>
          <option value="TIME_ASC">예약 시각 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedReservations 대신 원본 배열 인덱스 예약이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 시술 예약 대장 ({reservations.length}건):</label>
        <div className="reservation-stack">
          {reservations.map((res, idx) => (
            <div key={res.id} className={`res-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="res-card-head">
                <span className="branch-badge">{res.branch}</span>
                <span className={`status-badge ${res.status.toLowerCase()}`}>{res.status}</span>
              </div>
              <div className="res-title">{res.clientName} 님 ({res.designerName})</div>
              <div className="res-meta">시술: {res.treatmentName}</div>
              <div className="res-foot">
                <small>금액: {res.priceWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
