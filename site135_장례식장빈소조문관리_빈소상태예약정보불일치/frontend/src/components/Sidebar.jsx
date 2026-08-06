import React from 'react';

export default function Sidebar({ filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, altars, selectedIdx, setSelectedIdx, openDetailMismatch }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🏛️ 장례식장 빈소 & 상태 필터</h3>

      <div className="filter-group">
        <label>빈소 이용 상태 선택 (Error 5):</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(e.target.value, searchTerm); }}>
          <option value="ALL">전체 빈소 (25개소)</option>
          <option value="VACANT">빈소대기 (VACANT - 3초 지연 Error 5)</option>
          <option value="IN_USE">사용중 (IN_USE - 0.2초 완료)</option>
          <option value="GUIDING">안내중 (GUIDING)</option>
          <option value="CLEANING">정리중 (CLEANING)</option>
          <option value="CANCELLED">예약취소 (CANCELLED)</option>
        </select>
        <small className="warn-desc">* VACANT(3초 지연)→IN_USE(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>빈소호수/고인명/상주명 검색:</label>
        <input type="text" placeholder="특실 101호 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 빈소호수순</option>
          <option value="ENTRY_ASC">입실일시 임박순 (Error 3)</option>
          <option value="SIZE_DESC">빈소 평형 대형순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedAltars 대신 원본 배열 인덱스 빈소가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 장례식장 빈소 대장 ({altars.length}개소):</label>
        <div className="altar-stack">
          {altars.map((alt, idx) => (
            <div key={alt.id} className={`altar-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="alt-card-head">
                <span className="altar-no-badge">{alt.altarNo}</span>
                <span className={`status-badge ${alt.status.toLowerCase()}`}>{alt.status}</span>
              </div>
              <div className="alt-title">{alt.deceasedName} ({alt.size.split(' ')[0]})</div>
              <div className="alt-meta">상주: {alt.chiefMourner} | 입실: {alt.entryDate}</div>
              <div className="alt-foot">
                <small>발인: {alt.funeralDate}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
