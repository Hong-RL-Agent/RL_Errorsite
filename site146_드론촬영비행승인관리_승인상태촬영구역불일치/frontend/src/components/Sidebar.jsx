import React from 'react';

export default function Sidebar({ filterRegion, setFilterRegion, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, requests, selectedIdx, setSelectedIdx, openDetailMismatch, zones }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📡 관제 지역 & 비행 승인 필터</h3>

      <div className="filter-group">
        <label>촬영 관제 지역 선택 (Error 5):</label>
        <select value={filterRegion} onChange={(e) => { setFilterRegion(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 관제 지역</option>
          <option value="서울 강남 관제권">서울 강남 관제권 (3초 지연 - Error 5)</option>
          <option value="인천 송도 비행금지구역">인천 송도 비행금지구역 (0.2초 완료)</option>
          <option value="경기 판교 테크노권">경기 판교 테크노권</option>
        </select>
        <small className="warn-desc">* 강남 관제권(3초 지연)→송도 구역(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>비행 승인 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterRegion, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="PENDING">승인대기 (PENDING)</option>
          <option value="APPROVED">승인완료 (APPROVED)</option>
          <option value="IN_FLIGHT">비행중 (IN_FLIGHT)</option>
          <option value="COMPLETED">촬영완료 (COMPLETED)</option>
          <option value="CANCELLED">승인취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>의뢰제목/촬영구역/신청자 검색:</label>
        <input type="text" placeholder="영동대로 3D 측량 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterRegion, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 의뢰ID순</option>
          <option value="DATE_ASC">촬영 일자 빠른 순 (Error 3)</option>
          <option value="ALT_DESC">최고 고도 높은 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedRequests 대신 원본 배열 인덱스 의뢰가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 드론 촬영 승인 대장 ({requests.length}건):</label>
        <div className="request-stack">
          {requests.map((req, idx) => (
            <div key={req.id} className={`req-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="req-card-head">
                <span className="region-badge">{req.region.split(' ')[1] || req.region}</span>
                <span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span>
              </div>
              <div className="req-title">{req.title}</div>
              <div className="req-meta">신청: {req.requester} | 고도: {req.maxAltM}m</div>
              <div className="req-foot">
                <small>일자: {req.flightDate}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
