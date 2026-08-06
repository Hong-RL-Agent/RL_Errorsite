import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedCourse, setSelectedCourse, courses, instructors, triggerStatusCountRace, triggerCancelAttendanceConflict, triggerPartialSave }) {
  const [courseName, setCourseName] = useState('');
  const [instructorName, setInstructorName] = useState('김교수 강사');
  const [roomNo, setRoomNo] = useState('301호 서양화 실습실');
  const [enrolledCount, setEnrolledCount] = useState(28);

  const target = selectedCourse || courses[0];

  useEffect(() => {
    if (target) {
      setEnrolledCount(target.enrolledCount || 28);
      setCourseName(target.courseName || '');
      setInstructorName(target.instructorName || '김교수 강사');
      setRoomNo(target.roomNo || '301호 서양화 실습실');
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>📚 강좌 상태 & 수강 인원 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>강좌 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.courseCode}</strong></p>
            <p>카테고리: <span className="category-badge">{target.category}</span></p>
            <p>강좌명: <strong>{target.courseName}</strong></p>
            <p>담당 강사: <strong>{target.instructorName}</strong> | 강의실: <small>{target.roomNo}</small></p>
            <p>개강 시작일: <small>{target.startDate}</small> | 수강료: <strong style={{ color: 'var(--color-success)' }}>{target.tuitionFeeWon.toLocaleString()}원</strong></p>
            <p>현재 수강인원: <strong style={{ color: 'var(--color-warning)' }}>{target.enrolledCount}명</strong> / {target.maxCapacity}명 정원</p>
            <p>강좌 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>수강 인원 조정 (0.1초 완료):</label>
              <input type="number" value={enrolledCount} onChange={(e) => setEnrolledCount(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>강좌 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'CLOSED'} onChange={(e) => setSelectedCourse({ ...target, status: e.target.value })}>
                <option value="RECRUITING">모집중 (RECRUITING)</option>
                <option value="CLOSED">모집마감 (CLOSED)</option>
                <option value="IN_SESSION">강의중 (IN_SESSION)</option>
                <option value="COMPLETED">종강완료 (COMPLETED)</option>
                <option value="CANCELLED">폐강 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusCountRace(target.id, target, enrolledCount)}>
              모집마감 변경 + 즉시 수강 인원 조정 (Error 1)
            </button>
            <small className="warn-desc">* 모집마감 변경(3초 지연) 직후 수강 인원 조정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 수강 인원을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelAttendanceConflict(target.id)}>
                ⚡ 수강 취소 후 출석 처리 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 수강 취소(0.5초 완료) 직후 출석 처리(4초 지연 완료) 시, 취소된 수강생이 ATTENDED(출석완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 강좌를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 문화센터 강좌 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>강좌 명칭:</label>
              <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>담당 강사명:</label>
              <input type="text" value={instructorName} onChange={(e) => setInstructorName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>배정 강의실 (부분 저장 미반영):</label>
              <input type="text" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, courseName, roomNo, instructorName)}>
              강좌 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 강좌명/강사명/강의실 동시 수정 시 강의실만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 강좌를 선택하세요.</div>}
      </div>
    </aside>
  );
}
