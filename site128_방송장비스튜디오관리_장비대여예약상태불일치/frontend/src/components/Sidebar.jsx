import React from 'react';

export default function Sidebar({ filterCategory, setFilterCategory, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, gears, selectedIdx, setSelectedIdx, openDetailMismatch, categories }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📹 방송 장비 & 카테고리 필터</h3>

      <div className="filter-group">
        <label>장비 유형 선택 (Error 5):</label>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 장비 카테고리</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}{c.includes('4K 시네마') ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* 4K 시네마 카메라(3초 지연)→지미집/크레인(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>장비 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterCategory, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="RESERVED">예약대기 (RESERVED)</option>
          <option value="RENTED">대여중 (RENTED)</option>
          <option value="COMPLETED">사용완료 (COMPLETED)</option>
          <option value="INSPECTING">점검중 (INSPECTING)</option>
          <option value="CANCELLED">예약취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>장비명/보관위치/카테고리 검색:</label>
        <input type="text" placeholder="RED 8K... 검색어 입력" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterCategory, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 장비ID순</option>
          <option value="UTIL_DESC">장비 가동 사용률 높음순 (Error 3)</option>
          <option value="FEE_DESC">일일 대여료(원) 비쌈순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 대여 상세 클릭 시 sortedGears 대신 원본 배열 인덱스 장비가 대여됨 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>방송 장비 자산 대장 ({gears.length}건):</label>
        <div className="gear-stack">
          {gears.map((ger, idx) => (
            <div key={ger.id} className={`gear-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="ger-card-head">
                <span className="cat-badge">{ger.category.split(' ')[0]}</span>
                <span className={`status-badge ${ger.status.toLowerCase()}`}>{ger.status}</span>
              </div>
              <div className="ger-title">{ger.gearName}</div>
              <div className="ger-meta">위치: {ger.location} | 가동률: {ger.utilizationRate}%</div>
              <div className="ger-foot">
                <small>대여료: {ger.dailyFeeWon.toLocaleString()}원</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>대여 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
