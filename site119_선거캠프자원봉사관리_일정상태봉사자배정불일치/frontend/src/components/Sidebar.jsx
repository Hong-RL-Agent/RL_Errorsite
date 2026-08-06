import React from 'react';

export default function Sidebar({ filterDistrict, setFilterDistrict, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, schedules, selectedIdx, setSelectedIdx, openDetailMismatch, districts }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🏛️ 선거구 일정 검색 & 필터</h3>

      <div className="filter-group">
        <label>선거구 지역 선택 (Error 5):</label>
        <select value={filterDistrict} onChange={(e) => { setFilterDistrict(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 지역 선거구 (12개 구)</option>
          {districts.map(d => (
            <option key={d.id} value={d.id}>{d.name}{d.id === 'DIS-01' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* DIS-01 종로구(3초 지연)→DIS-02 강남구(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>일정 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterDistrict, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="DRAFT">초안 (DRAFT)</option>
          <option value="REVIEWING">검토중 (REVIEWING)</option>
          <option value="CONFIRMED">진행확정 (CONFIRMED)</option>
          <option value="IN_PROGRESS">진행중 (IN_PROGRESS)</option>
          <option value="COMPLETED">진행완료 (COMPLETED)</option>
          <option value="CANCELLED">취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>일정/장소/봉사자 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterDistrict, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 일정ID순</option>
          <option value="REQ_DESC">필요 인원 많은순 (Error 3)</option>
          <option value="DATE_ASC">행사 일자 빠른순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedSchedules 대신 원본 배열 인덱스 일정이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>지역 캠프 일정 대기열 ({schedules.length}개):</label>
        <div className="schedule-stack">
          {schedules.map((sch, idx) => (
            <div key={sch.id} className={`schedule-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="sch-card-head">
                <span className="district-badge">{sch.districtName}</span>
                <span className={`status-badge ${sch.status.toLowerCase()}`}>{sch.status}</span>
              </div>
              <div className="sch-title">{sch.title}</div>
              <div className="sch-meta">담당: {sch.assignedVolunteerName} | 인원: {sch.requiredCount}명 | 장소: {sch.location}</div>
              <div className="sch-foot">
                <small>{sch.eventDate} ({sch.startTime}~{sch.endTime})</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
