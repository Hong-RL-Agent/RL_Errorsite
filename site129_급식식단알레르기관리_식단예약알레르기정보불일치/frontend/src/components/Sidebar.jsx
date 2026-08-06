import React from 'react';

export default function Sidebar({ filterGrade, setFilterGrade, filterRisk, setFilterRisk, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, students, selectedIdx, setSelectedIdx, openDetailMismatch, grades }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🥗 학생 명단 & 알레르기 필터</h3>

      <div className="filter-group">
        <label>학년/반 선택 (Error 5):</label>
        <select value={filterGrade} onChange={(e) => { setFilterGrade(e.target.value); triggerSearchRace(e.target.value, filterRisk, searchTerm); }}>
          <option value="ALL">전체 학년</option>
          {grades.map(g => (
            <option key={g} value={g}>{g}{g.includes('1학년') ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* 1학년(3초 지연)→2학년(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>알레르기 위험도 필터:</label>
        <select value={filterRisk} onChange={(e) => { setFilterRisk(e.target.value); triggerSearchRace(filterGrade, e.target.value, searchTerm); }}>
          <option value="ALL">전체 위험도</option>
          <option value="CRITICAL">최고위험 (CRITICAL)</option>
          <option value="HIGH">고위험 (HIGH)</option>
          <option value="MEDIUM">중위험 (MEDIUM)</option>
          <option value="LOW">일반 (LOW)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>학생명/알레르기/연락처 검색:</label>
        <input type="text" placeholder="홍길동... 검색어 입력" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterGrade, filterRisk, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 학생ID순</option>
          <option value="RISK_DESC">알레르기 위험도 높은순 (Error 3)</option>
          <option value="GRADE_ASC">학년/반 순서 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedStudents 대신 원본 배열 인덱스 학생이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>알레르기 보유 학생 대장 ({students.length}명):</label>
        <div className="student-stack">
          {students.map((std, idx) => (
            <div key={std.id} className={`student-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="std-card-head">
                <span className="grade-badge">{std.gradeClass}</span>
                <span className={`status-badge ${std.riskLevel.toLowerCase()}`}>{std.riskLevel}</span>
              </div>
              <div className="std-title">{std.studentName}</div>
              <div className="std-meta">알레르기: {std.allergies}</div>
              <div className="std-foot">
                <small>보호자: {std.parentPhone}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
