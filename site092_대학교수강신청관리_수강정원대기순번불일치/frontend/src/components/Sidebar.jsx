import React from 'react';

export default function Sidebar({
  filterDept,
  setFilterDept,
  filterType,
  setFilterType,
  sortOrder,
  setSortOrder,
  triggerSearchRace,
  courses,
  selectedCourseIndex,
  setSelectedCourseIndex,
  openDetailMismatch
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 개설 학과 & 이수 구분 필터</h3>

      <div className="filter-group">
        <label>개설 학과 선택 (Error 5):</label>
        <select 
          value={filterDept} 
          onChange={(e) => {
            setFilterDept(e.target.value);
            triggerSearchRace(e.target.value, filterType);
          }}
        >
          <option value="ALL">전체 학과</option>
          <option value="컴퓨터공학과">컴퓨터공학과 (Error 5 - 3초 지연)</option>
          <option value="AI융합학부">AI융합학부 (0.2초 완료)</option>
          <option value="전자공학과">전자공학과</option>
          <option value="기계공학과">기계공학과</option>
          <option value="경영학과">경영학과</option>
          <option value="교양학부">교양학부</option>
        </select>
        <small className="warn-desc">* 학과 필터 고속 변경 시 컴퓨터공학과(3초 지연)가 늦게 완료되어 AI융합학부 결과를 덮어쓰고 시간표와 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>이수 구분 필터:</label>
        <select 
          value={filterType} 
          onChange={(e) => {
            setFilterType(e.target.value);
            triggerSearchRace(filterDept, e.target.value);
          }}
        >
          <option value="ALL">전체 이수구분</option>
          <option value="전공필수">전공필수</option>
          <option value="전공선택">전공선택</option>
          <option value="교양필수">교양필수</option>
          <option value="교양선택">교양선택</option>
        </select>
      </div>

      <div className="filter-group">
        <label>강의 정렬 (Error 3):</label>
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="NONE">기본 강의코드순</option>
          <option value="POPULARITY_DESC">인기순 (Error 3)</option>
          <option value="SEATS_ASC">잔여좌석 적은순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 인기/잔여좌석 정렬 후 수강신청 클릭 시 원본 배열 인덱스 불일치로 다른 강의가 신청됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>개설 강의 목록 (최소 35개):</label>
        <div className="courses-stack">
          {courses.map((crs, idx) => (
            <div 
              key={crs.id}
              className={`course-card-item ${selectedCourseIndex === idx ? 'active' : ''}`}
              onClick={() => setSelectedCourseIndex(idx)}
            >
              <div className="course-card-head">
                <span className="course-code">{crs.code}</span>
                <span className={`status-badge ${crs.enrolledCount >= crs.capacity ? 'danger' : 'normal'}`}>
                  {crs.enrolledCount >= crs.capacity ? '마감 (대기가능)' : `여석 ${crs.capacity - crs.enrolledCount}석`}
                </span>
              </div>
              <div className="course-title">{crs.name}</div>
              <div className="course-meta">
                <span>{crs.dept} | {crs.type} ({crs.credits}학점)</span>
                <span className="prof-lbl">👤 {crs.professorName} | 🏫 {crs.classroom}</span>
              </div>
              <div className="course-foot">
                <small>시간: {crs.scheduleTime} | 정원: {crs.enrolledCount}/{crs.capacity}</small>
                <button 
                  className="detail-btn-sm"
                  onClick={(e) => { e.stopPropagation(); openDetailMismatch(idx); }}
                >
                  수강신청 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
