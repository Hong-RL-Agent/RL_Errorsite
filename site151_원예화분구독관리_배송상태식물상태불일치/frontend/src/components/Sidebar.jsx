import React from 'react';

export default function Sidebar({ filterPlantType, setFilterPlantType, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, subscribers, selectedIdx, setSelectedIdx, openDetailMismatch, plants }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🪴 식물 유형 & 배송 상태 필터</h3>

      <div className="filter-group">
        <label>식물 유형 선택 (Error 5):</label>
        <select value={filterPlantType} onChange={(e) => { setFilterPlantType(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 식물</option>
          <option value="관엽식물 몬스테라">관엽식물 몬스테라 (3초 지연 - Error 5)</option>
          <option value="다육식물 & 공기정화">다육식물 & 공기정화 (0.2초 완료)</option>
          <option value="허브 & 아로마 라이브 플랜트">허브 & 아로마</option>
        </select>
        <small className="warn-desc">* 몬스테라(3초 지연)→다육식물(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>배송/구독 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterPlantType, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="PREPARING">배송준비 (PREPARING)</option>
          <option value="DELIVERING">배송중 (DELIVERING)</option>
          <option value="DELIVERED">배송완료 (DELIVERED)</option>
          <option value="REPLACING">교체진행 (REPLACING)</option>
          <option value="CANCELLED">구독취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>고객명/식물명/배송지/코드 검색:</label>
        <input type="text" placeholder="최원예 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterPlantType, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 구독ID순</option>
          <option value="HEALTH_ASC">건강도 우수 순 (Error 3)</option>
          <option value="DATE_ASC">배송 일자 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedSubscribers 대신 원본 배열 인덱스 고객이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 원예 화분 구독 대장 ({subscribers.length}명):</label>
        <div className="sub-stack">
          {subscribers.map((sub, idx) => (
            <div key={sub.id} className={`sub-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="sub-card-head">
                <span className="plant-badge">{sub.plantType.split(' ')[0]}</span>
                <span className={`status-badge ${sub.status.toLowerCase()}`}>{sub.status}</span>
              </div>
              <div className="sub-title">{sub.subscriberName} 고객님</div>
              <div className="sub-meta">식물: {sub.plantName.split(' ')[0]} | 건강: {sub.healthStatus}</div>
              <div className="sub-foot">
                <small>배송일: {sub.deliveryDate}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
