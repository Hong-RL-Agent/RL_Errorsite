import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteModal({ isOpen, onClose, item, onDelete }) {
  if (!isOpen || !item) return null;

  const handleConfirm = () => {
    onDelete(item.id, item.type || 'file');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={18} color="#ef4444" />
            <span className="modal-title">Delete {item.type === 'folder' ? 'Folder' : 'File'}</span>
          </div>
          <button className="action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '10px',
                borderRadius: '50%',
                color: '#ef4444'
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <div>
              <p style={{ fontSize: '0.92rem', fontWeight: 500, marginBottom: '6px' }}>
                Are you sure you want to delete "{item.name}"?
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
                This action cannot be undone and will permanently remove this item from your storage.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            style={{ background: '#dc2626', borderColor: '#ef4444' }}
            onClick={handleConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
