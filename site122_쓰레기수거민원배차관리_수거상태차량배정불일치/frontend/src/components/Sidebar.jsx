import React from 'react';

export default function Sidebar({ filterZone, setFilterZone, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, schedules, selectedIdx, setSelectedIdx, openDetailMismatch, zones }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🚛 수거 구역 & 일정 필터</h3>

      <div className="filter-group">
        <label>수거 구역 선택 (Error 5):</label>
        <select value={filterZone} onChange={(e) => { setFilterZone(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 수거 구역 (20개 구역)</option>
          {zones.map(z => (
            <option key={z.id} value={z.id}>{z.name}{z.id === 'ZONE-01' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* ZONE-01 종로(3초 지연)→ZONE-02 강남(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>수거 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterZone, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="PENDING">접수대기 (PENDING)</option>
          <option value="ASSIGNED">차량배정 (ASSIGNED)</option>
          <option value="IN_PROGRESS">수거진행중 (IN_PROGRESS)</option>
          <option value="COMPLETED">수거완료 (COMPLETED)</option>
          <option value="CANCELLED">취소됨 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>구역/차량번호/담당자 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterZone, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 일정ID순</option>
          <option value="COMPLAINT_DESC">민원 건수 많은순 (Error 3)</option>
          <option value="TIME_ASC">수거 시작시간순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedSchedules 대신 원본 배열 인덱스 일정이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>수거 일정 목록 대기열 ({schedules.length}개):</label>
        <div className="schedule-stack">
          {schedules.map((sch, idx) => (
            <div key={sch.id} className={`schedule-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="sch-card-head">
                <span className="zone-badge">{sch.zoneName.split(' ')[0]}</span>
                <span className={`status-badge ${sch.status.toLowerCase()}`}>{sch.status}</span>
              </div>
              <div className="sch-title">{sch.zoneName}</div>
              <div className="sch-meta">차량: {sch.vehiclePlate} | 민원: {sch.complaintCount}건</div>
              <div className="sch-foot">
                <small>{sch.scheduledDate} ({sch.startTime}~{sch.endTime})</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
