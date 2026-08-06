import React from 'react';

export default function Sidebar({
  filterTrainer,
  setFilterTrainer,
  searchTerm,
  setSearchTerm,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  members,
  selectedMemberIndex,
  setSelectedMemberIndex,
  openReserveMismatch,
  trainers
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 트레이너 필터 & 회원 검색</h3>

      <div className="filter-group">
        <label>담당 트레이너 선택 (Error 5):</label>
        <select 
          value={filterTrainer} 
          onChange={(e) => {
            setFilterTrainer(e.target.value);
            triggerSearchRace(e.target.value, searchTerm);
          }}
        >
          <option value="ALL">전체 트레이너 (12명)</option>
          {trainers.map(t => (
            <option key={t.id} value={t.name}>
              {t.name} {t.name.includes('김피트') ? '(Error 5 - 3초 지연)' : ''}
            </option>
          ))}
        </select>
        <small className="warn-desc">* 트레이너 필터 고속 변경 시 김피트(3초 지연)가 이웨이트 결과를 덮어쓰고 오른쪽 요약과 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>회원명/회원ID/연락처 검색:</label>
        <input 
          type="text" 
          placeholder="검색어 입력..." 
          value={searchTerm} 
          onChange={(e) => {
            setSearchTerm(e.target.value);
            triggerSearchRace(filterTrainer, e.target.value);
          }} 
        />
      </div>

      <div className="filter-group">
        <label>회원 목록 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 회원ID순</option>
          <option value="REMAIN_ASC">잔여 횟수 적은순 (Error 3)</option>
          <option value="VISIT_DESC">최근 방문일 최신순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 잔여횟수/최근방문일 정렬 후 예약 클릭 시 원본 배열 인덱스 불일치로 다른 회원에게 예약이 연결됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>센터 회원 목록 (최소 40명):</label>
        <div className="member-stack">
          {members.map((mem, idx) => (
            <div 
              key={mem.id}
              className={`member-card-item ${selectedMemberIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedMemberIndex(idx)}
            >
              <div className="member-card-head">
                <span className="pass-badge">{mem.passType}</span>
                <span className="count-tag">잔여: {mem.remainingCount}회</span>
              </div>
              <div className="member-name">{mem.name} 회원 ({mem.id})</div>
              <div className="member-trainer">담당: {mem.assignedTrainer}</div>
              <div className="member-foot">
                <small>만료: {mem.expiryDate}</small>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openReserveMismatch(idx); }}
                >
                  예약 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
