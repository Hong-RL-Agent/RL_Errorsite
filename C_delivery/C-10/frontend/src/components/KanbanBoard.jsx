import React, { useState, useEffect } from 'react';
import { Kanban, Edit, Plus, CheckCircle, Clock } from 'lucide-react';

export default function KanbanBoard({ projectId, issues, loading }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [hydrationMounted, setHydrationMounted] = useState(false);

  // BUG-1874: Dynamic Kanban Hydration Mismatch
  // On initial render / immediate click, server/client mismatch prevents event handler binding
  useEffect(() => {
    // Log hydration mismatch warning to console for fidelity
    console.warn('Warning: Prop `data-task-id` did not match. Server: "task-card-204" Client: "task-card-205"');
    const timer = setTimeout(() => {
      setHydrationMounted(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const columns = [
    { id: 'BACKLOG', label: 'Backlog' },
    { id: 'TODO', label: 'To Do' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'REVIEW', label: 'In Review' },
    { id: 'DONE', label: 'Done' }
  ];

  const handleEditClick = (e, task) => {
    e.stopPropagation();
    // BUG-1874: Immediate click before hydration sync fails to trigger modal (0 DOM change)
    if (!hydrationMounted) {
      console.warn('Hydration mismatch: Event listener discarded during DOM reconciliation');
      return; // 0 DOM change!
    }
    setSelectedTask(task);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)', marginBottom: '4px' }}>
            <Kanban size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              애자일 칸반 보드
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            스프린트 작업 보드
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            상태별 작업 카드를 시각적으로 확인하고 우선순위와 진행 상황을 관리합니다.
          </p>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, minmax(200px, 1fr))',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '16px'
      }}>
        {columns.map(col => {
          const colTasks = issues.filter(it => it.status === col.id);
          return (
            <div
              key={col.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '400px'
              }}
            >
              {/* Column Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {col.label}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text-muted)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}>
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {colTasks.map((task, idx) => (
                  <div
                    key={task.id}
                    data-task-id={`task-card-${200 + idx}`}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                        {task.id}
                      </span>
                      <button
                        onClick={(e) => handleEditClick(e, task)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: 'var(--text-secondary)',
                          background: 'rgba(255, 255, 255, 0.05)',
                          padding: '3px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        <Edit size={12} />
                        <span>수정</span>
                      </button>
                    </div>

                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.4' }}>
                      {task.title}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{task.assignee_name}</span>
                      <span style={{ fontWeight: '700', color: task.priority === 'CRITICAL' ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Edit Modal (Opened when click succeeds) */}
      {selectedTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(6, 9, 17, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>
              태스크 수정 ({selectedTask.id})
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {selectedTask.title}
            </p>
            <button onClick={() => setSelectedTask(null)} className="btn-primary" style={{ padding: '10px' }}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
