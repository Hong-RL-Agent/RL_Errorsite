import React from 'react';

export default function Sidebar({
  filterDept,
  setFilterDept,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  surveys,
  selectedSurveyIndex,
  setSelectedSurveyIndex,
  openDetailMismatch,
  departments
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 진료과 & 문진 답변 검색</h3>

      <div className="filter-group">
        <label>진료과 선택 (Error 5):</label>
        <select 
          value={filterDept} 
          onChange={(e) => {
            setFilterDept(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 진료과 (8개)</option>
          {departments.map(d => (
            <option key={d.id} value={d.name}>
              {d.name} {d.name === '소화기내과' ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 진료과 필터 고속 변경 시 소화기내과(3초 지연)가 정형외과 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>환자명/문진ID 검색:</label>
        <input 
          type="text" 
          placeholder="환자명 또는 문진 ID 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterDept, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>문진 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 문진ID순</option>
          <option value="RISK_DESC">위험도 높은순 (Error 3)</option>
          <option value="PAIN_DESC">통증 점수 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 위험도/통증점수 정렬 후 상세 클릭 시 원본 배열 인덱스 불일치로 다른 환자 문진 상세가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>환자 문진 응답 목록 (최소 45개):</label>
        <div className="survey-stack">
          {surveys.map((srv, idx) => (
            <div 
              key={srv.id}
              className={`survey-card-item ${selectedSurveyIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedSurveyIndex(idx)}
            >
              <div className="survey-card-head">
                <span className="dept-badge">{srv.deptName}</span>
                <span className={`risk-badge ${srv.riskLevel.toLowerCase()}`}>{srv.riskLevel}</span>
              </div>
              <div className="survey-patient">{srv.patientName} 환자 ({srv.id})</div>
              <div className="survey-complaint">{srv.chiefComplaint}</div>
              <div className="survey-foot">
                <small>통증점수: {srv.painScore}/10</small>
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
