import React from 'react';

export default function Sidebar({ filterCounterName, setFilterCounterName, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, orders, selectedIdx, setSelectedIdx, openDetailMismatch, counters }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🛍️ 인도장 카운터 & 픽업 상태 필터</h3>

      <div className="filter-group">
        <label>터미널 인도장 위치 선택 (Error 5):</label>
        <select value={filterCounterName} onChange={(e) => { setFilterCounterName(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 인도장</option>
          <option value="T1 동편 인도장 (11번 게이트 앞)">T1 동편 (3초 지연 - Error 5)</option>
          <option value="T2 중앙 인도장 (252번 게이트 앞)">T2 중앙 (0.2초 완료)</option>
          <option value="T1 서편 인도장 (45번 게이트 앞)">T1 서편</option>
        </select>
        <small className="warn-desc">* T1 동편(3초 지연)→T2 중앙(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>픽업 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterCounterName, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="ORDERED">주문완료 (ORDERED)</option>
          <option value="PREPARING">상품준비중 (PREPARING)</option>
          <option value="READY">준비완료 (READY)</option>
          <option value="COMPLETED">픽업완료 (COMPLETED)</option>
          <option value="CANCELLED">주문취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>승객명/상품명/항공편/주문코드 검색:</label>
        <input type="text" placeholder="최공항 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterCounterName, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 주문ID순</option>
          <option value="TIME_ASC">출국 시간 임박 순 (Error 3)</option>
          <option value="QTY_DESC">면세품 수량 많은 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedOrders 대신 원본 배열 인덱스 주문이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 면세품 픽업 대장 ({orders.length}개):</label>
        <div className="order-stack">
          {orders.map((ord, idx) => (
            <div key={ord.id} className={`ord-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="ord-card-head">
                <span className="counter-badge">{ord.counterName.split(' ')[0]}</span>
                <span className={`status-badge ${ord.status.toLowerCase()}`}>{ord.status}</span>
              </div>
              <div className="ord-title">{ord.passengerName} ({ord.flightNo.split(' ')[0]})</div>
              <div className="ord-meta">상품: {ord.productName.slice(0, 14)}...</div>
              <div className="ord-foot">
                <small>수량: {ord.itemQuantity}개 | ${ord.totalPriceUsd}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
