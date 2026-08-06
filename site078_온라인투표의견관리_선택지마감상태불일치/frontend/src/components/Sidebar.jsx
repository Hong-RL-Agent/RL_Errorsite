import React from 'react';

export default function Sidebar({
  filterCategory,
  setFilterCategory,
  filterStatus,
  setFilterStatus,
  voterSortOrder,
  setVoterSortOrder,
  triggerSearchRace,
  sortedVotes,
  selectedVote,
  setSelectedVote,
  confirmCastVote,
  getCategoryLabel
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 투표 안건 필터 및 정렬</h3>
      
      <div className="filter-group">
        <label>카테고리 필터 (Error 5):</label>
        <select 
          value={filterCategory} 
          onChange={(e) => {
            setFilterCategory(e.target.value);
            triggerSearchRace(e.target.value, filterStatus);
          }}
        >
          <option value="ALL">전체 카테고리</option>
          <option value="WELFARE">복지/근태 (WELFARE - Error 5)</option>
          <option value="TECH">IT/기술 (TECH)</option>
          <option value="CULTURE">조직문화 (CULTURE)</option>
        </select>
        <small className="warn-desc">* 필터 고속 변경 시 이전 응답(복지 3초)이 최신 결과를 덮어쓰고 중앙 목록과 오른쪽 미리보기가 불일치함 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>투표 마감 상태 필터:</label>
        <select 
          value={filterStatus} 
          onChange={(e) => {
            setFilterStatus(e.target.value);
            triggerSearchRace(filterCategory, e.target.value);
          }}
        >
          <option value="ALL">전체 상태</option>
          <option value="OPEN">진행 중 (OPEN)</option>
          <option value="CLOSED">투표 마감 (CLOSED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>참여자순 정렬 (Error 3):</label>
        <select value={voterSortOrder} onChange={(e) => setVoterSortOrder(e.target.value)}>
          <option value="NONE">기본 순서</option>
          <option value="VOTERS_DESC">참여자 많은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 참여자순 정렬 상태에서 투표하기 클릭 시, 정렬 인덱스 불일치로 엉뚱한 투표 id에 참여 저장됨 (Error 3)</small>
      </div>

      <div className="votes-stack">
        <h4>🗳️ 등록 투표 목록 (최소 15개)</h4>
        {sortedVotes.map((v, idx) => (
          <div 
            key={v.id}
            className={`vote-card ${selectedVote?.id === v.id ? 'active' : ''}`}
            onClick={() => setSelectedVote(v)}
          >
            <div className="vote-head">
              <span className="category-tag">{getCategoryLabel(v.category)}</span>
              <span className={`status-badge ${v.status.toLowerCase()}`}>{v.status}</span>
            </div>
            <h5 className="vote-title">{v.title}</h5>
            <div className="vote-foot">
              <span>참여자: {v.totalVoters}명</span>
              <button className="cast-btn-sm" onClick={(e) => { e.stopPropagation(); confirmCastVote(idx); }}>
                투표하기 (Error 3)
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
