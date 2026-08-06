import React from 'react';

export default function Sidebar({ filterBranchName, setFilterBranchName, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, rentals, selectedIdx, setSelectedIdx, openDetailMismatch, equipments }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🌊 마리나 지점 & 대여 상태 필터</h3>

      <div className="filter-group">
        <label>해양 마리나 지점 선택 (Error 5):</label>
        <select value={filterBranchName} onChange={(e) => { setFilterBranchName(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 지점</option>
          <option value="부산 해운대 마리나 센터">부산 해운대 지점 (3초 지연 - Error 5)</option>
          <option value="제주 서귀포 마리나 센터">제주 서귀포 지점 (0.2초 완료)</option>
          <option value="강릉 경포 마리나 센터">강릉 경포 지점</option>
        </select>
        <small className="warn-desc">* 부산 해운대(3초 지연)→제주 서귀포(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>대여 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterBranchName, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="RESERVED">예약완료 (RESERVED)</option>
          <option value="IN_USE">대여중 (IN_USE)</option>
          <option value="INSPECTING">반납검수 (INSPECTING)</option>
          <option value="COMPLETED">반납완료 (COMPLETED)</option>
          <option value="CANCELLED">대여취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>고객명/장비명/위치/코드 검색:</label>
        <input type="text" placeholder="최해양 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterBranchName, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 대여ID순</option>
          <option value="RETURN_ASC">반납 예정시간 빠른 순 (Error 3)</option>
          <option value="FEE_DESC">대여료 높은 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 대여/상세 클릭 시 sortedRentals 대신 원본 배열 인덱스 장비가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 해양 장비 대여 대장 ({rentals.length}건):</label>
        <div className="rental-stack">
          {rentals.map((rnt, idx) => (
            <div key={rnt.id} className={`rnt-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="rnt-card-head">
                <span className="branch-badge">{rnt.branchName.split(' ')[0]}</span>
                <span className={`status-badge ${rnt.status.toLowerCase()}`}>{rnt.status}</span>
              </div>
              <div className="rnt-title">{rnt.customerName} ({rnt.equipmentName.split(' ')[0]})</div>
              <div className="rnt-meta">위치: {rnt.storageLocation.split(' ')[0]} | 반납: {rnt.returnTime.split(' ')[1]}</div>
              <div className="rnt-foot">
                <small>대여료: {rnt.feeWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
