import React from 'react';

export default function Sidebar({ filterFlower, setFilterFlower, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, auctions, selectedIdx, setSelectedIdx, openDetailMismatch, flowers }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🌺 화훼 품목 & 경매 필터</h3>

      <div className="filter-group">
        <label>생화 품목 선택 (Error 5):</label>
        <select value={filterFlower} onChange={(e) => { setFilterFlower(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 생화 품목</option>
          <option value="장미">빨간 장미 (3초 지연 - Error 5)</option>
          <option value="튤립">분홍 튤립 (0.2초 완료)</option>
          <option value="백합">백합 (시베리아)</option>
          <option value="안개꽃">안개꽃 (하얀 눈꽃)</option>
        </select>
        <small className="warn-desc">* 장미(3초 지연)→튤립(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>경매/낙찰 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterFlower, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="BIDDING">경매중 (BIDDING)</option>
          <option value="WON">낙찰완료 (WON)</option>
          <option value="READY_FOR_DELIVERY">배송준비 (READY_FOR_DELIVERY)</option>
          <option value="DELIVERING">배송중 (DELIVERING)</option>
          <option value="CANCELLED">낙찰취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>꽃이름/낙찰구매자/코드 검색:</label>
        <input type="text" placeholder="장미 300단 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterFlower, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 경매ID순</option>
          <option value="PRICE_DESC">낙찰가(원) 높은순 (Error 3)</option>
          <option value="GRADE_DESC">생화 등급 신선도순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedAuctions 대신 원본 배열 인덱스 경매가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 화훼 경매 보드 ({auctions.length}건):</label>
        <div className="auction-stack">
          {auctions.map((auc, idx) => (
            <div key={auc.id} className={`auction-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="auc-card-head">
                <span className="flower-grade-badge">{auc.grade}</span>
                <span className={`status-badge ${auc.status.toLowerCase()}`}>{auc.status}</span>
              </div>
              <div className="auc-title">{auc.flowerName} ({auc.quantity}단)</div>
              <div className="auc-meta">구매자: {auc.buyerName.split(' ')[0]} | 배송수량: {auc.deliveryQty}단</div>
              <div className="auc-foot">
                <small>낙찰가: {auc.winningPriceWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
