import React from 'react';

export default function Sidebar({
  filterFloor,
  setFilterFloor,
  filterSeatType,
  setFilterSeatType,
  searchQuery,
  setSearchQuery,
  filterBookCategory,
  setFilterBookCategory,
  pubYearSortOrder,
  setPubYearSortOrder,
  triggerSearchRace,
  seats,
  selectedSeat,
  setSelectedSeat
}) {
  const filteredSeats = seats.filter(s => {
    if (filterFloor !== 'ALL' && s.floor !== Number(filterFloor)) return false;
    if (filterSeatType !== 'ALL' && s.type !== filterSeatType) return false;
    return true;
  });

  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 층 및 좌석/자료 필터</h3>
      
      <div className="filter-group">
        <label>열람실 층 선택:</label>
        <select value={filterFloor} onChange={(e) => setFilterFloor(e.target.value)}>
          <option value="ALL">전체 층 (1층~4층)</option>
          <option value="1">1층 (노트북/PC석)</option>
          <option value="2">2층 (종합열람실/스터디룸)</option>
          <option value="3">3층 (학술연구/캐럴석)</option>
          <option value="4">4층 (고서/편집석)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>좌석 유형 필터:</label>
        <select value={filterSeatType} onChange={(e) => setFilterSeatType(e.target.value)}>
          <option value="ALL">전체 좌석 유형</option>
          <option value="READING">일반 열람석</option>
          <option value="LAPTOP">노트북 좌석</option>
          <option value="PC">PC/미디어석</option>
          <option value="QUIET">집중 캐럴석</option>
          <option value="STUDY_ROOM">스터디룸</option>
        </select>
      </div>

      <div className="filter-group">
        <label>자료 검색어 & 카테고리 (Error 5):</label>
        <input 
          type="text" 
          placeholder="도서명/저자 검색..." 
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            triggerSearchRace(e.target.value, filterBookCategory);
          }}
        />
        <select 
          value={filterBookCategory} 
          onChange={(e) => {
            setFilterBookCategory(e.target.value);
            triggerSearchRace(searchQuery, e.target.value);
          }}
        >
          <option value="ALL">전체 자료 분류</option>
          <option value="COMPUTER">컴퓨터/IT (COMPUTER - Error 5)</option>
          <option value="HUMANITIES">인문/교양 (HUMANITIES)</option>
          <option value="ECONOMY">경제/경영 (ECONOMY)</option>
          <option value="LITERATURE">문학/소설 (LITERATURE)</option>
        </select>
        <small className="warn-desc">* 검색어/유형 고속 변경 시 이전 응답(컴퓨터 3초)이 최신 결과를 덮어써 목록과 오른쪽 상세가 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>출판연도순 정렬 (Error 3):</label>
        <select value={pubYearSortOrder} onChange={(e) => setPubYearSortOrder(e.target.value)}>
          <option value="NONE">기본 순서</option>
          <option value="PUB_DESC">최신 출판년도순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 출판연도순 정렬 상태에서 자료 예약 클릭 시, 정렬 인덱스 불일치로 엉뚱한 도서가 예약됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>층별 좌석 현황 요약 (최소 40개):</label>
        <div className="seats-mini-grid">
          {filteredSeats.map(s => (
            <div 
              key={s.id} 
              className={`seat-cell ${s.status === 'OCCUPIED' ? 'occupied' : ''} ${selectedSeat?.id === s.id ? 'active' : ''}`}
              onClick={() => setSelectedSeat(s)}
            >
              {s.name.split(' ').pop()}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
