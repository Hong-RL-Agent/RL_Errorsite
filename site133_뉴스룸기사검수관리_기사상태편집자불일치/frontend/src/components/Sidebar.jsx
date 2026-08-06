import React from 'react';

export default function Sidebar({ filterCategory, setFilterCategory, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, articles, selectedIdx, setSelectedIdx, openDetailMismatch }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📰 카테고리 & 기사 상태 필터</h3>

      <div className="filter-group">
        <label>카테고리 선택 (Error 5):</label>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 카테고리</option>
          <option value="정치/사회">정치/사회 (3초 지연 - Error 5)</option>
          <option value="IT/과학">IT/과학 (0.2초 완료)</option>
          <option value="경제/금융">경제/금융</option>
          <option value="문화/연예">문화/연예</option>
        </select>
        <small className="warn-desc">* 정치/사회(3초 지연)→IT/과학(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>기사 검수/발행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterCategory, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="DRAFT">초안작성 (DRAFT)</option>
          <option value="REVIEWING">검수중 (REVIEWING)</option>
          <option value="APPROVED">승인완료 (APPROVED)</option>
          <option value="SCHEDULED">발행예약 (SCHEDULED)</option>
          <option value="PUBLISHED">최종발행 (PUBLISHED)</option>
          <option value="REJECTED">반려됨 (REJECTED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>제목/작성기자/기사코드 검색:</label>
        <input type="text" placeholder="단독 반도체 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterCategory, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 기사ID순</option>
          <option value="VIEWS_DESC">조회수 높은순 (Error 3)</option>
          <option value="CODE_DESC">최신 기사코드순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedArticles 대신 원본 배열 인덱스 기사가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 기사 데스크 목록 ({articles.length}건):</label>
        <div className="article-stack">
          {articles.map((art, idx) => (
            <div key={art.id} className={`article-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="art-card-head">
                <span className="category-badge">{art.category}</span>
                <span className={`status-badge ${art.status.toLowerCase()}`}>{art.status}</span>
              </div>
              <div className="art-title">{art.title}</div>
              <div className="art-meta">기자: {art.reporterName} | 편집: {art.editorName}</div>
              <div className="art-foot">
                <small>조회수: {art.views.toLocaleString()}회</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
