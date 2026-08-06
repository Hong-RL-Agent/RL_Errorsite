import React from 'react';

export default function Sidebar({ filterGenre, setFilterGenre, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, books, selectedIdx, setSelectedIdx, openDetailMismatch }) {
  const genres = ['소설', '인문/교양', '경제/경영', '자기계발/IT', '역사/사회'];

  return (
    <aside className="panel-section filter-sidebar">
      <h3>📚 도서 목록 & 검색</h3>

      <div className="filter-group">
        <label>장르 필터 선택 (Error 5):</label>
        <select value={filterGenre} onChange={(e) => { setFilterGenre(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 장르</option>
          {genres.map(g => (
            <option key={g} value={g}>{g}{g === '소설' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* 소설(3초 지연)→인문/교양(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>계약/출간 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterGenre, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="REVIEWING">원고검토 (REVIEWING)</option>
          <option value="CONTRACTED">계약체결 (CONTRACTED)</option>
          <option value="PUBLISHED">출간확정 (PUBLISHED)</option>
          <option value="SETTLING">정산대기 (SETTLING)</option>
          <option value="COMPLETED">정산완료 (COMPLETED)</option>
          <option value="CANCELLED">계약해지 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>도서제목/저자/장르 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterGenre, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 도서ID순</option>
          <option value="SALES_DESC">누적 판매량순 (Error 3)</option>
          <option value="PUB_DESC">최신 출간일순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedBooks 대신 원본 배열 인덱스 도서가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>출판 도서 목록 ({books.length}개):</label>
        <div className="book-stack">
          {books.map((bk, idx) => (
            <div key={bk.id} className={`book-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="bk-card-head">
                <span className="genre-badge">{bk.genre}</span>
                <span className={`status-badge ${bk.status.toLowerCase()}`}>{bk.status}</span>
              </div>
              <div className="bk-title">{bk.title}</div>
              <div className="bk-meta">저자: {bk.authorName} | 인세율: {bk.royaltyRate}% | 판매: {bk.totalSalesCopies.toLocaleString()}부</div>
              <div className="bk-foot">
                <small>{bk.pubDate}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
