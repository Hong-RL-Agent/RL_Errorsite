import React, { useState, useEffect } from 'react';
import { 
  Zap, Database, BarChart3, Clock, RefreshCw, 
  ShieldCheck, AlertCircle, PlayCircle, StopCircle, 
  Activity, Layers, Monitor, Server
} from 'lucide-react';

const API_BASE = '/api';

const App = () => {
  const [poll, setPoll] = useState({ question: '', yes: 0, no: 0, active: true });
  const [logs, setLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [bugInfo, setBugInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchData = async (bugIdToTrigger = null) => {
    try {
      const url = bugIdToTrigger ? `${API_BASE}/result?triggerBug=${bugIdToTrigger}` : `${API_BASE}/result`;
      const res = await fetch(url);
      const data = await res.json();
      const lRes = await fetch(`${API_BASE}/logs`);
      const lData = await lRes.json();

      setPoll(prev => ({ ...prev, yes: data.yes, no: data.no }));
      setLogs(lData.data || []);

      const bugId = res.headers.get('X-Bug-Id') || data.bugId;
      if (bugId === 'site001-bug02') {
        setBugInfo({
          id: "site001-bug02",
          title: "버그 2: 이벤트 순서 오류",
          message: "집계 엔진이 이벤트를 비순차적으로 처리하여 결과 데이터가 왜곡되었습니다. (Event Out-of-Order Handling)"
        });
      }
    } catch (e) { console.error(e); }
  };

  const handleAction = async (type, bugIdToTrigger = null) => {
    setLoading(true);
    try {
      if (type === 'vote') {
        const res = await fetch(`${API_BASE}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ choice: 'yes', triggerBug: bugIdToTrigger })
        });
        const data = await res.json();
        const bugId = res.headers.get('X-Bug-Id') || data.bugId;

        if (bugId === 'site001-bug01') {
          setBugInfo({
            id: "site001-bug01",
            title: "버그 1: 이벤트 중복 처리",
            message: "동일한 투표 이벤트가 중복으로 반영되어 결과값이 과다 집계되었습니다. (Duplicate Event Processing)"
          });
        } else if (bugId === 'site001-bug03') {
          setBugInfo({
            id: "site001-bug03",
            title: "버그 3: 이벤트 유실",
            message: "투표 데이터가 서버로 전송되는 과정에서 누락되어 집계에 반영되지 않았습니다. (Event Loss)"
          });
        } else if (bugId === 'site001-bug04') {
          setBugInfo({
            id: "site001-bug04",
            title: "버그 4: 지연 이벤트 반영 오류",
            message: "투표 세션이 종료된 후에 도착한 지연 이벤트가 필터링되지 않고 결과에 포함되었습니다. (Delayed Event Misapplied)"
          });
        }
      }
      fetchData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analytics`);
      const data = await res.json();
      setAnalytics(data);
      setShowAnalytics(true);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const endPoll = async () => {
    await fetch(`${API_BASE}/poll/end`, { method: 'POST' });
    setPoll(prev => ({ ...prev, active: false }));
    fetchData();
  };

  const resetPoll = async () => {
    await fetch(`${API_BASE}/poll`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: "차기 라이브 스트리밍 주제 선정" })
    });
    setPoll(prev => ({ ...prev, active: true }));
    fetchData();
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 5000);
    return () => clearInterval(interval);
  }, []);

  const total = poll.yes + poll.no;
  const yesPct = total > 0 ? (poll.yes / total) * 100 : 50;

  return (
    <div className="app-wrapper animate-fade">
      <header className="live-header">
        <div className="logo-section">
          <Layers size={28} color="#ff007a" className="animate-pulse" />
          <h1 style={{ fontFamily: 'Orbitron', fontSize: '24px' }}>VOTE_ENGINE_PRO</h1>
        </div>
        <div className="header-controls">
          <button className="btn-vote" style={{ width: 'auto', background: 'rgba(255,255,255,0.05)', fontSize: '12px' }} onClick={resetPoll}>
            <RefreshCw size={14} /> 시스템 초기화
          </button>
          <button className="btn-vote" style={{ width: 'auto', background: '#00d4ff', fontSize: '12px', color: 'black' }} onClick={fetchAnalytics}>
            <BarChart3 size={14} /> 분석 리포트
          </button>
        </div>
      </header>

      <div className="poll-card glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
          <div className="live-badge">REAL-TIME MONITORING</div>
          <div style={{ color: '#888', fontSize: '12px' }}>STATUS: {poll.active ? 'ACTIVE' : 'CLOSED'}</div>
        </div>
        
        <h2 className="question-text">"차세대 스트리밍 엔진 도입 찬반 투표"</h2>

        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">긍정 (YES)</div>
            <div className="stat-value" style={{ color: '#ff007a' }}>{poll.yes}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">부정 (NO)</div>
            <div className="stat-value" style={{ color: '#00d4ff' }}>{poll.no}</div>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-bar progress-yes" style={{ width: `${yesPct}%` }}></div>
          <div className="progress-bar progress-no" style={{ width: `${100 - yesPct}%` }}></div>
        </div>

        <div className="vote-controls">
          <button className="btn-vote btn-yes" onClick={() => handleAction('vote', 'bug01')} data-bug-id="site001-bug01">
            <Zap size={18} /> 고속 투표 전송
          </button>
          <button className="btn-vote btn-no" onClick={() => handleAction('vote', 'bug03')} data-bug-id="site001-bug03">
            <Server size={18} /> 보조 서버 연동
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginTop: '20px' }}>
          <button className="btn-vote" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '13px' }} onClick={() => fetchData('bug02')} data-bug-id="site001-bug02">
            <RefreshCw size={16} /> 데이터 동기화
          </button>
          <button className="btn-vote" style={{ background: 'rgba(255,255,255,0.05)', fontSize: '13px' }} onClick={() => handleAction('vote', 'bug04')} data-bug-id="site001-bug04">
            <Clock size={16} /> 투표 결과 확정
          </button>
          <button className="btn-vote" style={{ background: '#ff007a', fontSize: '13px', color: 'white', border: 'none' }} onClick={endPoll}>
            <StopCircle size={16} /> 세션 종료
          </button>
        </div>
      </div>

      <div className="log-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: '#00d4ff' }}>
          <Activity size={18} />
          <span style={{ fontWeight: 800, fontSize: '14px' }}>EVENT_AUDIT_LOG_STREAM</span>
        </div>
        <div className="log-container">
          {logs.map(log => (
            <div key={log.id} className="log-entry">
              <span className="log-time">[{new Date(log.time).toLocaleTimeString()}]</span>
              <span className={`log-type ${log.type}`}>[{log.type}]</span>
              <span className="log-msg">{log.msg}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics Modal */}
      {showAnalytics && analytics && (
        <div className="modal-overlay" onClick={() => setShowAnalytics(false)}>
          <div className="modal glass animate-fade" onClick={e => e.stopPropagation()}>
            <div className="bug-id-tag" style={{ background: '#00d4ff', color: 'black' }}>NORMAL_FEATURE</div>
            <h3 className="modal-title" style={{ color: '#00d4ff' }}>투표 분석 리포트</h3>
            <div className="analytics-data">
              <div className="data-row"><span>총 참여 건수</span> <span>{analytics.total}</span></div>
              <div className="data-row"><span>긍정 비율</span> <span>{analytics.ratio}%</span></div>
              <div className="data-row"><span>세션 시작</span> <span>{new Date(analytics.startTime).toLocaleTimeString()}</span></div>
              <div className="data-row"><span>최고 트래픽</span> <span>{analytics.peakTime}</span></div>
            </div>
            <button className="btn-close" onClick={() => setShowAnalytics(false)}>닫기</button>
          </div>
        </div>
      )}

      {/* Bug Modal */}
      {bugInfo && (
        <div className="modal-overlay" onClick={() => setBugInfo(null)}>
          <div className="modal glass animate-fade" onClick={e => e.stopPropagation()}>
            <div className="bug-id-tag" style={{ background: '#ff007a' }}>{bugInfo.id}</div>
            <h3 className="modal-title" style={{ color: '#ff007a' }}>{bugInfo.title}</h3>
            <p className="modal-desc">{bugInfo.message}</p>
            <button className="btn-close" style={{ background: '#ff007a', color: 'white' }} onClick={() => setBugInfo(null)}>확인</button>
          </div>
        </div>
      )}

      {loading && <div className="modal-overlay"><RefreshCw className="animate-spin" size={48} color="#ff007a" /></div>}
    </div>
  );
};

export default App;
