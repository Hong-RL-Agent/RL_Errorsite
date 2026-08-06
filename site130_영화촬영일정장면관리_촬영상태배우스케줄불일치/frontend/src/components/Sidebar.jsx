import React from 'react';

export default function Sidebar({ filterActor, setFilterActor, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, scenes, selectedIdx, setSelectedIdx, openDetailMismatch, actors }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📽️ 촬영 장면 & 배우 필터</h3>

      <div className="filter-group">
        <label>출연 배우 선택 (Error 5):</label>
        <select value={filterActor} onChange={(e) => { setFilterActor(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 배우 라인업</option>
          {actors.map(a => (
            <option key={a.id} value={a.actorName}>{a.actorName} ({a.roleName}){a.actorName.includes('최민수') ? ' (3초 지연 - Error 5)' : ''}</option>
          ))}
        </select>
        <small className="warn-desc">* 최민수(3초 지연)→이병헌(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>촬영 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterActor, e.target.value, searchTerm); }}>
          <option value="ALL">전체 진행 상태</option>
          <option value="PREPARING">준비중 (PREPARING)</option>
          <option value="FILMING">촬영중 (FILMING)</option>
          <option value="COMPLETED">촬영완료 (COMPLETED)</option>
          <option value="PAUSED">일시중지 (PAUSED)</option>
          <option value="CANCELLED">촬영취소 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>장면명/Scene 번호/로케이션 검색:</label>
        <input type="text" placeholder="Scene #45 검색어 입력..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterActor, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 장면ID순</option>
          <option value="DATE_ASC">촬영 예정일 임박순 (Error 3)</option>
          <option value="IMPORTANCE_DESC">씬 중요도 높음순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedScenes 대신 원본 배열 인덱스 장면이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>영화 촬영 장면 콘티 대장 ({scenes.length}건):</label>
        <div className="scene-stack">
          {scenes.map((scn, idx) => (
            <div key={scn.id} className={`scene-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="scn-card-head">
                <span className="scene-no-badge">{scn.sceneNo}</span>
                <span className={`status-badge ${scn.status.toLowerCase()}`}>{scn.status}</span>
              </div>
              <div className="scn-title">{scn.sceneName}</div>
              <div className="scn-meta">배우: {scn.actorName} | 일자: {scn.shootDate}</div>
              <div className="scn-foot">
                <small>장소: {scn.location.split(' ')[0]}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
