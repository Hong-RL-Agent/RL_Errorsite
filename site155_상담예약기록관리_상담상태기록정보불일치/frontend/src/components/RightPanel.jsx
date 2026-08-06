import React, { useState, useEffect } from 'react';

export default function RightPanel({ selectedCounsel, setSelectedCounsel, counsels, clients, triggerStatusNoteRace, triggerCancelFollowupConflict, triggerPartialSave }) {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState('직장 스트레스 및 자아 존중감 향상');
  const [noteText, setNoteText] = useState('자아존중감 척도 측정 완료, 긍정적 자기대화 연습 부여');

  const target = selectedCounsel || counsels[0];
  const targetClient = clients.find(c => c.clientName === target?.clientName) || clients[0];

  useEffect(() => {
    if (target) {
      setNoteText(target.noteText || '자아존중감 척도 측정 완료, 긍정적 자기대화 연습 부여');
    }
    if (targetClient) {
      setClientName(targetClient.clientName || '');
      setPhone(targetClient.phone || '');
      setTopic(targetClient.topic || '직장 스트레스 및 자아 존중감 향상');
    }
  }, [target, targetClient]);

  return (
    <aside className="panel-section operations-sidebar">
      <div className="detail-widget">
        <h3>🗣️ 상담 상태 & 비밀 기록 관제</h3>
        {target ? (
          <div className="detail-panel">
            <p>상담 코드: <strong style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{target.counselCode}</strong></p>
            <p>담당 상담사: <strong>{target.counselorName}</strong></p>
            <p>내담자 성명: <strong>{target.clientName}</strong>님</p>
            <p>상담 주제: <small>{target.topic}</small></p>
            <p>상담 일시: <small>{target.counselDate}</small> | 회당 상담료: <strong style={{ color: 'var(--color-success)' }}>{target.feeWon.toLocaleString()}원</strong></p>
            <p>비공개 상담 기록: <strong style={{ color: 'var(--color-warning)' }}>{target.noteText}</strong></p>
            <p>상담 진행 상태: <span className={`status-badge ${target.status.toLowerCase()}`}>{target.status}</span></p>

            <div className="form-group">
              <label>비공개 상담 기록 수정 (0.1초 완료):</label>
              <textarea rows="3" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            </div>

            <div className="form-group">
              <label>상담 진행 상태 변경 (Error 1 - 3초 지연):</label>
              <select value={target.status || 'COMPLETED'} onChange={(e) => setSelectedCounsel({ ...target, status: e.target.value })}>
                <option value="SCHEDULED">예약완료 (SCHEDULED)</option>
                <option value="IN_COUNSEL">상담중 (IN_COUNSEL)</option>
                <option value="FOLLOWUP">후속예정 (FOLLOWUP)</option>
                <option value="COMPLETED">상담완료 (COMPLETED)</option>
                <option value="CANCELLED">예약취소 (CANCELLED)</option>
              </select>
            </div>

            <button className="save-btn" onClick={() => triggerStatusNoteRace(target.id, target, noteText)}>
              상담완료 변경 + 즉시 상담 기록 수정 (Error 1)
            </button>
            <small className="warn-desc">* 상담완료 변경(3초 지연) 직후 상담 기록 수정(0.1초 완료) 시, 3초 뒤 상태 변경이 구 DB 스냅샷으로 상담 기록을 롤백시킴 (Error 1)</small>

            <div style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerCancelFollowupConflict(target.id)}>
                ⚡ 상담 취소 후 후속 일정 등록 연쇄 실행 (Error 2)
              </button>
              <small className="warn-desc">* 상담 취소(0.5초 완료) 직후 후속 일정 등록(4초 지연 완료) 시, 취소된 상담이 FOLLOWUP(후속예정)으로 복원됨 (Error 2)</small>
            </div>
          </div>
        ) : <div className="empty-lbl-dark">관제할 상담을 선택하세요.</div>}
      </div>

      <div className="detail-widget">
        <h3>✏️ 내담자 인적사항 수정 (Error 8)</h3>
        {targetClient ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>내담자 성명:</label>
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>상담 주 관심사 / 주제:</label>
              <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div className="form-group">
              <label>연락처 (부분 저장 미반영):</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <button className="save-btn" onClick={() => triggerPartialSave(targetClient.id, clientName, phone, topic)}>
              내담자 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 이름/상담주제/연락처 동시 수정 시 연락처만 빠지고 부분 저장, UI는 성공 표시 (Error 8)</small>
          </div>
        ) : <div className="empty-lbl-dark">수정할 내담자를 선택하세요.</div>}
      </div>
    </aside>
  );
}
