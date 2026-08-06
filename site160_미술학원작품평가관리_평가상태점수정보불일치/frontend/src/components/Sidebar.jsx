import React from 'react';

export default function Sidebar({ filterClassName, setFilterClassName, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, artworks, selectedIdx, setSelectedIdx, openDetailMismatch, classes }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🖼️ 미술 학원 반 & 평가 상태 필터</h3>

      <div className="filter-group">
        <label>미술 실기 반 선택 (Error 5):</label>
        <select value={filterClassName} onChange={(e) => { setFilterClassName(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 실기반</option>
          <option value="입시미술 수시집중 A반">입시미술 A반 (3초 지연 - Error 5)</option>
          <option value="예고입시 소묘실기 B반">예고소묘 B반 (0.2초 완료)</option>
          <option value="디자인 조형 기초 C반">디자인기초 C반</option>
        </select>
        <small className="warn-desc">* 입시미술 A반(3초 지연)→예고소묘 B반(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>평가 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterClassName, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="SUBMITTED">제출완료 (SUBMITTED)</option>
          <option value="EVALUATING">평가중 (EVALUATING)</option>
          <option value="COMPLETED">평가완료 (COMPLETED)</option>
          <option value="CANCELLED">제출취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>학생명/작품제목/코드/강사명 검색:</label>
        <input type="text" placeholder="최그림 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterClassName, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 작품ID순</option>
          <option value="SCORE_DESC">실기 평가 점수 높은 순 (Error 3)</option>
          <option value="DATE_ASC">작품 제출일 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedArtworks 대신 원본 배열 인덱스 작품이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 작품 제출 대장 ({artworks.length}개):</label>
        <div className="artwork-stack">
          {artworks.map((art, idx) => (
            <div key={art.id} className={`art-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="art-card-head">
                <span className="class-badge">{art.className.split(' ')[0]}</span>
                <span className={`status-badge ${art.status.toLowerCase()}`}>{art.status}</span>
              </div>
              <div className="art-title">{art.studentName} ({art.artTitle.slice(0, 14)}...)</div>
              <div className="art-meta">제출일: {art.submitDate} | 담당: {art.instructorName}</div>
              <div className="art-foot">
                <small>점수: {art.score}점 ({art.gradeCategory.split(' ')[0]})</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
