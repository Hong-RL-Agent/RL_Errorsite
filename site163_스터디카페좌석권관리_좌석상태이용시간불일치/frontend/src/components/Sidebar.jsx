import React from 'react';

export default function Sidebar({ filterBranchName, setFilterBranchName, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, seats, selectedIdx, setSelectedIdx, openDetailMismatch, branches }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📚 스터디 지점 & 좌석 상태 필터</h3>

      <div className="filter-group">
        <label>스터디카페 지점 선택 (Error 5):</label>
        <select value={filterBranchName} onChange={(e) => { setFilterBranchName(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 지점</option>
          <option value="강남역 본점 프리미엄관">강남본점 (3초 지연 - Error 5)</option>
          <option value="신촌 연세로 24h 스터디존">신촌점 (0.2초 완료)</option>
          <option value="홍대입구역 집중공부관">홍대점</option>
        </select>
        <small className="warn-desc">* 강남본점(3초 지연)→신촌점(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>좌석 이용 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterBranchName, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="AVAILABLE">빈좌석 (AVAILABLE)</option>
          <option value="IN_USE">사용중 (IN_USE)</option>
          <option value="AWAY">외출중 (AWAY)</option>
          <option value="CHECKED_OUT">퇴실완료 (CHECKED_OUT)</option>
          <option value="CANCELLED">이용권취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>회원명/좌석번호/지점 검색:</label>
        <input type="text" placeholder="최공부 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterBranchName, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 좌석ID순</option>
          <option value="TIME_DESC">남은 이용시간 많은 순 (Error 3)</option>
          <option value="SEAT_ASC">좌석 번호순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedSeats 대신 원본 배열 인덱스 회원이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 좌석 이용 대장 ({seats.length}개):</label>
        <div className="seat-stack">
          {seats.map((st, idx) => (
            <div key={st.id} className={`st-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="st-card-head">
                <span className="branch-badge">{st.branchName.split(' ')[0]}</span>
                <span className={`status-badge ${st.status.toLowerCase()}`}>{st.status}</span>
              </div>
              <div className="st-title">{st.seatNo.split(' ')[0]} ({st.currentMember})</div>
              <div className="st-meta">시간: {st.startTime.split(' ')[1]}~{st.endTime.split(' ')[1]}</div>
              <div className="st-foot">
                <small>잔여: {st.remainingHours}시간</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
