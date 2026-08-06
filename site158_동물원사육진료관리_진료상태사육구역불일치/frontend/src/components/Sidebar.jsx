import React from 'react';

export default function Sidebar({ filterHabitatZone, setFilterHabitatZone, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, animals, selectedIdx, setSelectedIdx, openDetailMismatch, habitats }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🐾 사육 구역 & 진료 상태 필터</h3>

      <div className="filter-group">
        <label>사육 구역 선택 (Error 5):</label>
        <select value={filterHabitatZone} onChange={(e) => { setFilterHabitatZone(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 구역</option>
          <option value="아프리카 사바나 야생사육장">사바나 사육장 (3초 지연 - Error 5)</option>
          <option value="열대우림 유인원 특별관">유인원 특별관 (0.2초 완료)</option>
          <option value="남극 펭귄 & 해양동물 수족관">펭귄 해양수족관</option>
        </select>
        <small className="warn-desc">* 사바나 사육장(3초 지연)→유인원 특별관(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>진료 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterHabitatZone, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="NORMAL">정상사육 (NORMAL)</option>
          <option value="OBSERVING">관찰필요 (OBSERVING)</option>
          <option value="SCHEDULED">진료예약 (SCHEDULED)</option>
          <option value="IN_TREATMENT">치료중 (IN_TREATMENT)</option>
          <option value="COMPLETED">치료완료 (COMPLETED)</option>
          <option value="CANCELLED">취소/퇴원 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>동물명/종/코드/사육사 검색:</label>
        <input type="text" placeholder="심바 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterHabitatZone, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 동물ID순</option>
          <option value="RISK_DESC">건강 위험도 높은 순 (Error 3)</option>
          <option value="DATE_ASC">입원/등록일 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedAnimals 대신 원본 배열 인덱스 동물이 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 동물원 개체 등록 대장 ({animals.length}마리):</label>
        <div className="animal-stack">
          {animals.map((anm, idx) => (
            <div key={anm.id} className={`anm-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="anm-card-head">
                <span className="habitat-badge">{anm.habitatZone.split(' ')[0]}</span>
                <span className={`status-badge ${anm.status.toLowerCase()}`}>{anm.status}</span>
              </div>
              <div className="anm-title">{anm.animalName} ({anm.species})</div>
              <div className="anm-meta">나이: {anm.ageYears}세 | 사육사: {anm.zookeeperName}</div>
              <div className="anm-foot">
                <small>건강: {anm.healthGrade}</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
