import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedStudent,
  setSelectedStudent,
  students,
  rooms,
  triggerRoomStatusRace,
  triggerCheckoutOccupancyConflict,
  triggerPartialStudentSave
}) {
  const [phone, setPhone] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [preferredRoommate, setPreferredRoommate] = useState('');

  const targetStudent = selectedStudent || students[0];

  useEffect(() => {
    if (targetStudent) {
      setPhone(targetStudent.phone || '');
      setParentPhone(targetStudent.parentPhone || '');
      setPreferredRoommate(targetStudent.preferredRoommate || '');
    }
  }, [targetStudent]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Student Room Assignment & Status Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>🎓 학생 호실 배정 & 입사 상태 관제</h3>
        {targetStudent ? (
          <div className="detail-panel">
            <p>학생 ID: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{targetStudent.id}</strong> ({targetStudent.name})</p>
            <p>전공: <strong>{targetStudent.major} (GPA {targetStudent.gpa})</strong></p>
            <p>현재 상태: <span className={`status-badge ${targetStudent.status.toLowerCase()}`}>{targetStudent.status}</span></p>

            <div className="form-group">
              <label>입사 상태 변경 (0.1초 완료):</label>
              <select 
                value={targetStudent.status || 'CHECKED_IN'} 
                onChange={(e) => setSelectedStudent({ ...targetStudent, status: e.target.value })}
              >
                <option value="APPLIED">신청</option>
                <option value="APPROVED">승인</option>
                <option value="REJECTED">반려</option>
                <option value="CHECKED_IN">입사완료 (0.1초 완료)</option>
                <option value="CHECKED_OUT">퇴사</option>
              </select>
            </div>

            <div className="form-group">
              <label>배정 호실 변경 (Error 1 - 3초 지연):</label>
              <input 
                type="text" 
                value={targetStudent.roomNo || '301호'} 
                onChange={(e) => setSelectedStudent({ ...targetStudent, roomNo: e.target.value })}
              />
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerRoomStatusRace(targetStudent)}>
                호실 변경 후 즉시 입사 상태 변경 (Error 1)
              </button>
              <small className="warn-desc">* 호실 변경(3초 지연) 직후 입사 상태 변경(0.1초 완료) 시, 3초 뒤 이전 호실 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCheckoutOccupancyConflict(targetStudent)}>
                ⚡ 퇴사 처리 후 호실 점유 갱신 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 퇴사 처리(0.5초 완료) 직후 점유 갱신(4초 지연 완료) 시, 늦은 갱신 요청이 퇴사 학생을 CHECKED_IN 입사중 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 기숙사 학생 항목을 선택하세요.</div>
        )}
      </div>

      {/* Student Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>👤 학생 연락처 & 보호자 정보 수정 (Error 8)</h3>
        {targetStudent ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>연락처:</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>보호자 연락처 (부분저장 미반영):</label>
              <input type="text" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
            </div>

            <div className="form-group">
              <label>희망 룸메이트:</label>
              <input type="text" value={preferredRoommate} onChange={(e) => setPreferredRoommate(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialStudentSave(targetStudent.id, phone, parentPhone, preferredRoommate)}
            >
              학생 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 연락처/보호자연락처/희망룸메이트를 동시에 수정하면 백엔드에는 보호자연락처만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 학생을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
