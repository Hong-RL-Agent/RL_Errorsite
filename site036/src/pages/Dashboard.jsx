import React, { useEffect, useState } from 'react';
import { 
  FolderKanban, 
  Users, 
  FileText, 
  CalendarDays, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  TrendingUp,
  Activity,
  ChevronRight
} from 'lucide-react';

export default function Dashboard({ setCurrentPage, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load dashboard:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>워크스페이스 데이터를 불러오는 중입니다...</div>;
  }

  const stats = data?.stats || {
    totalProjects: 4,
    activeProjects: 2,
    totalMembers: 4,
    totalFiles: 3,
    totalReservations: 3,
    cartCount: 1
  };

  return (
    <div>
      {/* Workspace Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 36px',
        color: '#ffffff',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px -5px rgba(67, 56, 202, 0.3)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 600, marginBottom: '12px' }}>
            <TrendingUp size={14} /> Team Productivity 98.4%
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>
            {data?.workspace?.name || 'Global Enterprise HQ'}
          </h2>
          <p style={{ color: '#c7d2fe', fontSize: '0.92rem', maxWidth: '600px' }}>
            프로젝트 관리, 자원 예약, 팀 협업 문서를 통합 관리하는 WorkNest 허브에 오신 것을 환영합니다.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={() => setCurrentPage('projects')}>
            프로젝트 둘러보기 <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#eef2ff', color: '#4f46e5' }}>
            <FolderKanban size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.totalProjects}</div>
            <div className="stat-label">전체 프로젝트 ({stats.activeProjects}개 진행 중)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <Users size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.totalMembers}</div>
            <div className="stat-label">워크스페이스 활성 멤버</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.totalFiles}</div>
            <div className="stat-label">공유 에셋 & 문서</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ backgroundColor: '#fdf2f8', color: '#db2777' }}>
            <CalendarDays size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.totalReservations}</div>
            <div className="stat-label">예약된 회의실 / 장원</div>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Projects */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title"><FolderKanban size={18} color="#4f46e5" /> 진행 중인 프로젝트</h3>
              <p className="card-subtitle">최근 업데이트된 프로젝트 현황</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('projects')}>
              전체 보기 <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data?.recentProjects?.map(project => (
              <div 
                key={project.id} 
                style={{
                  padding: '16px',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
                onClick={() => setCurrentPage('projects')}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--navy-900)' }}>{project.name}</span>
                    <span className={`badge badge-${project.status}`}>{project.status}</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--gray-500)' }}>
                    담당자: {project.owner} · 마감일: {project.dueDate}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--primary)', marginBottom: '4px' }}>
                    {project.progress}% 완료
                  </div>
                  <div style={{ width: '100px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${project.progress}%`, height: '100%', backgroundColor: 'var(--primary)', borderRadius: '999px' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title"><Activity size={18} color="#10b981" /> 최근 트랜잭션 활동</h3>
              <p className="card-subtitle">실시간 서비스 이벤트 기록</p>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => setCurrentPage('activity')}>
              기록 <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data?.recentActivities?.map((act, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '10px', borderBottom: '1px solid var(--gray-100)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4f46e5', marginTop: '6px' }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--navy-900)' }}>
                    {act.actionName || act.type}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--gray-500)', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span style={{ fontFamily: 'monospace', color: '#6366f1' }}>{act.transaction_id}</span>
                    <span>{new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
