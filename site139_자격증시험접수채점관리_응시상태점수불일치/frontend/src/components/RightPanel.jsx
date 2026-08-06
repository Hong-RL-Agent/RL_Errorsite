import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedExaminee, setSelectedExaminee, examinees, examCenters, triggerStatusScoreRace, triggerCancelScoringConflict, triggerPartialSave }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [examCenter, setExamCenter] = useState('서울 중앙 CBT 시험장 (301호)');
  const [score, setScore] = useState(85);

  const target = selectedExaminee || examinees[0];

  useEffect(() => {
    if (target) {
      setName(target.name || '');
      setPhone(target.phone || '');
      setExamCenter(target.examCenter || '서울 중앙 CBT 시험장 (301호)');
      setScore(target.score || 85);
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🎓 응시 상태 & CBT 점수 관제 패널</h3>
        {target ? (
          <div className="detail-panel">
            <p>수험 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.regCode}</strong></p>
            <p>응시자 성명: <strong style={{ fontSize: '0.88rem' }}>{target.name}</strong></p>
            <p>시험 과목: <strong>{target.subjectName}</strong> | 고사장: <span className="center-badge">{target.examCenter}</span></p>
            <p>접수일자: <small>{target.regDate}</small> | 현재 취득 점수: <strong style={{ color: 'var(--color-warning)' }}>{target.score}점</strong></p>
            <p>응시/채점 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>CBT 채점 점수 수정 (0.1초 완료):</label>
              <input type="number" value={score} onChange={(e) => setScore(Number(e.target.value))} />
            </div>

            <div className="form-group">
              <label>응시/채점 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'COMPLETED'} onChange={(e) => setSelectedExaminee({ ...target, status: e.target.value })}>
                <option value="REGISTERED">접수완료 (REGISTERED)</option>
                <option value="IN_EXAM">응시중 (IN_EXAM)</option>
                <option value="COMPLETED">응시완료 (COMPLETED)</option>
                <option value="SCORED">채점완료 (SCORED)</option>
                <option value="PASSED">합격 (PASSED)</option>
                <option value="FAILED">불합격 (FAILED)</option>
                <option value="CANCELLED">접수취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusScoreRace(target.id, target, score)}>
              응시완료 변경 + 즉시 점수 수정 (Error 1)
            </button>
            <small className="warn-desc">* 응시완료 변경(3초 지연) 직후 점수 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 점수를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelScoringConflict(target.id)}>
                ⚡ 접수 취소 후 채점 완료 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 접수 취소(0.5초 완료) 직후 채점 완료(4초 지연 완료) 시, 취소된 접수가 SCORED(채점완료)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 수험자를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 응시자 인적사항 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>수험자 성명:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>배정 CBT 시험장:</label>
              <select value={examCenter} onChange={(e) => setExamCenter(e.target.value)}>
                {examCenters.map(c => <option key={c.id} value={c.centerName}>{c.centerName}</option>)}
              </select>
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, name, phone, examCenter)}>
              응시자 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/연락처/시험장 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 수험자를 선택하세요.</div>}
      </div>
    </aside>
  );
}
