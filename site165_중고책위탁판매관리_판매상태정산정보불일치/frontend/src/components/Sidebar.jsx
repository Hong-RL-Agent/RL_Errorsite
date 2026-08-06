import React from 'react';

export default function Sidebar({ filterCategory, setFilterCategory, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, books, selectedIdx, setSelectedIdx, openDetailMismatch, consignors }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📚 카테고리 & 위탁 판매 상태 필터</h3>

      <div className="filter-group">
        <label>도서 카테고리 선택 (Error 5):</label>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 카테고리</option>
          <option value="인문/교양/철학">인문/교양/철학 (3초 지연 - Error 5)</option>
          <option value="소설/에세이/시">소설/에세이/시 (0.2초 완료)</option>
          <option value="경제/경영/자기계발">경제/경영</option>
        </select>
        <small className="warn-desc">* 인문/교양(3초 지연)→소설/에세이(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>판매 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterCategory, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="RECEIVED">위탁접수 (RECEIVED)</option>
          <option value="INSPECTED">검수완료 (INSPECTED)</option>
          <option value="ON_SALE">판매중 (ON_SALE)</option>
          <option value="SOLD">판매완료/정산대기 (SOLD)</option>
          <option value="SETTLED">정산완료 (SETTLED)</option>
          <option value="CANCELLED">판매취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>도서명/저자/위탁자/코드 검색:</label>
        <input type="text" placeholder="사피엔스 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterCategory, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 도서ID순</option>
          <option value="PRICE_DESC">중고 판매가 높은 순 (Error 3)</option>
          <option value="DATE_ASC">위탁 등록일 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedBooks 대신 원본 배열 인덱스 도서가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 위탁 도서 대장 ({books.length}권):</label>
        <div className="book-stack">
          {books.map((bk, idx) => (
            <div key={bk.id} className={`bk-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="bk-card-head">
                <span className="category-badge">{bk.category.split('/')[0]}</span>
                <span className={`status-badge ${bk.status.toLowerCase()}`}>{bk.status}</span>
              </div>
              <div className="bk-title">{bk.title.slice(0, 15)}...</div>
              <div className="bk-meta">저자: {bk.author} | 위탁자: {bk.consignorName}</div>
              <div className="bk-foot">
                <small>판매가: {bk.priceWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
