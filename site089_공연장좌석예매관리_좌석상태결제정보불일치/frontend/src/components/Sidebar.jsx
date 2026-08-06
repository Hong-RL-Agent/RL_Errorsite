import React from 'react';

export default function Sidebar({
  filterGenre,
  setFilterGenre,
  filterDate,
  setFilterDate,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  shows,
  selectedShowIndex,
  setSelectedShowIndex,
  openDetailMismatch
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 장르 & 공연 날짜 필터</h3>

      <div className="filter-group">
        <label>공연 날짜 선택 (Error 5):</label>
        <select 
          value={filterDate} 
          onChange={(e) => {
            setFilterDate(e.target.value);
            triggerSearchRace(e.target.value, filterGenre);
          }}
        >
          <option value="ALL">전체 날짜</option>
          <option value="2026-08-15">2026-08-15 (오페라의 유령 - Error 5)</option>
          <option value="2026-08-16">2026-08-16 (캣츠)</option>
          <option value="2026-08-17">2026-08-17 (베토벤 심포니)</option>
          <option value="2026-08-18">2026-08-18 (태양의 서커스)</option>
          <option value="2026-08-19">2026-08-19 (옥탑방고양이)</option>
        </select>
        <small className="warn-desc">* 날짜 고속 변경 시 이전 응답(08-15 3초)이 최신 결과를 덮어써 좌석도와 가격 요약이 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>장르 필터:</label>
        <select 
          value={filterGenre} 
          onChange={(e) => {
            setFilterGenre(e.target.value);
            triggerSearchRace(filterDate, e.target.value);
          }}
        >
          <option value="ALL">전체 장르</option>
          <option value="뮤지컬">뮤지컬</option>
          <option value="클래식">클래식</option>
          <option value="연극">연극</option>
          <option value="서커스/서커스쇼">서커스/서커스쇼</option>
          <option value="발레/무용">발레/무용</option>
          <option value="재즈">재즈</option>
        </select>
      </div>

      <div className="filter-group">
        <label>공연 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 순서</option>
          <option value="POPULARITY_DESC">인기순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 인기순 정렬 상태에서 예매하기 클릭 시 인덱스 불일치로 다른 공연 좌석도가 열림 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>현재 상영 공연 목록 (최소 18개):</label>
        <div className="shows-stack">
          {shows.map((s, idx) => (
            <div 
              key={s.id}
              className={`show-card ${selectedShowIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedShowIndex(idx)}
            >
              <div className="show-head">
                <span className="genre-tag">{s.genre}</span>
                <span className="status-badge open">인기 {s.popularity}%</span>
              </div>
              <div className="show-title">{s.title}</div>
              <div className="show-foot">
                <span>{s.venue} | {s.date}</span>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}
                >
                  예매하기 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
