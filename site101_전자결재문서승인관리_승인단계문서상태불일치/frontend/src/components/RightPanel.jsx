import React, { useState, useEffect } from 'react';

export default function RightPanel({
  selectedDoc,
  setSelectedDoc,
  employees,
  triggerLineStatusRace,
  triggerRejectCommentConflict,
  triggerPartialDocSave
}) {
  const [title, setTitle] = useState('');
  const [urgency, setUrgency] = useState('MEDIUM');
  const [attachment, setAttachment] = useState('');

  useEffect(() => {
    if (selectedDoc) {
      setTitle(selectedDoc.title || '');
      setUrgency(selectedDoc.urgency || 'MEDIUM');
      setAttachment(selectedDoc.attachment || '');
    }
  }, [selectedDoc]);

  return (
    <aside className="panel-section operations-sidebar">
      {/* Approval Line & Document Status Control Widget (Error 1 & 2 Targets) */}
      <div className="detail-widget">
        <h3>📄 결재선 지정 & 문서 승인/반려 관제</h3>
        {selectedDoc ? (
          <div className="detail-panel">
            <p>문서 번호: <strong style={{ fontSize: '1.1rem', color: 'var(--color-primary)' }}>{selectedDoc.id}</strong></p>
            <p>기안자: <strong>{selectedDoc.drafterName} ({selectedDoc.deptName})</strong></p>
            <p>현재 상태: <span className={`status-badge ${selectedDoc.status.toLowerCase()}`}>{selectedDoc.status}</span></p>

            <div className="form-group">
              <label>지정 결재자 변경 (Error 1):</label>
              <select 
                value={selectedDoc.approverName || '박바캉스 부장'} 
                onChange={(e) => setSelectedDoc({ ...selectedDoc, approverName: e.target.value })}
              >
                {employees.map(emp => (
                  <option key={emp.id} value={`${emp.name} ${emp.position}`}>{emp.name} ({emp.deptName} - {emp.position})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>문서 결재 요청 상태 변경 (0.1초 완료):</label>
              <button className="save-btn" style={{ marginTop: '0.35rem' }} onClick={() => triggerLineStatusRace(selectedDoc)}>
                결재선 변경 후 즉시 결재요청 (Error 1)
              </button>
              <small className="warn-desc">* 결재선 변경(3초 지연) 직후 결재요청(0.1초 완료) 시, 3초 뒤 이전 결재선 스냅샷으로 롤백 저장됨 (Error 1)</small>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <button className="cancel-work-btn" onClick={() => triggerRejectCommentConflict(selectedDoc)}>
                ⚡ 문서 반려 후 승인 의견 연쇄 제출 (Error 2)
              </button>
              <small className="warn-desc">* 문서 반려(0.5초 완료) 직후 승인 의견 작성(4초 지연 완료) 시, 늦은 의견 요청이 반려된 문서를 PENDING 승인대기로 복원시킴 (Error 2)</small>
            </div>
          </div>
        ) : (
          <div className="empty-lbl-dark">관제할 결재 문서 항목을 선택하세요.</div>
        )}
      </div>

      {/* Doc Info Partial Edit Widget (Error 8 Target) */}
      <div className="detail-widget">
        <h3>📝 결재 문서 기본 정보 수정 (Error 8)</h3>
        {selectedDoc ? (
          <div className="detail-panel">
            <div className="form-group">
              <label>문서 제목:</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="form-group">
              <label>긴급 여부 / 중요도:</label>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                <option value="HIGH">HIGH (긴급)</option>
                <option value="MEDIUM">MEDIUM (보통)</option>
                <option value="LOW">LOW (일반)</option>
              </select>
            </div>

            <div className="form-group">
              <label>첨부파일명 (부분저장 미반영):</label>
              <input type="text" value={attachment} onChange={(e) => setAttachment(e.target.value)} />
            </div>

            <button 
              className="save-btn"
              onClick={() => triggerPartialDocSave(selectedDoc.id, title, urgency, attachment)}
            >
              문서 정보 저장 (Error 8)
            </button>
            <small className="warn-desc">* 제목/중요도/첨부파일명을 동시에 수정하면 백엔드에는 첨부파일명만 빼고 부분 저장되며, UI에는 성공 알림 표시됨 (Error 8)</small>
          </div>
        ) : (
          <div className="empty-lbl-dark">정보를 수정할 문서를 선택하세요.</div>
        )}
      </div>
    </aside>
  );
}
