import React, { useState } from 'react';

export default function DocEditModal({ doc, onClose, onConfirm }) {
  const [title, setTitle] = useState(doc?.title || '');
  const [urgency, setUrgency] = useState(doc?.urgency || 'MEDIUM');
  const [attachment, setAttachment] = useState(doc?.attachment || '');

  if (!doc) return null;

  const handleSave = () => {
    onConfirm(doc.id, title, urgency, attachment);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h3>📝 전자결재 문서 기본 정보 수정</h3>
        <p>문서 ID: <strong style={{ color: 'var(--color-primary)' }}>{doc.id}</strong> ({doc.title})</p>

        <div className="form-group">
          <label>문서 제목:</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div className="form-group">
          <label>중요도 / 긴급 여부:</label>
          <select value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="HIGH">HIGH (긴급)</option>
            <option value="MEDIUM">MEDIUM (보통)</option>
            <option value="LOW">LOW (일반)</option>
          </select>
        </div>

        <div className="form-group">
          <label>첨부파일명:</label>
          <input type="text" value={attachment} onChange={(e) => setAttachment(e.target.value)} />
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
