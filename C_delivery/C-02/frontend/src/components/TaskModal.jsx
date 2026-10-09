import React from 'react';
import { X, Calendar, User, Clock, CheckCircle } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, task, onEdit, onDelete }) {
  if (!isOpen || !task) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`badge-status ${task.status}`}>
              {task.status.replace('_', ' ')}
            </span>
            <span className={`badge-priority ${task.priority}`}>
              {task.priority}
            </span>
          </div>
          <button className="action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px' }}>
            {task.title}
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
            {task.description || 'No detailed description provided.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={15} /> Assignee
              </span>
              <span style={{ fontWeight: 500, color: task.assignee ? 'var(--text-main)' : 'var(--text-subtle)' }}>
                {task.assignee ? `${task.assignee.name} (${task.assignee.role})` : '미지정 (Unassigned)'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} /> Created At
              </span>
              <span style={{ fontWeight: 500 }}>
                {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} /> Last Updated
              </span>
              <span style={{ fontWeight: 500 }}>
                {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              onClose();
              onDelete(task);
            }}
            style={{ color: '#ef4444' }}
          >
            Delete
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              onClose();
              onEdit(task);
            }}
          >
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
}
