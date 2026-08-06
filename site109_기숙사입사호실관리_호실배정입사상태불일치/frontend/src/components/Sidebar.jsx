import React from 'react';

export default function Sidebar({
  filterBuilding,
  setFilterBuilding,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  applications,
  selectedAppIndex,
  setSelectedAppIndex,
  openApproveMismatch
}) {
  const buildings = ['명덕관', '진리관', '봉사관'];

  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 기숙사동 필터 & 입사 신청 검색</h3>

      <div className="filter-group">
        <label>기숙사동 선택 (Error 5):</label>
        <select 
          value={filterBuilding} 
          onChange={(e) => {
            setFilterBuilding(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 기숙사동 (명덕관/진리관/봉사관)</option>
          {buildings.map(b => (
            <option key={b} value={b}>
              {b} {b === '명덕관' ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 기숙사동 필터 고속 변경 시 명덕관(3초 지연)이 진리관 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>학생명/신청ID/학과 검색:</label>
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
        <label>입사 신청 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 신청ID순</option>
          <option value="GPA_DESC">성적 GPA 높은순 (Error 3)</option>
          <option value="DATE_ASC">신청일 빠른순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 성적/신청일 정렬 후 승인 클릭 시 원본 배열 인덱스 불일치로 다른 학생 신청이 승인됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>기숙사 입사 신청 대기열 (최소 40개):</label>
        <div className="app-stack">
          {applications.map((app, idx) => (
            <div 
              key={app.id}
              className={`app-card-item ${selectedAppIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedAppIndex(idx)}
            >
              <div className="app-card-head">
                <span className="dorm-badge">{app.dormBuilding}</span>
                <span className={`status-badge ${app.status.toLowerCase()}`}>{app.status}</span>
              </div>
              <div className="app-student">{app.studentName} ({app.id})</div>
              <div className="app-gpa">GPA: {app.gpa} / 4.5 | 배정: {app.assignedRoom}</div>
              <div className="app-foot">
                <small>신청일: {app.appDate}</small>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openApproveMismatch(idx); }}
                >
                  승인 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
