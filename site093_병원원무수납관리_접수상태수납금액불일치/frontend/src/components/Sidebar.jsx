import React from 'react';

export default function Sidebar({
  filterDept,
  setFilterDept,
  filterStatus,
  setFilterStatus,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  registrations,
  selectedRegistrationIndex,
  setSelectedRegistrationIndex,
  openDetailMismatch
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 진료과 & 접수 상태 필터</h3>

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
          <option value="내과">내과 (Error 5 - 3초 지연)</option>
          <option value="정형외과">정형외과 (0.2초 완료)</option>
          <option value="이비인후과">이비인후과</option>
          <option value="소아청소년과">소아청소년과</option>
          <option value="피부과">피부과</option>
          <option value="안과">안과</option>
          <option value="신경과">신경과</option>
          <option value="가정의학과">가정의학과</option>
        </select>
        <small className="warn-desc">* 진료과 고속 변경 시 내과 응답(3초 지연)이 정형외과 결과를 덮어쓰고 수납 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>접수 상태 필터:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            triggerSearchRace(filterDept, e.target.value);
          }}
        >
          <option value="ALL">전체 상태</option>
          <option value="WAITING">진료대기 (WAITING)</option>
          <option value="EXAMINING">진료중 (EXAMINING)</option>
          <option value="PAYMENT_WAITING">수납대기 (PAYMENT_WAITING)</option>
          <option value="COMPLETED">수납완료 (COMPLETED)</option>
          <option value="CANCELLED">접수취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>대기열 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 접수순</option>
          <option value="WAIT_DESC">대기시간 긴 순 (Error 3)</option>
          <option value="AMOUNT_DESC">수납금액 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 대기시간/금액 정렬 후 상세보기 클릭 시 원본 배열 인덱스 불일치로 다른 환자의 수납 상세가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>번호표 접수 대기열 (최소 40개):</label>
        <div className="ticket-stack">
          {registrations.map((reg, idx) => (
            <div 
              key={reg.id}
              className={`ticket-card-item ${selectedRegistrationIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedRegistrationIndex(idx)}
            >
              <div className="ticket-card-head">
                <span className="ticket-badge">{reg.ticketNo}</span>
                <span className={`status-badge ${reg.status.toLowerCase()}`}>{reg.status}</span>
              </div>
              <div className="ticket-patient">{reg.patientName} 환자</div>
              <div className="ticket-info">
                <span>진료과: {reg.dept} | 대기시간: {reg.waitTime}분</span>
                <span className="amount-lbl">진료비: ₩{reg.amount.toLocaleString()}</span>
              </div>
              <div className="ticket-card-foot">
                <small>접수시간: {reg.createdAt.slice(11)}</small>
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
