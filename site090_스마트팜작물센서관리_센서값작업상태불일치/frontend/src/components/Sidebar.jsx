import React from 'react';

export default function Sidebar({
  filterZone,
  setFilterZone,
  filterType,
  setFilterType,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  crops,
  selectedCropIndex,
  setSelectedCropIndex,
  openDetailMismatch
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 농장 구역 & 센서 유형 필터</h3>

      <div className="filter-group">
        <label>농장 구역 선택 (Error 5):</label>
        <select 
          value={filterZone} 
          onChange={(e) => {
            setFilterZone(e.target.value);
            triggerSearchRace(e.target.value, filterType);
          }}
        >
          <option value="ALL">전체 구역</option>
          <option value="ZN-A1">A1 온실 (파프리카 - Error 5)</option>
          <option value="ZN-A2">A2 온실 (토마토)</option>
          <option value="ZN-B1">B1 수경동 (딸기)</option>
          <option value="ZN-B2">B2 수경동 (상추)</option>
          <option value="ZN-C1">C1 스마트노지 (옥수수)</option>
          <option value="ZN-C2">C2 스마트노지 (감자)</option>
        </select>
        <small className="warn-desc">* 구역 고속 변경 시 이전 응답(A1구역 3초)이 최신 결과를 덮어써 센서 카드와 통계가 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>센서 카테고리 필터:</label>
        <select 
          value={filterType} 
          onChange={(e) => {
            setFilterType(e.target.value);
            triggerSearchRace(filterZone, e.target.value);
          }}
        >
          <option value="ALL">전체 센서</option>
          <option value="온도">온도 센서</option>
          <option value="습도">습도 센서</option>
          <option value="토양수분">토양수분 센서</option>
          <option value="조도">조도 센서</option>
          <option value="CO2농도">CO2농도 센서</option>
        </select>
      </div>

      <div className="filter-group">
        <label>위험도 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 순서</option>
          <option value="RISK_DESC">위험도 높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 위험도 정렬 상태에서 상세보기 클릭 시 인덱스 불일치로 다른 작물의 센서/작업로그가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>재배 작물 관제 목록 (최소 25개):</label>
        <div className="crops-stack">
          {crops.map((c, idx) => (
            <div 
              key={c.id}
              className={`crop-card ${selectedCropIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedCropIndex(idx)}
            >
              <div className="crop-head">
                <span className="zone-tag">{c.zoneId}</span>
                <span className={`status-badge ${c.status.toLowerCase()}`}>{c.status}</span>
              </div>
              <div className="crop-title">{c.name}</div>
              <div className="crop-foot">
                <span>단계: {c.growthStage} | 수분: {c.soilMoisture}%</span>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}
                >
                  상세보기 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
