import React from 'react';

export default function Sidebar({ filterTerminal, setFilterTerminal, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, passes, selectedIdx, setSelectedIdx, openDetailMismatch, lounges }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>✈️ 터미널 라운지 & 이용 상태 필터</h3>

      <div className="filter-group">
        <label>터미널 라운지 선택 (Error 5):</label>
        <select value={filterTerminal} onChange={(e) => { setFilterTerminal(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 라운지</option>
          <option value="제1여객터미널 동편 4층 라운지">T1 동편 라운지 (3초 지연 - Error 5)</option>
          <option value="제2여객터미널 250번 게이트 퍼스트">T2 퍼스트 라운지 (0.2초 완료)</option>
          <option value="탑승동 115번 게이트 중앙 라운지">탑승동 스카이 라운지</option>
        </select>
        <small className="warn-desc">* T1 동편(3초 지연)→T2 퍼스트(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>라운지 이용 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterTerminal, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="ISSUED">발급완료 (ISSUED)</option>
          <option value="CHECKED_IN">체크인 (CHECKED_IN)</option>
          <option value="IN_USE">이용중 (IN_USE)</option>
          <option value="COMPLETED">이용완료 (COMPLETED)</option>
          <option value="CANCELLED">이용취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>승객명/항공편/좌석번호/코드 검색:</label>
        <input type="text" placeholder="최공항 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterTerminal, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 이용권ID순</option>
          <option value="EXPIRE_ASC">만료시간 임박 순 (Error 3)</option>
          <option value="TIER_DESC">승객 등급 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedPasses 대신 원본 배열 인덱스 이용권이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 공항 라운지 이용권 대장 ({passes.length}개):</label>
        <div className="pass-stack">
          {passes.map((pss, idx) => (
            <div key={pss.id} className={`pss-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="pss-card-head">
                <span className="terminal-badge">{pss.terminal.split(' ')[0]}</span>
                <span className={`status-badge ${pss.status.toLowerCase()}`}>{pss.status}</span>
              </div>
              <div className="pss-title">{pss.passengerName} 승객 ({pss.flightNo.split(' ')[0]})</div>
              <div className="pss-meta">좌석: {pss.seatNo} | 등급: {pss.tier}</div>
              <div className="pss-foot">
                <small>만료: {pss.expireTime.split(' ')[1]}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
