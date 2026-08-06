import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedContract, setSelectedContract, contracts, clients, triggerStatusClauseRace, triggerRejectCommentConflict, triggerPartialSave }) {
  const [title, setTitle] = useState('');
  const [expireDate, setExpireDate] = useState('2027-12-31');
  const [clientName, setClientName] = useState('');
  const [clauseContent, setClauseContent] = useState('');

  const target = selectedContract || contracts[0];

  useEffect(() => {
    if (target) {
      setTitle(target.title || '');
      setExpireDate(target.expireDate || '2027-12-31');
      setClientName(target.clientName || '');
      setClauseContent(target.clauseContent || '');
    }
  }, [target]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>⚖️ 계약서 검토 & 조항 심사 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>계약서 명칭: <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>{target.title}</strong></p>
            <p>상대 거래처: <strong>{target.clientName}</strong> | 만료일: <strong>{target.expireDate}</strong></p>
            <p>리스크 점수: <strong style={{ color: 'var(--color-danger)' }}>{target.riskScore}점</strong></p>
            <p>검토 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>중요 독소/리스크 조항 수정 (0.1초 완료):</label>
              <textarea rows="3" value={clauseContent} onChange={(e) => {
                setClauseContent(e.target.value);
                setSelectedContract({ ...target, clauseContent: e.target.value });
              }} />
            </div>

            <div className="form-group">
              <label>검토 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'APPROVAL_PENDING'} onChange={(e) => setSelectedContract({ ...target, status: e.target.value })}>
                <option value="REQUESTED">검토요청 (REQUESTED)</option>
                <option value="UNDER_REVIEW">검토중 (UNDER_REVIEW)</option>
                <option value="APPROVAL_PENDING">승인대기 (APPROVAL_PENDING)</option>
                <option value="APPROVED">승인완료 (APPROVED)</option>
                <option value="REJECTED">반려됨 (REJECTED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusClauseRace(target.id, target, clauseContent)}>
              승인대기 변경 + 즉시 조항 수정 (Error 1)
            </button>
            <small className="warn-desc">* 검토 상태 변경(3초 지연) 직후 조항 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 조항을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerRejectCommentConflict(target.id)}>
                ⚡ 계약 반려 후 검토 의견 작성 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 계약 반려(0.5초 완료) 직후 의견 작성(4초 지연 완료) 시, 반려된 계약이 UNDER_REVIEW(검토중)로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 계약서를 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 계약 정보 수정 (Error 8)</h3>
        {target ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>계약서 명칭:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="form-group">
              <label>계약 만료일 (부분 저장 미반영):</label>
              <input type="date" value={expireDate} onChange={(e) => setExpireDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>상대 거래처명:</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(target.id, title, expireDate, clientName)}>
              계약 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 계약명/만료일/거래처명 동시 수정 시 만료일만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 계약서를 선택하세요.</div>}
      </div>
    </aside>
  );
}
