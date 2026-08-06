import React from 'react';

export default function Sidebar({ filterCategory, setFilterCategory, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, equipments, selectedIdx, setSelectedIdx, openDetailMismatch }) {
  const categories = ['분석장비', '측정장비', '광학장비', '반도체장비', '바이오장비'];

  return (
    <aside className="panel-section filter-sidebar">
      <h3>🔬 연구 장비 검색 & 필터</h3>

      <div className="filter-group">
        <label>장비 유형 필터 (Error 5):</label>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 장비 유형</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}{c === '분석장비' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* 분석장비(3초 지연)→측정장비(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>장비 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterCategory, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="AVAILABLE">사용가능 (AVAILABLE)</option>
          <option value="RESERVED">예약중 (RESERVED)</option>
          <option value="IN_USE">사용중 (IN_USE)</option>
          <option value="MAINTENANCE">점검중 (MAINTENANCE)</option>
          <option value="BROKEN">고장 (BROKEN)</option>
          <option value="DISABLED">사용중지 (DISABLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>장비명/위치/담당자 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterCategory, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 장비ID순</option>
          <option value="USAGE_DESC">사용률 높은순 (Error 3)</option>
          <option value="INSPECT_ASC">점검주기 임박순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 예약 클릭 시 sortedEquipments 대신 원본 배열 인덱스 장비가 예약됨 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>연구 장비 목록 ({equipments.length}개):</label>
        <div className="equipment-stack">
          {equipments.map((eq, idx) => (
            <div key={eq.id} className={`equipment-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="eq-card-head">
                <span className="cat-badge">{eq.category}</span>
                <span className={`status-badge ${eq.status.toLowerCase()}`}>{eq.status}</span>
              </div>
              <div className="eq-name">{eq.name}</div>
              <div className="eq-meta">위치: {eq.location} | 사용률: {eq.usageRate}%</div>
              <div className="eq-foot">
                <small>{eq.managerName}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>예약 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
