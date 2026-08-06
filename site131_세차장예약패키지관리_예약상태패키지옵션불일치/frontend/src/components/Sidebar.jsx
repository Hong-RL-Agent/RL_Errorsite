import React from 'react';

export default function Sidebar({ filterBranch, setFilterBranch, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, bookings, selectedIdx, setSelectedIdx, openDetailMismatch, branches }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🚙 지점 & 세차 예약 필터</h3>

      <div className="filter-group">
        <label>지점 선택 (Error 5):</label>
        <select value={filterBranch} onChange={(e) => { setFilterBranch(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 세차 지점 (10개 지점)</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}{b.id === 'BRN-01' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* 강남 본점(3초 지연)→서초 직영점(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>예약/작업 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterBranch, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="PENDING">예약대기 (PENDING)</option>
          <option value="IN_PROGRESS">작업중 (IN_PROGRESS)</option>
          <option value="COMPLETED">작업완료 (COMPLETED)</option>
          <option value="CANCELLED">취소됨 (CANCELLED)</option>
          <option value="REFUNDED">환불됨 (REFUNDED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>차량번호/고객명/예약번호 검색:</label>
        <input type="text" placeholder="123가 4567 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterBranch, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 예약ID순</option>
          <option value="FEE_DESC">결제 금액(원) 높은순 (Error 3)</option>
          <option value="TIME_ASC">예약 시간 빠른순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedBookings 대신 원본 배열 인덱스 예약이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 입고 세차 대장 ({bookings.length}건):</label>
        <div className="booking-stack">
          {bookings.map((bkg, idx) => (
            <div key={bkg.id} className={`booking-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="bkg-card-head">
                <span className="branch-badge">{bkg.branchName.split(' ')[1] || bkg.branchName}</span>
                <span className={`status-badge ${bkg.status.toLowerCase()}`}>{bkg.status}</span>
              </div>
              <div className="bkg-title">{bkg.carNo} ({bkg.carType})</div>
              <div className="bkg-meta">고객: {bkg.ownerName} | 시간: {bkg.bookingTime}</div>
              <div className="bkg-foot">
                <small>금액: {bkg.totalFeeWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
