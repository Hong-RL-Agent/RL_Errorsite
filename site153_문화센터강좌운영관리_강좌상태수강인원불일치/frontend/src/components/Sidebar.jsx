import React from 'react';

export default function Sidebar({ filterCategory, setFilterCategory, filterStatus, setFilterStatus, searchTerm, setSearchTerm, sortOrder, setSortOrder, triggerSearchRace, courses, selectedIdx, setSelectedIdx, openDetailMismatch, instructors }) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>🎨 강좌 카테고리 & 운영 상태 필터</h3>

      <div className="filter-group">
        <label>강좌 카테고리 선택 (Error 5):</label>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); triggerSearchRace(e.target.value, filterStatus, searchTerm); }}>
          <option value="ALL">전체 카테고리</option>
          <option value="인문학 & 서양 미술사">인문학 & 서양 미술사 (3초 지연 - Error 5)</option>
          <option value="음악 & 바이올린 클래스">음악 & 바이올린 (0.2초 완료)</option>
          <option value="요가 & 피트니스 건강반">요가 & 피트니스</option>
        </select>
        <small className="warn-desc">* 인문학(3초 지연)→음악(0.2초) 고속 선택 시 오래된 구 결과가 최신 목록을 덮어씀 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>강좌 진행 상태 필터:</label>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); triggerSearchRace(filterCategory, e.target.value, searchTerm); }}>
          <option value="ALL">전체 상태</option>
          <option value="RECRUITING">모집중 (RECRUITING)</option>
          <option value="CLOSED">모집마감 (CLOSED)</option>
          <option value="IN_SESSION">강의중 (IN_SESSION)</option>
          <option value="COMPLETED">종강완료 (COMPLETED)</option>
          <option value="CANCELLED">폐강 (CANCELLED)</option>
        </select>
      </div>

      <div className="filter-group">
        <label>강좌명/강사명/강의실/코드 검색:</label>
        <input type="text" placeholder="서양 미술사 검색어..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); triggerSearchRace(filterCategory, filterStatus, e.target.value); }} />
      </div>

      <div className="filter-group">
        <label>정렬 기준 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 강좌ID순</option>
          <option value="ENROLLED_DESC">신청 인원 많은 순 (Error 3)</option>
          <option value="DATE_ASC">개강 시작일 빠른 순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 정렬 후 상세 클릭 시 sortedCourses 대신 원본 배열 인덱스 강좌가 열림 (Error 3)</small>
      </div>

      <div className="filter-group" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        <label>실시간 문화센터 강좌 대장 ({courses.length}개):</label>
        <div className="course-stack">
          {courses.map((crs, idx) => (
            <div key={crs.id} className={`crs-card-item ${selectedIdx === idx ? 'active' : ''}`} onClick={() => setSelectedIdx(idx)}>
              <div className="crs-card-head">
                <span className="category-badge">{crs.category.split(' ')[0]}</span>
                <span className={`status-badge ${crs.status.toLowerCase()}`}>{crs.status}</span>
              </div>
              <div className="crs-title">{crs.courseName}</div>
              <div className="crs-meta">강사: {crs.instructorName} | 강의실: {crs.roomNo.split(' ')[0]}</div>
              <div className="crs-foot">
                <small>수강인원: {crs.enrolledCount}명 / {crs.maxCapacity}명</small>
                <button className="detail-btn-sm" onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}>상세 (E3)</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
