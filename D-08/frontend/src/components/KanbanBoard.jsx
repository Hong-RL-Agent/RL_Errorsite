'use client';
import React from 'react';
import TaskCard from './TaskCard';

export default function KanbanBoard({ tasks, onOpenDetail, onToggleComplete }) {
  const columns = [
    { key: 'TODO', label: '할 일 (To Do)', color: '#64748b' },
    { key: 'IN_PROGRESS', label: '진행 중 (In Progress)', color: '#3b82f6' },
    { key: 'REVIEW', label: '검토 중 (In Review)', color: '#d97706' },
    { key: 'DONE', label: '완료됨 (Done)', color: '#10b981' }
  ];

  return (
    <div className="board-container">
      {columns.map(col => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div key={col.key} className="kanban-column" data-column-status={col.key}>
            <div className="column-header">
              <div className="column-title">
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: col.color }} />
                <span>{col.label}</span>
              </div>
              <span className="task-count">{colTasks.length}</span>
            </div>

            <div className="column-body">
              {colTasks.map(t => (
                <TaskCard
                  key={t.id}
                  task={t}
                  onOpenDetail={onOpenDetail}
                  onToggleComplete={onToggleComplete}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
