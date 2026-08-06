import React from 'react';

export default function Sidebar({ filterGallery, setFilterGallery, filterGrade, setFilterGrade, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, artifacts, selectedIdx, setSelectedIdx, openDetailMismatch, galleries }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🏛️ 소장품 검색 & 필터</h3>

      <div className="filter-group">
        <label>전시실 필터 (Error 5):</label>
        <select value={filterGallery} onChange={(e) => { setFilterGallery(e.target.value); triggerSearchRace(e.target.value, filterGrade, searchTerm); }}>
          <option value="ALL">전체 전시실</option>
          {galleries.map(g => (
            <option key={g.id} value={g.id}>{g.name}{g.id === 'GAL-003' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* 제3전시실(3초 지연)→제1전시실(0.2초) 빠른 변경 시 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>보존등급 필터:</label>
        <select value={filterGrade} onChange={(e) => { setFilterGrade(e.target.value); triggerSearchRace(filterGallery, e.target.value, searchTerm); }}>
          <option value="ALL">전체 등급</option>
          <option value="S">S등급 (최상)</option>
          <option value="A">A등급 (상)</option>
          <option value="B">B등급 (중)</option>
          <option value="C">C등급 (하 / 위험)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>소장품명/시대/분류 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterGallery, filterGrade, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 소장품ID순</option>
          <option value="YEAR_ASC">제작연도 오래된순 (Error 3)</option>
          <option value="GRADE_DESC">보존등급 우선순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedArtifacts 아닌 원본 배열 인덱스 소장품이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>소장품 대기열 ({artifacts.length}개):</label>
        <div className="artifact-stack">
          {artifacts.map((art, idx) => (
            <div key={art.id} className={`artifact-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="art-card-head">
                <span className="grade-badge grade-{art.conservationGrade.toLowerCase()}">{art.conservationGrade}등급</span>
                <span className={`status-badge ${art.status.toLowerCase()}`}>{art.status}</span>
              </div>
              <div className="art-name">{art.name}</div>
              <div className="art-meta">{art.era} · {art.category} · {art.madeYear > 0 ? `${art.madeYear}년경` : `BC ${Math.abs(art.madeYear)}년경`}</div>
              <div className="art-foot">
                <small>{art.galleryName}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
