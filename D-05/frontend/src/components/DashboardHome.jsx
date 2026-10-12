import React, { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { fetchStats, fetchRequests, fetchLogs } from '../lib/api';

export default function DashboardHome({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const [statsRes, reqRes, logsRes] = await Promise.all([
        fetchStats(),
        fetchRequests({ limit: 5 }),
        fetchLogs({ limit: 5 })
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (reqRes.success) setRecentRequests(reqRes.data.slice(0, 5));
      if (logsRes.success) setRecentLogs(logsRes.data.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
        대시보드 운영 현황을 로딩 중입니다...
      </div>
    );
  }

  const maxDeptCount = Math.max(...(stats.deptDistribution.map(d => d.count) || [1]));

  return (
    <div>
      {/* KPI 카드 그리드 */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <p>전체 등록 임직원</p>
            <h3>{stats.totalUsers}명</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <UserCheck size={24} />
          </div>
          <div className="kpi-info">
            <p>활성 계정 (Active)</p>
            <h3>{stats.activeUsers}명</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon yellow">
            <Clock size={24} />
          </div>
          <div className="kpi-info">
            <p>대기 중 서비스 요청</p>
            <h3>{stats.pendingRequests}건</h3>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <ShieldCheck size={24} />
          </div>
          <div className="kpi-info">
            <p>누적 보안 감사 로그</p>
            <h3>{stats.totalLogs}건</h3>
          </div>
        </div>
      </div>

      {/* 부서별 인원 분포 그래프 & 서비스 요청 요약 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* 부서별 분포 차트 */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h2 className="card-title">부서별 인원 배정 통계</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {stats.deptDistribution.map(dept => {
                const percent = Math.round((dept.count / maxDeptCount) * 100);
                return (
                  <div key={dept.department}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '600', color: '#1e293b' }}>{dept.department}</span>
                      <span style={{ color: '#64748b' }}>{dept.count}명</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          width: `${percent}%`, 
                          height: '100%', 
                          background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                          borderRadius: '4px'
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 최근 승인 요청 */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h2 className="card-title">대기 및 최근 서비스 요청</h2>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('requests')}
            >
              <span>전체보기</span>
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="card-body" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentRequests.map(req => (
                <div 
                  key={req.req_id}
                  style={{
                    padding: '10px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '2px' }}>
                      [{req.req_id}] {req.title}
                    </div>
                    <div style={{ color: '#64748b' }}>
                      신청자: {req.requester} ({req.department}) · {req.created_at}
                    </div>
                  </div>
                  <span className={`badge ${req.status.toLowerCase()}`}>
                    {req.status === 'PENDING' ? '대기 중' : req.status === 'APPROVED' ? '승인' : '반려'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 최근 감사 로그 요약 */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">최근 보안 및 관리 활동 로그</h2>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => setActiveTab('logs')}
          >
            <span>로그 전체보기</span>
            <ArrowRight size={12} />
          </button>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>로그 ID</th>
                <th>관리자</th>
                <th>수행 액션</th>
                <th>대상자 / 대상</th>
                <th>접속 IP</th>
                <th>일시</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map(log => (
                <tr key={log.log_id}>
                  <td style={{ fontWeight: '600', color: '#475569' }}>{log.log_id}</td>
                  <td>{log.admin}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.target_name} ({log.target_id})</td>
                  <td style={{ color: '#64748b' }}>{log.ip_address}</td>
                  <td style={{ color: '#64748b' }}>{log.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
