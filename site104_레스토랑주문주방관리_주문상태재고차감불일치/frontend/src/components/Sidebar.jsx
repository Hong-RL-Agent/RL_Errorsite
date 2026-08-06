import React from 'react';

export default function Sidebar({
  filterSection,
  setFilterSection,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  orders,
  selectedOrderIndex,
  setSelectedOrderIndex,
  openDetailMismatch,
  tables
}) {
  const sections = ['1층 메인 홀', '2층 프라이빗 룸', '3층 루프탑', '1층 바 카운터', '2층 테라스', '야외 가든'];

  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 테이블 구역 & 주문 검색</h3>

      <div className="filter-group">
        <label>테이블 구역 선택 (Error 5):</label>
        <select 
          value={filterSection} 
          onChange={(e) => {
            setFilterSection(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 매장 구역 (20개 테이블)</option>
          {sections.map(sec => (
            <option key={sec} value={sec}>
              {sec} {sec === '1층 메인 홀' ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 구역 필터 고속 변경 시 1층 메인 홀(3초 지연)이 3층 루프탑 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>메뉴명/주문ID/테이블 검색:</label>
        <input 
          type="text" 
          placeholder="검색어 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterSection, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>주문 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 주문ID순</option>
          <option value="PRICE_DESC">주문 금액 높은순 (Error 3)</option>
          <option value="TIME_DESC">접수 시간 최신순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 금액/접수시간 정렬 후 상세 클릭 시 원본 배열 인덱스 불일치로 다른 주문 상세가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>주문 진행 대기열 (최소 45개):</label>
        <div className="order-stack">
          {orders.map((ord, idx) => (
            <div 
              key={ord.id}
              className={`order-card-item ${selectedOrderIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedOrderIndex(idx)}
            >
              <div className="order-card-head">
                <span className="table-badge">{ord.tableNo}</span>
                <span className={`status-badge ${ord.status.toLowerCase()}`}>{ord.status}</span>
              </div>
              <div className="order-menu">{ord.menuName} ({ord.id})</div>
              <div className="order-notes">{ord.notes}</div>
              <div className="order-foot">
                <small>{ord.price?.toLocaleString()}원 | {ord.chefName}</small>
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
