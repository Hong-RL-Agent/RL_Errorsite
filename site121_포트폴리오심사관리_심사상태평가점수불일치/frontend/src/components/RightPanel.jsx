import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedApplicant, setSelectedApplicant, applicants, triggerStatusScoreRace, triggerCancelCommentConflict, triggerPartialSave }) {
  const [appName, setAppName] = useState('');
  const [targetJob, setTargetJob] = useState('UX/UI 디자인');
  const [phone, setPhone] = useState('');
  const [evalScore, setEvalScore] = useState(90.0);

  const target = selectedApplicant || applicants[0];

  useEffect(() => {
    if (target) {
      setAppName(target.name || '');
      setTargetJob(target.targetJob || 'UX/UI 디자인');
      setPhone(target.phone || '');
      setEvalScore(target.evalScore || 90.0);
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🏅 포트폴리오 심사 & 점수 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>지원자 성명: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.name}</strong></p>
            <p>지원 직무: <strong>{target.targetJob}</strong> | 경력: <strong>{target.experienceYears}년차</strong></p>
            <p>포트폴리오: <small>{target.portfolioTitle}</small></p>
            <p>평가 점수: <strong style={{ color: 'var(--color-success)' }}>{target.evalScore}점</strong></p>
            <p>심사 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>평가 점수 수정 (0.1초 완료):</label>
              <input type="number" step="0.5" value={evalScore} onChange={(e) => {
                setEvalScore(Number(e.target.value));
                setSelectedApplicant({ ...target, evalScore: Number(e.target.value) });
              }} />
            </div>

            <div className="form-group">
              <label>심사 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'PASSED'} onChange={(e) => setSelectedApplicant({ ...target, status: e.target.value })}>
                <option value="SUBMITTED">제출완료 (SUBMITTED)</option>
                <option value="ASSIGNED">심사배정 (ASSIGNED)</option>
                <option value="UNDER_REVIEW">심사중 (UNDER_REVIEW)</option>
                <option value="HOLD">보류 (HOLD)</option>
                <option value="PASSED">합격 (PASSED)</option>
                <option value="FAILED">불합격 (FAILED)</option>
                <option value="CANCELLED">지원취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusScoreRace(target.id, target, evalScore)}>
              합격 변경 + 즉시 평가 점수 수정 (Error 1)
            </button>
            <small className="warn-desc">* 심사 상태 변경(3초 지연) 직후 점수 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 점수를 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelCommentConflict(target.id)}>
                ⚡ 지원 취소 후 심사 코멘트 작성 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 지원 취소(0.5초 완료) 직후 코멘트 작성(4초 지연 완료) 시, 취소된 지원이 UNDER_REVIEW(심사중)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 지원자를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 지원자 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>지원자 성명:</label>
              <input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>희망 직무 (부분 저장 미반영):</label>
              <select value={targetJob} onChange={(e) => setTargetJob(e.target.value)}>
                <option value="UX/UI 디자인">UX/UI 디자인</option>
                <option value="프론트엔드 개발">프론트엔드 개발</option>
                <option value="서비스 기획">서비스 기획</option>
                <option value="브랜드 디자인">브랜드 디자인</option>
                <option value="백엔드 개발">백엔드 개발</option>
              </select>
            </div>
            <div className="form-group">
              <label>연락처:</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, appName, targetJob, phone)}>
              지원자 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 성명/희망직무/연락처 동시 수정 시 희망직무만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 지원자를 선택하세요.</div>}
      </div>
    </aside>
  );
}
