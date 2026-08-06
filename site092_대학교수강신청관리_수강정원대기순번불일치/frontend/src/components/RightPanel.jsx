import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedCourse,
  setSelectedCourse,
  activeStudent,
  triggerCartRegisterRace,
  triggerCancelAutoPromoteConflict,
  triggerPartialCourseSave
}) {
  const [classroom, setClassroom] = useState('');
  const [capacity, setCapacity] = useState(40);
  const [professorName, setProfessorName] = useState('');

  useEffect(() => {
    if (selectedCourse) {
      setClassroom(selectedCourse.classroom || '');
      setCapacity(selectedCourse.capacity || 40);
      setProfessorName(selectedCourse.professorName || '');
    }
  }, [selectedCourse]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Cart & Registration Fast Execution Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>🛒 장바구니 & 빠른 수강신청 제어</h3>
        {selectedCourse ? (
          <div className="detail-panel">
            <p>강의 코드: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedCourse.code}</strong> ({selectedCourse.id})</p>
            <p>강의명: <strong>{selectedCourse.name}</strong> ({selectedCourse.credits}학점)</p>
            <p>개설 학과: <strong>{selectedCourse.dept}</strong> ({selectedCourse.type})</p>
            <p>담당 교수: <strong>{selectedCourse.professorName}</strong></p>
            <p>현재 정원: <strong>{selectedCourse.enrolledCount} / {selectedCourse.capacity}명</strong></p>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="save-btn" onClick={() => triggerCartRegisterRace(selectedCourse, activeStudent)}>
                ⚡ 장바구니 담기 후 즉시 수강신청 (Error 1)
              </button>
              <small className="warn-desc">* 장바구니 저장(3초 지연)과 수강신청(0.1초 완료)이 충돌하여 신청 완료 후에도 장바구니에 강의가 잔존함 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelAutoPromoteConflict(selectedCourse)}>
                ⚡ 수강신청 취소 후 대기자 자동 승인 (Error 2)
              </button>
              <small className="warn-desc">* 수강 취소(0.5초 완료) 직후 대기자 자동 승인(4초 지연 완료) 시, 취소한 학생이 수강중 상태로 재활성화됨 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">신청할 강의 항목을 선택하세요.</div>
        )}
      </div>

      {/* Course Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>📚 강의 정보 및 정원 수정 (Error 8)</h3>
        {selectedCourse ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>강의실:</label>
              <input type="text" value={classroom} onChange={(e) => setClassroom(e.target.value)} />
            </div>

            <div className="form-group">
              <label>수강 정원 (명):</label>
              <input type="number" value={capacity} onChange={(e) => setCapacity(parseInt(e.target.value || '0'))} />
            </div>

            <div className="form-group">
              <label>담당 교수 (부분저장 미반영):</label>
              <input type="text" value={professorName} onChange={(e) => setProfessorName(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialCourseSave(selectedCourse.id, classroom, capacity, professorName)}
            >
              강의 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 강의실/정원/담당교수를 동시에 수정하면 백엔드에는 담당교수만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 강의를 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
