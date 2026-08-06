import React from 'react';

export default function Sidebar({
  filterAdvertiser,
  setFilterAdvertiser,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  campaigns,
  selectedCmpIndex,
  setSelectedCmpIndex,
  openDetailMismatch
}) {
  const advertisers = ['삼성전자', '현대자동차', 'LG생활건강', 'SK텔레콤', '쿠팡'];

  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 광고주 필터 & 캠페인 검색</h3>

      <div className="filter-group">
        <label>광고주 선택 (Error 5):</label>
        <select 
          value={filterAdvertiser} 
          onChange={(e) => {
            setFilterAdvertiser(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 광고주 (삼성/현대/LG/SK/쿠팡)</option>
          {advertisers.map(adv => (
            <option key={adv} value={adv}>
              {adv} {adv === '삼성전자' ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 광고주 필터 고속 변경 시 삼성전자(3초 지연)가 현대자동차 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>캠페인명/ID 검색:</label>
        <input 
          type="text" 
          placeholder="검색어 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterAdvertiser, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>캠페인 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 캠페인ID순</option>
          <option value="EXHAUSTION_DESC">예산 소진율 높은순 (Error 3)</option>
          <option value="CTR_DESC">클릭률 CTR 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 소진율/CTR 정렬 후 상세 클릭 시 원본 배열 인덱스 불일치로 다른 캠페인이 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>광고 캠페인 목록 (최소 35개):</label>
        <div className="cmp-stack">
          {campaigns.map((cmp, idx) => (
            <div 
              key={cmp.id}
              className={`cmp-card-item ${selectedCmpIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedCmpIndex(idx)}
            >
              <div className="cmp-card-head">
                <span className="adv-badge">{cmp.advertiserName}</span>
                <span className={`status-badge ${cmp.status.toLowerCase()}`}>{cmp.status}</span>
              </div>
              <div className="cmp-title">{cmp.title} ({cmp.id})</div>
              <div className="cmp-budget">일일 예산: {cmp.dailyBudget?.toLocaleString()}원 | CTR: {cmp.ctr}%</div>
              <div className="cmp-foot">
                <small>소진율: {cmp.exhaustionRate}%</small>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}
                >
                  상세 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
