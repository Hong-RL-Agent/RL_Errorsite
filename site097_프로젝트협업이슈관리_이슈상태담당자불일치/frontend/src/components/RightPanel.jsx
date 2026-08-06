import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedIssue,
  setSelectedIssue,
  teamMembers,
  triggerStatusAssigneeRace,
  triggerDeleteCommentConflict,
  triggerPartialIssueSave
}) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('HIGH');

  useEffect(() => {
    if (selectedIssue) {
      setTitle(selectedIssue.title || '');
      setDueDate(selectedIssue.dueDate || '');
      setPriority(selectedIssue.priority || 'HIGH');
    }
  }, [selectedIssue]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Status & Assignee Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>⚡ 이슈 상태 & 담당자 관제</h3>
        {selectedIssue ? (
          <div className="detail-panel">
            <p>이슈 코드: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedIssue.id}</strong></p>
            <p>제목: <strong>{selectedIssue.title}</strong></p>
            <p>현재 담당자: <strong>{selectedIssue.assigneeName}</strong></p>

            <div className="form-group">
              <label>상태 변경 (Error 1):</label>
              <select 
                value={selectedIssue.status || 'TODO'} 
                onChange={(e) => setSelectedIssue({ ...selectedIssue, status: e.target.value })}
              >
                <option value="TODO">할 일 (TODO)</option>
                <option value="IN_PROGRESS">진행 중 (IN_PROGRESS)</option>
                <option value="REVIEW">리뷰 중 (REVIEW)</option>
                <option value="DONE">완료 (DONE)</option>
                <option value="HOLD">보류 (HOLD)</option>
              </select>
            </div>

            <div className="form-group">
              <label>담당자 변경:</label>
              <select 
                value={selectedIssue.assigneeId || 'MEM-3001'} 
                onChange={(e) => {
                  const memObj = teamMembers.find(m => m.id === e.target.value);
                  setSelectedIssue({ 
                    ...selectedIssue, 
                    assigneeId: e.target.value,
                    assigneeName: memObj?.name || selectedIssue.assigneeName
                  });
                }}
              >
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                ))}
              </select>
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerStatusAssigneeRace(selectedIssue)}>
                상태 변경 후 즉시 담당자 변경 (Error 1)
              </button>
              <small className="warn-desc">* 상태 변경(3초 지연) 직후 담당자 변경(0.1초 완료) 시, 3초 뒤 이전 담당자 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerDeleteCommentConflict(selectedIssue)}>
                ⚡ 이슈 삭제 후 댓글 작성 연쇄 호출 (Error 2)
              </button>
              <small className="warn-desc">* 이슈 삭제(0.5초 완료) 직후 댓글 작성(4초 지연 완료) 시, 늦은 댓글 요청이 삭제된 이슈를 IN_PROGRESS 상태로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 이슈 항목을 선택하세요.</div>
        )}
      </div>

      {/* Issue Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>📝 이슈 상세 정보 수정 (Error 8)</h3>
        {selectedIssue ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>이슈 제목:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="form-group">
              <label>마감일 (부분저장 미반영):</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>

            <div className="form-group">
              <label>우선순위:</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="CRITICAL">CRITICAL (긴급)</option>
                <option value="HIGH">HIGH (높음)</option>
                <option value="MEDIUM">MEDIUM (보통)</option>
                <option value="LOW">LOW (낮음)</option>
              </select>
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialIssueSave(selectedIssue.id, title, dueDate, priority)}
            >
              이슈 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 제목/마감일/우선순위를 동시에 수정하면 백엔드에는 마감일만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 이슈를 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
