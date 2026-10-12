'use client';
import React from 'react';
import { CheckCircle2, Clock, User, Calendar } from 'lucide-react';

export default function TaskCard({ task, onOpenDetail, onToggleComplete }) {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'URGENT': return 'priority-urgent';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const isCompleted = task.status === 'DONE';

  return (
    <div
      className="task-card"
      onClick={() => onOpenDetail(task)}
      data-task-id={task.id}
      data-task-key={task.task_key}
      data-task-status={task.status}
    >
      <div className="task-card-header">
        <span className="task-key">{task.task_key}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={`badge-priority ${getPriorityClass(task.priority)}`}>
            {task.priority}
          </span>
          {/* 완료 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task);
            }}
            style={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: isCompleted ? '#10b981' : '#cbd5e1',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
            title={isCompleted ? '완료 취소' : '업무 완료 처리'}
          >
            <CheckCircle2 size={16} />
          </button>
        </div>
      </div>

      <div className="task-card-title" style={{ textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? '#94a3b8' : 'var(--text-main)' }}>
        {task.title}
      </div>

      <div className="task-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <User size={12} />
          <span>{task.assignee_name || '미지정'}</span>
        </div>

        {task.due_date && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <Calendar size={11} />
            <span>{task.due_date}</span>
          </div>
        )}
      </div>
    </div>
  );
}
