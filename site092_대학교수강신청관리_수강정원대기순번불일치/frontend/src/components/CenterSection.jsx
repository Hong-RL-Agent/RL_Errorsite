import React, { useState } from 'react';

export default function CenterSection({
  courses,
  registrations,
  waitlists,
  cartItems,
  deleteRegistration,
  openCourseModal,
  testUnauthorizedCapacity
}) {
  const [activeTab, setActiveTab] = useState('TIMETABLE'); // 'TIMETABLE' | 'REGISTRATIONS' | 'WAITLISTS'

  const days = ['월', '화', '수', '목', '금'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // Helper to check if a period matches scheduleTime
  const getCourseForSlot = (day, period) => {
    return courses.find(c => {
      const match = c.scheduleTime.includes(day);
      if (!match) return false;
      return c.scheduleTime.includes(period.toString());
    });
  };

  return (
    <main className="panel-section center-section">
      <div className="tab-switcher">
        <button 
          className={`tab-btn ${activeTab === 'TIMETABLE' ? 'active' : ''}`}
          onClick={() => setActiveTab('TIMETABLE')}
        >
          📅 주간 시간표 미리보기 (요일/교시 그리드)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'REGISTRATIONS' ? 'active' : ''}`}
          onClick={() => setActiveTab('REGISTRATIONS')}
        >
          🎓 수강신청 및 장바구니 내역 (45건)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'WAITLISTS' ? 'active' : ''}`}
          onClick={() => setActiveTab('WAITLISTS')}
        >
          ⏳ 대기 순번 및 정원 현황 (30건)
        </button>
      </div>

      {activeTab === 'TIMETABLE' && (
        <div className="widget-section">
          <h2>📅 2026학년도 2학기 주간 시간표 그리드</h2>
          <div className="timetable-grid-box">
            <div className="timetable-header-cell">교시 / 요일</div>
            {days.map(d => (
              <div key={d} className="timetable-header-cell">{d}요일</div>
            ))}

            {periods.map(p => (
              <React.Fragment key={p}>
                <div className="timetable-time-cell">{p}교시 ({8 + p}:00)</div>
                {days.map(d => {
                  const crs = getCourseForSlot(d, p);
                  return (
                    <div key={`${d}-${p}`} className={`timetable-slot-cell ${crs ? 'filled' : ''}`}>
                      {crs ? (
                        <div className="timetable-course-block">
                          <strong className="block-name">{crs.name}</strong>
                          <span className="block-prof">{crs.professorName}</span>
                          <small className="block-room">{crs.classroom}</small>
                        </div>
                      ) : (
                        <span className="empty-slot">-</span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'REGISTRATIONS' && (
        <div className="widget-section">
          <h2>🎓 전체 수강신청 완료 대장 (45건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>신청 ID</th>
                  <th>학번 / 학생명</th>
                  <th>강의코드</th>
                  <th>강의명</th>
                  <th>학점</th>
                  <th>신청 일시</th>
                  <th>상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg.id}>
                    <td><strong>{reg.id}</strong></td>
                    <td>{reg.studentId} ({reg.studentName})</td>
                    <td><strong style={{ color: 'var(--color-primary)' }}>{reg.courseId}</strong></td>
                    <td>{reg.courseName}</td>
                    <td>{reg.credits}학점</td>
                    <td><small>{reg.registeredAt}</small></td>
                    <td><span className={`status-badge ${reg.status === 'REGISTERED' ? 'completed' : 'danger'}`}>{reg.status}</span></td>
                    <td>
                      <button className="delete-btn-sm" onClick={() => deleteRegistration(reg.id)}>
                        🗑️ 수강 취소/삭제 (Error 4)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <small className="warn-desc">* 수강신청 삭제(DELETE) 시 신청 내역에서는 소거되나 강의별 수강 인원(enrolledCount) 및 정원 그래프 수치에는 남음 (Error 4)</small>
        </div>
      )}

      {activeTab === 'WAITLISTS' && (
        <div className="widget-section">
          <h2>⏳ 대기 순번 및 신청 대기열 대장 (30건)</h2>
          <div className="table-scroll-box">
            <table>
              <thead>
                <tr>
                  <th>대기 ID</th>
                  <th>학번 / 학생명</th>
                  <th>강의 ID</th>
                  <th>강의명</th>
                  <th>대기 순번</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {waitlists.map(w => (
                  <tr key={w.id}>
                    <td><strong>{w.id}</strong></td>
                    <td>{w.studentId} ({w.studentName})</td>
                    <td><strong style={{ color: 'var(--color-warning)' }}>{w.courseId}</strong></td>
                    <td>{w.courseName}</td>
                    <td><strong style={{ color: 'var(--color-danger)' }}>{w.position}번 대기중</strong></td>
                    <td><span className="status-badge warning">{w.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button className="delete-btn-sm" onClick={() => testUnauthorizedCapacity('CRS-101')}>
              🔒 학과 조교의 강의 정원 변경 시도 (Error 7)
            </button>
            <small className="warn-desc">* 조교 계정이 정원 변경 시 HTTP 403 오류를 반환하나 백엔드 감사 로그에는 성공(200 OK)으로 기록됨 (Error 7)</small>
          </div>
        </div>
      )}
    </main>
  );
}
