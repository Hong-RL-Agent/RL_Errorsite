'use client';
import React from 'react';
import { Layers, Plus, Users, Hash } from 'lucide-react';

export default function Sidebar({
  projects,
  currentProjectId,
  onSelectProject,
  onOpenNewProject,
  members
}) {
  return (
    <aside className="orbit-sidebar">
      <div className="sidebar-brand">
        <div className="brand-badge">
          <div className="brand-icon">TO</div>
          <div>
            <div className="brand-title">TeamOrbit</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Workspace Hub</div>
          </div>
        </div>
      </div>

      <div className="sidebar-scroll">
        {/* 프로젝트 목록 */}
        <div style={{ marginBottom: '24px' }}>
          <div className="section-label">
            <span>프로젝트 ({projects.length})</span>
            <button
              onClick={onOpenNewProject}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)' }}
              title="새 프로젝트 추가"
            >
              <Plus size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {projects.map(p => {
              const isActive = p.id === currentProjectId;
              return (
                <button
                  key={p.id}
                  className={`project-item ${isActive ? 'active' : ''}`}
                  onClick={() => onSelectProject(p.id)}
                  data-project-id={p.id}
                >
                  <div
                    className="project-dot"
                    style={{ backgroundColor: p.color || '#7c3aed' }}
                  />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {p.name}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {p.key}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 팀 멤버 목록 */}
        <div>
          <div className="section-label">
            <span>참여 팀원 ({members.length}명)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '240px', overflowY: 'auto' }}>
            {members.slice(0, 10).map(m => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}
              >
                <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                  {m.avatar}
                </div>
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: '600', color: '#1e293b' }}>{m.name}</span>
                  <span style={{ color: '#94a3b8', marginLeft: '4px', fontSize: '11px' }}>{m.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
