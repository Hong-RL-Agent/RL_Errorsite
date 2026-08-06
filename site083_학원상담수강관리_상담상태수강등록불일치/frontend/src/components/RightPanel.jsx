import React from 'react';

export default function RightPanel({
  selectedConsultation,
  setSelectedConsultation,
  triggerTimeStatusRace,
  selectedStudent,
  triggerCancelAttendanceConflict
}) {
  return (
    <aside className="panel-section operations-sidebar">
      <!-- Consultation Time & Status adjust (Error 1 Target) -->
      <div className="detail-widget">
        <h3>⏰ 학원 상담 일시 & 진행 상태 변경</h3>
        {selectedConsultation ? (
          <div className="detail-panel">
            <p>상담 ID: <strong>{selectedConsultation.id}</strong> ({selectedConsultation.studentName} 학생)</p>

            <div className="form-group">
              <label>상담 상태 변경:</label>
              <select 
                value={selectedConsultation.status || 'RESERVED'} 
                onChange={(e) => setSelectedConsultation({ ...selectedConsultation, status: e.target.value })}
              >
                <option value="RESERVED">상담 대기 (RESERVED)</option>
                <option value="COMPLETED">상담 완료 (COMPLETED)</option>
                <option value="CANCELLED">상담 취소 (CANCELLED)</option>
              </select>
            </div>

            <div className="form-group">
              <label>상담 일시 조정:</label>
              <div className="input-row">
                <input 
                  type="date" 
                  value={selectedConsultation.date || '2026-08-10'} 
                  onChange={(e) => setSelectedConsultation({ ...selectedConsultation, date: e.target.value })}
                />
                <select 
                  value={selectedConsultation.timeSlot || '14:00'} 
                  onChange={(e) => setSelectedConsultation({ ...selectedConsultation, timeSlot: e.target.value })}
                >
                  <option value="10:00">10:00</option>
                  <option value="11:30">11:30</option>
                  <option value="14:00">14:00</option>
                  <option value="15:30">15:30</option>
                  <option value="17:00">17:00</option>
                  <option value="18:30">18:30</option>
                </select>
                <button className="save-btn" onClick={() => triggerTimeStatusRace(selectedConsultation)}>
                  시간 변경 (Error 1)
                </button>
              </div>
              <small className="warn-desc">* 시간 변경(3초 지연 완료) 직후 상태 변경(0.1초 완료) 시, 3초 뒤 이전 상태가 동봉되어 롤백 저장됨 (Error 1)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">수정할 상담 항목을 선택하세요.</div>
        )}
      </div>

      <!-- Student Enrollment & Attendance Conflict (Error 2 Target) -->
      <div className="detail-widget">
        <h3>🎓 학생 수용 상태 & 출결 연동 관리</h3>
        {selectedStudent ? (
          <div className="detail-panel">
            <p>학생 ID: <strong>{selectedStudent.id}</strong> ({selectedStudent.name} 학생)</p>
            <p>학년: <strong>{selectedStudent.gradeName}</strong> | 목표: <strong>{selectedStudent.targetUniv}</strong></p>
            <p>수강 상태: <strong style={{ color: 'var(--color-primary)' }}>{selectedStudent.status}</strong></p>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-enroll-btn" onClick={() => triggerCancelAttendanceConflict(selectedStudent)}>
                ⚡ 수강 취소 후 출결 체크 (Error 2)
              </button>
              <small className="warn-desc">* 수강 취소(0.5초 완료) 직후 출결 체크(4초 지연 완료) 시, 늦은 출결 요청이 취소된 학생을 수강중으로 재활성화시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">학생 상세 정보를 보려면 학생을 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
