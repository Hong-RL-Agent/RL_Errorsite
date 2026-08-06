import React from 'react';

export default function Sidebar({ filterCategory, setFilterCategory, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, books, selectedIdx, setSelectedIdx, openDetailMismatch }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📚 분야 & 기증 상태 필터</h3>

      <div className="filter-group">
        <label>도서 분야 선택 (Error 5):</label>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 분야 (KDC)</option>
          <option value="인문/사회">인문/사회 (3초 지연 - Error 5)</option>
          <option value="자연과학">자연과학 (0.2초 완료)</option>
          <option value="어린이/동화">어린이/동화</option>
          <option value="건강/취미">건강/취미</option>
        </select>
        <small className="warn-desc">* 인문/사회(3초 지연)→자연과학(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>기증/분류 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterCategory, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="PENDING">접수대기 (PENDING)</option>
          <option value="INSPECTING">상태검수중 (INSPECTING)</option>
          <option value="CLASSIFIED">분류완료 (CLASSIFIED)</option>
          <option value="READY_TO_DISTRIBUTE">배포준비 (READY_TO_DISTRIBUTE)</option>
          <option value="DISTRIBUTED">배포완료 (DISTRIBUTED)</option>
          <option value="CANCELLED">기증취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>제목/저자/기증자/코드 검색:</label>
        <input type="text" placeholder="코스모스 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterCategory, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 도서ID순</option>
          <option value="GRADE_DESC">도서 보존등급 높은순 (Error 3)</option>
          <option value="DATE_ASC">기증 접수일 빠른순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedBooks 대신 원본 배열 인덱스 도서가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 기증 도서 대장 ({books.length}권):</label>
        <div className="book-stack">
          {books.map((bk, idx) => (
            <div key={bk.id} className={`book-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="bk-card-head">
                <span className="condition-badge">{bk.conditionGrade.split(' ')[0]}</span>
                <span className={`status-badge ${bk.status.toLowerCase()}`}>{bk.status}</span>
              </div>
              <div className="bk-title">{bk.title}</div>
              <div className="bk-meta">저자: {bk.author} | 분야: {bk.category}</div>
              <div className="bk-foot">
                <small>배포처: {bk.distributorName.split(' ')[0]}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
