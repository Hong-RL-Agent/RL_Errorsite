import React from 'react';

export default function Sidebar({
  filterPlan,
  setFilterPlan,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  organizations,
  selectedOrgIndex,
  setSelectedOrgIndex,
  openDetailMismatch,
  plans
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 구독 요금제 & 조직 검색</h3>

      <div className="filter-group">
        <label>요금제 필터 선택 (Error 5):</label>
        <select 
          value={filterPlan} 
          onChange={(e) => {
            setFilterPlan(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 요금제 (10개 조직)</option>
          {plans.map(p => (
            <option key={p.id} value={p.id}>
              {p.name} {p.id === 'PLN-ENTERPRISE' ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 요금제 필터 고속 변경 시 Enterprise(3초 지연)가 Basic 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>조직명/조직ID 검색:</label>
        <input 
          type="text" 
          placeholder="조직명 또는 ID 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterPlan, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>팀원 라이선스 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 팀원 ID순</option>
          <option value="ROLE_DESC">권한 높은순 (Error 3)</option>
          <option value="CALLS_DESC">API 사용량 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 팀원 목록 정렬 후 라이선스 변경 클릭 시 원본 배열 인덱스 불일치로 다른 팀원 라이선스가 변경됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>구독 고객사 조직 목록 (최소 10개):</label>
        <div className="org-stack">
          {organizations.map((org, idx) => (
            <div 
              key={org.id}
              className={`org-card-item ${selectedOrgIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedOrgIndex(idx)}
            >
              <div className="org-card-head">
                <span className="plan-badge">{org.planName}</span>
                <span className={`status-badge ${org.status.toLowerCase()}`}>{org.status}</span>
              </div>
              <div className="org-title">{org.name} ({org.id})</div>
              <div className="org-meta">
                <span>라이선스: {org.seatsUsed}/{org.seatsAllowed}석</span>
                <small className="email-lbl">{org.billingEmail}</small>
              </div>
              <div className="org-foot">
                <small>사업자: {org.bizRegNo}</small>
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
