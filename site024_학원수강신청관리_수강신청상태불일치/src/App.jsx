import React, { useState, useEffect } from 'react';

export default function App() {
  // DB states
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  
  // Timetable ordering states (Error 4 Target)
  const [originalTimetable, setOriginalTimetable] = useState([]);
  const [visualTimetable, setVisualTimetable] = useState([]);

  // Filter conditions
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected details
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  // Error 1: Enrolled check maps to INDEX in the filtered array
  const [localEnrolledIndexes, setLocalEnrolledIndexes] = useState([]);

  // Toast alerts
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadCourses();
    loadTeachers();
    loadEnrollments();
    loadTimetable();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      showToast('강좌 목록을 불러오지 못했습니다.', 'danger');
    }
  };

  const loadTeachers = async () => {
    try {
      const res = await fetch('/api/teachers');
      const data = await res.json();
      setTeachers(data);
    } catch (err) {
      showToast('강사 프로필 목록을 불러오지 못했습니다.', 'danger');
    }
  };

  const loadEnrollments = async () => {
    try {
      const res = await fetch('/api/enroll');
      const data = await res.json();
      setEnrolledIds(data);
    } catch (err) {
      showToast('수강 신청 내역 조회 실패', 'danger');
    }
  };

  const loadTimetable = async () => {
    try {
      const res = await fetch('/api/timetable');
      const data = await res.json();
      setOriginalTimetable(data);
      setVisualTimetable(data);
    } catch (err) {
      showToast('시간표 배치를 조회하지 못했습니다.', 'danger');
    }
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Filter courses
  const filteredCourses = courses.filter(c => {
    const matchSubject = selectedSubject === 'All' || c.subject === selectedSubject;
    const matchDifficulty = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubject && matchDifficulty && matchSearch;
  });

  const activeCourse = courses.find(c => c.id === selectedCourseId);
  const activeTeacher = activeCourse ? teachers.find(t => t.id === activeCourse.teacherId) : null;

  // Error 1: Enrolled triggers matching by local filtered array INDEX
  const handleEnrollClick = async (index, courseId) => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 수강 신청 완료 표시를 적용할 때 강좌의 고유 식별자(courseId) 대신, 
    // 현재 필터가 가동된 후 렌더링되고 있는 리스트의 인덱스 번호(index)를 localEnrolledIndexes 배열에 담습니다. 
    // 이 상태에서 상단 과목 탭(수학, 영어 등)을 조작해 리스트를 재구성하면 엉뚱한 과목 강좌 카드가 
    // 신청 완료 처리된 것처럼 UI가 틀어지는 부작용을 일으킵니다.
    if (localEnrolledIndexes.includes(index)) {
      setLocalEnrolledIndexes(localEnrolledIndexes.filter(i => i !== index));
    } else {
      setLocalEnrolledIndexes([...localEnrolledIndexes, index]);
    }

    // Call actual backend enrollment API
    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '수강 신청 실패');
      }

      showToast('수강 신청서가 성공적으로 수리되었습니다.', 'success');
      setEnrolledIds(data.enrolled);
      setCourses(data.courses);
      loadTimetable();
    } catch (err) {
      showToast(`[수강 신청 실패] ${err.message}`, 'danger');
    }
  };

  // Cancel Enrollment (Error 3 targets occupancy non-decrement on DELETE)
  const handleCancelEnroll = async (courseId) => {
    try {
      const res = await fetch(`/api/enroll/${courseId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok) {
        showToast('수강 신청이 정상 취소되었습니다.', 'success');
        setEnrolledIds(data.enrolled);
        setCourses(data.courses);
        loadTimetable();
      } else {
        throw new Error(data.error || '취소 실패');
      }
    } catch (err) {
      showToast(`[취소 에러] ${err.message}`, 'danger');
    }
  };

  // Timetable ordering actions
  const moveTimetableItem = (index, direction) => {
    const updated = [...visualTimetable];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    // Swap elements
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setVisualTimetable(updated);
  };

  // Error 4: Saving timetable order sends original timetable order list
  const saveTimetableLayout = async () => {
    // INTENTIONAL_ERROR
    // CATEGORY: Frontend
    // DESCRIPTION: 시간표 배열 순서를 변경(Up/Down)한 후 저장 단추를 누를 때, 
    // 사용자가 정렬해 놓은 visualTimetable이 아닌 최초 로드되었던 원본 미정렬 배열(originalTimetable)을 
    // 서버 전송 body에 담아 넘기게 유도합니다. 이 때문에 새로고침 시 시간표 배치 순서가 복원되지 못하고 원복됩니다.
    try {
      const res = await fetch('/api/timetable/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: originalTimetable // Sends UNCHANGED original list!
        })
      });
      const data = await res.json();

      if (res.ok) {
        showToast('시간표 배치 우선순위가 반영되었습니다.', 'success');
        setOriginalTimetable(data.timetable);
        setVisualTimetable(data.timetable);
      } else {
        throw new Error('시간표 순서 동기화 실패');
      }
    } catch (err) {
      showToast(`[저장 실패] ${err.message}`, 'danger');
    }
  };

  // Get course title by ID for timetable grid matching
  const getCourseTitle = (courseId) => {
    const c = courses.find(x => x.id === courseId);
    return c ? `${c.title} (${c.time.split(' ')[0]})` : '미지정';
  };

  return (
    <div className="classbridge-app">
      {/* Top Navbar */}
      <header className="app-navbar">
        <div className="logo-group">
          <svg className="logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 10v6M2 10v6M4 10h16M12 4v16" />
          </svg>
          <span className="logo-title">ClassBridge</span>
          <span className="logo-subtitle">학습 격차 해소 플래너</span>
        </div>

        <div className="search-bar-box">
          <input 
            type="text" 
            placeholder="원하는 강좌명 또는 강사명을 입력하세요..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="navbar-search"
          />
        </div>
      </header>

      {/* Top Subjects Tab bar */}
      <nav className="subject-tabs-container">
        {['All', '수학', '영어', '국어', '사회', '과학'].map(sub => (
          <button 
            key={sub}
            onClick={() => setSelectedSubject(sub)}
            className={`subject-tab-btn ${selectedSubject === sub ? 'active' : ''}`}
          >
            {sub === 'All' ? '전체 과목' : sub}
          </button>
        ))}
      </nav>

      {/* Main Grid Workspace */}
      <div className="workspace-grid">
        
        {/* Left Side: Filter and Course Catalog */}
        <section className="panel-section courses-catalog-panel">
          <div className="panel-header-row">
            <h2>📚 개설 강좌 목록 ({filteredCourses.length}개)</h2>
            
            <div className="difficulty-filter-box">
              <label>난이도 선택:</label>
              <select 
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="difficulty-select"
              >
                <option value="All">전체 난이도</option>
                <option value="초급">초급 (기본기 다지기)</option>
                <option value="중급">중급 (응용 핵심)</option>
                <option value="고급">고급 (1등급 킬러)</option>
              </select>
            </div>
          </div>

          <div className="courses-grid-layout">
            {filteredCourses.map((course, index) => {
              // Error 1: Enrolled check maps to INDEX in the filtered array
              const isEnrolled = localEnrolledIndexes.includes(index);
              
              return (
                <div 
                  key={course.id}
                  className={`course-card ${selectedCourseId === course.id ? 'active' : ''}`}
                  onClick={() => setSelectedCourseId(course.id)}
                >
                  <div className="card-top">
                    <span className={`diff-badge ${course.difficulty}`}>
                      {course.difficulty}
                    </span>
                    <span className="subject-lbl">[{course.subject}]</span>
                  </div>

                  <div className="card-middle">
                    <h3>{course.title}</h3>
                    <p className="time-lbl">📅 {course.time}</p>
                    <div className="occupancy-info">
                      <span className="bar-label">정원 현황 ({course.occupancy}/{course.capacity}명)</span>
                      <div className="occupancy-track">
                        <div 
                          className="occupancy-fill" 
                          style={{ width: `${(course.occupancy / course.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="card-bottom">
                    <span className="price">{course.price.toLocaleString()}원</span>
                    
                    <button 
                      type="button"
                      className={`enroll-btn ${isEnrolled ? 'completed' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnrollClick(index, course.id);
                      }}
                    >
                      {isEnrolled ? '✓ 신청 완료' : '수강 신청'}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredCourses.length === 0 && (
              <div className="empty-placeholder">
                조건에 맞는 학원 강좌가 등록되어 있지 않습니다.
              </div>
            )}
          </div>
        </section>

        {/* Right Side: Timetable & Teacher list & Cart Summary */}
        <aside className="right-details-column">
          
          {/* Detailed Course Briefing */}
          {activeCourse ? (
            <section className="panel-section course-detail-panel">
              <div className="panel-header">
                <h2>🔎 선택 강좌 상세 정보</h2>
              </div>

              <div className="detail-meta">
                <h3>{activeCourse.title}</h3>
                <p className="sub">과목: {activeCourse.subject} | 난이도: {activeCourse.difficulty}</p>
                <div className="price-tag">수강료: {activeCourse.price.toLocaleString()}원</div>
              </div>

              {activeTeacher && (
                <div className="teacher-profile-slide">
                  <h4>👨‍🏫 담당 전문 강사 소개</h4>
                  <div className="teacher-avatar-card">
                    {/* Error 5: Emma's image extension is PNGG (broken image URL) */}
                    <img 
                      src={activeTeacher.avatar} 
                      alt={activeTeacher.name} 
                      className="teacher-avatar" 
                    />
                    <div className="t-info">
                      <h5>{activeTeacher.name} 강사</h5>
                      <p>{activeTeacher.specialty}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="detail-timetable-card">
                <h4>⏰ 수강 요일 및 배정 시간</h4>
                <p>{activeCourse.time}</p>
              </div>
            </section>
          ) : (
            <section className="panel-section course-detail-panel empty">
              <div className="empty-placeholder">
                강좌를 선택하시면 세부 주간 일정과 담당 강사 프로필 정보가 여기에 표기됩니다.
              </div>
            </section>
          )}

          {/* Weekly Timetable & Sorting */}
          <section className="panel-section timetable-grid-panel">
            <div className="panel-header">
              <h2>📅 내 주간 시간표 배치 우선순위</h2>
            </div>

            <div className="timetable-interactive-list">
              {visualTimetable.map((tId, idx) => (
                <div key={tId} className="timetable-item-card">
                  <span className="priority-num">{idx + 1}순위</span>
                  <p className="title">{getCourseTitle(tId)}</p>
                  
                  <div className="order-actions">
                    <button 
                      type="button" 
                      onClick={() => moveTimetableItem(idx, -1)}
                      disabled={idx === 0}
                      className="order-btn"
                    >
                      ▲
                    </button>
                    <button 
                      type="button" 
                      onClick={() => moveTimetableItem(idx, 1)}
                      disabled={idx === visualTimetable.length - 1}
                      className="order-btn"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}

              {visualTimetable.length === 0 && (
                <div className="empty-placeholder">수강 신청된 과목이 없어 시간표가 공백 상태입니다.</div>
              )}

              {visualTimetable.length > 0 && (
                <button 
                  type="button" 
                  onClick={saveTimetableLayout} 
                  className="save-timetable-btn"
                >
                  시간표 순서 배치 저장
                </button>
              )}
            </div>
          </section>

          {/* Enrolled classes list */}
          <section className="panel-section my-classes-panel">
            <div className="panel-header">
              <h2>💳 수강 신청 목록 / 결제 요약 ({enrolledIds.length}개)</h2>
            </div>

            <div className="enrolled-receipt-box">
              {enrolledIds.map(cId => {
                const c = courses.find(item => item.id === cId);
                if (!c) return null;
                return (
                  <div key={c.id} className="receipt-item">
                    <div className="info">
                      <h4>{c.title}</h4>
                      <p className="sub">{c.time} | {c.price.toLocaleString()}원</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleCancelEnroll(c.id)}
                      className="cancel-class-btn"
                    >
                      취소
                    </button>
                  </div>
                );
              })}

              {enrolledIds.length === 0 && (
                <div className="empty-placeholder">신청된 수강 강좌가 존재하지 않습니다.</div>
              )}

              <div className="receipt-total-footer">
                <span>총 등록 수강 금액:</span>
                <strong className="total-val">
                  {enrolledIds.reduce((sum, id) => {
                    const c = courses.find(item => item.id === id);
                    return sum + (c ? c.price : 0);
                  }, 0).toLocaleString()}원
                </strong>
              </div>
            </div>
          </section>

        </aside>

      </div>

      {/* Toast Alert Cabinets */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast-card ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✅' : t.type === 'danger' ? '❌' : '⚠️'}
            </span>
            <span className="toast-message">{t.message}</span>
            <button 
              className="toast-close" 
              onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
