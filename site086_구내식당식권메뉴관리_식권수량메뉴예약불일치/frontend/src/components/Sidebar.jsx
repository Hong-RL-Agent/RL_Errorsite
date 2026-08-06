import React from 'react';

export default function Sidebar({
  filterCafeteria,
  setFilterCafeteria,
  filterType,
  setFilterType,
  popSortOrder,
  setPopSortOrder,
  triggerSearchRace,
  menus,
  selectedMenu,
  setSelectedMenu,
  confirmMenuReserve
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 구내식당 & 메뉴 유형 필터</h3>

      <div className="filter-group">
        <label>식당 선택 (Error 5):</label>
        <select 
          value={filterCafeteria} 
          onChange={(e) => {
            setFilterCafeteria(e.target.value);
            triggerSearchRace(e.target.value, filterType);
          }}
        >
          <option value="ALL">전체 식당</option>
          <option value="CAFETERIA_1">제1구내식당 (본관 1F - Error 5)</option>
          <option value="CAFETERIA_2">제2구내식당 (신관 2F)</option>
          <option value="CAFETERIA_3">제3구내식당 (연구동 B1)</option>
        </select>
        <small className="warn-desc">* 식당 고속 변경 시 이전 응답(제1식당 3초)이 최신 결과를 덮어써 중앙 메뉴 목록과 오른쪽 식권 요약이 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>메뉴 카테고리 필터:</label>
        <select 
          value={filterType} 
          onChange={(e) => {
            setFilterType(e.target.value);
            triggerSearchRace(filterCafeteria, e.target.value);
          }}
        >
          <option value="ALL">전체 유형</option>
          <option value="KOREAN">한식 코너</option>
          <option value="JAPANESE">일식 코너</option>
          <option value="CHINESE">중식 코너</option>
          <option value="WESTERN">양식 코너</option>
          <option value="SALAD">샐러드/포케</option>
        </select>
      </div>

      <div className="filter-group">
        <label>인기순 정렬 (Error 3):</label>
        <select value={popSortOrder} onChange={(e) => setPopSortOrder(e.target.value)}>
          <option value="NONE">기본 순서</option>
          <option value="POPULAR">인기높은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 인기순 정렬 상태에서 메뉴 예약 클릭 시 정렬 인덱스 불일치로 다른 메뉴가 예약 저장됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>구내식당 오늘/주간 메뉴 (최소 25개):</label>
        <div className="menus-stack">
          {menus.map((m, idx) => (
            <div 
              key={m.id}
              className={`menu-card ${selectedMenu?.id === m.id ? 'active' : ''}`}
              onClick={() => setSelectedMenu(m)}
            >
              <div className="menu-head">
                <span className="cafeteria-tag">{m.cafeteria === 'CAFETERIA_1' ? '제1식당' : m.cafeteria === 'CAFETERIA_2' ? '제2식당' : '제3식당'}</span>
                <span className="pop-badge">★ {m.popularity}점</span>
              </div>
              <div className="menu-title">{m.name}</div>
              <div className="menu-foot">
                <span>{m.price.toLocaleString()}원 | {m.calories}kcal</span>
                <button 
                  className="reserve-btn-sm"
                  onClick={(e) => { e.stopPropagation(); confirmMenuReserve(idx); }}
                >
                  메뉴 예약 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
