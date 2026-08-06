import React from 'react';

export default function Sidebar({
  filterFloor,
  setFilterFloor,
  filterStatus,
  setFilterStatus,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  rooms,
  selectedRoomIndex,
  setSelectedRoomIndex,
  openDetailMismatch
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 층별 & 객실 상태 필터</h3>

      <div className="filter-group">
        <label>층 선택 (Error 5):</label>
        <select 
          value={filterFloor} 
          onChange={(e) => {
            setFilterFloor(e.target.value);
            triggerSearchRace(e.target.value, filterStatus);
          }}
        >
          <option value="ALL">전체 층 (1~3층)</option>
          <option value="1">1층 객실 (Error 5 - 3초 지연)</option>
          <option value="2">2층 객실 (0.2초 완료)</option>
          <option value="3">3층 객실 (스위트/디럭스)</option>
        </select>
        <small className="warn-desc">* 층 필터 고속 변경 시 1층 응답(3초 지연)이 늦게 완료되어 2층 배치도를 덮어쓰고 우측 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>객실 상태 필터:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            triggerSearchRace(filterFloor, e.target.value);
          }}
        >
          <option value="ALL">전체 상태</option>
          <option value="CHECKED_IN">체크인 (CHECKED_IN)</option>
          <option value="CHECKED_OUT">체크아웃 (CHECKED_OUT)</option>
          <option value="CLEANING">청소중 (CLEANING)</option>
          <option value="CLEANED">청소완료 (CLEANED)</option>
          <option value="INSPECTION_NEEDED">점검필요 (INSPECTION_NEEDED)</option>
          <option value="RESERVED">예약중 (RESERVED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 방번호순</option>
          <option value="PRICE_DESC">가격 높은순 (Error 3)</option>
          <option value="FLOOR_DESC">고층순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 가격/층별 정렬 후 상세보기 클릭 시 원본 배열 인덱스 불일치로 다른 객실 상세가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>호텔 관제 객실 목록 (총 45개):</label>
        <div className="rooms-stack">
          {rooms.map((rm, idx) => (
            <div 
              key={rm.id}
              className={`room-card-item ${selectedRoomIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedRoomIndex(idx)}
            >
              <div className="room-card-head">
                <span className="room-no">{rm.id}호</span>
                <span className={`status-badge ${rm.status.toLowerCase()}`}>{rm.status}</span>
              </div>
              <div className="room-card-body">
                <span>{rm.type} | ₩{rm.price.toLocaleString()}</span>
                <span className="cleaner-lbl">담당: {rm.cleanerName}</span>
              </div>
              <div className="room-card-foot">
                <small>투숙객: {rm.guestName || '-'}</small>
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
