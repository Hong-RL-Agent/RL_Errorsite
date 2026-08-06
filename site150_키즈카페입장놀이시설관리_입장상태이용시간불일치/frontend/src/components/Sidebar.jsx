import React from 'react';

export default function Sidebar({ filterStore, setFilterStore, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, tickets, selectedIdx, setSelectedIdx, openDetailMismatch, facilities }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🎠 매장 & 입장 상태 필터</h3>

      <div className="filter-group">
        <label>키즈카페 매장 선택 (Error 5):</label>
        <select value={filterStore} onChange={(e) => { setFilterStore(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 매장</option>
          <option value="강남 본점 플래그십">강남 본점 (3초 지연 - Error 5)</option>
          <option value="잠실 롯데월드몰점">잠실 롯데월드몰점 (0.2초 완료)</option>
          <option value="판교 알파돔시티점">판교 알파돔시티점</option>
        </select>
        <small className="warn-desc">* 강남 본점(3초 지연)→잠실점(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>입장 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterStore, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="WAITING">입장대기 (WAITING)</option>
          <option value="IN_USE">이용중 (IN_USE)</option>
          <option value="EXTENDED">연장중 (EXTENDED)</option>
          <option value="CHECKED_OUT">퇴장완료 (CHECKED_OUT)</option>
          <option value="CANCELLED">입장취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>아동명/보호자명/입장코드 검색:</label>
        <input type="text" placeholder="김어린이 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterStore, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 입장권ID순</option>
          <option value="REM_ASC">남은 이용시간 임박 순 (Error 3)</option>
          <option value="TIME_ASC">입장 시각 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedTickets 대신 원본 배열 인덱스 입장권이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 키즈카페 입장권 대장 ({tickets.length}건):</label>
        <div className="ticket-stack">
          {tickets.map((tck, idx) => (
            <div key={tck.id} className={`tck-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="tck-card-head">
                <span className="store-badge">{tck.storeName.split(' ')[0]}</span>
                <span className={`status-badge ${tck.status.toLowerCase()}`}>{tck.status}</span>
              </div>
              <div className="tck-title">{tck.childName} (보호자: {tck.guardianName})</div>
              <div className="tck-meta">입장: {tck.enterTime} | 이용: {tck.allowedHours}시간</div>
              <div className="tck-foot">
                <small>남은시간: {tck.remainingMin}분</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
