import React from 'react';

export default function Sidebar({ filterMountain, setFilterMountain, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, reports, selectedIdx, setSelectedIdx, openDetailMismatch, trailSections }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🌲 산림 구역 & 안전 신고 필터</h3>

      <div className="filter-group">
        <label>국립공원 구역 선택 (Error 5):</label>
        <select value={filterMountain} onChange={(e) => { setFilterMountain(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 국립공원 구역</option>
          <option value="북한산 국립공원">북한산 국립공원 (3초 지연 - Error 5)</option>
          <option value="설악산 국립공원">설악산 국립공원 (0.2초 완료)</option>
          <option value="지리산 국립공원">지리산 국립공원</option>
          <option value="계룡산 국립공원">계룡산 국립공원</option>
          <option value="한라산 국립공원">한라산 국립공원</option>
        </select>
        <small className="warn-desc">* 북한산(3초 지연)→설악산(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>신고 처리 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterMountain, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="PENDING">신고접수 (PENDING)</option>
          <option value="INSPECTING">현장확인 (INSPECTING)</option>
          <option value="IN_ACTION">조치중 (IN_ACTION)</option>
          <option value="RESOLVED">조치완료 (RESOLVED)</option>
          <option value="CLEARED">위험구역해제 (CLEARED)</option>
          <option value="CANCELLED">신고취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>위치설명/신고유형/신고자 검색:</label>
        <input type="text" placeholder="백운대 낙석 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterMountain, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 신고ID순</option>
          <option value="GRADE_DESC">위험 등급 긴급순 (Error 3)</option>
          <option value="TIME_DESC">신고 시각 최신순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedReports 대신 원본 배열 인덱스 신고가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 등산로 위험 신고 대장 ({reports.length}건):</label>
        <div className="report-stack">
          {reports.map((rpt, idx) => (
            <div key={rpt.id} className={`rpt-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="rpt-card-head">
                <span className="danger-grade-badge">{rpt.dangerGrade.split(' ')[0]}</span>
                <span className={`status-badge ${rpt.status.toLowerCase()}`}>{rpt.status}</span>
              </div>
              <div className="rpt-title">{rpt.reportType}</div>
              <div className="rpt-meta">위치: {rpt.locationDesc}</div>
              <div className="rpt-foot">
                <small>담당: {rpt.assignedTeam.split(' ')[0]}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
