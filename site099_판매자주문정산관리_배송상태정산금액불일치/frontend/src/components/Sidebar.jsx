import React from 'react';

export default function Sidebar({
  filterStatus,
  setFilterStatus,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  orders,
  selectedOrderIndex,
  setSelectedOrderIndex,
  openDetailMismatch
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 주문 상태 & 상품 검색</h3>

      <div className="filter-group">
        <label>주문 상태 선택 (Error 5):</label>
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 상태 (45건)</option>
          <option value="PAID">결제완료 (Error 5 - 3초 지연)</option>
          <option value="PREPARING">상품준비 (0.2초 완료)</option>
          <option value="SHIPPING">배송중</option>
          <option value="DELIVERED">배송완료</option>
          <option value="CONFIRMED">구매확정</option>
          <option value="CANCELLED">취소</option>
          <option value="RETURNED">반품</option>
        </select>
        <small className="warn-desc">* 상태 필터 고속 변경 시 결제완료(3초 지연)가 상품준비 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>상품명/구매자/주문ID 검색:</label>
        <input 
          type="text" 
          placeholder="검색어 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterStatus, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>주문 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 주문ID순</option>
          <option value="AMOUNT_DESC">결제 금액 높은순 (Error 3)</option>
          <option value="DATE_DESC">최근 주문일순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 결제금액/주문일 정렬 후 상세 클릭 시 원본 배열 인덱스 불일치로 다른 주문 상세가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>스토어 주문 목록 (최소 45개):</label>
        <div className="order-stack">
          {orders.map((ord, idx) => (
            <div 
              key={ord.id}
              className={`order-card-item ${selectedOrderIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedOrderIndex(idx)}
            >
              <div className="order-card-head">
                <span className={`status-badge ${ord.status.toLowerCase()}`}>{ord.status}</span>
                <span className="order-id">{ord.id}</span>
              </div>
              <div className="order-product">{ord.productName}</div>
              <div className="order-meta">
                <span>구매자: {ord.buyerName}</span>
                <span className="amount-lbl">₩{ord.totalAmount.toLocaleString()}원</span>
              </div>
              <div className="order-foot">
                <small>송장: {ord.trackingNo || '미등록'}</small>
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
