import React from 'react';

export default function Sidebar({ filterZone, setFilterZone, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, containers, selectedIdx, setSelectedIdx, openDetailMismatch }) {
  const zones = ['A구역', 'B구역', 'C구역', 'D구역', 'E구역'];
  return (
    <aside className="panel-section filter-sidebar">
      <h3>⚓ 야드 구역 필터 & 컨테이너 검색</h3>
      <div className="filter-group">
        <label>야드 구역 선택 (Error 5):</label>
        <select value={filterZone} onChange={(e) => { setFilterZone(e.target.value); triggerSearchRace(e.target.value, searchTerm); }}>
          <option value="ALL">전체 구역 (A~E구역)</option>
          {zones.map(z => <option key={z} value={z}>{z}{z === 'A구역' ? ' (Error 5 - 3초 지연)' : ''}</option>)}
        </select>
        <small className="warn-desc">* 야드 구역 필터 고속 변경 시 A구역(3초 지연)이 B구역 결과를 덮어쓰고 야드 배치도와 어긋남 (Error 5)</small>
      </div>
      <div className="filter-group">
        <label>컨테이너번호/목적지 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterZone, e.target.value); }} />
      </div>
      <div className="filter-group">
        <label>컨테이너 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 컨테이너ID순</option>
          <option value="ARRIVAL_ASC">도착시간 빠른순 (Error 3)</option>
          <option value="DANGEROUS_FIRST">위험물 우선순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 도착시간/위험물 정렬 후 상세 클릭 시 원본 배열 인덱스 불일치로 다른 컨테이너가 열림 (Error 3)</small>
      </div>
      <div className="filter-group">
        <label>컨테이너 대기열 (최소 60개):</label>
        <div className="ctn-stack">
          {containers.map((ctn, idx) => (
            <div key={ctn.id} className={`ctn-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="ctn-card-head">
                <span className="zone-badge">{ctn.zone} {ctn.yardBlock}</span>
                <span className={`status-badge ${ctn.status.toLowerCase()}`}>{ctn.status}</span>
              </div>
              <div className="ctn-no">{ctn.containerNo}</div>
              <div className="ctn-dest">{ctn.destination} | {ctn.weightTon}t {ctn.isDangerous ? '⚠️위험물' : ''}</div>
              <div className="ctn-foot">
                <small>{ctn.vesselName}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (Error 3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
