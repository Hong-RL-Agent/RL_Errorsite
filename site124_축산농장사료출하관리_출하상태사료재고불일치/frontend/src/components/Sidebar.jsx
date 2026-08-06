import React from 'react';

export default function Sidebar({ filterBarn, setFilterBarn, filterHealth, setFilterHealth, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, livestocks, selectedIdx, setSelectedIdx, openDetailMismatch, barns }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🐄 개체 검색 & 축사 필터</h3>

      <div className="filter-group">
        <label>축사 구역 선택 (Error 5):</label>
        <select value={filterBarn} onChange={(e) => { setFilterBarn(e.target.value); triggerSearchRace(e.target.value, filterHealth, searchTerm); }}>
          <option value="ALL">전체 축사 구역 (12개동)</option>
          {barns.map(b => (
            <option key={b.id} value={b.id}>{b.name}{b.id === 'BARN-01' ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* BARN-01(3초 지연)→BARN-02(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>건강 상태 필터:</label>
        <select value={filterHealth} onChange={(e) => { setFilterHealth(e.target.value); triggerSearchRace(filterBarn, e.target.value, searchTerm); }}>
          <option value="ALL">전체 건강 상태</option>
          <option value="HEALTHY">양호 (HEALTHY)</option>
          <option value="OBSERVATION">관찰요망 (OBSERVATION)</option>
          <option value="TREATMENT">치료중 (TREATMENT)</option>
          <option value="RECOVERY">회복중 (RECOVERY)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>이력번호/품종 검색:</label>
        <input type="text" placeholder="이력표 410-... 입력" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterBarn, filterHealth, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 개체ID순</option>
          <option value="WEIGHT_DESC">체중(kg) 무거운순 (Error 3)</option>
          <option value="AGE_DESC">월령(개월) 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedLivestocks 대신 원본 배열 인덱스 개체가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>농장 개체 대기열 ({livestocks.length}두):</label>
        <div className="livestock-stack">
          {livestocks.map((liv, idx) => (
            <div key={liv.id} className={`livestock-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="liv-card-head">
                <span className="barn-badge">{liv.barnName}</span>
                <span className={`status-badge ${liv.status.toLowerCase()}`}>{liv.status}</span>
              </div>
              <div className="liv-title">{liv.earTagNo} ({liv.breed})</div>
              <div className="liv-meta">체중: {liv.weightKg}kg | 월령: {liv.ageMonths}개월</div>
              <div className="liv-foot">
                <small>건강: {liv.healthStatus}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
