import React from 'react';

export default function Sidebar({ filterStation, setFilterStation, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, chargers, selectedIdx, setSelectedIdx, openDetailMismatch, stations }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🔌 충전소 & 충전기 필터</h3>

      <div className="filter-group">
        <label>충전소 선택 (Error 5):</label>
        <select value={filterStation} onChange={(e) => { setFilterStation(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 충전소 (15개 Station)</option>
          {stations.map(stn => (
            <option key={stn.id} value={stn.id}>{stn.name}{stn.id === 'STN-01' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* STN-01 강남(3초 지연)→STN-02 여의도(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>충전기 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterStation, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="AVAILABLE">사용가능 (AVAILABLE)</option>
          <option value="RESERVED">예약중 (RESERVED)</option>
          <option value="CHARGING">충전중 (CHARGING)</option>
          <option value="INSPECTING">점검중 (INSPECTING)</option>
          <option value="BROKEN">고장 (BROKEN)</option>
          <option value="DISABLED">사용중지 (DISABLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>충전소/타입/위치 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterStation, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 충전기ID순</option>
          <option value="USAGE_DESC">누적 충전량 높은순 (Error 3)</option>
          <option value="KW_DESC">최대 출력 kW 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedChargers 대신 원본 배열 인덱스 충전기가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>충전기 목록 대기열 ({chargers.length}개):</label>
        <div className="charger-stack">
          {chargers.map((chg, idx) => (
            <div key={chg.id} className={`charger-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="chg-card-head">
                <span className="station-badge">{chg.stationName.split(' ')[0]}</span>
                <span className={`status-badge ${chg.status.toLowerCase()}`}>{chg.status}</span>
              </div>
              <div className="chg-title">{chg.chargerType} ({chg.maxKw}kW)</div>
              <div className="chg-meta">위치: {chg.locationFloor} | 누적: {chg.totalKwCharged.toLocaleString()}kWh</div>
              <div className="chg-foot">
                <small>{chg.inspectMemo}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
