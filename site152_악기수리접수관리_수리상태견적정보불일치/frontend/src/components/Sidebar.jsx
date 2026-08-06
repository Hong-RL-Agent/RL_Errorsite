import React from 'react';

export default function Sidebar({ filterCategory, setFilterCategory, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, repairs, selectedIdx, setSelectedIdx, openDetailMismatch, instruments }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🎻 악기 카테고리 & 수리 상태 필터</h3>

      <div className="filter-group">
        <label>악기 종류 선택 (Error 5):</label>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 악기</option>
          <option value="현악기 (바이올린 / 첼로 / 비올라)">현악기 마스터반 (3초 지연 - Error 5)</option>
          <option value="관악기 (플루트 / 색소폰 / 클라리넷)">관악기 리패딩반 (0.2초 완료)</option>
          <option value="건반악기 (그랜드 피아노 / 업라이트)">건반악기 조율반</option>
        </select>
        <small className="warn-desc">* 현악기(3초 지연)→관악기(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>수리 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterCategory, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="RECEIVED">접수완료 (RECEIVED)</option>
          <option value="ESTIMATING">견적대기 (ESTIMATING)</option>
          <option value="REPAIRING">수리중 (REPAIRING)</option>
          <option value="COMPLETED">출고완료 (COMPLETED)</option>
          <option value="CANCELLED">수리취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>고객명/악기명/보관번호/코드 검색:</label>
        <input type="text" placeholder="최바이올린 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterCategory, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 접수ID순</option>
          <option value="PRICE_DESC">견적 금액 높은 순 (Error 3)</option>
          <option value="DATE_ASC">수리 접수일 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedRepairs 대신 원본 배열 인덱스 접수가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 악기 수리 접수 대장 ({repairs.length}건):</label>
        <div className="repair-stack">
          {repairs.map((rpr, idx) => (
            <div key={rpr.id} className={`rpr-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="rpr-card-head">
                <span className="category-badge">{rpr.category.split(' ')[0]}</span>
                <span className={`status-badge ${rpr.status.toLowerCase()}`}>{rpr.status}</span>
              </div>
              <div className="rpr-title">{rpr.customerName} (악기: {rpr.instrumentName.split(' ')[0]})</div>
              <div className="rpr-meta">보관: {rpr.storageNo} | 담당: {rpr.workerName}</div>
              <div className="rpr-foot">
                <small>견적금액: {rpr.estimatePriceWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
