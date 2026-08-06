import React from 'react';

export default function Sidebar({ filterRoute, setFilterRoute, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, schedules, selectedIdx, setSelectedIdx, openDetailMismatch, routesList }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🚌 셔틀 노선 & 배차 상태 필터</h3>

      <div className="filter-group">
        <label>셔틀 노선 선택 (Error 5):</label>
        <select value={filterRoute} onChange={(e) => { setFilterRoute(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 노선</option>
          <option value="정문-공학관 순환선 (A노선)">정문-공학관 순환선 (3초 지연 - Error 5)</option>
          <option value="기숙사-지하철역 직행 (B노선)">기숙사-지하철역 직행 (0.2초 완료)</option>
          <option value="인문관-예술관 직행 (C노선)">인문관-예술관 직행</option>
        </select>
        <small className="warn-desc">* A노선(3초 지연)→B노선(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>배차 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterRoute, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="SCHEDULED">배차완료 (SCHEDULED)</option>
          <option value="IN_SERVICE">운행중 (IN_SERVICE)</option>
          <option value="COMPLETED">운행완료 (COMPLETED)</option>
          <option value="DELAYED">지연운행 (DELAYED)</option>
          <option value="CANCELLED">운행취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>차량번호/기사명/노선 검색:</label>
        <input type="text" placeholder="서울 70바 1234 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterRoute, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 배차ID순</option>
          <option value="PASSENGER_DESC">승차 인원 많은 순 (Error 3)</option>
          <option value="TIME_ASC">출발 시각 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedSchedules 대신 원본 배열 인덱스 운행이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 캠퍼스 셔틀 배차 대장 ({schedules.length}건):</label>
        <div className="schedule-stack">
          {schedules.map((sch, idx) => (
            <div key={sch.id} className={`sch-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="sch-card-head">
                <span className="route-badge">{sch.routeName.split(' ')[0]}</span>
                <span className={`status-badge ${sch.status.toLowerCase()}`}>{sch.status}</span>
              </div>
              <div className="sch-title">{sch.busNo} ({sch.driverName})</div>
              <div className="sch-meta">시간: {sch.departureTime}~{sch.arrivalTime} | 혼잡: {sch.congestion.split(' ')[0]}</div>
              <div className="sch-foot">
                <small>승차인원: {sch.passengerCount}/{sch.seatCapacity}명</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
