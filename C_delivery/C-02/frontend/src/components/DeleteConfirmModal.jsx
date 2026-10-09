import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, task, onConfirmDelete }) {
  if (!isOpen || !task) return null;

  const handleConfirm = () => {
    onConfirmDelete(task.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={18} color="#ef4444" />
            <span className="modal-title">Delete Task</span>
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
              <p style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '6px' }}>
                Are you sure you want to delete "{task.title}"?
              </p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>
                This task will be removed from your active workspace view.
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
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}
