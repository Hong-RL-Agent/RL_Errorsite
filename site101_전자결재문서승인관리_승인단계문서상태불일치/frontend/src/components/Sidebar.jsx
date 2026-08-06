import React from 'react';

export default function Sidebar({
  filterDept,
  setFilterDept,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  documents,
  selectedDocIndex,
  setSelectedDocIndex,
  openDetailMismatch,
  departments
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 부서 & 전자결재 문서 검색</h3>

      <div className="filter-group">
        <label>부서 선택 (Error 5):</label>
        <select 
          value={filterDept} 
          onChange={(e) => {
            setFilterDept(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 부서 (8개)</option>
          {departments.map(d => (
            <option key={d.id} value={d.name}>
              {d.name} {d.name === '경영지원부' ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 부서 필터 고속 변경 시 경영지원부(3초 지연)가 IT개발부 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>문서 제목/기안자/ID 검색:</label>
        <input 
          type="text" 
          placeholder="검색어 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterDept, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>문서 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 문서ID순</option>
          <option value="DUE_ASC">결재 마감일 임박순 (Error 3)</option>
          <option value="URGENCY_DESC">긴급/중요도순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 마감일/중요도 정렬 후 승인/상세 클릭 시 원본 배열 인덱스 불일치로 다른 문서 승인이 진행됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>결재 대기/기안 문서 (최소 40개):</label>
        <div className="doc-stack">
          {documents.map((doc, idx) => (
            <div 
              key={doc.id}
              className={`doc-card-item ${selectedDocIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedDocIndex(idx)}
            >
              <div className="doc-card-head">
                <span className="dept-badge">{doc.deptName}</span>
                <span className={`status-badge ${doc.status.toLowerCase()}`}>{doc.status}</span>
              </div>
              <div className="doc-title">{doc.title}</div>
              <div className="doc-meta">
                <span>기안자: {doc.drafterName}</span>
                <span className="urgency-lbl">[{doc.urgency}]</span>
              </div>
              <div className="doc-foot">
                <small>마감: {doc.dueDate}</small>
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
