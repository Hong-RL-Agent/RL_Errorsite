import React from 'react';

export default function Sidebar({ filterOptionType, setFilterOptionType, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, orders, selectedIdx, setSelectedIdx, openDetailMismatch, options }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🛠️ 제작 옵션 & 주문 상태 필터</h3>

      <div className="filter-group">
        <label>제작 옵션 유형 선택 (Error 5):</label>
        <select value={filterOptionType} onChange={(e) => { setFilterOptionType(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 옵션</option>
          <option value="천연 가극 각인 커스텀 지갑">천연 가죽 각인 지갑 (3초 지연 - Error 5)</option>
          <option value="원목 커스텀 테이블 세트">원목 커스텀 테이블 (0.2초 완료)</option>
          <option value="핸드메이드 도자기 식기 럭셔리">수제 도자기 식기</option>
        </select>
        <small className="warn-desc">* 가죽 각인(3초 지연)→원목 테이블(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>제작 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterOptionType, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="ORDERED">주문접수 (ORDERED)</option>
          <option value="IN_PRODUCTION">제작중 (IN_PRODUCTION)</option>
          <option value="INSPECTING">품질검수 (INSPECTING)</option>
          <option value="SHIPPED">발송완료 (SHIPPED)</option>
          <option value="CANCELLED">주문취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>고객명/상품명/옵션색상/코드 검색:</label>
        <input type="text" placeholder="최공방 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterOptionType, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 주문ID순</option>
          <option value="PRICE_DESC">주문 금액 높은 순 (Error 3)</option>
          <option value="DATE_ASC">제작 마감일 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedOrders 대신 원본 배열 인덱스 주문이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 공방 주문 제작 대장 ({orders.length}건):</label>
        <div className="order-stack">
          {orders.map((ord, idx) => (
            <div key={ord.id} className={`ord-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="ord-card-head">
                <span className="option-badge">{ord.optionType.split(' ')[0]}</span>
                <span className={`status-badge ${ord.status.toLowerCase()}`}>{ord.status}</span>
              </div>
              <div className="ord-title">{ord.customerName} 고객님 ({ord.productName.split(' ')[0]})</div>
              <div className="ord-meta">색상: {ord.optionColor} | 담당: {ord.artisanName}</div>
              <div className="ord-foot">
                <small>금액: {ord.orderPriceWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
