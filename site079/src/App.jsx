import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Send, 
  History, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Trash2,
  ChevronRight,
  MoreVertical,
  Activity,
  Play,
  Bell,
  Settings,
  Mail
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from 'recharts';

const API_BASE = 'http://localhost:9188/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [jobs, setJobs] = useState([]);
  const [queue, setQueue] = useState([]);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [newJobTime, setNewJobTime] = useState('');
  const [bugToasts, setBugToasts] = useState([]);

  const addBugToast = (id, message) => {
    const toast = { id: Date.now(), bugId: id, message };
    setBugToasts(prev => [...prev, toast]);
    setTimeout(() => {
      setBugToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 5000);
  };

  const fetchData = async (tab = activeTab) => {
    setLoading(true);
    try {
      if (tab === 'dashboard') {
        const [sumRes, logRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/summary`).then(r => r.json()),
          fetch(`${API_BASE}/logs`).then(r => r.json())
        ]);
        setSummary(sumRes);
        setLogs(logRes.data);
      } else if (tab === 'jobs') {
        const res = await fetch(`${API_BASE}/jobs`);
        const data = await res.json();
        setJobs(data.data);
      } else if (tab === 'queue') {
        const qRes = await fetch(`${API_BASE}/jobs/queue`);
        const qData = await qRes.json();
        setQueue(qData.queue);
        if (qData.bugId) addBugToast(qData.bugId, "알림 발송 순서 정합성 오류: 우선순위 역전 현상이 감지되었습니다.");
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleCreateJob = async (triggerBug = false) => {
    if (!newJobName || !newJobTime) return;
    try {
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newJobName, time: newJobTime, triggerBug })
      });
      const data = await res.json();
      if (data.bugId) {
        addBugToast(data.bugId, `스케줄 오프셋 충돌: 타임존 설정 불일치로 발송 시간이 ${new Date(data.time).toLocaleString()}로 조정되었습니다.`);
      }
      setShowModal(false);
      fetchData('jobs');
    } catch (e) { console.error(e); }
  };

  const runJobTest = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/jobs/run?id=${id}`);
      const data = await res.json();
      if (data.bugId) {
        addBugToast(data.bugId, "중복 발송 경고: 동일한 알림 요청이 2회 처리되었습니다. (멱등성 위반)");
      }
      fetchData('dashboard');
    } catch (e) { console.error(e); }
  };

  const auditJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs?trigger=bug`);
      const data = await res.json();
      setJobs(data.data);
      if (data.bugId) {
        addBugToast(data.bugId, "서버 동기화 실패: 메모리 버퍼 최신화 과정에서 일부 예약 데이터가 유실되었습니다.");
      }
    } catch (e) { console.error(e); }
  };

  const chartData = [
    { name: '08:00', v: 10 }, { name: '10:00', v: 25 }, { name: '12:00', v: 40 },
    { name: '14:00', v: 35 }, { name: '16:00', v: 50 }, { name: '18:00', v: 45 }, { name: '20:00', v: 20 },
  ];

  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="logo">
          <Bell size={24} style={{ color: 'var(--accent)' }} />
          <span>NotifyHub</span>
        </div>

        <div className="nav-menu" style={{ flex: 1 }}>
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} /> 대시보드
          </div>
          <div className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>
            <Calendar size={20} /> 알림 예약 목록
          </div>
          <div className={`nav-item ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
            <Send size={20} /> 발송 대기 현황
          </div>
          <div className={`nav-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <History size={20} /> 전송 완료 로그
          </div>
        </div>

        <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <div className="nav-item" onClick={() => alert("Settings")}>
            <Settings size={20} /> 시스템 설정
          </div>
        </div>
      </nav>

      <main className="main-content">
        <header className="header-row">
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              {activeTab === 'queue' ? '발송 대기 현황' : activeTab.toUpperCase()}
            </h1>
            <p style={{ color: 'var(--text-muted)' }}>스마트 알림 발송 엔진 및 예약 관리</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} /> 새 알림 예약
          </button>
        </header>

        {activeTab === 'dashboard' && (
          <div className="view-dashboard">
            <div className="card-grid">
              <div className="stat-card">
                <div className="stat-val">{summary?.totalJobs || 0}</div>
                <div className="stat-label">총 예약 건수</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{ color: 'var(--primary)' }}>{summary?.pending || 0}</div>
                <div className="stat-label">발송 대기 중</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{ color: 'var(--success)' }}>{summary?.completed || 0}</div>
                <div className="stat-label">전송 완료</div>
              </div>
              <div className="stat-card">
                <div className="stat-val" style={{ color: 'var(--accent)' }}>{summary?.uptime}</div>
                <div className="stat-label">엔진 가동 시간</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
              <div className="stat-card" style={{ height: '350px' }}>
                <h3 style={{ marginBottom: '20px' }}>시간대별 발송량</h3>
                <ResponsiveContainer width="100%" height="85%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <ChartTooltip />
                    <Area type="monotone" dataKey="v" stroke="#2563eb" fillOpacity={1} fill="url(#colorV)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="data-table-wrap">
                <div className="table-header">
                  <h3>최근 전송 결과</h3>
                  <RefreshCw size={16} className={loading ? 'spin' : ''} onClick={() => fetchData()} />
                </div>
                {logs.map(log => (
                  <div key={log.id} className="log-item">
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>[SUCCESS]</span> {log.name} 
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(log.executedAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="view-jobs">
            <div className="data-table-wrap">
              <div className="table-header">
                <h3>알림 예약 리스트</h3>
                <button className="btn-ghost" style={{ fontSize: '0.8rem', gap: '6px', display: 'flex', alignItems: 'center' }} onClick={auditJobs} data-bug-id="site079-bug03">
                  <RefreshCw size={14} /> 서버 연결상태 확인 및 갱신
                </button>
              </div>
              <div className="table-row" style={{ fontWeight: 700, background: '#f8fafc' }}>
                <div>알림명</div>
                <div>발송 예정 시간</div>
                <div>채널</div>
                <div>상태</div>
              </div>
              {jobs.map(job => (
                <div key={job.id} className="table-row">
                  <div>{job.name}</div>
                  <div>{new Date(job.time).toLocaleString()}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{job.type === 'user' ? 'App Push' : 'SMS'}</div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className={`badge badge-${job.status}`}>{job.status}</span>
                    <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => runJobTest(job.id)} data-bug-id="site079-bug02">
                      <Play size={12} /> 즉시 발송 테스트
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'queue' && (
          <div className="view-queue">
            <div className="data-table-wrap">
              <div className="table-header">
                <h3>실시간 발송 대기열</h3>
                <button className="btn-ghost" style={{ fontSize: '0.8rem', gap: '6px', display: 'flex', alignItems: 'center' }} onClick={() => fetchData('queue')} data-bug-id="site079-bug04">
                  <RefreshCw size={14} /> 긴급 발송 순서 최적화
                </button>
              </div>
              <div className="table-row" style={{ fontWeight: 700, background: '#f8fafc' }}>
                <div>순번</div>
                <div>알림명</div>
                <div>예정 시간</div>
                <div>우선순위</div>
              </div>
              {queue.map((item, idx) => (
                <div key={item.id} className="table-row" style={idx === 0 && queue.length > 1 && new Date(item.time) > new Date(queue[1].time) ? { borderLeft: '4px solid var(--danger)' } : {}}>
                  <div>#{idx + 1}</div>
                  <div>{item.name}</div>
                  <div>{new Date(item.time).toLocaleTimeString()}</div>
                  <div style={{ color: 'var(--accent)', fontWeight: 600 }}>우선순위 높음</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2 style={{ marginBottom: '24px' }}>새 알림 예약</h2>
            <div className="form-group">
              <label>알림 명칭</label>
              <input type="text" className="form-input" value={newJobName} onChange={e => setNewJobName(e.target.value)} placeholder="예: 팀 주간 회의 알림" />
            </div>
            <div className="form-group">
              <label>발송 예약 시간</label>
              <input type="datetime-local" className="form-input" value={newJobTime} onChange={e => setNewJobTime(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleCreateJob(false)}>일반 예약</button>
              <button className="btn-primary" style={{ flex: 1, background: 'var(--accent)' }} onClick={() => handleCreateJob(true)} data-bug-id="site079-bug01">
                AI 추천 시간 예약
              </button>
              <button className="btn-ghost" onClick={() => setShowModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}

      <div className="toast-container">
        {bugToasts.map(toast => (
          <div key={toast.id} className="toast" data-bug-id={toast.bugId}>
            <AlertCircle size={20} color="#f97316" />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>엔진 로그: {toast.bugId}</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
