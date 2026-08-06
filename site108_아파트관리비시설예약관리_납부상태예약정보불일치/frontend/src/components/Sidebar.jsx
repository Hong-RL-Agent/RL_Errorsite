import React from 'react';

export default function Sidebar({
  filterBuilding,
  setFilterBuilding,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  complaints,
  selectedComplaintIndex,
  setSelectedComplaintIndex,
  openDetailMismatch
}) {
  const buildings = ['101동', '102동', '103동', '104동', '105동'];

  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 아파트 동 필터 & 민원 검색</h3>

      <div className="filter-group">
        <label>아파트 동 선택 (Error 5):</label>
        <select 
          value={filterBuilding} 
          onChange={(e) => {
            setFilterBuilding(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 아파트 동 (101~105동)</option>
          {buildings.map(b => (
            <option key={b} value={b}>
              {b} {b === '101동' ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 동 필터 고속 변경 시 101동(3초 지연)이 102동 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>입주민 민원 검색:</label>
        <input 
          type="text" 
          placeholder="검색어 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterBuilding, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>민원 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 민원ID순</option>
          <option value="DEADLINE_ASC">처리기한 마감순 (Error 3)</option>
          <option value="URGENCY_DESC">긴급도 우선순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 처리기한/긴급도 정렬 후 상세 클릭 시 원본 배열 인덱스 불일치로 다른 세대 민원이 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>입주민 민원 접수대 (최소 35개):</label>
        <div className="complaint-stack">
          {complaints.map((cmp, idx) => (
            <div 
              key={cmp.id}
              className={`complaint-card-item ${selectedComplaintIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedComplaintIndex(idx)}
            >
              <div className="complaint-card-head">
                <span className="building-badge">{cmp.building} {cmp.room}</span>
                <span className={`urgency-badge ${cmp.urgency.toLowerCase()}`}>{cmp.urgency}</span>
              </div>
              <div className="complaint-title">{cmp.title} ({cmp.id})</div>
              <div className="complaint-note">{cmp.note}</div>
              <div className="complaint-foot">
                <small>마감: {cmp.deadline} | {cmp.assignedStaff}</small>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}
                >
                  상세 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
