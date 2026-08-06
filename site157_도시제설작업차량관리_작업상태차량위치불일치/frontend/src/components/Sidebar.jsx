import React from 'react';

export default function Sidebar({ filterZoneName, setFilterZoneName, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, tasks, selectedIdx, setSelectedIdx, openDetailMismatch, zones }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>❄️ 제설 구역 & 작업 상태 필터</h3>

      <div className="filter-group">
        <label>도시 제설 구역 선택 (Error 5):</label>
        <select value={filterZoneName} onChange={(e) => { setFilterZoneName(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 구역</option>
          <option value="강남권역 제설1구역 (테헤란로/강남대로)">강남1구역 (3초 지연 - Error 5)</option>
          <option value="강북권역 제설2구역 (남산소파로/소월로)">강북2구역 (0.2초 완료)</option>
          <option value="서의도 고가도로 및 마포대교 접근로">여의도/마포 구역</option>
        </select>
        <small className="warn-desc">* 강남1구역(3초 지연)→강북2구역(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>작업 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterZoneName, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="PENDING">대기중 (PENDING)</option>
          <option value="IN_PROGRESS">진행중 (IN_PROGRESS)</option>
          <option value="SALTING">염포작업 (SALTING)</option>
          <option value="COMPLETED">작업완료 (COMPLETED)</option>
          <option value="CANCELLED">작업취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>차량번호/작업자명/위치/코드 검색:</label>
        <input type="text" placeholder="서울01 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterZoneName, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 작업ID순</option>
          <option value="PRIORITY_DESC">긴급도 최우선 순 (Error 3)</option>
          <option value="TIME_ASC">작업 시작시간 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedTasks 대신 원본 배열 인덱스 작업이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 도시 제설 작업 대장 ({tasks.length}건):</label>
        <div className="task-stack">
          {tasks.map((tsk, idx) => (
            <div key={tsk.id} className={`tsk-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="tsk-card-head">
                <span className="zone-badge">{tsk.zoneName.split(' ')[0]}</span>
                <span className={`status-badge ${tsk.status.toLowerCase()}`}>{tsk.status}</span>
              </div>
              <div className="tsk-title">{tsk.vehicleNo.split(' ')[0]} ({tsk.workerName})</div>
              <div className="tsk-meta">위치: {tsk.currentLocation.split(' ')[0]} | 긴급도: {tsk.priority.split(' ')[0]}</div>
              <div className="tsk-foot">
                <small>염화칼슘: {tsk.saltAmountKg}kg</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
