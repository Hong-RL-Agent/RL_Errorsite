import React from 'react';

export default function Sidebar({ filterCounselor, setFilterCounselor, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, counsels, selectedIdx, setSelectedIdx, openDetailMismatch, counselors }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🗣️ 전문 상담사 & 예약 상태 필터</h3>

      <div className="filter-group">
        <label>담당 상담사 선택 (Error 5):</label>
        <select value={filterCounselor} onChange={(e) => { setFilterCounselor(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 상담사</option>
          <option value="김심리 수석상담사">김심리 수석센터장 (3초 지연 - Error 5)</option>
          <option value="이마음 멘탈케어관">이마음 멘탈케어관 (0.2초 완료)</option>
          <option value="박코칭 상담사">박코칭 수석상담사</option>
        </select>
        <small className="warn-desc">* 김심리(3초 지연)→이마음(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>상담 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterCounselor, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="SCHEDULED">예약완료 (SCHEDULED)</option>
          <option value="IN_COUNSEL">상담중 (IN_COUNSEL)</option>
          <option value="FOLLOWUP">후속예정 (FOLLOWUP)</option>
          <option value="COMPLETED">상담완료 (COMPLETED)</option>
          <option value="CANCELLED">예약취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>내담자/상담주제/코드 검색:</label>
        <input type="text" placeholder="최내담 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterCounselor, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 예약ID순</option>
          <option value="DATE_ASC">상담 일시 빠른 순 (Error 3)</option>
          <option value="PRIORITY_DESC">우선순위 중요도 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedCounsels 대신 원본 배열 인덱스 예약이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 심리 상담 예약 대장 ({counsels.length}건):</label>
        <div className="counsel-stack">
          {counsels.map((cnsl, idx) => (
            <div key={cnsl.id} className={`cnsl-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="cnsl-card-head">
                <span className="counselor-badge">{cnsl.counselorName.split(' ')[0]}</span>
                <span className={`status-badge ${cnsl.status.toLowerCase()}`}>{cnsl.status}</span>
              </div>
              <div className="cnsl-title">{cnsl.clientName} 님 ({cnsl.topic.split(' ')[0]})</div>
              <div className="cnsl-meta">일시: {cnsl.counselDate} | 중요도: {cnsl.priority}</div>
              <div className="cnsl-foot">
                <small>상담료: {cnsl.feeWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
