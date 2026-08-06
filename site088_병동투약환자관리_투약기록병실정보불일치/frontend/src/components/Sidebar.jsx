import React from 'react';

export default function Sidebar({
  filterWard,
  setFilterWard,
  filterStatus,
  setFilterStatus,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  patients,
  selectedPatientIndex,
  setSelectedPatientIndex,
  openDetailMismatch
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 병동 & 환자 상태 필터</h3>

      <div className="filter-group">
        <label>병동 선택 (Error 5):</label>
        <select 
          value={filterWard} 
          onChange={(e) => {
            setFilterWard(e.target.value);
            triggerSearchRace(e.target.value, filterStatus);
          }}
        >
          <option value="ALL">전체 병동</option>
          <option value="3A">3A 병동 (내과계 - Error 5)</option>
          <option value="3B">3B 병동 (외과계)</option>
          <option value="4A">4A 병동 (심뇌혈관)</option>
          <option value="4B">4B 병동 (종양혈액)</option>
          <option value="5A">5A 병동 (호흡기/소화기)</option>
          <option value="ICU">중환자실 (ICU)</option>
        </select>
        <small className="warn-desc">* 병동 고속 변경 시 이전 응답(3A병동 3초)이 최신 결과를 덮어써 중앙 목록과 오른쪽 요약이 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>입원 상태 필터:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            triggerSearchRace(filterWard, e.target.value);
          }}
        >
          <option value="ALL">전체 상태</option>
          <option value="ADMITTED">입원중 (ADMITTED)</option>
          <option value="DISCHARGED">퇴원 (DISCHARGED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>중증도 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 순서</option>
          <option value="SEVERITY_DESC">중증도 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 중증도 정렬 상태에서 상세 클릭 시 인덱스 불일치로 다른 환자의 병실/투약 정보가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>병동 입원 환자 목록 (최소 30명):</label>
        <div className="patients-stack">
          {patients.map((p, idx) => (
            <div 
              key={p.id}
              className={`patient-card ${selectedPatientIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedPatientIndex(idx)}
            >
              <div className="pat-head">
                <span className="room-tag">{p.roomNo} ({p.ward})</span>
                <span className={`status-badge ${p.status.toLowerCase()}`}>{p.status}</span>
              </div>
              <div className="pat-title">{p.name} ({p.gender}/{p.age}세)</div>
              <div className="pat-foot">
                <span>진단: {p.diagnosis}</span>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}
                >
                  상세보기 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
