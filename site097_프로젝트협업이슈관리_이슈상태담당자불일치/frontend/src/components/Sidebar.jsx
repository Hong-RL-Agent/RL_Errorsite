import React from 'react';

export default function Sidebar({
  filterProject,
  setFilterProject,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  issues,
  selectedIssueIndex,
  setSelectedIssueIndex,
  openDetailMismatch,
  projects
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 프로젝트 & 이슈 검색</h3>

      <div className="filter-group">
        <label>프로젝트 필터 (Error 5):</label>
        <select 
          value={filterProject} 
          onChange={(e) => {
            setFilterProject(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 프로젝트 (8개)</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} {p.id === 'PRJ-101' ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 프로젝트 필터 고속 변경 시 PRJ-101(3초 지연)이 PRJ-102 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>이슈 제목/ID 검색:</label>
        <input 
          type="text" 
          placeholder="이슈 제목 또는 ID 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterProject, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>이슈 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 이슈ID순</option>
          <option value="PRIORITY_DESC">우선순위 높은순 (Error 3)</option>
          <option value="DUEDATE_ASC">마감일 임박순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 우선순위/마감일 정렬 후 상세 클릭 시 원본 배열 인덱스 불일치로 다른 이슈 상세가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>프로젝트 이슈 목록 (최소 45개):</label>
        <div className="issue-stack">
          {issues.map((isu, idx) => (
            <div 
              key={isu.id}
              className={`issue-card-item ${selectedIssueIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedIssueIndex(idx)}
            >
              <div className="issue-card-head">
                <span className={`status-badge ${isu.status.toLowerCase()}`}>{isu.status}</span>
                <span className="issue-id">{isu.id}</span>
              </div>
              <div className="issue-title">{isu.title}</div>
              <div className="issue-meta">
                <span>담당: {isu.assigneeName}</span>
                <span className={`priority-badge ${isu.priority.toLowerCase()}`}>{isu.priority}</span>
              </div>
              <div className="issue-foot">
                <small>마감일: {isu.dueDate}</small>
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
