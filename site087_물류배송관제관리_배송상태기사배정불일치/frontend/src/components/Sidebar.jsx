import React from 'react';

export default function Sidebar({
  filterCenter,
  setFilterCenter,
  filterStatus,
  setFilterStatus,
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
      <h3>📌 물류센터 & 배송 상태 필터</h3>

      <div className="filter-group">
        <label>물류센터 선택 (Error 5):</label>
        <select 
          value={filterCenter} 
          onChange={(e) => {
            setFilterCenter(e.target.value);
            triggerSearchRace(e.target.value, filterStatus);
          }}
        >
          <option value="ALL">전체 물류센터</option>
          <option value="CTR-01">서울 중앙 물류센터 (Error 5)</option>
          <option value="CTR-02">경기 허브 터미널</option>
          <option value="CTR-03">중부 메가 물류센터</option>
          <option value="CTR-04">영남 물류 허브</option>
          <option value="CTR-05">호남 물류 터미널</option>
          <option value="CTR-06">제주 서귀포물류센터</option>
        </select>
        <small className="warn-desc">* 센터 고속 변경 시 이전 응답(서울 3초)이 최신 결과를 덮어써 중앙 목록과 오른쪽 요약이 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>배송 상태 필터:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            triggerSearchRace(filterCenter, e.target.value);
          }}
        >
          <option value="ALL">전체 상태</option>
          <option value="RECEIVED">접수완료</option>
          <option value="SORTING">분류중</option>
          <option value="IN_DELIVERY">배송중</option>
          <option value="DELAYED">지연</option>
          <option value="COMPLETED">배송완료</option>
          <option value="CANCELLED">배송취소</option>
        </select>
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 순서</option>
          <option value="DELAY_DESC">지연시간순 (Error 3)</option>
          <option value="FEE_DESC">배송비순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 상태에서 상세 클릭 시 인덱스 불일치로 다른 운송장의 주소/고객 정보가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>실시간 주문 관제 목록 (최소 35개):</label>
        <div className="orders-stack">
          {orders.map((o, idx) => (
            <div 
              key={o.id}
              className={`order-card ${selectedOrderIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedOrderIndex(idx)}
            >
              <div className="order-head">
                <span className="wb-tag">{o.waybillNo}</span>
                <span className={`status-badge ${o.status.toLowerCase()}`}>{o.status}</span>
              </div>
              <div className="order-title">{o.itemTitle}</div>
              <div className="order-foot">
                <span>{o.customerName} | {o.centerName}</span>
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
