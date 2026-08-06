import React from 'react';

export default function Sidebar({
  filterDept,
  setFilterDept,
  filterStatus,
  setFilterStatus,
  dateSortOrder,
  setDateSortOrder,
  triggerSearchRace,
  appointments,
  selectedAppointment,
  setSelectedAppointment,
  confirmAppointmentEdit
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 진료과 & 예약 상태 필터</h3>
      
      <div className="filter-group">
        <label>진료과 선택 (Error 5):</label>
        <select 
          value={filterDept} 
          onChange={(e) => {
            setFilterDept(e.target.value);
            triggerSearchRace(e.target.value, filterStatus);
          }}
        >
          <option value="ALL">전체 진료과</option>
          <option value="INTERNAL">소화기내과 (INTERNAL - Error 5)</option>
          <option value="ORTHO">정형외과 (ORTHO)</option>
          <option value="CARDIO">순환기내과 (CARDIO)</option>
          <option value="NEURO">신경과 (NEURO)</option>
          <option value="DERMA">피부과 (DERMA)</option>
        </select>
        <small className="warn-desc">* 진료과 고속 변경 시 이전 응답(소화기내과 3초)이 최신 결과를 덮어써 중앙 목록과 오른쪽 환자 요약이 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>예약 상태 필터:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            triggerSearchRace(filterDept, e.target.value);
          }}
        >
          <option value="ALL">전체 상태</option>
          <option value="CONFIRMED">예약 확정 (CONFIRMED)</option>
          <option value="CANCELLED">예약 취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>예약 날짜순 정렬 (Error 3):</label>
        <select value={dateSortOrder} onChange={(e) => setDateSortOrder(e.target.value)}>
          <option value="NONE">등록순 (기본)</option>
          <option value="DATE_ASC">빠른 날짜순 (Error 3)</option>
          <option value="DATE_DESC">늦은 날짜순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 날짜순 정렬 상태에서 예약 변경 클릭 시 정렬 인덱스 불일치로 다른 예약 항목이 수정됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>환자 진료 예약 대장 (최소 25개):</label>
        <div className="appointments-stack">
          {appointments.map((a, idx) => (
            <div 
              key={a.id}
              className={`apt-card ${selectedAppointment?.id === a.id ? 'active' : ''}`}
              onClick={() => setSelectedAppointment(a)}
            >
              <div className="apt-head">
                <span className="dept-tag">{a.deptName}</span>
                <span className={`status-badge ${a.status.toLowerCase()}`}>{a.status}</span>
              </div>
              <div className="apt-name">{a.patientName} | {a.doctorName}</div>
              <div className="apt-foot">
                <span>{a.date} ({a.timeSlot})</span>
                <button 
                  className="edit-apt-btn"
                  onClick={(e) => { e.stopPropagation(); confirmAppointmentEdit(idx); }}
                >
                  예약 변경 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
