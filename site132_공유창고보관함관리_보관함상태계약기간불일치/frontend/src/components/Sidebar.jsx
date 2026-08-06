import React from 'react';

export default function Sidebar({ filterBranch, setFilterBranch, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, lockers, selectedIdx, setSelectedIdx, openDetailMismatch, branches }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🔒 공유창고 지점 & 보관함 필터</h3>

      <div className="filter-group">
        <label>지점 선택 (Error 5):</label>
        <select value={filterBranch} onChange={(e) => { setFilterBranch(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 공유창고 (8개 지점)</option>
          {branches.map(b => (
            <option key={b.id} value={b.id}>{b.name}{b.id === 'BRN-01' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* 강남역점(3초 지연)→홍대입구점(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>보관함 이용 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterBranch, e.target.value, searchTerm); }}>
          <option value="ALL">전체 이용 상태</option>
          <option value="AVAILABLE">사용가능 (AVAILABLE)</option>
          <option value="IN_USE">사용중 (IN_USE)</option>
          <option value="EXPIRING_SOON">만료임박 (EXPIRING_SOON)</option>
          <option value="MAINTENANCE">점검중 (MAINTENANCE)</option>
          <option value="TERMINATED">계약종료 (TERMINATED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>보관함번호/고객명 검색:</label>
        <input type="text" placeholder="A-101 검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterBranch, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 보관함ID순</option>
          <option value="EXPIRY_ASC">계약 만료일 임박순 (Error 3)</option>
          <option value="FEE_DESC">월 이용료(원) 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedLockers 대신 원본 배열 인덱스 보관함이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 보관함 스마트 대장 ({lockers.length}개):</label>
        <div className="locker-stack">
          {lockers.map((lck, idx) => (
            <div key={lck.id} className={`locker-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="lck-card-head">
                <span className="locker-no-badge">{lck.lockerNo}</span>
                <span className={`status-badge ${lck.status.toLowerCase()}`}>{lck.status}</span>
              </div>
              <div className="lck-title">{lck.branchName.split(' ')[1] || lck.branchName} - {lck.size}</div>
              <div className="lck-meta">고객: {lck.customerName} | 만료: {lck.endDate}</div>
              <div className="lck-foot">
                <small>월 {lck.monthlyFeeWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
