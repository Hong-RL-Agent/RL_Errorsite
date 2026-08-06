import React from 'react';

export default function Sidebar({ filterLangPair, setFilterLangPair, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, requests, selectedIdx, setSelectedIdx, openDetailMismatch, translators }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🌐 언어쌍 & 검수 상태 필터</h3>

      <div className="filter-group">
        <label>번역 언어쌍 선택 (Error 5):</label>
        <select value={filterLangPair} onChange={(e) => { setFilterLangPair(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 언어쌍</option>
          <option value="한국어 ➔ 영어">한국어 ➔ 영어 (3초 지연 - Error 5)</option>
          <option value="한국어 ➔ 일본어">한국어 ➔ 일본어 (0.2초 완료)</option>
          <option value="한국어 ➔ 중국어">한국어 ➔ 중국어</option>
          <option value="영어 ➔ 한국어">영어 ➔ 한국어</option>
        </select>
        <small className="warn-desc">* 한국어➔영어(3초 지연)→일본어(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>검수/납품 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterLangPair, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="PENDING">의뢰접수 (PENDING)</option>
          <option value="QUOTED">견적산정 (QUOTED)</option>
          <option value="IN_TRANSLATION">번역중 (IN_TRANSLATION)</option>
          <option value="IN_REVIEW">검수완료 (IN_REVIEW)</option>
          <option value="DELIVERED">납품완료 (DELIVERED)</option>
          <option value="CANCELLED">의뢰취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>프로젝트명/고객사/코드 검색:</label>
        <input type="text" placeholder="약관 번역 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterLangPair, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 의뢰ID순</option>
          <option value="FEE_DESC">견적 금액 높은 순 (Error 3)</option>
          <option value="DUE_ASC">납품 마감일 임박 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedRequests 대신 원본 배열 인덱스 의뢰가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 번역 의뢰 대장 ({requests.length}건):</label>
        <div className="request-stack">
          {requests.map((req, idx) => (
            <div key={req.id} className={`req-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="req-card-head">
                <span className="lang-badge">{req.langPair.split(' ➔ ')[1] || req.langPair}</span>
                <span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span>
              </div>
              <div className="req-title">{req.title}</div>
              <div className="req-meta">고객사: {req.company} | 단어: {req.wordCount.toLocaleString()}자</div>
              <div className="req-foot">
                <small>견적: {req.actualFeeWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
