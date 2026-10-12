'use client';
import React from 'react';
import { Eye, CheckCircle2 } from 'lucide-react';

export default function TaskListView({ tasks, onOpenDetail, onToggleComplete }) {
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'URGENT': return 'priority-urgent';
      case 'HIGH': return 'priority-high';
      case 'MEDIUM': return 'priority-medium';
      case 'LOW': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'TODO': return <span style={{ padding: '3px 8px', borderRadius: 4, background: '#f1f5f9', color: '#475569', fontSize: 11, fontWeight: 700 }}>할 일</span>;
      case 'IN_PROGRESS': return <span style={{ padding: '3px 8px', borderRadius: 4, background: '#eff6ff', color: '#2563eb', fontSize: 11, fontWeight: 700 }}>진행 중</span>;
      case 'REVIEW': return <span style={{ padding: '3px 8px', borderRadius: 4, background: '#fffbeb', color: '#d97706', fontSize: 11, fontWeight: 700 }}>검토 중</span>;
      case 'DONE': return <span style={{ padding: '3px 8px', borderRadius: 4, background: '#ecfdf5', color: '#059669', fontSize: 11, fontWeight: 700 }}>완료</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="list-container">
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>업무 키</th>
              <th>제목</th>
              <th>상태</th>
              <th>우선순위</th>
              <th>담당자</th>
              <th>마감일</th>
              <th style={{ textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  등록된 업무가 없습니다.
                </td>
              </tr>
            ) : (
              tasks.map(t => (
                <tr key={t.id} data-task-id={t.id} data-task-key={t.task_key}>
                  <td style={{ fontWeight: '700', color: '#64748b' }}>{t.task_key}</td>
                  <td style={{ fontWeight: '600', color: '#0f172a' }}>{t.title}</td>
                  <td>{getStatusBadge(t.status)}</td>
                  <td>
                    <span className={`badge-priority ${getPriorityClass(t.priority)}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>{t.assignee_name || '미지정'}</td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}>{t.due_date || '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onOpenDetail(t)}
                        title="상세 보기"
                      >
                        <Eye size={12} />
                        <span>상세</span>
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onToggleComplete(t)}
                        title={t.status === 'DONE' ? '완료 취소' : '완료 처리'}
                        style={{ color: t.status === 'DONE' ? '#10b981' : '#64748b' }}
                      >
                        <CheckCircle2 size={12} />
                        <span>{t.status === 'DONE' ? '완료됨' : '완료'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
