import React from 'react';

export default function Sidebar({
  filterFloor,
  setFilterFloor,
  filterType,
  setFilterType,
  availSortOrder,
  setAvailSortOrder,
  triggerSearchRace,
  equipments,
  selectedEquipment,
  setSelectedEquipment,
  confirmEquipmentReserve
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 층 & 장비 유형 필터</h3>

      <div className="filter-group">
        <label>회의실 층 선택 (Error 5):</label>
        <select 
          value={filterFloor} 
          onChange={(e) => {
            setFilterFloor(e.target.value);
            triggerSearchRace(e.target.value, filterType);
          }}
        >
          <option value="ALL">전체 층</option>
          <option value="1">1층 (본관 대회의실)</option>
          <option value="2">2층 (세미나실/미팅룸)</option>
          <option value="3">3층 (아이디어룸 - Error 5)</option>
          <option value="4">4층 (임원/전략기획실)</option>
          <option value="5">5층 (스튜디오/라운지)</option>
        </select>
        <small className="warn-desc">* 층 고속 변경 시 이전 응답(3층 3초)이 최신 결과를 덮어써 중앙 회의실 목록과 오른쪽 예약 요약이 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>공용 장비 카테고리:</label>
        <select 
          value={filterType} 
          onChange={(e) => {
            setFilterType(e.target.value);
            triggerSearchRace(filterFloor, e.target.value);
          }}
        >
          <option value="ALL">전체 장비</option>
          <option value="PROJECTOR">빔프로젝터</option>
          <option value="LAPTOP">노트북</option>
          <option value="VIDEO_CONF">화상회의 세트</option>
          <option value="AUDIO">마이크/음향</option>
          <option value="MONITOR">대형 모니터/전자칠판</option>
        </select>
      </div>

      <div className="filter-group">
        <label>사용가능순 정렬 (Error 3):</label>
        <select value={availSortOrder} onChange={(e) => setAvailSortOrder(e.target.value)}>
          <option value="NONE">기본 순서</option>
          <option value="AVAILABLE_FIRST">사용가능순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 사용가능순 정렬 상태에서 예약 클릭 시 정렬 인덱스 불일치로 다른 장비가 예약 저장됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>공용 장비 목록 (최소 25개):</label>
        <div className="equipments-stack">
          {equipments.map((e, idx) => (
            <div 
              key={e.id}
              className={`eqp-card ${selectedEquipment?.id === e.id ? 'active' : ''}`}
              onClick={() => setSelectedEquipment(e)}
            >
              <div className="eqp-head">
                <span className="eqp-type-tag">{e.type}</span>
                <span className={`status-badge ${e.status === 'AVAILABLE' ? 'confirmed' : 'cancelled'}`}>{e.status}</span>
              </div>
              <div className="eqp-title">{e.name}</div>
              <div className="eqp-foot">
                <span>누적 {e.useCount}회 사용</span>
                <button 
                  className="reserve-btn-sm"
                  onClick={(event) => { event.stopPropagation(); confirmEquipmentReserve(idx); }}
                >
                  장비 예약 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
