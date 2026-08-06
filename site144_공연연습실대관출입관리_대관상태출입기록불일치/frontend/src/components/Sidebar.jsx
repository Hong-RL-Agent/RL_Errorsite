import React from 'react';

export default function Sidebar({ filterRoom, setFilterRoom, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, bookings, selectedIdx, setSelectedIdx, openDetailMismatch, rooms }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🎭 연습실 & 대관 상태 필터</h3>

      <div className="filter-group">
        <label>연습실 공간 선택 (Error 5):</label>
        <select value={filterRoom} onChange={(e) => { setFilterRoom(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 연습실</option>
          <option value="메인 댄스홀 A (특대형)">메인 댄스홀 A (3초 지연 - Error 5)</option>
          <option value="밴드 합주실 B (음향특화)">밴드 합주실 B (0.2초 완료)</option>
          <option value="연극/뮤지컬 연습실 C">연극/뮤지컬 연습실 C</option>
        </select>
        <small className="warn-desc">* 댄스홀 A(3초 지연)→합주실 B(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>대관 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterRoom, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="RESERVED">예약확정 (RESERVED)</option>
          <option value="IN_USE">사용중 (IN_USE)</option>
          <option value="COMPLETED">사용완료 (COMPLETED)</option>
          <option value="CANCELLED">취소됨 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>이용자/팀명/예약코드 검색:</label>
        <input type="text" placeholder="최아티스트 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterRoom, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 예약ID순</option>
          <option value="FEE_DESC">대관 금액 높은 순 (Error 3)</option>
          <option value="TIME_ASC">이용 시작시각 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedBookings 대신 원본 배열 인덱스 예약이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 연습실 대관 예약 대장 ({bookings.length}건):</label>
        <div className="booking-stack">
          {bookings.map((bkg, idx) => (
            <div key={bkg.id} className={`bkg-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="bkg-card-head">
                <span className="room-badge">{bkg.roomName.split(' ')[0]}</span>
                <span className={`status-badge ${bkg.status.toLowerCase()}`}>{bkg.status}</span>
              </div>
              <div className="bkg-title">{bkg.userName} ({bkg.teamName})</div>
              <div className="bkg-meta">시간: {bkg.startTime}~{bkg.endTime} | 출입: {bkg.entryTime}</div>
              <div className="bkg-foot">
                <small>금액: {bkg.totalFeeWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
