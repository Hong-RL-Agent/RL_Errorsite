import React from 'react';

export default function Sidebar({ filterHub, setFilterHub, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, parcels, selectedIdx, setSelectedIdx, openDetailMismatch, hubs }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📮 분류센터 & 우편물 필터</h3>

      <div className="filter-group">
        <label>분류센터 선택 (Error 5):</label>
        <select value={filterHub} onChange={(e) => { setFilterHub(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 물류센터 (12개 센터)</option>
          {hubs.map(h => (
            <option key={h.id} value={h.id}>{h.name}{h.id === 'HUB-01' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* HUB-01 동서울(3초 지연)→HUB-02 서서울(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>우편 배송 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterHub, e.target.value, searchTerm); }}>
          <option value="ALL">전체 배송 상태</option>
          <option value="REGISTERED">접수 (REGISTERED)</option>
          <option value="SORTING">분류중 (SORTING)</option>
          <option value="TRANSIT">이동중 (TRANSIT)</option>
          <option value="DELIVERING">배달중 (DELIVERING)</option>
          <option value="COMPLETED">완료 (COMPLETED)</option>
          <option value="RETURNED">반송 (RETURNED)</option>
          <option value="HOLD">보류 (HOLD)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>송장번호/수취인/주소 검색:</label>
        <input type="text" placeholder="EB-987... 검색어 입력" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterHub, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 우편물ID순</option>
          <option value="DATE_DESC">접수 시간 최근순 (Error 3)</option>
          <option value="DIST_DESC">운송 거리(km) 멀리순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedParcels 대신 원본 배열 인덱스 우편물이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>우편물 분류 대기열 ({parcels.length}건):</label>
        <div className="parcel-stack">
          {parcels.map((pcl, idx) => (
            <div key={pcl.id} className={`parcel-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="pcl-card-head">
                <span className="hub-badge">{pcl.hubName.split(' ')[0]}</span>
                <span className={`status-badge ${pcl.status.toLowerCase()}`}>{pcl.status}</span>
              </div>
              <div className="pcl-title">{pcl.trackingNo}</div>
              <div className="pcl-meta">수취인: {pcl.recipientName} | 거리: {pcl.distanceKm}km</div>
              <div className="pcl-foot">
                <small>{pcl.registerDate}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
