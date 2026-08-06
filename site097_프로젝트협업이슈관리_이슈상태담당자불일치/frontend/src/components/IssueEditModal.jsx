import React, { useState } from 'react';

export default function IssueEditModal({ issue, onClose, onConfirm }) {
  const [title, setTitle] = useState(issue?.title || '');
  const [dueDate, setDueDate] = useState(issue?.dueDate || '');
  const [priority, setPriority] = useState(issue?.priority || 'HIGH');

  if (!issue) return null;

  const handleSave = () => {
    onConfirm(issue.id, title, dueDate, priority);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>📝 이슈 제목 및 마감일 수정</h3>
        <p>이슈 ID: <strong style={{ color: 'var(--color-primary)' }}>{issue.id}</strong></p>

        <div className="form-group">
          <label>이슈 제목:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="form-group">
          <label>마감일:</label>
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

        <div className="modal-foot">
          <button className="save-btn" style={{ backgroundColor: 'var(--color-border)', color: '#ffffff' }} onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            저장 확정
          </button>
        </div>
      </div>
    </div>
  );
}
