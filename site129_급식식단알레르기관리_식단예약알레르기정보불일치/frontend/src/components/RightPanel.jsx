import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedStudent, setSelectedStudent, students, menus, subMealRequests, triggerStatusMenuRace, triggerCancelServingConflict, triggerPartialSave }) {
  const [studentName, setStudentName] = useState('');
  const [gradeClass, setGradeClass] = useState('');
  const [allergies, setAllergies] = useState('');
  const [menuId, setMenuId] = useState('');
  const [requestedSubMenu, setRequestedSubMenu] = useState('');

  const target = selectedStudent || students[0];
  const subReq = subMealRequests.find(s => s.studentId === target?.id) || subMealRequests[0];

  useEffect(() => {
    if (target) {
      setStudentName(target.studentName || '');
      setGradeClass(target.gradeClass || '');
      setAllergies(target.allergies || '');
      if (subReq) {
        setMenuId(subReq.menuId || '');
        setRequestedSubMenu(subReq.requestedSubMenu || '');
      }
    }
  }, [target, subReq]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🥗 대체식 신청 & 알레르기 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>학생 성명: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.studentName}</strong> ({target.gradeClass})</p>
            <p>진단 알레르기: <strong style={{ color: 'var(--color-danger)' }}>{target.allergies}</strong></p>
            <p>보호자 연락처: <strong>{target.parentPhone}</strong></p>
            <p>대체식 신청 상태: <span className={`status-badge ${subReq?.status?.toLowerCase() || 'pending'}`}>{subReq?.status || 'PENDING'}</span></p>

            <div className="form-group">
              <label>대체식 신청 대상 식단 변경 (0.1초 완료):</label>
              <select value={menuId} onChange={(e) => {
                setMenuId(e.target.value);
                const m = menus.find(x => x.id === e.target.value);
                if (m) setRequestedSubMenu(m.substituteOption);
              }}>
                {menus.map(m => <option key={m.id} value={m.id}>{m.menuName} ({m.mealDate})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>희망 대체 급식 식단명:</label>
              <input type="text" value={requestedSubMenu} onChange={(e) => setRequestedSubMenu(e.target.value)} />
            </div>

            <div className="form-group">
              <label>대체식 승인 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={subReq?.status || 'APPROVED'} onChange={(e) => {
                if (subReq) subReq.status = e.target.value;
              }}>
                <option value="PENDING">신청대기 (PENDING)</option>
                <option value="APPROVED">승인완료 (APPROVED)</option>
                <option value="SERVED">배식완료 (SERVED)</option>
                <option value="REJECTED">반려됨 (REJECTED)</option>
                <option value="CANCELLED">취소됨 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => {
              if (subReq) {
                const m = menus.find(x => x.id === menuId);
                triggerStatusMenuRace(subReq.id, subReq.status, menuId, m?.menuName || '', requestedSubMenu);
              }
            }}>
              승인완료 변경 + 즉시 식단 변경 (Error 1)
            </button>
            <small className="warn-desc">* 승인완료 변경(3초 지연) 직후 식단 변경(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 식단을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => { if (subReq) triggerCancelServingConflict(subReq.id); }}>
                ⚡ 신청 취소 후 배식 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 신청 취소(0.5초 완료) 직후 배식 완료(4초 지연 완료) 시, 취소된 신청이 SERVED(배식완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 학생을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 학생 및 알레르기 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>학생 성명:</label>
              <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>학년 / 반 (부분 저장 미반영):</label>
              <input type="text" value={gradeClass} onChange={(e) => setGradeClass(e.target.value)} />
            </div>
            <div className="form-group">
              <label>알레르기 보유 항목:</label>
              <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, studentName, gradeClass, allergies)}>
              학생 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/학년반/알레르기 동시 수정 시 학년반만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 학생을 선택하세요.</div>}
      </div>
    </aside>
  );
}
