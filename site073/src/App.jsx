import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  Activity, 
  Search, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  CheckCircle,
  BarChart3,
  Users
} from 'lucide-react';

const App = () => {
  const [view, setView] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [timeData, setTimeData] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bugId, setBugId] = useState(null);

  const fetchDashboard = async (triggerBug = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/summary${triggerBug ? '?triggerBug=' + triggerBug : ''}`);
      const data = await res.json();
      setSummary(data);
      if (data.bugId) setBugId(data.bugId);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      setCourses(data.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchProgress = async (triggerBug = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/progress${triggerBug ? '?triggerBug=' + triggerBug : ''}`);
      const data = await res.json();
      setProgressData(data.progress);
      if (data.bugId) setBugId(data.bugId);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchTime = async (triggerBug = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stats/time${triggerBug ? '?triggerBug=' + triggerBug : ''}`);
      const data = await res.json();
      setTimeData(data.totalTime);
      if (data.bugId) setBugId(data.bugId);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchRankings = async (triggerBug = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rankings${triggerBug ? '?triggerBug=' + triggerBug : ''}`);
      const data = await res.json();
      setRankings(data.data);
      if (data.bugId) setBugId(data.bugId);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchDailyGoal = async () => {
    try {
      const res = await fetch('/api/daily-goal');
      const data = await res.json();
      setDailyGoal(data);
    } catch (e) {}
  };

  useEffect(() => {
    if (view === 'dashboard') {
      fetchDashboard();
      fetchLogs();
      fetchDailyGoal();
    } else if (view === 'courses') {
      fetchCourses();
    } else if (view === 'progress') {
      fetchProgress();
      fetchTime();
    } else if (view === 'rankings') {
      fetchRankings();
    }
  }, [view]);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <BookOpen size={28} />
          <span>코스 트래커</span>
        </div>
        <nav>
          <div className={`nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={20} /> 대시보드
          </div>
          <div className={`nav-item ${view === 'courses' ? 'active' : ''}`} onClick={() => setView('courses')}>
            <BarChart3 size={20} /> 강의 목록
          </div>
          <div className={`nav-item ${view === 'progress' ? 'active' : ''}`} onClick={() => setView('progress')}>
            <Activity size={20} /> 학습 분석
          </div>
          <div className={`nav-item ${view === 'rankings' ? 'active' : ''}`} onClick={() => setView('rankings')}>
            <Trophy size={20} /> 랭킹 리스트
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1>{
            view === 'dashboard' ? '대시보드' : 
            view === 'courses' ? '강의 목록' : 
            view === 'progress' ? '학습 분석' : '랭킹 리스트'
          }</h1>
          <div className="user-profile">
            <div className="avatar">이주</div>
            <span>이주이 셰프님</span>
          </div>
        </header>

        {bugId && (
          <div className="alert-banner">
            <AlertTriangle size={20} />
            <div>
              <strong>PPO 탐지 알림:</strong> 백엔드 데이터에서 로직 이상이 발견되었습니다. (ID: {bugId})
            </div>
            <button style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => setBugId(null)}>×</button>
          </div>
        )}

        {loading && <div className="loading"><RefreshCw size={32} className="spin" /></div>}

        {view === 'dashboard' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>전체 코스 수</h4>
                <div className="value">{summary?.totalCourses || 0}개</div>
                <button className="btn-trigger" onClick={() => fetchDashboard('site073-bug04')} data-bug-id="site073-bug04">
                  <RefreshCw size={14} />
                </button>
              </div>
              <div className="stat-card">
                <h4>누적 학습 수</h4>
                <div className="value">{summary?.totalLearningCount || 0}회</div>
              </div>
              <div className="stat-card">
                <h4>활동 중인 학생</h4>
                <div className="value">1,482명</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
              <div className="log-panel" style={{ marginTop: 0 }}>
                <div style={{ marginBottom: '16px', fontWeight: 'bold', color: 'white' }}>최근 시스템 활동 로그</div>
                {logs.map(log => (
                  <div key={log.id} className="log-entry">
                    <span className="log-time">[{new Date(log.time).toLocaleTimeString()}]</span>
                    {log.msg}
                  </div>
                ))}
              </div>

              <div className="stat-card">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={18} color="var(--secondary)" /> 오늘의 학습 목표</h4>
                <div style={{ marginTop: '16px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>{dailyGoal?.goal}</div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>완료 시 <span style={{ color: 'var(--secondary)', fontWeight: '700' }}>{dailyGoal?.points} XP</span> 획득</div>
                  <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>목표 달성 인증</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'courses' && (
          <div className="course-grid">
            {courses.map(course => (
              <div key={course.id} className="course-card">
                <div className="course-tag">{course.category}</div>
                <h3 className="course-title">{course.title}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>강사: {course.instructor}</div>
                <div className="progress-container">
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                    <span>진도율</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === 'progress' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>전체 평균 진도율</h4>
                <div className="value">{progressData}%</div>
                <button className="btn-trigger" onClick={() => fetchProgress('site073-bug01')} data-bug-id="site073-bug01">
                  <RefreshCw size={14} />
                </button>
                {progressData > 100 && <div style={{ color: 'red', fontSize: '0.75rem' }}>* 계산 오류 탐지됨</div>}
              </div>
              <div className="stat-card">
                <h4>총 학습 시간</h4>
                <div className="value">{timeData}분</div>
                <button className="btn-trigger" onClick={() => fetchTime('site073-bug02')} data-bug-id="site073-bug02">
                  <RefreshCw size={14} />
                </button>
              </div>
            </div>
            
            <div className="stat-card" style={{ marginTop: '24px' }}>
              <h4>학습 효율성 지표</h4>
              <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '20px 0' }}>
                 {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                   <div key={i} style={{ flex: 1, height: h + '%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                 ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                <span>월</span><span>화</span><span>수</span><span>목</span><span>금</span><span>토</span><span>일</span>
              </div>
            </div>
          </div>
        )}

        {view === 'rankings' && (
          <div>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-primary" onClick={() => fetchRankings('site073-bug03')} data-bug-id="site073-bug03">
                <RefreshCw size={16} /> 랭킹 정렬 안정성 테스트
              </button>
            </div>
            <div className="rank-list">
              {rankings.map((user, idx) => (
                <div key={user.id} className="rank-item">
                  <div className="rank-num">#{idx + 1}</div>
                  <div className="rank-name">{user.name}</div>
                  <div className="rank-score">{user.score} XP</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .spin { animation: rotate 2s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default App;
