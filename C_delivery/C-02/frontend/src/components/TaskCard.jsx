import React from 'react';
import { Edit2, Trash2, ArrowRight, User } from 'lucide-react';

export default function TaskCard({
  task,
  onOpenDetail,
  onEditTask,
  onDeleteTask,
  onMoveStatus
}) {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <article
      className="task-card"
      draggable
      onDragStart={handleDragStart}
      onClick={() => onOpenDetail(task)}
      data-task-id={task.id}
    >
      <div className="task-card-header">
        <span className={`badge-priority ${task.priority}`}>
          {task.priority}
        </span>
        <div className="item-actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="action-btn"
            title="Edit Task"
            onClick={() => onEditTask(task)}
          >
            <Edit2 size={13} />
          </button>
          <button
            className="action-btn delete"
            title="Delete Task"
            onClick={() => onDeleteTask(task)}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <h3 className="task-card-title">{task.title}</h3>

      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="task-assignee">
          {task.assignee ? (
            <>
              <div
                className="avatar"
                style={{
                  width: '24px',
                  height: '24px',
                  fontSize: '0.7rem',
                  background: task.assignee.avatarColor || '#4f46e5'
                }}
              >
                {getInitials(task.assignee.name)}
              </div>
              <span>{task.assignee.name}</span>
            </>
          ) : (
            <>
              <div
                className="avatar"
                style={{
                  width: '24px',
                  height: '24px',
                  fontSize: '0.7rem',
                  background: '#475569'
                }}
              >
                <User size={12} />
              </div>
              <span style={{ color: 'var(--text-subtle)' }}>미지정</span>
            </>
          )}
        </div>

        {/* Quick Transition Buttons on Card */}
        <div className="move-btn-group" onClick={(e) => e.stopPropagation()}>
          {task.status === 'TODO' && (
            <>
              <button
                className="move-mini-btn"
                title="Move to IN PROGRESS"
                onClick={() => onMoveStatus(task.id, 'IN_PROGRESS')}
              >
                → In Prog
              </button>
              {/* BUG-424: Direct TODO -> DONE transition */}
              <button
                className="move-mini-btn"
                title="Move to DONE directly"
                onClick={() => onMoveStatus(task.id, 'DONE')}
              >
                → Done
              </button>
            </>
          )}

          {task.status === 'IN_PROGRESS' && (
            <>
              <button
                className="move-mini-btn"
                title="Move to TODO"
                onClick={() => onMoveStatus(task.id, 'TODO')}
              >
                ← Todo
              </button>
              <button
                className="move-mini-btn"
                title="Move to DONE"
                onClick={() => onMoveStatus(task.id, 'DONE')}
              >
                → Done
              </button>
            </>
          )}

          {task.status === 'DONE' && (
            <button
              className="move-mini-btn"
              title="Re-open to IN PROGRESS"
              onClick={() => onMoveStatus(task.id, 'IN_PROGRESS')}
            >
              ← In Prog
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
