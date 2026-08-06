import React from 'react';

export default function Sidebar({ filterSection, setFilterSection, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, inspections, selectedIdx, setSelectedIdx, openDetailMismatch, equipments }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🌊 정수 공정 & 설비 점검 필터</h3>

      <div className="filter-group">
        <label>정수 공정 섹션 선택 (Error 5):</label>
        <select value={filterSection} onChange={(e) => { setFilterSection(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 정수 공정</option>
          <option value="제1정수장 혼화지/응집지">제1정수장 혼화지 (3초 지연 - Error 5)</option>
          <option value="제2정수장 침전지/여과지">제2정수장 침전지 (0.2초 완료)</option>
          <option value="고도정수처리 오존소독동">고도정수처리 오존동</option>
        </select>
        <small className="warn-desc">* 제1정수장(3초 지연)→제2정수장(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>점검 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterSection, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="NORMAL">정상운영 (NORMAL)</option>
          <option value="PENDING">점검대기 (PENDING)</option>
          <option value="IN_PROGRESS">조치중 (IN_PROGRESS)</option>
          <option value="RESOLVED">조치완료 (RESOLVED)</option>
          <option value="CANCELLED">점검취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>설비명/작업자/점검코드 검색:</label>
        <input type="text" placeholder="혼화기 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterSection, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 점검ID순</option>
          <option value="TURBIDITY_DESC">탁도(NTU) 높은 순 (Error 3)</option>
          <option value="DATE_ASC">점검일시 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedInspections 대신 원본 배열 인덱스 설비가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 수질 설비 점검 대장 ({inspections.length}건):</label>
        <div className="inspection-stack">
          {inspections.map((insp, idx) => (
            <div key={insp.id} className={`insp-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="insp-card-head">
                <span className="section-badge">{insp.section.split(' ')[0]}</span>
                <span className={`status-badge ${insp.status.toLowerCase()}`}>{insp.status}</span>
              </div>
              <div className="insp-title">{insp.equipName.slice(0, 16)}...</div>
              <div className="insp-meta">탁도: {insp.turbidityNtu} NTU | pH: {insp.phLevel}</div>
              <div className="insp-foot">
                <small>담당: {insp.operatorName}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
