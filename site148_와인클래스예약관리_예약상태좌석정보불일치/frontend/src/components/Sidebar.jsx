import React from 'react';

export default function Sidebar({ filterClass, setFilterClass, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, bookings, selectedIdx, setSelectedIdx, openDetailMismatch, classesList }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🍇 와인 클래스 & 예약 상태 필터</h3>

      <div className="filter-group">
        <label>와인 클래스 선택 (Error 5):</label>
        <select value={filterClass} onChange={(e) => { setFilterClass(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 클래스</option>
          <option value="프랑스 보르도 그랑크뤼 마스터 클래스">프랑스 보르도 마스터반 (3초 지연 - Error 5)</option>
          <option value="이탈리아 토스카나 바롤로 시음반">이탈리아 토스카나 바롤로반 (0.2초 완료)</option>
          <option value="신대륙 나파밸리 카베르네 소비뇽 세미나">신대륙 나파밸리 세미나</option>
        </select>
        <small className="warn-desc">* 보르도반(3초 지연)→바롤로반(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>예약 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterClass, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="PENDING">예약대기 (PENDING)</option>
          <option value="CONFIRMED">예약확정 (CONFIRMED)</option>
          <option value="KIT_READY">준비완료 (KIT_READY)</option>
          <option value="ATTENDED">참석완료 (ATTENDED)</option>
          <option value="CANCELLED">예약취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>고객명/클래스명/좌석/코드 검색:</label>
        <input type="text" placeholder="최와인 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterClass, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 예약ID순</option>
          <option value="PRICE_DESC">수강 수수료 높은 순 (Error 3)</option>
          <option value="DATE_ASC">클래스 일자 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedBookings 대신 원본 배열 인덱스 예약이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 와인 수강 예약 대장 ({bookings.length}건):</label>
        <div className="booking-stack">
          {bookings.map((bkg, idx) => (
            <div key={bkg.id} className={`bkg-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="bkg-card-head">
                <span className="class-badge">{bkg.className.split(' ')[0]}</span>
                <span className={`status-badge ${bkg.status.toLowerCase()}`}>{bkg.status}</span>
              </div>
              <div className="bkg-title">{bkg.customerName} 고객님</div>
              <div className="bkg-meta">좌석: {bkg.seatNo.split(' ')[0]} | 키트: {bkg.kitStatus}</div>
              <div className="bkg-foot">
                <small>수강료: {bkg.priceWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
