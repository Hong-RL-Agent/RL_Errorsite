import React from 'react';
import { LayoutDashboard, Users, Flag, ListTodo, Zap, CheckCircle2, TrendingUp } from 'lucide-react';

export default function ProjectOverview({ project, milestones, issues, sprints, members, onSelectTab }) {
  const completedIssues = issues.filter(it => it.status === 'DONE').length;
  const inProgressIssues = issues.filter(it => it.status === 'IN_PROGRESS').length;
  const completionRate = issues.length > 0 ? Math.round((completedIssues / issues.length) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Project Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(21, 32, 55, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                fontSize: '0.75rem',
                fontWeight: '800',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(6, 182, 212, 0.3)'
              }}>
                {project.key}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {project.category}
              </span>
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {project.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '6px', maxWidth: '680px' }}>
              {project.description}
            </p>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            <div>Project Lead: <strong style={{ color: 'var(--text-main)' }}>{project.lead}</strong></div>
            <div style={{ marginTop: '2px' }}>Created: <span style={{ color: 'var(--text-muted)' }}>{project.created_at}</span></div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div
          onClick={() => onSelectTab('issues')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>전체 이슈</span>
            <ListTodo size={18} color="var(--accent-cyan)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px' }}>
            {issues.length}개
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', marginTop: '4px' }}>
            완료: {completedIssues}개 ({completionRate}%)
          </div>
        </div>

        <div
          onClick={() => onSelectTab('milestones')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>활성 마일스톤</span>
            <Flag size={18} color="var(--accent-sky)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px' }}>
            {milestones.length}개
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            주요 릴리즈 로드맵
          </div>
        </div>

        <div
          onClick={() => onSelectTab('sprints')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>진행 중 스프린트</span>
            <Zap size={18} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px' }}>
            {sprints.length}개
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            2주 단위 이터레이션
          </div>
        </div>

        <div
          onClick={() => onSelectTab('members')}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-cyan)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span>팀 멤버</span>
            <Users size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px' }}>
            {members.length}명
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            엔터프라이즈 참여자
          </div>
        </div>
      </div>
    </div>
  );
}
