import React from 'react';

export default function Sidebar({ filterDistrict, setFilterDistrict, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, reports, selectedIdx, setSelectedIdx, openDetailMismatch, lights }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🏙️ 행정구역 & 점검 상태 필터</h3>

      <div className="filter-group">
        <label>행정구역 선택 (Error 5):</label>
        <select value={filterDistrict} onChange={(e) => { setFilterDistrict(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 행정구역</option>
          <option value="강남구 테헤란로 권역">강남구 테헤란로 권역 (3초 지연 - Error 5)</option>
          <option value="서초구 반포대로 권역">서초구 반포대로 권역 (0.2초 완료)</option>
          <option value="송파구 올림픽로 권역">송파구 올림픽로 권역</option>
        </select>
        <small className="warn-desc">* 테헤란로(3초 지연)→반포대로(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>점검 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterDistrict, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="REPORTED">신고접수 (REPORTED)</option>
          <option value="IN_PROGRESS">점검중 (IN_PROGRESS)</option>
          <option value="COMPLETED">조치완료 (COMPLETED)</option>
          <option value="EMERGENCY">긴급출동 (EMERGENCY)</option>
          <option value="CANCELLED">신고취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>설치위치/관리번호/작업자/코드 검색:</label>
        <input type="text" placeholder="테헤란로 123 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterDistrict, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 신고ID순</option>
          <option value="DATE_ASC">신고 접수일 빠른 순 (Error 3)</option>
          <option value="RISK_DESC">위험도 높은 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedReports 대신 원본 배열 인덱스 신고가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 가로등 고장 신고 대장 ({reports.length}건):</label>
        <div className="report-stack">
          {reports.map((rpt, idx) => (
            <div key={rpt.id} className={`rpt-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="rpt-card-head">
                <span className="district-badge">{rpt.district.split(' ')[0]}</span>
                <span className={`status-badge ${rpt.status.toLowerCase()}`}>{rpt.status}</span>
              </div>
              <div className="rpt-title">{rpt.issueType}</div>
              <div className="rpt-meta">위치: {rpt.location} | 담당: {rpt.workerName}</div>
              <div className="rpt-foot">
                <small>접수일: {rpt.rptDate}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
