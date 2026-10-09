import React from 'react';
import {
  LayoutDashboard,
  Flag,
  ListTodo,
  Kanban,
  Zap,
  Users,
  Layers,
  ChevronDown,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function Sidebar({
  projects,
  currentProjectId,
  onSelectProject,
  currentTab,
  onSelectTab,
  onReset,
  resetLoading
}) {
  const currentProject = projects.find(p => p.id === currentProjectId) || projects[0];

  const navItems = [
    { id: 'overview', label: '프로젝트 개요', icon: LayoutDashboard },
    { id: 'milestones', label: '마일스톤', icon: Flag },
    { id: 'issues', label: '이슈 트래커', icon: ListTodo },
    { id: 'board', label: '칸반 보드', icon: Kanban },
    { id: 'sprints', label: '스프린트 관리', icon: Zap },
    { id: 'members', label: '멤버 관리', icon: Users }
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--accent-cyan), #0284c7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: '800',
          fontSize: '1.1rem',
          boxShadow: 'var(--shadow-glow)'
        }}>
          WG
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              WorkGrid
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: '700',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--accent-cyan)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid rgba(6, 182, 212, 0.3)'
            }}>
              C-10
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            Enterprise Project System
          </div>
        </div>
      </div>

      {/* Project Switcher */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
          Active Workspace
        </div>
        <div style={{ position: 'relative' }}>
          <select
            value={currentProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            style={{
              width: '100%',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 12px',
              fontSize: '0.88rem',
              fontWeight: '700',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none'
            }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                {p.key} • {p.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* Nav Menu */}
      <nav style={{ padding: '16px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(2, 132, 199, 0.1))' : 'transparent',
                border: isActive ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid transparent',
                textAlign: 'left'
              }}
            >
              <Icon size={18} color={isActive ? 'var(--accent-cyan)' : 'var(--text-muted)'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer Reset & Status */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button
          onClick={onReset}
          disabled={resetLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '10px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '0.82rem',
            fontWeight: '600'
          }}
          title="엔터프라이즈 Seed 상태로 초기화"
        >
          <RefreshCw size={14} className={resetLoading ? 'animate-spin' : ''} />
          <span>{resetLoading ? '초기화 중...' : '시스템 초기화 (Reset)'}</span>
        </button>
      </div>
    </aside>
  );
}
