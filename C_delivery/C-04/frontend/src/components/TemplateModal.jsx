import React, { useEffect, useState } from 'react';
import { X, FileText, Check } from 'lucide-react';

export default function TemplateModal({
  isOpen,
  onClose,
  onSelectTemplate
}) {
  const [templates, setTemplates] = useState([]);
  const [lingeringBackdrop, setLingeringBackdrop] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/templates')
        .then(res => res.json())
        .then(data => {
          if (data.templates) setTemplates(data.templates);
        })
        .catch(err => console.error(err));
    }
  }, [isOpen]);

  // BUG-1856: Modal Freeze on Close
  // When closed, modal content unmounts, but backdrop overlay remains mounted in DOM!
  const handleBuggyClose = () => {
    setLingeringBackdrop(true);
    onClose();
  };

  const handleSelect = (content) => {
    onSelectTemplate(content);
    handleBuggyClose();
  };

  return (
    <>
      {/* Lingering backdrop overlay bug (C-04-1856) */}
      {(isOpen || lingeringBackdrop) && (
        <div 
          className="modal-backdrop-overlay" 
          onClick={handleBuggyClose}
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'auto',
            zIndex: 9999,
            backgroundColor: lingeringBackdrop ? 'rgba(0, 0, 0, 0.05)' : 'rgba(0, 0, 0, 0.7)'
          }}
        />
      )}

      {/* Modal Dialog Content */}
      {isOpen && (
        <div className="modal-dialog-box" style={{ zIndex: 10000 }}>
          <div className="modal-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color="var(--amber-primary)" />
              <h3>표준 답변 템플릿 선택</h3>
            </div>
            <button 
              onClick={handleBuggyClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          <div className="modal-body">
            {templates.map((tpl) => (
              <div 
                key={tpl.id} 
                className="template-card-item"
                onClick={() => handleSelect(tpl.content)}
              >
                <div className="template-card-title">
                  <span>{tpl.title}</span>
                  <span className="badge badge-category">{tpl.category}</span>
                </div>
                <div className="template-card-preview">
                  {tpl.content}
                </div>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-draft"
              onClick={handleBuggyClose}
            >
              취소 (Close)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
