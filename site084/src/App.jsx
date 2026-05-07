import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  PieChart, 
  History, 
  Plus, 
  Filter, 
  Calculator, 
  Layers, 
  TrendingUp, 
  Timer, 
  Flame,
  AlertCircle,
  RefreshCw,
  Search,
  Settings,
  Bell
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell
} from 'recharts';

const API_BASE = '/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('workouts');
  const [workouts, setWorkouts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [logs, setLogs] = useState([]);
  const [bugInfo, setBugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Stats State
  const [statsData, setStatsData] = useState(null);
  const [groupData, setGroupData] = useState([]);
  const [average, setAverage] = useState(null);
  const [total, setTotal] = useState(null);

  const fetchData = async () => {
    try {
      const [wRes, sRes, lRes] = await Promise.all([
        fetch(`${API_BASE}/workouts`),
        fetch(`${API_BASE}/dashboard/summary`),
        fetch(`${API_BASE}/logs`)
      ]);
      const [wData, sData, lData] = await Promise.all([
        wRes.json(),
        sRes.json(),
        lRes.json()
      ]);
      setWorkouts(wData.data);
      setSummary(sData);
      setLogs(lData.data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTriggerBug = async (bugId) => {
    setLoading(true);
    setBugInfo(null);
    try {
      let res, data;
      if (bugId === 'site084-bug01') {
        res = await fetch(`${API_BASE}/stats/average?trigger=bug01`);
        data = await res.json();
        setAverage(data.averageCalories);
      } else if (bugId === 'site084-bug02') {
        res = await fetch(`${API_BASE}/stats/total?trigger=bug02`);
        data = await res.json();
        setTotal(data.totalCalories);
      } else if (bugId === 'site084-bug03') {
        res = await fetch(`${API_BASE}/stats?startDate=2026-05-04&endDate=2026-05-06&trigger=bug03`);
        data = await res.json();
        setStatsData(data.data);
      } else if (bugId === 'site084-bug04') {
        res = await fetch(`${API_BASE}/stats/group?trigger=bug04`);
        data = await res.json();
        setGroupData(data.groups);
      }

      const xBugId = res.headers.get('X-Bug-Id');
      if (xBugId) {
        const messages = {
          'site084-bug01': "[오류 #1] 평균 계산 오류: 전체 데이터가 아닌 고정된 상수(10)로 나누어 평균이 실제보다 낮게 산출되었습니다.",
          'site084-bug02': "[오류 #2] 누적 합계 불일치: 전체 칼로리 합계 계산 시 마지막 기록 데이터가 누락되어 정합성이 깨졌습니다.",
          'site084-bug03': "[오류 #3] 필터링 누락: 기간 필터(5/4~5/6)가 적용되지 않고 전체 기간의 데이터가 반환되었습니다.",
          'site084-bug04': "[오류 #4] 그룹화 기준 오류: 종목별 집계가 아닌 'Other'라는 단일 기준으로 모든 데이터가 잘못 병합되었습니다."
        };
        setBugInfo({ id: xBugId, message: messages[xBugId] });
      }
      fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkout, setNewWorkout] = useState({ type: 'Running', duration: 30, calories: 250 });

  const handleAddWorkout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch(`${API_BASE}/workouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWorkout)
      });
      setIsModalOpen(false);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleExportData = () => {
    const headers = "Date,Type,Duration,Calories\n";
    const rows = workouts.map(w => `${w.date},${w.type},${w.duration},${w.calories}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'workout_history.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    alert("운동 기록이 CSV 파일로 내보내졌습니다.");
  };

  const COLORS = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <Activity size={32} />
          <span>HealthCore</span>
        </div>
        <nav className="nav-links">
          <div className={`nav-link ${activeTab === 'workouts' ? 'active' : ''}`} onClick={() => setActiveTab('workouts')}>
            <TrendingUp size={20} /> Workouts
          </div>
          <div className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            <BarChart3 size={20} /> Statistics
          </div>
          <div className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <PieChart size={20} /> Analytics
          </div>
          <div className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>
            <History size={20} /> System Logs
          </div>
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>SERVER CONNECTED</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Endpoint: site084-node</div>
        </div>
      </aside>

      {/* Main View */}
      <main className="main-view">
        <header className="view-header">
          <div>
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Dashboard</h1>
            <p style={{ color: 'var(--text-muted)' }}>당신의 일일 건강 활동 및 통계 지표를 관리합니다.</p>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ position: 'relative' }}>
                <Search 
                  style={{ position: 'absolute', left: '12px', top: '10px', color: '#94a3b8' }} 
                  size={18} 
                />
                <input 
                  type="text" 
                  placeholder="검색어 입력..." 
                  onKeyDown={(e) => e.key === 'Enter' && alert("검색 기능은 준비 중입니다.")}
                  style={{ padding: '10px 10px 10px 40px', borderRadius: '12px', border: '1px solid var(--border)', width: '180px', outline: 'none' }} 
                />
              </div>
              <button className="btn btn-outline" onClick={() => alert("검색 기능은 준비 중입니다.")}>검색</button>
            </div>
            <Bell size={22} style={{ color: '#64748b', cursor: 'pointer' }} onClick={() => alert("현재 새로운 알림이 없습니다.")} />
            <Settings size={22} style={{ color: '#64748b', cursor: 'pointer' }} onClick={() => alert("설정 메뉴는 준비 중입니다.")} />
            <div 
              style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => alert("사용자: HealthCore 관리자")}
            >
              H
            </div>
          </div>
        </header>

        {/* Summary Row */}
        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <Activity size={24} />
            </div>
            <div className="summary-val">{summary?.totalWorkouts || 0}</div>
            <div className="summary-label">총 운동 횟수</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <Flame size={24} />
            </div>
            <div className="summary-val">{summary?.totalCalories?.toLocaleString() || 0}</div>
            <div className="summary-label">총 소모 칼로리 (kcal)</div>
          </div>
          <div className="summary-card">
            <div className="summary-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <Timer size={24} />
            </div>
            <div className="summary-val">{summary?.avgDuration?.toFixed(1) || 0}</div>
            <div className="summary-label">평균 운동 시간 (min)</div>
          </div>
        </div>

        {/* Workouts Tab */}
        {activeTab === 'workouts' && (
          <div className="widget-row" style={{ gridTemplateColumns: '1fr' }}>
            <div className="card">
              <div className="card-title">
                최근 운동 기록
                <button 
                  className="btn btn-primary" 
                  style={{ padding: '16px 32px', fontSize: '1.1rem', background: '#f97316' }} 
                  onClick={() => setIsModalOpen(true)}
                >
                  <Plus size={24} /> 신규 운동 기록 추가
                </button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Duration</th>
                    <th>Calories</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {workouts.map(w => (
                    <tr key={w.id}>
                      <td>{w.date}</td>
                      <td style={{ fontWeight: 600 }}>{w.type}</td>
                      <td>{w.duration} min</td>
                      <td>{w.calories} kcal</td>
                      <td><span className="badge-bug" style={{ background: '#dcfce7', color: '#166534' }}>Verified</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="widget-row">
            <div className="card">
              <div className="card-title">
                에너지 소모 트렌드
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-outline" onClick={handleExportData}>
                    <RefreshCw size={16} /> 데이터 내보내기
                  </button>
                  <button className="btn btn-outline" data-bug-id="site084-bug03" onClick={() => handleTriggerBug('site084-bug03')}>
                    <Filter size={16} /> 맞춤 기간 필터링
                  </button>
                </div>
              </div>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData || workouts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="calories" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-title">정밀 연산 지표</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '20px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>데이터 평균 (kcal)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>{average?.toFixed(2) || '0.00'}</div>
                  <button className="btn btn-primary" style={{ width: '100%' }} data-bug-id="site084-bug01" onClick={() => handleTriggerBug('site084-bug01')}>
                    <Calculator size={16} /> 운동 기록 평균 분석
                  </button>
                </div>
                <div style={{ padding: '20px', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '8px' }}>누적 소모량 (kcal)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '12px' }}>{total?.toLocaleString() || '0'}</div>
                  <button className="btn btn-secondary" style={{ width: '100%' }} data-bug-id="site084-bug02" onClick={() => handleTriggerBug('site084-bug02')}>
                    <TrendingUp size={16} /> 활동량 누적 집계
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="widget-row" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
            <div className="card">
              <div className="card-title">
                종목별 점유율
                <button className="btn btn-outline" data-bug-id="site084-bug04" onClick={() => handleTriggerBug('site084-bug04')}>
                  <Layers size={16} /> 종목별 리포트 생성
                </button>
              </div>
              <div style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={groupData.length > 0 ? groupData : [{ type: 'Running', total: 720 }, { type: 'Cycling', total: 400 }, { type: 'Other', total: 150 }]}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="type" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} width={80} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="total" radius={[0, 4, 4, 0]} barSize={24}>
                      {(groupData.length > 0 ? groupData : [{},{},{}]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card">
              <div className="card-title">주간 건강 효율성</div>
              <div style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={workouts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                    <Line type="monotone" dataKey="duration" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--primary)', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {activeTab === 'logs' && (
          <div className="card">
            <div className="card-title">
              시스템 분석 로그
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  fetchData();
                  alert("시스템 로그가 최신화되었습니다.");
                }}
              >
                <RefreshCw size={16} /> 로그 새로고침
              </button>
            </div>
            <div className="log-container">
              {logs.map(log => (
                <div key={log.id} className="log-line">
                  <span className="log-time">[{log.time}]</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{log.type}</span>
                  <span>{log.msg}</span>
                  {log.msg.includes("error") && <span className="log-bug">VULNERABILITY_ID: site084-bugXX</span>}
                </div>
              ))}
              {logs.length === 0 && <div style={{ color: '#475569', textAlign: 'center', marginTop: '100px' }}>No logs available. Trigger actions to see analysis.</div>}
            </div>
          </div>
        )}

        {/* Add Workout Modal */}
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="card" style={{ width: '400px' }}>
              <h2 style={{ marginBottom: '24px' }}>새 운동 기록</h2>
              <form onSubmit={handleAddWorkout}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px' }}>운동 종류</label>
                  <select 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}
                    value={newWorkout.type}
                    onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
                  >
                    <option>Running</option>
                    <option>Cycling</option>
                    <option>Swimming</option>
                    <option>Weightlifting</option>
                    <option>Yoga</option>
                  </select>
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px' }}>시간 (분)</label>
                  <input 
                    type="number" 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}
                    value={newWorkout.duration}
                    onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', marginBottom: '8px' }}>칼로리 (kcal)</label>
                  <input 
                    type="number" 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)' }}
                    value={newWorkout.calories}
                    onChange={(e) => setNewWorkout({ ...newWorkout, calories: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>취소</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>기록하기</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bug Notification Popup */}
        {bugInfo && (
          <div className="bug-alert">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
                <AlertCircle size={20} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>ANOMALY DETECTED</span>
              </div>
              <span className="bug-badge">{bugInfo.id}</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#334155', lineHeight: '1.6', fontWeight: 500 }}>
              {bugInfo.message}
            </p>
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => setBugInfo(null)}>확인 완료</button>
          </div>
        )}

        {loading && (
          <div style={{ position: 'fixed', top: '40px', left: '50%', transform: 'translateX(-50%)', background: '#fff', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1000 }}>
            <RefreshCw className="spin" size={18} color="var(--primary)" />
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>처리 중...</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
