import React, { useState, useEffect } from 'react';
import { Building2, Users, FolderKanban, Plus, ExternalLink, ShieldCheck } from 'lucide-react';

export default function Workspace({ showToast, setCurrentPage }) {
  const [workspaces, setWorkspaces] = useState([]);

  useEffect(() => {
    fetch('/api/workspaces')
      .then(res => res.json())
      .then(data => setWorkspaces(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)' }}>워크스페이스 관리</h2>
          <p className="card-subtitle">참여 중인 팀 워크스페이스 목록과 조직별 프로젝트 현황입니다.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => showToast('안내', '새 워크스페이스 생성 권한이 부여되었습니다.', 'info')}>
          <Plus size={16} /> 새 워크스페이스
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '22px' }}>
        {workspaces.map(ws => (
          <div key={ws.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ background: '#eef2ff', padding: '10px', borderRadius: 'var(--radius-md)', color: '#4f46e5' }}>
                  <Building2 size={24} />
                </div>
                <span className="badge badge-completed">{ws.plan}</span>
              </div>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '6px' }}>
                {ws.name}
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--gray-500)', marginBottom: '16px' }}>
                도메인 슬러그: worknest.io/{ws.slug}
              </p>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.86rem', color: 'var(--navy-800)', borderTop: '1px solid var(--gray-100)', paddingTop: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} color="#64748b" /> 멤버 <strong>{ws.membersCount}명</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FolderKanban size={16} color="#64748b" /> 프로젝트 <strong>{ws.activeProjects}개</strong>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid var(--gray-100)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('projects')}>
                워크스페이스 전환 <ExternalLink size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
