import React from 'react';

export default function Sidebar({
  filterFlight,
  setFilterFlight,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  baggage,
  selectedBaggageIndex,
  setSelectedBaggageIndex,
  openDetailMismatch,
  flights
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 항공편 필터 & 승객/태그 검색</h3>

      <div className="filter-group">
        <label>항공편 선택 (Error 5):</label>
        <select 
          value={filterFlight} 
          onChange={(e) => {
            setFilterFlight(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 항공편 (20개 운항 노선)</option>
          {flights.map(flt => (
            <option key={flt.id} value={flt.flightNo}>
              {flt.flightNo} ({flt.airline} - {flt.origin}) {flt.flightNo === 'KE081' ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 항공편 필터 고속 변경 시 KE081(3초 지연)이 OZ202 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>승객명/태그번호/수하물ID 검색:</label>
        <input 
          type="text" 
          placeholder="검색어 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterFlight, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>수하물 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 수하물ID순</option>
          <option value="WEIGHT_DESC">수하물 무게 중량순 (Error 3)</option>
          <option value="FLIGHT_ASC">항공편 오름차순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 무게/항공편 정렬 후 상세 클릭 시 원본 배열 인덱스 불일치로 다른 수하물 상세가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>공항 수하물 추적 대기열 (최소 55개):</label>
        <div className="bag-stack">
          {baggage.map((bag, idx) => (
            <div 
              key={bag.id}
              className={`bag-card-item ${selectedBaggageIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedBaggageIndex(idx)}
            >
              <div className="bag-card-head">
                <span className="flight-badge">{bag.flightNo}</span>
                <span className={`status-badge ${bag.status.toLowerCase()}`}>{bag.status}</span>
              </div>
              <div className="bag-tag">{bag.tagNo} ({bag.passengerName} 승객)</div>
              <div className="bag-loc">위치: {bag.location}</div>
              <div className="bag-foot">
                <small>무게: {bag.weightKg}kg | {bag.handlerName}</small>
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
