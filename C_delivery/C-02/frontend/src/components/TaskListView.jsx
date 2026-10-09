import React from 'react';
import { Check, Edit2, Trash2, User } from 'lucide-react';

export default function TaskListView({
  tasks,
  onOpenDetail,
  onEditTask,
  onDeleteTask,
  onToggleComplete
}) {
  const getInitials = (name) => {
    if (!name) return '?';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="list-view-container">
      <div className="task-table-card">
        <table className="task-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>Done</th>
              <th>Task Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Assignee</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-subtle)' }}>
                  No tasks matching your current filters
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isCompleted = task.status === 'DONE' || task.isOptimisticDone;

                return (
                  <tr
                    key={task.id}
                    onClick={() => onOpenDetail(task)}
                    style={{ cursor: 'pointer' }}
                    data-task-id={task.id}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      {/* BUG-726: Checkbox click triggers optimistic check -> API 400 -> remains checked */}
                      <div
                        className={`checkbox-custom ${isCompleted ? 'checked' : ''}`}
                        onClick={() => onToggleComplete(task)}
                        title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {isCompleted && <Check size={13} strokeWidth={3} />}
                      </div>
                    </td>

                    <td>
                      <div className="task-title-cell">
                        <span
                          style={{
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            color: isCompleted ? 'var(--text-muted)' : 'var(--text-main)'
                          }}
                        >
                          {task.title}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`badge-status ${task.status}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td>
                      <span className={`badge-priority ${task.priority}`}>
                        {task.priority}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                    </td>

                    <td style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                      {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'Today'}
                    </td>

                    <td>
                      <div
                        className="item-actions"
                        style={{ justifyContent: 'flex-end' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="action-btn"
                          title="Edit Task"
                          onClick={() => onEditTask(task)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="action-btn delete"
                          title="Delete Task"
                          onClick={() => onDeleteTask(task)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
