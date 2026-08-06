import React from 'react';

export default function Sidebar({ filterOrigin, setFilterOrigin, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, auctions, selectedIdx, setSelectedIdx, openDetailMismatch, origins }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>⚓ 경매 물량 & 산지 필터</h3>

      <div className="filter-group">
        <label>수산물 산지 선택 (Error 5):</label>
        <select value={filterOrigin} onChange={(e) => { setFilterOrigin(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 산지 구분</option>
          {origins.map(o => (
            <option key={o} value={o}>{o}{o.includes('제주') ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* 제주 서귀포(3초 지연)→부산 자갈치(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>경매 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterOrigin, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="BIDDING">입찰중 (BIDDING)</option>
          <option value="WIN_PENDING">낙찰대기 (WIN_PENDING)</option>
          <option value="WON">낙찰완료 (WON)</option>
          <option value="SHIPPED">출하완료 (SHIPPED)</option>
          <option value="CANCELLED">취소됨 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>품목명/낙찰자/산지 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterOrigin, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 경매ID순</option>
          <option value="PRICE_DESC">낙찰가(원) 높은순 (Error 3)</option>
          <option value="QTY_DESC">출하 물량(kg) 많은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedAuctions 대신 원본 배열 인덱스 경매가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 경매 물량 목록 ({auctions.length}건):</label>
        <div className="auction-stack">
          {auctions.map((auc, idx) => (
            <div key={auc.id} className={`auction-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="auc-card-head">
                <span className="origin-badge">{auc.origin.split(' ')[0]}</span>
                <span className={`status-badge ${auc.status.toLowerCase()}`}>{auc.status}</span>
              </div>
              <div className="auc-title">{auc.itemName}</div>
              <div className="auc-meta">물량: {auc.quantityKg}kg | 낙찰가: {auc.winPriceWon.toLocaleString()}원</div>
              <div className="auc-foot">
                <small>낙찰자: {auc.winnerName.split(' ')[0]}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
