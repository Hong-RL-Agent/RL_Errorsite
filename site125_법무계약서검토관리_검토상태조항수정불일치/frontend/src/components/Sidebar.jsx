import React from 'react';

export default function Sidebar({ filterClient, setFilterClient, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, contracts, selectedIdx, setSelectedIdx, openDetailMismatch, clients }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📜 계약서 검색 & 거래처 필터</h3>

      <div className="filter-group">
        <label>거래처 선택 (Error 5):</label>
        <select value={filterClient} onChange={(e) => { setFilterClient(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 거래처 (30개사)</option>
          {clients.map(c => (
            <option key={c.id} value={c.name}>{c.name}{c.name.includes('삼성전자') ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* 삼성전자(3초 지연)→현대자동차(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>검토 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterClient, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="REQUESTED">검토요청 (REQUESTED)</option>
          <option value="UNDER_REVIEW">검토중 (UNDER_REVIEW)</option>
          <option value="APPROVAL_PENDING">승인대기 (APPROVAL_PENDING)</option>
          <option value="APPROVED">승인완료 (APPROVED)</option>
          <option value="REJECTED">반려됨 (REJECTED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>계약명/거래처/조항 검색:</label>
        <input type="text" placeholder="검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterClient, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 계약ID순</option>
          <option value="RISK_DESC">법무 리스크 점수 높은순 (Error 3)</option>
          <option value="EXPIRE_ASC">계약 만료일 임박순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedContracts 대신 원본 배열 인덱스 계약이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>법무 검토 계약서 목록 ({contracts.length}건):</label>
        <div className="contract-stack">
          {contracts.map((ctr, idx) => (
            <div key={ctr.id} className={`contract-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="ctr-card-head">
                <span className="client-badge">{ctr.clientName.split(' ')[0]}</span>
                <span className={`status-badge ${ctr.status.toLowerCase()}`}>{ctr.status}</span>
              </div>
              <div className="ctr-title">{ctr.title}</div>
              <div className="ctr-meta">리스크: {ctr.riskScore}점 | 담당: {ctr.managerName}</div>
              <div className="ctr-foot">
                <small>만료: {ctr.expireDate}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
