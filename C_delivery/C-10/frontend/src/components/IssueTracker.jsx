import React, { useState } from 'react';
import { ListTodo, Filter, User, Tag, Clock, CheckCircle2, X, ExternalLink } from 'lucide-react';

export default function IssueTracker({ projectId, issues, onFetchIssues, loading }) {
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' or 'me'
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Filter issues locally
  const displayedIssues = activeFilter === 'me'
    ? issues.filter(it => it.assignee_email === 'me@workgrid.io')
    : issues;

  // Handle Modal Close (BUG 3: C-10-180 Filter Tag State Persistence Bug)
  // Closing the modal inadvertently resets activeFilter to 'all', expanding list back to 24!
  const handleCloseModal = () => {
    setSelectedIssue(null);
    // BUG-180: Resets filter state upon modal close!
    setActiveFilter('all');
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
            <ListTodo size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              이슈 트래커
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            프로젝트 이슈 및 작업 목록
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            할당된 티켓과 진행 상태를 실시간으로 필터링하고 상세 내용을 검토합니다.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--bg-card)',
          padding: '6px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '700',
              fontSize: '0.85rem',
              color: activeFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
              background: activeFilter === 'all' ? 'var(--accent-cyan)' : 'transparent'
            }}
          >
            전체 이슈 ({issues.length}개)
          </button>

          <button
            onClick={() => setActiveFilter('me')}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '700',
              fontSize: '0.85rem',
              color: activeFilter === 'me' ? '#ffffff' : 'var(--text-secondary)',
              background: activeFilter === 'me' ? 'var(--accent-cyan)' : 'transparent'
            }}
          >
            내 이슈 ({issues.filter(it => it.assignee_email === 'me@workgrid.io').length}개)
          </button>
        </div>
      </div>

      {/* Issues Table/Cards */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          이슈 목록을 불러오는 중입니다...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>현재 표시된 이슈: <strong style={{ color: 'var(--text-main)' }}>{displayedIssues.length}개</strong></span>
            <span>필터 상태: <strong style={{ color: activeFilter === 'me' ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>{activeFilter === 'me' ? '내 이슈 (Active)' : '전체 이슈'}</strong></span>
          </div>

          {displayedIssues.map(issue => (
            <div
              key={issue.id}
              data-issue={issue.id}
              onClick={() => setSelectedIssue(issue)}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  color: 'var(--accent-cyan)',
                  background: 'rgba(6, 182, 212, 0.1)',
                  padding: '3px 8px',
                  borderRadius: '4px'
                }}>
                  {issue.id}
                </span>

                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {issue.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '12px' }}>
                    <span>담당자: {issue.assignee_name}</span>
                    {issue.milestone_id && <span>마일스톤: {issue.milestone_id}</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge ${
                  issue.status === 'DONE' ? 'badge-done' :
                  issue.status === 'IN_PROGRESS' ? 'badge-progress' :
                  issue.status === 'REVIEW' ? 'badge-review' : 'badge-todo'
                }`}>
                  {issue.status}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: issue.priority === 'CRITICAL' ? 'var(--accent-rose)' :
                         issue.priority === 'HIGH' ? 'var(--accent-amber)' : 'var(--text-muted)'
                }}>
                  {issue.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Detail Modal */}
      {selectedIssue && (
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
            maxWidth: '560px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--accent-cyan)' }}>
                {selectedIssue.id}
              </span>
              <button
                onClick={handleCloseModal}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {selectedIssue.title}
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.6' }}>
                {selectedIssue.description}
              </p>
            </div>

            <div style={{
              background: 'var(--bg-card)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>상태: </span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedIssue.status}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>우선순위: </span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedIssue.priority}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>담당자: </span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedIssue.assignee_name}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>마일스톤: </span>
                <strong style={{ color: 'var(--text-main)' }}>{selectedIssue.milestone_id || '없음'}</strong>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              확인 및 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
