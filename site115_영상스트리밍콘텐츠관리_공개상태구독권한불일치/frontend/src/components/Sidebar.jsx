import React from 'react';

export default function Sidebar({ filterGenre, setFilterGenre, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, contents, selectedIdx, setSelectedIdx, openDetailMismatch }) {
  const genres = ['SF/판타지', '드라마/법정', 'SF/액션', '다큐멘터리', '예능/리얼리티', '사극/추리', '첩보/액션', '로맨틱 코미디', '공포/스릴러', '의학/드라마'];

  return (
    <aside className="panel-section filter-sidebar">
      <h3>🎬 영상 검색 & 필터</h3>

      <div className="filter-group">
        <label>장르 필터 선택 (Error 5):</label>
        <select value={filterGenre} onChange={(e) => { setFilterGenre(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 장르</option>
          {genres.map(g => (
            <option key={g} value={g}>{g}{g === 'SF/액션' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* SF/액션(3초 지연)→드라마/법정(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>공개 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterGenre, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="DRAFT">초안 (DRAFT)</option>
          <option value="REVIEWING">검수중 (REVIEWING)</option>
          <option value="SCHEDULED">공개예정 (SCHEDULED)</option>
          <option value="PUBLISHED">공개중 (PUBLISHED)</option>
          <option value="PRIVATE">비공개 (PRIVATE)</option>
          <option value="RESTRICTED">제한공개 (RESTRICTED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>영상제목/등급/권한 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterGenre, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 콘텐츠ID순</option>
          <option value="VIEWS_DESC">시청수 높은순 (Error 3)</option>
          <option value="RELEASE_DESC">최신 공개일순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedContents 대신 원본 배열 인덱스 영상이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>영상 콘텐츠 목록 ({contents.length}개):</label>
        <div className="content-stack">
          {contents.map((cnt, idx) => (
            <div key={cnt.id} className={`content-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="cnt-card-head">
                <span className="genre-badge">{cnt.genre}</span>
                <span className={`status-badge ${cnt.status.toLowerCase()}`}>{cnt.status}</span>
              </div>
              <div className="cnt-title">{cnt.title}</div>
              <div className="cnt-meta">권한: {cnt.requiredPlan} | 시청: {cnt.viewCount.toLocaleString()}회 | {cnt.rating}</div>
              <div className="cnt-foot">
                <small>{cnt.releaseDate}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
