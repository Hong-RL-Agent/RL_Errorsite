import React from 'react';

export default function Sidebar({ filterZone, setFilterZone, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, panels, selectedIdx, setSelectedIdx, openDetailMismatch, zones }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>☀️ 발전소 구역 & 패널 검색</h3>

      <div className="filter-group">
        <label>발전소 구역 선택 (Error 5):</label>
        <select value={filterZone} onChange={(e) => { setFilterZone(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 구역 (12개 구역)</option>
          {zones.map(z => (
            <option key={z.id} value={z.id}>{z.name}{z.id === 'ZONE-A01' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* A구역(3초 지연)→B구역(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>패널 점검 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterZone, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="NORMAL">정상 발전 (NORMAL)</option>
          <option value="WARNING">주의 (WARNING)</option>
          <option value="HOTSPOT">핫스팟 이상 (HOTSPOT)</option>
          <option value="INSPECTING">점검 진행중 (INSPECTING)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>패널번호/담당자 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterZone, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 패널ID순</option>
          <option value="OUTPUT_ASC">발전량 낮은순 (Error 3)</option>
          <option value="TEMP_DESC">온도 높음(위험)순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedPanels 대신 원본 배열 인덱스 패널이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>패널 대기열 ({panels.length}개):</label>
        <div className="panel-stack">
          {panels.map((pnl, idx) => (
            <div key={pnl.id} className={`panel-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="pnl-card-head">
                <span className="zone-badge">{pnl.zoneName}</span>
                <span className={`status-badge ${pnl.status.toLowerCase()}`}>{pnl.status}</span>
              </div>
              <div className="pnl-no">{pnl.panelNo}</div>
              <div className="pnl-meta">출력: {pnl.currentKw} kW | 온도: {pnl.tempC}℃ | {pnl.grade}등급</div>
              <div className="pnl-foot">
                <small>{pnl.workerName}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
