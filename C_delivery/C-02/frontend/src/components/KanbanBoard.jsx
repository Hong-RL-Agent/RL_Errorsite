import React, { useState } from 'react';
import TaskCard from './TaskCard';

export default function KanbanBoard({
  tasks,
  onOpenDetail,
  onEditTask,
  onDeleteTask,
  onMoveStatus
}) {
  const [dragOverCol, setDragOverCol] = useState(null);

  const columns = [
    { id: 'TODO', title: 'TODO', color: '#64748b' },
    { id: 'IN_PROGRESS', title: 'IN PROGRESS', color: '#3b82f6' },
    { id: 'DONE', title: 'DONE', color: '#10b981' }
  ];

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      // BUG-424: Direct drop from TODO -> DONE is sent to API
      onMoveStatus(Number(taskId), colId);
    }
  };

  return (
    <div className="kanban-board">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="kanban-column"
            style={{
              borderColor: dragOverCol === col.id ? 'var(--primary-500)' : 'var(--border-subtle)'
            }}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="column-header">
              <div className="column-title-group">
                <div className="column-dot" style={{ background: col.color }} />
                <span className="column-title">{col.title}</span>
              </div>
              <span className="column-count">{colTasks.length}</span>
            </div>

            <div className="column-body">
              {colTasks.length === 0 ? (
                <div
                  style={{
                    padding: '32px 16px',
                    textAlign: 'center',
                    color: 'var(--text-subtle)',
                    fontSize: '0.82rem'
                  }}
                >
                  No tasks in {col.title}
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onOpenDetail={onOpenDetail}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    onMoveStatus={onMoveStatus}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
