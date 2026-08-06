import React from 'react';

export default function Sidebar({
  filterSubject,
  setFilterSubject,
  filterGrade,
  setFilterGrade,
  closingSoonSortOrder,
  setClosingSoonSortOrder,
  triggerSearchRace,
  courses,
  selectedCourse,
  setSelectedCourse,
  confirmCourseEnroll
}) {
  return (
    <aside className="panel-section filter-sidebar">
      <h3>📌 과목 & 학년 강좌 필터</h3>
      
      <div className="filter-group">
        <label>과목 선택 (Error 5):</label>
        <select 
          value={filterSubject} 
          onChange={(e) => {
            setFilterSubject(e.target.value);
            triggerSearchRace(e.target.value, filterGrade);
          }}
        >
          <option value="ALL">전체 과목</option>
          <option value="MATH">수학 (MATH - Error 5)</option>
          <option value="ENGLISH">영어 (ENGLISH)</option>
          <option value="KOREAN">국어 (KOREAN)</option>
          <option value="SCIENCE">과학 (SCIENCE)</option>
          <option value="SOCIAL">사회 (SOCIAL)</option>
        </select>
        <small className="warn-desc">* 과목 고속 변경 시 이전 응답(수학 3초)이 최신 결과를 덮어써 중앙 강좌 목록과 오른쪽 수강 요약이 어긋남 (Error 5)</small>
      </div>

      <div className="filter-group">
        <label>대상 학년 필터:</label>
        <select 
          value={filterGrade} 
          onChange={(e) => {
            setFilterGrade(e.target.value);
            triggerSearchRace(filterSubject, e.target.value);
          }}
        >
          <option value="ALL">전체 학년</option>
          <option value="HIGH_3">고등학교 3학년</option>
          <option value="HIGH_2">고등학교 2학년</option>
          <option value="HIGH_1">고등학교 1학년</option>
          <option value="MIDDLE_3">중학교 3학년</option>
        </select>
      </div>

      <div className="filter-group">
        <label>마감임박순 정렬 (Error 3):</label>
        <select value={closingSoonSortOrder} onChange={(e) => setClosingSoonSortOrder(e.target.value)}>
          <option value="NONE">기본 순서</option>
          <option value="CLOSING_SOON">마감임박순 (Error 3)</option>
        </select>
        <small className="warn-desc">* 마감임박순 정렬 상태에서 수강 신청 클릭 시 정렬 인덱스 불일치로 다른 강좌가 신청 저장됨 (Error 3)</small>
      </div>

      <div className="filter-group">
        <label>학원 개설 강좌 목록 (최소 15개):</label>
        <div className="courses-stack">
          {courses.map((c, idx) => (
            <div 
              key={c.id}
              className={`course-card ${selectedCourse?.id === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCourse(c)}
            >
              <div className="course-head">
                <span className="subject-tag">{c.subjectName}</span>
                {c.closingSoon && <span className="closing-badge">마감임박</span>}
              </div>
              <div className="course-title">{c.title}</div>
              <div className="course-foot">
                <span>{c.instructor} | {c.enrolledCount}/{c.capacity}명</span>
                <button 
                  className="enroll-btn-sm"
                  onClick={(e) => { e.stopPropagation(); confirmCourseEnroll(idx); }}
                >
                  수강 신청 (Error 3)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
