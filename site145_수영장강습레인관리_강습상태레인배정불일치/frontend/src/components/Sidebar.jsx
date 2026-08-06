import React from 'react';

export default function Sidebar({ filterLevel, setFilterLevel, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, members, selectedIdx, setSelectedIdx, openDetailMismatch, lanes }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🏊 강습 레벨 & 진행 상태 필터</h3>

      <div className="filter-group">
        <label>강습 레벨 선택 (Error 5):</label>
        <select value={filterLevel} onChange={(e) => { setFilterLevel(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 강습 레벨</option>
          <option value="상급 (ADVANCED)">상급 (ADVANCED) (3초 지연 - Error 5)</option>
          <option value="중급 (INTERMEDIATE)">중급 (INTERMEDIATE) (0.2초 완료)</option>
          <option value="초급 (BEGINNER)">초급 (BEGINNER)</option>
        </select>
        <small className="warn-desc">* 상급(3초 지연)→중급(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>강습 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterLevel, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="OPEN">접수중 (OPEN)</option>
          <option value="IN_PROGRESS">진행중 (IN_PROGRESS)</option>
          <option value="ATTENDED">출석완료 (ATTENDED)</option>
          <option value="COMPLETED">종료됨 (COMPLETED)</option>
          <option value="CANCELLED">취소됨 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>회원명/강습반/강사/코드 검색:</label>
        <input type="text" placeholder="홍길동 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterLevel, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 회원ID순</option>
          <option value="ATTEND_DESC">출석률 높은 순 (Error 3)</option>
          <option value="REG_ASC">강습 등록일 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedMembers 대신 원본 배열 인덱스 회원이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 수영 강습 회원 대장 ({members.length}명):</label>
        <div className="member-stack">
          {members.map((mbr, idx) => (
            <div key={mbr.id} className={`mbr-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="mbr-card-head">
                <span className="lane-badge">{mbr.laneNo.split(' ')[0]}</span>
                <span className={`status-badge ${mbr.status.toLowerCase()}`}>{mbr.status}</span>
              </div>
              <div className="mbr-title">{mbr.name} ({mbr.className})</div>
              <div className="mbr-meta">강사: {mbr.instructor} | 레벨: {mbr.level.split(' ')[0]}</div>
              <div className="mbr-foot">
                <small>출석률: {mbr.attendanceRatePercent}%</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
