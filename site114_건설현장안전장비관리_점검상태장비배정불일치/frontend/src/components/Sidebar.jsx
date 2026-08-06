import React from 'react';

export default function Sidebar({ filterZone, setFilterZone, filterRisk, setFilterRisk, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, inspections, selectedIdx, setSelectedIdx, openDetailMismatch, zones }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🏗️ 현장 구역 & 안전점검 검색</h3>

      <div className="filter-group">
        <label>현장 구역 선택 (Error 5):</label>
        <select value={filterZone} onChange={(e) => { setFilterZone(e.target.value); triggerSearchRace(e.target.value, filterRisk, searchTerm); }}>
          <option value="ALL">전체 현장 구역 (15개 구역)</option>
          {zones.map(z => (
            <option key={z.id} value={z.id}>{z.name}{z.id === 'ZONE-A1' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* A동(3초 지연)→B동(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>위험도 필터:</label>
        <select value={filterRisk} onChange={(e) => { setFilterRisk(e.target.value); triggerSearchRace(filterZone, e.target.value, searchTerm); }}>
          <option value="ALL">전체 위험도</option>
          <option value="CRITICAL">심각 (CRITICAL)</option>
          <option value="HIGH">높음 (HIGH)</option>
          <option value="MEDIUM">보통 (MEDIUM)</option>
          <option value="LOW">낮음 (LOW)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>점검제목/담당자 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterZone, filterRisk, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 점검ID순</option>
          <option value="RISK_DESC">위험도 높은순 (Error 3)</option>
          <option value="DUE_ASC">조치마감 임박순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedInspections 대신 원본 배열 인덱스 점검이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>점검 목록 대기열 ({inspections.length}개):</label>
        <div className="inspection-stack">
          {inspections.map((insp, idx) => (
            <div key={insp.id} className={`inspection-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="insp-card-head">
                <span className="zone-badge">{insp.zoneName}</span>
                <span className={`risk-badge risk-${insp.riskGrade.toLowerCase()}`}>{insp.riskGrade}</span>
              </div>
              <div className="insp-title">{insp.title}</div>
              <div className="insp-meta">장비: {insp.equipmentName} | 마감: {insp.dueDate}</div>
              <div className="insp-foot">
                <small>{insp.workerName}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
